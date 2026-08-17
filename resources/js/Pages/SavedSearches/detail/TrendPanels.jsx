import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { compactNumber, percent } from '../../../landing/flow/format.js';
import { Bookmark, Share, Check, Dots } from '../../../landing/components/Icons.jsx';

const W = 560;
const H = 180;
const PAD = 10;

function formatValue(value, format) {
  if (value === null || value === undefined) return '—';
  if (format === 'compact') return compactNumber(value);
  if (format === 'percent') return percent(value) ?? '—';
  return String(value);
}

function formatRunDate(iso) {
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? null
    : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function buildDelta(latest, previous, unit) {
  if (latest === null || latest === undefined || previous === null || previous === undefined) return null;

  const value = unit === 'points'
    ? Math.round((latest - previous) * 100) / 100
    : previous === 0
      ? null
      : Math.round((((latest - previous) / previous) * 100) * 10) / 10;

  if (value === null || Number.isNaN(value)) return null;

  return {
    value,
    unit,
    direction: value > 0 ? 'up' : value < 0 ? 'down' : 'flat',
  };
}

function deltaLabel(delta) {
  if (!delta) return 'No comparison yet';
  const prefix = delta.direction === 'up' ? '↑' : delta.direction === 'down' ? '↓' : '→';
  const suffix = delta.unit === 'points' ? ' pts' : '%';
  return `${prefix} ${Math.abs(delta.value)}${suffix}`;
}

function runLabel(index) {
  return `Refresh ${index + 1}`;
}

function runCountLabel(count) {
  return `${count} completed ${count === 1 ? 'run' : 'runs'}`;
}

function toPoints(values) {
  if (!values || values.length < 2) return [];

  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min;

  return values.map((v, i) => {
    const x = (i / (values.length - 1)) * W;
    const y = range === 0 ? H / 2 : H - PAD - ((v - min) / range) * (H - 2 * PAD);
    return [x, y];
  });
}

function fallbackSnapshotFromTrend(trend) {
  if (!trend?.metrics) return null;

  return {
    views: trend.metrics.views?.current ?? null,
    posts: trend.metrics.posts?.current ?? null,
    engagement: trend.metrics.engagement?.current ?? null,
    engagement_rate: trend.metrics.rate?.current ?? null,
  };
}

export function PerformanceChart({ trend, runs = [], frequency = 'weekly' }) {
  const [metric, setMetric] = useState('views');

  const series = trend?.metrics?.[metric];
  const latestRunId = runs[runs.length - 1]?.id ?? null;
  const trendFallbackSnapshot = fallbackSnapshotFromTrend(trend);
  const completedRuns = runs
    .map((run) => {
      if (run?.snapshot) return run;
      if (run?.id !== latestRunId || !trendFallbackSnapshot) return run;

      return {
        ...run,
        snapshot: {
          ...trendFallbackSnapshot,
          captured_at: run?.completed_at ?? null,
          is_fallback: true,
        },
      };
    })
    .filter((run) => run?.snapshot);

  if (!series || completedRuns.length === 0) {
    return (
      <div className="panel">
        <p className="empty">Not enough history to plot yet.</p>
      </div>
    );
  }

  const latestRun = completedRuns[completedRuns.length - 1];
  const previousRun = completedRuns.length > 1 ? completedRuns[completedRuns.length - 2] : null;
  const baselineRun = completedRuns[0];
  const metricKey = series.format === 'percent' ? 'engagement_rate' : metric;
  const deltaUnit = series.format === 'percent' ? 'points' : 'percent';
  const currentValue = latestRun?.snapshot?.[metricKey] ?? series.current;
  const previousDelta = previousRun ? buildDelta(currentValue, previousRun?.snapshot?.[metricKey], deltaUnit) : null;
  const values = completedRuns.map((run) => Number(run?.snapshot?.[metricKey]) || 0);
  const coords = toPoints(values);
  const line = coords.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = line ? `${line} ${W},${H} 0,${H}` : '';
  const lastPoint = coords[coords.length - 1] ?? null;
  const latestRunDate = formatRunDate(latestRun?.completed_at);
  const baselineRunDate = formatRunDate(baselineRun?.completed_at);

  const axisLabels = completedRuns.length === 1
    ? [{ label: runLabel(0), align: 'start' }, { label: 'latest', align: 'end' }]
    : completedRuns.map((run, index) => ({
        label:
          index === 0
            ? runLabel(0)
            : index === completedRuns.length - 1
              ? 'latest'
              : completedRuns.length <= 4 || index === Math.floor((completedRuns.length - 1) / 2)
                ? runLabel(index)
                : '',
        align: index === 0 ? 'start' : index === completedRuns.length - 1 ? 'end' : 'center',
      }));

  return (
    <div className="panel">
      <div className="ts-tabs">
        {Object.entries(trend.metrics).map(([key, definition]) => (
          <button key={key} className={metric === key ? 'on' : ''} onClick={() => setMetric(key)}>
            {definition.label}
          </button>
        ))}
      </div>

      <div className="ts-head">
        <span className="ts-val">{formatValue(currentValue, series.format)}</span>
      </div>

      <div className="ts-legend">
        <span className="ts-chip ts-chip--neutral">
          <i />
          {runCountLabel(completedRuns.length)}
        </span>
        <span className="ts-chip ts-chip--neutral">
          <i />
          Latest run{latestRunDate ? ` • ${latestRunDate}` : ''}
        </span>
        {previousDelta ? (
          <span className={`ts-chip ts-chip--${previousDelta.direction}`}>
            <i />
            {deltaLabel(previousDelta)} vs previous run
          </span>
        ) : (
          <span className="ts-chip ts-chip--neutral">
            <i />
            Baseline run only
          </span>
        )}
      </div>

      {coords.length >= 2 ? (
        <svg className="ts-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id="tsfill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--violet)" stopOpacity=".2" />
              <stop offset="1" stopColor="var(--violet)" stopOpacity="0" />
            </linearGradient>
          </defs>

          <polygon points={area} fill="url(#tsfill)" />
          <polyline
            points={line}
            fill="none"
            stroke="var(--violet)"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {lastPoint && (
            <circle cx={lastPoint[0]} cy={lastPoint[1]} r="4.5" fill="var(--violet)" stroke="#fff" strokeWidth="2" />
          )}
        </svg>
      ) : (
        <div className="ts-emptycta">
          <strong>{runLabel(0)} is your baseline.</strong>
          <span>Come back next {frequency === 'monthly' ? 'month' : 'week'} to unlock comparison against the next refresh.</span>
        </div>
      )}

      <div className="ts-x">
        {axisLabels.map((item, index) => (
          <span key={`${item.label || 'tick'}-${index}`} className={`ts-x--${item.align}`}>
            {item.label}
          </span>
        ))}
      </div>

      <div className="ts-foot">
        <div className="ts-mini">
          <span className="ts-mini__label">Baseline</span>
          <strong>{runLabel(0)}</strong>
          <span>{baselineRunDate ?? 'First completed run'}</span>
        </div>
        <div className="ts-mini">
          <span className="ts-mini__label">Latest</span>
          <strong>{runLabel(completedRuns.length - 1)}</strong>
          <span>{latestRunDate ?? 'Most recent completed run'}</span>
        </div>
        {completedRuns.some((run) => run?.snapshot?.is_fallback) && (
          <div className="ts-mini ts-mini--note">
            <span className="ts-mini__label">Note</span>
            <span>Latest run is using current saved-search metrics because a snapshot record is missing.</span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Page head: logo, title, handles row, actions. The handle can come from a
 * brand-level OpenAI lookup, while avatar and follower count only render when
 * the matched videos happened to include that same account.
 */
export function TrackerHead({
  search,
  account,
  lastRun,
  nextRun,
  onExportPdf,
  onToggleWatchlist,
  onShare,
  onTogglePause,
  onDelete,
  copied,
  watchlistUpdating,
}) {
  const initial = (search?.name ?? '?').slice(0, 1).toUpperCase();
  const paused = search?.status === 'paused';

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onDown = (e) => menuRef.current && !menuRef.current.contains(e.target) && setMenuOpen(false);
    const onEsc = (e) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onEsc);
    };
  }, [menuOpen]);

  // null | 'pause' | 'delete' — the pending action awaiting confirmation.
  const [confirm, setConfirm] = useState(null);

  const openPause = () => {
    setMenuOpen(false);
    // Resuming is harmless, so it acts immediately; pausing asks first.
    if (paused) onTogglePause?.();
    else setConfirm('pause');
  };

  const openDelete = () => {
    setMenuOpen(false);
    setConfirm('delete');
  };

  const runConfirm = () => {
    const action = confirm;
    setConfirm(null);
    if (action === 'pause') onTogglePause?.();
    else if (action === 'delete') onDelete?.();
  };

  const meta = [
    `checked ${search?.frequency ?? 'weekly'}`,
    lastRun && `last run ${lastRun}`,
    search?.status === 'paused' ? 'paused' : nextRun && `next refresh ${nextRun}`,
  ]
    .filter(Boolean)
    .join(' · ');

  const confirmCopy =
    confirm === 'pause'
      ? {
          title: 'Pause Tracking?',
          body: `We’ll stop refreshing “${search?.name}” until you resume it. The results you’ve already collected stay available.`,
          cta: 'Pause Tracking',
          danger: false,
        }
      : {
          title: 'Delete Tracking?',
          body: `This removes “${search?.name}” and stops all future runs. This can’t be undone.`,
          cta: 'Delete Tracking',
          danger: true,
        };

  return (
    <>
      <header>
      <div className="brandrow">
        <span className="logo" title="brand logo">
          {account?.avatar ? <img src={account.avatar} alt="" referrerPolicy="no-referrer" /> : initial}
        </span>

        <div className="titlewrap">
          <h1>{search?.name ?? 'Tracker'}</h1>

          <div className="handles">
            <span className="badge">{search?.search_type ?? 'brand'}</span>

            {account?.handle && <span className="h">{account.handle}</span>}

            {account?.followers > 0 && (
              <>
                <span className="sep" />
                <span>{compactNumber(account.followers)} followers</span>
              </>
            )}

            <span className="sep" />
            <span>{meta}</span>
          </div>
        </div>

        <div className="head-actions">
          {onExportPdf && (
            <button
              className="tbtn"
              onClick={onExportPdf}
              title="Export PDF"
              aria-label="Export PDF"
            >
              Export PDF
            </button>
          )}
          {onToggleWatchlist && (
            <button
              className={`tbtn tbtn-ic${search?.is_watchlisted ? ' is-saved' : ''}`}
              onClick={onToggleWatchlist}
              disabled={watchlistUpdating}
              aria-pressed={Boolean(search?.is_watchlisted)}
              title={search?.is_watchlisted ? 'Bookmarked' : 'Add bookmark'}
              aria-label={search?.is_watchlisted ? 'Bookmarked' : 'Add bookmark'}
            >
              <Bookmark className="h-4 w-4" filled={Boolean(search?.is_watchlisted)} />
            </button>
          )}
          <button
            className="tbtn tbtn-ic"
            onClick={onShare}
            title={copied ? 'Link copied' : 'Share'}
            aria-label={copied ? 'Link copied' : 'Share'}
          >
            {copied ? <Check className="h-4 w-4" /> : <Share className="h-4 w-4" />}
          </button>

          {(onTogglePause || onDelete) && (
            <span className="tk-menu" ref={menuRef}>
              <button
                className="tbtn tbtn-ic"
                onClick={() => setMenuOpen((open) => !open)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                title="More actions"
                aria-label="More actions"
              >
                <Dots className="h-4 w-4" />
              </button>
              {menuOpen && (
                <div className="menu" role="menu">
                  {onTogglePause && (
                    <button type="button" role="menuitem" onClick={openPause}>
                      {paused ? 'Resume Tracking' : 'Pause Tracking'}
                    </button>
                  )}
                  {onDelete && (
                    <button type="button" role="menuitem" className="danger" onClick={openDelete}>
                      Delete Tracking
                    </button>
                  )}
                </div>
              )}
            </span>
          )}
        </div>
      </div>
      </header>

      {confirm &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="bb">
            <div className="bb-modal">
              <button className="bb-modal__bg" aria-label="Cancel" onClick={() => setConfirm(null)} />
              <div className="bb-modal__box">
                <h2 style={confirmCopy.danger ? { color: 'var(--warn)' } : undefined}>{confirmCopy.title}</h2>
                <p className="sub">{confirmCopy.body}</p>
                <div className="actrow__r" style={{ marginTop: 24, justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn--g" onClick={() => setConfirm(null)}>
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn--y"
                    style={confirmCopy.danger ? { color: 'var(--warn)', borderColor: '#F0D6C8', background: 'var(--warn-bg)', boxShadow: 'none' } : undefined}
                    onClick={runConfirm}
                  >
                    {confirmCopy.cta}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

/**
 * The one-line read. Absent until the enrichment job has run, which is correct
 * on a brand new search — it never renders a placeholder sentence.
 */
export function AiSummary({ summary, generatedAt }) {
  if (!summary) return null;

  const when = generatedAt ? new Date(generatedAt) : null;

  // The mockup bolds the opening take and leaves the detail regular. The
  // model writes plain prose, so the first sentence is the take.
  const breakAt = summary.search(/[.!?](\s|$)/);
  const lead = breakAt >= 0 ? summary.slice(0, breakAt + 1) : summary;
  const tail = breakAt >= 0 ? summary.slice(breakAt + 1) : '';

  return (
    <div className="ai">
      <svg className="spark" viewBox="0 0 24 24" aria-hidden>
        <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z" />
      </svg>
      <div className="txt">
        <b>{lead}</b>
        {tail}
      </div>
      {when && !Number.isNaN(when.getTime()) && (
        <span className="when">{when.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
      )}
    </div>
  );
}
