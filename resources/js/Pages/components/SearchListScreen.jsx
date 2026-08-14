import { useMemo, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';

import AppLayout from './AppLayout.jsx';
import EntitlementsBar from './EntitlementsBar.jsx';
import { compact } from './VideoCard.jsx';
import { STATUS, formatDate } from './SavedSearchRow.jsx';
import { Search, Chevron, Arrow, Refresh } from '../../landing/components/Icons.jsx';

const COPY = {
  brand: {
    title: 'Brand searches',
    subtitle: 'Research any brand on TikTok, then keep the good ones on a schedule.',
    heroEyebrow: 'Start a brand search',
    placeholder: 'Which brand do you want to research?',
    sample: 'rhode skin',
    heroHint: 'One brand per search — we widen it with keywords next.',
    moversNote: 'Best outlier across every brand you track.',
    allHeading: 'All brand searches',
    filterPlaceholder: 'Filter brands',
  },
  product: {
    title: 'Product searches',
    subtitle: 'Track a product category across every brand selling it, not just one label.',
    heroEyebrow: 'Start a product search',
    placeholder: 'Which product do you want to track?',
    sample: 'lip oil',
    heroHint: 'One product per search — we widen it with keywords next.',
    moversNote: 'Best outlier across every product you track.',
    allHeading: 'All product searches',
    filterPlaceholder: 'Filter products',
  },
};

const SORT = {
  outliers: 'Most outliers',
  top_score: 'Top score',
  recent: 'Recently updated',
  az: 'Name A-Z',
};

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

function BrandCard({ search }) {
  const status = STATUS[search.status] ?? { label: 'Ready', cls: 'pill--off' };
  const initials = (search.name || search.phrase || '?').slice(0, 2).toUpperCase();
  const topScore = Number(search.top_score) > 0 ? `${Math.round(search.top_score)}x` : '—';

  return (
    <Link className="bcard" href={search.url ?? `/bookmark/${search.id}`}>
      <div className="bcard__top">
        <span className="bcard__av">{initials}</span>
        <span style={{ minWidth: 0 }}>
          <span className="bcard__n">{search.name}</span>
          <span className="bcard__h">{search.phrase}</span>
        </span>
        <span className={`pill ${status.cls}`}>
          <i />
          {status.label}
        </span>
      </div>
      <div className="bcard__mid">
        <div>
          <span className="bcard__v">{search.outlier_count ?? 0}</span>
          <span className="bcard__l">outliers/wk</span>
        </div>
        <div>
          <span className="bcard__v">{topScore}</span>
          <span className="bcard__l">top score</span>
        </div>
        <div>
          <span className="bcard__v">{search.result_count ?? 0}</span>
          <span className="bcard__l">videos</span>
        </div>
        <div className="bcard__sp">
          {(search.result_count ?? 0) === 0 && <span className="bcard__flat">no runs yet</span>}
        </div>
      </div>
      <div className="bcard__foot">
        <span>Updated {formatDate(search.last_run_at)}</span>
        <span className="bcard__go">
          Open <Arrow />
        </span>
      </div>
    </Link>
  );
}

export default function SearchListScreen({ kind = 'brand', searches = [], moving = [] }) {
  const copy = COPY[kind] ?? COPY.brand;
  const { billing = {} } = usePage().props;

  const [subject, setSubject] = useState('');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('outliers');

  const searchLeft = billing.searchCreditsRemaining;
  const searchLimit = billing.searchCreditsLimit;

  const recent = useMemo(() => searches.slice(0, 4), [searches]);

  const runSearch = (e) => {
    e.preventDefault();
    const q = subject.trim().replace(/\s+/g, ' ');
    router.visit(`/search?type=${kind}${q ? `&q=${encodeURIComponent(q)}` : ''}`);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const next = searches.filter((s) => {
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
  }, [searches, query, statusFilter, sortBy]);

  return (
    <AppLayout width="max-w-[1240px]" title={copy.title} subtitle={copy.subtitle} actions={<EntitlementsBar />}>
      {/* ---------------- hero ---------------- */}
      <section className="bhero">
        <p className="bhero__k">{copy.heroEyebrow}</p>
        <form className="sbox" onSubmit={runSearch}>
          <textarea
            rows={2}
            maxLength={80}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder={copy.placeholder}
            aria-label={copy.heroEyebrow}
          />
          <div className="sbox__f">
            <p className="sbox__t">
              Try <b>“{copy.sample}”</b>
              <br />
              {copy.heroHint}
            </p>
            <button type="submit" className="btn btn--y btn--lg">
              <Search className="h-[15px] w-[15px]" /> Find outliers
            </button>
          </div>
        </form>
        <div className="bhero__r">
          {recent.length > 0 && <span className="bhero__rl">Recent</span>}
          {recent.map((s) => (
            <button key={s.id} type="button" className="rchip" onClick={() => setSubject(s.phrase || s.name)}>
              <Refresh className="h-[13px] w-[13px]" /> {s.name}
            </button>
          ))}
          {searchLimit > 0 && (
            <span className="bhero__q">
              {searchLeft} of {searchLimit} searches left this cycle
            </span>
          )}
        </div>
      </section>

      {/* ---------------- moving this week ---------------- */}
      {moving.length > 0 && (
        <section className="movers">
          <div className="movers__h">
            <h2>Moving this week</h2>
            <span className="note">{copy.moversNote}</span>
          </div>
          <div className="movers__g">
            {moving.map((v, i) => (
              <Link key={i} className="mv" href={v.url ?? '#'}>
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
          <span className="note">{searches.length} tracked</span>
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
            <h2>{searches.length === 0 ? `No ${kind} searches yet` : 'Nothing matched'}</h2>
            <p className="muted" style={{ maxWidth: 360, margin: '10px auto 0' }}>
              {searches.length === 0
                ? `Start one above and it will track on its own schedule.`
                : 'Try a different filter or sort.'}
            </p>
          </div>
        ) : (
          <div className="bgrid">
            {filtered.map((s) => (
              <BrandCard key={s.id} search={s} />
            ))}
          </div>
        )}
      </section>
    </AppLayout>
  );
}
