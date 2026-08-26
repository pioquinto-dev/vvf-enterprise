import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';

import { savedSearch as savedSearchApi } from '../../../landing/flow/api.js';
import { billing as billingApi } from '../../../landing/flow/api.js';
import { trackVideoAnalysis, videoAnalysis } from '../../../landing/flow/api.js';
import AnalysisModal from '../../VideoAnalysis/AnalysisModal.jsx';
import UpgradePromptModal from '../../components/UpgradePromptModal.jsx';
import { playerUrlFor, postTikTokMessage } from './tiktokPlayer.js';

/**
 * Search analytics tracker — the redesigned results page.
 *
 * Layout follows brandbeaconanalyticsredesign.html:
 *   Back bar · Header (with inline handle editor + kebab) · AI Insights bullets ·
 *   Stat strip (4 tiles) · Winner outlier with auto-analysis · More outliers
 *   grid with toggle-open per-card analysis · Analytics card with metric tabs +
 *   blurred history until the next refresh · When-they-post heatmap with a
 *   best-time insight bar · Outliers-per-week + Score distribution ·
 *   Hashtags & sounds scroll panels (each row is a link to TikTok).
 *
 * The heavy analytical text (insights, per-video why/replicate, best-time)
 * comes from a single batched OpenAI call at run completion — see
 * SearchEnrichmentService on the backend. Nothing on this page fires a call
 * per section.
 */

/* ---------------------------- helpers ---------------------------- */

const PAGE_STEP = 4;
const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS_LABELS = { 0: '12a', 6: '6a', 12: '12p', 18: '6p' };

const STATUS_LABEL = {
  done: 'Ready',
  complete: 'Ready',
  scraping: 'Refreshing',
  running: 'Refreshing',
  queued: 'Refreshing',
  pending: 'Refreshing',
  paused: 'Paused',
  failed: 'Failed',
};

