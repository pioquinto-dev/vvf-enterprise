import { useEffect, useRef, useState } from 'react';
import { Check, Close, Plus, Arrow, Refresh } from '../../components/Icons.jsx';
import { expandKeywords } from '../api.js';

const KEYWORD_CAP = 12;

const FREQUENCIES = [
  { value: 'weekly', label: 'Weekly', hint: 'Fresh viral videos every week. Best for fast-moving categories.' },
  { value: 'monthly', label: 'Monthly', hint: 'A monthly pull. Lighter cadence for slower niches.' },
];

function SkeletonChips() {
  return (
    <>
      <p className="hint" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 12, color: 'var(--amber-ink)', fontWeight: 600 }}>
        <span className="chip-spin" aria-hidden />
        Suggesting keywords…
      </p>
      <div className="chips" aria-hidden>
        {[132, 108, 156, 96, 140, 118].map((width, i) => (
          <span key={i} className="chip-skel" style={{ width }} />
        ))}
      </div>
    </>
  );
}

/**
 * Step two — widen the single scrape with keywords and set the cadence.
 *
 * The scrape is sent only the primary phrase; every ticked keyword filters the
 * results locally, so "1 search covers everything you select" is literally true.
 * The subject itself is changed by stepping Back, so there is no edit control here.
 */
