import { Head, Link, usePage } from '@inertiajs/react';

import AppLayout from './components/AppLayout.jsx';
import { Arrow, Library, Search, Bookmark } from '../landing/components/Icons.jsx';

function Stat({ label, value, hint }) {
  return (
    <div className="surface p-5">
      <p className="text-[11.5px] font-semibold tracking-[.14em] faint uppercase">{label}</p>
      <p className="mt-3 font-display text-[26px] font-bold tracking-[-.02em]">{value}</p>
      {hint && <p className="mt-1.5 text-[12px] faint">{hint}</p>}
    </div>
  );
}

function QuickLink({ href, icon: Icon, title, blurb }) {
  return (
    <Link href={href} className="surface-hover group flex items-start gap-3.5 p-5">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent dark:text-accent-glow">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        <span className="flex items-center gap-1.5 font-display text-[15px] font-bold">
          {title}
          <Arrow className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
        <span className="mt-1 block text-[13px] leading-relaxed muted">{blurb}</span>
      </span>
    </Link>
  );
}

export default function Dashboard() {
  const { auth = {}, billing = {}, flash = {} } = usePage().props;

  const creditsLimit = typeof billing.searchCreditsLimit === 'number' ? billing.searchCreditsLimit : null;
  const bookmarkLimit = billing.bookmarkLimit === -1 ? null : (billing.bookmarkLimit ?? 0);

  return (
    <>
      <Head title="Dashboard — VVF" />

      <AppLayout
        title={`Welcome back${auth.user?.name ? `, ${auth.user.name}` : ''}`}
        pill={{ text: billing.currentPlan ?? 'free', tone: billing.hasPaidPlan ? 'ok' : 'accent' }}
        actions={
          <Link href="/search?type=brand" className="btn-accent h-10 px-4 text-[13px]">
            New search <Arrow />
          </Link>
        }
      >
        {flash.status && (
          <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
            {flash.status}
          </div>
        )}

        <div className="animate-fade-up grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Stat label="Current plan" value={<span className="capitalize">{billing.currentPlan ?? 'free'}</span>} />
          <Stat
            label="Search credits"
            value={`${billing.searchCreditsRemaining ?? 0}${creditsLimit !== null ? ` / ${creditsLimit}` : ''}`}
            hint={`${billing.searchCreditsUsed ?? 0} used`}
          />
          <Stat
            label="Bookmarks"
            value={`${billing.bookmarkCount ?? 0}${bookmarkLimit !== null ? ` / ${bookmarkLimit}` : ''}`}
            hint={bookmarkLimit === null ? 'Unlimited' : undefined}
          />
        </div>

        <h2 className="mt-10 font-display text-[17px] font-bold">Jump back in</h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <QuickLink
            href="/saved-searches"
            icon={Library}
            title="Watchlist"
            blurb="Every saved search, refreshing on its own schedule."
          />
          <QuickLink
            href="/search?type=brand"
            icon={Search}
            title="Run a new search"
            blurb="Turn one phrase into a self-refreshing list of viral videos."
          />
          <QuickLink
            href="/plans"
            icon={Bookmark}
            title="Plans & billing"
            blurb="Compare plans and unlock unlimited refreshes."
          />
        </div>

        <div className="surface mt-10 p-5">
          <p className="text-[11.5px] font-semibold tracking-[.14em] faint uppercase">Signed in as</p>
          <p className="mt-2.5 text-[14px] font-semibold">{auth.user?.email ?? 'Unknown account'}</p>
          <div className="mt-4">
            <Link href="/settings/account" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-accent transition hover:gap-2 dark:text-accent-glow">
              Manage account <Arrow className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </AppLayout>
    </>
  );
}
