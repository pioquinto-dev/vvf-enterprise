import { useEffect, useMemo, useRef, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';

import AppLayout from '../components/AppLayout.jsx';
import EntitlementsBar from '../components/EntitlementsBar.jsx';
import SavedSearchRow from '../components/SavedSearchRow.jsx';
import VideoCard from '../components/VideoCard.jsx';
import { Arrow, Bookmark, Search, Chevron, Plus, Dots, Play } from '../../landing/components/Icons.jsx';
import { savedSearch as api, untrackSearch } from '../../landing/flow/api.js';

const FILTER_LABELS = {
  'brand-group': 'Brand searches',
  brand: 'Brand searches',
  competitor: 'Competitor searches',
  product: 'Product searches',
};

const SORT_OPTIONS = {
  recent_refresh: 'Most recent refresh',
  video_count: 'Video count',
  az: 'Name A-Z',
  za: 'Name Z-A',
};

const VIDEO_SORT = {
  score: 'Outlier score',
  views: 'Views',
  recent: 'Most recent',
};

function compareDates(a, b) {
  return (b ? new Date(b).getTime() : 0) - (a ? new Date(a).getTime() : 0);
}

/* A native select dressed as the mockup's `.sel`. */
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

export default function Index({
  searches: initialSearches,
  bookmarkedVideos = [],
  filterType = null,
  watchlistedOnly: bookmarkedOnly = true,
}) {
  const isBrandCategoryView = filterType === 'brand-group';
  const showTabs = bookmarkedOnly && !filterType;

  const [searches, setSearches] = useState(initialSearches);
  const [tab, setTab] = useState('searches');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTypeFilter, setSearchTypeFilter] = useState(isBrandCategoryView ? 'all' : filterType ?? 'all');
  const [sortBy, setSortBy] = useState('recent_refresh');
  const [videoQuery, setVideoQuery] = useState('');
  const [videoSort, setVideoSort] = useState('score');
  const [modalState, setModalState] = useState({ type: null, search: null });
  const [formState, setFormState] = useState({
    name: '',
    frequency: 'weekly',
    tiktokHandle: '',
    website: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const menuRef = useRef(null);

  const title = filterType ? FILTER_LABELS[filterType] ?? 'Bookmarks' : 'Bookmarks';
  const searchHref = `/search?type=${filterType === 'competitor' ? 'competitor' : 'brand'}`;

  /* close the row menu on outside click / escape */
  useEffect(() => {
    if (openMenuId === null) return undefined;
    const onDown = (e) => menuRef.current && !menuRef.current.contains(e.target) && setOpenMenuId(null);
    const onEsc = (e) => e.key === 'Escape' && setOpenMenuId(null);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onEsc);
    };
  }, [openMenuId]);

  useEffect(() => {
    if (modalState.type === null) return undefined;
    const onEsc = (e) => e.key === 'Escape' && closeModal();
    document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [modalState.type, submitting]);

  const filteredSearches = useMemo(() => {
    const q = query.trim().toLowerCase();
    const next = searches.filter((s) => {
      const matchesQuery =
        q === '' ||
        s.name?.toLowerCase().includes(q) ||
        s.keywords?.some((k) => k.toLowerCase().includes(q));
      const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
      const matchesType =
        !(bookmarkedOnly || isBrandCategoryView) || searchTypeFilter === 'all' || s.search_type === searchTypeFilter;
      return matchesQuery && matchesStatus && matchesType;
    });

    next.sort((l, r) => {
      switch (sortBy) {
        case 'video_count':
          return (r.result_count ?? 0) - (l.result_count ?? 0);
        case 'az':
          return (l.name ?? '').localeCompare(r.name ?? '');
        case 'za':
          return (r.name ?? '').localeCompare(l.name ?? '');
        default:
          return compareDates(l.last_run_at, r.last_run_at);
      }
    });
    return next;
  }, [bookmarkedOnly, isBrandCategoryView, query, searches, searchTypeFilter, sortBy, statusFilter]);

  const filteredVideos = useMemo(() => {
    const q = videoQuery.trim().toLowerCase();
    const next = bookmarkedVideos.filter(
      (v) => q === '' || v.handle?.toLowerCase().includes(q) || v.title?.toLowerCase().includes(q)
    );
    next.sort((l, r) => {
      switch (videoSort) {
        case 'views':
          return (r.views ?? 0) - (l.views ?? 0);
        case 'recent':
          return compareDates(l.uploaded_at, r.uploaded_at);
        default:
          return (r.virality_score ?? 0) - (l.virality_score ?? 0);
      }
    });
    return next;
  }, [bookmarkedVideos, videoQuery, videoSort]);

  const openModal = (type, search) => {
    setOpenMenuId(null);
    setModalState({ type, search });
    if (type === 'edit') {
      setFormState({
        name: search.name ?? '',
        frequency: search.frequency ?? 'weekly',
        tiktokHandle: search.source_tiktok_handle ?? '',
        website: search.source_website ?? '',
      });
    }
  };
  const closeModal = () => {
    if (submitting) return;
    setModalState({ type: null, search: null });
  };

  const patchSearch = (id, patch) => setSearches((c) => c.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  const removeSearch = (id) => setSearches((c) => c.filter((s) => s.id !== id));

  const toggleBookmark = async (event, search) => {
    event.preventDefault();
    event.stopPropagation();
    try {
      const payload = await api.bookmark(search.id, !search.is_watchlisted);
      setSearches((c) =>
        c
          .map((s) => (s.id === search.id ? { ...s, ...payload.search } : s))
          .filter((s) => (bookmarkedOnly ? s.is_watchlisted : true))
      );
    } catch {
      /* leave as-is on failure */
    }
  };

  const submitEdit = async () => {
    if (!modalState.search) return;
    setSubmitting(true);
    try {
      const { search: updated } = await api.update(modalState.search.id, {
        name: formState.name.trim(),
        frequency: formState.frequency,
        sources: {
          tiktokHandle: formState.tiktokHandle.trim(),
          website: formState.website.trim(),
        },
      });
      patchSearch(modalState.search.id, updated);
      closeModal();
    } finally {
      setSubmitting(false);
    }
  };

  const confirmPause = async () => {
    if (!modalState.search) return;
    setSubmitting(true);
    try {
      const { search: updated } = await api.pause(modalState.search.id);
      patchSearch(modalState.search.id, updated);
      closeModal();
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!modalState.search) return;
    setSubmitting(true);
    try {
      await api.destroy(modalState.search.id);
      untrackSearch(modalState.search.id);
      removeSearch(modalState.search.id);
      closeModal();
    } finally {
      setSubmitting(false);
    }
  };

  const rowActions = (s) => (
    <>
      <button
        type="button"
        className={`row__x${s.is_watchlisted ? ' is-on' : ''}`}
        onClick={(e) => toggleBookmark(e, s)}
        title={s.is_watchlisted ? 'Remove bookmark' : 'Add bookmark'}
      >
        <Bookmark className="h-4 w-4" filled={Boolean(s.is_watchlisted)} />
      </button>
      <span className="row__menu" ref={openMenuId === s.id ? menuRef : null}>
        <button
          type="button"
          className="row__x"
          title="More"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpenMenuId((c) => (c === s.id ? null : s.id));
          }}
        >
          <Dots className="h-4 w-4" />
        </button>
        {openMenuId === s.id && (
          <div className="menu" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => openModal('edit', s)}>
              Edit keyword details
            </button>
            <button type="button" onClick={() => openModal('pause', s)} disabled={s.status === 'paused'}>
              Pause search
            </button>
            <button type="button" className="danger" onClick={() => openModal('delete', s)}>
              Delete search
            </button>
          </div>
        )}
      </span>
    </>
  );

  return (
    <>
      <Head title={`${title} · Brand Beacon`} />

      <AppLayout
        width="max-w-[1240px]"
        title={title}
        subtitle="Everything you have saved — tracked searches and the individual videos you kept."
        actions={<EntitlementsBar />}
      >
        {showTabs && (
          <div className="tabs tabs--bookmarks">
            <button type="button" className={`tab${tab === 'searches' ? ' is-on' : ''}`} onClick={() => setTab('searches')}>
              <Bookmark className="h-[15px] w-[15px]" /> Bookmarked searches <span className="tab__c">{searches.length}</span>
            </button>
            <button type="button" className={`tab${tab === 'videos' ? ' is-on' : ''}`} onClick={() => setTab('videos')}>
              <Play className="h-[15px] w-[15px]" /> Bookmarked videos <span className="tab__c">{bookmarkedVideos.length}</span>
            </button>
          </div>
        )}

        {tab === 'searches' || !showTabs ? (
          <>
            <div className="tools">
              <label className="srch">
                <Search className="h-4 w-4" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search your saved searches"
                  aria-label="Search your saved searches"
                />
              </label>

              <Sel value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} ariaLabel="Status">
                <option value="all">All statuses</option>
                <option value="done">Ready</option>
                <option value="scraping">Refreshing</option>
                <option value="paused">Paused</option>
                <option value="failed">Failed</option>
              </Sel>

              {(bookmarkedOnly || isBrandCategoryView) && (
                <Sel
                  value={searchTypeFilter}
                  onChange={(e) => setSearchTypeFilter(e.target.value)}
                  ariaLabel={isBrandCategoryView ? 'Brand category' : 'Search type'}
                >
                  <option value="all">{isBrandCategoryView ? 'All categories' : 'All types'}</option>
                  <option value="brand">{isBrandCategoryView ? 'Own' : 'Brand searches'}</option>
                  <option value="competitor">Competitor searches</option>
                  {!isBrandCategoryView && <option value="product">Product searches</option>}
                </Sel>
              )}

              <Sel value={sortBy} onChange={(e) => setSortBy(e.target.value)} ariaLabel="Sort by">
                {Object.entries(SORT_OPTIONS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Sel>

              <Link href={searchHref} className="btn btn--y btn--sm">
                <Plus className="h-[15px] w-[15px]" /> New search
              </Link>
            </div>

            {filteredSearches.length === 0 ? (
              <div className="empty">
                <div className="empty__i">
                  <Search className="h-6 w-6" />
                </div>
                <h2>{searches.length === 0 ? 'Nothing saved yet' : 'No searches matched'}</h2>
                <p className="muted" style={{ maxWidth: 360, margin: '10px auto 0' }}>
                  {searches.length === 0
                    ? 'Run a search, then bookmark it to keep it here in Bookmarks.'
                    : 'Try a different keyword, status, type, or sort combination.'}
                </p>
                <Link href={searchHref} className="btn btn--y" style={{ margin: '22px auto 0' }}>
                  Run a search <Arrow />
                </Link>
              </div>
            ) : (
              <div className="rows">
                {filteredSearches.map((s) => (
                  <SavedSearchRow key={s.id} search={s} onNavigate={() => router.visit(s.url)} actions={rowActions(s)} />
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="tools">
              <label className="srch">
                <Search className="h-4 w-4" />
                <input
                  value={videoQuery}
                  onChange={(e) => setVideoQuery(e.target.value)}
                  placeholder="Search your bookmarked videos"
                  aria-label="Search your bookmarked videos"
                />
              </label>
              <Sel value={videoSort} onChange={(e) => setVideoSort(e.target.value)} ariaLabel="Sort videos">
                {Object.entries(VIDEO_SORT).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Sel>
            </div>

            {filteredVideos.length === 0 ? (
              <div className="empty">
                <div className="empty__i">
                  <Play className="h-6 w-6" />
                </div>
                <h2>No bookmarked videos yet</h2>
                <p className="muted" style={{ maxWidth: 360, margin: '10px auto 0' }}>
                  Open a search and bookmark the videos worth keeping — they collect here.
                </p>
              </div>
            ) : (
              <div className="vgrid">
                {filteredVideos.map((v) => (
                  <VideoCard key={v.id} video={v} />
                ))}
              </div>
            )}
          </>
        )}
      </AppLayout>

      {/* ---------------- modals ---------------- */}
      {modalState.type && modalState.search && (
        <div className="bb">
          <div className="bb-modal">
            <button className="bb-modal__bg" aria-label="Close" onClick={closeModal} />
            <div className="bb-modal__box">
              {modalState.type === 'edit' && (
                <>
                  <h2>Edit keyword details</h2>
                  <p className="sub">Update the label and refresh schedule. The keyword set is fixed for this search.</p>

                  <div style={{ marginTop: 20 }}>
                    <p className="sect__n">Keyword set</p>
                    <div className="chips">
                      {modalState.search.keywords.map((k) => (
                        <span key={k} className="chip">
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginTop: 20 }}>
                    <label className="lbl">Label</label>
                    <input
                      className="fld"
                      value={formState.name}
                      onChange={(e) => setFormState((c) => ({ ...c, name: e.target.value }))}
                    />
                  </div>

                  <div style={{ marginTop: 20 }}>
                    <label className="lbl">Schedule</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {['weekly', 'monthly'].map((f) => (
                        <button
                          key={f}
                          type="button"
                          className={`btn ${formState.frequency === f ? 'btn--y' : 'btn--g'} btn--w`}
                          onClick={() => setFormState((c) => ({ ...c, frequency: f }))}
                        >
                          {f === 'weekly' ? 'Weekly' : 'Monthly'}
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
                    <button type="button" className="btn btn--g" onClick={closeModal} disabled={submitting}>
                      Cancel
                    </button>
                    <button type="button" className="btn btn--y" onClick={submitEdit} disabled={submitting}>
                      {submitting ? 'Saving…' : 'Save changes'}
                    </button>
                  </div>
                </>
              )}

              {modalState.type === 'pause' && (
                <>
                  <h2>Pause search</h2>
                  <p className="sub">
                    Keeps the record and its results, but stops future refreshes until you resume it.
                  </p>
                  <p style={{ marginTop: 16, fontWeight: 700, color: 'var(--ink)' }}>{modalState.search.name}</p>
                  <div className="actrow__r" style={{ marginTop: 24, justifyContent: 'flex-end' }}>
                    <button type="button" className="btn btn--g" onClick={closeModal} disabled={submitting}>
                      Cancel
                    </button>
                    <button type="button" className="btn btn--y" onClick={confirmPause} disabled={submitting}>
                      {submitting ? 'Pausing…' : 'Pause search'}
                    </button>
                  </div>
                </>
              )}

              {modalState.type === 'delete' && (
                <>
                  <h2 style={{ color: 'var(--warn)' }}>Delete search</h2>
                  <p className="sub">
                    Removes the saved keyword record and stops future runs. The underlying video records are kept.
                  </p>
                  <p style={{ marginTop: 16, fontWeight: 700, color: 'var(--ink)' }}>{modalState.search.name}</p>
                  <div className="actrow__r" style={{ marginTop: 24, justifyContent: 'flex-end' }}>
                    <button type="button" className="btn btn--g" onClick={closeModal} disabled={submitting}>
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn--g"
                      style={{ color: 'var(--warn)', borderColor: '#F0D6C8' }}
                      onClick={confirmDelete}
                      disabled={submitting}
                    >
                      {submitting ? 'Deleting…' : 'Delete search'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
