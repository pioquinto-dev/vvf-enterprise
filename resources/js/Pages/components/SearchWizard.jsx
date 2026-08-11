import { useCallback, useState } from 'react';
import { router } from '@inertiajs/react';

import SearchLauncher from './SearchLauncher.jsx';
import KeywordsScreen from '../../landing/flow/screens/KeywordsScreen.jsx';
import RunningScreen from '../../landing/flow/screens/RunningScreen.jsx';
import { createSavedSearch, trackSearch } from '../../landing/flow/api.js';
import { Check } from '../../landing/components/Icons.jsx';

const STEPS = [
    { key: 'subject', label: 'Subject', hint: 'Brand, competitor or product' },
    { key: 'keywords', label: 'Keywords', hint: 'Widen and filter the pull' },
    { key: 'running', label: 'Results', hint: 'We scrape and rank' },
];

/**
 * The whole search flow on one page.
 *
 * Steps advance in local state rather than by navigation, so the keyword work
 * survives a step back — and a failed run can drop the user straight back onto
 * the keywords they already tuned instead of an empty form.
 *
 * The only thing written to the URL is `?run=<id>` once a run exists, via
 * replaceState. That is a resume handle, not a navigation: a reload should not
 * lose sight of a scrape that is already costing money server-side.
 */

function readRunParam() {
    if (typeof window === 'undefined') return null;
    const id = new URLSearchParams(window.location.search).get('run');
    return id && /^\d+$/.test(id) ? Number(id) : null;
}

/**
 * A header strip on the card, not three cards of its own — the stepper is
 * orientation, so it should read as part of the search panel rather than
 * three more things competing for a click.
 */
function Stepper({ current, onJump, reachable }) {
    const index = STEPS.findIndex((s) => s.key === current);

    return (
        <ol className="flex items-center gap-2 border-b border-black/[.06] bg-black/[.015] px-4 py-3 sm:gap-3 sm:px-6 dark:border-white/[.07] dark:bg-white/[.02]">
            {STEPS.map((step, i) => {
                const state = i < index ? 'done' : i === index ? 'active' : 'todo';
                const clickable = state === 'done' && reachable.includes(step.key);

                return (
                    <li key={step.key} className="flex min-w-0 items-center gap-2 sm:gap-3">
                        {i > 0 && (
                            <span
                                aria-hidden
                                className={`h-px w-4 shrink-0 sm:w-8 ${
                                    state === 'todo' ? 'bg-black/[.1] dark:bg-white/[.12]' : 'bg-accent/40'
                                }`}
                            />
                        )}

                        <button
                            type="button"
                            disabled={!clickable}
                            onClick={() => clickable && onJump(step.key)}
                            aria-current={state === 'active' ? 'step' : undefined}
                            className={`flex min-w-0 items-center gap-2 rounded-full py-1 pr-2 pl-1 text-left transition ${
                                clickable ? 'cursor-pointer hover:bg-black/[.04] dark:hover:bg-white/[.06]' : 'cursor-default'
                            }`}
                        >
                            <span
                                className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full font-display text-[11.5px] font-bold ${
                                    state === 'todo'
                                        ? 'bg-black/[.06] faint dark:bg-white/[.09]'
                                        : 'bg-accent text-white'
                                }`}
                            >
                                {state === 'done' ? <Check className="h-2.5 w-2.5" /> : i + 1}
                            </span>

                            <span
                                className={`truncate text-[12.5px] font-semibold ${
                                    state === 'active'
                                        ? 'text-accent dark:text-accent-glow'
                                        : state === 'todo'
                                          ? 'faint'
                                          : 'muted'
                                }`}
                            >
                                {step.label}
                            </span>
                        </button>
                    </li>
                );
            })}
        </ol>
    );
}

export default function SearchWizard({ initialType = 'brand', initialQuery = '', heading, subheading }) {
    const resumeId = readRunParam();

    const [step, setStep] = useState(resumeId ? 'running' : initialQuery ? 'keywords' : 'subject');
    const [type, setType] = useState(initialType);
    const [phrase, setPhrase] = useState(initialQuery);
    const [searchId, setSearchId] = useState(resumeId);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const stampUrl = (id) => {
        if (typeof window === 'undefined') return;
        const url = new URL(window.location.href);
        if (id) url.searchParams.set('run', String(id));
        else url.searchParams.delete('run');
        // Preserve Inertia's own history state — replacing it with {} breaks back/forward.
        window.history.replaceState(window.history.state, '', url.toString());
    };

    const pickSubject = ({ type: nextType, phrase: nextPhrase }) => {
        setType(nextType);
        setPhrase(nextPhrase);
        setStep('keywords');
    };

    const submit = async ({ phrase: finalPhrase, keywords, frequency, name }) => {
        setSubmitting(true);
        setError(null);

        try {
            const created = await createSavedSearch({
                type,
                phrase: finalPhrase || phrase,
                name,
                keywords,
                frequency,
            });

            // Tracked locally so a reload can pick the run back up.
            trackSearch({ id: created.id, name: created.name, url: created.url });

            setSearchId(created.id);
            stampUrl(created.id);
            setStep('running');
        } catch (e) {
            setError(e.message || 'Could not start the search. Try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const backToKeywords = () => {
        stampUrl(null);
        setSearchId(null);
        setStep(phrase ? 'keywords' : 'subject');
    };

    const onDone = useCallback(
        (found) => router.visit(`/bookmark/${found?.id ?? searchId}`),
        [searchId]
    );

    // A run in flight cannot be re-tuned, so those steps stop being clickable.
    const reachable = searchId ? [] : ['subject', 'keywords'];

    return (
        <div className="surface animate-fade-up overflow-hidden">
            <Stepper current={step} reachable={reachable} onJump={(key) => setStep(key)} />

            <div className="p-6 sm:p-8">
                {step === 'subject' && (
                    <SearchLauncher
                        initialType={type}
                        initialQuery={phrase}
                        heading={heading}
                        subheading={subheading}
                        showOutline={false}
                        bare
                        onSubmit={pickSubject}
                    />
                )}

                {/* Kept mounted so stepping back — or retrying a failed run — returns
                    the user to the keywords they already tuned, not a fresh expansion. */}
                {phrase && (
                    <div hidden={step !== 'keywords'}>
                        <KeywordsScreen
                            key={`${type}:${phrase}`}
                            phrase={phrase}
                            submitting={submitting}
                            error={error}
                            onBack={() => setStep('subject')}
                            onSubmit={submit}
                        />
                    </div>
                )}

                {step === 'running' && searchId && (
                    <RunningScreen searchId={searchId} onBack={backToKeywords} onDone={onDone} />
                )}
            </div>
        </div>
    );
}
