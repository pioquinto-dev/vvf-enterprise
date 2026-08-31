import { Link, usePage } from '@inertiajs/react';

import AppLayout from '../components/AppLayout.jsx';
import { User, Sun, Store, Spark } from '../../landing/components/Icons.jsx';

const NAV = [
  { key: 'account', label: 'Account', href: '/settings/account', icon: User },
  { key: 'appearance', label: 'Appearance', href: '/settings/appearance', icon: Sun },
  { key: 'subscription', label: 'Subscription', href: '/settings/subscription', icon: Store },
  { key: 'plans', label: 'Plans', href: '/plans', icon: Spark },
];

/**
 * The settings shell — the mockup's `.st` two-column layout (account card +
 * nav on the left, section content on the right) under the app shell.
 */
export default function SettingsShell({ section, children }) {
  const { auth = {} } = usePage().props;
  const initial = (auth.user?.name ?? auth.user?.email ?? 'A').slice(0, 1).toUpperCase();

  return (
    <AppLayout
      width="max-w-[1240px]"
      title="Settings"
      subtitle="Manage your account, preferences and billing."
    >
      <div className="st">
        <div>
          <div className="st__u">
            <span className="avat">{initial}</span>
            <span style={{ minWidth: 0, display: 'block', overflow: 'hidden' }}>
              <span className="acct__n" style={{ fontSize: '.88rem' }}>{auth.user?.name ?? 'Account'}</span>
              <span className="acct__e">{auth.user?.email ?? 'No email found'}</span>
            </span>
          </div>

          <nav className="st__nav">
            {NAV.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.key} href={item.href} className={`st__i${item.key === section ? ' is-on' : ''}`}>
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div>{children}</div>
      </div>
    </AppLayout>
  );
}
