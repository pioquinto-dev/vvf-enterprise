import { useState } from 'react';

import { Logo } from '../components/Icons.jsx';

const COLS = [
  { h: 'Product', links: [{ label: 'Outlier Vault', href: '#top' }, { label: 'Brand Tracking', href: '#top' }, { label: 'Creator Shortlists', href: '#top' }, { label: 'Virality Alerts', href: '#top' }, { label: 'Changelog', href: '#top' }] },
  { h: 'Company', links: [{ label: 'About', href: '#top' }, { label: 'Careers', href: '#top' }, { label: 'Blog', href: '#top' }, { label: 'Press kit', href: '#top' }, { label: 'Contact', href: '/contact' }] },
  { h: 'Resources', links: [{ label: 'TikTok benchmarks', href: '#top' }, { label: 'Category reports', href: '#top' }, { label: 'Help center', href: '#top' }, { label: 'API docs', href: '#top' }, { label: 'Status', href: '#top' }] },
  { h: 'Legal', links: [{ label: 'Terms', href: '/terms' }, { label: 'Privacy', href: '/privacy' }, { label: 'DPA', href: '/dpa' }, { label: 'Security', href: '/security' }] },
];

export default function Footer() {
  const [subscribed, setSubscribed] = useState(false);

  return (
    <footer className="ftr">
      <div className="wrap">
        <div className="ftr__top">
          <div>
            <a href="#top" className="brand">
              <Logo className="h-8 w-8" />
              <span>Brand Beacon</span>
            </a>
            <p className="ftr__blurb">
              TikTok social intelligence for brands. Find the viral videos moving your category, and the creators behind
              them.
            </p>
            <form
              className="ftr__form"
              onSubmit={(e) => {
                e.preventDefault();
                setSubscribed(true);
              }}
            >
              <label htmlFor="nl">Weekly viral digest</label>
              <div className="ftr__row">
                <input id="nl" type="email" required placeholder="you@brand.com" />
                <button type="submit" className="btn btn--primary">
                  {subscribed ? 'Subscribed' : 'Subscribe'}
                </button>
              </div>
              <p className="ftr__fine">One email a week. Unsubscribe anytime.</p>
            </form>
          </div>

          <div className="ftr__cols">
            {COLS.map((col) => (
              <div key={col.h}>
                <h4>{col.h}</h4>
                <ul>
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <a href={link.href}>{link.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="ftr__btm">
          <p>© 2026 Brand Beacon. TikTok viral intelligence for brands.</p>
          <nav>
            <a href="/terms">Terms</a>
            <a href="/privacy">Privacy</a>
            <a href="/security">Security</a>
            <a href="/contact">Contact</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
