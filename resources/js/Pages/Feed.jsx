import { Head, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

import AppLayout from './components/AppLayout.jsx';
import EntitlementsBar from './components/EntitlementsBar.jsx';
import MyFeed from './components/MyFeed.jsx';

/**
 * "My Feed" (mockup: V5 Home/My Feed) — the signed-in default landing. The feed
 * itself is built from the user's searches; the search homepage stays separate
 * at /dashboard. Typing here and choosing a search type hands off to it with
 * the keyword prefilled, landing straight on step 2 (add keywords).
 */
function FeedSearchBar() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDocClick = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const goToSearch = (type) => {
    const phrase = query.trim();
    if (!phrase) return;
    setOpen(false);
    router.visit(`/dashboard?type=${type}&q=${encodeURIComponent(phrase)}`);
  };

  const hasQuery = query.trim().length > 0;

  return (
    <div className="mf-qs" ref={wrapRef}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" aria-hidden="true">
        <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.6-3.6" />
      </svg>
      <input
        className="mf-qs__in"
        type="text"
        placeholder="Search a brand or a product"
        aria-label="Search a brand or a product"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && hasQuery) setOpen(true); }}
      />
      <div className="mf-qs__menuwrap">
        <button
          type="button"
          className="mf-qs__btn"
          disabled={!hasQuery}
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          Search
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
        </button>
        {open && hasQuery && (
          <div className="mf-qs__menu" role="menu">
            <button type="button" role="menuitem" onClick={() => goToSearch('brand')}>Search Brand</button>
            <button type="button" role="menuitem" onClick={() => goToSearch('product')}>Search Product</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Feed({ feed = {} }) {
  const currentPath = typeof window === 'undefined'
    ? '/home'
    : `${window.location.pathname}${window.location.search}`;

  return (
    <>
      <Head title="My Feed · Brand Beacon" />
      <AppLayout width="max-w-none">
        <div className="mf-header">
          <FeedSearchBar />
          <EntitlementsBar />
        </div>
        <MyFeed feed={feed} currentPath={currentPath} />
      </AppLayout>
    </>
  );
}
