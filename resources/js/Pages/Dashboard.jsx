import { useEffect, useRef, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';

import AppLayout from './components/AppLayout.jsx';
import SearchWizard from './components/SearchWizard.jsx';
import SavedSearchRow from './components/SavedSearchRow.jsx';
import { Arrow } from '../landing/components/Icons.jsx';
import { fetchNotifications, readTracked, updateTracked } from '../landing/flow/api.js';

const POLL_MS = 10000;
const RECENT_LIMIT = 3;

function mergeRecentSearches(serverRecent = [], trackedEntries = []) {
  const trackedMap = new Map(
    trackedEntries
      .filter((entry) => entry?.id)
      .map((entry) => [
        String(entry.id),
        {
          id: entry.id,
          name: entry.name ?? 'New search',
          phrase: entry.name ?? 'New search',
          search_type: entry.search_type ?? 'brand',
          frequency: entry.frequency ?? 'weekly',
          status: entry.status ?? 'scraping',
          url: entry.url ?? `/bookmarks/${entry.id}`,
          result_count: entry.result_count ?? 0,
          last_run_at: entry.last_run_at ?? null,
          is_watchlisted: entry.is_watchlisted ?? false,
        },
      ])
  );

  serverRecent.forEach((search) => {
    if (!search?.id) return;
    trackedMap.set(String(search.id), { ...trackedMap.get(String(search.id)), ...search });
  });

  return Array.from(trackedMap.values()).slice(0, RECENT_LIMIT);
}

/** "Pick up where you left off" — the three most recent saved searches. */
function RecentCard({ searches }) {
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
          {searches.map((search) => (
            <SavedSearchRow key={search.id} search={search} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { flash = {}, recent = [], searchSuggestions = {} } = usePage().props;
  const [readyModal, setReadyModal] = useState(null);
  const [recentSearches, setRecentSearches] = useState(() => mergeRecentSearches(recent, readTracked()));
  const polling = useRef(false);

  useEffect(() => {
    setRecentSearches(mergeRecentSearches(recent, readTracked()));
  }, [recent]);

  useEffect(() => {
    if (readyModal) return undefined;

    let cancelled = false;
    let timer;

    const poll = async () => {
      if (cancelled || polling.current) return;

      const tracked = readTracked().filter((entry) => entry?.id).slice(0, 10);

      if (tracked.length === 0) {
        setRecentSearches((current) => (current.length > 0 ? current : []));
        return;
      }

      polling.current = true;

      const activeTracked = tracked.filter((entry) => entry.completedPromptShown !== true);

      if (activeTracked.length === 0) {
        polling.current = false;
        setRecentSearches(mergeRecentSearches(recent, tracked));
        return;
      }

      try {
        const payload = await fetchNotifications(activeTracked.map((entry) => entry.id));
        if (cancelled) return;

        const searches = payload?.searches ?? [];
        setRecentSearches(mergeRecentSearches([...recent, ...searches], tracked));

        const done = searches.find((search) => search?.status === 'done');

        if (done) {
          updateTracked(done.id, {
            completedPromptShown: true,
            name: done.name,
            url: done.url,
          });
          if (!cancelled) {
            setRecentSearches((current) => mergeRecentSearches(
              [
                done,
                ...current.filter((search) => String(search.id) !== String(done.id)),
              ],
              readTracked()
            ));
          }
          if (!cancelled) setReadyModal(done);
          return;
        }
      } catch {
        /* transient — the next tick will retry */
        if (cancelled) return;
        setRecentSearches(mergeRecentSearches(recent, tracked));
      } finally {
        polling.current = false;
      }

      timer = window.setTimeout(poll, POLL_MS);
    };

    poll();

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [readyModal, recent]);

  const closeReadyModal = () => setReadyModal(null);
  const viewResults = () => {
    if (!readyModal?.url) return closeReadyModal();
    router.visit(readyModal.url);
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

        <SearchWizard subjectExtra={<RecentCard searches={recentSearches} />} suggestionsByType={searchSuggestions} />
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
    </>
  );
}
