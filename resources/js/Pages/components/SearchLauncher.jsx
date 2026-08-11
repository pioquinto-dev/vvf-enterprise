import { useRef, useState } from 'react';
import { router } from '@inertiajs/react';

import { Arrow, Lock, Search } from '../../landing/components/Icons.jsx';

/**
 * The single entry point into the search flow.
 *
 * Step one of the flow is "pick a subject", and that is all this does — a type
 * toggle, one input, and suggestions that fill the input rather than firing a
 * search. Filling instead of submitting is deliberate: a search costs a credit,
 * so a stray click on a chip must never spend one.
 */

const TYPES = [
    {
        key: 'brand',
        label: 'Your brand',
        hint: 'Track how your own brand is showing up on TikTok.',
        placeholder: 'e.g. rhode skin',
        suggestions: ['rhode skin', 'glossier', 'drunk elephant', 'cerave', 'stanley'],
    },
    {
        key: 'competitor',
        label: 'A competitor',
        hint: 'Watch what is working for someone else in your category.',
        placeholder: 'e.g. skims',
        suggestions: ['skims', 'fenty beauty', 'gymshark', 'alo yoga', 'summer fridays'],
    },
    {
        key: 'product',
        label: 'A product',
        hint: 'Product searches are coming soon.',
        placeholder: 'e.g. lip oil',
        suggestions: ['lip oil', 'hair oil', 'sunscreen stick', 'liquid blush'],
        locked: true,
    },
];

