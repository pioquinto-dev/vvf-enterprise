import { useEffect, useMemo, useState } from 'react';
import { Link } from '@inertiajs/react';

import { Arrow, Search } from '../../landing/components/Icons.jsx';

const PAGE_SIZE = 25;

function searchedAt(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleString([], {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

function localDay(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function statusLabel(value) {
  return { scraping: 'Running', done: 'Ready', failed: 'Failed', paused: 'Paused' }[value] ?? value ?? 'Pending';
}

export default function SearchHistoryTab({ searches = [] }) {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);

  const filteredSearches = useMemo(() => {
    const term = query.trim().toLowerCase();
    return searches.filter((search) => {
      const haystack = [search.name, search.phrase, ...(search.keywords ?? [])].filter(Boolean).join(' ').toLowerCase();
      const day = localDay(search.created_at);
      return (term === '' || haystack.includes(term))
        && (type === 'all' || (type === 'brand' ? search.search_type !== 'product' : search.search_type === type))
        && (fromDate === '' || day >= fromDate)
        && (toDate === '' || day <= toDate);
    });
  }, [fromDate, query, searches, toDate, type]);

  useEffect(() => setPage(1), [fromDate, query, searches, toDate, type]);

  const pageCount = Math.max(1, Math.ceil(filteredSearches.length / PAGE_SIZE));
  const visibleSearches = filteredSearches.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const hasFilters = query !== '' || type !== 'all' || fromDate !== '' || toDate !== '';
  const clearFilters = () => {
    setQuery(''); setType('all'); setFromDate(''); setToDate('');
  };

  return (
    <div className="search-history">
      <div className="search-history__filters">
        <label className="srch search-history__search">
          <Search className="h-4 w-4" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search history" aria-label="Search history" />
        </label>
        <label className="search-history__field">
          <span>From</span>
          <input type="date" value={fromDate} max={toDate || undefined} onChange={(event) => setFromDate(event.target.value)} />
        </label>
        <label className="search-history__field">
          <span>To</span>
          <input type="date" value={toDate} min={fromDate || undefined} onChange={(event) => setToDate(event.target.value)} />
        </label>
        <label className="search-history__field">
          <span>Type</span>
          <select value={type} onChange={(event) => setType(event.target.value)}>
            <option value="all">All types</option>
            <option value="brand">Brand</option>
            <option value="product">Product</option>
          </select>
        </label>
        {hasFilters && <button type="button" className="search-history__clear" onClick={clearFilters}>Clear</button>}
      </div>

      {filteredSearches.length === 0 ? (
        <div className="empty search-history__empty">
          <div className="empty__i"><Search className="h-6 w-6" /></div>
          <h2>{searches.length === 0 ? 'No searches yet' : 'No searches matched'}</h2>
          <p className="muted" style={{ maxWidth: 380, margin: '10px auto 0' }}>
            {searches.length === 0 ? 'Your searches will appear here after you run your first one.' : 'Try changing your search, date range, or type filter.'}
          </p>
          {searches.length === 0
            ? <Link href="/brands" className="btn btn--y" style={{ margin: '22px auto 0' }}>Start a search <Arrow /></Link>
            : <button type="button" className="btn btn--g" style={{ margin: '22px auto 0' }} onClick={clearFilters}>Clear filters</button>}
        </div>
      ) : (
        <div className="search-history__list">
          {visibleSearches.map((search) => (
            <Link className="search-history__row" href={search.url} key={search.id}>
              <span className="search-history__icon"><Search /></span>
              <span className="search-history__main"><strong>{search.name || search.phrase}</strong><span>{search.phrase}</span></span>
              <span className="search-history__type">{search.search_type === 'product' ? 'Product' : 'Brand'}</span>
              <span className={`search-history__status is-${search.status}`}>{statusLabel(search.status)}</span>
              <span className="search-history__results">{search.result_count ?? 0} videos</span>
              <time dateTime={search.created_at}>{searchedAt(search.created_at)}</time>
              <Arrow />
            </Link>
          ))}
        </div>
      )}

      {filteredSearches.length > PAGE_SIZE && (
        <nav className="search-history__pagination" aria-label="Search history pagination">
          <span>{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredSearches.length)} of {filteredSearches.length}</span>
          <div>
            <button type="button" className="btn btn--g btn--sm" disabled={page === 1} onClick={() => setPage((current) => current - 1)}>Previous</button>
            <span>Page {page} of {pageCount}</span>
            <button type="button" className="btn btn--g btn--sm" disabled={page === pageCount} onClick={() => setPage((current) => current + 1)}>Next</button>
          </div>
        </nav>
      )}

      <style>{`
        .search-history__filters{display:grid;grid-template-columns:minmax(220px,1fr) auto auto auto auto;align-items:end;gap:10px;margin-bottom:16px}.search-history__search{min-width:0;margin:0}
        .search-history__field{display:flex;flex-direction:column;gap:5px}.search-history__field>span{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--muted)}
        .search-history__field input,.search-history__field select{height:42px;padding:0 12px;border:1px solid var(--line);border-radius:11px;background:var(--white);color:var(--ink);font:inherit;font-size:13px}.search-history__field input{min-width:145px}.search-history__field select{min-width:125px;padding-right:30px}
        .search-history__clear{height:42px;padding:0 8px;border:0;background:transparent;color:var(--muted);font-size:12px;font-weight:700;text-decoration:underline}.search-history__list{background:var(--white);border:1px solid var(--line);border-radius:18px;overflow:hidden}
        .search-history__row{display:grid;grid-template-columns:38px minmax(180px,1fr) 75px 75px 85px 155px 18px;align-items:center;gap:14px;padding:16px 20px;color:var(--ink);text-decoration:none;border-bottom:1px solid var(--line);transition:background .14s}.search-history__row:last-child{border-bottom:0}.search-history__row:hover{background:var(--paper,#faf9f6)}
        .search-history__icon{display:grid;place-items:center;width:38px;height:38px;border-radius:11px;background:var(--yellow-soft,#fff7d6)}.search-history__icon svg{width:17px;height:17px}.search-history__main{min-width:0;display:flex;flex-direction:column;gap:3px}.search-history__main strong,.search-history__main span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.search-history__main strong{font-size:14px}
        .search-history__main span,.search-history__row time,.search-history__type,.search-history__results{font-size:12px;color:var(--muted)}.search-history__status{justify-self:start;border-radius:999px;padding:4px 9px;background:#edf6ee;color:#397047;font-size:11px;font-weight:700}.search-history__status.is-failed{background:#fff0ed;color:#a13c2e}.search-history__status.is-scraping{background:#fff7d6;color:#765e00}.search-history__status.is-paused{background:#f0efec;color:#666}.search-history__row>svg{width:14px;height:14px;color:var(--muted)}.search-history__empty{background:var(--white);border:1px solid var(--line);border-radius:18px}
        .search-history__pagination{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-top:16px;color:var(--muted);font-size:12px}.search-history__pagination>div{display:flex;align-items:center;gap:12px}.search-history__pagination .btn:disabled{opacity:.45;cursor:not-allowed}
        @media(max-width:950px){.search-history__filters{grid-template-columns:1fr 1fr}.search-history__search{grid-column:1/-1}.search-history__clear{justify-self:start}.search-history__row{grid-template-columns:38px minmax(0,1fr) auto 14px}.search-history__type,.search-history__status,.search-history__results{display:none}.search-history__row time{grid-column:2}.search-history__row>svg{grid-column:4;grid-row:1/3}}
        @media(max-width:520px){.search-history__filters{grid-template-columns:1fr}.search-history__search{grid-column:auto}.search-history__field input,.search-history__field select{width:100%}.search-history__pagination{align-items:flex-start;flex-direction:column}.search-history__pagination>div{width:100%;justify-content:space-between}}
      `}</style>
    </div>
  );
}
