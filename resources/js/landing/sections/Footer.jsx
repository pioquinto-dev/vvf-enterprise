import { useState } from 'react';

import { Logo } from '../components/Icons.jsx';

const COLS = [
  { h: 'Product', links: [{ label: 'TikTok Brand Tracking', href: '/tiktok-brand-tracking' }, { label: 'TikTok Product Research', href: '/tiktok-product-research' }, { label: 'Viral Video Monitoring', href: '/viral-video-monitoring' }] },
  { h: 'Company', links: [{ label: 'Blogs', href: '/#top' }, { label: 'Contact', href: '/contact' }] },
  { h: 'Resources', links: [{ label: 'Brand Tracking', href: '/tiktok-brand-tracking' }, { label: 'UGC Trend Discovery', href: '/ugc-trend-discovery' }] },
  { h: 'Legal', links: [{ label: 'Terms', href: '/terms' }, { label: 'Privacy', href: '/privacy' }, { label: 'DPA', href: '/dpa' }, { label: 'Security', href: '/security' }] },
];

export default function Footer({ homeHref = '#top' }) {
  const [subscribed, setSubscribed] = useState(false);

  return (
    <footer className="ftr">
      <div className="wrap">
        <div className="ftr__top">
          <div>
            <a href={homeHref} className="brand">
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
        </div>
      </div>
    </footer>
  );
}
