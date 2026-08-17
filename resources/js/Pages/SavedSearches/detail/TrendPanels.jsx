import { useEffect, useMemo, useRef, useState } from 'react';
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
            {delta.direction === 'up' ? '↑' : delta.direction === 'down' ? '↓' : '→'} {Math.abs(delta.value)}
            {deltaSuffix} vs 12 wk ago
          </span>
        )}
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
