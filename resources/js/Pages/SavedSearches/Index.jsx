import { useEffect, useMemo, useRef, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';

import AppLayout from '../components/AppLayout.jsx';
import EntitlementsBar from '../components/EntitlementsBar.jsx';
import SavedSearchRow from '../components/SavedSearchRow.jsx';
import VideoCard from '../components/VideoCard.jsx';
import { Arrow, Bookmark, Search, Chevron, Plus, Dots, Play } from '../../landing/components/Icons.jsx';
import {
  fetchAnalysisHistory,
  fetchBookmarkedVideos,
  savedSearch as api,
  untrackSearch,
} from '../../landing/flow/api.js';
import { withReturnTo } from '../utils/navigation.js';

const FILTER_LABELS = {
  'brand-group': 'Brand',
  brand: 'Brand',
  product: 'Product',
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

const ANALYSIS_STATUS_LABELS = {
  complete: 'Ready',
  processing: 'Processing',
  failed: 'Failed',
};

const ANALYSIS_SORT = {
  recent: 'Most Recent',
  oldest: 'Oldest First',
  outlier: 'Outlier Score',
  az: 'A-Z (by title)',
  za: 'Z-A (by title)',
};

const ANALYSIS_PAGE_SIZE = 20;

function formatAnalysisDate(value) {
  if (!value) return 'Waiting for analysis';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Waiting for analysis';

  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function truncateAnalysisTitle(value, limit = 50) {
  const text = String(value || '').trim();
  if (text.length <= limit) return text;
  return `${text.slice(0, limit).trimEnd()}......`;
}

function analysisAvatarLabel(video) {
  const source = String(video?.handle || video?.creator_name || video?.username || '?')
    .replace(/^@/, '')
    .trim();
  return source.slice(0, 2).toUpperCase() || '?';
}

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

function AnalysisHistoryRow({ entry, href, statusLabel, searchNames }) {
  const [thumbBroken, setThumbBroken] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const title = expanded
    ? String(entry.video?.title || entry.video?.handle || 'Analyzed video')
    : truncateAnalysisTitle(entry.video?.title || entry.video?.handle || 'Analyzed video');
  const titleExpandable = String(entry.video?.title || '').trim().length > 50;

  return (
    <Link
      href={href}
      className="row"
      style={{ alignItems: 'stretch', textDecoration: 'none' }}
    >
      <div
        style={{
          width: 88,
          minWidth: 88,
          borderRadius: 18,
          overflow: 'hidden',
          background: 'var(--panel)',
          border: '1px solid var(--line)',
        }}
      >
        {entry.video?.thumbnail_url && !thumbBroken ? (
          <img
            src={entry.video.thumbnail_url}
            alt={entry.video?.title ?? 'Video thumbnail'}
            onError={() => setThumbBroken(true)}
            onLoad={(event) => {
              if (!event.currentTarget.naturalWidth || !event.currentTarget.naturalHeight) {
                setThumbBroken(true);
              }
            }}
            style={{ width: '100%', height: '100%', minHeight: 88, objectFit: 'cover' }}
          />
        ) : (
          <div
            style={{
              minHeight: 88,
              display: 'grid',
              placeItems: 'center',
              color: 'var(--amber-ink)',
              background: 'linear-gradient(160deg, #f6ebcf, #e3c47a)',
              fontSize: 24,
              fontWeight: 800,
              letterSpacing: '-0.03em',
            }}
            aria-hidden="true"
          >
            {analysisAvatarLabel(entry.video)}
          </div>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="row__t" style={{ marginBottom: 6, gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ minWidth: 0, overflowWrap: 'anywhere' }}>{title}</span>
          <span className={`pill ${
            entry.status === 'complete'
              ? 'pill--ok'
              : entry.status === 'failed'
                ? 'pill--bad'
                : 'pill--run'
          }`}>
            <i />
            {statusLabel}
          </span>
        </div>
        {titleExpandable && (
          <button
            type="button"
            className="link"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setExpanded((current) => !current);
            }}
            style={{ marginBottom: 4 }}
          >
            {expanded ? 'Show less' : 'Show more'}
          </button>
        )}
        <div className="row__m">
          {entry.video?.handle || entry.video?.creator_name || 'Unknown creator'}
          {searchNames.length > 0 ? ` • ${searchNames.join(', ')}` : ''}
        </div>
        <div className="row__m" style={{ marginTop: 6 }}>
          {entry.status === 'complete' ? 'Analyzed' : entry.status === 'failed' ? 'Last updated' : 'Started'}{' '}
          {formatAnalysisDate(entry.analyzed_at ?? entry.updated_at)}
          {!entry.counts_toward_quota ? ' • Auto analysis' : ''}
        </div>
      </div>
    </Link>
  );
}

export default function Index({
  searches: initialSearches,
  bookmarkedVideos: initialBookmarkedVideos = [],
  bookmarkedVideosCount = 0,
  analysisHistory: initialAnalysisHistory = [],
  analysisHistoryCount = 0,
  filterType = null,
  watchlistedOnly: bookmarkedOnly = true,
}) {
  const currentPath = typeof window === 'undefined' ? '/library' : `${window.location.pathname}${window.location.search}`;
  const isBrandCategoryView = filterType === 'brand-group';
  const showTabs = bookmarkedOnly && !filterType;

  const [searches, setSearches] = useState(initialSearches);
  const [tab, setTab] = useState('searches');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [bookmarkedVideos, setBookmarkedVideos] = useState(initialBookmarkedVideos);
  const [analysisHistory, setAnalysisHistory] = useState(initialAnalysisHistory);
  const [bookmarkedVideosLoaded, setBookmarkedVideosLoaded] = useState(
    initialBookmarkedVideos.length > 0 || bookmarkedVideosCount === 0
  );
  const [analysisHistoryLoaded, setAnalysisHistoryLoaded] = useState(
    initialAnalysisHistory.length > 0 || analysisHistoryCount === 0
  );
  const [bookmarkedVideosLoading, setBookmarkedVideosLoading] = useState(false);
  const [analysisHistoryLoading, setAnalysisHistoryLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTypeFilter, setSearchTypeFilter] = useState(isBrandCategoryView ? 'all' : filterType ?? 'all');
  const [sortBy, setSortBy] = useState('recent_refresh');
  const [videoQuery, setVideoQuery] = useState('');
  const [videoSort, setVideoSort] = useState('score');
  const [analysisQuery, setAnalysisQuery] = useState('');
  const [analysisStatus, setAnalysisStatus] = useState('all');
  const [analysisSort, setAnalysisSort] = useState('recent');
  const [visibleAnalysisCount, setVisibleAnalysisCount] = useState(ANALYSIS_PAGE_SIZE);
  const [modalState, setModalState] = useState({ type: null, search: null });
  const [formState, setFormState] = useState({
    name: '',
    frequency: 'weekly',
    tiktokHandle: '',
    website: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const menuRef = useRef(null);
  const analysisLoadMoreRef = useRef(null);

  const title = filterType ? FILTER_LABELS[filterType] ?? 'Library' : 'Library';
  const searchHref = `/search?type=${filterType === 'product' ? 'product' : 'brand'}`;

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

  useEffect(() => {
    let cancelled = false;

    if (tab === 'videos' && !bookmarkedVideosLoaded && !bookmarkedVideosLoading) {
      setBookmarkedVideosLoading(true);
      fetchBookmarkedVideos()
        .then((payload) => {
          if (cancelled) return;
          setBookmarkedVideos(Array.isArray(payload?.videos) ? payload.videos : []);
          setBookmarkedVideosLoaded(true);
        })
        .catch(() => {
          if (cancelled) return;
          setBookmarkedVideos([]);
          setBookmarkedVideosLoaded(true);
        })
        .finally(() => {
          if (!cancelled) setBookmarkedVideosLoading(false);
        });
    }

    if (tab === 'analysis' && !analysisHistoryLoaded && !analysisHistoryLoading) {
      setAnalysisHistoryLoading(true);
      fetchAnalysisHistory()
        .then((payload) => {
          if (cancelled) return;
          setAnalysisHistory(Array.isArray(payload?.history) ? payload.history : []);
          setAnalysisHistoryLoaded(true);
        })
        .catch(() => {
          if (cancelled) return;
          setAnalysisHistory([]);
          setAnalysisHistoryLoaded(true);
        })
        .finally(() => {
          if (!cancelled) setAnalysisHistoryLoading(false);
        });
    }

    return () => {
      cancelled = true;
    };
  }, [
    analysisHistoryLoaded,
    analysisHistoryLoading,
    bookmarkedVideosLoaded,
    bookmarkedVideosLoading,
    tab,
  ]);

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

  const filteredAnalyses = useMemo(() => {
    const q = analysisQuery.trim().toLowerCase();
    const next = analysisHistory.filter((entry) => {
      const searchNames = Array.isArray(entry.searches) ? entry.searches.map((search) => search?.name ?? '') : [];
      const matchesQuery =
        q === '' ||
        entry.video?.title?.toLowerCase().includes(q) ||
        entry.video?.handle?.toLowerCase().includes(q) ||
        entry.video?.creator_name?.toLowerCase().includes(q) ||
        searchNames.some((name) => name.toLowerCase().includes(q));
      const matchesStatus = analysisStatus === 'all'
        ? entry.status !== 'idle'
        : entry.status === analysisStatus;

      return matchesQuery && matchesStatus;
    });

    next.sort((left, right) => {
      const leftTime = new Date(left.analyzed_at ?? left.updated_at ?? 0).getTime();
      const rightTime = new Date(right.analyzed_at ?? right.updated_at ?? 0).getTime();
      const leftTitle = String(left.video?.title || left.video?.handle || '').toLowerCase();
      const rightTitle = String(right.video?.title || right.video?.handle || '').toLowerCase();
      const leftOutlier = Number(left.video?.virality_score ?? 0);
      const rightOutlier = Number(right.video?.virality_score ?? 0);

      switch (analysisSort) {
        case 'oldest':
          return leftTime - rightTime;
        case 'outlier':
          return rightOutlier - leftOutlier;
        case 'az':
          return leftTitle.localeCompare(rightTitle);
        case 'za':
          return rightTitle.localeCompare(leftTitle);
        default:
          return rightTime - leftTime;
      }
    });

    return next;
  }, [analysisHistory, analysisQuery, analysisSort, analysisStatus]);

  const visibleAnalyses = useMemo(
    () => filteredAnalyses.slice(0, visibleAnalysisCount),
    [filteredAnalyses, visibleAnalysisCount]
  );
  const hasMoreAnalyses = visibleAnalysisCount < filteredAnalyses.length;

  useEffect(() => {
    setVisibleAnalysisCount(ANALYSIS_PAGE_SIZE);
  }, [analysisHistory, analysisQuery, analysisSort, analysisStatus, tab]);

  useEffect(() => {
    if (tab !== 'analysis' || !hasMoreAnalyses || !analysisLoadMoreRef.current) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisibleAnalysisCount((current) => Math.min(current + ANALYSIS_PAGE_SIZE, filteredAnalyses.length));
        }
      },
      { rootMargin: '160px 0px' }
    );

    observer.observe(analysisLoadMoreRef.current);

    return () => observer.disconnect();
  }, [filteredAnalyses.length, hasMoreAnalyses, tab]);

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
        subtitle="Everything you have saved and analyzed — tracked searches, bookmarked videos, and your analysis log."
        actions={<EntitlementsBar />}
      >
        {showTabs && (
          <div className="tabs tabs--bookmarks">
            <button type="button" className={`tab${tab === 'searches' ? ' is-on' : ''}`} onClick={() => setTab('searches')}>
              <Bookmark className="h-[15px] w-[15px]" />
              <span className="sm:hidden">Searches</span>
              <span className="hidden sm:inline">Saved searches</span>
              <span className="tab__c">{searches.length}</span>
            </button>
            <button type="button" className={`tab${tab === 'videos' ? ' is-on' : ''}`} onClick={() => setTab('videos')}>
              <Play className="h-[15px] w-[15px]" />
              <span className="sm:hidden">Videos</span>
              <span className="hidden sm:inline">Saved videos</span>
              <span className="tab__c">{bookmarkedVideosCount}</span>
            </button>
            <button type="button" className={`tab${tab === 'analysis' ? ' is-on' : ''}`} onClick={() => setTab('analysis')}>
              <Search className="h-[15px] w-[15px]" />
              <span>Analysis History</span>
              <span className="tab__c">{analysisHistoryCount}</span>
            </button>
          </div>
        )}

        {tab === 'searches' || !showTabs ? (
          <>
            <div className="tools" style={{ display: 'grid', gap: 10 }}>
              <label className="srch" style={{ minWidth: 0 }}>
                <Search className="h-4 w-4" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search your saved searches"
                  aria-label="Search your saved searches"
                />
              </label>

              <div className="tools tools--library-grid" style={{ marginBottom: 0 }}>
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
                    <option value="brand">Brand</option>
                    {!isBrandCategoryView && <option value="product">Product</option>}
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
            </div>

            {filteredSearches.length === 0 ? (
              <div className="empty">
                <div className="empty__i">
                  <Search className="h-6 w-6" />
                </div>
                <h2>{searches.length === 0 ? 'Nothing saved yet' : 'No searches matched'}</h2>
                <p className="muted" style={{ maxWidth: 360, margin: '10px auto 0' }}>
                  {searches.length === 0
                    ? 'Run a search, then save it to keep it here in Library.'
                    : 'Try a different keyword, status, type, or sort combination.'}
                </p>
                <Link href={searchHref} className="btn btn--y" style={{ margin: '22px auto 0' }}>
                  Run a search <Arrow />
                </Link>
              </div>
            ) : (
              <div className="rows">
                {filteredSearches.map((s) => (
                  <SavedSearchRow
                    key={s.id}
                    search={s}
                    onNavigate={() => router.visit(withReturnTo(s.url, currentPath))}
                    actions={rowActions(s)}
                  />
                ))}
              </div>
            )}
          </>
        ) : tab === 'videos' ? (
          <>
            <div className="tools" style={{ display: 'grid', gap: 10 }}>
              <label className="srch" style={{ minWidth: 0 }}>
                <Search className="h-4 w-4" />
                <input
                  value={videoQuery}
                  onChange={(e) => setVideoQuery(e.target.value)}
                  placeholder="Search your saved videos"
                  aria-label="Search your saved videos"
                />
              </label>
              <div className="tools tools--library-grid" style={{ marginBottom: 0 }}>
                <Sel value={videoSort} onChange={(e) => setVideoSort(e.target.value)} ariaLabel="Sort videos">
                  {Object.entries(VIDEO_SORT).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Sel>
              </div>
            </div>

            {bookmarkedVideosLoading ? (
              <div className="empty">
                <div className="empty__i">
                  <Play className="h-6 w-6" />
                </div>
                <h2>Loading saved videos</h2>
                <p className="muted" style={{ maxWidth: 360, margin: '10px auto 0' }}>
                  Pulling your bookmarked video library now.
                </p>
              </div>
            ) : filteredVideos.length === 0 ? (
              <div className="empty">
                <div className="empty__i">
                  <Play className="h-6 w-6" />
                </div>
                <h2>No saved videos yet</h2>
                <p className="muted" style={{ maxWidth: 360, margin: '10px auto 0' }}>
                  Open a search and save the videos worth keeping — they collect here.
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
        ) : (
          <>
            <div className="tools" style={{ display: 'grid', gap: 10 }}>
              <label className="srch" style={{ minWidth: 0 }}>
                <Search className="h-4 w-4" />
                <input
                  value={analysisQuery}
                  onChange={(e) => setAnalysisQuery(e.target.value)}
                  placeholder="Search analysis history"
                  aria-label="Search analysis history"
                />
              </label>
              <div className="tools tools--library-grid" style={{ marginBottom: 0 }}>
                <Sel value={analysisStatus} onChange={(e) => setAnalysisStatus(e.target.value)} ariaLabel="Filter analyses">
                  <option value="all">All statuses</option>
                  <option value="complete">Ready</option>
                  <option value="processing">Processing</option>
                  <option value="failed">Failed</option>
                </Sel>
                <Sel value={analysisSort} onChange={(e) => setAnalysisSort(e.target.value)} ariaLabel="Sort analyses">
                  {Object.entries(ANALYSIS_SORT).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Sel>
              </div>
            </div>

            {analysisHistoryLoading ? (
              <div className="empty">
                <div className="empty__i">
                  <Search className="h-6 w-6" />
                </div>
                <h2>Loading analysis history</h2>
                <p className="muted" style={{ maxWidth: 360, margin: '10px auto 0' }}>
                  Gathering your completed and in-flight video analyses.
                </p>
              </div>
            ) : filteredAnalyses.length === 0 ? (
              <div className="empty">
                <div className="empty__i">
                  <Search className="h-6 w-6" />
                </div>
                <h2>{analysisHistory.length === 0 ? 'No analyses yet' : 'No analyses matched'}</h2>
                <p className="muted" style={{ maxWidth: 420, margin: '10px auto 0' }}>
                  {analysisHistory.length === 0
                    ? 'Analyze a video from any search result and it will show up here as a running history log.'
                    : 'Try a different search term or status filter.'}
                </p>
              </div>
            ) : (
              <div className="rows">
                {visibleAnalyses.map((entry) => {
                  const statusLabel = ANALYSIS_STATUS_LABELS[entry.status] ?? 'Unknown';
                  const searchNames = Array.isArray(entry.searches) ? entry.searches.map((search) => search.name).filter(Boolean) : [];
                  const searchHrefWithReturnTo = withReturnTo(entry.search_url, currentPath);
                  const href =
                    entry.status === 'complete'
                      ? entry.analysis_url
                      : searchHrefWithReturnTo
                        ? `${searchHrefWithReturnTo}${searchHrefWithReturnTo.includes('?') ? '&' : '?'}analysisVideo=${encodeURIComponent(entry.video?.id ?? '')}&openAnalysis=1`
                        : entry.analysis_url;

                  return <AnalysisHistoryRow key={entry.id} entry={entry} href={href} statusLabel={statusLabel} searchNames={searchNames} />;
                })}
                {hasMoreAnalyses && (
                  <div
                    ref={analysisLoadMoreRef}
                    className="row"
                    aria-hidden="true"
                    style={{ justifyItems: 'center', color: 'var(--faint)', minHeight: 72 }}
                  >
                    Loading more analyses...
                  </div>
                )}
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
