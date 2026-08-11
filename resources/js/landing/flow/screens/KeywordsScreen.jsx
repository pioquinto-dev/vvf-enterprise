import { useEffect, useRef, useState } from 'react';
import { Check, Close, Plus, Arrow, Search } from '../../components/Icons.jsx';
import { expandKeywords } from '../api.js';

const KEYWORD_CAP = 12;

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

const Pencil = ({ className = 'h-3.5 w-3.5' }) => (
  <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);

const Refresh = ({ className = 'h-3.5 w-3.5' }) => (
  <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-2.6-6.4" />
    <path d="M21 3v6h-6" />
  </svg>
);

function KeywordChip({ value, selected, custom, onToggle, onRemove }) {
  return (
    <span
      className={`group inline-flex items-center rounded-xl border text-[13.5px] transition-all duration-300 ${
        selected
          ? 'border-accent/50 bg-accent/10 font-semibold text-accent shadow-[0_8px_22px_-14px_rgba(109,75,255,.9)] dark:text-accent-glow'
          : 'border-black/[.09] muted hover:-translate-y-px hover:border-accent/35 dark:border-white/[.12]'
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
        {custom && (
          <span className="text-[10px] font-bold tracking-wider uppercase opacity-55">yours</span>
        )}
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

function Card({ step, title, description, action, children }) {
  return (
    <section className="rounded-2xl border border-black/[.07] p-5 sm:p-6 dark:border-white/[.09]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex gap-3">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/[.1] font-display text-[12px] font-bold text-accent dark:bg-accent-glow/[.12] dark:text-accent-glow">
            {step}
          </span>
          <div>
            <h2 className="font-display text-[16px] font-bold tracking-[-.01em]">{title}</h2>
            {description && <p className="mt-1 max-w-lg text-[12.5px] leading-relaxed faint">{description}</p>}
          </div>
        </div>
        {action}
      </div>

      <div className="mt-5">{children}</div>
    </section>
  );
}

export default function KeywordsScreen({ phrase: initialPhrase, onBack, onSubmit, submitting = false, error = null }) {
  const [phrase, setPhrase] = useState(initialPhrase);
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [expansionSource, setExpansionSource] = useState(null);
  const [draft, setDraft] = useState('');
  const [frequency, setFrequency] = useState('weekly');
  const [name, setName] = useState(initialPhrase);
  const [nameTouched, setNameTouched] = useState(false);
  const [editingPhrase, setEditingPhrase] = useState(false);
  const [phraseDraft, setPhraseDraft] = useState(initialPhrase);
  const [regenPrompt, setRegenPrompt] = useState(false);
  const requested = useRef(false);

  /**
   * Build a term list from an expansion payload, keeping anything the user
   * typed themselves — regenerating suggestions must never quietly delete work.
   */
  const applyExpansion = (keywords, forPhrase, previous = []) => {
    const custom = previous.filter((t) => t.custom && t.value.toLowerCase() !== forPhrase.toLowerCase());
    const seen = new Set([forPhrase.toLowerCase()]);

    const suggested = keywords
      .filter((value) => {
        const key = value.toLowerCase();
        if (key === forPhrase.toLowerCase() || seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map((value, i) => ({ value, selected: i <= 1, custom: false }));

    return [
      { value: forPhrase, selected: true, locked: true },
      ...suggested,
      ...custom.filter((t) => !seen.has(t.value.toLowerCase())),
    ].slice(0, KEYWORD_CAP);
  };

  // Expansion is the first thing that happens on this page — the user should
  // land here and watch suggestions arrive, not stare at an empty box.
  useEffect(() => {
    if (requested.current) return undefined;
    requested.current = true;

    const controller = new AbortController();

    expandKeywords(initialPhrase, { signal: controller.signal })
      .then((payload) => {
        const keywords = Array.isArray(payload?.keywords) ? payload.keywords : [initialPhrase];
        setExpansionSource(payload?.source ?? null);
        setTerms(applyExpansion(keywords, initialPhrase));
      })
      .catch(() => {
        setTerms([{ value: initialPhrase, selected: true, locked: true }]);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [initialPhrase]);

  const regenerate = (forPhrase = phrase) => {
    setRegenPrompt(false);
    setRegenerating(true);

    expandKeywords(forPhrase)
      .then((payload) => {
        const keywords = Array.isArray(payload?.keywords) ? payload.keywords : [forPhrase];
        setExpansionSource(payload?.source ?? null);
        setTerms((prev) => applyExpansion(keywords, forPhrase, prev));
      })
      .catch(() => {
        /* keep what is on screen — a failed suggestion round is not a broken page */
      })
      .finally(() => setRegenerating(false));
  };

  const savePhrase = () => {
    const next = phraseDraft.trim().replace(/\s+/g, ' ');
    setEditingPhrase(false);

    if (!next || next.toLowerCase() === phrase.toLowerCase()) {
      setPhraseDraft(phrase);
      return;
    }

    setPhrase(next);
    setPhraseDraft(next);
    if (!nameTouched) setName(next);

    // The primary phrase is what actually gets scraped, so it always leads the list.
    setTerms((prev) => [
      { value: next, selected: true, locked: true },
      ...prev.filter((t) => !t.locked && t.value.toLowerCase() !== next.toLowerCase()),
    ]);

    setRegenPrompt(true);
  };

  const selected = terms.filter((t) => t.selected).map((t) => t.value);
  const busy = loading || regenerating;

  const toggle = (value) =>
    setTerms((prev) => prev.map((t) => (t.value === value && !t.locked ? { ...t, selected: !t.selected } : t)));

  const remove = (value) => setTerms((prev) => prev.filter((t) => t.value !== value || t.locked));

  const setAll = (on) => setTerms((prev) => prev.map((t) => (t.locked ? t : { ...t, selected: on })));

  const add = (e) => {
    e.preventDefault();
    const value = draft.trim().replace(/\s+/g, ' ');
    if (!value) return;

    const match = terms.find((t) => t.value.toLowerCase() === value.toLowerCase());

    if (match) {
      setTerms((prev) => prev.map((t) => (t.value === match.value ? { ...t, selected: true } : t)));
    } else if (terms.length < KEYWORD_CAP) {
      setTerms((prev) => [...prev, { value, selected: true, custom: true }]);
    }

    setDraft('');
  };

  const atKeywordCap = terms.length >= KEYWORD_CAP;
  const optional = terms.filter((t) => !t.locked);
  const optionalSelected = optional.filter((t) => t.selected).length;

  return (
    <div className="animate-fade-up">
      <button onClick={onBack} className="text-[13px] font-semibold muted transition hover:text-accent">
        ← Change subject
      </button>

      <h1 className="mt-4 font-display text-[26px] leading-tight font-bold tracking-[-.03em] sm:text-[32px]">
        Tune the search before it runs
      </h1>
      <p className="mt-2.5 max-w-xl text-[13.5px] leading-relaxed muted">
        Keywords are fixed once the search is saved.
      </p>

      <div className="mt-6 space-y-4">
        {/* ---------------- 1. main keyword ---------------- */}
        <Card
          step="1"
          title="Main keyword"
          description="This is the phrase we send to TikTok. Everything else filters the results it returns."
        >
          {editingPhrase ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="flex h-11 flex-1 items-center gap-2.5 rounded-xl border border-accent/40 bg-white px-3.5 dark:bg-white/[.05]">
                <Search className="h-4 w-4 shrink-0 faint" />
                <input
                  autoFocus
                  value={phraseDraft}
                  maxLength={80}
                  onChange={(e) => setPhraseDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') savePhrase();
                    if (e.key === 'Escape') {
                      setPhraseDraft(phrase);
                      setEditingPhrase(false);
                    }
                  }}
                  aria-label="Main keyword"
                  className="w-full border-0 bg-transparent p-0 text-[14px] font-semibold text-ink focus:ring-0 focus:outline-none dark:text-white"
                />
              </label>
              <div className="flex gap-2">
                <button type="button" onClick={savePhrase} className="btn-accent h-11 px-4 text-[13.5px]">
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPhraseDraft(phrase);
                    setEditingPhrase(false);
                  }}
                  className="btn-ghost h-11 px-4 text-[13.5px]"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-xl bg-ink px-3.5 py-2.5 text-[14px] font-semibold text-white dark:bg-white dark:text-ink">
                <Search className="h-3.5 w-3.5 opacity-70" />
                {phrase}
              </span>
              <button
                type="button"
                onClick={() => setEditingPhrase(true)}
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-accent transition hover:gap-2 dark:text-accent-glow"
              >
                <Pencil /> Change
              </button>
            </div>
          )}

          {regenPrompt && (
            <div className="mt-4 flex flex-col gap-3 rounded-xl border border-accent/25 bg-accent/[.06] px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-accent-glow/25 dark:bg-accent-glow/[.07]">
              <p className="text-[13px] muted">
                Main keyword is now <b className="text-ink dark:text-white">{phrase}</b>. Regenerate the suggested
                keywords to match?
              </p>
              <div className="flex shrink-0 gap-2">
                <button type="button" onClick={() => regenerate(phrase)} className="btn-accent h-9 px-3.5 text-[13px]">
                  Regenerate
                </button>
                <button type="button" onClick={() => setRegenPrompt(false)} className="btn-ghost h-9 px-3.5 text-[13px]">
                  Keep mine
                </button>
              </div>
            </div>
          )}
        </Card>

        {/* ---------------- 2. keywords ---------------- */}
        <Card
          step="2"
          title="Keywords"
          description="Tick the terms that describe the videos you want. Untick anything off-topic, or add your own."
          action={
            <button
              type="button"
              onClick={() => regenerate()}
              disabled={busy}
              className="btn-ghost h-9 shrink-0 px-3.5 text-[13px]"
            >
              <Refresh className={regenerating ? 'h-3.5 w-3.5 animate-spin' : 'h-3.5 w-3.5'} />
              {regenerating ? 'Regenerating…' : 'Regenerate'}
            </button>
          }
        >
          {busy ? (
            <>
              <p className="mb-4 inline-flex items-center gap-2 text-[12.5px] font-semibold text-accent dark:text-accent-glow">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                Suggesting keywords for “{phrase}”…
              </p>
              <SkeletonChips />
            </>
          ) : (
            <>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-[12.5px] faint">
                  <b className="text-ink dark:text-white">{selected.length}</b> of {terms.length} selected
                </p>
                {optional.length > 0 && (
                  <div className="flex gap-3 text-[12.5px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setAll(true)}
                      disabled={optionalSelected === optional.length}
                      className="text-accent transition disabled:opacity-35 dark:text-accent-glow"
                    >
                      Select all
                    </button>
                    <button
                      type="button"
                      onClick={() => setAll(false)}
                      disabled={optionalSelected === 0}
                      className="muted transition hover:text-accent disabled:opacity-35"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {terms.map(({ value, selected: on, locked, custom }) =>
                  locked ? (
                    <span
                      key={value}
                      title="The main keyword is always included"
                      className="inline-flex items-center gap-2.5 rounded-xl border border-accent/50 bg-accent/10 px-3.5 py-2.5 text-[13.5px] font-semibold text-accent dark:text-accent-glow"
                    >
                      <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md border border-accent bg-accent text-white">
                        <Check />
                      </span>
                      {value}
                      <span className="text-[10px] font-bold tracking-wider uppercase opacity-60">main</span>
                    </span>
                  ) : (
                    <KeywordChip
                      key={value}
                      value={value}
                      selected={on}
                      custom={custom}
                      onToggle={() => toggle(value)}
                      onRemove={() => remove(value)}
                    />
                  )
                )}
              </div>

              <form onSubmit={add} className="mt-4 flex max-w-md gap-2">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={atKeywordCap ? `Limit of ${KEYWORD_CAP} keywords reached` : 'Add your own keyword'}
                  aria-label="Add your own keyword"
                  disabled={atKeywordCap}
                  className="field h-11 flex-1 text-sm"
                />
                <button type="submit" disabled={!draft.trim() || atKeywordCap} className="btn-ghost h-11 px-4 text-sm">
                  <Plus className="h-3.5 w-3.5" /> Add
                </button>
              </form>

              {expansionSource === 'fallback' && (
                <p className="mt-3 text-[12px] faint">Suggestions came from templates this time — edit them freely.</p>
              )}
            </>
          )}
        </Card>

        {/* ---------------- 3. label + cadence ---------------- */}
        <Card step="3" title="Name and refresh" description="How this search shows up in Bookmark, and how often we re-run it.">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="search-name" className="block text-[12.5px] font-semibold">
                Search name
              </label>
              <input
                id="search-name"
                value={name}
                maxLength={80}
                onChange={(e) => {
                  setName(e.target.value);
                  setNameTouched(true);
                }}
                className="field mt-2 h-11 text-sm"
              />
            </div>

            <div>
              <span className="block text-[12.5px] font-semibold">Refresh</span>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {FREQUENCIES.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => setFrequency(f.value)}
                    aria-pressed={frequency === f.value}
                    className={`h-11 rounded-xl border text-[13.5px] font-semibold transition-all duration-300 ${
                      frequency === f.value
                        ? 'border-accent/50 bg-accent/10 text-accent dark:text-accent-glow'
                        : 'border-black/[.09] muted hover:border-accent/35 dark:border-white/[.12]'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[12px] faint">{FREQUENCIES.find((f) => f.value === frequency)?.hint}</p>
            </div>
          </div>
        </Card>
      </div>

      {error && (
        <p className="mt-4 rounded-xl border border-hot/30 bg-hot/10 px-4 py-3 text-[13px] text-hot">{error}</p>
      )}

      <div className="mt-6 flex flex-col gap-4 border-t border-black/[.06] pt-6 sm:flex-row sm:items-center sm:justify-between dark:border-white/[.07]">
        <p className="text-[13px] muted">
          <b className="font-display text-[15px] text-ink dark:text-white">{selected.length}</b> keyword
          {selected.length === 1 ? '' : 's'} · 1 search covers everything you select
        </p>
        <button
          onClick={() =>
            onSubmit({ phrase, keywords: selected, frequency, name: name.trim() || phrase })
          }
          disabled={busy || submitting || selected.length === 0}
          className="btn-accent h-[52px] px-7 text-[15px]"
        >
          {submitting ? 'Starting…' : 'Run search'} <Arrow />
        </button>
      </div>
    </div>
  );
}
