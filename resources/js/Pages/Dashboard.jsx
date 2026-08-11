import { Head, usePage } from '@inertiajs/react';

import AppLayout from './components/AppLayout.jsx';
import EntitlementsBar from './components/EntitlementsBar.jsx';
import SearchWizard from './components/SearchWizard.jsx';

export default function Dashboard() {
  const { flash = {} } = usePage().props;

  return (
    <>
      <Head title="Dashboard - Outlier Vault" />

      <AppLayout width="max-w-4xl">
        {flash.status && (
          <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
            {flash.status}
          </div>
        )}

        <EntitlementsBar />

        <SearchWizard
          heading="Start a search"
          subheading="Pick one brand, competitor, or product — we widen it with smarter keywords on the next step."
        />
      </AppLayout>
    </>
  );
}
