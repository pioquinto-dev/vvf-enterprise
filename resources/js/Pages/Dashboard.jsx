import { useEffect, useRef, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';

import AppLayout from './components/AppLayout.jsx';
import SearchWizard from './components/SearchWizard.jsx';
import { Arrow } from '../landing/components/Icons.jsx';
import { fetchRecentSearches, savedSearch as savedSearchApi } from '../landing/flow/api.js';

const POLL_MS = 10000;
const ACTIVE_SEARCH_STATUSES = new Set(['pending', 'queued', 'running', 'scraping']);

/* status → pill copy + class, matching the mockup */
const STATUS_MAP = {
  done:      { label: 'Ready',      cls: 'pill--ok'  },
  complete:  { label: 'Ready',      cls: 'pill--ok'  },
  running:   { label: 'Refreshing', cls: 'pill--run' },
  scraping:  { label: 'Refreshing', cls: 'pill--run' },
  queued:    { label: 'Refreshing', cls: 'pill--run' },
  pending:   { label: 'Refreshing', cls: 'pill--run' },
  paused:    { label: 'Paused',     cls: 'pill--off' },
  failed:    { label: 'Failed',     cls: 'pill--bad' },
};

const TYPE_LABEL = { brand: 'Brand', competitor: 'Competitor', product: 'Product' };
const titleCase = (v) => String(v || '').split(/[-_\s]+/).filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
const formatDate = (iso) => {
  if (!iso) return 'not yet';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? 'not yet' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/* deterministic 6-bar sparkline seeded by the search id, so the chart is
 * visually stable across renders without a backing series */
function sparkBars(seed, n = 6) {
  const bars = [];
  let s = Number(seed) || 1;
  for (let i = 0; i < n; i += 1) {
    s = (s * 9301 + 49297) % 233280;
    const h = 30 + Math.round((s / 233280) * 65);
    bars.push(h);
  }
  bars[bars.length - 1] = Math.max(bars[bars.length - 1], 74);
  return bars;
}

/** Recent row matching the mockup: icon · name/meta · sparkline · trend · pill · videos */
function RecentRow({ search, onNavigate, retrying, onRetry }) {
  const status = STATUS_MAP[search.status] ?? { label: titleCase(search.status) || 'Ready', cls: 'pill--off' };
  const type = TYPE_LABEL[search.search_type] ?? titleCase(search.search_type);
  const freq = titleCase(search.frequency) || 'Weekly';
  const initials = (search.name || search.phrase || '?').slice(0, 2).toUpperCase();
  const bars = sparkBars(search.id, 6);
  const trend = typeof search.trend === 'number'
    ? search.trend
    : (() => {
        const last = bars[bars.length - 1];
        const prevAvg = bars.slice(0, -1).reduce((a, b) => a + b, 0) / (bars.length - 1);
        return prevAvg ? Math.round(((last - prevAvg) / prevAvg) * 100) : 0;
      })();
  const canRetry = search.can_retry_initial === true;

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
      <span className="row__i">{initials}</span>
      <span style={{ minWidth: 0 }}>
        <span className="row__n">{search.name || search.phrase}</span>
        <span className="row__m">
          {type} · {freq} · updated {formatDate(search.last_run_at)}
        </span>
      </span>
      <span className="spark" aria-hidden>
        {bars.map((h, i) => (
          <span key={i} className={i === bars.length - 1 ? 'hot' : ''} style={{ height: `${h}%` }} />
        ))}
      </span>
      <span className={`trend${trend >= 0 ? ' up' : ''}`}>
        {`${trend >= 0 ? '+' : ''}${trend}%`}
      </span>
      <span className={`pill ${status.cls}`}>
        <i />
        {status.label}
      </span>
      <span className="row__k">
        <span className="row__kv">{search.result_count ?? 0}</span>
        <span className="row__kl">videos</span>
        {canRetry && (
          <button
            type="button"
            className="btn btn--g btn--sm"
            onClick={(event) => {
              event.stopPropagation();
              onRetry(search);
            }}
            disabled={retrying}
            style={{ marginTop: 6 }}
          >
            {retrying ? 'Retrying…' : 'Retry'}
          </button>
        )}
      </span>
    </div>
  );
}

/** "Your tracking at a glance" — portfolio-wide stats from the server. */
function GlanceStrip({ stats }) {
  const s = stats ?? {};
  const videos = s.videos_tracked ?? 0;
  const videosNew = s.videos_tracked_delta_week ?? 0;
  const outliers = s.outliers_this_week ?? 0;
  const outliersDelta = s.outliers_delta_week ?? 0;
  const avgScore = s.avg_outlier_score ?? 0;
  const creators = s.creators_surfaced ?? 0;
  const searchesCount = s.searches_count ?? 0;
  const fmtDelta = (n) => `${n >= 0 ? '+' : '−'}${Math.abs(n).toLocaleString()}`;

  const upArrow = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 17l6-6 4 4 8-8" />
      <path d="M21 3h-5m5 0v5" />
    </svg>
  );

  return (
    <>
      <p className="ey">Your tracking at a glance</p>
      <div className="glance">
        <div className="gl">
          <div className="gl__l">Videos tracked</div>
          <div className="gl__v">{videos.toLocaleString()}</div>
          <div className="gl__d up">{upArrow}+{videosNew.toLocaleString()} this week</div>
        </div>
        <div className="gl">
          <div className="gl__l">Outliers this week</div>
          <div className="gl__v">{outliers.toLocaleString()}</div>
          <div className={`gl__d${outliersDelta >= 0 ? ' up' : ''}`}>{upArrow}{fmtDelta(outliersDelta)} vs last</div>
        </div>
        <div className="gl">
          <div className="gl__l">Avg outlier score</div>
          <div className="gl__v">{avgScore}×</div>
          <div className="gl__d">above baseline</div>
        </div>
        <div className="gl">
          <div className="gl__l">Creators surfaced</div>
          <div className="gl__v">{creators.toLocaleString()}</div>
          <div className="gl__d">across {searchesCount} searches</div>
        </div>
      </div>
    </>
  );
}

