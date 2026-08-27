import { useEffect, useMemo, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';

import AppLayout from './AppLayout.jsx';
import BrandInlineFlow from './BrandInlineFlow.jsx';
import EntitlementsBar from './EntitlementsBar.jsx';
import { compact } from './VideoCard.jsx';
import { STATUS, formatDate } from './SavedSearchRow.jsx';
import { savedSearch as api } from '../../landing/flow/api.js';
import { Search, Chevron, Refresh, Plus } from '../../landing/components/Icons.jsx';

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

function BrandCard({ search, onOpen, onEdit }) {
  const status = STATUS[search.status] ?? { label: 'Ready', cls: 'pill--off' };
  const initials = (search.name || search.phrase || '?').slice(0, 2).toUpperCase();
  const topScore = Number(search.top_score) > 0 ? `${Math.round(search.top_score)}x` : '—';
  const videosScanned = search.videos_scanned != null ? compact(search.videos_scanned) : '0';
  const latestOutliers = search.latest_outlier_count != null ? compact(search.latest_outlier_count) : '0';
  const averageVideoViews = Number(search.average_video_views) > 0 ? compact(search.average_video_views) : '—';

  return (
    <div
      className="bcard"
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
      style={{ cursor: 'pointer' }}
    >
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
          <span className="bcard__v">{videosScanned}</span>
          <span className="bcard__l">videos scanned</span>
        </div>
        <div>
          <span className="bcard__v">{latestOutliers}</span>
          <span className="bcard__l">new outliers</span>
        </div>
        <div>
          <span className="bcard__v">{topScore}</span>
          <span className="bcard__l">top outlier video</span>
        </div>
        <div>
          <span className="bcard__v">{averageVideoViews}</span>
          <span className="bcard__l">avg video views</span>
        </div>
      </div>
      <div className="bcard__foot">
        <span>Updated {formatDate(search.last_run_at)}</span>
        <button
          type="button"
          className="btn btn--g btn--sm"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onEdit();
          }}
        >
          Edit details
        </button>
      </div>
    </div>
  );
}

export default function SearchListScreen({ kind = 'brand', searches = [], moving = [], suggestions = [] }) {
  const copy = COPY[kind] ?? COPY.brand;
  const { billing = {} } = usePage().props;

  const [searchList, setSearchList] = useState(searches);
  const [subject, setSubject] = useState('');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('outliers');
  const [modalSearch, setModalSearch] = useState(null);
  const [formState, setFormState] = useState({ name: '', frequency: 'weekly', tiktokHandle: '', website: '' });
  const [submitting, setSubmitting] = useState(false);

  const searchLeft = billing.searchCreditsRemaining;
  const searchLimit = billing.searchCreditsLimit;

  const subjectSuggestions = useMemo(() => suggestions.slice(0, 5), [suggestions]);
  const suggestedToTrack = useMemo(() => suggestions.slice(0, 4), [suggestions]);

  const runSearch = (e) => {
    e.preventDefault();
    const q = subject.trim().replace(/\s+/g, ' ');
    router.visit(`/search?type=${kind}${q ? `&q=${encodeURIComponent(q)}` : ''}`);
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
      tiktokHandle: search.source_tiktok_handle ?? '',
      website: search.source_website ?? '',
    });
  };

  const closeEdit = () => {
    if (submitting) return;
    setModalSearch(null);
  };

  const patchSearch = (id, patch) => {
    setSearchList((current) => current.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    setModalSearch((current) => (current?.id === id ? { ...current, ...patch } : current));
  };

  const submitEdit = async () => {
    if (!modalSearch) return;
    setSubmitting(true);
    try {
      const { search: updated } = await api.update(modalSearch.id, {
        name: formState.name.trim(),
        frequency: formState.frequency,
        sources: {
          tiktokHandle: formState.tiktokHandle.trim(),
          website: formState.website.trim(),
        },
      });
      patchSearch(modalSearch.id, updated);
      setModalSearch(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout width="max-w-[1240px]" title={copy.title} subtitle={copy.subtitle} actions={<EntitlementsBar />}>
      <BrandInlineFlow
        kind={kind}
        eyebrow={copy.heroEyebrow}
        placeholder={copy.placeholder}
        sample={copy.sample}
        hint={copy.heroHint}
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

      {/* ---------------- suggested to track ---------------- */}
      {suggestedToTrack.length > 0 && (
        <section className="sugg">
          <div className="movers__h">
            <h2>Suggested to track</h2>
            <span className="note">
              {kind === 'product'
                ? 'Products rising in the categories you already watch.'
                : 'Based on creator overlap with brands you already watch.'}
            </span>
          </div>
          <div className="sugg__g">
            {suggestedToTrack.map((s) => (
              <div className="sg" key={s.name}>
                <span className="sg__av">{s.name.slice(0, 2).toUpperCase()}</span>
                <span style={{ minWidth: 0 }}>
                  <span className="sg__n">{s.name}</span>
                  <span className="sg__w">{s.why}</span>
                </span>
                <button
                  type="button"
                  className="btn btn--g btn--sm"
                  onClick={() => router.visit(`/search?type=${kind}&q=${encodeURIComponent(s.name)}`)}
                >
                  <Plus className="h-[15px] w-[15px]" /> Track
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ---------------- all searches ---------------- */}
      <section className="section-gap">
        <div className="movers__h">
          <h2>{copy.allHeading}</h2>
          <span className="note">{searchList.length} tracked</span>
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
          <div className="bgrid">
            {filtered.map((s) => (
              <BrandCard
                key={s.id}
                search={s}
                onOpen={() => router.visit(s.url ?? `/library/${s.id}`)}
                onEdit={() => openEdit(s)}
              />
            ))}
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
                <label className="lbl">Schedule</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['weekly', 'monthly'].map((frequency) => (
                    <button
                      key={frequency}
                      type="button"
                      className={`btn ${formState.frequency === frequency ? 'btn--y' : 'btn--g'} btn--w`}
                      onClick={() => setFormState((c) => ({ ...c, frequency }))}
                    >
                      {frequency === 'weekly' ? 'Weekly' : 'Monthly'}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 20 }}>
                <label className="lbl">TikTok handle</label>
                <div style={{ position: 'relative' }}>
                  <span
                    style={{
                      position: 'absolute',
                      left: 14,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--muted)',
                      pointerEvents: 'none',
                    }}
                  >
                    @
                  </span>
                  <input
                    className="fld"
                    style={{ paddingLeft: 28 }}
                    value={formState.tiktokHandle}
                    onChange={(e) => setFormState((c) => ({ ...c, tiktokHandle: e.target.value.replace(/^@/, '') }))}
                    placeholder="rhode"
                    aria-label="TikTok handle"
                  />
                </div>
              </div>

              <div style={{ marginTop: 20 }}>
                <label className="lbl">Website</label>
                <div style={{ position: 'relative' }}>
                  <span
                    style={{
                      position: 'absolute',
                      left: 14,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--muted)',
                      pointerEvents: 'none',
                    }}
                  >
                    https://
                  </span>
                  <input
                    className="fld"
                    style={{ paddingLeft: 72 }}
                    value={formState.website}
                    onChange={(e) => setFormState((c) => ({ ...c, website: e.target.value }))}
                    placeholder="rhodeskin.com"
                    aria-label="Website"
                  />
                </div>
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
