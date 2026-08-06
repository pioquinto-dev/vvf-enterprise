import { useState } from 'react';
import { Share, Arrow, Trend, Check, Bookmark } from '../../components/Icons.jsx';
import { FeaturedVideo, GridVideo } from '../VideoCard.jsx';
import { compactNumber } from '../format.js';
import { bookmarks } from '../api.js';

const PAGE_STEP = 12;

export function EmptyState({ phrase, onRefresh, refreshing }) {
  return (
    <div className="ring-gradient mt-6 rounded-3xl bg-white/70 p-10 text-center backdrop-blur-2xl dark:bg-white/[.04]">
      <h2 className="font-display text-[20px] font-bold">No videos cleared the bar</h2>
      <p className="mx-auto mt-3 max-w-md text-[13.5px] leading-relaxed muted">
        We scanned TikTok for <b className="text-ink dark:text-white">{phrase}</b> but nothing matched the phrase with
        a real creator behind it. Narrower phrases and brand names often do this - try a broader one, or refresh to
        pull again.
      </p>
      <button onClick={onRefresh} disabled={refreshing} className="btn-ghost mx-auto mt-6 h-11 px-5 text-sm">
        {refreshing ? 'Refreshing...' : 'Run it again'}
      </button>
    </div>
  );
}

export function LoginGate({ resultCount }) {
  return (
    <div className="ring-gradient relative mt-6 overflow-hidden rounded-3xl bg-white/72 p-8 backdrop-blur-2xl dark:bg-white/[.04]">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-8 top-6 h-32 rounded-full bg-accent/12 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-2xl text-center">
        <p className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-3 py-1 text-[12px] font-semibold text-accent dark:text-accent-glow">
          Results locked
        </p>
        <h2 className="mt-4 font-display text-[24px] font-bold tracking-[-.025em] sm:text-[30px]">
          Sign in to view the matched videos
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-[14px] leading-relaxed muted">
          We found {compactNumber(resultCount)} videos for this search. Continue with Google to unlock the featured
          result, ranked list, and outbound TikTok links.
        </p>

        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a href="/auth/google" className="btn-accent h-12 px-5 text-sm">
            Continue with Google <Arrow />
          </a>
          <a href="/trial" className="btn-ghost h-12 px-5 text-sm">
            Start free trial
          </a>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: Math.min(Math.max(resultCount, 4), 8) }).map((_, index) => (
          <div
            key={index}
            aria-hidden="true"
            className="overflow-hidden rounded-2xl border border-black/[.06] bg-black/[.03] p-2.5 dark:border-white/[.08] dark:bg-white/[.04]"
          >
            <div className="aspect-[9/16] rounded-xl bg-linear-to-br from-black/8 via-black/4 to-transparent blur-[0.2px] dark:from-white/10 dark:via-white/5" />
            <div className="mt-3 h-3 w-16 rounded-full bg-black/10 dark:bg-white/10" />
            <div className="mt-2 h-2.5 w-24 rounded-full bg-black/7 dark:bg-white/7" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ResultsScreen({
  search,
  isAuthenticated = false,
  billingState = null,
  onStartTrial,
  onToggleWatchlist,
  onRefresh,
  refreshing = false,
  freeSearch = true,
  watchlistUpdating = false,
}) {
  const [visible, setVisible] = useState(PAGE_STEP + 1);
  const [copied, setCopied] = useState(false);
  const [bookmarkingId, setBookmarkingId] = useState(null);
  const [items, setItems] = useState(search?.results ?? []);

  const results = items;
  const [featured, ...rest] = results;
  const shown = rest.slice(0, Math.max(visible - 1, 0));

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

  return (
    <div className="animate-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {freeSearch ? (
          <p className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-3 py-1 text-[12px] font-semibold text-accent dark:text-accent-glow">
            * This is your 1 free search
          </p>
        ) : (
          <p className="inline-flex items-center gap-2 rounded-full border border-black/[.08] px-3 py-1 text-[12px] font-semibold muted dark:border-white/[.12]">
            Refreshes {search?.frequency ?? 'weekly'}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {onToggleWatchlist && (
            <button onClick={onToggleWatchlist} disabled={watchlistUpdating} className="btn-ghost h-10 px-3.5 text-[13px]">
              <Bookmark className="h-3.5 w-3.5" filled={Boolean(search?.is_watchlisted)} />
              {search?.is_watchlisted ? 'Watchlisted' : 'Add to watchlist'}
            </button>
          )}
          <button onClick={share} className="btn-ghost h-10 px-3.5 text-[13px]">
            {copied ? <Check className="h-3 w-3" /> : <Share />} {copied ? 'Link copied' : 'Share'}
          </button>
        </div>
      </div>

      <h1 className="mt-4 font-display text-[28px] leading-tight font-bold tracking-[-.025em] sm:text-[36px]">
        {search?.name ?? 'Recent viral videos'}
      </h1>

      {search?.search_type && (
        <p className="mt-2 text-[11.5px] font-semibold uppercase tracking-[.14em] faint">
          {search.search_type}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-xl bg-ink px-3 py-1.5 text-[12.5px] font-semibold text-white dark:bg-white dark:text-ink">
          {search?.phrase}
        </span>
        {(search?.keywords ?? [])
          .filter((k) => k !== search?.phrase)
          .slice(0, 5)
          .map((k) => (
            <span
              key={k}
              className="rounded-xl border border-black/[.06] bg-black/[.03] px-3 py-1.5 text-[12.5px] muted dark:border-white/[.08] dark:bg-white/[.06]"
            >
              + {k}
            </span>
          ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-y border-black/[.06] py-3 dark:border-white/[.07]">
        <p className="text-[12.5px] faint">
          {search?.scanned_count > 0 && (
            <>
              <b className="muted">{compactNumber(search.scanned_count)}</b> videos scanned ·{' '}
            </>
          )}
          <b className="muted">{results.length}</b> matched your keywords
        </p>
        <span className="inline-flex items-center gap-2 rounded-lg border border-black/[.08] px-3 py-1.5 text-[12.5px] font-semibold dark:border-white/[.12]">
          <Trend className="h-3 w-3 text-hot" /> Sorted by outlier score
        </span>
      </div>

      {results.length === 0 ? (
        <EmptyState phrase={search?.phrase} onRefresh={onRefresh} refreshing={refreshing} />
      ) : !isAuthenticated ? (
        <LoginGate resultCount={results.length} />
      ) : (
        <>
          {billingState && (
            <div className="mt-6 flex flex-wrap items-center gap-2 rounded-2xl border border-black/[.06] bg-black/[.03] px-4 py-3 text-[12.5px] muted dark:border-white/[.08] dark:bg-white/[.04]">
              <span>
                Plan <b className="text-ink dark:text-white capitalize">{billingState.currentPlan}</b>
              </span>
              <span>·</span>
              <span>
                {billingState.searchCreditsRemaining} / {billingState.searchCreditsLimit} credits left
              </span>
              <span>·</span>
              <span>
                {billingState.bookmarkCount}
                {billingState.bookmarkLimit === -1 ? '' : ` / ${billingState.bookmarkLimit}`} watchlist
              </span>
            </div>
          )}

          <FeaturedVideo
            video={featured}
            onToggleBookmark={toggleBookmark}
            bookmarking={bookmarkingId === featured?.id}
          />

          {shown.length > 0 && (
            <>
              <h2 className="mt-10 font-display text-[11px] font-semibold tracking-[.14em] uppercase faint">
                More viral videos
              </h2>

              <div className="mt-4 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
                {shown.map((v) => (
                  <GridVideo
                    key={v.id}
                    video={v}
                    onToggleBookmark={toggleBookmark}
                    bookmarking={bookmarkingId === v.id}
                  />
                ))}
              </div>
            </>
          )}

          {visible < results.length && (
            <button
              onClick={() => setVisible((v) => v + PAGE_STEP)}
              className="btn-ghost mx-auto mt-8 flex h-12 px-6 text-sm"
            >
              Load more
            </button>
          )}
          <p className="mt-3 text-center text-xs faint">
            Showing {Math.min(visible, results.length)} of {results.length}
          </p>
        </>
      )}

      {freeSearch && (
        <div className="relative mt-10 isolate flex flex-col gap-5 overflow-hidden rounded-3xl bg-ink p-7 sm:flex-row sm:items-center sm:justify-between dark:bg-white/[.05]">
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute top-0 right-0 h-[220px] w-[420px] translate-x-1/4 -translate-y-1/3 rounded-full bg-accent/45 blur-[110px]" />
          </div>
          <div>
            <p className="font-display text-[17px] font-bold text-white">Want another search, or weekly tracking?</p>
            <p className="mt-1.5 text-[13.5px] text-white/60">
              Free includes 1 search and 0 watchlist slots. Basic includes 150 searches and 50 watchlist slots.
              Premium includes 400 searches and unlimited watchlist.
            </p>
          </div>
          <button onClick={onStartTrial} className="btn-accent h-[52px] shrink-0 px-6 text-[15px]">
            Start free trial <Arrow />
          </button>
        </div>
      )}
    </div>
  );
}
