import { useEffect, useRef, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';

import AppLayout from './components/AppLayout.jsx';
import SearchWizard from './components/SearchWizard.jsx';
import SavedSearchRow from './components/SavedSearchRow.jsx';
import { Arrow } from '../landing/components/Icons.jsx';
import { fetchRecentSearches, savedSearch as savedSearchApi } from '../landing/flow/api.js';

const POLL_MS = 10000;
const ACTIVE_SEARCH_STATUSES = new Set(['pending', 'queued', 'running', 'scraping']);

/** "Pick up where you left off" — the three most recent saved searches. */
function RecentCard({ searches, retryingSearchId, onRetry }) {
  if (!searches?.length) return null;

  return (
    <div className="card" style={{ marginTop: 22 }}>
      <div className="sect">
        <div className="sect__h">
          <div>
            <p className="sect__n">Recent</p>
            <h2>Pick up where you left off</h2>
          </div>
          <Link href="/bookmarks" className="btn btn--g btn--sm">
            View all <Arrow />
          </Link>
        </div>
        <div className="rows">
          {searches.map((search) => {
            const canRetry = search.can_retry_initial === true;

            return (
              <SavedSearchRow
                key={search.id}
                search={search}
                onNavigate={() => router.visit(search.url)}
                actions={canRetry ? (
                  <button
                    type="button"
                    className="btn btn--g btn--sm"
                    onClick={(event) => {
                      event.stopPropagation();
                      onRetry(search);
                    }}
                    disabled={retryingSearchId === search.id}
                  >
                    {retryingSearchId === search.id ? 'Retrying...' : 'Retry search'}
                  </button>
                ) : undefined}
              />
            );
          })}
        </div>
      </div>
    </div>
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
  const { flash = {}, recent = [], searchSuggestions = {} } = usePage().props;
  const [readyModal, setReadyModal] = useState(null);
  const [failedModal, setFailedModal] = useState(null);
  const [retryingSearchId, setRetryingSearchId] = useState(null);
  const [recentSearches, setRecentSearches] = useState(recent);
  const polling = useRef(false);
  const recentSearchesRef = useRef(recent);
  const recentStatuses = useRef(new Map(recent.map((search) => [String(search.id), search.status])));
  const hasActiveRecentSearch = recentSearches.some((search) => ACTIVE_SEARCH_STATUSES.has(search.status));

  const applyRecentSearches = (searches, notifyOnTerminal = false) => {
    const previousStatuses = recentStatuses.current;
    recentStatuses.current = new Map(searches.map((search) => [String(search.id), search.status]));
    recentSearchesRef.current = searches;
    setRecentSearches(searches);

    if (!notifyOnTerminal) return;

    const terminal = searches.find((search) => (
      ACTIVE_SEARCH_STATUSES.has(previousStatuses.get(String(search.id)))
      && (search.status === 'done' || search.status === 'failed')
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
    recentStatuses.current = new Map(recent.map((search) => [String(search.id), search.status]));
    recentSearchesRef.current = recent;
    setRecentSearches(recent);
  }, [recent]);

  useEffect(() => {
    if (readyModal || failedModal) return undefined;

    let cancelled = false;
    let timer;

    const poll = async () => {
      if (cancelled || polling.current) return;

      if (!recentSearchesRef.current.some((search) => ACTIVE_SEARCH_STATUSES.has(search.status))) {
        return;
      }

      polling.current = true;

      const activeTracked = tracked.filter((entry) => entry.completedPromptShown !== true);

      try {
        const payload = await fetchRecentSearches();
        if (cancelled) return;

        const searches = payload?.searches ?? [];
        applyRecentSearches(searches, true);
      } catch {
        /* transient — the next tick will retry */
      } finally {
        polling.current = false;
      }

      if (!cancelled) {
        timer = window.setTimeout(poll, POLL_MS);
      }
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
      const search = payload?.search;

      if (search) {
        await refreshRecent();
      }

      setFailedModal(null);
    } finally {
      setRetryingSearchId(null);
    }
  };

  return (
    <>
      <Head title="Dashboard · Brand Beacon" />

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
          subjectExtra={<RecentCard searches={recentSearches} retryingSearchId={retryingSearchId} onRetry={retryFailedSearch} />}
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