export default function KeywordsScreen({
  phrase,
  noun = 'brand',
  nextLabel = 'Run search',
  onBack,
  onSubmit,
  submitting = false,
  error = null,
}) {
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [expansionSource, setExpansionSource] = useState(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');
  const [frequency, setFrequency] = useState('weekly');
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
      .map((value, i) => ({ value, selected: i <= 3, custom: false }));

    return [
      { value: forPhrase, selected: true, locked: true },
      ...suggested,
      ...custom.filter((t) => !seen.has(t.value.toLowerCase())),
    ].slice(0, KEYWORD_CAP);
  };

  useEffect(() => {
    if (requested.current) return undefined;
    requested.current = true;

    const controller = new AbortController();

    expandKeywords(phrase, { signal: controller.signal })
      .then((payload) => {
        const keywords = Array.isArray(payload?.keywords) ? payload.keywords : [phrase];
        setExpansionSource(payload?.source ?? null);
        setTerms(applyExpansion(keywords, phrase));
      })
      .catch(() => {
        setTerms([{ value: phrase, selected: true, locked: true }]);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [phrase]);

  const regenerate = () => {
    setRegenerating(true);

    expandKeywords(phrase)
      .then((payload) => {
        const keywords = Array.isArray(payload?.keywords) ? payload.keywords : [phrase];
        setExpansionSource(payload?.source ?? null);
        setTerms((prev) => applyExpansion(keywords, phrase, prev));
      })
      .catch(() => {
        /* keep what is on screen — a failed suggestion round is not a broken page */
      })
      .finally(() => setRegenerating(false));
  };

  const selected = terms.filter((t) => t.selected).map((t) => t.value);
  const busy = loading || regenerating;
  const atKeywordCap = terms.length >= KEYWORD_CAP;

  const toggle = (value) =>
    setTerms((prev) => prev.map((t) => (t.value === value && !t.locked ? { ...t, selected: !t.selected } : t)));

  const remove = (value) => setTerms((prev) => prev.filter((t) => t.value !== value || t.locked));

  const commitAdd = () => {
    const value = draft.trim().replace(/\s+/g, ' ');
    setDraft('');
    setAdding(false);
    if (!value) return;

    const match = terms.find((t) => t.value.toLowerCase() === value.toLowerCase());
    if (match) {
      setTerms((prev) => prev.map((t) => (t.value === match.value ? { ...t, selected: true } : t)));
    } else if (terms.length < KEYWORD_CAP) {
      setTerms((prev) => [...prev, { value, selected: true, custom: true }]);
    }
  };

  return (
    <>
      {/* ---------------- expand ---------------- */}
      <div className="sect">
        <div className="sect__h">
          <div>
            <p className="sect__n">Expand</p>
            <h2>Widen the pull</h2>
            <p className="faint" style={{ fontSize: '.85rem', marginTop: 6 }}>
              We suggest the terms people actually pair with your {noun} on TikTok.
            </p>
          </div>
          <button type="button" className="btn btn--g btn--sm" onClick={regenerate} disabled={busy}>
            <Refresh className={regenerating ? 'h-[15px] w-[15px] animate-spin' : 'h-[15px] w-[15px]'} />
            {regenerating ? 'Regenerating…' : 'Regenerate'}
          </button>
        </div>

        {busy ? (
          <SkeletonChips />
        ) : (
          <>
            <div className="chips">
              {terms.map(({ value, selected: on, locked, custom }) =>
                locked ? (
                  <span key={value} className="chip on" title="The main keyword is always included">
                    <span className="chip__b">
                      <Check />
                    </span>
                    {value}
                    <span className="chip__y">main</span>
                  </span>
                ) : (
                  <span
                    key={value}
                    role="button"
                    tabIndex={0}
                    aria-pressed={on}
                    onClick={() => toggle(value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggle(value);
                      }
                    }}
                    className={`chip${on ? ' on' : ''}`}
                    style={{ cursor: 'pointer' }}
                  >
                    <span className="chip__b">
                      <Check />
                    </span>
                    {value}
                    {custom && <span className="chip__y">yours</span>}
                    <button
                      type="button"
                      className="chip__x"
                      aria-label={`Remove ${value}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        remove(value);
                      }}
                    >
                      <Close className="h-[13px] w-[13px]" />
                    </button>
                  </span>
                )
              )}

              {adding ? (
                <input
                  autoFocus
                  className="chip__add"
                  value={draft}
                  maxLength={40}
                  placeholder="Add a keyword…"
                  onChange={(e) => setDraft(e.target.value)}
                  onBlur={commitAdd}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitAdd();
                    if (e.key === 'Escape') {
                      setDraft('');
                      setAdding(false);
                    }
                  }}
                />
              ) : (
                <button
                  type="button"
                  className="chip"
                  style={{ color: 'var(--amber-ink)', borderStyle: 'dashed', cursor: atKeywordCap ? 'not-allowed' : 'pointer' }}
                  disabled={atKeywordCap}
                  onClick={() => setAdding(true)}
                >
                  <Plus className="h-[13px] w-[13px]" /> Add your own
                </button>
              )}
            </div>

            <p className="hint">
              {selected.length} of {terms.length} selected · each keyword widens the same single search.
            </p>
            {expansionSource === 'fallback' && (
              <p className="hint">Suggestions came from templates this time — edit them freely.</p>
            )}
          </>
        )}
      </div>

      {/* ---------------- schedule ---------------- */}
      <div className="sect">
        <div className="sect__h">
          <div>
            <p className="sect__n">Schedule</p>
            <h2>How often should we re-run it?</h2>
          </div>
        </div>
        <div className="freq">
          {FREQUENCIES.map((f) => (
            <button
              key={f.value}
              type="button"
              className={`fq${frequency === f.value ? ' on' : ''}`}
              aria-pressed={frequency === f.value}
              onClick={() => setFrequency(f.value)}
            >
              <span className="fq__t">
                <span className="fq__r" />
                {f.label}
              </span>
              <p>{f.hint}</p>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="sect">
          <p className="pill pill--bad" style={{ height: 'auto', padding: '8px 12px' }}>
            {error}
          </p>
        </div>
      )}

      {/* ---------------- actions ---------------- */}
      <div className="sect actrow">
        <button type="button" className="btn btn--g" onClick={onBack}>
          Back
        </button>
        <button
          type="button"
          className="btn btn--y"
          disabled={busy || submitting || selected.length === 0}
          onClick={() => onSubmit({ phrase, keywords: selected, frequency, name: phrase })}
        >
          {submitting ? 'Starting…' : nextLabel} <Arrow />
        </button>
      </div>
    </>
  );
}
