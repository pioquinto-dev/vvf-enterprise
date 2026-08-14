import { Head, Link, usePage } from '@inertiajs/react';

import AppLayout from './components/AppLayout.jsx';
import SearchWizard from './components/SearchWizard.jsx';
import SavedSearchRow from './components/SavedSearchRow.jsx';
import { Arrow } from '../landing/components/Icons.jsx';

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
    </>
  );
}
