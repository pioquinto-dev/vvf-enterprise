import { Link, usePage } from '@inertiajs/react';

const FOOT_NAV = [
  { label: 'Home', href: '/' },
  { label: 'Watchlist', href: '/saved-searches' },
  { label: 'Pricing', href: '/trial' },
];

/**
 * Shared footer that sits under the content column in AppLayout. Hidden on
 * mobile, where the bottom tab bar owns that space instead.
 */
export default function AppFooter({ label = '© VVF - find viral videos daily', className = '' }) {
  const { billing = {} } = usePage().props;
  const navItems = FOOT_NAV.filter((item) => item.href !== '/trial' || (billing.trialEligible ?? true));

  return (
    <footer className={`border-t border-black/[.06] dark:border-white/[.08] ${className}`.trim()}>
      <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <nav className="flex flex-wrap items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-2.5 py-1.5 text-[12.5px] font-semibold muted transition hover:bg-black/[.04] hover:text-ink dark:hover:bg-white/[.06] dark:hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <p className="text-[12px] faint">{label}</p>
      </div>
    </footer>
  );
}
