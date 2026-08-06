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
import { SampleBadge } from './Badges.jsx';

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

/**
 * Detail view for brand and competitor searches — a direct port of the
 * `tracker-brand-detail` mockup, minus the reach and engagement channel table
 * which was omitted by request (it needs Reels and Meta Ads integrations that
 * do not exist).
 *
 * Everything on this page is one of three things, and the UI says which:
 *
 *  - Measured. Scraped videos and recorded snapshots.
 *  - Rebuilt (violet badge). Derived by bucketing videos on upload date, so a
 *    new search has a chart before 12 weeks of runs exist.
 *  - Sample (amber badge). Invented by PlaceholderProfileData because it needs
 *    a TikTok profile scrape that has not been built.
 */
export default function DetailScreen({
  search,
  isAuthenticated = false,
  onToggleWatchlist,
  onRefresh,
  onTogglePause,
  onDelete,
  refreshing = false,
  watchlistUpdating = false,
}) {
  const [visible, setVisible] = useState(PAGE_STEP);
  const [copied, setCopied] = useState(false);
  const [bookmarkingId, setBookmarkingId] = useState(null);
  const [items, setItems] = useState(search?.results ?? []);
  const [view, setView] = useState('outliers');

  const insights = search?.insights ?? {};
  const medianViews = insights.baseline?.median_views ?? 0;
  const threshold = insights.baseline?.outlier_threshold ?? 3;
  const account = insights.account ?? null;
  const trend = insights.trend ?? null;
  const profile = account?.profile ?? {};

  // "their content" narrows the feed to the detected brand account's own
  // posts. Everything else on the page still describes the full search.
  const brandHandle = account?.handle ? account.handle.toLowerCase() : null;
  const feedItems =
    view === 'their' && brandHandle
      ? items.filter((v) => (v.handle ?? '').toLowerCase() === brandHandle)
      : items;

  const [winner, ...rest] = feedItems;
  const shown = rest.slice(0, visible);
  const maxMultiple = Math.max(...feedItems.map((v) => Number(v.outlier_multiple) || 0), 1);

  // The mockup's tile row: followers, outliers this week, top outlier score,
  // avg score, avg eng rate. Assembled here because it mixes sources — the
  // account (followers), the trend (this week), and the whole result set.
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
          // Growth needs profile history that is not scraped — sample data.
          deltaNode:
            profile.follower_growth_pct != null ? (
              <div className={`d ${profile.follower_growth_pct >= 0 ? 'up' : 'down'}`}>
                {profile.follower_growth_pct >= 0 ? '↑' : '↓'} {Math.abs(profile.follower_growth_pct)}% mo{' '}
                <SampleBadge />
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
      /* clipboard unavailable — the URL is in the address bar anyway */
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

  return (
    <div className="tracker">
      <div className="viewbar">
        <a href="/saved-searches" className="back">
          ← all trackers
        </a>
        <span className="spring" />
        <div className="viewswitch">
          <button className={view === 'outliers' ? 'on' : ''} onClick={() => setView('outliers')}>
            outliers
          </button>
          <button
            className={view === 'their' ? 'on' : ''}
            onClick={() => setView('their')}
            disabled={!brandHandle}
            title={
              brandHandle
                ? `Only posts by ${account.handle}`
                : 'No brand account detected in the results yet'
            }
          >
            their content
          </button>
        </div>
      </div>

      <TrackerHead
        search={search}
        account={account}
        lastRun={formatDate(search?.last_run_at)}
        onToggleWatchlist={onToggleWatchlist}
        onShare={share}
        copied={copied}
        watchlistUpdating={watchlistUpdating}
      />

      <AiSummary summary={search?.ai_summary} generatedAt={search?.ai_summary_generated_at} />

      <SignalTiles tiles={tiles} deltas={insights.tile_deltas ?? {}} />

      {items.length === 0 ? (
        <div className="gate">
          <h2>No videos cleared the bar</h2>
          <p>
            We scanned TikTok for <b>{search?.phrase}</b> but nothing matched the phrase with a real creator behind
            it. Narrower phrases and brand names often do this — try a broader one, or run it again.
          </p>
          <div className="acts">
            <button className="tbtn primary" onClick={onRefresh} disabled={refreshing}>
              {refreshing ? 'refreshing…' : 'run it again'}
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
            <a href="/trial" className="tbtn">
              start free trial
            </a>
          </div>
        </div>
      ) : (
        <>
          <SectionHead
            title={view === 'their' ? 'their content' : 'outlier videos'}
            note={
              view === 'their'
                ? `${account?.handle}'s own posts in this search. ranked by outlier score.`
                : 'their posts that beat the search median. ranked by outlier score.'
            }
          />

          {feedItems.length === 0 ? (
            <div className="panel">
              <p className="empty">
                None of the matched videos were posted by {account?.handle}. The outliers view still has all{' '}
                {items.length}.
              </p>
            </div>
          ) : null}

          <WinnerVideo
            video={winner}
            medianViews={medianViews}
            max={maxMultiple}
            onToggleBookmark={toggleBookmark}
            bookmarking={bookmarkingId === winner?.id}
          />

          {rest.length > 0 && (
            <>
              <div className="sect-head" style={{ marginTop: '34px' }}>
                <h2 style={{ fontSize: '19px' }}>{view === 'their' ? 'more of their posts' : 'more outliers'}</h2>
                <span className="note">{rest.length} more.</span>
              </div>

              <div className="feed">
                {shown.map((video, index) => (
                  <OutlierCard
                    key={video.id}
                    video={video}
                    rank={index + 2}
                    medianViews={medianViews}
                    max={maxMultiple}
                    onToggleBookmark={toggleBookmark}
                    bookmarking={bookmarkingId === video.id}
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

          <SectionHead title="performance over time" note="this tracker, past 12 weeks." />
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

          <div className="provbox">
            <p className="provnote">
              Outlier scores compare each video against the median of this search, not the creator's own account
              history — that needs a profile scrape.
            </p>
            {(insights.placeholders ?? []).length > 0 && (
              <p className="provnote">
                <SampleBadge />
                <span>
                  Anything carrying this badge is invented and safe to ignore. It all comes from{' '}
                  <code>PlaceholderProfileData</code> — delete that class once the TikTok profile actor exists and
                  the badges disappear on their own.
                </span>
              </p>
            )}
          </div>
        </>
      )}

      <div className="sect-head" style={{ marginBottom: '0' }}>
        <span className="note">
          {search?.status === 'paused'
            ? 'paused — no refreshes will run.'
            : search?.next_run_at
              ? `next refresh ${new Date(search.next_run_at).toLocaleDateString()}`
              : 'no refresh scheduled.'}
        </span>
        <div className="head-actions">
          {onTogglePause && (
            <button className="tbtn" onClick={onTogglePause}>
              {search?.status === 'paused' ? 'resume' : 'pause'}
            </button>
          )}
          <button className="tbtn" onClick={onRefresh} disabled={refreshing || search?.status === 'scraping'}>
            {refreshing ? 'refreshing…' : 'refresh now'}
          </button>
          {onDelete && (
            <button className="tbtn danger" onClick={onDelete}>
              delete
            </button>
          )}
        </div>
      </div>

      <div className="footnote">
        {search?.name} · {items.length} matched {items.length === 1 ? 'video' : 'videos'}
      </div>
    </div>
  );
}
