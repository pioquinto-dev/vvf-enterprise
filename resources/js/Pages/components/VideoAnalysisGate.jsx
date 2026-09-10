import UpgradePromptModal from './UpgradePromptModal.jsx';

/**
 * The credit gate in front of "Analyze video".
 *
 * Every surface that offers manual analysis — the results page and My Feed —
 * puts the CTA through the same three outcomes, so the prompt a user sees does
 * not depend on where they clicked:
 *
 *   no analysis entitlement  → AnalysisUpgradeModal
 *   already analysed/running → open the analysis modal directly
 *   otherwise                → UsageConfirmModal, which spends the credit
 *
 * `handleAnalyzeAction` below encodes that order; the modals and the credit
 * maths live here so there is one implementation to change.
 */

const SparkIcon = (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z" />
  </svg>
);

/** Paid plans with a non-zero analysis allowance can start a manual analysis. */
export function canUsePaidVideoAnalysis(billing) {
  if (!billing) return false;

  const limit = Number(billing.videoAnalysisLimit ?? 0);

  return Boolean(billing.hasPaidPlan) && limit !== 0;
}

/**
 * Credits left, counting the ones started in this session but not yet reflected
 * in the shared billing prop. -1 means unlimited.
 */
export function videoAnalysisRemaining(billing, startedThisSession = 0) {
  if (!billing) return 0;

  const limit = Number(billing.videoAnalysisLimit ?? 0);
  const used = Number(billing.videoAnalysisUsed ?? 0) + Number(startedThisSession || 0);

  if (limit === -1) return -1;

  return Math.max(0, limit - used);
}

/**
 * Routes an "Analyze video" click to the right outcome. Surfaces supply the
 * three callbacks and keep their own modal state.
 */
export function handleAnalyzeAction(video, { billing, onUpgrade, onOpenAnalysis, onConfirm }) {
  if (!canUsePaidVideoAnalysis(billing)) {
    onUpgrade();
    return;
  }

  const status = video?.analysis?.status;
  if (status === 'complete' || status === 'processing') {
    onOpenAnalysis(video);
    return;
  }

  onConfirm(video);
}

