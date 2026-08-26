import { useCallback, useEffect, useState } from 'react';
import { router, usePage } from '@inertiajs/react';

import SearchLauncher from './SearchLauncher.jsx';
import EntitlementsBar from './EntitlementsBar.jsx';
import UpgradePromptModal from './UpgradePromptModal.jsx';
import KeywordsScreen from '../../landing/flow/screens/KeywordsScreen.jsx';
import SourcesScreen from '../../landing/flow/screens/SourcesScreen.jsx';
import RunningScreen from '../../landing/flow/screens/RunningScreen.jsx';
import { createSavedSearch, trackSearch } from '../../landing/flow/api.js';

/**
 * The whole in-app search flow on one page (Dashboard and /search share it).
 *
 * The wizard branches by search kind, but every search can now optionally add
 * source context before it runs:
 *   - product / brand → Subject → Keywords → Sources → run
 * The run/loading screen is *not* a wizard step and has no stepper.
 *
 * Steps advance in local state so keyword work survives a step back, and a
 * failed run drops straight back onto the tuned keywords. The only thing
 * written to the URL is `?run=<id>` once a run exists, as a resume handle.
 */

const kindOf = (type) => (type === 'product' ? 'product' : 'brand');
const nounOf = (type) => (type === 'product' ? 'product' : 'brand');
const PENDING_SEARCH_KEY = 'brand-beacon.pending-search';

function readRunParam() {
    if (typeof window === 'undefined') return null;
    const id = new URLSearchParams(window.location.search).get('run');
    return id && /^\d+$/.test(id) ? Number(id) : null;
}

