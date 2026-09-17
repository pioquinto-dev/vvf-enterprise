import { useEffect, useMemo, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';

import AppLayout from './AppLayout.jsx';
import BrandInlineFlow from './BrandInlineFlow.jsx';
import EntitlementsBar from './EntitlementsBar.jsx';
import { compact } from './BreakoutVideoCard.jsx';
import { STATUS, formatDate } from './SavedSearchRow.jsx';
import { savedSearch as api } from '../../landing/flow/api.js';
import { Search, Chevron } from '../../landing/components/Icons.jsx';
import { withReturnTo } from '../utils/navigation.js';

const COPY = {
  brand: {
    title: 'Brand searches',
    subtitle: 'Research any brand on TikTok, then keep the good ones on a schedule.',
    heroEyebrow: 'Search a brand',
    modeLabel: 'Brand',
    typingWords: ['drunk elephant', 'rhode skin', 'olipop', 'jones road'],
    moversNote: 'Across every brand you track',
    allHeading: 'All brand searches',
    nameHeader: 'Brand',
    filterPlaceholder: 'Filter brands',
  },
  product: {
    title: 'Product searches',
    subtitle: 'Research any product on TikTok, then keep the good ones on a schedule.',
    heroEyebrow: 'Search a product',
    modeLabel: 'Product',
    typingWords: ['lip oil', 'heatless curlers', 'protein cold foam', 'led face mask'],
    moversNote: 'Across every product you track',
    allHeading: 'All product searches',
    nameHeader: 'Product',
    filterPlaceholder: 'Filter products',
  },
};

const SORT = {
  outliers: 'Most breakouts',
  top_score: 'Top score',
  recent: 'Recently updated',
  az: 'A–Z',
};

const SEARCH_PAGE_SIZE = 25;

function Sel({ value, onChange, ariaLabel, children }) {
  return (
    <span className="sel">
      <select aria-label={ariaLabel} value={value} onChange={onChange}>
        {children}
      </select>
      <Chevron />
    </span>
  );
}

function cardIdentity(search) {
  const title = String(search.name || search.phrase || 'Untitled search').trim();
  const phrase = String(search.phrase || '').trim();
  const sameAsTitle = title.localeCompare(phrase, undefined, { sensitivity: 'base' }) === 0;

  if (phrase && !sameAsTitle) {
    return { title, context: `Searching “${phrase}”` };
  }

  const cadence = search.frequency === 'monthly' ? 'Monthly refresh' : 'Weekly refresh';
  const keywordCount = Array.isArray(search.keywords) ? search.keywords.length : 0;
  const coverage = keywordCount > 0 ? `${keywordCount} keyword${keywordCount === 1 ? '' : 's'}` : 'Focused tracking';

  return { title, context: `${cadence} · ${coverage}` };
}

const AV_TONES = 5;

function SearchRow({ search, index, onOpen, onEdit }) {
  const status = STATUS[search.status] ?? { label: 'Ready', cls: 'pill--off' };
  const identity = cardIdentity(search);
  const initials = identity.title.slice(0, 2).toUpperCase();
  const topScore = Number(search.top_score) > 0 ? Math.round(search.top_score) : null;
  const num = (v) => (v != null ? compact(v) : '0');
  const avgViews = Number(search.average_video_views) > 0 ? compact(search.average_video_views) : '—';

  return (
    <tr
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onOpen();
        }
      }}
    >
      <td>
        <span className="sl-name">
          <span className={`sl-av sl-av--${(index % AV_TONES) + 1}`}>{initials}</span>
          <span style={{ minWidth: 0 }}>
            <b>{identity.title}</b>
            <span>{identity.context}</span>
          </span>
        </span>
      </td>
      <td>
        <span className={`pill ${status.cls}`}><i />{status.label}</span>
      </td>
      <td className="num">
        <span className="sl-cell"><b>{num(search.videos_scanned)}</b><span>{num(search.result_count)} total</span></span>
      </td>
      <td className="num">
        <span className="sl-cell"><b className="hi">{num(search.latest_outlier_count)}</b><span>{num(search.outlier_count)} total</span></span>
      </td>
      <td className="num">
        {topScore ? <span className="sl-score">{compact(topScore)}<em>×</em></span> : <span className="sl-dim">—</span>}
      </td>
      <td className="num"><span className="sl-cell"><b>{avgViews}</b></span></td>
      <td><span className="sl-dim">{formatDate(search.last_run_at)}</span></td>
      <td className="sl-act">
        <button
          type="button"
          className="sl-edit"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onEdit();
          }}
        >
          Edit
        </button>
      </td>
    </tr>
  );
}

