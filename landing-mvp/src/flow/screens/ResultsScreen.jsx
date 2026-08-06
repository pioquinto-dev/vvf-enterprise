import { useState } from 'react';
import { Share, Arrow, Trend } from '../../components/Icons.jsx';
import { RESULT_VIDEOS, SEARCH_TYPES } from '../../data/dummy.js';
import { FeaturedVideo, GridVideo } from '../VideoCard.jsx';
import { resolveSubject, resolveType, subjectHandle } from '../searchQuery.js';

const PLACEHOLDER_HANDLE = '@glossier';

export default function ResultsScreen({ type, subject, keywords = [], onStartTrial }) {
  const [visible, setVisible] = useState(5);

  const safeType = resolveType(type);
  const config = SEARCH_TYPES[safeType];
  const resolved = resolveSubject(safeType, subject);
  const handle = subjectHandle(safeType, resolved);

  const [featured, ...rest] = RESULT_VIDEOS;
  const shown = rest.slice(0, Math.max(visible - 1, 0));

  return (
    <div className="animate-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-3 py-1 text-[12px] font-semibold text-accent dark:text-accent-glow">
          ★ This is your 1 free search
        </p>
        <button className="btn-ghost h-10 px-3.5 text-[13px]">
          <Share /> Share
        </button>
      </div>

      <h1 className="mt-4 font-display text-[28px] leading-tight font-bold tracking-[-.025em] sm:text-[36px]">
        Recent viral videos
      </h1>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-xl bg-ink px-3 py-1.5 text-[12.5px] font-semibold text-white dark:bg-white dark:text-ink">
          {config.label} {resolved}
        </span>
        {keywords.slice(0, 4).map((k) => (
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
          <b className="muted">300</b> videos scanned · showing the top <b className="muted">100</b> · last 90 days
        </p>
        <span className="inline-flex items-center gap-2 rounded-lg border border-black/[.08] px-3 py-1.5 text-[12.5px] font-semibold dark:border-white/[.12]">
          <Trend className="h-3 w-3 text-hot" /> Sorted by views
        </span>
      </div>

      <FeaturedVideo video={featured} handleOverride={featured.handle === PLACEHOLDER_HANDLE ? handle : null} />

      <h2 className="mt-10 font-display text-[11px] font-semibold tracking-[.14em] uppercase faint">
        More viral videos
      </h2>

      <div className="mt-4 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {shown.map((v) => (
          <GridVideo key={v.rank} video={v} handleOverride={v.handle === PLACEHOLDER_HANDLE ? handle : null} />
        ))}
      </div>

      {visible < RESULT_VIDEOS.length && (
        <button onClick={() => setVisible((v) => v + 3)} className="btn-ghost mx-auto mt-8 flex h-12 px-6 text-sm">
          Load more
        </button>
      )}
      <p className="mt-3 text-center text-xs faint">Showing {Math.min(visible, RESULT_VIDEOS.length)} of 100</p>

      <div className="relative mt-10 isolate flex flex-col gap-5 overflow-hidden rounded-3xl bg-ink p-7 sm:flex-row sm:items-center sm:justify-between dark:bg-white/[.05]">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 h-[220px] w-[420px] translate-x-1/4 -translate-y-1/3 rounded-full bg-accent/45 blur-[110px]" />
        </div>
        <div>
          <p className="font-display text-[17px] font-bold text-white">Want another search, or weekly tracking?</p>
          <p className="mt-1.5 text-[13.5px] text-white/60">
            Track this search and get fresh viral videos every week. 10 day trial, cancel before day 10.
          </p>
        </div>
        <button onClick={onStartTrial} className="btn-accent h-[52px] shrink-0 px-6 text-[15px]">
          Start free trial <Arrow />
        </button>
      </div>
    </div>
  );
}
