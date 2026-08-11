import { useMemo, useState } from 'react';

import { compactNumber, percent } from '../../../landing/flow/format.js';
import { RebuiltBadge } from './Badges.jsx';

const W = 560;
const H = 180;
const PAD = 10;

function formatValue(value, format) {
  if (value === null || value === undefined) return 'â€”';
  if (format === 'compact') return compactNumber(value);
  if (format === 'percent') return percent(value) ?? 'â€”';
  return String(value);
}

/** Maps a series onto the viewBox. A flat series sits mid-height, not on the floor. */
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

/**
 * The 12-week performance chart. Weeks rebuilt from upload dates are drawn
 * dashed and the measured tail solid, so the eye can tell reconstructed
 * history from real history without reading the caption.
 */
export function PerformanceChart({ trend }) {
  const [metric, setMetric] = useState('views');

  const series = trend?.metrics?.[metric];
  const points = trend?.points ?? [];

  const geometry = useMemo(() => {
    const coords = toPoints(series?.values ?? []);
    if (coords.length === 0) return null;

    const asPoly = (list) => list.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
    const line = asPoly(coords);
    const firstRecorded = points.findIndex((p) => !p.reconstructed);

    return {
      line,
      recorded:
        firstRecorded >= 0 && firstRecorded < coords.length - 1 ? asPoly(coords.slice(firstRecorded)) : null,
      area: `${line} ${W},${H} 0,${H}`,
      last: coords[coords.length - 1],
    };
  }, [series, points]);

  if (!series || !geometry) {
    return (
      <div className="panel">
        <p className="empty">Not enough history to plot yet.</p>
      </div>
    );
  }

  const delta = series.delta;
  const deltaTone = !delta ? 'flat' : delta.direction === 'up' ? 'up' : delta.direction === 'down' ? 'down' : 'flat';
  const deltaSuffix = delta?.unit === 'points' ? ' pts' : '%';

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
        <span className="ts-val">{formatValue(series.current, series.format)}</span>
        {delta && (
          <span className={`ts-delta ${deltaTone}`}>
            {delta.direction === 'up' ? 'â†‘' : delta.direction === 'down' ? 'â†“' : 'â†’'} {Math.abs(delta.value)}
            {deltaSuffix} vs 12 wk ago
          </span>
        )}
        {trend.has_reconstructed && <RebuiltBadge />}
      </div>

      <svg className="ts-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="tsfill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--violet)" stopOpacity=".2" />
            <stop offset="1" stopColor="var(--violet)" stopOpacity="0" />
          </linearGradient>
        </defs>

        <polygon points={geometry.area} fill="url(#tsfill)" />

        <polyline
          points={geometry.line}
          fill="none"
          stroke="var(--violet)"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          strokeDasharray={trend.has_reconstructed ? '5 4' : undefined}
          opacity={trend.has_reconstructed ? 0.55 : 1}
        />

        {geometry.recorded && (
          <polyline
            points={geometry.recorded}
            fill="none"
            stroke="var(--violet)"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}

        <circle cx={geometry.last[0]} cy={geometry.last[1]} r="4.5" fill="var(--violet)" stroke="#fff" strokeWidth="2" />
      </svg>

      <div className="ts-x">
        <span>12 wk ago</span>
        <span>8 wk</span>
        <span>4 wk</span>
        <span>now</span>
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
  onToggleWatchlist,
  onShare,
  copied,
  watchlistUpdating,
}) {
  const initial = (search?.name ?? '?').slice(0, 1).toUpperCase();

  return (
    <header>
      <div className="crumb">trackers / {search?.search_type ?? 'brand'}</div>

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
            <span>
              checked {search?.frequency ?? 'weekly'}
              {lastRun ? ` Â· last run ${lastRun}` : ''}
            </span>
          </div>
        </div>

        <div className="head-actions">
          {onToggleWatchlist && (
            <button className="tbtn" onClick={onToggleWatchlist} disabled={watchlistUpdating}>
              {search?.is_watchlisted ? 'bookmarked' : 'add bookmark'}
            </button>
          )}
          <button className="tbtn primary" onClick={onShare}>
            {copied ? 'link copied' : 'share'}
          </button>
        </div>
      </div>
    </header>
  );
}

/**
 * The one-line read. Absent until the enrichment job has run, which is correct
 * on a brand new search â€” it never renders a placeholder sentence.
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