const TABLE_CSS = `
  .bb .sl-wrap{margin-top:14px;background:var(--white);border:1px solid var(--line);border-radius:16px;overflow:hidden}
  .bb .sl-scroll{overflow-x:auto}
  .bb .sl-table{width:100%;border-collapse:collapse;min-width:860px}
  .bb .sl-table th{background:var(--paper,#FAF9F6);text-align:left;font-size:.68rem;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:var(--faint-2,#74716A);padding:12px 16px;border-bottom:1px solid var(--line);white-space:nowrap}
  .bb .sl-table td{padding:12px 16px;border-bottom:1px solid var(--line);font-size:.88rem;vertical-align:middle}
  .bb .sl-table .num{text-align:right;font-variant-numeric:tabular-nums}
  .bb .sl-table tbody tr{cursor:pointer;transition:background .14s}
  .bb .sl-table tbody tr:hover,.bb .sl-table tbody tr:focus-visible{background:var(--paper,#FAF9F6);outline:none}
  .bb .sl-table tbody tr:last-child td{border-bottom:0}
  .bb .sl-name{display:flex;align-items:center;gap:11px;min-width:0}
  .bb .sl-name b{display:block;font-size:.92rem;font-weight:800;color:var(--ink);letter-spacing:-.016em;line-height:1.3}
  .bb .sl-name span span{display:block;font-size:.76rem;color:var(--faint-2,#74716A);line-height:1.3}
  .bb .sl-av{width:34px;height:34px;flex:none;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:.74rem;font-weight:800;line-height:1}
  .bb .sl-av--1{background:#FFF3CF;color:#8A5E00}
  .bb .sl-av--2{background:#E8F2FF;color:#20609B}
  .bb .sl-av--3{background:#EAF7EF;color:#1F7A4D}
  .bb .sl-av--4{background:#FDEEF3;color:#A33A63}
  .bb .sl-av--5{background:#F0EDFB;color:#5E4CA8}
  .bb .sl-cell{display:block;line-height:1.2}
  .bb .sl-cell b{display:block;font-weight:800;color:var(--ink);font-size:.95rem;letter-spacing:-.024em}
  .bb .sl-cell b.hi{color:var(--amber-ink)}
  .bb .sl-cell span{display:block;margin-top:2px;font-size:.72rem;font-weight:500;color:var(--faint-2,#74716A);white-space:nowrap}
  .bb .sl-score{font-weight:900;font-size:.96rem;color:#6E4A00;letter-spacing:-.03em}
  .bb .sl-score em{font-style:normal;font-size:.78em;margin-left:1px}
  .bb .sl-dim{color:var(--faint-2,#74716A);font-size:.82rem;white-space:nowrap}
  .bb .sl-act{text-align:right;white-space:nowrap}
  .bb .sl-edit{font-size:.82rem;font-weight:700;color:var(--amber-ink);padding:6px 10px;border-radius:8px;border:0;background:none;cursor:pointer}
  .bb .sl-edit:hover{background:var(--wash,#FFF8E6)}
  .bb .sl-foot{display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap;padding:12px 16px;background:var(--paper,#FAF9F6);border-top:1px solid var(--line);font-size:.82rem;color:var(--faint-2,#74716A)}
  .bb .sl-foot b{color:var(--ink)}
`;

