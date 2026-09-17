import { useEffect, useRef, useState } from 'react';
import { router } from '@inertiajs/react';

import { SearchCompletionModal } from './SearchFlashModals.jsx';
import { withReturnTo } from '../utils/navigation.js';
import { readTracked, savedSearch, untrackSearch, updateTracked } from '../../landing/flow/api.js';

/**
 * App-wide "search done" notifier. Mounted once in AppLayout so the modal
 * shows wherever the user is when a run lands (results page, Brand searches,
 * Feed, Library...).
 *
 * Source of truth is the tracked-search list in sessionStorage: every flow
 * that starts a run calls trackSearch() (inline brand/product flow, sign-up
 * and checkout hand-offs). Each tracked search is polled by id, so it no
 * longer matters whether it is in the dashboard's top-3 "recent" list or
 * whether this page saw it in an active state first.
 */

const POLL_MS = 6000;
const ACTIVE = new Set(['pending', 'queued', 'running', 'scraping']);

const pending = () => readTracked().filter((entry) => (
  entry?.id != null && entry.completedPromptShown !== true && entry.failedPromptShown !== true
));

export default function SearchDoneWatcher({ signedIn }) {
  const [modal, setModal] = useState(null);
  const busy = useRef(false);

  useEffect(() => {
    if (!signedIn || modal) return undefined;

    let cancelled = false;
    let timer;

    const poll = async () => {
      const tracked = pending();
      if (tracked.length === 0 || busy.current) {
        // Nothing to watch yet; keep a light heartbeat so a search started
        // later on this same page (inline flow) is still picked up.
        if (!cancelled) timer = window.setTimeout(poll, POLL_MS);
        return;
      }

      busy.current = true;
      const finished = [];
      const failed = [];

      try {
        const rows = await Promise.all(tracked.map(async (entry) => {
          try {
            const payload = await savedSearch.get(entry.id);
            return { entry, search: payload?.search ?? null };
          } catch (error) {
            // Deleted or no longer accessible: stop watching it.
            if (error?.status === 404 || error?.status === 403) untrackSearch(entry.id);
            return { entry, search: null };
          }
        }));

        rows.forEach(({ entry, search }) => {
          const status = String(search?.status ?? '').toLowerCase();
          if (!search || ACTIVE.has(status)) return;
          const row = { ...search, url: search.url ?? entry.url, name: search.name ?? entry.name };
          if (status !== 'done' && status !== 'failed') {
            // Paused/cancelled before a run landed: nothing to announce.
            untrackSearch(entry.id);
            return;
          }
          if (status === 'failed') {
            failed.push(row);
            updateTracked(entry.id, { failedPromptShown: true });
          } else {
            finished.push(row);
            updateTracked(entry.id, { completedPromptShown: true });
          }
        });
      } finally {
        busy.current = false;
      }

      if (cancelled) return;

      if (finished.length > 0 || failed.length > 0) {
        // Credits are charged at start; refresh shared billing so the header
        // is accurate by the time the modal is on screen.
        router.reload({
          only: ['billing'],
          preserveScroll: true,
          preserveState: true,
          onFinish: () => setModal({ finished, failed }),
        });
        return;
      }

      timer = window.setTimeout(poll, POLL_MS);
    };

    poll();

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [signedIn, modal]);

  const onCurrentPage = (search) => {
    if (!search?.url || typeof window === 'undefined') return false;
    try {
      return new URL(search.url, window.location.origin).pathname === window.location.pathname;
    } catch {
      return false;
    }
  };

  return (
    <SearchCompletionModal
      state={modal}
      onClose={() => setModal(null)}
      onViewResults={(search) => {
        setModal(null);
        if (!search?.url) return;
        untrackSearch(search.id);
        if (onCurrentPage(search)) {
          // Already on the results page (it updated in place): just go to the top.
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
        router.visit(withReturnTo(search.url, window.location.pathname));
      }}
      onContactUs={() => {
        setModal(null);
        router.visit('/contact');
      }}
    />
  );
}