export default function SearchLauncher({
    initialType = 'brand',
    initialQuery = '',
    heading = 'What do you want to research?',
    subheading = 'Pick a subject and we scan TikTok for the outlier videos around it.',
    eyebrow = null,
    showOutline = true,
    bare = false,
    onSubmit,
}) {
    const [type, setType] = useState(initialType === 'product' ? 'brand' : initialType);
    const [value, setValue] = useState(initialQuery);
    const inputRef = useRef(null);

    const config = TYPES.find((t) => t.key === type) ?? TYPES[0];
    const query = value.trim().replace(/\s+/g, ' ');

    const submit = (event) => {
        event.preventDefault();
        if (!query) return;

        // Inside the wizard this advances a step in place; standalone it still
        // has to be a real link so /search?q= keeps working as a deep link.
        if (onSubmit) {
            onSubmit({ type, phrase: query });
            return;
        }

        router.visit(`/search?type=${type}&q=${encodeURIComponent(query)}`);
    };

    const useSuggestion = (suggestion) => {
        setValue(suggestion);
        inputRef.current?.focus();
    };

    return (
        <div className={bare ? '' : 'surface animate-fade-up p-6 sm:p-8'}>
            {eyebrow && (
                <p className="text-[11.5px] font-semibold tracking-[.16em] faint uppercase">{eyebrow}</p>
            )}
            <h2 className={`font-display text-[26px] font-bold tracking-[-.03em] sm:text-[32px] ${eyebrow ? 'mt-2' : ''}`}>
                {heading}
            </h2>
            <p className="mt-2.5 max-w-xl text-[14px] leading-relaxed muted">{subheading}</p>

            {/* type toggle */}
            <div
                role="radiogroup"
                aria-label="Search type"
                className="mt-6 grid gap-2 sm:grid-cols-3"
            >
                {TYPES.map((option) => {
                    const active = option.key === type;

                    return (
                        <button
                            key={option.key}
                            type="button"
                            role="radio"
                            aria-checked={active}
                            disabled={option.locked}
                            title={option.locked ? 'Product searches are coming soon' : option.hint}
                            onClick={() => !option.locked && setType(option.key)}
                            className={`rounded-2xl border px-4 py-3.5 text-left transition-all duration-300 ${
                                option.locked
                                    ? 'cursor-not-allowed border-black/[.06] bg-black/[.02] opacity-60 dark:border-white/[.07] dark:bg-white/[.02]'
                                    : active
                                      ? 'border-accent/45 bg-accent/[.08] shadow-[0_14px_34px_-24px_rgba(109,75,255,.9)] dark:border-accent-glow/40 dark:bg-accent-glow/[.09]'
                                      : 'border-black/[.08] hover:-translate-y-px hover:border-accent/35 dark:border-white/[.1]'
                            }`}
                        >
                            <span className="flex items-center gap-2">
                                <span
                                    className={`text-[14px] font-semibold ${
                                        active && !option.locked ? 'text-accent dark:text-accent-glow' : ''
                                    }`}
                                >
                                    {option.label}
                                </span>
                                {option.locked && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-black/[.05] px-2 py-0.5 text-[10px] font-bold tracking-[.12em] uppercase faint dark:bg-white/[.08]">
                                        <Lock className="h-3 w-3" /> Soon
                                    </span>
                                )}
                            </span>
                            <span className="mt-1 block text-[12.5px] leading-snug faint">{option.hint}</span>
                        </button>
                    );
                })}
            </div>

            {/* subject input */}
            <form onSubmit={submit} className="mt-5 flex flex-col gap-2.5 sm:flex-row">
                <label className="flex h-[56px] flex-1 items-center gap-3 rounded-2xl border border-black/[.08] bg-white px-4 transition-all duration-300 focus-within:border-accent/40 focus-within:shadow-[0_18px_44px_-30px_rgba(109,75,255,.8)] dark:border-white/[.12] dark:bg-white/[.04] dark:focus-within:border-accent-glow/40">
                    <Search className="h-4 w-4 shrink-0 faint" />
                    <input
                        ref={inputRef}
                        value={value}
                        onChange={(event) => setValue(event.target.value)}
                        placeholder={config.placeholder}
                        aria-label="Search subject"
                        maxLength={80}
                        className="w-full border-0 bg-transparent p-0 text-[15px] font-medium text-ink placeholder:text-black/35 focus:ring-0 focus:outline-none dark:text-white dark:placeholder:text-white/35"
                    />
                </label>

                <button type="submit" disabled={!query} className="btn-accent h-[56px] px-6 text-[15px]">
                    Continue <Arrow />
                </button>
            </form>

            {/* suggestions */}
            <div className="mt-5">
                <p className="text-[12px] font-semibold tracking-[.14em] faint uppercase">
                    Try one of these
                </p>
                <div className="mt-2.5 flex flex-wrap gap-2">
                    {config.suggestions.map((suggestion) => (
                        <button
                            key={suggestion}
                            type="button"
                            onClick={() => useSuggestion(suggestion)}
                            className="inline-flex items-center rounded-full border border-accent/16 bg-accent/[.07] px-3.5 py-1.5 text-[12.5px] font-semibold text-accent transition hover:-translate-y-px hover:bg-accent/[.12] dark:border-accent-glow/18 dark:bg-accent-glow/[.08] dark:text-accent-glow dark:hover:bg-accent-glow/[.14]"
                        >
                            {suggestion}
                        </button>
                    ))}
                </div>
                <p className="mt-3 text-[12px] faint">
                    Tapping a suggestion fills the box — nothing runs until you press Continue.
                </p>
            </div>

            {/* what happens next — redundant once the stepper is on screen */}
            <ol
                hidden={!showOutline}
                className="mt-7 grid gap-3 border-t border-black/[.06] pt-6 sm:grid-cols-3 dark:border-white/[.07]"
            >
                {[
                    ['Pick a subject', 'One brand, competitor, or product per search.'],
                    ['Tune the keywords', 'We suggest related terms — keep the ones that fit.'],
                    ['Get outlier videos', 'Ranked results that refresh on your schedule.'],
                ].map(([title, body], index) => (
                    <li key={title} className="flex gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/[.1] font-display text-[12px] font-bold text-accent dark:bg-accent-glow/[.12] dark:text-accent-glow">
                            {index + 1}
                        </span>
                        <span>
                            <span className="block text-[13.5px] font-semibold">{title}</span>
                            <span className="mt-0.5 block text-[12.5px] leading-snug faint">{body}</span>
                        </span>
                    </li>
                ))}
            </ol>
        </div>
    );
}