function compact(n) {
  if (n == null || Number.isNaN(n)) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`;
  return String(Math.round(n));
}

function formatDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function chartGeometry(values) {
  const points = values.map((value) => Number(value) || 0);
  if (points.length === 0) return null;

  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min;
  const width = 100;
  const height = 40;
  const leftPad = 8;
  const rightPad = 4;
  const topPad = 4;
  const bottomPad = 4;
  const coordinates = points.map((value, index) => ({
    x: points.length === 1 ? 50 : leftPad + ((width - leftPad - rightPad) * index) / (points.length - 1),
    y: span === 0 ? height / 2 : (height - bottomPad) - ((value - min) / span) * (height - topPad - bottomPad),
  }));
  const last = coordinates[coordinates.length - 1];

  return {
    min,
    max,
    points: coordinates.map(({ x, y }) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' '),
    last,
  };
}

function metricAxisLabel(metric) {
  if (metric === 'outliers') return 'Outliers';
  if (metric === 'posts') return 'Posts';
  if (metric === 'eng') return 'Engagement';
  if (metric === 'engrate') return 'Engagement rate';
  return 'Views';
}

function formatMetricTick(value, metric) {
  if (metric === 'outliers') return `${Math.round(Number(value || 0))}`;
  if (metric === 'engrate') return `${Number(value || 0).toFixed(1)}%`;
  if (metric === 'posts') return `${Math.round(Number(value || 0))}`;
  return compact(Number(value || 0));
}

function buildYAxisTicks(values, metric) {
  const numbers = values
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));

  if (numbers.length === 0) {
    return [{ value: 0, label: formatMetricTick(0, metric), offset: 100 }];
  }

  const max = Math.max(...numbers, 0);
  const min = Math.min(...numbers, 0);

  if (max === min) {
    return [
      { value: max, label: formatMetricTick(max, metric), offset: 0 },
      { value: 0, label: formatMetricTick(0, metric), offset: 100 },
    ];
  }

  return Array.from({ length: 4 }, (_, index) => {
    const ratio = index / 3;
    const value = max - ((max - min) * ratio);

    return {
      value,
      label: formatMetricTick(value, metric),
      offset: ratio * 100,
    };
  });
}

function buildXAxisLabels(points = []) {
  if (points.length === 0) return [];
  if (points.length === 1) return [{ label: points[0].label, align: 'start' }];

  const labels = [{ label: points[0].label, align: 'start' }];
  const middleIndex = Math.floor((points.length - 1) / 2);

  if (middleIndex > 0 && middleIndex < points.length - 1) {
    labels.push({ label: points[middleIndex].label, align: 'center' });
  }

  labels.push({ label: points[points.length - 1].label, align: 'end' });

  return labels;
}

function weekKeyFromIso(iso) {
  if (!iso) return null;

  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) return null;

  const utc = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = utc.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  utc.setUTCDate(utc.getUTCDate() + diff);

  return utc.toISOString().slice(0, 10);
}

function formatMetricValue(value, metric) {
  if (metric === 'outliers') return `${Math.round(Number(value || 0))} outliers`;
  if (metric === 'engrate') return `${Number(value || 0).toFixed(1)}%`;
  if (metric === 'posts') return `${Math.round(Number(value || 0))} posts`;
  if (metric === 'eng') return `${compact(Number(value || 0))} engagements`;

  return `${compact(Number(value || 0))} views`;
}

function metricExplanation(metric) {
  if (metric === 'eng') {
    return 'Shows how much interaction those videos pulled that week, using likes, comments, shares, and saves together.';
  }

  if (metric === 'outliers') {
    return 'Shows how many videos from that week truly broke out, not just how many were posted.';
  }

  return 'Shows the total views pulled by the videos uploaded in that week.';
}

function heatmapBestTime(heatmap) {
  const peak = heatmap?.peak;
  const hour = Number(peak?.hour);
  const count = Number(peak?.count) || 0;
  if (!peak?.day || !Number.isInteger(hour) || count < 1) return null;

  const hourLabel = hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour < 12 ? `${hour} AM` : `${hour - 12} PM`;

  return {
    sentence: `Busiest posting window: **${peak.day} around ${hourLabel} UTC** (${count} matched ${count === 1 ? 'post' : 'posts'}).`,
  };
}

function formatHeatmapHour(hour) {
  if (hour === 0) return '12:00 AM';
  if (hour === 12) return '12:00 PM';
  return hour < 12 ? `${hour}:00 AM` : `${hour - 12}:00 PM`;
}

function analysisCtaLabel(analysis) {
  if (analysis?.status === 'processing') return 'Analyzing video...';
  if (analysis?.status === 'complete') return 'View analysis';
  if (analysis?.status === 'failed') return 'Retry analysis';
  return 'Analyze video';
}

function canUsePaidVideoAnalysis(billing) {
  if (!billing) return false;

  const limit = Number(billing.videoAnalysisLimit ?? 0);

  return Boolean(billing.hasPaidPlan) && limit !== 0;
}

function canUseSearchBookmarks(billing) {
  if (!billing) return false;

  const limit = Number(billing.searchBookmarkLimit ?? billing.bookmarkLimit ?? 0);
  const used = Number(billing.searchBookmarkCount ?? billing.bookmarksUsed ?? billing.bookmarkCount ?? 0);

  if (limit === -1) return true;

  return Boolean(billing.hasPaidPlan) && limit !== 0 && used < limit;
}

function canManageSearch(billing) {
  if (!billing) return false;

  return Boolean(billing.hasPaidPlan);
}

function videoAnalysisRemaining(billing, startedThisSession = 0) {
  if (!billing) return 0;

  const limit = Number(billing.videoAnalysisLimit ?? 0);
  const used = Number(billing.videoAnalysisUsed ?? 0) + Number(startedThisSession || 0);

  if (limit === -1) return -1;

  return Math.max(0, limit - used);
}

/** Render **bold** markers as <b>…</b> without allowing raw HTML. */
function renderBold(text) {
  const parts = String(text ?? '').split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <b key={i}>{part.slice(2, -2)}</b>;
    }
    return <span key={i}>{part}</span>;
  });
}

function initials(name, fallback = '?') {
  const source = (name || fallback).trim();
  return source.slice(0, 2).toUpperCase() || '?';
}

/* Deterministic gradient so a video's thumbnail placeholder is stable. */
function gradientFor(id) {
  const palettes = [
    'linear-gradient(150deg,#ffd6a6,#ff9a8f 55%,#c07a9a)',
    'linear-gradient(150deg,#d8c0ff,#a88fff 55%,#7a9ac0)',
    'linear-gradient(150deg,#c8f0d8,#7ad0a0 55%,#5aa0c0)',
    'linear-gradient(150deg,#a6d8ff,#7aa8ff 55%,#8f7aff)',
    'linear-gradient(150deg,#ffe0a6,#ffbf8f 55%,#c0907a)',
    'linear-gradient(150deg,#ffc0d8,#ff8fb0 55%,#c07a9a)',
    'linear-gradient(150deg,#e0d0ff,#b0a0ff 55%,#8f7aff)',
    'linear-gradient(150deg,#ffd27a,#ff9a5a 60%,#c0607a)',
  ];
  let h = 0;
  const s = String(id || '');
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) | 0;
  return palettes[Math.abs(h) % palettes.length];
}

/* ------------------------- inline SVG icons ------------------------- */

const Icons = {
  Back:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>,
  Bookmark:  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 3h12v18l-6-4.5L6 21z" /></svg>,
  BookmarkO: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><path d="M6 3h12v18l-6-4.5L6 21z" /></svg>,
  Kebab:     <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" /></svg>,
  Edit:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></svg>,
  Refresh:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-2.6-6.4" /><path d="M21 3v6h-6" /></svg>,
  Pause:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>,
  Trash:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></svg>,
  Play:      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>,
  Spark:     <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z" /></svg>,
  Eye:       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>,
  Heart:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><path d="M12 20s-7-4.5-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 4.5-7 9-7 9z" /></svg>,
  Comment:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H8l-5 4V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
  Share:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" /><path d="m16 6-4-4-4 4" /><path d="M12 2v14" /></svg>,
  ExtLink:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7M8 7h9v9" /></svg>,
  UpTrend:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l6-6 4 4 8-8" /><path d="M21 3h-5m5 0v5" /></svg>,
  ChevDown:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>,
  Music:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>,
  Plus:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>,
};

/* ============================ COMPONENT ============================ */

export default function DetailScreen({
  search,
  isAuthenticated = false,
  billing,
  refreshing = false,
  bookmarkUpdating = false,
  onRefresh,
  onSearchUpdated,
  onToggleBookmark,
  onToggleVideoBookmark,
  bookmarkingVideoId = null,
  onTogglePause,
  onDelete,
}) {
  const { url: currentUrl } = usePage();
  const insights = search?.insights ?? {};
  const bullets = search?.insights_bullets ?? [];

  const [handleEditing, setHandleEditing] = useState(false);
  const [handleDraft, setHandleDraft] = useState(search?.source_tiktok_handle ?? '');
  const [savingHandle, setSavingHandle] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [expandedCardId, setExpandedCardId] = useState(null);
  const [analysisModal, setAnalysisModal] = useState(null);
  const [confirmAnalysisVideo, setConfirmAnalysisVideo] = useState(null);
  const [upgradeModalType, setUpgradeModalType] = useState(null);
  const [visible, setVisible] = useState(PAGE_STEP);
  const [sortKey, setSortKey] = useState('outlier');
  // Which run bucket the "More outliers" grid is filtered to. `all` keeps
  // every card visible and colored by its own run; the other three narrow to
  // one bucket. Defaults to `all` so first-time visitors see the full grid.
  const [runFilter, setRunFilter] = useState('all');
  const [metric, setMetric] = useState('views');
  const [videoPlayingId, setVideoPlayingId] = useState(null);
  const [heatmapTooltip, setHeatmapTooltip] = useState(null);
  const [chartTooltip, setChartTooltip] = useState(null);
  const [selectedWeekKey, setSelectedWeekKey] = useState(null);
  const [analysisByVideoId, setAnalysisByVideoId] = useState({});
  const [analysisStarting, setAnalysisStarting] = useState(false);
  const [reservedAnalysisVideoIds, setReservedAnalysisVideoIds] = useState([]);
  const [analysisNotice, setAnalysisNotice] = useState(null);
  const [mobileCards, setMobileCards] = useState(false);
  const [insightsCollapsed, setInsightsCollapsed] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const menuTopRef = useRef(null);
  const menuHeaderRef = useRef(null);
  const autoOpenedAnalysisRef = useRef(false);
  const canAnalyzeMoreOutliers = canUsePaidVideoAnalysis(billing);
  const canBookmarkSearch = canUseSearchBookmarks(billing);
  const canManageCurrentSearch = canManageSearch(billing);
  const analysisRemainingNow = videoAnalysisRemaining(billing, reservedAnalysisVideoIds.length);
  const analysisRemainingAfterUse = analysisRemainingNow === -1 ? 'unlimited' : Math.max(0, analysisRemainingNow - 1);

  // The modal polls independently. Keep those live results here so the card
  // that launched it immediately changes from "Analyzing" to "View analysis".
  const results = useMemo(() => (search?.results ?? []).map((video) => ({
    ...video,
    analysis: analysisByVideoId[video.id] ?? video.analysis ?? null,
  })), [search?.results, analysisByVideoId]);

  const menuClose = () => setMenuOpen(false);
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onDocClick = (e) => {
      const inTopMenu = menuTopRef.current?.contains(e.target);
      const inHeaderMenu = menuHeaderRef.current?.contains(e.target);

      if (!inTopMenu && !inHeaderMenu) menuClose();
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [menuOpen]);

  /* ------------- winner + rest ------------- */
  const winner = results[0];
  const rest = results.slice(1);

  /* ------------- run bucketing -------------
   * The presenter returns `runs` ordered by completed_at ascending, so the
   * newest completed run is the last entry. Every card carries the id of
   * the run that last surfaced it (`search_run_id`); we compare against
   * the latest and previous ids to bucket cards as new / previous / older.
   *
   * On a first-only run there is no "previous" to promote anything against,
   * so `previousRunId` is null. In that case (and whenever we simply can't
   * tell — the runs feed is empty, or the pivot row's `search_run_id` is
   * null on a legacy row that predates the column) we bucket everything as
   * `new`: the whole result set was surfaced in the same run and nothing
   * has been superseded yet. As soon as a second run completes and starts
   * carrying videos over, the comparison below takes over on its own.
   */
  const runList = search?.runs ?? [];
  const latestRunId = runList.length > 0 ? runList[runList.length - 1]?.id ?? null : null;
  const previousRunId = runList.length > 1 ? runList[runList.length - 2]?.id ?? null : null;
  const bucketForVideo = (video) => {
    if (previousRunId == null) return 'new';
    const rid = video?.search_run_id;
    if (rid == null) return 'new';
    if (rid === latestRunId) return 'new';
    if (rid === previousRunId) return 'prev';
    return 'old';
  };
  const runCounts = useMemo(() => rest.reduce((acc, v) => {
    acc[bucketForVideo(v)] += 1;
    return acc;
  }, { new: 0, prev: 0, old: 0 }), [rest, latestRunId, previousRunId]);
  const runLabels = {
    latest: runList.length > 0
      ? formatDate(runList[runList.length - 1]?.completed_at) || 'latest run'
      : 'latest run',
    previous: runList.length > 1
      ? formatDate(runList[runList.length - 2]?.completed_at) || 'previous run'
      : 'previous run',
  };

  const sortedRest = useMemo(() => {
    const arr = runFilter === 'all'
      ? [...rest]
      : rest.filter((v) => bucketForVideo(v) === runFilter);
    arr.sort((a, b) => {
      if (sortKey === 'views') return (b.views ?? 0) - (a.views ?? 0);
      if (sortKey === 'date') {
        const at = a.posted_at ? new Date(a.posted_at).getTime() : 0;
        const bt = b.posted_at ? new Date(b.posted_at).getTime() : 0;
        return bt - at;
      }
      return (b.multiple ?? b.score ?? 0) - (a.multiple ?? a.score ?? 0);
    });
    return arr;
  }, [rest, sortKey, runFilter, latestRunId, previousRunId]);

  /* ------------- stats ------------- */
  const tileByKey = (k) => (insights.tiles ?? []).find((t) => t.key === k) ?? {};
  const outlierCount = tileByKey('outliers').value ?? results.filter((r) => (r.multiple ?? 0) >= 3).length;
  const videosInRun = search?.scanned_count ?? results.length;
  const topMultiple = tileByKey('top_multiple').value ?? (winner?.multiple ?? winner?.score ?? 0);
  const avgEng = tileByKey('avg_engagement').value ?? null;
  const medianViews = insights?.baseline?.median_views ?? null;

  /* ------------- handle save ------------- */
  const saveHandle = async () => {
    const clean = handleDraft.trim().replace(/^@/, '');
    setSavingHandle(true);
    try {
      const payload = await savedSearchApi.update(search.id, {
        sources: {
          tiktokHandle: clean,
          website: search?.source_website ?? '',
        },
      });
      onSearchUpdated?.(payload?.search ?? { source_tiktok_handle: clean });
      setHandleEditing(false);
    } finally {
      setSavingHandle(false);
    }
  };

  /* ------------- metric tabs ------------- */
  const trend = insights?.trend ?? {};
  const weeklyPoints = trend?.points ?? [];
  const metricKeys = { views: 'views', eng: 'engagement', outliers: 'outliers' };
  const metricSeriesMap = {
    views: trend?.metrics?.views ?? null,
    eng: trend?.metrics?.engagement ?? null,
    outliers: weeklyPoints.length > 0 ? {
      label: 'outliers',
      format: 'count',
      values: weeklyPoints.map((point) => Number(point?.outliers ?? 0)),
      current: Number(weeklyPoints[weeklyPoints.length - 1]?.outliers ?? 0),
      delta: weeklyPoints.length >= 2
        ? {
            value: Number(weeklyPoints[weeklyPoints.length - 1]?.outliers ?? 0) - Number(weeklyPoints[0]?.outliers ?? 0),
            unit: 'absolute',
            direction: Number(weeklyPoints[weeklyPoints.length - 1]?.outliers ?? 0) > Number(weeklyPoints[0]?.outliers ?? 0) ? 'up' : (Number(weeklyPoints[weeklyPoints.length - 1]?.outliers ?? 0) < Number(weeklyPoints[0]?.outliers ?? 0) ? 'down' : 'flat'),
          }
        : null,
    } : null,
  };
  const activeSeries = metricSeriesMap[metricKeys[metric] ? metric : 'views'] ?? metricSeriesMap.views;
  const chartValues = activeSeries?.values ?? [];
  const chart = chartGeometry(chartValues);
  const completedRunCount = search?.runs?.length ?? 0;
  const showTrendMetric = activeSeries !== null;
  const xAxisLabels = buildXAxisLabels(weeklyPoints);
  const yAxisTicks = buildYAxisTicks(chartValues, metric);
  const chartPoints = chart?.points
    ? chart.points.split(' ').map((pair) => pair.split(',').map(Number))
    : [];
  const videosByWeek = useMemo(() => {
    const grouped = {};

    results.forEach((video) => {
      const weekKey = weekKeyFromIso(video.uploaded_at);

      if (!weekKey) return;

      if (!grouped[weekKey]) grouped[weekKey] = [];
      grouped[weekKey].push(video);
    });

    Object.values(grouped).forEach((videos) => {
      videos.sort((left, right) => (Number(right.views) || 0) - (Number(left.views) || 0));
    });

    return grouped;
  }, [results]);
  const selectedWeekVideos = selectedWeekKey ? (videosByWeek[selectedWeekKey] ?? []) : [];
  const comparisonDelta = activeSeries?.delta ?? null;
  const comparisonLabel = comparisonDelta
    ? `${comparisonDelta.direction === 'up' ? '↑' : comparisonDelta.direction === 'down' ? '↓' : '→'} ${Math.abs(Number(comparisonDelta.value ?? 0))}${comparisonDelta.unit === 'points' ? ' pts' : comparisonDelta.unit === 'absolute' ? '' : '%'} vs ${weeklyPoints.length || 0} wk ago`
    : null;
  const metricConfig = {
    views:    { value: showTrendMetric ? compact(activeSeries?.current) : compact(medianViews), label: '' },
    eng:      { value: showTrendMetric ? compact(activeSeries?.current) : '—', label: '' },
    outliers: { value: showTrendMetric ? Number(activeSeries?.current ?? 0).toLocaleString() : outlierCount.toLocaleString(), label: '' },
  };

  /* ------------- posting heatmap ------------- */
  const heatCells = insights?.heatmap?.cells ?? [];
  const heatMax = Math.max(1, Number(insights?.heatmap?.max) || 0);
  const bestPostTime = search?.best_post_time ?? heatmapBestTime(insights?.heatmap);

  /* ------------- outliers per week + distribution ------------- */
  const distribution = insights?.distribution ?? [];
  const distMax = Math.max(1, ...distribution.map((d) => d.count ?? 0));
  const weeklyBars = trend?.outliers_per_week ?? [];
  const weeklyMax = Math.max(1, ...weeklyBars.map((b) => b.count ?? b.value ?? 0));

  /* ------------- hashtags + sounds ------------- */
  const hashtags = insights?.hashtags ?? [];
  const sounds = insights?.sounds ?? [];
  const hashMax = Math.max(1, ...hashtags.map((h) => h.count ?? 0));
  const soundMax = Math.max(1, ...sounds.map((s) => s.count ?? 0));

  /* ------------- open analysis modal (existing flow) ------------- */
  const openAnalysis = (video) => setAnalysisModal({ video, analysis: video.analysis ?? null });
  const closeAnalysis = () => setAnalysisModal(null);
  const closeConfirmAnalysis = () => {
    if (analysisStarting) return;
    setConfirmAnalysisVideo(null);
  };
  const openUpgradeModal = (type = 'analysis') => setUpgradeModalType(type);
  const closeUpgradeModal = () => setUpgradeModalType(null);
  const openUpgradeForAnalysis = () => billingApi.checkout('basic');
  const videoLabel = (videoId) => {
    const video = results.find((entry) => String(entry.id) === String(videoId));
    return video?.handle || video?.username || video?.title || 'This video';
  };
  const updateVideoAnalysis = (videoId, analysis) => {
    if (!videoId || !analysis) return;

    if (analysis.status === 'failed') {
      setReservedAnalysisVideoIds((current) => current.filter((id) => String(id) !== String(videoId)));
    }

    setAnalysisByVideoId((current) => {
      const previous = current[videoId] ?? results.find((entry) => String(entry.id) === String(videoId))?.analysis ?? null;

      if (previous?.updated_at === analysis.updated_at && previous?.status === analysis.status) {
        return current;
      }

      if (previous?.status === 'processing' && analysis.status === 'complete') {
        setAnalysisNotice({
          tone: 'success',
          message: `${videoLabel(videoId)} analysis is ready.`,
        });
      }

      if (previous?.status === 'processing' && analysis.status === 'failed') {
        setAnalysisNotice({
          tone: 'error',
          message: `${videoLabel(videoId)} analysis could not be completed.`,
        });
      }

      return { ...current, [videoId]: analysis };
    });
  };

  useEffect(() => {
    if (!analysisNotice) return undefined;

    const timer = window.setTimeout(() => setAnalysisNotice(null), 5000);

    return () => window.clearTimeout(timer);
  }, [analysisNotice]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined;

    const media = window.matchMedia('(max-width: 560px)');
    const sync = () => {
      const nextMobile = media.matches;
      setMobileCards(nextMobile);
      setInsightsCollapsed(nextMobile);
    };

    sync();

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', sync);

      return () => media.removeEventListener('change', sync);
    }

    media.addListener(sync);

    return () => media.removeListener(sync);
  }, []);

  useEffect(() => {
    if (autoOpenedAnalysisRef.current) return;

    const query = currentUrl.split('?')[1] ?? '';
    const params = new URLSearchParams(query);
    const targetVideoId = params.get('analysisVideo');
    const shouldOpen = params.get('openAnalysis') === '1';

    if (!shouldOpen || !targetVideoId) return;

    const targetVideo = results.find((video) => String(video.id) === String(targetVideoId));

    if (!targetVideo) return;

    autoOpenedAnalysisRef.current = true;
    openAnalysis(targetVideo);

    if (typeof window !== 'undefined') {
      const next = new URL(window.location.href);
      next.searchParams.delete('analysisVideo');
      next.searchParams.delete('openAnalysis');
      window.history.replaceState({}, '', `${next.pathname}${next.search}${next.hash}`);
    }
  }, [currentUrl, results]);

  const launchManualAnalysis = async (video) => {
    setAnalysisStarting(true);
    setConfirmAnalysisVideo(null);

    try {
      const payload = await videoAnalysis.request(video.id);
      const nextAnalysis = payload?.analysis ?? null;

      if (nextAnalysis) {
        updateVideoAnalysis(video.id, nextAnalysis);
      }

      setReservedAnalysisVideoIds((current) => (
        current.some((id) => String(id) === String(video.id)) ? current : [...current, video.id]
      ));
      trackVideoAnalysis({
        videoId: video.id,
        searchUrl: search?.url,
        searchName: search?.name || search?.phrase,
        videoLabel: video.handle || video.username || video.title || video.caption || 'Outlier video',
      });
    } catch (error) {
      setConfirmAnalysisVideo(video);
      window.alert(error?.message || 'Could not start this analysis.');
    } finally {
      setAnalysisStarting(false);
    }
  };

  const handleAnalyzeAction = (video) => {
    if (!canAnalyzeMoreOutliers) {
      openUpgradeModal('analysis');
      return;
    }

    if (video.analysis?.status === 'complete' || video.analysis?.status === 'processing') {
      openAnalysis(video);
      return;
    }

    setConfirmAnalysisVideo(video);
  };

  const handleSearchBookmarkAction = () => {
    if (!search?.is_watchlisted && !canBookmarkSearch) {
      openUpgradeModal('search-bookmark');
      return;
    }

    onToggleBookmark?.();
  };
  const openPauseConfirm = () => {
    if (!canManageCurrentSearch) {
      openUpgradeModal('search-management');
      return;
    }

    setMenuOpen(false);
    setConfirmAction(search?.status === 'paused' ? 'resume' : 'pause');
  };
  const openDeleteConfirm = () => {
    if (!canManageCurrentSearch) {
      openUpgradeModal('search-management');
      return;
    }

    setMenuOpen(false);
    setConfirmAction('delete');
  };
  const closeConfirmAction = () => setConfirmAction(null);
  const submitConfirmAction = async () => {
    const action = confirmAction;
    if (!action) return;

    setConfirmAction(null);

    if (action === 'delete') {
      await onDelete?.();
      return;
    }

    await onTogglePause?.();
  };

  /* ============================ RENDER ============================ */

  return (
    <>
      <style>{scopedCss}</style>

      {/* top bar */}
      <div className="rs-viewbar">
        <Link className="rs-tbtn" href="/bookmarks">{Icons.Back} Back to bookmarks</Link>
        <div className="rs-viewbar__actions rs-mobileonly" ref={menuTopRef}>
          <button className={`rs-iconbtn${search?.is_watchlisted ? ' on' : ''}`} title="Bookmark" onClick={handleSearchBookmarkAction} disabled={bookmarkUpdating}>
            {search?.is_watchlisted ? Icons.Bookmark : Icons.BookmarkO}
          </button>
          <button className="rs-iconbtn" title="More" onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}>
            {Icons.Kebab}
          </button>
          {menuOpen && (
            <div className="rs-menu" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => { setMenuOpen(false); setHandleEditing(true); }}>{Icons.Edit} Edit TikTok handle</button>
              <button onClick={() => { setMenuOpen(false); onRefresh?.(); }} disabled={refreshing}>{Icons.Refresh} {refreshing ? 'Refreshing…' : 'Refresh now'}</button>
              <button onClick={openPauseConfirm}>{Icons.Pause} {search?.status === 'paused' ? 'Resume tracking' : 'Pause tracking'}</button>
              <hr />
              <button style={{ color: '#B0431B' }} onClick={openDeleteConfirm}>{Icons.Trash} Delete search</button>
            </div>
          )}
        </div>
      </div>

      {/* HEADER */}
      <div className="rs-bhead">
        <span className="rs-bhead__l" style={{ background: gradientFor(search?.id ?? search?.name) }}>
          {initials(search?.name, search?.phrase)}
        </span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <h1 className="rs-h1">{search?.name || search?.phrase}</h1>
          <div className="rs-bmeta">
            <span className="rs-bbadge">{(search?.search_type ?? 'brand').replace(/^\w/, (c) => c.toUpperCase())}</span>
            <span className="rs-handle">
              <span>{search?.source_tiktok_handle ? `@${search.source_tiktok_handle.replace(/^@/, '')}` : 'no handle set'}</span>
              <button className="rs-ed" title="Edit TikTok handle" onClick={() => { setHandleDraft(search?.source_tiktok_handle ?? ''); setHandleEditing((v) => !v); }}>
                {Icons.Edit}
              </button>
            </span>
          </div>
          <div className="rs-bsub">
            {search?.frequency && (
              <span className="rs-bline">
                <span className="rs-bline__k">{search.frequency}</span>
                <span>{search.last_run_at ? `last run ${formatDate(search.last_run_at)}` : 'not run yet'}</span>
                {search.next_run_at ? <span>{`next refresh ${formatDate(search.next_run_at)}`}</span> : null}
              </span>
            )}
            <span className={`rs-state rs-state--${String(search?.status ?? 'ready').toLowerCase()}`}>
              <span className="rs-state__dot" />
              {`${STATUS_LABEL[search?.status] ?? 'Ready'}`}
            </span>
          </div>
        </div>
        <div className="rs-bhead__actions rs-desktoponly" ref={menuHeaderRef}>
          <button className={`rs-iconbtn${search?.is_watchlisted ? ' on' : ''}`} title="Bookmark" onClick={handleSearchBookmarkAction} disabled={bookmarkUpdating}>
            {search?.is_watchlisted ? Icons.Bookmark : Icons.BookmarkO}
          </button>
          <button className="rs-iconbtn" title="More" onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}>
            {Icons.Kebab}
          </button>
          {menuOpen && (
            <div className="rs-menu" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => { setMenuOpen(false); setHandleEditing(true); }}>{Icons.Edit} Edit TikTok handle</button>
              <button onClick={() => { setMenuOpen(false); onRefresh?.(); }} disabled={refreshing}>{Icons.Refresh} {refreshing ? 'Refreshing…' : 'Refresh now'}</button>
              <button onClick={openPauseConfirm}>{Icons.Pause} {search?.status === 'paused' ? 'Resume tracking' : 'Pause tracking'}</button>
              <hr />
              <button style={{ color: '#B0431B' }} onClick={openDeleteConfirm}>{Icons.Trash} Delete search</button>
            </div>
          )}
        </div>
      </div>

      {/* inline handle editor */}
      {handleEditing && (
        <div className="rs-hedit">
          <span className="rs-hedit__pre">@</span>
          <input
            autoFocus
            value={handleDraft}
            onChange={(e) => setHandleDraft(e.target.value.replace(/^@/, ''))}
            placeholder="tiktok handle"
            onKeyDown={(e) => { if (e.key === 'Enter') saveHandle(); if (e.key === 'Escape') setHandleEditing(false); }}
          />
          <button className="rs-btn rs-btn--y rs-btn--sm" onClick={saveHandle} disabled={savingHandle}>
            {savingHandle ? 'Saving…' : 'Save'}
          </button>
          <button className="rs-btn rs-btn--g rs-btn--sm" onClick={() => setHandleEditing(false)} disabled={savingHandle}>Cancel</button>
        </div>
      )}

      {/* AI INSIGHTS */}
      {(bullets.length > 0 || search?.ai_summary) && (
        <div className={`rs-ai${mobileCards ? ' rs-ai--mobile' : ''}${insightsCollapsed ? ' is-collapsed' : ''}`}>
          <button
            type="button"
            className={`rs-ai__toggle${mobileCards ? ' is-mobile' : ''}`}
            onClick={() => mobileCards && setInsightsCollapsed((current) => !current)}
            aria-expanded={!insightsCollapsed}
          >
            <div className="rs-ai__h">
              {Icons.Spark}
              <span className="rs-ai__t">Insights</span>
              <span className="rs-ai__when">{formatDate(search?.ai_summary_generated_at)}</span>
            </div>
            {mobileCards && (
              <div className="rs-ai__hint">
                <span>Click to View Insights</span>
                <span className={`rs-ai__chev${insightsCollapsed ? '' : ' is-open'}`}>{Icons.ChevDown}</span>
              </div>
            )}
          </button>
          {(!mobileCards || !insightsCollapsed) && (
            bullets.length > 0 ? (
              <ul className="rs-ai__list">
                {bullets.map((line, i) => (
                  <li key={i}>{renderBold(line)}</li>
                ))}
              </ul>
            ) : (
              <p style={{ fontSize: '.92rem', lineHeight: 1.5, color: 'var(--body)' }}>{search.ai_summary}</p>
            )
          )}
        </div>
      )}

      {/* STATS */}
      <div className="rs-stats">
        <div className="rs-stt">
          <span className="rs-stt__k">Outliers found</span>
          <span className="rs-stt__v">{Number(outlierCount ?? 0).toLocaleString()}</span>
          <span className="rs-stt__d up">{Icons.UpTrend}<span>{outlierCount ?? 0} this cycle</span></span>
        </div>
        <div className="rs-stt">
          <span className="rs-stt__k">Videos in this search</span>
          <span className="rs-stt__v">{Number(videosInRun ?? 0).toLocaleString()}</span>
          <span className="rs-stt__d">{search?.last_run_at ? `all from the ${formatDate(search.last_run_at)} refresh` : 'this run'}</span>
        </div>
        <div className="rs-stt hi">
          <span className="rs-stt__k">Top outlier score</span>
          <span className="rs-stt__v">{compact(topMultiple ?? 0)}<small>×</small></span>
          <span className="rs-stt__d">{medianViews ? `vs ${compact(medianViews)} median views` : '—'}</span>
        </div>
        <div className="rs-stt">
          <span className="rs-stt__k">Avg engagement rate</span>
          <span className="rs-stt__v">{avgEng != null ? Number(avgEng).toFixed(1) : '—'}<small>%</small></span>
          <span className="rs-stt__d">across {results.length} videos</span>
        </div>
      </div>

      {/* OUTLIER VIDEOS — winner */}
      {winner && (() => {
        const winnerBucket = bucketForVideo(winner);
        const winnerBucketLabel = winnerBucket === 'new'
          ? 'New this run'
          : winnerBucket === 'prev'
            ? 'From the previous run'
            : 'From an older run';
        const winnerBucketHint = winnerBucket === 'new'
          ? runLabels.latest
          : winnerBucket === 'prev'
            ? runLabels.previous
            : '3rd run+';
        return (
        <>
          <div className="rs-sh"><h2>Outlier videos</h2><span className="rs-note">Their posts that beat the search median, ranked by outlier score.</span></div>
          <div className={`rs-winner rs-winner--run-${winnerBucket}`}>
            <VideoFrame video={winner} winner isPlaying={videoPlayingId === winner.id} onTogglePlay={() => setVideoPlayingId((v) => v === winner.id ? null : winner.id)} />
            <div className="rs-wdet">
              <div className="rs-wcreator">
                <span className="rs-av" style={{ background: gradientFor(winner.handle ?? winner.id) }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="rs-wc__n">{winner.handle || winner.username || '—'}</div>
                  <div className="rs-wc__s">{winner.posted_at ? formatDate(winner.posted_at) : ''} on TikTok</div>
                </div>
                <span className={`rs-runpill rs-runpill--${winnerBucket}`} title={winnerBucketHint}>
                  <span className="rs-runpill__dot" aria-hidden />
                  {winnerBucketLabel}
                </span>
                {winner.tiktok_url && (
                  <a href={winner.tiktok_url} target="_blank" rel="noopener" className="rs-ic2" title="Open in TikTok">{Icons.ExtLink}</a>
                )}
              </div>
              <p className="rs-wcap">{winner.title || winner.caption}</p>
              <div className="rs-wmets">
                <span>{Icons.Eye}<b>{compact(winner.views)}</b></span>
                <span>{Icons.Heart}<b>{compact(winner.likes)}</b></span>
                <span>{Icons.Comment}<b>{compact(winner.comments)}</b></span>
                <span>{Icons.Share}<b>{compact(winner.shares)}</b></span>
              </div>
              <VideoTags video={winner} />
              <AutoAnalysis video={winner} />
              <div className="rs-wact">
                <button
                  className="rs-btn rs-btn--y"
                  onClick={() => openAnalysis(winner)}
                  aria-busy={winner.analysis?.status === 'processing'}
                >
                  {Icons.Spark}<span>{analysisCtaLabel(winner.analysis)}</span>
                </button>
                <button
                  className={`rs-ic2${winner.bookmarked ? ' on' : ''}`}
                  onClick={() => onToggleVideoBookmark?.(winner)}
                  disabled={bookmarkingVideoId === winner.id}
                  title={winner.bookmarked ? 'Remove from bookmarks' : 'Save video'}
                  aria-label={winner.bookmarked ? 'Remove from bookmarks' : 'Save video'}
                >
                  {winner.bookmarked ? Icons.Bookmark : Icons.BookmarkO}
                </button>
              </div>
            </div>
          </div>
        </>
        );
      })()}

      {/* MORE OUTLIERS */}
      {rest.length > 0 && (
        <>
          <div className="rs-sh">
            <h2>More outliers</h2>
            <span className="rs-sh__actions">
              <span className="rs-runfilter">
                <span className="rs-runfilter__pre">Show:</span>
                <select
                  value={runFilter}
                  onChange={(e) => setRunFilter(e.target.value)}
                  aria-label="Filter by search run"
                >
                  <option value="all">All runs ({rest.length})</option>
                  <option value="new">New this run ({runCounts.new})</option>
                  <option value="prev">Previous run ({runCounts.prev})</option>
                  <option value="old">Older ({runCounts.old})</option>
                </select>
                {Icons.ChevDown}
              </span>
              <span className="rs-sortsel">
                <span className="rs-sortsel__pre">Sort:</span>
                <select value={sortKey} onChange={(e) => setSortKey(e.target.value)}>
                  <option value="outlier">Outlier score</option>
                  <option value="views">Views</option>
                  <option value="date">Date posted</option>
                </select>
                {Icons.ChevDown}
              </span>
            </span>
          </div>
          {sortedRest.length === 0 ? (
            <div className="rs-runempty">
              No videos matched the current run filter.{' '}
              <button type="button" className="rs-runempty__reset" onClick={() => setRunFilter('all')}>
                Show all runs
              </button>
            </div>
          ) : (
            <div className="rs-ogrid">
              {sortedRest.slice(0, visible).map((v) => (
                <OutlierCard
                  key={v.id}
                  video={v}
                  runBucket={bucketForVideo(v)}
                  expanded={expandedCardId === v.id}
                  locked={!canAnalyzeMoreOutliers}
                  onToggle={() => (!canAnalyzeMoreOutliers
                    ? openUpgradeModal('analysis')
                    : setExpandedCardId((cur) => cur === v.id ? null : v.id))}
                  onAnalyze={() => handleAnalyzeAction(v)}
                  onToggleBookmark={() => onToggleVideoBookmark?.(v)}
                  bookmarking={bookmarkingVideoId === v.id}
                  isPlaying={videoPlayingId === v.id}
                  onTogglePlay={() => setVideoPlayingId((cur) => cur === v.id ? null : v.id)}
                />
              ))}
            </div>
          )}
          {visible < sortedRest.length && (
            <div className="rs-loadmore">
              <button className="rs-btn rs-btn--g" onClick={() => setVisible((n) => n + PAGE_STEP)}>
                {Icons.Plus} Load {Math.min(PAGE_STEP, sortedRest.length - visible)} more
              </button>
            </div>
          )}
        </>
      )}

      {/* ANALYTICS */}
      <div className="rs-sh"><h2>Analytics</h2><span className="rs-note">Weekly buckets based on when the matched videos were uploaded.</span></div>
      <div className="rs-acard">
        <div className="rs-mtabs">
          {[
            ['views', 'views'], ['eng', 'engagement'], ['outliers', 'outliers'],
          ].map(([key, label]) => (
            <button key={key} className={`rs-mtab${metric === key ? ' on' : ''}`} onClick={() => setMetric(key)}>{label}</button>
          ))}
        </div>
        <div className="rs-abig rs-abig--flow">
          <span className="rs-abig__v">{metricConfig[metric].value}</span>
          {comparisonLabel && (
            <span className="rs-abig__delta">
              {comparisonLabel}
              <span className="rs-abig__info">
                <button
                  type="button"
                  className="rs-abig__infoBtn"
                  aria-label={`About ${metric}`}
                >
                  i
                </button>
                <span className="rs-abig__tooltip" role="tooltip">
                  {metricExplanation(metric)}
                </span>
              </span>
            </span>
          )}
        </div>
        <div className="rs-achart rs-achart--flow">
          <div className="rs-achart__inner">
            <div className="rs-achart__grid" aria-hidden>
              {yAxisTicks.map((tick) => (
                <span key={`grid-${metric}-${tick.offset}`} style={{ top: `${tick.offset}%` }} />
              ))}
            </div>
            <svg viewBox="0 0 100 40" preserveAspectRatio="none">
              {chart && (
                <>
                  <defs>
                    <linearGradient id="rs-analytics-fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#E6C97A" stopOpacity=".28" />
                      <stop offset="100%" stopColor="#F2C96B" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <polygon points={`${chart.points} 96,40 8,40`} fill="url(#rs-analytics-fill)" />
                  <polyline points={chart.points} fill="none" stroke="#A87700" strokeWidth="0.85" strokeLinecap="round" strokeLinejoin="round" />
                </>
              )}
            </svg>
            {chartPoints.map(([x, y], index) => {
              const point = weeklyPoints[index];
              const value = chartValues[index] ?? 0;
              const weekKey = weekKeyFromIso(point?.week_start);

              if (!point || !weekKey) return null;

              const tooltip = {
                label: point.label,
                value: formatMetricValue(value, metric),
                count: videosByWeek[weekKey]?.length ?? 0,
              };

              return (
                <button
                  key={`point-${weekKey}`}
                  type="button"
                  className={`rs-achart__point${index === chartPoints.length - 1 ? ' is-latest' : ''}`}
                  style={{ left: `${x}%`, top: `${(y / 40) * 100}%` }}
                  aria-label={`${point.label} · ${tooltip.value}`}
                  onMouseEnter={() => setChartTooltip(tooltip)}
                  onMouseLeave={() => setChartTooltip(null)}
                  onFocus={() => setChartTooltip(tooltip)}
                  onBlur={() => setChartTooltip(null)}
                  onClick={() => setSelectedWeekKey(weekKey)}
                />
              );
            })}
            {chartTooltip && (
              <div className="rs-achart__tooltip" role="status">
                <strong>{chartTooltip.label}</strong>
                <span>{chartTooltip.value}</span>
                <span>{chartTooltip.count} {chartTooltip.count === 1 ? 'video' : 'videos'}</span>
              </div>
            )}
          </div>
          <div className="rs-axlabels rs-axlabels--flow">
            <span>12 wk ago</span>
            <span>8 wk</span>
            <span>4 wk</span>
            <span>now</span>
          </div>
        </div>
      </div>

      {/* WHEN THEY POST */}
      {heatCells.length > 0 && (
        <>
          <div className="rs-sh"><h2>When they post</h2><span className="rs-note">Posting schedule by day and hour.</span></div>
          <div className="rs-heat">
            <div className="rs-heatscroll">
              <div className="rs-heatgrid">
                <div />
                {Array.from({ length: 24 }, (_, h) => (
                  <div key={h} className="rs-hh" style={{ justifyContent: 'center' }}>{HOURS_LABELS[h] ?? ''}</div>
                ))}
                {DAYS_SHORT.map((day, di) => (
                  <Fragment key={di}>
                    <div className="rs-hlabel">{day}</div>
                    {Array.from({ length: 24 }, (_, h) => {
                      const count = Number(heatCells?.[di]?.[h]) || 0;
                      const lvl = count > 0 ? Math.min(5, Math.ceil((count / heatMax) * 5)) : 0;
                      const bg = ['var(--paper)', 'var(--a1)', 'var(--a2)', 'var(--a3)', 'var(--a4)', 'var(--a5)'][lvl];
                      const tooltip = `${day} ${formatHeatmapHour(h)} UTC - ${count} ${count === 1 ? 'post' : 'posts'}`;
                      const updateTooltip = (event) => setHeatmapTooltip({
                        label: tooltip,
                        x: event.clientX,
                        y: event.clientY,
                      });
                      return (
                        <div
                          key={`c-${di}-${h}`}
                          className={`rs-hcell${count > 0 ? ' has-posts' : ''}`}
                          style={{ background: bg }}
                          title={count > 0 ? tooltip : undefined}
                          aria-label={count > 0 ? tooltip : undefined}
                          onMouseEnter={count > 0 ? updateTooltip : undefined}
                          onMouseMove={count > 0 ? updateTooltip : undefined}
                          onMouseLeave={count > 0 ? () => setHeatmapTooltip(null) : undefined}
                        />
                      );
                    })}
                  </Fragment>
                ))}
              </div>
            </div>
            <div className="rs-hlegend">less
              <span style={{ background: 'var(--a1)' }} />
              <span style={{ background: 'var(--a2)' }} />
              <span style={{ background: 'var(--a3)' }} />
              <span style={{ background: 'var(--a4)' }} />
              <span style={{ background: 'var(--a5)' }} />
              more
            </div>
            {bestPostTime?.sentence && (
              <div className="rs-insightbox">
                {Icons.Spark}
                <p>{renderBold(bestPostTime.sentence)}</p>
              </div>
            )}
          </div>
          {heatmapTooltip && (
            <div
              className="rs-heat-tooltip"
              style={{ left: heatmapTooltip.x + 12, top: heatmapTooltip.y - 34 }}
              role="status"
            >
              {heatmapTooltip.label}
            </div>
          )}
        </>
      )}

      {/* MORE DATA */}
      {(weeklyBars.length > 0 || distribution.length > 0) && (
        <>
          <div className="rs-sh"><h2>More data</h2><span className="rs-note">How the tracker is moving.</span></div>
          <div className="rs-two">
            <div className="rs-dcard">
              <h3>Outliers per week</h3><p className="rs-sub">Their posts scoring 3× or higher.</p>
              <div className="rs-owk">
                {weeklyBars.slice(-6).map((b, i) => {
                  const count = b.count ?? b.value ?? 0;
                  const isPeak = count === weeklyMax && count > 0;
                  return (
                    <div key={i} className={`rs-owk__col${isPeak ? ' peak' : ''}`}>
                      <span className="rs-owk__v">{count}</span>
                      <div className="rs-owk__bar" style={{ height: `${Math.max(2, (count / weeklyMax) * 100)}%` }} />
                      <span className="rs-owk__x">{b.label ?? `wk ${i + 1}`}</span>
                    </div>
                  );
                })}
                {weeklyBars.length === 0 && <p style={{ fontSize: '.85rem', color: 'var(--faint-2)' }}>No weekly history yet — comes online after your second refresh.</p>}
              </div>
            </div>
            <div className="rs-dcard">
              <h3>Score distribution</h3><p className="rs-sub">This search's {distribution.reduce((s, d) => s + (d.count ?? 0), 0)} outliers.</p>
              <div className="rs-dist">
                {distribution.map((d) => {
                  const shade = d.count / distMax > 0.7 ? 'var(--a5)' : d.count / distMax > 0.4 ? 'var(--a4)' : d.count / distMax > 0.2 ? 'var(--a3)' : 'var(--a2)';
                  return (
                    <div key={d.label} className="rs-drow">
                      <span className="rs-drow__lbl">{d.label}</span>
                      <div className="rs-drow__track"><span className="rs-drow__fill" style={{ width: `${(d.count / distMax) * 100}%`, background: shade }} /></div>
                      <span className="rs-drow__c">{d.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}

      {/* HASHTAGS & SOUNDS */}
      {(hashtags.length > 0 || sounds.length > 0) && (
        <>
          <div className="rs-sh"><h2>Hashtags &amp; sounds</h2><span className="rs-note">Across this search's outlier videos.</span></div>
          <div className="rs-two">
            <ScrollPanel title="Hashtags they used" items={hashtags.map((h) => ({ label: h.tag, count: h.count, url: `https://www.tiktok.com/tag/${encodeURIComponent(String(h.tag).replace(/^#/, ''))}` }))} max={hashMax} />
            <ScrollPanel title="Sounds they used" items={sounds.map((s) => ({ label: s.label, count: s.count, icon: Icons.Music, url: `https://www.tiktok.com/search/sound?q=${encodeURIComponent(s.label)}` }))} max={soundMax} barColor="var(--a4)" />
          </div>
        </>
      )}

      {selectedWeekKey && (
        <div className="rs-modalback" onClick={() => setSelectedWeekKey(null)}>
          <div className="rs-weekmodal" onClick={(event) => event.stopPropagation()}>
            <div className="rs-weekmodal__head">
              <div>
                <h3>{weeklyPoints.find((point) => weekKeyFromIso(point.week_start) === selectedWeekKey)?.label ?? 'Selected week'}</h3>
                <p>{selectedWeekVideos.length} matched {selectedWeekVideos.length === 1 ? 'video' : 'videos'} uploaded in this week.</p>
              </div>
              <button type="button" className="rs-weekmodal__close" onClick={() => setSelectedWeekKey(null)} aria-label="Close">
                ×
              </button>
            </div>
            <div className="rs-weekmodal__list">
              {selectedWeekVideos.map((video) => (
                <button
                  key={`week-video-${video.id}`}
                  type="button"
                  className="rs-weekmodal__row"
                  onClick={() => {
                    setSelectedWeekKey(null);
                    openAnalysis(video);
                  }}
                >
                  <span className="rs-weekmodal__thumb" style={{ background: gradientFor(video.id) }}>
                    {video.thumbnail_url ? <img src={video.thumbnail_url} alt="" /> : initials(video.handle || video.username || video.title)}
                  </span>
                  <span className="rs-weekmodal__body">
                    <strong>{video.handle || video.username || video.title || 'Video'}</strong>
                    <span>{video.title || video.caption || 'Open this video from the outlier list.'}</span>
                    <span>{compact(video.views)} views · uploaded {formatDate(video.uploaded_at) || '—'}</span>
                  </span>
                </button>
              ))}
              {selectedWeekVideos.length === 0 && (
                <div className="rs-weekmodal__empty">No videos were available for this week.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {analysisModal && (
        <AnalysisModal
          open
          video={analysisModal.video}
          initialAnalysis={analysisModal.analysis}
          onClose={closeAnalysis}
          onAnalysisChange={updateVideoAnalysis}
        />
      )}
      {analysisNotice && (
        <div className={`rs-toast rs-toast--${analysisNotice.tone}`} role="status" aria-live="polite">
          <span>{analysisNotice.message}</span>
          <button type="button" onClick={() => setAnalysisNotice(null)} aria-label="Dismiss notification">×</button>
        </div>
      )}
      {confirmAnalysisVideo && (
        <UsageConfirmModal
          video={confirmAnalysisVideo}
          creditsRemaining={analysisRemainingNow}
          creditsRemainingAfterUse={analysisRemainingAfterUse}
          busy={analysisStarting}
          onCancel={closeConfirmAnalysis}
          onConfirm={() => launchManualAnalysis(confirmAnalysisVideo)}
        />
      )}
      {upgradeModalType && (
        <UpgradeModal
          mode={upgradeModalType}
          trialEligible={billing?.trialEligible ?? true}
          hasUsedTrial={billing?.hasUsedTrial ?? false}
          onClose={closeUpgradeModal}
          onUpgrade={openUpgradeForAnalysis}
        />
      )}
      {confirmAction && (
        <ActionConfirmModal
          action={confirmAction}
          searchName={search?.name || search?.phrase}
          onClose={closeConfirmAction}
          onConfirm={submitConfirmAction}
        />
      )}
    </>
  );
}

/* -------------------- sub-components -------------------- */

function VideoFrame({ video, winner = false, isPlaying, onTogglePlay }) {
  const bg = video.thumbnail_url ? undefined : gradientFor(video.id ?? video.handle);
  const playerUrl = playerUrlFor(video, true);
  const [playerReady, setPlayerReady] = useState(false);
  const iframeRef = useRef(null);

  useEffect(() => {
    setPlayerReady(false);
  }, [isPlaying, playerUrl]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!isPlaying || !iframe || !video?.video_id) return undefined;

    const unmuteAndPlay = () => {
      postTikTokMessage(iframe, 'unMute');
      postTikTokMessage(iframe, 'play');
    };

    const handleReady = (event) => {
      const payload = event?.data;
      if (!payload || payload['x-tiktok-player'] !== true || payload.type !== 'onPlayerReady') return;
      if (event.source !== iframe.contentWindow) return;
      unmuteAndPlay();
    };

    iframe.addEventListener('load', unmuteAndPlay);
    window.addEventListener('message', handleReady);

    return () => {
      iframe.removeEventListener('load', unmuteAndPlay);
      window.removeEventListener('message', handleReady);
    };
  }, [isPlaying, video?.video_id]);

  return (
    <div className={`rs-vf${isPlaying ? ' playing' : ''}${winner ? ' rs-vf--big' : ''}`}>
      {!isPlaying && (video.thumbnail_url
        ? <img className="rs-vf__img" src={video.thumbnail_url} alt="" loading="lazy" />
        : <div className="rs-vf__img" style={{ background: bg }} />)}
      {isPlaying && playerUrl && (
        <iframe
          ref={iframeRef}
          className="rs-vf__player"
          src={playerUrl}
          title={video.title ? `Video: ${video.title}` : 'Video preview'}
          allow="autoplay; encrypted-media; fullscreen"
          allowFullScreen
          onLoad={() => setPlayerReady(true)}
        />
      )}
      {!isPlaying && <div className="rs-vf__scrim" />}
      {winner
        ? <span className="rs-vf__win">{Icons.Spark}Winner</span>
        : <span className="rs-vf__rank">{video.rank ?? ''}</span>}
      {video.duration != null && <span className="rs-vf__dur">{formatDuration(video.duration)}</span>}
      {!isPlaying && <button className="rs-vf__play" onClick={onTogglePlay} aria-label="Play">{Icons.Play}</button>}
      {isPlaying && playerUrl && !playerReady && <span className="rs-vf__loading">Loading video…</span>}
      {isPlaying && <button className="rs-vf__close" onClick={onTogglePlay} aria-label="Close video preview">×</button>}
      {!isPlaying && <div className="rs-vf__stats">
        <div className="rs-vchip rs-vchip--out">
          <div className="rs-vchip__l">Outlier score</div>
          <div className="rs-vchip__n">{compact(video.multiple ?? video.score ?? 0)}×</div>
        </div>
        <div className="rs-vchip rs-vchip--views">
          <div className="rs-vchip__l">Views</div>
          <div className="rs-vchip__n">{compact(video.views)}</div>
        </div>
      </div>
      }
    </div>
  );
}