export function UsageConfirmModal({ video, creditsRemaining, creditsRemainingAfterUse, busy = false, onConfirm, onCancel }) {
  const currentCredits = creditsRemaining === -1 ? 'Unlimited' : creditsRemaining;
  const afterUseCredits = creditsRemainingAfterUse === 'unlimited' ? 'unlimited' : creditsRemainingAfterUse;

  return (
    <div className="rs-modalback" onClick={onCancel}>
      <style>{modalCss}</style>
      <div className="rs-usage" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label="Confirm video analysis">
        <div className="rs-upg__eyebrow">{SparkIcon}<span>Video analysis</span></div>
        <h3>Analyze this breakout video?</h3>
        <p>
          You currently have <b>{currentCredits}</b> video analysis {currentCredits === 1 ? 'credit' : 'credits'} remaining.
          This analysis will use <b>1 credit</b> when it completes successfully, leaving you with <b>{afterUseCredits}</b>.
        </p>
        <p className="rs-usage__subject">{video?.title || video?.caption || video?.handle || 'Selected video'}</p>
        <div className="rs-upgmodal__actions">
          <button type="button" className="rs-btn rs-btn--g" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button type="button" className="rs-btn rs-btn--y" onClick={onConfirm} disabled={busy}>
            {busy ? 'Starting…' : 'Start analysis'}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * The paywall behind analysis and the two search-management entitlements. The
 * feed only ever passes the default 'analysis' mode; the results page uses all
 * three.
 */
export function AnalysisUpgradeModal({ mode = 'analysis', trialEligible = true, hasUsedTrial = false, onClose, onUpgrade }) {
  const isSearchBookmark = mode === 'search-bookmark';
  const isSearchManagement = mode === 'search-management';
  const shouldOfferTrial = trialEligible && !hasUsedTrial;
  const eyebrowLabel = isSearchBookmark
    ? 'Search bookmarks'
    : isSearchManagement
      ? 'Search management'
      : 'Video analysis';
  const title = isSearchBookmark
    ? shouldOfferTrial
      ? 'Start your 8-day Growth trial to unlock search bookmarks'
      : 'Upgrade to unlock search bookmarks'
    : isSearchManagement
      ? shouldOfferTrial
        ? 'Start your 8-day Growth trial to manage this search'
        : 'Upgrade to manage this search'
      : shouldOfferTrial
        ? 'Turn more breakouts into winning creative'
        : 'Turn every breakout into your next winning creative';
  const body = isSearchBookmark
    ? shouldOfferTrial
      ? 'Free searches do not include saved search bookmarks. Start your 8-day Growth trial to save searches to your bookmarks.'
      : 'Free searches do not include saved search bookmarks. Upgrade to Growth or Scale to save searches to your bookmarks.'
    : isSearchManagement
      ? shouldOfferTrial
        ? 'Start your 8-day Growth trial to pause, resume, or delete tracked searches from your dashboard.'
        : 'Upgrade to Growth or Scale to pause, resume, or delete tracked searches from your dashboard.'
      : shouldOfferTrial
        ? 'See the hook, angle, and strategy behind more high-performing videos during your 8-day Growth trial.'
        : 'See the hook, angle, and strategy behind more high-performing videos—then turn those insights into content faster.';
  const ctaLabel = isSearchBookmark || isSearchManagement
    ? shouldOfferTrial ? 'Start 8-day Growth trial' : 'Upgrade to Growth'
    : shouldOfferTrial ? 'Analyze more free for 8 days' : 'Unlock more video analysis';

  return (
    <UpgradePromptModal
      eyebrow={eyebrowLabel}
      title={title}
      body={body}
      visual={!isSearchBookmark && !isSearchManagement ? 'video-analysis' : null}
      emphasis={!isSearchBookmark && !isSearchManagement ? 'Your free top-video breakdown stays included.' : null}
      primaryLabel={ctaLabel}
      onPrimary={onUpgrade}
      onClose={onClose}
    />
  );
}

/*
 * These rules also live in the results page's own style block, where the rest
 * of the rs- surface is defined. They ship with the component as well so the
 * modal is styled on any page that renders it — My Feed has no rs- stylesheet
 * of its own, and without this the overlay loses `position:fixed` and the
 * dialog renders invisibly at the foot of the document.
 */
const modalCss = `
.rs-modalback{position:fixed;inset:0;z-index:130;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(20,15,0,.34);backdrop-filter:blur(3px)}
.rs-usage{width:min(100%,460px);border:1px solid #f2e4b8;border-radius:22px;padding:22px;background:linear-gradient(180deg,#fffdf7 0%,#fff8ea 100%);box-shadow:0 28px 90px rgba(42,33,20,.22)}
.rs-usage h3{margin-top:10px;font-size:1.15rem;font-weight:800;letter-spacing:-.03em;color:var(--ink)}
.rs-usage p{margin-top:8px;font-size:.9rem;line-height:1.55;color:var(--muted)}
.rs-usage b{color:var(--ink)}
.rs-usage__subject{margin-top:14px;padding:12px 14px;border:1px solid var(--line);border-radius:14px;background:rgba(255,255,255,.7);font-weight:700;color:var(--ink)}
.rs-upg__eyebrow{display:inline-flex;align-items:center;gap:7px;font-size:.67rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--amber-ink)}
.rs-upg__eyebrow svg{width:12px;height:12px}
.rs-upgmodal__actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:18px}
.rs-upgmodal__actions .rs-btn{flex:1}
.rs-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:42px;padding:0 18px;border-radius:100px;font-size:.88rem;font-weight:700;letter-spacing:-.01em;white-space:nowrap;transition:.16s;border:0;cursor:pointer}
.rs-btn svg{width:15px;height:15px;flex:none}
.rs-btn--y{background:var(--yellow);color:#1A1400}
.rs-btn--y:hover:not(:disabled){background:var(--yellow-hot,#FFD84D)}
.rs-btn--g{border:1px solid var(--line-2,#DEDBD3);background:var(--white);color:var(--ink)}
.rs-btn--g:hover:not(:disabled){border-color:var(--faint-2,#9A968E);background:var(--paper)}
.rs-btn:disabled{opacity:.55;cursor:not-allowed}
@media(max-width:560px){
  .rs-usage{padding:20px 16px 16px}
  .rs-usage h3{font-size:1.02rem}
  .rs-usage p{font-size:.84rem}
  .rs-upgmodal__actions .rs-btn{width:100%}
}
`;
