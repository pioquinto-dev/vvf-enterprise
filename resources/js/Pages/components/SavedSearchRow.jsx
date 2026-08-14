import { Link } from '@inertiajs/react';

import { Bookmark, Dots } from '../../landing/components/Icons.jsx';

/* Search status → the mockup's pill label + class. */
const STATUS = {
  done: { label: 'Ready', cls: 'pill--ok' },
  complete: { label: 'Ready', cls: 'pill--ok' },
  running: { label: 'Refreshing', cls: 'pill--run' },
  scraping: { label: 'Refreshing', cls: 'pill--run' },
  queued: { label: 'Refreshing', cls: 'pill--run' },
  pending: { label: 'Refreshing', cls: 'pill--run' },
  paused: { label: 'Paused', cls: 'pill--off' },
  failed: { label: 'Failed', cls: 'pill--bad' },
};

const TYPE_LABEL = { brand: 'Brand', competitor: 'Competitor', product: 'Product' };

function titleCase(value) {
  return String(value || '')
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatDate(iso) {
  if (!iso) return 'not yet';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'not yet';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * One saved-search row (the mockup's `.row`), wired to a presenter summary.
 *
 * - Dashboard "Recent" uses it as a plain Link with static bookmark/dots.
 * - Library passes `onNavigate` (making the row a div button so buttons can
 *   nest cleanly) and an `actions` node with the live bookmark toggle + menu.
 */
export default function SavedSearchRow({ search, onNavigate, actions }) {
  const status = STATUS[search.status] ?? { label: titleCase(search.status) || 'Ready', cls: 'pill--off' };
  const type = TYPE_LABEL[search.search_type] ?? titleCase(search.search_type);
  const freq = titleCase(search.frequency) || 'Weekly';
  const initials = (search.name || search.phrase || '?').slice(0, 2).toUpperCase();

  const inner = (
    <>
      <span className="row__i">{initials}</span>
      <span style={{ minWidth: 0 }}>
        <span className="row__n">{search.name}</span>
        <span className="row__m">
          {type} · {freq} · updated {formatDate(search.last_run_at)}
        </span>
      </span>
      <span className={`pill ${status.cls}`}>
        <i />
        {status.label}
      </span>
      <span className="row__k">
        <span className="row__kv">{search.result_count ?? 0}</span>
        <span className="row__kl">videos</span>
      </span>
      {actions ?? (
        <>
          <span className="row__x" title={search.is_watchlisted ? 'Bookmarked' : 'Bookmark'} aria-hidden>
            <Bookmark className="h-4 w-4" filled={Boolean(search.is_watchlisted)} />
          </span>
          <span className="row__x" title="More" aria-hidden>
            <Dots className="h-4 w-4" />
          </span>
        </>
      )}
    </>
  );

  if (onNavigate) {
    return (
      <div
        className="row"
        role="button"
        tabIndex={0}
        onClick={onNavigate}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onNavigate();
          }
        }}
        style={{ cursor: 'pointer' }}
      >
        {inner}
      </div>
    );
  }

  return (
    <Link className="row" href={search.url ?? `/bookmark/${search.id}`}>
      {inner}
    </Link>
  );
}

export { STATUS, TYPE_LABEL, titleCase, formatDate };