/** "Pick up where you left off" — the three most recent saved searches. */
function RecentCard({ searches, retryingSearchId, onRetry }) {
  if (!searches?.length) return null;

  return (
    <>
      <p className="ey" style={{ marginTop: 32 }}>Recent</p>
      <section className="rc">
        <div className="rc__h">
          <h2>Pick up where you left off</h2>
          <Link href="/bookmarks" className="link">
            View all <Arrow />
          </Link>
        </div>
        {searches.map((search) => (
          <RecentRow
            key={search.id}
            search={search}
            onNavigate={() => router.visit(search.url)}
            retrying={retryingSearchId === search.id}
            onRetry={onRetry}
          />
        ))}
      </section>
    </>
  );
}

function FailedSearchModal({ search, retrying, onRetry, onClose }) {
  if (!search) return null;

  return (
    <div className="bb">
      <div className="bb-modal">
        <button className="bb-modal__bg" aria-label="Close" onClick={onClose} disabled={retrying} />
        <div className="bb-modal__box">
          <h2>Something went wrong</h2>
          <p className="sub">Try again or contact support.</p>
          <div className="actrow__r" style={{ marginTop: 24, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn--g" onClick={onClose} disabled={retrying}>
              Close
            </button>
            {search.can_retry_initial && (
              <button type="button" className="btn btn--y" onClick={onRetry} disabled={retrying}>
                {retrying ? 'Retrying...' : 'Retry search'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { flash = {}, recent = [], stats = null, searchSuggestions = {} } = usePage().props;
  const [readyModal, setReadyModal] = useState(null);
  const [failedModal, setFailedModal] = useState(null);
  const [retryingSearchId, setRetryingSearchId] = useState(null);
  const [recentSearches, setRecentSearches] = useState(recent);
  const polling = useRef(false);
  const recentSearchesRef = useRef(recent);
  const recentStatuses = useRef(new Map(recent.map((s) => [String(s.id), s.status])));
  const hasActiveRecentSearch = recentSearches.some((s) => ACTIVE_SEARCH_STATUSES.has(s.status));

  const applyRecentSearches = (searches, notifyOnTerminal = false) => {
    const previousStatuses = recentStatuses.current;
    recentStatuses.current = new Map(searches.map((s) => [String(s.id), s.status]));
    recentSearchesRef.current = searches;
    setRecentSearches(searches);

    if (!notifyOnTerminal) return;

    const terminal = searches.find((s) => (
      ACTIVE_SEARCH_STATUSES.has(previousStatuses.get(String(s.id)))
      && (s.status === 'done' || s.status === 'failed')
    ));

    if (terminal?.status === 'done') setReadyModal(terminal);
    if (terminal?.status === 'failed') setFailedModal(terminal);
  };

  const refreshRecent = async (notifyOnTerminal = false) => {
    const payload = await fetchRecentSearches();
    const searches = payload?.searches ?? [];
    applyRecentSearches(searches, notifyOnTerminal);
    return searches;
  };

  useEffect(() => {
    recentStatuses.current = new Map(recent.map((s) => [String(s.id), s.status]));
    recentSearchesRef.current = recent;
    setRecentSearches(recent);
  }, [recent]);

  useEffect(() => {
    if (readyModal || failedModal) return undefined;

    let cancelled = false;
    let timer;

    const poll = async () => {
      if (cancelled || polling.current) return;
      if (!recentSearchesRef.current.some((s) => ACTIVE_SEARCH_STATUSES.has(s.status))) return;

      polling.current = true;
      try {
        const payload = await fetchRecentSearches();
        if (cancelled) return;
        applyRecentSearches(payload?.searches ?? [], true);
      } catch {
        /* transient — the next tick will retry */
      } finally {
        polling.current = false;
      }

      if (!cancelled) timer = window.setTimeout(poll, POLL_MS);
    };

    poll();

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [failedModal, hasActiveRecentSearch, readyModal]);

  const closeReadyModal = () => setReadyModal(null);
  const viewResults = () => {
    if (!readyModal?.url) return closeReadyModal();
    router.visit(readyModal.url);
  };
  const retryFailedSearch = async (failedSearch = failedModal) => {
    if (!failedSearch?.can_retry_initial || retryingSearchId !== null) return;

    setRetryingSearchId(failedSearch.id);
    try {
      const payload = await savedSearchApi.retry(failedSearch.id);
      if (payload?.search) await refreshRecent();
      setFailedModal(null);
    } finally {
      setRetryingSearchId(null);
    }
  };

  const dashboardExtras = (
    <>
      <GlanceStrip stats={stats} />
      <RecentCard
        searches={recentSearches}
        retryingSearchId={retryingSearchId}
        onRetry={retryFailedSearch}
      />
    </>
  );

  return (
    <>
      <Head title="Dashboard · Brand Beacon" />

      {/* Scoped styles that layer the flat mockup on top of the existing shell */}
      <style>{`
        .hero{background:var(--white);border:1px solid var(--line);border-radius:20px;padding:24px 26px 26px}
        .hero__head{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:18px}
        .hero__head h2{font-size:1.1rem;font-weight:800;letter-spacing:-.028em;color:var(--ink)}
        .prog{display:flex;align-items:center;gap:9px;font-size:.75rem;font-weight:700;color:var(--faint-2,#9A968E)}
        .prog b{color:var(--muted)}
        .prog .seg3{display:flex;gap:4px}
        .prog .seg3 span{width:20px;height:4px;border-radius:100px;background:var(--line-2,#DEDBD3)}
        .prog .seg3 span.on{background:var(--yellow)}

        .seg{position:relative;display:flex;padding:4px;background:var(--canvas,#F7F6F2);border:1px solid var(--line);border-radius:100px;margin-bottom:14px}
        .seg__ind{position:absolute;top:4px;bottom:4px;left:4px;width:0;border-radius:100px;background:var(--yellow);transition:transform .32s cubic-bezier(.22,.61,.36,1),width .32s cubic-bezier(.22,.61,.36,1)}
        .seg__b{position:relative;z-index:1;flex:1 1 0;display:inline-flex;align-items:center;justify-content:center;gap:8px;min-width:0;height:44px;padding:0 10px;border-radius:100px;font-size:.9rem;font-weight:600;letter-spacing:-.01em;color:var(--muted);background:transparent;border:0;cursor:pointer;transition:color .22s;white-space:nowrap}
        .seg__b svg{width:16px;height:16px;opacity:.65;transition:opacity .22s}
        .seg__b:hover{color:var(--ink)} .seg__b:hover svg{opacity:1}
        .seg__b[aria-selected="true"]{color:#1A1400}
        .seg__b[aria-selected="true"] svg{opacity:1}

        .bar{display:flex;align-items:center;gap:10px;padding:7px 7px 7px 18px;background:var(--white);border:1.5px solid var(--line-2,#DEDBD3);border-radius:100px;transition:border-color .18s,box-shadow .18s}
        .bar:focus-within{border-color:var(--yellow);box-shadow:0 0 0 4px rgba(255,198,41,.24)}
        .bar__q{width:19px;height:19px;color:var(--faint-2,#9A968E);flex:none}
        .bar input{flex:1 1 auto;min-width:0;height:48px;border:0;outline:0;background:transparent;font:inherit;font-size:1.06rem;font-weight:600;letter-spacing:-.015em;color:var(--ink)}
        .bar input::placeholder{color:var(--faint-2,#9A968E);font-weight:500}
        .bar .btn--y{flex:none;height:48px;padding:0 18px;border-radius:100px;font-size:.88rem;font-weight:700;display:inline-flex;align-items:center;gap:6px}
        .bar .btn--y[disabled]{opacity:.55;cursor:not-allowed}
        .btn__a{display:inline-flex;transition:transform .2s}
        .bar .btn--y:hover .btn__a{transform:translateX(3px)}

        .hero__foot{display:flex;align-items:center;flex-wrap:wrap;gap:10px 14px;margin-top:15px}
        .hero__hint{font-size:.81rem;color:var(--faint-2,#9A968E);margin-right:auto}
        .pop{display:flex;align-items:center;gap:7px;flex-wrap:wrap}
        .pop__l{font-size:.75rem;font-weight:700;color:var(--faint-2,#9A968E)}
        .chip{height:30px;padding:0 13px;border-radius:100px;border:1px solid var(--line-2,#DEDBD3);background:var(--white);font-size:.8rem;font-weight:600;color:var(--body);cursor:pointer;transition:.15s}
        .chip:hover{border-color:var(--amber-ink);background:var(--wash);color:var(--amber-ink)}

        .ey{display:flex;align-items:center;gap:8px;margin:34px 2px 12px;font-size:.72rem;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--amber-ink)}
        .ey::before{content:'';width:20px;height:2px;background:var(--yellow)}

        .glance{display:grid;grid-template-columns:repeat(4,1fr);background:var(--white);border:1px solid var(--line);border-radius:16px;overflow:hidden}
        .gl{padding:17px 20px;border-right:1px solid var(--line)}
        .gl:last-child{border-right:none}
        .gl__l{font-size:.77rem;color:var(--faint-2,#9A968E);font-weight:600}
        .gl__v{margin-top:7px;font-size:1.46rem;font-weight:800;letter-spacing:-.04em;color:var(--ink);line-height:1;font-variant-numeric:tabular-nums}
        .gl__d{margin-top:8px;font-size:.73rem;font-weight:600;display:inline-flex;align-items:center;gap:4px;color:var(--faint-2,#9A968E)}
        .gl__d.up{color:var(--ok)} .gl__d svg{width:11px;height:11px}

        .rc{background:var(--white);border:1px solid var(--line);border-radius:20px;overflow:hidden}
        .rc__h{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:17px 22px;border-bottom:1px solid var(--line)}
        .rc__h h2{font-size:1.02rem;font-weight:800;letter-spacing:-.028em;color:var(--ink)}
        .link{display:inline-flex;align-items:center;gap:5px;font-size:.82rem;font-weight:700;color:var(--muted);text-decoration:none}
        .link:hover{color:var(--ink)} .link svg{width:14px;height:14px}
        .rc .row{display:grid;grid-template-columns:auto 1fr auto auto auto auto;align-items:center;gap:16px;padding:14px 22px;border-bottom:1px solid var(--line);transition:background .14s}
        .rc .row:last-child{border-bottom:none}
        .rc .row:hover{background:var(--paper,#FAF9F6)}
        .row__i{width:36px;height:36px;border-radius:10px;background:var(--wash);color:var(--amber-ink);display:grid;place-items:center;font-size:.8rem;font-weight:800}
        .row__n{display:block;font-size:.93rem;font-weight:700;color:var(--ink);letter-spacing:-.01em}
        .row__m{display:block;font-size:.77rem;color:var(--faint-2,#9A968E);margin-top:1px}
        .spark{display:flex;align-items:flex-end;gap:3px;height:24px}
        .spark span{width:5px;border-radius:2px;background:var(--line-2,#DEDBD3)}
        .spark span.hot{background:var(--yellow)}
        .trend{font-size:.81rem;font-weight:800;font-variant-numeric:tabular-nums;min-width:40px;text-align:right;color:var(--faint-2,#9A968E)}
        .trend.up{color:var(--ok)}
        .row__k{text-align:right;min-width:48px}
        .row__kv{display:block;font-size:1rem;font-weight:800;color:var(--ink);line-height:1;font-variant-numeric:tabular-nums}
        .row__kl{display:block;font-size:.65rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--faint-2,#9A968E);margin-top:3px}

        @media (max-width:1080px){
          .glance{grid-template-columns:repeat(2,1fr)}
          .gl:nth-child(2){border-right:none}
          .gl:nth-child(1),.gl:nth-child(2){border-bottom:1px solid var(--line)}
        }
        @media (max-width:860px){
          .rc .row{grid-template-columns:auto 1fr auto;gap:12px}
          .rc .row .spark,.rc .row .trend,.rc .row .pill{display:none}
        }
        @media (max-width:640px){
          .hero{padding:18px}
          .hero__head{align-items:flex-start;gap:10px;margin-bottom:14px}
          .hero__head h2{font-size:1rem}
          .prog{font-size:.68rem;gap:6px}
          .prog .seg3 span{width:13px}
          .prog__detail{display:none}
          .seg{margin-bottom:12px}
          .seg__b{gap:4px;height:40px;padding:0 6px;font-size:.71rem;letter-spacing:-.02em}
          .seg__b svg{display:none}
          .bar{gap:8px;padding:6px 6px 6px 14px}
          .bar__q{width:17px;height:17px}
          .bar input{height:44px;font-size:.96rem}
          .bar .btn--y{height:42px;padding:0 13px;font-size:.78rem;gap:4px}
          .bar .btn--y .btn__a svg{width:12px;height:12px}
          .hero__foot{gap:8px 10px;margin-top:12px}
          .hero__hint,.pop__l,.chip{font-size:.74rem}
          .chip{height:28px;padding:0 11px}
        }
      `}</style>

      <AppLayout width="max-w-4xl">
        {flash.status && (
          <div
            style={{
              marginBottom: 18,
              padding: '12px 16px',
              borderRadius: 'var(--r)',
              background: 'var(--ok-bg)',
              color: 'var(--ok)',
              fontWeight: 600,
              fontSize: '.85rem',
            }}
          >
            {flash.status}
          </div>
        )}

        <SearchWizard
          subjectExtra={dashboardExtras}
          suggestionsByType={searchSuggestions}
          onTrackedSearchChange={() => {
            refreshRecent().catch(() => {});
          }}
        />
      </AppLayout>

      {readyModal && (
        <div className="bb">
          <div className="bb-modal">
            <button className="bb-modal__bg" aria-label="Close" onClick={closeReadyModal} />
            <div className="bb-modal__box">
              <h2>Search ready</h2>
              <p className="sub">
                {readyModal.name
                  ? `Your search for ${String.fromCharCode(8220)}${readyModal.name}${String.fromCharCode(8221)} has finished running.`
                  : 'Your search has finished running.'}
              </p>
              <div className="actrow__r" style={{ marginTop: 24, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn--g" onClick={closeReadyModal}>
                  Close
                </button>
                <button type="button" className="btn btn--y" onClick={viewResults}>
                  View results
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <FailedSearchModal
        search={failedModal}
        retrying={retryingSearchId === failedModal?.id}
        onRetry={() => retryFailedSearch()}
        onClose={() => setFailedModal(null)}
      />
    </>
  );
}
