import { useEffect, useRef, useState } from 'react';
import { Check, Close, Plus, Arrow } from '../../components/Icons.jsx';
import { expandKeywords } from '../api.js';

const FREQUENCIES = [
  {
    value: 'weekly',
    label: 'Weekly',
    hint: 'Fresh viral videos every week. Best for fast-moving categories.',
  },
  {
    value: 'monthly',
    label: 'Monthly',
    hint: 'A monthly pull. Lighter cadence for slower niches.',
  },
];

function KeywordChip({ value, selected, onToggle, onRemove }) {
  return (
    <span
      className={`group inline-flex items-center rounded-xl border text-[13.5px] transition-all duration-300 ${
        selected
          ? 'border-accent/50 bg-accent/10 font-semibold text-accent shadow-[0_8px_22px_-14px_rgba(109,75,255,.9)] dark:text-accent-glow'
          : 'border-black/[.09] hover:-translate-y-px hover:border-accent/35 dark:border-white/[.12]'
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={selected}
        className="flex items-center gap-2.5 py-2.5 pr-2 pl-3.5"
      >
        <span
          className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md border transition-all duration-200 ${
            selected ? 'border-accent bg-accent text-white' : 'border-black/25 dark:border-white/30'
          }`}
        >
          {selected && <Check />}
        </span>
        {value}
      </button>

      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${value}`}
        title="Remove"
        className="py-2.5 pr-3 pl-1 opacity-35 transition-opacity duration-200 hover:opacity-100"
      >
        <Close className="h-3.5 w-3.5" />
      </button>
    </span>
  );
}

function SkeletonChips() {
  return (
    <div className="flex flex-wrap gap-2" aria-hidden>
      {[132, 108, 156, 96, 140, 118].map((width, i) => (
        <span
          key={i}
          className="h-[42px] animate-pulse rounded-xl bg-black/[.05] dark:bg-white/[.06]"
          style={{ width }}
        />
      ))}
    </div>
  );
}

export default function KeywordsScreen({ phrase, onBack, onSubmit, submitting = false, error = null }) {
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expansionSource, setExpansionSource] = useState(null);
  const [draft, setDraft] = useState('');
  const [frequency, setFrequency] = useState('weekly');
  const [name, setName] = useState(phrase);
  const requested = useRef(false);

  // Expansion is the first thing that happens on this page — the user should
  // land here and watch suggestions arrive, not stare at an empty box.
  useEffect(() => {
    if (requested.current) return undefined;
    requested.current = true;

    const controller = new AbortController();

    expandKeywords(phrase, { signal: controller.signal })
      .then((payload) => {
        const keywords = Array.isArray(payload?.keywords) ? payload.keywords : [phrase];
        setExpansionSource(payload?.source ?? null);
        setTerms(
          keywords.map((value, i) => ({
            value,
            // The phrase itself is always in, plus the first two suggestions.
            selected: i <= 2,
            locked: i === 0,
          }))
        );
      })
      .catch(() => {
        setTerms([{ value: phrase, selected: true, locked: true }]);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [phrase]);

  const selected = terms.filter((t) => t.selected).map((t) => t.value);

  const toggle = (value) =>
    setTerms((prev) => prev.map((t) => (t.value === value && !t.locked ? { ...t, selected: !t.selected } : t)));

  const remove = (value) => setTerms((prev) => prev.filter((t) => t.value !== value || t.locked));

  const add = (e) => {
    e.preventDefault();
    const value = draft.trim().replace(/\s+/g, ' ');
    if (!value) return;

    const match = terms.find((t) => t.value.toLowerCase() === value.toLowerCase());

    if (match) {
      setTerms((prev) => prev.map((t) => (t.value === match.value ? { ...t, selected: true } : t)));
    } else if (terms.length < 12) {
      setTerms((prev) => [...prev, { value, selected: true }]);
    }

    setDraft('');
  };

  const atKeywordCap = terms.length >= 12;

  return (
    <div className="animate-fade-up mx-auto max-w-3xl">
      <button onClick={onBack} className="text-[13px] font-semibold muted transition hover:text-accent">
        ← Back
      </button>

      <div className="mt-5 flex flex-wrap items-center gap-2.5">
        <span className="text-[13px] muted">Researching</span>
        <span className="inline-flex items-center gap-2 rounded-xl bg-ink px-3.5 py-2 text-[13.5px] font-semibold text-white shadow-[0_10px_26px_-14px_rgba(0,0,0,.8)] dark:bg-white dark:text-ink">
          {phrase}
        </span>
      </div>

      <h1 className="mt-7 font-display text-[26px] leading-tight font-bold tracking-[-.02em] sm:text-[32px]">
        Add terms to widen the pull
      </h1>
      <p className="mt-2.5 text-[13.5px] muted">
        We scrape broadly on <b className="text-ink dark:text-white">{phrase}</b>, then use everything you tick here to
        filter and rank what comes back. Keywords are fixed once the search is saved.
      </p>

      <div className="ring-gradient mt-7 rounded-3xl bg-white/70 p-5 backdrop-blur-2xl sm:p-6 dark:bg-white/[.04]">
        {loading ? (
          <>
            <p className="mb-4 inline-flex items-center gap-2 text-[12.5px] font-semibold text-accent dark:text-accent-glow">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-accent border-t-transparent" />
              Suggesting keywords…
            </p>
            <SkeletonChips />
          </>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              {terms.map(({ value, selected: on, locked }) =>
                locked ? (
                  <span
                    key={value}
                    title="The primary phrase is always included"
                    className="inline-flex items-center gap-2.5 rounded-xl border border-accent/50 bg-accent/10 py-2.5 pr-3.5 pl-3.5 text-[13.5px] font-semibold text-accent dark:text-accent-glow"
                  >
                    <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md border border-accent bg-accent text-white">
                      <Check />
                    </span>
                    {value}
                    <span className="text-[10.5px] font-bold tracking-wider uppercase opacity-60">primary</span>
                  </span>
                ) : (
                  <KeywordChip
                    key={value}
                    value={value}
                    selected={on}
                    onToggle={() => toggle(value)}
                    onRemove={() => remove(value)}
                  />
                )
              )}
            </div>

            <form onSubmit={add} className="mt-5 flex max-w-md gap-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={atKeywordCap ? 'Keyword limit reached' : 'Add your own keyword'}
                aria-label="Add your own keyword"
                disabled={atKeywordCap}
                className="field h-11 flex-1 text-sm"
              />
              <button type="submit" disabled={!draft.trim() || atKeywordCap} className="btn-ghost h-11 px-4 text-sm">
                <Plus className="h-3.5 w-3.5" /> Add
              </button>
            </form>

            {expansionSource === 'fallback' && (
              <p className="mt-3 text-[12px] faint">
                Suggestions came from templates this time — edit them freely.
              </p>
            )}
          </>
        )}
      </div>

      {/* step two: name + refresh cadence */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="search-name" className="block text-[12.5px] font-semibold">
            Search name
          </label>
          <input
            id="search-name"
            value={name}
            maxLength={80}
            onChange={(e) => setName(e.target.value)}
            className="field mt-2 h-11 text-sm"
          />
        </div>

        <div>
          <span className="block text-[12.5px] font-semibold">Refresh</span>
          <div className="mt-2 flex gap-2">
            {FREQUENCIES.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFrequency(f.value)}
                title={f.hint}
                className={`h-11 flex-1 rounded-xl border text-[13.5px] font-semibold transition-all duration-300 ${
                  frequency === f.value
                    ? 'border-accent/50 bg-accent/10 text-accent dark:text-accent-glow'
                    : 'border-black/[.09] muted hover:border-accent/35 dark:border-white/[.12]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-2.5 text-[12px] faint">{FREQUENCIES.find((f) => f.value === frequency)?.hint}</p>

      {error && (
        <p className="mt-4 rounded-xl border border-hot/30 bg-hot/10 px-4 py-3 text-[13px] text-hot">{error}</p>
      )}

      <div className="mt-8 flex flex-col gap-4 border-t border-black/[.06] pt-6 sm:flex-row sm:items-center sm:justify-between dark:border-white/[.07]">
        <p className="text-[13px] muted">
          <b className="font-display text-[15px] text-ink dark:text-white">{selected.length}</b> keyword
          {selected.length === 1 ? '' : 's'} · 1 search covers everything you select
        </p>
        <button
          onClick={() => onSubmit({ keywords: selected, frequency, name: name.trim() || phrase })}
          disabled={loading || submitting || selected.length === 0}
          className="btn-accent h-[52px] px-7 text-[15px]"
        >
          {submitting ? 'Starting…' : 'Run search'} <Arrow />
        </button>
      </div>
    </div>
  );
}
