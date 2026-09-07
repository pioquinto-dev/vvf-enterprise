import { Head, Link } from '@inertiajs/react';

import AppLayout from './components/AppLayout.jsx';
import MyFeed from './components/MyFeed.jsx';

/**
 * "My Feed" (mockup: V5 Home/My Feed) — the signed-in default landing. The feed
 * itself is built from the user's searches; the search homepage stays separate
 * at /dashboard, so the search prompt here just hands off to it.
 */
export default function Feed({ feed = {} }) {
  const currentPath = typeof window === 'undefined'
    ? '/home'
    : `${window.location.pathname}${window.location.search}`;

  return (
    <>
      <Head title="My Feed · Brand Beacon" />
      <AppLayout width="max-w-none" title="My Feed" subtitle="Breakouts, sounds and hashtags from the searches you track.">
        <Link href="/dashboard" className="mf-qs" aria-label="Search a brand or a product">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.6-3.6" />
          </svg>
          <span className="mf-qs__ph">Search a brand or a product</span>
          <span className="mf-qs__btn">Search</span>
        </Link>
        <MyFeed feed={feed} currentPath={currentPath} />
      </AppLayout>
    </>
  );
}
