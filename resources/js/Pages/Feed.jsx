import { Head, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

import AppLayout from './components/AppLayout.jsx';
import EntitlementsBar from './components/EntitlementsBar.jsx';
import MyFeed from './components/MyFeed.jsx';
import SearchFlashModals from './components/SearchFlashModals.jsx';

/**
 * "My Feed" (mockup: V5 Home/My Feed) — the signed-in landing page. The feed is
 * built from the user's searches; typing here and choosing a search type hands
 * off to the matching hub (/brands or /products) with the subject prefilled,
 * which opens that page's inline search flow on the keyword step.
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

  // Brand and product searches each own a hub with the inline flow; ?q= drops
  // the typed subject straight into it.
  const goToSearch = (type) => {
    const phrase = query.trim();
    if (!phrase) return;
    setOpen(false);
    router.visit(`${type === 'product' ? '/products' : '/brands'}?q=${encodeURIComponent(phrase)}`);
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
      <AppLayout width="max-w-[1440px] lg:px-6 xl:px-8">
        <div className="mf-header">
          <FeedSearchBar />
          <EntitlementsBar />
        </div>
        <MyFeed feed={feed} currentPath={currentPath} />
      </AppLayout>

      {/* Searches started from sign-up or checkout land here now, so their
          progress and credit prompts follow them onto the feed. */}
      <SearchFlashModals currentPath={currentPath} />
    </>
  );
}
