import { Link, useForm, usePage } from '@inertiajs/react';

import AppLayout from '../components/AppLayout.jsx';
import { User, Sun, Store, Exit } from '../../landing/components/Icons.jsx';

const NAV = [
  { key: 'account', label: 'Account', href: '/settings/account', icon: User },
  { key: 'appearance', label: 'Appearance', href: '/settings/appearance', icon: Sun },
  { key: 'subscription', label: 'Subscription', href: '/settings/subscription', icon: Store },
];

export default function SettingsShell({ section, heading, eyebrow, children, hideHeader = false, hideSidebar = false }) {
  const { auth = {} } = usePage().props;
  const logout = useForm({});

  const signOut = () => {
    logout.post('/logout');
  };

  return (
    <AppLayout width="max-w-7xl">
      <div className={hideSidebar ? '' : 'grid gap-5 xl:grid-cols-[240px_minmax(0,1fr)]'}>
        {!hideSidebar && (
          <aside className="space-y-4">
            <div className="surface p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/12 font-display text-[18px] font-bold text-accent dark:text-accent-glow">
                  {(auth.user?.name ?? 'V').slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold text-ink dark:text-white">{auth.user?.name ?? 'Account'}</p>
                  <p className="truncate text-[11.5px] faint">{auth.user?.email ?? 'No email found'}</p>
                </div>
              </div>
            </div>

            <div className="surface p-3">
              <nav className="space-y-1">
                {NAV.map((item) => {
                  const Icon = item.icon;
                  const active = item.key === section;

                  return (
                    <Link
                      key={item.key}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-[13px] font-semibold transition ${
                        active
                          ? 'bg-accent/10 text-accent dark:bg-accent/15 dark:text-accent-glow'
                          : 'muted hover:bg-black/[.04] hover:text-ink dark:hover:bg-white/[.06] dark:hover:text-white'
                      }`}
                    >
                      <span className={`flex h-8 w-8 items-center justify-center rounded-xl border ${active ? 'border-accent/20 bg-white dark:bg-white/[.06]' : 'border-black/[.06] bg-black/[.02] dark:border-white/[.08] dark:bg-white/[.03]'}`}>
                        <Icon className="h-4 w-4" />
                      </span>
                      {item.label}
                      {active && <span className="ml-auto h-2 w-2 rounded-full bg-[#ff4f87]" />}
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-3 border-t border-black/[.06] pt-3 dark:border-white/[.08]">
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-[13px] font-semibold text-ink/45 transition hover:bg-hot/8 hover:text-hot dark:text-white/40"
                  disabled
                  title="Delete account flow will be added later"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-black/[.06] bg-black/[.02] dark:border-white/[.08] dark:bg-white/[.03]">
                    <Exit className="h-4 w-4" />
                  </span>
                  Delete account
                </button>
              </div>
            </div>
          </aside>
        )}

        <section className="surface overflow-hidden">
          {!hideHeader && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/[.06] px-6 py-5 dark:border-white/[.08]">
              <div>
                <p className="text-[11px] font-semibold tracking-[.18em] text-accent uppercase dark:text-accent-glow">{eyebrow}</p>
                <h1 className="mt-1 font-display text-[24px] font-bold tracking-[-.02em]">{heading}</h1>
              </div>

              <button
                type="button"
                onClick={signOut}
                disabled={logout.processing}
                className="inline-flex h-11 items-center gap-2 rounded-2xl border border-black/[.08] px-4 text-[13px] font-semibold transition hover:border-accent/35 hover:text-accent dark:border-white/[.12] dark:hover:text-accent-glow"
              >
                <Exit className="h-4 w-4" />
                {logout.processing ? 'Logging out...' : 'Log out'}
              </button>
            </div>
          )}

          <div className="px-6 py-6">{children}</div>
        </section>
      </div>
    </AppLayout>
  );
}
