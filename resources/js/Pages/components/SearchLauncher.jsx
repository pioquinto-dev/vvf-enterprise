import { useRef, useState } from 'react';
import { router } from '@inertiajs/react';

import { Arrow, Search, Store, Target, Refresh } from '../../landing/components/Icons.jsx';

/**
 * Step one of the search flow — pick a subject. A mode toggle, one input, and
 * suggestions that *fill* the box rather than firing a search: a search costs a
 * credit, so a stray tap on a suggestion must never spend one.
 *
 * Product searches are gated until the backend supports them, so that mode is
 * shown but locked — the wizard's Sources branching still keys off it.
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

export default function SearchLauncher({ initialType = 'brand', initialQuery = '', onSubmit }) {
    const [type, setType] = useState(initialType);
    const [value, setValue] = useState(initialQuery);
    const inputRef = useRef(null);

    const config = TYPES.find((t) => t.key === type) ?? TYPES[0];
    const query = value.trim().replace(/\s+/g, ' ');

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

            <form className="sbox" onSubmit={submit}>
                <textarea
                    ref={inputRef}
                    rows={2}
                    maxLength={80}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={config.placeholder}
                    aria-label="Search subject"
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

            {config.suggestions.length > 0 && (
                <div className="subj-sugg">
                    {config.suggestions.map((s) => (
                        <button key={s} type="button" className="rchip" onClick={() => setValue(s)}>
                            <Refresh className="h-[13px] w-[13px]" />
                            {s}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
