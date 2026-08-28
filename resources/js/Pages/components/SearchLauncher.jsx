import { useEffect, useRef, useState } from 'react';
import { router } from '@inertiajs/react';

import { Arrow, Search, Store } from '../../landing/components/Icons.jsx';
import { fetchKeywordSuggestions } from '../../landing/flow/api.js';

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
        label: 'Brand',
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
    showProgress = true,
}) {
    const [type, setType] = useState(initialType);
    const [value, setValue] = useState(initialQuery);
    const [liveSuggestions, setLiveSuggestions] = useState([]);
    const [activeSuggestion, setActiveSuggestion] = useState(-1);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const inputRef = useRef(null);
    const fieldRef = useRef(null);

    const segRef = useRef(null);
    const [indStyle, setIndStyle] = useState({ width: 0, transform: 'translateX(0px)' });

    const baseConfig = TYPES.find((t) => t.key === type) ?? TYPES[0];
    const dynamic = (suggestionsByType?.[type] ?? [])
        .map((s) => (typeof s === 'string' ? s : s?.name))
        .filter(Boolean)
        .slice(0, 3);
    const chips = dynamic.length > 0 ? dynamic : baseConfig.suggestions;

    const query = value.trim().replace(/\s+/g, ' ');

    useEffect(() => {
        const controller = new AbortController();
        const term = value.trim();

        fetchKeywordSuggestions(type, term, { signal: controller.signal })
            .then((payload) => {
                setLiveSuggestions(Array.isArray(payload?.suggestions) ? payload.suggestions : []);
                setActiveSuggestion(-1);
            })
            .catch(() => {});

        return () => controller.abort();
    }, [type, value]);

    useEffect(() => {
        const close = (event) => {
            if (!fieldRef.current?.contains(event.target)) {
                setShowSuggestions(false);
                setActiveSuggestion(-1);
            }
        };

        document.addEventListener('mousedown', close);

        return () => document.removeEventListener('mousedown', close);
    }, []);

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

    const visibleSuggestions = liveSuggestions.filter((suggestion) => suggestion.label?.trim());

    const applySuggestion = (label) => {
        setValue(label);
        setShowSuggestions(false);
        setActiveSuggestion(-1);
        window.requestAnimationFrame(() => inputRef.current?.focus());
    };

    return (
        <div className="hero">
            <div className="hero__head">
                <h2>What do you want to scan?</h2>
                {showProgress && (
                    <div className="prog">
                        <span className="seg3">
                            <span className="on" />
                            <span />
                            <span />
                        </span>{' '}
                        <b>Step 1</b>&nbsp;of 3<span className="prog__detail"> · Subject</span>
                    </div>
                )}
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

            <form className="bar" onSubmit={submit} ref={fieldRef}>
                <svg className="bar__q" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" />
                </svg>
                <div className="bar__field">
                    <input
                        ref={inputRef}
                        id="dashboard-search-subject"
                        type="text"
                        autoComplete="off"
                        value={value}
                        onChange={(e) => {
                            setValue(e.target.value);
                            setShowSuggestions(true);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        onKeyDown={(event) => {
                            if (!visibleSuggestions.length) {
                                return;
                            }

                            if (event.key === 'ArrowDown') {
                                event.preventDefault();
                                setShowSuggestions(true);
                                setActiveSuggestion((current) => (current + 1) % visibleSuggestions.length);
                            }

                            if (event.key === 'ArrowUp') {
                                event.preventDefault();
                                setShowSuggestions(true);
                                setActiveSuggestion((current) => (current <= 0 ? visibleSuggestions.length - 1 : current - 1));
                            }

                            if (event.key === 'Enter' && activeSuggestion >= 0 && visibleSuggestions[activeSuggestion]) {
                                event.preventDefault();
                                applySuggestion(visibleSuggestions[activeSuggestion].label);
                            }

                            if (event.key === 'Escape') {
                                setShowSuggestions(false);
                                setActiveSuggestion(-1);
                            }
                        }}
                        placeholder={baseConfig.placeholder}
                        aria-label={baseConfig.placeholder}
                        aria-expanded={showSuggestions && visibleSuggestions.length > 0}
                        aria-haspopup="listbox"
                    />

                    {showSuggestions && visibleSuggestions.length > 0 && (
                        <div className="hero-suggest" role="listbox" aria-label={`${type} suggestions`}>
                            <div className="hero-suggest__head">
                                <span>Suggested {type === 'brand' ? 'brands' : 'products'}</span>
                                <span>{visibleSuggestions.length}</span>
                            </div>
                            <div className="hero-suggest__list">
                                {visibleSuggestions.map((suggestion, index) => (
                                    <button
                                        key={`${suggestion.type}-${suggestion.id}`}
                                        type="button"
                                        className={`hero-suggest__item${index === activeSuggestion ? ' is-active' : ''}`}
                                        onMouseEnter={() => setActiveSuggestion(index)}
                                        onMouseDown={(event) => event.preventDefault()}
                                        onClick={() => applySuggestion(suggestion.label)}
                                    >
                                        <span className="hero-suggest__text">
                                            <strong>{suggestion.label}</strong>
                                            {suggestion.sector && <em>{suggestion.sector}</em>}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
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
