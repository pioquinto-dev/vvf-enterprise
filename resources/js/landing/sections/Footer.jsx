import { useForm } from '@inertiajs/react';

import { Logo } from '../components/Icons.jsx';

// { label: 'Blogs', href: '/#top' }
const COLS = [
  { h: 'Product', links: [{ label: 'TikTok Brand Tracking', href: '/tiktok-brand-tracking' }, { label: 'TikTok Product Research', href: '/tiktok-product-research' }, { label: 'Viral Video Monitoring', href: '/viral-video-monitoring' }] },
  { h: 'Company', links: [{ label: 'Support', href: '/support' }, { label: 'Contact', href: '/contact' }] },
  { h: 'Resources', links: [{ label: 'Brand Tracking', href: '/tiktok-brand-tracking' }, { label: 'UGC Trend Discovery', href: '/ugc-trend-discovery' }] },
  { h: 'Legal', links: [{ label: 'Terms', href: '/terms' }, { label: 'Privacy', href: '/privacy' }, { label: 'DPA', href: '/dpa' }, { label: 'Security', href: '/security' }] },
];

export default function Footer({ homeHref = '#top' }) {
  const form = useForm({ email: '' });

  const subscribe = (e) => {
    e.preventDefault();
    form.post('/newsletter', {
      preserveScroll: true,
      onSuccess: () => form.reset('email'),
    });
  };

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
            <form className="ftr__form" onSubmit={subscribe}>
              <label htmlFor="nl">Weekly viral digest</label>
              <div className="ftr__row">
                <input
                  id="nl"
                  type="email"
                  required
                  placeholder="you@brand.com"
                  autoComplete="email"
                  value={form.data.email}
                  onChange={(e) => form.setData('email', e.target.value)}
                  disabled={form.processing}
                />
                <button type="submit" className="btn btn--primary" disabled={form.processing}>
                  {form.processing ? 'Subscribing…' : form.wasSuccessful ? 'Subscribed' : 'Subscribe'}
                </button>
              </div>
              {form.errors.email ? (
                <p className="ftr__fine ftr__fine--error">{form.errors.email}</p>
              ) : form.wasSuccessful ? (
                <p className="ftr__fine">Thanks — you're on the list. One email a week.</p>
              ) : (
                <p className="ftr__fine">One email a week. Unsubscribe anytime.</p>
              )}
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
