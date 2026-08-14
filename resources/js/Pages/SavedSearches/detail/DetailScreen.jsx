import { useState } from 'react';

import { bookmarks } from '../../../landing/flow/api.js';
import { OutlierCard, WinnerVideo } from './OutlierVideos.jsx';
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

export default function DetailScreen({
  search,
  isAuthenticated = false,
  billing = null,
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

  const insights = search?.insights ?? {};
  const medianViews = insights.baseline?.median_views ?? 0;
  const threshold = insights.baseline?.outlier_threshold ?? 3;
  const account = insights.account ?? null;
  const trend = insights.trend ?? null;
  const profile = account?.profile ?? {};
  const lastPulledLabel = formatInsightDate(search?.last_run_at);

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

  const toggleBookmark = async (video) => {
    if (!isAuthenticated) {
      window.location.assign('/auth/google');
      return;
    }

    try {
      setBookmarkingId(video.id);
      const payload = video.bookmarked ? await bookmarks.remove(video.id) : await bookmarks.save(video.id);
      setItems((current) =>
        current.map((item) => (item.id === video.id ? { ...item, bookmarked: payload.bookmarked } : item))
      );
    } catch (error) {
      if (error?.status === 422 || error?.status === 401) {
        window.alert(error.payload?.errors?.billing?.[0] || error.payload?.errors?.auth?.[0] || error.message);
      }
    } finally {
      setBookmarkingId(null);
    }
  };

  // Placeholder until the per-video analysis feature is built.
  const analyze = () => window.alert('Video analysis is coming soon.');

  return (
    <div className="tracker">
      <div className="viewbar">
        <a href="/bookmark" className="tbtn">
          ← Back to library
        </a>
      </div>

      <TrackerHead
        search={search}
        account={account}
        lastRun={formatDate(search?.last_run_at)}
        nextRun={formatDate(search?.next_run_at)}
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

          <SectionHead title="when they post" note="posting schedule by day and hour." />
          <PostingHeatmap heatmap={insights.heatmap} />

          <SectionHead title="more data" note="how the tracker is moving." />
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
    </div>
  );
}