export default function SearchListScreen({ kind = 'brand', searches = [], moving = [], suggestions = [], prefillQuery = '' }) {
  const copy = COPY[kind] ?? COPY.brand;
  const { billing = {} } = usePage().props;
  const currentPath = typeof window === 'undefined'
    ? kind === 'product' ? '/products' : '/brands'
    : `${window.location.pathname}${window.location.search}`;

  const [searchList, setSearchList] = useState(searches);
  // Keep the list in sync when the page props are refreshed (e.g. after an
  // edit reloads the listing) so a re-typed search reflows in or out of view.
  useEffect(() => setSearchList(searches), [searches]);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [page, setPage] = useState(1);
  const [modalSearch, setModalSearch] = useState(null);
  const [formState, setFormState] = useState({ name: '', frequency: 'weekly', type: 'brand' });
  const [submitting, setSubmitting] = useState(false);
  const [prefillSubject, setPrefillSubject] = useState(prefillQuery);
  // A non-zero nonce on mount opens the inline flow straight away when the
  // page was reached from My Feed's search box (/brands?q=… or /products?q=…).
  const [prefillNonce, setPrefillNonce] = useState(prefillQuery ? 1 : 0);

  const searchLeft = billing.searchCreditsRemaining;
  const searchLimit = billing.searchCreditsLimit;

  const subjectSuggestions = useMemo(() => suggestions.slice(0, 5), [suggestions]);
  const quickPicks = useMemo(() => suggestions.slice(0, 6).map((s) => s.name).filter(Boolean), [suggestions]);

  const seedInlineFlow = (value) => {
    const nextSubject = value.trim().replace(/\s+/g, ' ');
    if (!nextSubject) return;

    setPrefillSubject(nextSubject);
    setPrefillNonce((current) => current + 1);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const next = searchList.filter((s) => {
      const matchesQuery = q === '' || s.name?.toLowerCase().includes(q) || s.phrase?.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
    next.sort((l, r) => {
      switch (sortBy) {
        case 'top_score':
          return (r.top_score ?? 0) - (l.top_score ?? 0);
        case 'recent':
          return (r.last_run_at ? new Date(r.last_run_at).getTime() : 0) - (l.last_run_at ? new Date(l.last_run_at).getTime() : 0);
        case 'az':
          return (l.name ?? '').localeCompare(r.name ?? '');
        default:
          return (r.outlier_count ?? 0) - (l.outlier_count ?? 0);
      }
    });
    return next;
  }, [searchList, query, statusFilter, sortBy]);

  useEffect(() => {
    setPage(1);
  }, [filtered]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / SEARCH_PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageStart = (currentPage - 1) * SEARCH_PAGE_SIZE;

  useEffect(() => {
    if (!modalSearch) return undefined;
    const onEsc = (e) => e.key === 'Escape' && !submitting && setModalSearch(null);
    document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [modalSearch, submitting]);

  const openEdit = (search) => {
    setModalSearch(search);
    setFormState({
      name: search.name ?? '',
      frequency: search.frequency ?? 'weekly',
      type: search.search_type === 'product' ? 'product' : 'brand',
    });
  };

  const closeEdit = () => {
    if (submitting) return;
    setModalSearch(null);
  };

  const submitEdit = async () => {
    if (!modalSearch) return;
    setSubmitting(true);
    try {
      await api.update(modalSearch.id, {
        name: formState.name.trim(),
        frequency: formState.frequency,
        type: formState.type,
      });
      setModalSearch(null);
      // Re-render the whole listing from the server: a Brand<->Product switch
      // moves the search out of this type-scoped list entirely.
      router.reload({ only: ['searches', 'moving', 'suggestions'], preserveScroll: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout width="max-w-[1240px]" title={copy.title} subtitle={copy.subtitle} actions={<EntitlementsBar />}>
      <style>{TABLE_CSS}</style>
      <BrandInlineFlow
        kind={kind}
        modeLabel={copy.modeLabel}
        typingWords={copy.typingWords}
        quickPicks={quickPicks}
        eyebrow={copy.heroEyebrow}
        prefillSubject={prefillSubject}
        prefillNonce={prefillNonce}
        onCreated={(created) => setSearchList((current) => [{ ...created, search_type: kind }, ...current])}
      />

      {/* ---------------- moving this week ---------------- */}
      {moving.length > 0 && (
        <section className="movers">
          <div className="movers__h">
            <h2>Breakout videos this week</h2>
            <span className="note">{copy.moversNote}</span>
          </div>
          <div className="movers__g">
            {moving.map((v, i) => (
              <Link key={i} className="mv" href={withReturnTo(v.url, currentPath) || '#'}>
                <span className="mv__t">
                  {v.thumbnail_url && <img src={v.thumbnail_url} alt="" loading="lazy" />}
                  {v.multiplier && <span className="mv__x">{v.multiplier}</span>}
                </span>
                <span style={{ minWidth: 0 }}>
                  <span className="mv__b">{v.subject}</span>
                  <span className="mv__c">{v.caption}</span>
                  <span className="mv__m">
                    {v.views != null ? `${compact(v.views)} views` : ''}
                    {v.handle ? ` · ${v.handle}` : ''}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ---------------- all searches ---------------- */}
      <section className="section-gap">
        <div className="movers__h">
          <h2>{copy.allHeading}</h2>
          <span className="note">{searchList.length} tracked · bold = latest refresh</span>
        </div>

        <div className="tools" style={{ marginTop: 14 }}>
          <label className="srch">
            <Search className="h-4 w-4" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={copy.filterPlaceholder}
              aria-label={copy.filterPlaceholder}
            />
          </label>
          <Sel value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} ariaLabel="Status">
            <option value="all">All statuses</option>
            <option value="done">Ready</option>
            <option value="scraping">Refreshing</option>
            <option value="paused">Paused</option>
            <option value="failed">Failed</option>
          </Sel>
          <Sel value={sortBy} onChange={(e) => setSortBy(e.target.value)} ariaLabel="Sort by">
            {Object.entries(SORT).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Sel>
        </div>

        {filtered.length === 0 ? (
          <div className="empty">
            <div className="empty__i">
              <Search className="h-6 w-6" />
            </div>
            <h2>{searchList.length === 0 ? `No ${kind} searches yet` : 'Nothing matched'}</h2>
            <p className="muted" style={{ maxWidth: 360, margin: '10px auto 0' }}>
              {searchList.length === 0
                ? `Start one above and it will track on its own schedule.`
                : 'Try a different filter or sort.'}
            </p>
          </div>
        ) : (
          <div className="sl-wrap">
            <div className="sl-scroll">
              <table className="sl-table">
                <thead>
                  <tr>
                    <th>{copy.nameHeader}</th>
                    <th>Status</th>
                    <th className="num">New Scanned</th>
                    <th className="num">New Breakouts</th>
                    <th className="num">Top score</th>
                    <th className="num">Avg views</th>
                    <th>Updated</th>
                    <th aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(pageStart, pageStart + SEARCH_PAGE_SIZE).map((s, i) => (
                    <SearchRow
                      key={s.id}
                      search={s}
                      index={pageStart + i}
                      onOpen={() => router.visit(withReturnTo(s.url ?? `/library/${s.id}`, currentPath))}
                      onEdit={() => openEdit(s)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            <div className="sl-foot">
              <span role="status"><b>{pageStart + 1}–{Math.min(pageStart + SEARCH_PAGE_SIZE, filtered.length)}</b> of <b>{filtered.length}</b></span>
              {pageCount > 1 && (
                <nav aria-label={`${copy.title} pagination`} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button type="button" className="btn btn--g btn--sm" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>
                    Previous
                  </button>
                  <span>Page {currentPage} of {pageCount}</span>
                  <button type="button" className="btn btn--g btn--sm" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)}>
                    Next
                  </button>
                </nav>
              )}
            </div>
          </div>
        )}
      </section>

      {modalSearch && (
        <div className="bb">
          <div className="bb-modal">
            <button className="bb-modal__bg" aria-label="Close" onClick={closeEdit} />
            <div className="bb-modal__box">
              <h2>Edit keyword details</h2>
              <p className="sub">Update the label and refresh schedule. The keyword set is fixed for this search.</p>

              <div style={{ marginTop: 20 }}>
                <p className="sect__n">Keyword set</p>
                <div className="chips">
                  {modalSearch.keywords.map((keyword) => (
                    <span key={keyword} className="chip">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 20 }}>
                <label className="lbl">Label</label>
                <input className="fld" value={formState.name} onChange={(e) => setFormState((c) => ({ ...c, name: e.target.value }))} />
              </div>

              <div style={{ marginTop: 20 }}>
                <label className="lbl" htmlFor="edit-search-type">Type</label>
                <select
                  id="edit-search-type"
                  className="fld"
                  value={formState.type}
                  onChange={(e) => setFormState((c) => ({ ...c, type: e.target.value }))}
                >
                  <option value="brand">Brand</option>
                  <option value="product">Product</option>
                </select>
                {formState.type !== (modalSearch.search_type === 'product' ? 'product' : 'brand') && (
                  <p className="hint" style={{ marginTop: 8 }}>
                    Your existing results stay — only how we tune keywords and insights changes going forward.
                  </p>
                )}
              </div>

              <div style={{ marginTop: 20 }}>
                <label className="lbl">Schedule</label>
                <output className="btn btn--y btn--w" style={{ cursor: 'default', userSelect: 'none' }}>
                  {formState.frequency === 'monthly' ? 'Monthly' : 'Weekly'}
                </output>
              </div>

              <div className="actrow__r" style={{ marginTop: 24, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn--g" onClick={closeEdit} disabled={submitting}>
                  Cancel
                </button>
                <button type="button" className="btn btn--y" onClick={submitEdit} disabled={submitting}>
                  {submitting ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
