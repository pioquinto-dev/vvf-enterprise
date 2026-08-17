import { useEffect, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';

import AppLayout from './components/AppLayout.jsx';
import SearchWizard from './components/SearchWizard.jsx';
import SavedSearchRow from './components/SavedSearchRow.jsx';
import { Arrow } from '../landing/components/Icons.jsx';
import { fetchNotifications, readTracked, updateTracked } from '../landing/flow/api.js';

const POLL_MS = 10000;

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
          <Link href="/bookmark" className="btn btn--g btn--sm">
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
  const { flash = {}, recent = [] } = usePage().props;
  const [readyModal, setReadyModal] = useState(null);

  useEffect(() => {
    if (readyModal) return undefined;

    let cancelled = false;
    let timer;

    const poll = async () => {
      if (cancelled) return;

      const activeTracked = readTracked().filter((entry) => entry?.id && entry.completedPromptShown !== true);

      if (activeTracked.length === 0) return;

      try {
        const payload = await fetchNotifications(activeTracked.map((entry) => entry.id));
        const searches = payload?.searches ?? [];
        const done = searches.find((search) => search?.status === 'done');

        if (done) {
          updateTracked(done.id, {
            completedPromptShown: true,
            name: done.name,
            url: done.url,
          });
          if (!cancelled) setReadyModal(done);
          return;
        }
      } catch {
        /* transient — the next tick will retry */
      }

      timer = window.setTimeout(poll, POLL_MS);
    };

    poll();

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [readyModal]);

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

        <SearchWizard subjectExtra={<RecentCard searches={recent} />} />
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
