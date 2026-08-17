import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { compactNumber, percent } from '../../../landing/flow/format.js';
import { Bookmark, Share, Check, Dots } from '../../../landing/components/Icons.jsx';

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

export function PerformanceChart({ trend, frequency = 'weekly' }) {
  const [metric, setMetric] = useState('views');

  const series = trend?.metrics?.[metric];
  const points = trend?.points ?? [];
  const runs = points.filter((point) => point.posts > 0);

  if (!series || runs.length === 0) {
    return (
      <div className="panel">
        <p className="empty">Not enough history to plot yet.</p>
      </div>
    );
  }

  const latestRun = runs[runs.length - 1];
  const previousRun = runs.length > 1 ? runs[runs.length - 2] : null;
  const baselineRun = runs[0];
  const metricKey = series.format === 'percent' ? 'engagement_rate' : metric;
  const deltaUnit = series.format === 'percent' ? 'points' : 'percent';
  const currentValue = latestRun?.[metricKey] ?? series.current;
  const previousDelta = previousRun ? buildDelta(currentValue, previousRun?.[metricKey], deltaUnit) : null;
  const baselineDelta = baselineRun && baselineRun !== latestRun
    ? buildDelta(currentValue, baselineRun?.[metricKey], deltaUnit)
    : null;
  const maxValue = Math.max(...runs.map((point) => Number(point?.[metricKey]) || 0), 0) || 1;

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
        <div>
          <span className="ts-eyebrow">Current checkpoint</span>
          <div className="ts-headline">
            <span className="ts-val">{formatValue(currentValue, series.format)}</span>
            <span className="ts-runlabel">
              {runLabel(runs.length - 1)}
              {formatRunDate(latestRun?.week_start) ? ` • ${formatRunDate(latestRun.week_start)}` : ''}
            </span>
          </div>
        </div>
      </div>

      {runs.length === 1 ? (
        <div className="ts-emptycta">
          <strong>{runLabel(0)} is your baseline.</strong>
          <span>Come back next {frequency === 'monthly' ? 'month' : 'week'} to unlock comparison against the next refresh.</span>
        </div>
      ) : (
        <div className="ts-comparegrid">
          <div className="ts-comparecard">
            <span className="ts-cardlabel">vs previous refresh</span>
            <strong className={previousDelta?.direction ?? 'flat'}>{deltaLabel(previousDelta)}</strong>
            <span>
              {previousRun ? `${formatValue(previousRun?.[metricKey], series.format)} in ${runLabel(runs.length - 2)}` : 'No previous refresh'}
            </span>
          </div>

          <div className="ts-comparecard">
            <span className="ts-cardlabel">vs first refresh</span>
            <strong className={baselineDelta?.direction ?? 'flat'}>{deltaLabel(baselineDelta)}</strong>
            <span>
              {formatValue(baselineRun?.[metricKey], series.format)} in {runLabel(0)}
            </span>
          </div>
        </div>
      )}

      <div className="ts-runlist">
        {runs.map((point, index) => {
          const value = Number(point?.[metricKey]) || 0;
          const barHeight = Math.max((value / maxValue) * 100, value > 0 ? 14 : 6);
          const pointDate = formatRunDate(point.week_start);
          const isCurrent = index === runs.length - 1;
          const isBaseline = index === 0;
          const compareToPrevious = index > 0 ? buildDelta(value, runs[index - 1]?.[metricKey], deltaUnit) : null;

          return (
            <div key={`${point.week_start}-${metric}-${index}`} className={`ts-runitem${isCurrent ? ' is-current' : ''}`}>
              <div className="ts-runmeta">
                <span className="ts-runname">
                  {runLabel(index)}
                  {isBaseline ? ' baseline' : ''}
                </span>
                <span className="ts-rundate">{pointDate ?? point.label}</span>
              </div>

              <div className="ts-runbarwrap">
                <div className={`ts-runbar${point.reconstructed ? ' is-reconstructed' : ''}`} style={{ height: `${barHeight}%` }} />
              </div>

              <div className="ts-runstats">
                <strong>{formatValue(value, series.format)}</strong>
                {index === 0 ? (
                  <span>First refresh</span>
                ) : (
                  <span className={compareToPrevious?.direction ?? 'flat'}>{deltaLabel(compareToPrevious)} vs previous</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="ts-foot">
        <span>Each bar is one refresh run for this tracker.</span>
        {trend?.has_reconstructed && <span>Dashed bars use reconstructed history until more real refreshes accumulate.</span>}
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
