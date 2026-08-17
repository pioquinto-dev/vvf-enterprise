import { useCallback, useState } from 'react';
import { router } from '@inertiajs/react';

import SearchLauncher from './SearchLauncher.jsx';
import EntitlementsBar from './EntitlementsBar.jsx';
import KeywordsScreen from '../../landing/flow/screens/KeywordsScreen.jsx';
import SourcesScreen from '../../landing/flow/screens/SourcesScreen.jsx';
import RunningScreen from '../../landing/flow/screens/RunningScreen.jsx';
import { createSavedSearch, trackSearch } from '../../landing/flow/api.js';
import { Check } from '../../landing/components/Icons.jsx';

/**
 * The whole in-app search flow on one page (Dashboard and /search share it).
 *
 * The wizard branches by search kind, exactly as the handoff spec requires:
 *   - product  → Subject → Keywords → run          (2 steps, no Sources)
 *   - brand /  → Subject → Keywords → Sources → run (3 steps; Sources is last,
 *     competitor    optional, and asks for the account's handle/website)
 * The run/loading screen is *not* a wizard step and has no stepper.
 *
 * Steps advance in local state so keyword work survives a step back, and a
 * failed run drops straight back onto the tuned keywords. The only thing
 * written to the URL is `?run=<id>` once a run exists, as a resume handle.
 */

/* brand + competitor are both "brand kind" — they have an account to connect. */
const kindOf = (type) => (type === 'product' ? 'product' : 'brand');
const nounOf = (type) => (type === 'product' ? 'product' : 'brand');

function readRunParam() {
    if (typeof window === 'undefined') return null;
    const id = new URLSearchParams(window.location.search).get('run');
    return id && /^\d+$/.test(id) ? Number(id) : null;
}

/**
 * The card-header stepper. Sources is brand-only and last; there is no
 * "Results" step — the visitor is already signed in by the time they run.
 */
function Stepper({ kind, current }) {
    const steps =
        kind === 'product'
            ? [
                  { k: 'subject', l: 'Subject' },
                  { k: 'keywords', l: 'Keywords' },
              ]
            : [
                  { k: 'subject', l: 'Subject' },
                  { k: 'keywords', l: 'Keywords' },
                  { k: 'sources', l: 'Sources' },
              ];
    const idx = steps.findIndex((s) => s.k === current);

    return (
        <div className="step">
            {steps.map((s, i) => {
                const state = i < idx ? 'done' : i === idx ? 'now' : 'todo';
                return (
                    <span key={s.k} className="step__i">
                        {i > 0 && <span className="step__r" />}
                        <span className={`step__n ${state}`}>{state === 'done' ? <Check /> : i + 1}</span>
                        <span className={`step__l ${state}`}>{s.l}</span>
                    </span>
                );
            })}
        </div>
    );
}

export default function SearchWizard({ initialType = 'brand', initialQuery = '', heading = 'Start a search', subheading = 'Pick one brand, competitor, or product — we widen it with smarter keywords on the next step.', subjectExtra = null }) {
    const resumeId = readRunParam();

    const [step, setStep] = useState(resumeId ? 'running' : initialQuery ? 'keywords' : 'subject');
    const [type, setType] = useState(initialType);
    const [phrase, setPhrase] = useState(initialQuery);
    const [pending, setPending] = useState(null); // keyword payload awaiting sources/create
    const [searchId, setSearchId] = useState(resumeId);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const kind = kindOf(type);

    const stampUrl = (id) => {
        if (typeof window === 'undefined') return;
        const url = new URL(window.location.href);
        if (id) url.searchParams.set('run', String(id));
        else url.searchParams.delete('run');
        window.history.replaceState(window.history.state, '', url.toString());
    };

    const pickSubject = ({ type: nextType, phrase: nextPhrase }) => {
        setType(nextType);
        setPhrase(nextPhrase);
        setStep('keywords');
    };

    const doCreate = async (payload, sources) => {
        setSubmitting(true);
        setError(null);

        try {
            const created = await createSavedSearch({
                type,
                phrase: payload.phrase || phrase,
                name: payload.name,
                keywords: payload.keywords,
                frequency: payload.frequency,
                sources,
            });

            trackSearch({ id: created.id, name: created.name, url: created.url });
            setSearchId(created.id);
            stampUrl(created.id);
            setStep('running');
        } catch (e) {
            setError(e.message || 'Could not start the search. Try again.');
            setStep('keywords');
        } finally {
            setSubmitting(false);
        }
    };

    // Keywords done: brand/competitor go connect sources first; product runs now.
    const afterKeywords = (payload) => {
        setPending(payload);
        if (kind === 'brand') setStep('sources');
        else doCreate(payload);
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

    const onDone = useCallback((found) => router.visit(found?.url ?? `/bookmark/${found?.id ?? searchId}`), [searchId]);

    const topTitle =
        step === 'subject' ? heading : phrase;
    const topSub =
        step === 'subject'
            ? subheading
            : step === 'sources'
              ? 'Step 3 of 3 — optional.'
              : `Step 2 of ${kind === 'product' ? 2 : 3} — add terms to expand on your ${nounOf(type)}. Ticking six terms still spends one search.`;

    return (
        <>
            {step !== 'running' && (
                <div className="top">
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
                    <Stepper kind={kind} current={step} />

                    {step === 'subject' && (
                        <SearchLauncher initialType={type} initialQuery={phrase} onSubmit={pickSubject} />
                    )}

                    {step === 'keywords' && phrase && (
                        <KeywordsScreen
                            key={`${type}:${phrase}`}
                            phrase={phrase}
                            noun={nounOf(type)}
                            nextLabel={kind === 'brand' ? 'Continue' : 'Run the search'}
                            submitting={submitting}
                            error={error}
                            onBack={() => setStep('subject')}
                            onSubmit={afterKeywords}
                        />
                    )}

                    {step === 'sources' && (
                        <SourcesScreen
                            submitting={submitting}
                            onBack={() => setStep('keywords')}
                            onSkip={() => doCreate(pending)}
                            onRun={(sources) => doCreate(pending, sources)}
                        />
                    )}
                </div>
            )}

            {step === 'subject' && subjectExtra}
        </>
    );
}
