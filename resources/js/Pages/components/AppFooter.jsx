import { Link, usePage } from '@inertiajs/react';

const FOOT_NAV = [
  { label: 'Home', href: '/' },
  { label: 'Bookmarks', href: '/bookmarks' },
  { label: 'Contact', href: '/contact' },
  { label: 'Pricing', href: '/trial' },
];

/**
 * Shared footer that sits under the content column in AppLayout. Light only,
 * styled with the Brand Beacon `.bb-foot` rules.
 */
export default function AppFooter({ width = 'max-w-6xl', label = '© 2026 Brand Beacon · TikTok viral intelligence for brands' }) {
  const { billing = {} } = usePage().props;
  const navItems = FOOT_NAV.filter((item) => item.href !== '/trial' || (billing.trialEligible ?? true));

  return (
    <div className={`mx-auto w-full ${width}`}>
      <footer className="bb-foot">
        <nav>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <p>{label}</p>
      </footer>
    </div>
  );
}
