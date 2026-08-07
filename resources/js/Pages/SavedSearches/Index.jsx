import { useEffect, useMemo, useRef, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';

import AppLayout from '../components/AppLayout.jsx';
import { Arrow, Trend, Bookmark, Search, Chevron, Close, Plus, Dots } from '../../landing/components/Icons.jsx';
import { savedSearch as api } from '../../landing/flow/api.js';

function FilterSelect({ value, onChange, active, label, children }) {
  return (
    <div className="relative">
      <select
        aria-label={label}
        value={value}
        onChange={onChange}
        className={`h-9 cursor-pointer appearance-none rounded-lg border pr-8 pl-3 text-[12.5px] font-semibold outline-none transition duration-200 focus:border-accent/50 focus:ring-4 focus:ring-accent/12 ${
          active
            ? 'border-accent/30 bg-accent/10 text-accent dark:border-accent/35 dark:text-accent-glow'
            : 'border-black/[.08] bg-white text-ink hover:border-black/[.18] dark:border-white/[.1] dark:bg-white/[.05] dark:text-white dark:hover:border-white/[.2]'
        }`}
      >
        {children}
      </select>
      <Chevron className="pointer-events-none absolute top-1/2 right-2.5 h-3.5 w-3.5 -translate-y-1/2 opacity-45" />
    </div>
  );
}

function Divider() {
  return <div className="hidden h-6 w-px shrink-0 bg-black/[.08] lg:block dark:bg-white/[.1]" />;
}

function ModalShell({ title, body, children, onClose }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm">
      <button aria-label="Close modal" onClick={onClose} className="absolute inset-0" />
      <div className="relative z-10 w-full max-w-lg rounded-[28px] border border-black/[.06] bg-white p-6 shadow-[0_30px_90px_-45px_rgba(16,18,32,.55)] dark:border-white/[.08] dark:bg-canvas-dark">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-[24px] font-bold">{title}</h2>
            {body && <p className="mt-2 text-[13.5px] leading-relaxed muted">{body}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-black/[.08] transition hover:border-accent/35 dark:border-white/[.12]"
          >
            <Close className="h-4 w-4" />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

const STATUS = {
  scraping: { label: 'Refreshing', className: 'border-accent/25 bg-accent/10 text-accent dark:text-accent-glow' },
  done: { label: 'Ready', className: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  paused: { label: 'Paused', className: 'border-black/[.1] muted dark:border-white/[.15]' },
  failed: { label: 'Failed', className: 'border-hot/25 bg-hot/10 text-hot' },
};

const FILTER_LABELS = {
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

function formatDate(iso) {
  return iso ? new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '-';
}

function compareDates(a, b) {
  const aTime = a ? new Date(a).getTime() : 0;
  const bTime = b ? new Date(b).getTime() : 0;
  return bTime - aTime;
}

export default function Index({ searches: initialSearches, filterType = null, watchlistedOnly = true }) {
  const [searches, setSearches] = useState(initialSearches);
  const [animatingId, setAnimatingId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [frequencyFilter, setFrequencyFilter] = useState('all');
  const [searchTypeFilter, setSearchTypeFilter] = useState(filterType ?? 'all');
  const [sortBy, setSortBy] = useState('recent_refresh');
  const [modalState, setModalState] = useState({ type: null, search: null });
  const [formState, setFormState] = useState({ name: '', frequency: 'weekly' });
  const [submitting, setSubmitting] = useState(false);
  const menuRef = useRef(null);

  const title = filterType ? FILTER_LABELS[filterType] ?? 'Watchlist' : 'Watchlist';
  const searchHref = `/search?type=${filterType ?? 'brand'}`;

  useEffect(() => {
    if (openMenuId === null) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [openMenuId]);

  useEffect(() => {
    if (modalState.type === null) {
      return undefined;
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [modalState.type, submitting]);

  const filteredSearches = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const next = searches.filter((search) => {
      const matchesQuery =
        normalizedQuery === '' ||
        search.name?.toLowerCase().includes(normalizedQuery) ||
        search.keywords?.some((keyword) => keyword.toLowerCase().includes(normalizedQuery));

      const matchesStatus = statusFilter === 'all' || search.status === statusFilter;
      const matchesFrequency = frequencyFilter === 'all' || search.frequency === frequencyFilter;
      const matchesType =
        !watchlistedOnly || searchTypeFilter === 'all' || search.search_type === searchTypeFilter;

      return matchesQuery && matchesStatus && matchesFrequency && matchesType;
    });

    next.sort((left, right) => {
      switch (sortBy) {
        case 'video_count':
          return (right.result_count ?? 0) - (left.result_count ?? 0);
        case 'az':
          return (left.name ?? '').localeCompare(right.name ?? '');
        case 'za':
          return (right.name ?? '').localeCompare(left.name ?? '');
        case 'recent_refresh':
        default:
          return compareDates(left.last_run_at, right.last_run_at);
      }
    });

    return next;
  }, [frequencyFilter, query, searches, searchTypeFilter, sortBy, statusFilter, watchlistedOnly]);

  const filtersActive =
    query.trim() !== '' ||
    statusFilter !== 'all' ||
    frequencyFilter !== 'all' ||
    (watchlistedOnly && searchTypeFilter !== 'all');

  const resetFilters = () => {
    setQuery('');
    setStatusFilter('all');
    setFrequencyFilter('all');
    setSearchTypeFilter(filterType ?? 'all');
  };

  const openModal = (type, search) => {
    setOpenMenuId(null);
    setModalState({ type, search });

    if (type === 'edit') {
      setFormState({
        name: search.name ?? '',
        frequency: search.frequency ?? 'weekly',
      });
    }
  };

  const closeModal = () => {
    if (submitting) return;
    setModalState({ type: null, search: null });
  };

  const patchSearch = (searchId, patch) => {
    setSearches((current) => current.map((item) => (item.id === searchId ? { ...item, ...patch } : item)));
  };

  const removeSearch = (searchId) => {
    setSearches((current) => current.filter((item) => item.id !== searchId));
  };

  const toggleWatchlist = async (event, search) => {
    event.preventDefault();
    event.stopPropagation();

    setAnimatingId(search.id);

    try {
      const payload = await api.watchlist(search.id, !search.is_watchlisted);

      setSearches((current) =>
        current
          .map((item) => (item.id === search.id ? { ...item, ...payload.search } : item))
          .filter((item) => (watchlistedOnly ? item.is_watchlisted : true))
      );
    } finally {
      window.setTimeout(() => setAnimatingId((current) => (current === search.id ? null : current)), 280);
    }
  };

  const submitEdit = async () => {
    if (!modalState.search) return;

    setSubmitting(true);

    try {
      const { search: updated } = await api.update(modalState.search.id, {
        name: formState.name.trim(),
        frequency: formState.frequency,
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
      removeSearch(modalState.search.id);
      closeModal();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Head title={`${title} - Outlier Vault`} />

      <AppLayout
        title={title}
        pill={{ text: `${filteredSearches.length} saved`, tone: 'accent' }}
        subtitle={
          watchlistedOnly
            ? 'Each one re-runs on its own schedule and keeps the top matches.'
            : filterType
              ? `These ${filterType} searches re-run on their own schedule and keep the top matches.`
              : 'Each one re-runs on its own schedule and keeps the top matches.'
        }
        actions={
          <Link href={searchHref} className="btn-accent h-10 px-4 text-[13px]">
            <Plus className="h-3.5 w-3.5" /> New search
          </Link>
        }
        toolbar={
          <div className="surface flex flex-col gap-2 p-2 lg:flex-row lg:items-center">
            <label className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 faint" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search keyword set or label"
                aria-label="Search keyword set or label"
                className="h-9 w-full rounded-lg border border-transparent bg-transparent pr-3 pl-9 text-[13px] text-ink outline-none transition duration-200 placeholder:text-ink/35 focus:border-accent/40 focus:ring-4 focus:ring-accent/12 dark:text-white dark:placeholder:text-white/35"
              />
            </label>

            <Divider />

            <div className="flex flex-wrap items-center gap-2">
              {watchlistedOnly && (
                <FilterSelect
                  label="Search type"
                  value={searchTypeFilter}
                  active={searchTypeFilter !== 'all'}
                  onChange={(event) => setSearchTypeFilter(event.target.value)}
                >
                  <option value="all">All types</option>
                  <option value="brand">Brand</option>
                  <option value="competitor">Competitor</option>
                  <option value="product">Product</option>
                </FilterSelect>
              )}

              <FilterSelect
                label="Status"
                value={statusFilter}
                active={statusFilter !== 'all'}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="all">Any status</option>
                <option value="done">Ready</option>
                <option value="scraping">Refreshing</option>
                <option value="paused">Paused</option>
                <option value="failed">Failed</option>
              </FilterSelect>

              <FilterSelect
                label="Frequency"
                value={frequencyFilter}
                active={frequencyFilter !== 'all'}
                onChange={(event) => setFrequencyFilter(event.target.value)}
              >
                <option value="all">Any cadence</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </FilterSelect>

              {filtersActive && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-[12.5px] font-semibold muted transition hover:bg-black/[.04] hover:text-ink dark:hover:bg-white/[.06] dark:hover:text-white"
                >
                  <Close className="h-3.5 w-3.5" /> Clear
                </button>
              )}
            </div>

            <Divider />

            <div className="flex items-center gap-2">
              <span className="hidden shrink-0 text-[12px] faint sm:inline">Sort</span>
              <FilterSelect
                label="Sort by"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
              >
                {Object.entries(SORT_OPTIONS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </FilterSelect>
            </div>
          </div>
        }
      >
        {filteredSearches.length === 0 ? (
          <div className="ring-gradient animate-fade-up rounded-3xl bg-white/70 p-12 text-center backdrop-blur-2xl dark:bg-white/[.04]">
            <h2 className="font-display text-[20px] font-bold">
              {watchlistedOnly ? 'Nothing matched your watchlist filters' : `No ${filterType ?? 'saved'} searches matched`}
            </h2>
            <p className="mx-auto mt-3 max-w-sm text-[13.5px] leading-relaxed muted">
              {searches.length === 0
                ? watchlistedOnly
                  ? 'Run a search, then bookmark it to keep it on your watchlist.'
                  : 'Run a search in this category and it will show up here automatically.'
                : 'Try a different keyword, status, frequency, or sort combination.'}
            </p>
            <Link href={searchHref} className="btn-accent mx-auto mt-6 h-11 px-5 text-sm">
              Run your first search <Arrow />
            </Link>
          </div>
        ) : (
          <div className="animate-fade-up grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredSearches.map((s) => {
              const status = STATUS[s.status] ?? STATUS.done;

              return (
                <div
                  key={s.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => router.visit(s.url)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      router.visit(s.url);
                    }
                  }}
                  className={`surface-hover cursor-pointer p-5 text-left transition duration-300 ${
                    animatingId === s.id ? 'scale-[1.02] shadow-[0_20px_44px_-24px_rgba(91,52,245,.55)] ring-1 ring-accent/30' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="font-display text-[16px] font-bold">{s.name}</h2>
                      <p className="mt-1 text-[11px] font-semibold uppercase tracking-[.12em] faint">{s.search_type}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(event) => toggleWatchlist(event, s)}
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition duration-300 hover:border-accent/35 hover:text-accent dark:hover:text-accent-glow ${
                          animatingId === s.id
                            ? 'scale-110 border-accent/45 bg-accent/10 text-accent dark:border-accent/40 dark:text-accent-glow'
                            : 'border-black/[.08] dark:border-white/[.12]'
                        }`}
                        title={s.is_watchlisted ? 'Remove from watchlist' : 'Add to watchlist'}
                      >
                        <Bookmark className="h-3.5 w-3.5" filled={Boolean(s.is_watchlisted)} />
                      </button>

                      <div ref={openMenuId === s.id ? menuRef : null} className="relative">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            setOpenMenuId((current) => (current === s.id ? null : s.id));
                          }}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-black/[.08] transition hover:border-accent/35 hover:text-accent dark:border-white/[.12] dark:hover:text-accent-glow"
                          title="Search actions"
                        >
                          <Dots className="h-4 w-4" />
                        </button>

                        {openMenuId === s.id && (
                          <div
                            className="absolute top-10 right-0 z-20 w-44 rounded-2xl border border-black/[.08] bg-white p-1.5 shadow-[0_20px_44px_-24px_rgba(16,18,32,.45)] dark:border-white/[.12] dark:bg-canvas-dark"
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => openModal('edit', s)}
                              className="flex w-full rounded-xl px-3 py-2 text-left text-[13px] font-semibold transition hover:bg-black/[.04] dark:hover:bg-white/[.06]"
                            >
                              Edit keyword details
                            </button>
                            <button
                              type="button"
                              onClick={() => openModal('pause', s)}
                              disabled={s.status === 'paused'}
                              className="flex w-full rounded-xl px-3 py-2 text-left text-[13px] font-semibold transition hover:bg-black/[.04] disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-white/[.06]"
                            >
                              Pause search
                            </button>
                            <button
                              type="button"
                              onClick={() => openModal('delete', s)}
                              className="flex w-full rounded-xl px-3 py-2 text-left text-[13px] font-semibold text-hot transition hover:bg-hot/10"
                            >
                              Delete search
                            </button>
                          </div>
                        )}
                      </div>

                      <span
                        className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </div>
                  </div>

                  <p className="mt-1.5 truncate text-[12.5px] faint">{s.phrase}</p>

                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] muted">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <Trend className="h-3 w-3 text-hot" />
                      {s.result_count} videos
                    </span>
                    <span className="capitalize">{s.frequency}</span>
                    <span>Last run {formatDate(s.last_run_at)}</span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {s.keywords.slice(0, 3).map((k) => (
                      <span
                        key={k}
                        className="rounded-lg border border-black/[.06] bg-black/[.03] px-2 py-1 text-[11.5px] faint dark:border-white/[.08] dark:bg-white/[.05]"
                      >
                        {k}
                      </span>
                    ))}
                    {s.keywords.length > 3 && (
                      <span className="px-1 py-1 text-[11.5px] faint">+{s.keywords.length - 3}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </AppLayout>

      {modalState.type === 'edit' && modalState.search && (
        <ModalShell
          title="Edit keyword details"
          body="Update the saved label and refresh schedule. The keyword set stays fixed for this search."
          onClose={closeModal}
        >
          <div className="mt-6 space-y-4">
            <div>
              <p className="mb-2 text-[12px] font-semibold uppercase tracking-[.14em] faint">Keyword set</p>
              <div className="rounded-2xl border border-black/[.08] bg-black/[.03] p-3 dark:border-white/[.12] dark:bg-white/[.04]">
                <div className="flex flex-wrap gap-1.5">
                  {modalState.search.keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="rounded-lg border border-black/[.06] bg-white px-2 py-1 text-[11.5px] faint dark:border-white/[.08] dark:bg-white/[.05]"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[.14em] faint">Label</label>
              <input
                value={formState.name}
                onChange={(event) => setFormState((current) => ({ ...current, name: event.target.value }))}
                className="field h-11 text-sm"
              />
            </div>

            <div>
              <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[.14em] faint">Schedule</label>
              <div className="flex gap-2">
                {['weekly', 'monthly'].map((frequency) => (
                  <button
                    key={frequency}
                    type="button"
                    onClick={() => setFormState((current) => ({ ...current, frequency }))}
                    className={`h-11 flex-1 rounded-xl border text-[13px] font-semibold transition ${
                      formState.frequency === frequency
                        ? 'border-accent/45 bg-accent/10 text-accent dark:text-accent-glow'
                        : 'border-black/[.08] muted hover:border-accent/35 dark:border-white/[.12]'
                    }`}
                  >
                    {frequency === 'weekly' ? 'Weekly' : 'Monthly'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <button type="button" onClick={closeModal} className="btn-ghost h-10 px-4 text-sm" disabled={submitting}>
              Cancel
            </button>
            <button type="button" onClick={submitEdit} className="btn-accent h-10 px-4 text-sm" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </ModalShell>
      )}

      {modalState.type === 'pause' && modalState.search && (
        <ModalShell
          title="Pause search"
          body="This will keep the search record, but it will not trigger future refreshes until resumed."
          onClose={closeModal}
        >
          <div className="mt-6 rounded-2xl border border-black/[.08] bg-black/[.03] p-4 text-[13.5px] muted dark:border-white/[.12] dark:bg-white/[.04]">
            <p className="font-semibold text-ink dark:text-white">{modalState.search.name}</p>
            <p className="mt-1">Keyword set stays intact and results remain available.</p>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <button type="button" onClick={closeModal} className="btn-ghost h-10 px-4 text-sm" disabled={submitting}>
              Cancel
            </button>
            <button type="button" onClick={confirmPause} className="btn-accent h-10 px-4 text-sm" disabled={submitting}>
              {submitting ? 'Pausing...' : 'Pause search'}
            </button>
          </div>
        </ModalShell>
      )}

      {modalState.type === 'delete' && modalState.search && (
        <ModalShell
          title="Delete search"
          body="This removes the saved keyword record only. It does not delete the underlying viral video records."
          onClose={closeModal}
        >
          <div className="mt-6 rounded-2xl border border-hot/20 bg-hot/10 p-4 text-[13.5px] text-hot">
            <p className="font-semibold">{modalState.search.name}</p>
            <p className="mt-1">This action hides the search from your lists and stops future runs.</p>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <button type="button" onClick={closeModal} className="btn-ghost h-10 px-4 text-sm" disabled={submitting}>
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              className="h-10 rounded-xl border border-hot/30 px-4 text-sm font-semibold text-hot transition hover:bg-hot/10"
              disabled={submitting}
            >
              {submitting ? 'Deleting...' : 'Delete search'}
            </button>
          </div>
        </ModalShell>
      )}
    </>
  );
}