function UsageConfirmModal({ title, body, subject, confirmLabel, busy = false, onConfirm, onCancel }) {
    return (
        <div className="bb">
            <div className="bb-modal">
                <button className="bb-modal__bg" aria-label="Close" onClick={onCancel} />
                <div className="bb-modal__box">
                    <h2>{title}</h2>
                    <p className="sub">{body}</p>
                    {subject && <p style={{ marginTop: 16, fontWeight: 700, color: 'var(--ink)' }}>{subject}</p>}
                    <div className="actrow__r" style={{ marginTop: 24, justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn--g" onClick={onCancel} disabled={busy}>
                            Cancel
                        </button>
                        <button type="button" className="btn btn--y" onClick={onConfirm} disabled={busy}>
                            {busy ? 'Starting…' : confirmLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function AuthPromptModal({ type, phrase, onClose }) {
    const noun = nounOf(type);

    const goTo = (path) => {
        if (typeof window === 'undefined') return;
        window.location.assign(path);
    };

    return (
        <div className="bb">
            <div className="bb-modal">
                <button className="bb-modal__bg" aria-label="Close" onClick={onClose} />
                <div className="bb-modal__box">
                    <h2>Create your account first</h2>
                    <p className="sub">
                        Your {noun} is ready. Create an account or sign in first, and we will start this search right after you get back.
                    </p>
                    {phrase && <p style={{ marginTop: 16, fontWeight: 700, color: 'var(--ink)' }}>{phrase}</p>}
                    <div className="actrow__r" style={{ marginTop: 24, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        <button type="button" className="btn btn--g" onClick={onClose}>
                            Not now
                        </button>
                        <button type="button" className="btn btn--g" onClick={() => goTo('/login')}>
                            Sign in
                        </button>
                        <button type="button" className="btn btn--y" onClick={() => goTo('/register')}>
                            Create account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function readPendingSearch() {
    if (typeof window === 'undefined') return null;

    try {
        const raw = window.sessionStorage.getItem(PENDING_SEARCH_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);

        return parsed && typeof parsed === 'object' ? parsed : null;
    } catch {
        return null;
    }
}

function writePendingSearch(payload) {
    if (typeof window === 'undefined') return;
    window.sessionStorage.setItem(PENDING_SEARCH_KEY, JSON.stringify(payload));
}

function clearPendingSearch() {
    if (typeof window === 'undefined') return;
    window.sessionStorage.removeItem(PENDING_SEARCH_KEY);
}

export default function SearchWizard({
    initialType = 'brand',
    initialQuery = '',
    heading = 'Start a search',
    subheading = 'Pick one brand or product — we widen it with smarter keywords on the next step.',
    subjectExtra = null,
    suggestionsByType = {},
    onTrackedSearchChange = null,
}) {
    const page = usePage();
    const { auth = {}, billing = {} } = page.props;
    const resumeId = readRunParam();

    const [step, setStep] = useState(resumeId ? 'running' : initialQuery ? 'keywords' : 'subject');
    const [type, setType] = useState(initialType);
    const [phrase, setPhrase] = useState(initialQuery);
    const [pending, setPending] = useState(null); // keyword payload awaiting sources/create
    const [searchId, setSearchId] = useState(resumeId);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [confirmPayload, setConfirmPayload] = useState(null);
    const [authPromptPayload, setAuthPromptPayload] = useState(null);
    const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

    const kind = kindOf(type);
    const signedIn = auth.signedIn ?? Boolean(auth.user);
    const searchLimit = billing.searchCreditsLimit ?? 0;
    const searchRemaining = billing.searchCreditsRemaining ?? 0;
    const searchUsed = billing.searchCreditsUsed ?? 0;
    const searchRemainingAfterUse = searchLimit === -1 ? 'unlimited' : Math.max(0, searchLimit - searchUsed - 1);
    const searchCreditsAvailable = !signedIn || searchLimit === -1 || searchRemaining > 0;

    const stampUrl = (id) => {
        if (typeof window === 'undefined') return;
        const url = new URL(window.location.href);
        if (id) url.searchParams.set('run', String(id));
        else url.searchParams.delete('run');
        window.history.replaceState(window.history.state, '', url.toString());
    };

    const pickSubject = ({ type: nextType, phrase: nextPhrase }) => {
        if (!searchCreditsAvailable) {
            setUpgradeModalOpen(true);
            return;
        }

        setType(nextType);
        setPhrase(nextPhrase);
        setStep('keywords');
    };

    const doCreate = async (payload, sources, searchType = type, searchPhrase = payload.phrase || phrase) => {
        setSubmitting(true);
        setError(null);

        try {
            const created = await createSavedSearch({
                type: searchType,
                phrase: searchPhrase,
                name: payload.name,
                keywords: payload.keywords,
                frequency: payload.frequency,
                sources,
            });

            clearPendingSearch();
            trackSearch({ id: created.id, name: created.name, url: created.url });
            onTrackedSearchChange?.();
            setSearchId(created.id);
            stampUrl(created.id);
            setStep('running');
        } catch (e) {
            const pendingSearch = readPendingSearch();
            if (pendingSearch?.started) {
                writePendingSearch({ ...pendingSearch, started: false });
            }
            setError(e.message || 'Could not start the search. Try again.');
            setStep('keywords');
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        if (!signedIn) return;

        const pendingSearch = readPendingSearch();

        if (!pendingSearch || pendingSearch.started) {
            return;
        }

        if (!pendingSearch.payload || !['brand', 'competitor', 'product'].includes(pendingSearch.type)) {
            clearPendingSearch();
            return;
        }

        writePendingSearch({ ...pendingSearch, started: true });
        setType(pendingSearch.type === 'competitor' ? 'brand' : pendingSearch.type);
        setPhrase(pendingSearch.phrase ?? '');
        setPending(pendingSearch.payload);
        setError(null);
        setAuthPromptPayload(null);

        setStep('sources');
    }, [signedIn]);

    const needsSearchConfirm = signedIn && searchLimit !== 0;

    const runSearch = (payload, sources) => {
        if (!signedIn) {
            writePendingSearch({
                type,
                kind,
                phrase: payload.phrase || phrase,
                payload,
                sources: sources ?? null,
                started: false,
            });
            setPending(payload);
            setAuthPromptPayload({ type, phrase: payload.phrase || phrase });
            return;
        }

        if (! needsSearchConfirm) {
            doCreate(payload, sources);
            return;
        }

        setConfirmPayload({ payload, sources });
    };

    const afterKeywords = (payload) => {
        setPending(payload);
        if (!signedIn) {
            runSearch(payload);
            return;
        }

        setStep('sources');
    };

    const backToKeywords = () => {
        stampUrl(null);
        setSearchId(null);
        setStep(phrase ? 'keywords' : 'subject');
    };

    const leaveRunningScreen = () => {
        stampUrl(null);
        setSearchId(null);
        setStep('subject');
    };

    const onDone = useCallback((found) => router.visit(found?.url ?? `/bookmarks/${found?.id ?? searchId}`), [searchId]);

    const topTitle =
        step === 'subject' ? heading : phrase;
    const topSub =
        step === 'subject'
            ? subheading
            : step === 'sources'
              ? 'Step 3 of 3 — optional.'
              : `Step 2 of 3 — add terms to expand on your ${nounOf(type)}. Ticking six terms still spends one search.`;

    return (
        <>
            {step !== 'running' && (
                <div className="top top--wizard">
                    <div>
                        <h1>{topTitle}</h1>
                        <p>{topSub}</p>
                    </div>
                    <EntitlementsBar />
                </div>
            )}

            {step === 'running' && searchId ? (
                <RunningScreen
                    searchId={searchId}
                    onBack={backToKeywords}
                    onDone={onDone}
                    onAutoReturn={leaveRunningScreen}
                />
            ) : (
                <div className="card">
                    {step === 'subject' && (
                        <SearchLauncher
                            initialType={type}
                            initialQuery={phrase}
                            onSubmit={pickSubject}
                            suggestionsByType={suggestionsByType}
                            showProgress={false}
                        />
                    )}

                    {step === 'keywords' && phrase && (
                        <KeywordsScreen
                            key={`${type}:${phrase}`}
                            phrase={phrase}
                            noun={nounOf(type)}
                            nextLabel="Continue"
                            submitting={submitting}
                            error={error}
                            onBack={() => {
                                if (!signedIn) {
                                    if (typeof window !== 'undefined') {
                                        window.location.assign('/');
                                        return;
                                    }

                                    router.visit('/', { replace: true, preserveState: false, preserveScroll: false });
                                    return;
                                }

                                setStep('subject');
                            }}
                            onSubmit={afterKeywords}
                        />
                    )}

                    {step === 'sources' && (
                        <SourcesScreen
                            noun={nounOf(type)}
                            submitting={submitting}
                            onBack={() => setStep('keywords')}
                            onSkip={() => runSearch(pending)}
                            onRun={(sources) => runSearch(pending, sources)}
                        />
                    )}
                </div>
            )}

            {step === 'subject' && subjectExtra}

            {confirmPayload && (
                <UsageConfirmModal
                    title="Start this search?"
                    body={`This will use 1 search credit. You will have ${searchRemainingAfterUse} search credits remaining after this run starts. Search credits are not restored later, even if you pause, delete, or rerun the search.`}
                    subject={confirmPayload.payload?.name ?? confirmPayload.payload?.phrase ?? phrase}
                    confirmLabel="Start search"
                    busy={submitting}
                    onCancel={() => setConfirmPayload(null)}
                    onConfirm={() => {
                        const next = confirmPayload;
                        setConfirmPayload(null);
                        doCreate(next.payload, next.sources);
                    }}
                />
            )}

            {authPromptPayload && (
                <AuthPromptModal
                    type={authPromptPayload.type}
                    phrase={authPromptPayload.phrase}
                    onClose={() => {
                        clearPendingSearch();
                        setAuthPromptPayload(null);
                    }}
                />
            )}

            {upgradeModalOpen && (
                <UpgradePromptModal
                    eyebrow="Search credits"
                    title={(billing.trialEligible ?? true) && !(billing.hasUsedTrial ?? false) ? 'Start your 8-day Growth trial' : 'Upgrade to unlock more searches'}
                    body={(billing.trialEligible ?? true) && !(billing.hasUsedTrial ?? false)
                        ? "You've already used the search credits on Free. Start your trial to keep finding new outliers."
                        : "You've already used the search credits available on your current plan. Upgrade to Growth or Scale to keep finding new outliers."}
                    primaryLabel={(billing.trialEligible ?? true) && !(billing.hasUsedTrial ?? false) ? 'Start 8-day Growth trial' : 'Upgrade to Growth'}
                    onPrimary={() => router.visit((billing.trialEligible ?? true) && !(billing.hasUsedTrial ?? false) ? '/trial' : '/plans')}
                    onClose={() => setUpgradeModalOpen(false)}
                />
            )}
        </>
    );
}
