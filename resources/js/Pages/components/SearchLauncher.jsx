import { useEffect, useRef, useState } from 'react';
import { router } from '@inertiajs/react';

import { Arrow, Search, Store } from '../../landing/components/Icons.jsx';

/**
 * Step one of the search flow — pick a subject.
 *
 * Redesigned to match the flat "Brand Beacon — Start a search" mockup:
 *   - a segmented mode pill (Your brand / A product) with a
 *     yellow sliding indicator behind the active tab,
 *   - one unified pill-shaped search bar with the Continue button inline,
 *   - a "Popular" row of fill-in chips that only *populate* the input
 *     (they never fire a search — a search costs a credit).
 */

const TYPES = [
    {
        key: 'brand',
        label: 'Your brand',
        icon: Store,
        placeholder: 'Enter your brand name…',
        sample: 'rhode skin',
        suggestions: ['rhode skin', 'skims', 'lip oil'],
    },
    {
        key: 'product',
        label: 'A product',
        icon: Search,
        placeholder: 'Enter a product to track…',
        sample: 'lip oil',
        suggestions: ['lip oil', 'hair oil', 'sunscreen stick'],
    },
];

export default function SearchLauncher({
    initialType = 'brand',
    initialQuery = '',
    onSubmit,
    suggestionsByType = {},
}) {
    const [type, setType] = useState(initialType);
    const [value, setValue] = useState(initialQuery);
    const inputRef = useRef(null);

    const segRef = useRef(null);
    const [indStyle, setIndStyle] = useState({ width: 0, transform: 'translateX(0px)' });

    const baseConfig = TYPES.find((t) => t.key === type) ?? TYPES[0];
    const dynamic = (suggestionsByType?.[type] ?? [])
        .map((s) => (typeof s === 'string' ? s : s?.name))
        .filter(Boolean)
        .slice(0, 3);
    const chips = dynamic.length > 0 ? dynamic : baseConfig.suggestions;

    const query = value.trim().replace(/\s+/g, ' ');

    /* position the yellow slider under the active segment */
    useEffect(() => {
        const seg = segRef.current;
        if (!seg) return undefined;

        const place = () => {
            const btn = seg.querySelector(`[data-mode="${type}"]`);
            if (!btn) return;
            setIndStyle({
                width: `${btn.offsetWidth}px`,
                transform: `translateX(${btn.offsetLeft - 4}px)`,
            });
        };

        place();
        window.addEventListener('resize', place);
        if (document.fonts?.ready) document.fonts.ready.then(place).catch(() => {});
        return () => window.removeEventListener('resize', place);
    }, [type]);

    const submit = (event) => {
        event.preventDefault();
        if (!query) return;

        if (onSubmit) {
            onSubmit({ type, phrase: query });
            return;
        }
        router.visit(`/search?type=${type}&q=${encodeURIComponent(query)}`);
    };

    return (
        <div className="hero">
            <div className="hero__head">
                <h2>What do you want to scan?</h2>
                <div className="prog">
                    <span className="seg3">
                        <span className="on" />
                        <span />
                        <span />
                    </span>{' '}
                    <b>Step 1</b>&nbsp;of 3<span className="prog__detail"> · Subject</span>
                </div>
            </div>

            <div className="seg" ref={segRef} role="tablist" aria-label="What to research">
                <span className="seg__ind" style={indStyle} aria-hidden />
                {TYPES.map((option) => {
                    const Icon = option.icon;
                    const active = option.key === type;
                    return (
                        <button
                            key={option.key}
                            type="button"
                            role="tab"
                            aria-selected={active}
                            data-mode={option.key}
                            onClick={() => setType(option.key)}
                            className="seg__b"
                        >
                            <Icon className="h-4 w-4" />
                            {option.label}
                        </button>
                    );
                })}
            </div>

            <form className="bar" onSubmit={submit}>
                <svg className="bar__q" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" />
                </svg>
                <input
                    ref={inputRef}
                    id="dashboard-search-subject"
                    type="text"
                    autoComplete="off"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={baseConfig.placeholder}
                    aria-label={baseConfig.placeholder}
                />
                <button type="submit" className="btn btn--y" disabled={!query}>
                    Continue
                    <span className="btn__a">
                        <Arrow />
                    </span>
                </button>
            </form>

            <div className="hero__foot">
                <span className="hero__hint">One subject per search keeps every result tight.</span>
                <div className="pop">
                    <span className="pop__l">Popular</span>
                    {chips.map((chip) => (
                        <button
                            key={chip}
                            type="button"
                            className="chip"
                            onClick={() => {
                                setValue(chip);
                                inputRef.current?.focus();
                            }}
                        >
                            {chip}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
