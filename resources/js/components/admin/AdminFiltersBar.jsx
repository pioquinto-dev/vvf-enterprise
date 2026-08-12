import { router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

import { Chevron, Close, Search as SearchIcon } from '../../landing/components/Icons.jsx';

function buildQuery(filters, search) {
    const query = {};

    if (search.trim() !== '') {
        query.search = search.trim();
    }

    filters.forEach((filter) => {
        if ((filter.value ?? '') !== '') {
            query[filter.name] = filter.value;
        }
    });

    return query;
}

// Filter options arrive from the server as plain strings ('published', '7d', ...).
// Objects are still accepted so a future definition can supply its own label.
function normalizeOptions(options = []) {
    return options.map((option) =>
        typeof option === 'string'
            ? { value: option, label: option.replace(/_/g, ' ').replace(/^./, (char) => char.toUpperCase()) }
            : option,
    );
}

/**
 * A filter chip. A native <select> is stretched invisibly over the button so
 * the control keeps real keyboard and screen-reader behaviour without a
 * hand-built popover.
 */
function FilterChip({ filter, onChange }) {
    const options = normalizeOptions(filter.options);
    const value = filter.value ?? '';
    const active = value !== '';
    const selected = options.find((option) => option.value === value);

    return (
        <div className="relative">
            <span
                className={`inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-[12px] transition ${
                    active
                        ? 'border-accent/50 bg-accent/15 font-medium text-white'
                        : 'border-white/[.1] bg-white/[.02] text-white/65 hover:border-white/20 hover:text-white'
                }`}
            >
                <span className={`text-[10px] font-semibold ${active ? 'text-accent' : 'text-white/35'}`}>
                    {filter.label.charAt(0).toUpperCase()}
                </span>
                <span className="whitespace-nowrap">
                    {active ? `${filter.label}: ${selected?.label ?? value}` : filter.label}
                </span>
                <Chevron className={`h-2.5 w-2.5 shrink-0 ${active ? 'text-accent' : 'text-white/30'}`} />
            </span>
            <select
                aria-label={filter.label}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            >
                <option value="" className="bg-[#0f1220] text-white">
                    All {filter.label}
                </option>
                {options.map((option) => (
                    <option key={option.value} value={option.value} className="bg-[#0f1220] text-white">
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default function AdminFiltersBar({ title, searchPlaceholder, search = '', filters = [] }) {
    const [searchValue, setSearchValue] = useState(search);
    const dirty = useRef(false);

    const submit = (nextFilters = filters, nextSearch = searchValue) => {
        router.get(window.location.pathname, buildQuery(nextFilters, nextSearch), {
            preserveState: true,
            replace: true,
            preserveScroll: true,
        });
    };

    // Search-as-you-type, debounced. `dirty` keeps the first render (and any
    // server-driven value change) from firing a redundant request.
    useEffect(() => {
        if (!dirty.current) {
            return undefined;
        }

        const timer = setTimeout(() => submit(filters, searchValue), 350);

        return () => clearTimeout(timer);
    }, [searchValue]);

    const activeCount = filters.filter((filter) => (filter.value ?? '') !== '').length + (searchValue !== '' ? 1 : 0);

    return (
        <div className="w-full">
            {/* Row 1 — the question. Full width, quiet until focused. */}
            <label className="group relative flex h-9 items-center">
                <SearchIcon className="pointer-events-none absolute left-3 h-4 w-4 text-white/30 transition group-focus-within:text-accent" />
                <input
                    type="search"
                    value={searchValue}
                    onChange={(event) => {
                        dirty.current = true;
                        setSearchValue(event.target.value);
                    }}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                            submit();
                        }
                    }}
                    className="h-full w-full rounded-lg border border-white/[.08] bg-[#0f1220] pr-3 pl-9 text-[13px] text-white outline-none transition placeholder:text-white/28 hover:border-white/[.14] focus:border-accent/45 focus:ring-2 focus:ring-accent/12 [&::-webkit-search-cancel-button]:hidden"
                    placeholder={searchPlaceholder || `Search ${title.toLowerCase()}…`}
                />
            </label>

            {/* Row 2 — the refinements, as independent chips. */}
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {filters.map((filter) => (
                    <FilterChip
                        key={filter.name}
                        filter={filter}
                        onChange={(value) =>
                            submit(
                                filters.map((item) => (item.name === filter.name ? { ...item, value } : item)),
                                searchValue,
                            )
                        }
                    />
                ))}

                {activeCount > 0 && (
                    <button
                        type="button"
                        onClick={() => {
                            dirty.current = false;
                            setSearchValue('');
                            submit(
                                filters.map((filter) => ({ ...filter, value: '' })),
                                '',
                            );
                        }}
                        className="inline-flex h-7 items-center gap-1 rounded-full px-2 text-[12px] text-white/40 transition hover:bg-white/[.05] hover:text-white"
                    >
                        <Close className="h-3 w-3" />
                        Clear all
                    </button>
                )}
            </div>
        </div>
    );
}
