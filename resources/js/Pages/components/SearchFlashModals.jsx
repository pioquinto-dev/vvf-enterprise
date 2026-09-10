import { useEffect, useRef, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';

import UpgradePromptModal from './UpgradePromptModal.jsx';
import { withReturnTo } from '../utils/navigation.js';
import {
  billing as billingApi,
  fetchRecentSearches,
  readTracked,
  trackSearch,
  untrackSearch,
  updateTracked,
} from '../../landing/flow/api.js';

/**
 * The modals that hang off a search hand-off: a search started during sign-up
 * or checkout flashes onto the landing page, and this watches it to completion.
 *
 * These used to live on the retired search homepage. They follow the flash
 * messages, so they belong wherever a signed-in user lands — My Feed.
 */

const POLL_MS = 10000;
const ACTIVE_SEARCH_STATUSES = new Set(['pending', 'queued', 'running', 'scraping']);

function SearchCompletionModal({ state, onClose, onViewResults, onContactUs }) {
  if (!state) return null;

  const finished = state.finished ?? [];
  const failed = state.failed ?? [];
  const hasFailures = failed.length > 0;
  const hasFinished = finished.length > 0;
  const title = hasFailures && hasFinished
    ? 'Search updates'
    : hasFailures
      ? 'Something went wrong'
      : 'Search ready';

  const body = hasFailures && hasFinished
    ? 'Some searches finished successfully, and some need your attention.'
    : hasFailures
      ? 'One or more searches did not finish correctly.'
      : finished.length > 1
        ? `${finished.length} searches have finished running.`
        : finished[0]?.name
          ? `Your search for ${String.fromCharCode(8220)}${finished[0].name}${String.fromCharCode(8221)} has finished running.`
          : 'Your search has finished running.';

  const primarySearch = hasFinished ? finished[0] : null;

  return (
    <div className="bb">
      <div className="bb-modal">
        <button className="bb-modal__bg" aria-label="Close" onClick={onClose} />
        <div className="bb-modal__box">
          <h2>{title}</h2>
          <p className="sub">{body}</p>

          {(hasFinished || hasFailures) && (
            <div style={{ marginTop: 18, display: 'grid', gap: 10 }}>
              {hasFinished && (
                <div>
                  <p style={{ fontWeight: 800, color: 'var(--ink)', fontSize: '.82rem' }}>Finished</p>
                  <div style={{ marginTop: 8, display: 'grid', gap: 8 }}>
                    {finished.map((search) => (
                      <div key={`done-${search.id}`} style={{ padding: '10px 12px', borderRadius: 12, background: 'var(--paper)', border: '1px solid var(--line)' }}>
                        <div style={{ fontWeight: 700, color: 'var(--ink)' }}>{search.name || search.phrase}</div>
                        <div style={{ fontSize: '.8rem', color: 'var(--muted)', marginTop: 4 }}>
                          {search.result_count ?? 0} videos ready
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {hasFailures && (
                <div>
                  <p style={{ fontWeight: 800, color: 'var(--ink)', fontSize: '.82rem' }}>Needs support</p>
                  <div style={{ marginTop: 8, display: 'grid', gap: 8 }}>
                    {failed.map((search) => (
                      <div key={`failed-${search.id}`} style={{ padding: '10px 12px', borderRadius: 12, background: '#fff7f2', border: '1px solid #f2d1bf' }}>
                        <div style={{ fontWeight: 700, color: 'var(--ink)' }}>{search.name || search.phrase}</div>
                        <div style={{ fontSize: '.8rem', color: 'var(--muted)', marginTop: 4 }}>
                          {search.latest_run_error || 'The search did not finish.'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="actrow__r" style={{ marginTop: 24, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <button type="button" className="btn btn--g" onClick={onClose}>
              Close
            </button>
            {hasFailures && (
              <button type="button" className="btn btn--g" onClick={onContactUs}>
                Contact support
              </button>
            )}
            {primarySearch?.url && (
              <button type="button" className="btn btn--y" onClick={() => onViewResults(primarySearch)}>
                View results
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SearchProcessingModal({ searches, onClose }) {
  if (!Array.isArray(searches) || searches.length === 0) return null;

  const first = searches[0];
  const title = searches.length > 1 ? 'Your searches are processing' : 'Your search is processing';
  const body = searches.length > 1
    ? `We started ${searches.length} searches behind the scenes. We’ll update you here when they finish.`
    : first?.name
      ? `We started ${String.fromCharCode(8220)}${first.name}${String.fromCharCode(8221)} behind the scenes. We’ll update you here when it finishes.`
      : 'We started your search behind the scenes. We’ll update you here when it finishes.';

  return (
    <div className="bb">
      <div className="bb-modal">
        <button className="bb-modal__bg" aria-label="Close" onClick={onClose} />
        <div className="bb-modal__box">
          <h2>{title}</h2>
          <p className="sub">{body}</p>
          <div style={{ marginTop: 18, display: 'grid', gap: 8 }}>
            {searches.map((search) => (
              <div key={`processing-${search.id}`} style={{ padding: '10px 12px', borderRadius: 12, background: 'var(--paper)', border: '1px solid var(--line)' }}>
                <div style={{ fontWeight: 700, color: 'var(--ink)' }}>{search.name || search.phrase}</div>
                <div style={{ fontSize: '.8rem', color: 'var(--muted)', marginTop: 4 }}>
                  It will appear in Pick up where you left off while it runs.
                </div>
              </div>
            ))}
          </div>
          <div className="actrow__r" style={{ marginTop: 24, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn--y" onClick={onClose}>
              Okay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SearchAccessPromptModal({ prompt, billing, onClose, onUpgrade }) {
  if (!prompt) return null;

  const trialEligible = billing?.trialEligible ?? true;
  const hasUsedTrial = billing?.hasUsedTrial ?? false;
  const shouldOfferTrial = trialEligible && !hasUsedTrial;
  const ctaLabel = shouldOfferTrial ? 'Start my 8-day trial' : 'Unlock more searches';
  const body = shouldOfferTrial
    ? 'Turn your first signal into a repeatable edge with Growth.'
    : 'Keep spotting breakout content before the trend moves on.';

  return (
    <UpgradePromptModal
      eyebrow="Keep your momentum"
      title="Ready to find your next breakout?"
      body={body}
      visual="search-momentum"
      primaryLabel={ctaLabel}
      onPrimary={onUpgrade}
      secondaryLabel="Maybe later"
      onClose={onClose}
    />
  );
}

function CouponAccessPromptModal({ prompt, onClose }) {
  if (!prompt) return null;

  return (
    <div className="bb">
      <div className="bb-modal">
        <button className="bb-modal__bg" aria-label="Close" onClick={onClose} />
        <div className="bb-modal__box bb-modal__box--upgrade" role="dialog" aria-modal="true" aria-label={prompt.title || 'Notice'}>
          <button type="button" className="bb-modal__close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
          {(prompt.errorKey || prompt.program) && (
            <div className="bb-modal__eyebrow">
              <span>{[prompt.program, prompt.errorKey].filter(Boolean).join(' · ')}</span>
            </div>
          )}
          <h2>{prompt.title || 'This offer is unavailable'}</h2>
          {prompt.detail && <p className="sub">{prompt.detail}</p>}
          <div className="bb-modal__actions">
            <Link href="/contact" className="btn btn--y" onClick={onClose}>Contact us</Link>
            <button type="button" className="btn btn--g" onClick={onClose}>Got it</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchFlashModals({ currentPath = '/home' }) {
  const { flash = {}, billing = {} } = usePage().props;
  const [processingModal, setProcessingModal] = useState(null);
  const [completionModal, setCompletionModal] = useState(null);
  const [searchAccessPrompt, setSearchAccessPrompt] = useState(null);
  const [couponPrompt, setCouponPrompt] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const polling = useRef(false);
  const recentSearchesRef = useRef([]);
  const recentStatuses = useRef(new Map());
  const flashedTrackedRef = useRef(false);
  const flashedProcessingRef = useRef(false);
  const hasActiveRecentSearch = recentSearches.some((s) => ACTIVE_SEARCH_STATUSES.has(s.status));

  const markTrackedAsPrompted = (searches, patch) => {
    searches.forEach((search) => {
      if (search?.id == null) return;
      updateTracked(search.id, patch);
    });
  };

  const trackedTerminalChanges = (searches) => {
    const tracked = readTracked();
    const trackedById = new Map(tracked.map((entry) => [String(entry.id), entry]));
    const finished = [];
    const failed = [];

    searches.forEach((search) => {
      const trackedEntry = trackedById.get(String(search.id));
      if (!trackedEntry) return;

      if (search.status === 'done' && trackedEntry.completedPromptShown !== true) {
        finished.push(search);
      }

      if (search.status === 'failed' && trackedEntry.failedPromptShown !== true) {
        failed.push(search);
      }
    });

    return { finished, failed };
  };

  const applyRecentSearches = (searches, notifyOnTerminal = false) => {
    const previousStatuses = recentStatuses.current;
    recentStatuses.current = new Map(searches.map((s) => [String(s.id), s.status]));
    recentSearchesRef.current = searches;
    setRecentSearches(searches);

    if (!notifyOnTerminal) return;

    const terminalSearches = searches.filter((s) => (
      ACTIVE_SEARCH_STATUSES.has(previousStatuses.get(String(s.id)))
      && (s.status === 'done' || s.status === 'failed')
    ));

    if (terminalSearches.length === 0) return;

    const trackedChanges = trackedTerminalChanges(terminalSearches);

    if (trackedChanges.finished.length > 0 || trackedChanges.failed.length > 0) {
      if (trackedChanges.finished.length > 0) {
        markTrackedAsPrompted(trackedChanges.finished, { completedPromptShown: true });
      }

      if (trackedChanges.failed.length > 0) {
        markTrackedAsPrompted(trackedChanges.failed, { failedPromptShown: true });
      }

      // Search usage is charged when the run starts, but this page is already
      // mounted when it finishes. Refresh the shared entitlement prop before
      // showing the completion prompt so the header is immediately true.
      router.reload({
        only: ['billing'],
        preserveScroll: true,
        preserveState: true,
        onFinish: () => setCompletionModal(trackedChanges),
      });
    }
  };

  const refreshRecent = async (notifyOnTerminal = false) => {
    const payload = await fetchRecentSearches();
    applyRecentSearches(payload?.searches ?? [], notifyOnTerminal);
  };

  useEffect(() => {
    if (flashedTrackedRef.current) return;
    flashedTrackedRef.current = true;

    const flashed = Array.isArray(flash.trackedSearches) ? flash.trackedSearches : [];

    if (flashed.length === 0) return;

    flashed.forEach((entry) => {
      if (entry?.id == null) return;
      trackSearch(entry);
    });

    refreshRecent().catch(() => {});
  }, [flash.trackedSearches]);

  useEffect(() => {
    if (flashedProcessingRef.current) return;
    flashedProcessingRef.current = true;

    const flashed = Array.isArray(flash.processingSearches) ? flash.processingSearches : [];

    if (flashed.length === 0) return;

    setProcessingModal(flashed);
  }, [flash.processingSearches]);

  useEffect(() => {
    if (!flash.searchAccessPrompt) return;
    setSearchAccessPrompt(flash.searchAccessPrompt);
  }, [flash.searchAccessPrompt]);

  useEffect(() => {
    if (!flash.couponAccessPrompt) return;
    setCouponPrompt(flash.couponAccessPrompt);
  }, [flash.couponAccessPrompt]);

  useEffect(() => {
    if (completionModal) return undefined;

    let cancelled = false;
    let timer;

    const poll = async () => {
      if (cancelled || polling.current) return;
      if (!recentSearchesRef.current.some((s) => ACTIVE_SEARCH_STATUSES.has(s.status))) return;

      polling.current = true;
      try {
        const payload = await fetchRecentSearches();
        if (cancelled) return;
        applyRecentSearches(payload?.searches ?? [], true);
      } catch {
        /* transient — the next tick will retry */
      } finally {
        polling.current = false;
      }

      if (!cancelled) timer = window.setTimeout(poll, POLL_MS);
    };

    poll();

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [completionModal, hasActiveRecentSearch]);

  const viewResults = (search) => {
    if (!search?.url) return setCompletionModal(null);
    untrackSearch(search.id);
    return router.visit(withReturnTo(search.url, currentPath));
  };

  const openSearchUpgrade = () => {
    setSearchAccessPrompt(null);
    if ((billing.trialEligible ?? true) && !(billing.hasUsedTrial ?? false)) {
      billingApi.trialCheckout('growth');
    } else {
      router.visit('/plans');
    }
  };

  return (
    <>
      <SearchCompletionModal
        state={completionModal}
        onClose={() => setCompletionModal(null)}
        onViewResults={viewResults}
        onContactUs={() => {
          setCompletionModal(null);
          router.visit('/contact');
        }}
      />
      <SearchProcessingModal searches={processingModal} onClose={() => setProcessingModal(null)} />
      <CouponAccessPromptModal prompt={couponPrompt} onClose={() => setCouponPrompt(null)} />
      <SearchAccessPromptModal
        prompt={searchAccessPrompt}
        billing={billing}
        onClose={() => setSearchAccessPrompt(null)}
        onUpgrade={openSearchUpgrade}
      />
    </>
  );
}
