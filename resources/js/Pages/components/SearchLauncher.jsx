import { useEffect, useRef, useState } from 'react';
import { router } from '@inertiajs/react';

import { Arrow, Search, Store, Target, Refresh } from '../../landing/components/Icons.jsx';

/**
 * Step one of the search flow — pick a subject. A mode toggle, one input, and
 * suggestions that *fill* the box rather than firing a search: a search costs a
 * credit, so a stray tap on a suggestion must never spend one.
 */

const TYPES = [
    {
        key: 'brand',
        label: 'Your brand',
        icon: Store,
        placeholder: 'Which brand do you want to research?',
        sample: 'rhode skin',
        suggestions: ['rhode skin', 'glossier', 'drunk elephant', 'cerave', 'stanley'],
    },
    {
        key: 'competitor',
        label: 'A competitor',
        icon: Target,
        placeholder: 'Which competitor do you want to watch?',
        sample: 'skims',
        suggestions: ['skims', 'fenty beauty', 'gymshark', 'alo yoga', 'summer fridays'],
    },
    {
        key: 'product',
        label: 'A product',
        icon: Search,
        placeholder: 'Which product do you want to track?',
        sample: 'lip oil',
        suggestions: ['lip oil', 'hair oil', 'sunscreen stick', 'liquid blush'],
    },
];

export default function SearchLauncher({ initialType = 'brand', initialQuery = '', onSubmit, suggestionsByType = {} }) {
    const [type, setType] = useState(initialType);
    const [value, setValue] = useState(initialQuery);
    const [typedPrompt, setTypedPrompt] = useState('');
    const inputRef = useRef(null);

    const baseConfig = TYPES.find((t) => t.key === type) ?? TYPES[0];
    const config = {
        ...baseConfig,
        dynamicSuggestions: suggestionsByType?.[type] ?? [],
    };
    const query = value.trim().replace(/\s+/g, ' ');
    const dynamicSuggestions = (config.dynamicSuggestions ?? []).slice(0, 5);
    const subjectSuggestions = dynamicSuggestions.length > 0 ? dynamicSuggestions : config.suggestions;
    const promptLoop = [
        'What do you want to search?',
        config.key === 'product'
            ? 'What product do you want to research?'
            : 'What brand do you want to research?',
    ];
    const animatedPrompt = typedPrompt || promptLoop[0];

    useEffect(() => {
        let promptIndex = 0;
        let charIndex = 0;
        let deleting = false;
        let timer;
        let cancelled = false;

        const tick = () => {
            if (cancelled) return;

            const currentPrompt = promptLoop[promptIndex];

            if (!deleting) {
                charIndex += 1;
                setTypedPrompt(currentPrompt.slice(0, charIndex));

                if (charIndex >= currentPrompt.length) {
                    timer = window.setTimeout(() => {
                        deleting = true;
                        tick();
                    }, 1400);
                    return;
                }

                timer = window.setTimeout(tick, 42);
                return;
            }

            charIndex -= 1;
            setTypedPrompt(currentPrompt.slice(0, Math.max(charIndex, 0)));

            if (charIndex <= 0) {
                deleting = false;
                promptIndex = (promptIndex + 1) % promptLoop.length;
            }

            timer = window.setTimeout(tick, 26);
        };

        setTypedPrompt('');
        timer = window.setTimeout(tick, 180);

        return () => {
            cancelled = true;
            window.clearTimeout(timer);
        };
    }, [config.key]);

    const submit = (event) => {
        event.preventDefault();
        if (!query) return;

        if (onSubmit) {
            onSubmit({ type, phrase: query });
            return;
        }
        router.visit(`/search?type=${type}&q=${encodeURIComponent(query)}`);
    };

    const useSample = () => {
        setValue(config.sample);
        inputRef.current?.focus();
    };

    return (
        <div className="card__p">
            <div className="modes" role="radiogroup" aria-label="What to research">
                {TYPES.map((option) => {
                    const Icon = option.icon;
                    const active = option.key === type;
                    return (
                        <button
                            key={option.key}
                            type="button"
                            role="radio"
                            aria-checked={active}
                            onClick={() => setType(option.key)}
                            className={`mode${active ? ' is-on' : ''}`}
                        >
                            <Icon className="h-[15px] w-[15px]" />
                            {option.label}
                        </button>
                    );
                })}
            </div>

            <label className="sbox__label" htmlFor="dashboard-search-subject">
                <span>{animatedPrompt}</span>
                <span className="caret" aria-hidden />
            </label>

            <form className="sbox" onSubmit={submit}>
                <textarea
                    ref={inputRef}
                    id="dashboard-search-subject"
                    rows={2}
                    maxLength={80}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder=""
                    aria-label={animatedPrompt}
                    style={{
                        border: '0',
                        outline: 'none',
                        boxShadow: 'none',
                        borderRadius: 0,
                        background: 'transparent',
                        appearance: 'none',
                        WebkitAppearance: 'none',
                    }}
                />
                <div className="sbox__f">
                    <p className="sbox__t">
                        Try{' '}
                        <button type="button" className="sbox__try" onClick={useSample}>
                            “{config.sample}”
                        </button>
                        <br />
                        One subject per search keeps each result tight.
                    </p>
                    <button type="submit" disabled={!query} className="btn btn--y">
                        Continue <Arrow />
                    </button>
                </div>
            </form>

            {subjectSuggestions.length > 0 && (
                <div className="subj-sugg">
                    {subjectSuggestions.map((suggestion) => {
                        const label = typeof suggestion === 'string' ? suggestion : suggestion?.name;
                        if (!label) return null;

                        return (
                            <button key={label} type="button" className="rchip" onClick={() => setValue(label)}>
                                <Refresh className="h-[13px] w-[13px]" />
                                {label}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
