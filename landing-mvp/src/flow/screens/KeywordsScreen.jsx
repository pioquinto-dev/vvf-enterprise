import { useState } from 'react';
import { Check, Close, Plus, Arrow } from '../../components/Icons.jsx';
import { SEARCH_TYPES } from '../../data/dummy.js';
import { buildKeywords, resolveSubject, resolveType } from '../searchQuery.js';

export default function KeywordsScreen({ type, subject, onBack, onRun }) {
  const safeType = resolveType(type);
  const config = SEARCH_TYPES[safeType];
  const resolved = resolveSubject(safeType, subject);

  // Suggestions seed the list, but the list is the user's from here on.
  const [terms, setTerms] = useState(() => {
    const suggested = buildKeywords(safeType, resolved);
    return suggested.map((value, i) => ({ value, selected: i < 2 }));
  });
  const [draft, setDraft] = useState('');

  const selected = terms.filter((t) => t.selected).map((t) => t.value);

  const toggle = (value) =>
    setTerms((prev) => prev.map((t) => (t.value === value ? { ...t, selected: !t.selected } : t)));

  const remove = (value) => setTerms((prev) => prev.filter((t) => t.value !== value));

  const add = (e) => {
    e.preventDefault();
    const value = draft.trim().replace(/\s+/g, ' ');
    if (!value) return;

    const exists = terms.some((t) => t.value.toLowerCase() === value.toLowerCase());
    if (exists) {
      // Already in the list — just make sure it is ticked rather than duplicating it.
      setTerms((prev) =>
        prev.map((t) => (t.value.toLowerCase() === value.toLowerCase() ? { ...t, selected: true } : t))
      );
    } else {
      setTerms((prev) => [...prev, { value, selected: true }]);
    }

    setDraft('');
  };

  return (
    <div className="animate-fade-up mx-auto max-w-3xl">
      <button onClick={onBack} className="text-[13px] font-semibold muted transition hover:text-accent">
        ← Back
      </button>

      <div className="mt-5 flex flex-wrap items-center gap-2.5">
        <span className="text-[13px] muted">Researching</span>
        <span className="inline-flex items-center gap-2 rounded-xl bg-ink px-3.5 py-2 text-[13.5px] font-semibold text-white shadow-[0_10px_26px_-14px_rgba(0,0,0,.8)] dark:bg-white dark:text-ink">
          <span className="font-medium text-accent-glow dark:text-accent">{config.label}</span>
          {resolved}
        </span>
      </div>

      <h1 className="mt-7 font-display text-[26px] leading-tight font-bold tracking-[-.02em] sm:text-[32px]">
        {config.sectionHeading}
      </h1>
      <p className="mt-2.5 text-[13.5px] muted">
        One subject per search. Tick the terms that fit, drop the ones that don't, and add your own.
      </p>

      <div className="ring-gradient mt-7 rounded-3xl bg-white/70 p-5 backdrop-blur-2xl sm:p-6 dark:bg-white/[.04]">
        {terms.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {terms.map(({ value, selected: on }) => (
              <span
                key={value}
                className={`group inline-flex items-center rounded-xl border text-[13.5px] transition-all duration-300 ${
                  on
                    ? 'border-accent/50 bg-accent/10 font-semibold text-accent shadow-[0_8px_22px_-14px_rgba(109,75,255,.9)] dark:text-accent-glow'
                    : 'border-black/[.09] hover:-translate-y-px hover:border-accent/35 dark:border-white/[.12]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggle(value)}
                  aria-pressed={on}
                  className="flex items-center gap-2.5 py-2.5 pr-2 pl-3.5"
                >
                  <span
                    className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md border transition-all duration-200 ${
                      on ? 'border-accent bg-accent text-white' : 'border-black/25 dark:border-white/30'
                    }`}
                  >
                    {on && <Check />}
                  </span>
                  {value}
                </button>

                <button
                  type="button"
                  onClick={() => remove(value)}
                  aria-label={`Remove ${value}`}
                  title="Remove"
                  className="py-2.5 pr-3 pl-1 opacity-35 transition-opacity duration-200 hover:opacity-100"
                >
                  <Close className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-black/15 px-4 py-7 text-center text-[13px] faint dark:border-white/15">
            No keywords left. Add one below, or run the search on <b className="muted">{resolved}</b> alone.
          </p>
        )}

        <form onSubmit={add} className="mt-5 flex max-w-md gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Add your own keyword"
            aria-label="Add your own keyword"
            className="field h-11 flex-1 text-sm"
          />
          <button type="submit" disabled={!draft.trim()} className="btn-ghost h-11 px-4 text-sm">
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
        </form>
      </div>

      <div className="mt-8 flex flex-col gap-4 border-t border-black/[.06] pt-6 sm:flex-row sm:items-center sm:justify-between dark:border-white/[.07]">
        <p className="text-[13px] muted">
          <b className="font-display text-[15px] text-ink dark:text-white">{selected.length}</b> added · 1 search
          covers everything you select
        </p>
        <button onClick={() => onRun(selected)} className="btn-accent h-[52px] px-7 text-[15px]">
          Run search <Arrow />
        </button>
      </div>
    </div>
  );
}
