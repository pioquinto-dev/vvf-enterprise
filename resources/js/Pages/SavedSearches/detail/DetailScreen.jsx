import { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';

import { bookmarks, videoAnalysis } from '../../../landing/flow/api.js';
import EntitlementsBar from '../../components/EntitlementsBar.jsx';
import { OutlierCard, WinnerVideo } from './OutlierVideos.jsx';
import AnalysisModal from '../../VideoAnalysis/AnalysisModal.jsx';
import {
  HashtagPanel,
  OutliersPerWeek,
  PostingHeatmap,
  ScoreDistribution,
  SignalTiles,
  SoundPanel,
} from './InsightPanels.jsx';
import { AiSummary, PerformanceChart, TrackerHead } from './TrendPanels.jsx';

const PAGE_STEP = 4;

function SectionHead({ title, note, small = false }) {
  return (
    <div className="sect-head">
      <h2 style={small ? { fontSize: '19px' } : undefined}>{title}</h2>
      {note && <span className="note">{note}</span>}
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? null
    : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function formatInsightDate(iso) {
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? null
    : date.toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
}

function numericUsageValue(value, fallback = 0) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (value && typeof value === 'object') {
    if (typeof value.used === 'number' && Number.isFinite(value.used)) return value.used;
    if (typeof value.limit === 'number' && Number.isFinite(value.limit)) return value.limit;
  }

  const coerced = Number(value);
  return Number.isFinite(coerced) ? coerced : fallback;
}

function usageRemainingLabel(limit, used) {
  return limit === -1 ? 'unlimited' : Math.max(0, limit - used - 1);
}

function actionErrorMessage(error, fallback) {
  return error?.payload?.errors?.billing?.[0]
    || error?.payload?.errors?.auth?.[0]
    || error?.message
    || fallback;
}

function buildAnalysisStates(results = []) {
  return Object.fromEntries(
    results
      .filter((video) => video?.id && video?.analysis)
      .map((video) => [
        video.id,
        {
          status: video.analysis.status ?? 'idle',
          error: video.analysis.error_message ?? null,
          analysis: video.analysis,
        },
      ])
  );
}

function mergeAnalysisIntoItems(items = [], videoId, payload) {
  return items.map((item) => (
    item.id === videoId
      ? {
          ...item,
          analysis: payload
            ? {
                ...(item.analysis ?? {}),
                ...payload,
              }
            : item.analysis ?? null,
        }
      : item
  ));
}

function AnalyzeConfirmModal({ video, creditsRemainingAfterUse = 0, busy = false, onConfirm, onCancel }) {
  if (!video) return null;

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-[rgba(38,33,28,0.42)] px-4 py-6 backdrop-blur-[2px]" onClick={onCancel}>
      <div
        className="w-full max-w-[430px] rounded-[24px] border border-[#d9d1c4] bg-[radial-gradient(circle_at_top,#f7f2e9_0%,#f3efe8_40%,#f1ede6_100%)] p-3 shadow-[0_28px_90px_rgba(42,33,20,0.22)]"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Confirm video analysis"
      >
        <div className="rounded-[20px] border border-[#ddd6ca] bg-[#fffdf9] p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fff0bf] text-[#8c6b10]">
            <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-current" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v5" />
              <path d="M12 16h.01" />
            </svg>
          </div>

          <h3 className="mt-4 text-[20px] font-semibold text-[#1a1a1a]">Analyze this video?</h3>
          <p className="mt-2 text-[14px] leading-6 text-[#696257]">
            Successful analysis will use 1 credit. You will have {creditsRemainingAfterUse} credits remaining after deduction.
          </p>
          <p className="mt-2 text-[13px] leading-6 text-[#7a7368]">
            This credit is not restored later, even if you delete the analysis result and run it again.
          </p>
          <p className="mt-2 truncate text-[12px] font-medium text-[#8c8579]">
            {video.handle ?? video.creator_name ?? video.title ?? 'Selected video'}
          </p>

          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={onConfirm}
              disabled={busy}
              className="inline-flex flex-1 items-center justify-center rounded-full bg-[#f2c44f] px-4 py-2.5 text-[12px] font-semibold text-[#4f3d08] transition hover:bg-[#e8bb48] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? 'Starting…' : 'Start analysis'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex flex-1 items-center justify-center rounded-full border border-[#ddd6ca] bg-white px-4 py-2.5 text-[12px] font-semibold text-[#5f584d] transition hover:bg-[#faf7f1]"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BookmarkConfirmModal({ video, creditsRemainingAfterUse = 0, busy = false, onConfirm, onCancel }) {
  if (!video) return null;

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-[rgba(38,33,28,0.42)] px-4 py-6 backdrop-blur-[2px]" onClick={onCancel}>
      <div
        className="w-full max-w-[430px] rounded-[24px] border border-[#d9d1c4] bg-[radial-gradient(circle_at_top,#f7f2e9_0%,#f3efe8_40%,#f1ede6_100%)] p-3 shadow-[0_28px_90px_rgba(42,33,20,0.22)]"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Confirm video bookmark"
      >
        <div className="rounded-[20px] border border-[#ddd6ca] bg-[#fffdf9] p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fff0bf] text-[#8c6b10]">
            <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-current" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 4h10a1 1 0 0 1 1 1v15l-6-3-6 3V5a1 1 0 0 1 1-1Z" />
            </svg>
          </div>

          <h3 className="mt-4 text-[20px] font-semibold text-[#1a1a1a]">Bookmark this video?</h3>
          <p className="mt-2 text-[14px] leading-6 text-[#696257]">
            This will use 1 bookmark credit. You&apos;ll have {creditsRemainingAfterUse} credits left.
          </p>
          <p className="mt-2 text-[13px] leading-6 text-[#7a7368]">
            This credit is not restored later, even if you remove the bookmark.
          </p>
          <p className="mt-2 truncate text-[12px] font-medium text-[#8c8579]">
            {video.handle ?? video.creator_name ?? video.title ?? 'Selected video'}
          </p>

          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={onConfirm}
              disabled={busy}
              className="inline-flex flex-1 items-center justify-center rounded-full bg-[#f2c44f] px-4 py-2.5 text-[12px] font-semibold text-[#4f3d08] transition hover:bg-[#e8bb48] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? 'Saving…' : 'Save bookmark'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex flex-1 items-center justify-center rounded-full border border-[#ddd6ca] bg-white px-4 py-2.5 text-[12px] font-semibold text-[#5f584d] transition hover:bg-[#faf7f1]"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DetailScreen({
  search,
  isAuthenticated = false,
  billing = null,
  onExportPdf,
  onToggleBookmark,
  onRefresh,
  onTogglePause,
  onDelete,
  refreshing = false,
  bookmarkUpdating = false,
}) {
  const [visible, setVisible] = useState(PAGE_STEP);
  const [copied, setCopied] = useState(false);
  const [bookmarkingId, setBookmarkingId] = useState(null);
  const [items, setItems] = useState(search?.results ?? []);
  const [activePlayerId, setActivePlayerId] = useState(null);
  const [analysisStates, setAnalysisStates] = useState(() => buildAnalysisStates(search?.results ?? []));
  const [analysisModal, setAnalysisModal] = useState(null);
  const [pendingAnalysisVideo, setPendingAnalysisVideo] = useState(null);
  const [pendingBookmarkVideo, setPendingBookmarkVideo] = useState(null);
  const sharedBilling = usePage().props?.billing ?? {};
  const billingState = billing ?? sharedBilling;
  const [videoBookmarkUsed, setVideoBookmarkUsed] = useState(() => numericUsageValue(billingState?.videoBookmarkCount, 0));

  const insights = search?.insights ?? {};
  const medianViews = insights.baseline?.median_views ?? 0;
  const threshold = insights.baseline?.outlier_threshold ?? 3;
  const account = insights.account ?? null;
  const trend = insights.trend ?? null;
  const profile = account?.profile ?? {};
  const lastPulledLabel = formatInsightDate(search?.last_run_at);
  const videoAnalysisLimit = numericUsageValue(billingState?.videoAnalysisLimit, 0);
  const videoAnalysisUsed = numericUsageValue(billingState?.videoAnalysisUsed, 0);
  const videoBookmarkLimit = numericUsageValue(billingState?.videoBookmarkLimit, 0);
  const analysisCreditsRemainingAfterUse = usageRemainingLabel(videoAnalysisLimit, videoAnalysisUsed);
  const bookmarkCreditsRemainingAfterUse = usageRemainingLabel(videoBookmarkLimit, videoBookmarkUsed);

  const feedItems = items;

  const [winner, ...rest] = feedItems;
  const shown = rest.slice(0, visible);
  const maxMultiple = Math.max(...feedItems.map((v) => Number(v.outlier_multiple) || 0), 1);

  const serverTile = (key) => (insights.tiles ?? []).find((t) => t.key === key) ?? {};
  const multiples = items.map((v) => Number(v.outlier_multiple) || 0).filter((m) => m > 0);
  const avgScore = multiples.length ? multiples.reduce((a, b) => a + b, 0) / multiples.length : null;
  const nowPoint = trend?.points?.[trend.points.length - 1] ?? null;

  const tiles = [
    account?.followers > 0
      ? {
          key: 'followers',
          label: 'followers',
          value: account.followers,
          format: 'compact',
          deltaNode:
            profile.follower_growth_pct != null ? (
              <div className={`d ${profile.follower_growth_pct >= 0 ? 'up' : 'down'}`}>
                {profile.follower_growth_pct >= 0 ? '↑' : '↓'} {Math.abs(profile.follower_growth_pct)}% mo
              </div>
            ) : (
              <div className="d" />
            ),
        }
      : { key: 'videos', label: 'videos matched', value: items.length, format: 'count' },
    {
      key: 'outliers',
      label: 'outliers this week',
      value: nowPoint ? nowPoint.outliers : (serverTile('outliers').value ?? null),
      format: 'count',
    },
    { ...serverTile('top_multiple'), label: 'top outlier score' },
    { key: 'avg_score', label: 'avg score', value: avgScore, format: 'multiple' },
    { ...serverTile('avg_engagement'), label: 'avg eng rate' },
  ];

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable - the URL is in the address bar anyway */
    }
  };

  useEffect(() => {
    setItems(search?.results ?? []);
    setAnalysisStates(buildAnalysisStates(search?.results ?? []));
  }, [search]);

  useEffect(() => {
    setVideoBookmarkUsed(numericUsageValue(billingState?.videoBookmarkCount, 0));
  }, [billingState?.videoBookmarkCount]);

  const applyAnalysisUpdate = (videoId, payload) => {
    if (!videoId) return;

    setAnalysisStates((current) => ({
      ...current,
      [videoId]: {
        status: payload?.status ?? current[videoId]?.status ?? 'idle',
        error: payload?.error_message ?? payload?.error ?? null,
        analysis: payload ?? current[videoId]?.analysis ?? null,
      },
    }));

    setItems((current) => mergeAnalysisIntoItems(current, videoId, payload));
  };

  const toggleBookmark = async (video) => {
    if (!isAuthenticated) {
      window.location.assign('/auth/google');
      return;
    }

    if (!video.bookmarked) {
      setPendingBookmarkVideo(video);
      return;
    }

    await commitBookmark(video, 'remove');
  };

  const commitBookmark = async (video, action) => {
    if (!isAuthenticated) {
      window.location.assign('/auth/google');
      return;
    }

    try {
      setBookmarkingId(video.id);
      const payload = action === 'remove'
        ? await bookmarks.remove(video.id)
        : await bookmarks.save(video.id);
      if (typeof payload?.bookmarkCount === 'number') {
        setVideoBookmarkUsed(payload.bookmarkCount);
      }
      setItems((current) =>
        current.map((item) => (item.id === video.id ? { ...item, bookmarked: payload.bookmarked } : item))
      );
    } catch (error) {
      if (error?.status === 422 || error?.status === 401) {
        window.alert(actionErrorMessage(error, 'Could not update the bookmark.'));
      }
    } finally {
      setBookmarkingId(null);
    }
  };

  const startAnalysis = async (video) => {
    if (!isAuthenticated) {
      window.location.assign('/auth/google');
      return;
    }

    const currentStatus = analysisStates[video.id]?.status ?? 'idle';

    if (currentStatus === 'complete') {
      setAnalysisModal({
        video,
        analysis: analysisStates[video.id]?.analysis ?? null,
      });
      return;
    }

    if (currentStatus === 'processing') {
      return;
    }

    try {
      applyAnalysisUpdate(video.id, { status: 'processing', error_message: null });

      const payload = await videoAnalysis.request(video.id);
      const nextStatus = payload?.analysis?.status ?? 'processing';
      applyAnalysisUpdate(video.id, {
        ...(payload?.analysis ?? {}),
        status: nextStatus,
      });
    } catch (error) {
      applyAnalysisUpdate(video.id, {
        status: 'failed',
        error_message: error?.message ?? 'Could not start video analysis.',
      });

      if (error?.status === 422 || error?.status === 401) {
        window.alert(actionErrorMessage(error, 'Could not start video analysis.'));
        return;
      }

      window.alert(error?.message || 'Could not start video analysis.');
    }
  };

  const analyze = async (video) => {
    if (!isAuthenticated) {
      window.location.assign('/auth/google');
      return;
    }

    const currentStatus = analysisStates[video.id]?.status ?? 'idle';

    if (currentStatus === 'complete') {
      setAnalysisModal({
        video,
        analysis: analysisStates[video.id]?.analysis ?? null,
      });
      return;
    }

    if (currentStatus === 'processing') {
      return;
    }

    setPendingAnalysisVideo(video);
  };

  const confirmAnalyze = async () => {
    if (!pendingAnalysisVideo) return;

    const video = pendingAnalysisVideo;
    applyAnalysisUpdate(video.id, { status: 'processing', error_message: null });
    setPendingAnalysisVideo(null);
    await startAnalysis(video);
  };

  useEffect(() => {
    const pendingIds = Object.entries(analysisStates)
      .filter(([, state]) => state?.status === 'processing')
      .map(([id]) => id);

    if (pendingIds.length === 0) {
      return undefined;
    }

    let cancelled = false;
    const timer = window.setInterval(async () => {
      const results = await Promise.all(
        pendingIds.map(async (id) => {
          try {
            const payload = await videoAnalysis.get(id);
            return [id, payload?.analysis ?? null];
          } catch {
            return [id, null];
          }
        })
      );

      if (cancelled) return;

      results.forEach(([id, analysis]) => {
        if (!analysis) return;
        applyAnalysisUpdate(id, analysis);
      });
    }, 2500);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [analysisStates]);

  const closeAnalysisModal = () => setAnalysisModal(null);

  // The modal reports its live analysis state (e.g. after a regenerate) so the
  // card CTA reflects "Analyzing Video…" / "View Analysis" without a reload.
  const handleModalAnalysisChange = (videoId, analysis) => {
    if (!videoId || !analysis) return;
    applyAnalysisUpdate(videoId, analysis);
  };

  return (
    <div className="tracker">
      <div className="viewbar">
        <a href="/bookmark" className="tbtn">
          ← Back to library
        </a>
        <EntitlementsBar />
      </div>

      <TrackerHead
        search={search}
        account={account}
        lastRun={formatDate(search?.last_run_at)}
        nextRun={formatDate(search?.next_run_at)}
        onExportPdf={onExportPdf}
        onToggleWatchlist={onToggleBookmark}
        onShare={share}
        onTogglePause={onTogglePause}
        onDelete={onDelete}
        copied={copied}
        watchlistUpdating={bookmarkUpdating}
      />

      <AiSummary summary={search?.ai_summary} generatedAt={search?.ai_summary_generated_at} />

      <SignalTiles tiles={tiles} deltas={insights.tile_deltas ?? {}} />

      {items.length === 0 ? (
        <div className="gate">
          <h2>No videos cleared the bar</h2>
          <p>
            We scanned TikTok for <b>{search?.phrase}</b> but nothing matched the phrase with a real creator behind
            it. Narrower phrases and brand names often do this - try a broader one, or run it again.
          </p>
          <div className="acts">
            <button className="tbtn primary" onClick={onRefresh} disabled={refreshing}>
              {refreshing ? 'refreshing...' : 'run it again'}
            </button>
          </div>
        </div>
      ) : !isAuthenticated ? (
        <div className="gate">
          <h2>Sign in to view the matched videos</h2>
          <p>
            We found {items.length} videos for this search. Continue with Google to unlock the winner, the ranked
            list, and outbound TikTok links.
          </p>
          <div className="acts">
            <a href="/auth/google" className="tbtn primary">
              continue with Google
            </a>
            {billing?.trialEligible ?? true ? (
              <a href="/trial" className="tbtn">
                start free trial
              </a>
            ) : (
              <button className="tbtn" disabled>
                trial unavailable
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          <SectionHead
            title="outlier videos"
            note="their posts that beat the search median. ranked by outlier score."
          />

          <WinnerVideo
            video={winner}
            onToggleBookmark={toggleBookmark}
            onAnalyze={analyze}
            bookmarking={bookmarkingId === winner?.id}
            analysisStatus={winner ? (analysisStates[winner.id]?.status ?? 'idle') : 'idle'}
            activePlayerId={activePlayerId}
            onPlay={setActivePlayerId}
            onClose={() => setActivePlayerId(null)}
          />

          {rest.length > 0 && (
            <>
              <div className="sect-head" style={{ marginTop: '34px' }}>
                <h2 style={{ fontSize: '19px' }}>more outliers</h2>
                <span className="note">{rest.length} more.</span>
              </div>

              <div className="feed">
                {shown.map((video, index) => (
                  <OutlierCard
                    key={video.id}
                    video={video}
                    rank={index + 2}
                    onToggleBookmark={toggleBookmark}
                    onAnalyze={analyze}
                    bookmarking={bookmarkingId === video.id}
                    analysisStatus={analysisStates[video.id]?.status ?? 'idle'}
                    activePlayerId={activePlayerId}
                    onPlay={setActivePlayerId}
                    onClose={() => setActivePlayerId(null)}
                  />
                ))}
              </div>

              <div className="loadmore">
                <button
                  className="tbtn"
                  disabled={visible >= rest.length}
                  onClick={() => setVisible((v) => v + PAGE_STEP)}
                >
                  {visible >= rest.length
                    ? 'no more this week'
                    : `load ${Math.min(PAGE_STEP, rest.length - visible)} more ↓`}
                </button>
              </div>
            </>
          )}

          <SectionHead title="hashtags & sounds they use" note="from the videos matched by this search." />
          <div className="hs">
            <HashtagPanel hashtags={insights.hashtags} />
            <SoundPanel sounds={insights.sounds} />
          </div>

          <SectionHead
            title={
              lastPulledLabel
                ? `based on the data from videos pulled last ${lastPulledLabel}`
                : 'based on the latest pulled videos'
            }
            note="this tracker, past 12 weeks."
          />
          <PerformanceChart trend={trend} />

          <SectionHead title="When they post" note="posting schedule by day and hour." />
          <PostingHeatmap heatmap={insights.heatmap} />

          <SectionHead title="More data" note="how the tracker is moving." />
          <div className="datagrid">
            <OutliersPerWeek
              bars={trend?.outliers_per_week ?? []}
              threshold={threshold}
              totalOutliers={(insights.distribution ?? []).reduce((sum, row) => sum + row.count, 0)}
              nextRunLabel={formatDate(search?.next_run_at)}
            />
            <ScoreDistribution distribution={insights.distribution ?? []} />
          </div>
        </>
      )}

      {analysisModal && (
        <AnalysisModal
          open
          video={analysisModal.video}
          initialAnalysis={analysisModal.analysis}
          onClose={closeAnalysisModal}
          onAnalysisChange={handleModalAnalysisChange}
        />
      )}

      {pendingAnalysisVideo && (
        <AnalyzeConfirmModal
          video={pendingAnalysisVideo}
          creditsRemainingAfterUse={analysisCreditsRemainingAfterUse}
          busy={false}
          onConfirm={confirmAnalyze}
          onCancel={() => setPendingAnalysisVideo(null)}
        />
      )}

      {pendingBookmarkVideo && (
        <BookmarkConfirmModal
          video={pendingBookmarkVideo}
          creditsRemainingAfterUse={bookmarkCreditsRemainingAfterUse}
          busy={bookmarkingId === pendingBookmarkVideo.id}
          onConfirm={async () => {
            const video = pendingBookmarkVideo;
            setPendingBookmarkVideo(null);
            await commitBookmark(video, 'save');
          }}
          onCancel={() => setPendingBookmarkVideo(null)}
        />
      )}
    </div>
  );
}