function formatDuration(seconds) {
  if (seconds == null || Number.isNaN(seconds)) return null;
  const s = Math.round(seconds);
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

function VideoTags({ video }) {
  const tags = [];
  if (video.content_format) tags.push(video.content_format);
  if (video.content_hook)   tags.push(`Hook: ${video.content_hook}`);
  if (video.content_angle)  tags.push(video.content_angle);
  if (tags.length === 0) {
    (Array.isArray(video.hashtags) ? video.hashtags : [])
      .filter(Boolean)
      .slice(0, 3)
      .forEach((tag) => tags.push(String(tag).startsWith('#') ? String(tag) : `#${tag}`));
  }
  if (tags.length === 0) return null;
  return (
    <div className="rs-tags">
      {tags.map((t, i) => <span key={i} className="rs-tag">{t}</span>)}
    </div>
  );
}

function AutoAnalysis({ video }) {
  const rows = [];
  if (video.why_broke_out)    rows.push(['Why it broke out', video.why_broke_out]);
  if (!video.why_broke_out && video.outlier_multiple != null) {
    rows.push(['Performance signal', `${compact(video.views)} views, ${compact(video.outlier_multiple)}× the search median.`]);
  }
  if (video.content_format)   rows.push(['Format', video.content_format]);
  if (video.replicate_with)   rows.push(['Replicate with', video.replicate_with]);
  if (rows.length === 0) return null;

  return (
    <div className="rs-anz">
      <div className="rs-anz__h">{Icons.Spark}Analysis</div>
      <dl>
        {rows.map(([dt, dd]) => (
          <Fragment key={dt}>
            <dt>{dt}</dt>
            <dd>{dd}</dd>
          </Fragment>
        ))}
      </dl>
    </div>
  );
}

function OutlierCard({ video, runBucket = 'old', expanded, locked = false, onToggle, onAnalyze, onToggleBookmark, bookmarking, isPlaying, onTogglePlay }) {
  const primaryLabel = video.analysis?.status === 'processing'
    ? 'Analyzing video...'
    : video.analysis?.status === 'complete'
      ? 'View analysis'
      : video.analysis?.status === 'failed'
        ? 'Retry analysis'
        : 'Analyze video';
  const mobilePrimaryLabel = primaryLabel === 'Analyze video' ? 'Analyze' : primaryLabel;
  return (
    <article className={`rs-oc rs-oc--run-${runBucket}${expanded ? ' analyzed' : ''}`}>
      <VideoFrame video={video} isPlaying={isPlaying} onTogglePlay={onTogglePlay} />
      <div className="rs-oc__b">
        <div className="rs-oc__cr">
          <span className="rs-av" style={{ background: gradientFor(video.handle ?? video.id), width: 26, height: 26, borderRadius: '50%', flex: 'none' }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="rs-oc__h">{video.handle || video.username || '—'}</div>
            <div className="rs-oc__s">{video.posted_at ? formatDate(video.posted_at) : ''}</div>
          </div>
          {video.tiktok_url && (
            <a href={video.tiktok_url} target="_blank" rel="noopener" className="rs-ic2" title="Open in TikTok">{Icons.ExtLink}</a>
          )}
        </div>
        <p className="rs-oc__c">{video.title || video.caption}</p>
        <div className="rs-oc__st">
          <span>{Icons.Eye}{compact(video.views)}</span>
          <span>{Icons.Heart}{compact(video.likes)}</span>
          <span>{Icons.Comment}{compact(video.comments)}</span>
          <span>{Icons.Share}{compact(video.shares)}</span>
        </div>
        {expanded && !locked && (
          <div className="rs-oc__panel">
            <AutoAnalysis video={video} />
          </div>
        )}
        <div className="rs-oc__an">
          <button className="rs-btn rs-btn--y rs-btn--sm" onClick={onAnalyze} disabled={video.analysis?.status === 'processing'}>
            <span className="rs-oc__anIcon">{Icons.Spark}</span>
            <span className="rs-oc__anLabel rs-oc__anLabel--desktop">{primaryLabel}</span>
            <span className="rs-oc__anLabel rs-oc__anLabel--mobile">{mobilePrimaryLabel}</span>
          </button>
          <button className="rs-ic2" title={expanded && !locked ? 'Hide inline summary' : 'Show inline summary'} onClick={onToggle}>{Icons.ExtLink}</button>
          <button
            className={`rs-ic2${video.bookmarked ? ' on' : ''}`}
            title={video.bookmarked ? 'Remove from bookmarks' : 'Save video'}
            aria-label={video.bookmarked ? 'Remove from bookmarks' : 'Save video'}
            onClick={onToggleBookmark}
            disabled={bookmarking}
          >
            {video.bookmarked ? Icons.Bookmark : Icons.BookmarkO}
          </button>
        </div>
      </div>
    </article>
  );
}

function UsageConfirmModal({ video, creditsRemaining, creditsRemainingAfterUse, busy = false, onConfirm, onCancel }) {
  const currentCredits = creditsRemaining === -1 ? 'Unlimited' : creditsRemaining;
  const afterUseCredits = creditsRemainingAfterUse === 'unlimited' ? 'unlimited' : creditsRemainingAfterUse;

  return (
    <div className="rs-modalback" onClick={onCancel}>
      <div className="rs-usage" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label="Confirm video analysis">
        <div className="rs-upg__eyebrow">{Icons.Spark}<span>Video analysis</span></div>
        <h3>Analyze this outlier video?</h3>
        <p>
          You currently have <b>{currentCredits}</b> video analysis {currentCredits === 1 ? 'credit' : 'credits'} remaining.
          This analysis will use <b>1 credit</b> when it completes successfully, leaving you with <b>{afterUseCredits}</b>.
        </p>
        <p className="rs-usage__subject">{video?.title || video?.caption || video?.handle || 'Selected video'}</p>
        <div className="rs-upgmodal__actions">
          <button type="button" className="rs-btn rs-btn--g" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button type="button" className="rs-btn rs-btn--y" onClick={onConfirm} disabled={busy}>
            {busy ? 'Starting…' : 'Start analysis'}
          </button>
        </div>
      </div>
    </div>
  );
}

function UpgradeModal({ mode = 'analysis', trialEligible = true, hasUsedTrial = false, onClose, onUpgrade }) {
  const isSearchBookmark = mode === 'search-bookmark';
  const isSearchManagement = mode === 'search-management';
  const shouldOfferTrial = trialEligible && !hasUsedTrial;
  const eyebrowLabel = isSearchBookmark
    ? 'Search bookmarks'
    : isSearchManagement
      ? 'Search management'
      : 'Video analysis';
  const title = isSearchBookmark
    ? shouldOfferTrial
      ? 'Start your 8-day Growth trial to unlock search bookmarks'
      : 'Upgrade to unlock search bookmarks'
    : isSearchManagement
      ? shouldOfferTrial
        ? 'Start your 8-day Growth trial to manage this search'
        : 'Upgrade to manage this search'
      : shouldOfferTrial
        ? 'Start your 8-day Growth trial to unlock more analysis credits'
        : 'Upgrade to unlock more analysis credits';
  const body = isSearchBookmark
    ? shouldOfferTrial
      ? 'Free searches do not include saved search bookmarks. Start your 8-day Growth trial to save searches to your bookmarks.'
      : 'Free searches do not include saved search bookmarks. Upgrade to Growth or Scale to save searches to your bookmarks.'
    : isSearchManagement
      ? shouldOfferTrial
        ? 'Start your 8-day Growth trial to pause, resume, or delete tracked searches from your dashboard.'
        : 'Upgrade to Growth or Scale to pause, resume, or delete tracked searches from your dashboard.'
      : shouldOfferTrial
        ? 'Free searches include the top-video breakdown. Start your 8-day Growth trial to analyze more outliers.'
        : 'Free searches include the top-video breakdown. Upgrade to Growth or Scale to analyze more outliers.';
  const ctaLabel = shouldOfferTrial ? 'Start 8-day Growth trial' : 'Upgrade to Growth';

  return (
    <UpgradePromptModal
      eyebrow={eyebrowLabel}
      title={title}
      body={body}
      primaryLabel={ctaLabel}
      onPrimary={onUpgrade}
      onClose={onClose}
    />
  );
}

function ActionConfirmModal({ action, searchName, onClose, onConfirm }) {
  const isDelete = action === 'delete';
  const isResume = action === 'resume';
  const title = isDelete
    ? 'Delete this search?'
    : isResume
      ? 'Resume this search?'
      : 'Pause this search?';
  const body = isDelete
    ? 'This will remove the search from your dashboard and bookmarks.'
    : isResume
      ? 'This search will start tracking again on its normal schedule.'
      : 'This search will stop refreshing until you resume it again.';
  const confirmLabel = isDelete
    ? 'Delete search'
    : isResume
      ? 'Resume tracking'
      : 'Pause tracking';

  return (
    <div className="rs-modalback" onClick={onClose}>
      <div className="rs-upgmodal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label={title}>
        <button type="button" className="rs-upgmodal__close" onClick={onClose} aria-label="Close confirmation">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <div className="rs-upg__eyebrow">{isDelete ? Icons.Trash : Icons.Pause}<span>{isDelete ? 'Delete search' : 'Tracking status'}</span></div>
        <h3>{title}</h3>
        <p>{body}</p>
        <p className="rs-usage__subject">{searchName || 'Selected search'}</p>
        <div className="rs-upgmodal__actions">
          <button type="button" className={`rs-btn ${isDelete ? 'rs-btn--danger' : 'rs-btn--y'}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
          <button type="button" className="rs-btn rs-btn--g" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function ScrollPanel({ title, items, max, barColor = 'var(--a3)' }) {
  const listRef = useRef(null);
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return undefined;
    const update = () => {
      const end = el.scrollTop + el.clientHeight >= el.scrollHeight - 4;
      setAtEnd(end || el.scrollHeight <= el.clientHeight);
    };
    el.addEventListener('scroll', update);
    update();
    return () => el.removeEventListener('scroll', update);
  }, [items]);

  return (
    <div className={`rs-scrollp${atEnd ? ' is-end' : ''}`}>
      <div className="rs-scrollp__hd">
        <h3>{title}</h3>
        <span className="rs-scrollp__cnt">{items.length} total</span>
      </div>
      <div className="rs-scrollp__list" ref={listRef}>
        {items.map((it, i) => (
          <a key={i} className="rs-hrow" href={it.url} target="_blank" rel="noopener">
            <div className="rs-hrow__n">{it.icon}<span>{it.label}</span>{Icons.ExtLink}</div>
            <div className="rs-hrow__bar"><i style={{ width: `${(it.count / max) * 100}%`, background: barColor }} /></div>
            <div className="rs-hrow__c">{it.count}</div>
          </a>
        ))}
      </div>
      {!atEnd && <div className="rs-scrollp__fade"><span>scroll for more</span></div>}
    </div>
  );
}

/* -------------------- scoped CSS (mockup ported verbatim, `rs-` prefixed) -------------------- */

const scopedCss = `
:root{--a1:#FDF0C8;--a2:#FBDE8E;--a3:#F6C445;--a4:#E0A100;--a5:#B87400}
.rs-viewbar{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:22px;flex-wrap:wrap;min-width:0;max-width:100%;overflow:visible}
.rs-viewbar__actions{margin-left:auto;display:flex;align-items:center;justify-content:flex-end;gap:8px;flex:none;position:relative;min-width:0;max-width:100%}
.rs-mobileonly{display:none}
.rs-desktoponly{display:flex}
.rs-tbtn{display:inline-flex;align-items:center;gap:7px;font-size:.85rem;font-weight:700;color:var(--muted)}
.rs-tbtn:hover{color:var(--ink)}
.rs-tbtn svg{width:15px;height:15px}

.rs-bhead{display:flex;align-items:center;gap:14px;flex-wrap:wrap;padding:16px 18px;border:1px solid var(--line);border-radius:18px;background:linear-gradient(180deg,rgba(255,255,255,.96),rgba(250,249,246,.98));box-shadow:0 8px 24px -20px rgba(20,15,0,.24);min-width:0;max-width:100%;overflow-x:hidden}
.rs-bhead__l{width:54px;height:54px;border-radius:15px;display:grid;place-items:center;color:#fff;font-weight:800;font-size:1.05rem;flex:none;text-shadow:0 1px 3px rgba(0,0,0,.15);box-shadow:inset 0 1px 0 rgba(255,255,255,.28),0 12px 24px -16px rgba(154,107,0,.55)}
.rs-bhead__actions{margin-left:auto;display:flex;align-items:center;justify-content:flex-end;gap:10px;flex:none;position:relative}
.rs-h1{font-size:1.65rem;font-weight:850;letter-spacing:-.04em;color:var(--ink);line-height:1.02;text-wrap:balance}
.rs-bmeta{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:8px;font-size:.82rem;color:var(--faint-2,#9A968E);min-width:0;max-width:100%}
.rs-bbadge{font-size:.64rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--amber-ink);background:var(--wash);padding:5px 9px;border-radius:999px;border:1px solid #f2e4b8}
.rs-sep{width:3px;height:3px;border-radius:50%;background:#CFCCC3}
.rs-handle{display:inline-flex;align-items:center;gap:5px;min-width:0;padding:4px 10px;border-radius:999px;background:var(--paper);border:1px solid var(--line);font-weight:600}
.rs-handle span:first-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:180px}
.rs-ed{width:22px;height:22px;border-radius:6px;display:grid;place-items:center;color:var(--faint-2,#9A968E);border:0;background:transparent;cursor:pointer;transition:.15s}
.rs-ed:hover{background:var(--paper);color:var(--ink)} .rs-ed svg{width:13px;height:13px}
.rs-bsub{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:10px;font-size:.79rem;color:var(--muted);min-width:0;max-width:100%}
.rs-bline{display:flex;align-items:center;gap:7px;flex-wrap:wrap}
.rs-bline span{display:inline-flex;align-items:center}
.rs-bline span+span::before{content:'·';margin-right:7px;color:#c1bdb3}
.rs-bline__k{font-weight:800;color:var(--amber-ink);text-transform:capitalize}
.rs-state{display:inline-flex;align-items:center;gap:7px;padding:4px 10px;border-radius:999px;background:var(--paper);border:1px solid var(--line);font-weight:700;color:var(--muted)}
.rs-state__dot{width:7px;height:7px;border-radius:50%;background:currentColor;opacity:.85}
.rs-state--ready,.rs-state--done,.rs-state--complete{color:var(--ok);background:var(--ok-bg);border-color:color-mix(in srgb,var(--ok) 18%,var(--line))}
.rs-state--running,.rs-state--queued,.rs-state--pending,.rs-state--scraping{color:var(--amber-ink);background:var(--wash);border-color:#f2e4b8}
.rs-state--paused{color:#8a6b12;background:#fff6da;border-color:#eddc9a}
.rs-state--failed{color:#b0431b;background:var(--warn-bg);border-color:color-mix(in srgb,#b0431b 20%,var(--line))}
.rs-iconbtn{width:42px;height:42px;border-radius:11px;border:1px solid var(--line-2,#DEDBD3);background:var(--white);display:grid;place-items:center;color:var(--muted);cursor:pointer;transition:.15s;position:relative}
.rs-iconbtn:hover:not(:disabled){border-color:var(--faint-2,#9A968E);color:var(--ink)}
.rs-iconbtn.on{background:var(--wash);border-color:var(--yellow);color:var(--amber-ink)}
.rs-iconbtn svg{width:18px;height:18px}
.rs-iconbtn:disabled{opacity:.5;cursor:not-allowed}
.rs-menu{position:absolute;top:50px;right:0;width:220px;background:var(--white);border:1px solid var(--line);border-radius:16px;padding:6px;z-index:80;box-shadow:0 8px 24px -8px rgba(0,0,0,.15)}
.rs-menu button{display:flex;align-items:center;gap:10px;width:100%;padding:9px 11px;border-radius:11px;font-size:.85rem;font-weight:600;color:var(--body);text-align:left;background:transparent;border:0;cursor:pointer}
.rs-menu button:hover{background:var(--paper);color:var(--ink)} .rs-menu button svg{width:15px;height:15px;color:var(--faint-2,#9A968E)}
.rs-menu hr{border:0;border-top:1px solid var(--line);margin:5px 6px}

.rs-hedit{display:flex;align-items:center;gap:8px;margin-top:12px;padding:10px 12px;border:1px solid var(--line-2,#DEDBD3);border-radius:100px;background:var(--white);max-width:460px}
.rs-hedit__pre{font-size:.9rem;font-weight:700;color:var(--faint-2,#9A968E)}
.rs-hedit input{flex:1;border:0;outline:0;background:transparent;font:inherit;font-size:.92rem;font-weight:700;color:var(--ink)}
.rs-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:42px;padding:0 18px;border-radius:100px;font-size:.88rem;font-weight:700;letter-spacing:-.01em;white-space:nowrap;transition:.16s;border:0;cursor:pointer}
.rs-btn svg{width:15px;height:15px;flex:none}
.rs-btn--y{background:var(--yellow);color:#1A1400} .rs-btn--y:hover:not(:disabled){background:var(--yellow-hot,#FFD84D)}
.rs-btn--g{border:1px solid var(--line-2,#DEDBD3);background:var(--white);color:var(--ink)}
.rs-btn--g:hover:not(:disabled){border-color:var(--faint-2,#9A968E);background:var(--paper)}
.rs-btn--danger{background:#B0431B;color:#fff}
.rs-btn--danger:hover:not(:disabled){background:#972f0f}
.rs-btn--sm{height:34px;padding:0 14px;font-size:.82rem;font-weight:600}
.rs-btn:disabled{opacity:.55;cursor:not-allowed}

.rs-ai{border:1px solid #F2E4B8;background:var(--wash);border-radius:16px;padding:18px 20px;margin-top:20px;min-width:0;max-width:100%;overflow-x:hidden}
.rs-ai__toggle{width:100%;border:0;background:transparent;padding:0;text-align:left;cursor:default}
.rs-ai__toggle.is-mobile{cursor:pointer}
.rs-ai__h{display:flex;align-items:center;gap:9px;margin-bottom:10px}
.rs-ai__h svg{width:19px;height:19px;color:var(--amber-ink)}
.rs-ai__t{font-size:.72rem;font-weight:800;letter-spacing:.13em;text-transform:uppercase;color:var(--amber-ink)}
.rs-ai__when{margin-left:auto;font-size:.75rem;color:var(--faint,#7C7972)}
.rs-ai__hint{display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:.78rem;font-weight:700;color:var(--amber-ink)}
.rs-ai__chev{display:inline-flex;align-items:center;justify-content:center;transition:transform .18s ease}
.rs-ai__chev svg{width:14px;height:14px;color:currentColor}
.rs-ai__chev.is-open{transform:rotate(180deg)}
.rs-ai__list{list-style:none;display:flex;flex-direction:column;gap:7px;padding:0;margin:0}
.rs-ai__list li{position:relative;padding-left:20px;font-size:.9rem;line-height:1.45;color:var(--body)}
.rs-ai__list li::before{content:'';position:absolute;left:4px;top:9px;width:6px;height:6px;border-radius:50%;background:var(--amber-ink)}
.rs-ai__list b{color:var(--ink);font-weight:800}

.rs-sh{display:flex;align-items:baseline;justify-content:space-between;gap:16px;margin:38px 0 14px;flex-wrap:wrap}
.rs-sh h2{font-size:1.06rem;font-weight:800;letter-spacing:-.028em;color:var(--ink);display:flex;align-items:center;gap:11px}
.rs-sh h2::before{content:'';width:4px;height:16px;border-radius:2px;background:var(--yellow)}
.rs-note{font-size:.82rem;color:var(--faint-2,#9A968E)}

.rs-stats{display:grid;grid-template-columns:repeat(4,1fr);background:var(--white);border:1px solid var(--line);border-radius:16px;overflow:hidden;margin-top:18px;min-width:0;max-width:100%}
.rs-stt{padding:17px 20px;border-right:1px solid var(--line);display:flex;flex-direction:column;gap:11px}
.rs-stt:last-child{border-right:none}
.rs-stt__k{font-size:.73rem;color:var(--faint-2,#9A968E);font-weight:600}
.rs-stt__v{font-size:1.72rem;font-weight:800;letter-spacing:-.05em;color:var(--ink);line-height:1;font-variant-numeric:tabular-nums}
.rs-stt__v small{font-size:.52em;font-weight:700;color:var(--faint-2,#9A968E);margin-left:1px}
.rs-stt__d{font-size:.75rem;color:var(--faint-2,#9A968E);font-weight:500;display:inline-flex;align-items:center;gap:5px}
.rs-stt__d.up{color:var(--ok);font-weight:600} .rs-stt__d svg{width:11px;height:11px}
.rs-stt.hi .rs-stt__v{color:var(--amber-ink)}

@media (min-width:561px){
.rs-viewbar{margin-bottom:18px}
.rs-viewbar__actions{display:none}
.rs-bhead{display:grid;grid-template-columns:58px minmax(0,1fr) auto;align-items:start;gap:16px;padding:0 0 16px;border:0;border-radius:0;background:transparent;box-shadow:none;overflow:visible}
.rs-bhead__l{width:50px;height:50px;border-radius:14px;font-size:1rem;box-shadow:none}
.rs-bhead__actions .rs-iconbtn{width:46px;height:46px;border-radius:14px;border-color:#E6DFD1;box-shadow:0 2px 6px rgba(36,25,0,.04)}
.rs-h1{font-size:2rem;line-height:.98}
.rs-bmeta{margin-top:6px;gap:10px;font-size:.95rem;color:#978D7B}
.rs-bbadge{font-size:.68rem;padding:4px 10px}
.rs-handle{padding:0;border:0;background:transparent;border-radius:0;font-weight:500;color:#978D7B}
.rs-handle span:first-child{max-width:220px}
.rs-ed{width:18px;height:18px}
.rs-bsub{margin-top:10px;gap:8px;font-size:.95rem;color:#978D7B}
.rs-bline{gap:0}
.rs-bline span+span::before{margin:0 10px 0 9px}
.rs-bline__k{font-weight:700;color:#B28D28}
.rs-state{padding:2px 10px;font-size:.72rem;background:#F3FBF4;border-color:#D6EED9}
.rs-ai{margin-top:12px;padding:18px 22px 16px;border-radius:18px;background:linear-gradient(180deg,#FFF9EA 0%,#FFFCF4 100%);border:1px solid #EBCB7D}
.rs-ai__h{margin-bottom:12px}
.rs-ai__h svg{width:16px;height:16px}
.rs-ai__t{font-size:.84rem;letter-spacing:.15em}
.rs-ai__when{font-size:.92rem;color:#8F836D}
.rs-ai__list{gap:10px}
.rs-ai__list li{padding-left:18px;font-size:1rem;line-height:1.52}
.rs-ai__list li::before{left:2px;top:11px;width:7px;height:7px}
.rs-stats{margin-top:18px;border-radius:18px;border-color:#E5DED2;grid-template-columns:repeat(4,minmax(0,1fr))}
.rs-stt{padding:18px 20px 17px;gap:10px}
.rs-stt__k{font-size:.9rem;color:#968A75}
.rs-stt__v{font-size:2.15rem;letter-spacing:-.06em}
.rs-stt__d{font-size:.95rem;color:#968A75}
}

.rs-winner{position:relative;display:grid;grid-template-columns:262px 1fr;gap:22px;background:var(--white);border:1px solid var(--line);border-radius:20px;padding:20px;min-width:0;max-width:100%;overflow:hidden}
/* Run pill in the winner detail column — text remains so the active search
   run context stays visible without relying on accent colors. */
.rs-runpill{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:999px;font-size:.72rem;font-weight:700;letter-spacing:.01em;white-space:nowrap;border:1px solid transparent;flex:none}
.rs-runpill__dot{width:8px;height:8px;border-radius:50%;flex:none;background:currentColor}
.rs-runpill--new,.rs-runpill--prev,.rs-runpill--old{color:var(--ink);background:var(--paper);border-color:var(--line)}
.rs-vf{position:relative;width:100%;aspect-ratio:9/16;border-radius:14px;overflow:hidden;background:#1a1a1a}
.rs-vf--big{max-width:262px}
.rs-vf__img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.rs-vf__player{position:absolute;inset:0;width:100%;height:100%;border:0;background:#000}
.rs-vf__scrim{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.28),transparent 22% 62%,rgba(0,0,0,.5));transition:opacity .2s}
.rs-vf__play{position:absolute;inset:0;margin:auto;width:56px;height:56px;border-radius:50%;background:rgba(255,255,255,.92);display:grid;place-items:center;transition:.15s;border:0;cursor:pointer}
.rs-vf__play svg{width:20px;height:20px;margin-left:2px;color:#1A1400}
.rs-vf:hover .rs-vf__play{transform:scale(1.06)}
.rs-vf__loading{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);padding:6px 9px;border-radius:8px;background:rgba(0,0,0,.7);color:#fff;font-size:.7rem;font-weight:700;white-space:nowrap;pointer-events:none}
.rs-vf__close{position:absolute;top:9px;right:9px;width:28px;height:28px;border:0;border-radius:50%;background:rgba(0,0,0,.65);color:#fff;font-size:1.25rem;line-height:1;cursor:pointer}
.rs-vf__win{position:absolute;top:10px;left:10px;display:inline-flex;align-items:center;gap:5px;padding:4px 9px;border-radius:100px;background:var(--yellow);color:#1A1400;font-size:.68rem;font-weight:800;letter-spacing:.02em}
.rs-vf__win svg{width:11px;height:11px}
.rs-vf__dur{position:absolute;top:10px;right:10px;padding:2px 7px;border-radius:6px;background:rgba(0,0,0,.6);color:#fff;font-size:.7rem;font-weight:700}
.rs-vf__rank{position:absolute;top:10px;left:10px;width:24px;height:24px;border-radius:7px;background:rgba(0,0,0,.62);color:#fff;display:grid;place-items:center;font-size:.74rem;font-weight:800}
.rs-vf__stats{position:absolute;left:10px;right:10px;bottom:10px;display:flex;gap:7px;transition:transform .34s,opacity .22s}
.rs-vchip{flex:1;border-radius:10px;padding:7px 10px;background:rgba(24,22,20,.58);backdrop-filter:blur(6px);box-shadow:0 2px 8px -4px rgba(0,0,0,.4)}
.rs-vchip__l{font-size:.6rem;font-weight:800;text-transform:uppercase;letter-spacing:.05em;opacity:.9}
.rs-vchip__n{font-size:1.02rem;font-weight:900;letter-spacing:-.025em;margin-top:2px;font-variant-numeric:tabular-nums}
.rs-vchip--out .rs-vchip__l{color:#F4CE6A} .rs-vchip--out .rs-vchip__n{color:#FFD766}
.rs-vchip--views .rs-vchip__l{color:#F0AEC1} .rs-vchip--views .rs-vchip__n{color:#F7C2D2}

.rs-wdet{min-width:0;display:flex;flex-direction:column}
.rs-wcreator{display:flex;align-items:center;gap:10px}
.rs-av{width:34px;height:34px;border-radius:50%;flex:none}
.rs-wc__n{font-size:.92rem;font-weight:800;color:var(--ink)}
.rs-wc__s{font-size:.76rem;color:var(--faint-2,#9A968E)}
.rs-wcap{font-size:.92rem;color:var(--body);line-height:1.5;margin:13px 0}
.rs-wmets{display:flex;flex-wrap:wrap;gap:24px;padding:13px 0;border-top:1px solid var(--line);border-bottom:1px solid var(--line);margin:13px 0}
.rs-wmets span{display:inline-flex;align-items:center;gap:7px;font-size:.9rem;color:var(--faint-2,#9A968E);font-weight:500}
.rs-wmets svg{width:16px;height:16px;color:var(--faint-2,#9A968E);flex:none}
.rs-wmets b{font-weight:700;color:var(--ink);font-variant-numeric:tabular-nums}
.rs-tags{display:flex;flex-wrap:wrap;gap:7px;margin:13px 0}
.rs-tag{font-size:.76rem;font-weight:600;color:var(--amber-ink);background:var(--wash);border:1px solid #F2E4B8;border-radius:100px;padding:4px 11px}
.rs-anz{border:1px solid var(--line);border-radius:16px;padding:14px 16px;background:var(--paper)}
.rs-anz__h{display:flex;align-items:center;gap:8px;font-size:.74rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--amber-ink);margin-bottom:9px}
.rs-anz__h svg{width:14px;height:14px}
.rs-anz dl{display:grid;grid-template-columns:auto 1fr;gap:6px 14px}
.rs-anz dt{font-size:.8rem;font-weight:700;color:var(--faint,#7C7972)}
.rs-anz dd{font-size:.85rem;color:var(--body)}
.rs-wact{display:flex;gap:10px;margin-top:14px;flex-wrap:wrap}
.rs-ic2{width:36px;height:36px;flex:none;border:1px solid var(--line-2,#DEDBD3);border-radius:100px;background:var(--white);display:grid;place-items:center;color:var(--muted);cursor:pointer;transition:.15s}
.rs-ic2:hover{border-color:var(--faint-2,#9A968E);color:var(--ink)}
.rs-ic2.on{background:var(--wash);border-color:var(--yellow);color:var(--amber-ink)}
.rs-ic2:disabled{opacity:.5;cursor:not-allowed}
.rs-ic2 svg{width:15px;height:15px}

.rs-sortsel{position:relative;display:inline-flex;align-items:center}
/* text-indent (not padding-left) pushes the trigger's visible value past the
   "Sort:" prefix span. Padding-left stays small so <option> rows in the popup
   don't inherit a huge left gap — Chromium uses the select's padding-left as
   the option row's minimum indent, so any big value there re-appears in the
   popup no matter what padding we set on option. */
.rs-sortsel select{appearance:none;height:38px;padding:0 34px 0 14px;text-indent:30px;border:1px solid var(--line-2,#DEDBD3);border-radius:100px;background:var(--white);font-size:.83rem;font-weight:600;color:var(--ink);cursor:pointer}
.rs-sortsel option{text-indent:0}
.rs-sortsel svg{position:absolute;right:12px;width:15px;height:15px;color:var(--faint-2,#9A968E);pointer-events:none}
.rs-sortsel__pre{position:absolute;left:14px;font-size:.83rem;color:var(--faint-2,#9A968E);pointer-events:none;z-index:1}
.rs-sh__actions{display:inline-flex;align-items:center;gap:10px;flex-wrap:wrap}
.rs-runfilter{position:relative;display:inline-flex;align-items:center}
/* Same trick as .rs-sortsel: use text-indent to push the trigger value past
   the "Show:" prefix while keeping the popup options aligned normally. */
.rs-runfilter select{appearance:none;height:38px;padding:0 34px 0 14px;text-indent:32px;border:1px solid var(--line-2,#DEDBD3);border-radius:100px;background:var(--white);font-size:.83rem;font-weight:600;color:var(--ink);cursor:pointer}
.rs-runfilter option{text-indent:0}
.rs-runfilter svg{position:absolute;right:12px;width:15px;height:15px;color:var(--faint-2,#9A968E);pointer-events:none}
.rs-runfilter__pre{position:absolute;left:14px;font-size:.83rem;color:var(--faint-2,#9A968E);pointer-events:none;z-index:1}
.rs-runempty{padding:22px;border:1px dashed var(--line);border-radius:14px;background:var(--paper,rgba(250,249,246,.6));font-size:.85rem;color:var(--faint-2,#9A968E);text-align:center}
.rs-runempty__reset{border:0;background:transparent;color:var(--ink);font-weight:700;text-decoration:underline;cursor:pointer;padding:0;margin-left:4px}
.rs-ogrid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
/* Mobile: the "More outliers" header reflows into two controls under the
   title so the run filter remains easy to reach on smaller screens. */
@media (max-width: 640px){
  .rs-sh{display:grid;grid-template-columns:1fr 1fr;grid-template-areas:"title title" "filter sort";align-items:center;gap:10px 12px;margin:28px 0 14px}
  .rs-sh h2{grid-area:title;margin:0}
  .rs-sh .rs-note{grid-column:1 / -1;grid-row:3;margin:0}
  .rs-sh__actions{display:contents}
  .rs-runfilter{grid-area:filter;min-width:0}
  .rs-runfilter select{width:100%}
  .rs-sortsel{grid-area:sort;min-width:0}
  .rs-sortsel select{width:100%}
}
.rs-oc{background:var(--white);border:1px solid var(--line);border-radius:16px;overflow:hidden;display:flex;flex-direction:column}
.rs-oc:hover{border-color:var(--line-2,#DEDBD3)}
.rs-oc .rs-vf{border-radius:0}
.rs-oc__b{padding:12px 13px;display:flex;flex-direction:column;flex:1;gap:0}
.rs-oc__cr{display:flex;align-items:center;gap:8px}
.rs-oc__h{font-size:.82rem;font-weight:800;color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rs-oc__s{font-size:.7rem;color:var(--faint-2,#9A968E)}
.rs-oc__c{font-size:.8rem;color:var(--muted);line-height:1.4;margin-top:8px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.rs-oc__st{display:flex;justify-content:space-between;gap:6px;margin-top:11px}
.rs-oc__st span{display:inline-flex;align-items:center;gap:5px;font-size:.76rem;color:var(--faint-2,#9A968E);font-weight:600;font-variant-numeric:tabular-nums}
.rs-oc__st svg{width:13px;height:13px;color:var(--faint-2,#9A968E);flex:none}
.rs-oc__panel{margin-top:10px}
.rs-modalback{position:fixed;inset:0;z-index:130;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(20,15,0,.34);backdrop-filter:blur(3px)}
.rs-toast{position:fixed;right:18px;bottom:18px;z-index:140;display:flex;align-items:center;gap:12px;max-width:min(420px,calc(100vw - 32px));padding:14px 16px;border-radius:16px;border:1px solid var(--line);background:#fff;box-shadow:0 18px 40px rgba(42,33,20,.18)}
.rs-toast--success{border-color:#cfe8d4;background:#f6fff7}
.rs-toast--error{border-color:#f0d6c8;background:#fff8f4}
.rs-toast span{font-size:.88rem;font-weight:600;color:var(--ink);line-height:1.45}
.rs-toast button{width:28px;height:28px;flex:none;border:0;border-radius:999px;background:rgba(0,0,0,.05);color:var(--muted);font-size:1rem;cursor:pointer}
.rs-usage{width:min(100%,460px);border:1px solid #f2e4b8;border-radius:22px;padding:22px;background:linear-gradient(180deg,#fffdf7 0%,#fff8ea 100%);box-shadow:0 28px 90px rgba(42,33,20,.22)}
.rs-usage h3{margin-top:10px;font-size:1.15rem;font-weight:800;letter-spacing:-.03em;color:var(--ink)}
.rs-usage p{margin-top:8px;font-size:.9rem;line-height:1.55;color:var(--muted)}
.rs-usage b{color:var(--ink)}
.rs-usage__subject{margin-top:14px;padding:12px 14px;border:1px solid var(--line);border-radius:14px;background:rgba(255,255,255,.7);font-weight:700;color:var(--ink)}
.rs-upgmodal{position:relative;width:min(100%,420px);border:1px solid #f2e4b8;border-radius:22px;padding:22px;background:linear-gradient(180deg,#fffdf7 0%,#fff7e4 100%);box-shadow:0 28px 90px rgba(42,33,20,.22)}
.rs-upgmodal__close{position:absolute;top:12px;right:12px;width:34px;height:34px;border-radius:999px;border:1px solid var(--line);background:rgba(255,255,255,.8);display:grid;place-items:center;color:var(--muted);cursor:pointer}
.rs-upgmodal__close svg{width:14px;height:14px}
.rs-upg__eyebrow{display:inline-flex;align-items:center;gap:7px;font-size:.67rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--amber-ink)}
.rs-upg__eyebrow svg{width:12px;height:12px}
.rs-upgmodal h3{margin-top:10px;font-size:1.15rem;font-weight:800;letter-spacing:-.03em;color:var(--ink);max-width:14ch}
.rs-upgmodal p{margin-top:8px;font-size:.9rem;line-height:1.55;color:var(--muted)}
.rs-upgmodal__actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:18px}
.rs-upgmodal__actions .rs-btn{flex:1}
.rs-oc__an{margin-top:auto;padding-top:11px;display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:8px;align-items:center}
.rs-oc__an .rs-btn{min-width:0}
.rs-oc__an .rs-btn span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rs-oc__anLabel--mobile{display:none}
.rs-loadmore{display:flex;justify-content:center;margin-top:20px}

.rs-acard{background:linear-gradient(180deg,#FFFEFB 0%,#FFF8EB 100%);border:1px solid #F1E2BE;border-radius:20px;padding:20px 22px;box-shadow:0 18px 38px -30px rgba(117,85,11,.25);min-width:0;max-width:100%;overflow-x:hidden}
.rs-mtabs{display:inline-flex;gap:0;padding:2px;background:#F7F4ED;border:1px solid #DDD3C0;border-radius:9px;margin-bottom:14px;box-shadow:inset 0 1px 0 rgba(255,255,255,.8)}
.rs-mtab{height:24px;padding:0 12px;border-radius:7px;font-size:.72rem;font-weight:500;color:#6F6554;background:transparent;border:0;cursor:pointer;text-transform:lowercase}
.rs-mtab.on{background:#fff;color:#1A1400;box-shadow:0 1px 2px rgba(26,20,0,.08)}
.rs-abig{display:flex;align-items:flex-end;gap:12px}
.rs-abig__v{font-size:2.2rem;font-weight:900;letter-spacing:-.05em;color:var(--ink);line-height:.9;font-variant-numeric:tabular-nums}
.rs-abig__l{font-size:.85rem;color:#8A7445;padding-bottom:4px}
.rs-abig--flow{align-items:center;gap:10px;margin-bottom:14px}
.rs-abig__delta{display:inline-flex;align-items:center;gap:6px;font-size:.84rem;font-weight:700;color:#2D8A55;padding-top:6px;white-space:nowrap}
.rs-abig__info{position:relative;display:inline-flex;align-items:center}
.rs-abig__infoBtn{width:16px;height:16px;display:grid;place-items:center;border-radius:999px;border:1px solid rgba(45,138,85,.28);background:#fff;color:#2D8A55;font-size:.68rem;font-weight:800;line-height:1;cursor:help}
.rs-abig__tooltip{position:absolute;left:22px;top:50%;transform:translateY(-50%);width:min(260px,calc(100vw - 80px));padding:8px 10px;border-radius:10px;background:rgba(255,255,255,.98);border:1px solid #D8E8DC;box-shadow:0 16px 30px -24px rgba(0,0,0,.25);font-size:.72rem;font-weight:500;line-height:1.4;color:#34513F;opacity:0;pointer-events:none;transition:opacity .14s ease;white-space:normal;z-index:4}
.rs-abig__info:hover .rs-abig__tooltip,.rs-abig__info:focus-within .rs-abig__tooltip{opacity:1}
.rs-achart{position:relative;height:180px;margin-top:2px}
.rs-achart--flow{border:none;background:transparent;box-shadow:none;padding:0}
.rs-achart__inner{position:relative;height:150px}
.rs-achart--flow svg{position:absolute;inset:0;width:100%;height:100%}
.rs-achart__grid span{position:absolute;left:0;right:0;height:1px;background:rgba(168,119,0,.08)}
.rs-achart__point{position:absolute;width:11px;height:11px;border-radius:999px;border:1.5px solid #fff;background:#A87700;box-shadow:0 4px 10px rgba(168,119,0,.12);transform:translate(-50%,-50%);cursor:pointer;transition:transform .14s,box-shadow .14s,background .14s}
.rs-achart__point:hover,.rs-achart__point:focus-visible{transform:translate(-50%,-50%) scale(1.14);box-shadow:0 10px 20px rgba(168,119,0,.24);outline:none}
.rs-achart__point.is-latest{background:#C7981A}
.rs-achart__tooltip{position:absolute;left:0;top:0;display:flex;flex-direction:column;gap:2px;max-width:190px;padding:10px 12px;border-radius:12px;background:rgba(255,255,255,.98);border:1px solid #E7D7AF;box-shadow:0 16px 30px -24px rgba(0,0,0,.25);z-index:3}
.rs-achart__tooltip strong{font-size:.78rem;color:var(--ink)}
.rs-achart__tooltip span{font-size:.72rem;color:#7C704D}
.rs-axlabels{display:flex;justify-content:space-between;gap:12px;margin-top:8px;font-size:.68rem;color:#8A7445;font-weight:500}
.rs-axlabels--flow{padding-top:2px}
.rs-axlabels__start{text-align:left}
.rs-axlabels__center{text-align:center;flex:1}
.rs-axlabels__end{text-align:right}
.rs-weekmodal{width:min(100%,760px);max-height:min(80vh,720px);display:flex;flex-direction:column;border-radius:22px;background:#fffdf8;border:1px solid #F1E2BE;box-shadow:0 28px 60px rgba(58,44,14,.18);overflow:hidden}
.rs-weekmodal__head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding:20px 22px;border-bottom:1px solid #F1E2BE;background:linear-gradient(180deg,#FFFDF6 0%,#FFF8EA 100%)}
.rs-weekmodal__head h3{font-size:1.05rem;font-weight:800;letter-spacing:-.03em;color:var(--ink)}
.rs-weekmodal__head p{margin-top:4px;font-size:.84rem;color:#7C704D}
.rs-weekmodal__close{width:34px;height:34px;flex:none;border-radius:999px;border:1px solid #E8D9B3;background:#fff;color:#8A7445;font-size:1.1rem;cursor:pointer}
.rs-weekmodal__list{padding:14px;overflow:auto;display:flex;flex-direction:column;gap:10px}
.rs-weekmodal__row{display:grid;grid-template-columns:76px 1fr;gap:14px;align-items:center;padding:10px;border-radius:16px;border:1px solid #EFE3C6;background:#fff;cursor:pointer;text-align:left}
.rs-weekmodal__row:hover{border-color:#E3C36F;background:#FFF9EC}
.rs-weekmodal__thumb{width:76px;height:76px;border-radius:14px;overflow:hidden;display:grid;place-items:center;color:#fff;font-size:1rem;font-weight:800}
.rs-weekmodal__thumb img{width:100%;height:100%;object-fit:cover}
.rs-weekmodal__body{display:flex;flex-direction:column;gap:5px;min-width:0}
.rs-weekmodal__body strong{font-size:.88rem;color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rs-weekmodal__body span{font-size:.78rem;color:#7C704D;line-height:1.4}
.rs-weekmodal__empty{padding:24px 12px;text-align:center;font-size:.85rem;color:#7C704D}

.rs-heat{background:var(--white);border:1px solid var(--line);border-radius:20px;padding:20px;min-width:0;max-width:100%;overflow:hidden}
.rs-heatscroll{overflow-x:auto;padding-bottom:6px}
.rs-heatgrid{display:grid;grid-template-columns:34px repeat(24,1fr);gap:3px;min-width:620px}
.rs-hh{font-size:.66rem;color:var(--faint-2,#9A968E);font-weight:700;display:flex;align-items:center}
.rs-hlabel{grid-column:1/2;font-size:.72rem;color:var(--muted);font-weight:700;display:flex;align-items:center;height:20px}
.rs-hcell{height:20px;border-radius:4px;background:var(--paper)}
.rs-hcell.has-posts{cursor:help}
.rs-heat-tooltip{position:fixed;z-index:60;pointer-events:none;padding:6px 9px;border-radius:7px;background:#1F1D1A;color:#fff;font-size:.7rem;font-weight:700;white-space:nowrap;box-shadow:0 4px 12px rgba(0,0,0,.2)}
.rs-hlegend{display:flex;align-items:center;gap:6px;margin-top:14px;font-size:.72rem;color:var(--faint-2,#9A968E);font-weight:600}
.rs-hlegend span{width:16px;height:12px;border-radius:3px}
.rs-insightbox{display:flex;gap:11px;margin-top:16px;padding:14px 16px;background:var(--wash);border:1px solid #F2E4B8;border-radius:16px}
.rs-insightbox svg{width:18px;height:18px;color:var(--amber-ink);flex:none;margin-top:1px}
.rs-insightbox p{font-size:.86rem;color:var(--body);line-height:1.5}
.rs-insightbox b{color:var(--ink);font-weight:800}

.rs-two{display:grid;grid-template-columns:1fr 1fr;gap:14px;min-width:0;max-width:100%}
.rs-dcard{background:var(--white);border:1px solid var(--line);border-radius:20px;padding:20px;min-width:0;max-width:100%;overflow:hidden}
.rs-dcard h3{font-size:.95rem;font-weight:800;color:var(--ink);letter-spacing:-.028em}
.rs-sub{font-size:.78rem;color:var(--faint-2,#9A968E);margin-top:2px}
.rs-owk{display:flex;align-items:flex-end;gap:12px;height:120px;margin-top:20px}
.rs-owk__col{flex:1;display:flex;flex-direction:column;align-items:center;gap:7px;height:100%;justify-content:flex-end}
.rs-owk__bar{width:100%;max-width:34px;border-radius:7px 7px 0 0;background:var(--a2);transition:.2s}
.rs-owk__col.peak .rs-owk__bar{background:var(--yellow)}
.rs-owk__v{font-size:.78rem;font-weight:800;color:var(--ink)}
.rs-owk__x{font-size:.7rem;color:var(--faint-2,#9A968E);font-weight:600}
.rs-dist{display:flex;flex-direction:column;gap:11px;margin-top:18px}
.rs-drow{display:grid;grid-template-columns:52px 1fr 30px;align-items:center;gap:12px}
.rs-drow__lbl{font-size:.8rem;font-weight:700;color:var(--muted)}
.rs-drow__track{height:10px;border-radius:100px;background:var(--paper);overflow:hidden}
.rs-drow__fill{height:100%;border-radius:100px;display:block}
.rs-drow__c{font-size:.82rem;font-weight:800;color:var(--ink);text-align:right;font-variant-numeric:tabular-nums}

.rs-scrollp{position:relative;background:var(--white);border:1px solid var(--line);border-radius:20px;overflow:hidden;min-width:0;max-width:100%}
.rs-scrollp__hd{display:flex;align-items:center;justify-content:space-between;padding:16px 20px 10px}
.rs-scrollp__hd h3{font-size:.95rem;font-weight:800;color:var(--ink)}
.rs-scrollp__cnt{font-size:.75rem;color:var(--faint-2,#9A968E);font-weight:600}
.rs-scrollp__list{max-height:232px;overflow-y:auto;padding:2px 20px 20px;scrollbar-width:thin;scrollbar-color:var(--line-2) transparent}
.rs-scrollp__list::-webkit-scrollbar{width:7px}
.rs-scrollp__list::-webkit-scrollbar-thumb{background:var(--line-2,#DEDBD3);border-radius:100px;border:2px solid var(--white)}
.rs-hrow{display:grid;grid-template-columns:1fr 74px 30px;align-items:center;gap:12px;padding:9px 0;border-top:1px solid var(--line);color:inherit;text-decoration:none;transition:.14s}
.rs-hrow:first-child{border-top:none}
.rs-hrow:hover{background:var(--paper);border-radius:8px;padding-left:6px;padding-right:6px}
.rs-hrow__n{display:flex;align-items:center;gap:8px;font-size:.86rem;font-weight:700;color:var(--ink);min-width:0}
.rs-hrow__n svg:first-child{width:15px;height:15px;color:var(--faint-2,#9A968E);flex:none}
.rs-hrow__n span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rs-hrow__n svg:last-child{width:12px;height:12px;color:var(--faint-2,#9A968E);flex:none;opacity:0;transition:.14s}
.rs-hrow:hover .rs-hrow__n svg:last-child{opacity:1}
.rs-hrow__bar{height:8px;border-radius:100px;background:var(--paper);overflow:hidden}
.rs-hrow__bar i{display:block;height:100%;border-radius:100px;background:var(--a3)}
.rs-hrow__c{font-size:.82rem;font-weight:800;color:var(--muted);text-align:right;font-variant-numeric:tabular-nums}
.rs-scrollp__fade{position:absolute;left:0;right:0;bottom:0;height:48px;background:linear-gradient(transparent,var(--white));pointer-events:none;display:flex;align-items:flex-end;justify-content:center;padding-bottom:8px;transition:opacity .2s}
.rs-scrollp__fade span{display:inline-flex;align-items:center;gap:5px;font-size:.72rem;font-weight:700;color:var(--faint,#7C7972);background:var(--white);border:1px solid var(--line);border-radius:100px;padding:3px 10px}
.rs-scrollp.is-end .rs-scrollp__fade{opacity:0}

@media (max-width:1080px){.rs-ogrid{grid-template-columns:repeat(2,1fr)}}
@media (max-width:900px){
  .rs-stats{grid-template-columns:1fr 1fr}
  .rs-stt:nth-child(2){border-right:none}
  .rs-stt:nth-child(1),.rs-stt:nth-child(2){border-bottom:1px solid var(--line)}
  .rs-winner{grid-template-columns:1fr}.rs-vf--big{max-width:240px;margin:0 auto}
  .rs-two{grid-template-columns:1fr}
  .rs-bhead{align-items:flex-start}
}
@media (max-width:560px){
.rs-mobileonly{display:flex}
.rs-desktoponly{display:none}
.rs-ogrid{grid-template-columns:1fr 1fr}
.rs-viewbar{margin-bottom:12px}
.rs-viewbar__actions{gap:6px}
.rs-bhead{padding:12px 13px;border-radius:15px;gap:10px}
.rs-bhead__l{width:42px;height:42px;border-radius:12px;font-size:.88rem}
.rs-h1{font-size:1.15rem;line-height:1.05}
.rs-bmeta{margin-top:5px;gap:6px;font-size:.72rem}
.rs-bbadge{padding:4px 8px}
.rs-bsub{margin-top:6px;gap:6px;font-size:.7rem}
.rs-bline{gap:5px}
.rs-bline span+span::before{margin-right:5px}
.rs-state{padding:3px 8px;font-size:.68rem}
.rs-iconbtn{width:36px;height:36px;border-radius:10px}
.rs-iconbtn svg{width:15px;height:15px}
.rs-ai{margin-top:14px;padding:14px 14px 13px;border-radius:14px}
.rs-ai__h{margin-bottom:0}
.rs-ai__h svg{width:16px;height:16px}
.rs-ai__t{font-size:.65rem}
.rs-ai__when{font-size:.68rem}
.rs-ai--mobile .rs-ai__hint{margin-top:6px}
.rs-ai--mobile:not(.is-collapsed) .rs-ai__hint{margin-bottom:10px}
.rs-ai__list{gap:6px}
.rs-ai__list li{padding-left:16px;font-size:.82rem;line-height:1.38}
.rs-ai__list li::before{left:2px;top:8px;width:5px;height:5px}
.rs-stats{margin-top:14px;border-radius:14px}
.rs-stt{padding:12px 12px 11px;gap:6px}
.rs-stt__k{font-size:.65rem}
.rs-stt__v{font-size:1.28rem}
.rs-stt__d{font-size:.67rem;line-height:1.25}
.rs-stt__d svg{width:10px;height:10px}
.rs-handle span:first-child{max-width:120px}
.rs-oc__st{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}
.rs-oc__st span{min-width:0;justify-content:center;font-size:.72rem;gap:4px}
.rs-oc__st svg{width:12px;height:12px}
.rs-oc__an{gap:6px}
.rs-oc__an .rs-btn{padding:0 12px;font-size:.78rem}
.rs-oc__an .rs-btn svg{width:13px;height:13px}
.rs-oc__anIcon{display:none}
.rs-oc__anLabel--desktop{display:none}
.rs-oc__anLabel--mobile{display:inline}
.rs-ic2{width:34px;height:34px}
.rs-upgmodal{padding:20px 16px 16px}
.rs-upgmodal h3{font-size:1.02rem;max-width:none}
.rs-upgmodal p{font-size:.84rem}
.rs-upgmodal__actions .rs-btn{width:100%}
}
@media (max-width:420px){
.rs-ogrid{grid-template-columns:1fr}
}
`;
