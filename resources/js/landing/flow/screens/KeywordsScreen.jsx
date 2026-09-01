import { useEffect, useRef, useState } from 'react';
import { Check, Close, Plus, Arrow, Refresh } from '../../components/Icons.jsx';
import { expandKeywords } from '../api.js';

const KEYWORD_CAP = 12;

function SkeletonChips({ phrase }) {
  return (
    <>
      <p className="hint" role="status" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 12, color: 'var(--amber-ink)', fontWeight: 600 }}>
        <span className="chip-spin" aria-hidden />
        Finding related keywords…
      </p>
      <div className="chips">
        <span className="chip on chip--expand-in">
          <span className="chip__b"><Check /></span>
          {phrase}
          <span className="chip__y">main</span>
        </span>
        {[132, 108, 156, 96, 140].map((width, i) => (
          <span key={i} className="chip-skel" style={{ width, animationDelay: `${i * 70}ms` }} />
        ))}
      </div>
    </>
  );
}

/**
 * Step two — widen the single scrape with keywords.
 *
 * The scrape is sent only the primary phrase; every ticked keyword filters the
 * results locally, so "1 search covers everything you select" is literally true.
 * The subject itself is changed by stepping Back, so there is no edit control here.
 */
export default function KeywordsScreen({
  phrase,
  noun = 'brand',
  searchType = 'brand',
  nextLabel = 'Run search',
  onBack,
  onSubmit,
  submitting = false,
  error = null,
}) {
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refining, setRefining] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [expansionSource, setExpansionSource] = useState(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');
  const requested = useRef(false);
  // Once the AI list lands it is authoritative; the instant preview must not
  // clobber it if it happens to resolve later.
  const aiApplied = useRef(false);
  // Whether the user has touched the list — if so, the AI pass folds its new
  // terms in as additions instead of replacing their work.
  const interacted = useRef(false);

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

  /**
   * Fold a fresh set of suggestions in without discarding the user's work:
   * anything they added or removed stays, existing selections are preserved,
   * and only genuinely new terms are appended (respecting the cap).
   */
  const mergeExpansion = (keywords, forPhrase, previous = []) => {
    const present = new Set(previous.map((t) => t.value.toLowerCase()));
    const additions = keywords
      .filter((value) => {
        const key = value.toLowerCase();
        if (key === forPhrase.toLowerCase() || present.has(key)) return false;
        present.add(key);
        return true;
      })
      .map((value) => ({ value, selected: false, custom: false }));

    return [...previous, ...additions].slice(0, KEYWORD_CAP);
  };

  useEffect(() => {
    if (requested.current) return undefined;
    requested.current = true;

    const controller = new AbortController();

    // Phase 1 — instant, OpenAI-free suggestions so chips paint immediately
    // instead of sitting on a skeleton for the seconds the model takes.
    expandKeywords(phrase, { signal: controller.signal, instant: true, type: searchType })
      .then((payload) => {
        if (aiApplied.current) return; // AI already won the race — leave it be.
        const keywords = Array.isArray(payload?.keywords) ? payload.keywords : [phrase];
        setExpansionSource(payload?.source ?? null);
        setTerms(applyExpansion(keywords, phrase));
        setLoading(false);
        // 'preview'/'fallback' means the model is still refining in phase 2.
        setRefining(payload?.source === 'preview');
      })
      .catch(() => {
        /* the AI pass below is the real result — let it drive on its own */
      });

    // Phase 2 — the full AI expansion. It replaces the preview when the user
    // has not touched anything yet, otherwise it only appends new terms.
    expandKeywords(phrase, { signal: controller.signal, type: searchType })
      .then((payload) => {
        aiApplied.current = true;
        const keywords = Array.isArray(payload?.keywords) ? payload.keywords : [phrase];
        setExpansionSource(payload?.source ?? null);
        setTerms((prev) =>
          interacted.current && prev.length > 0
            ? mergeExpansion(keywords, phrase, prev)
            : applyExpansion(keywords, phrase, prev),
        );
      })
      .catch(() => {
        setTerms((prev) => (prev.length > 0 ? prev : [{ value: phrase, selected: true, locked: true }]));
      })
      .finally(() => {
        setLoading(false);
        setRefining(false);
      });

    return () => controller.abort();
  }, [phrase]);

  const regenerate = () => {
    setRegenerating(true);

    expandKeywords(phrase, { fresh: true, type: searchType })
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

  const toggle = (value) => {
    interacted.current = true;
    setTerms((prev) => prev.map((t) => (t.value === value && !t.locked ? { ...t, selected: !t.selected } : t)));
  };

  const remove = (value) => {
    interacted.current = true;
    setTerms((prev) => prev.filter((t) => t.value !== value || t.locked));
  };

  const commitAdd = () => {
    interacted.current = true;
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

        {loading ? (
          <SkeletonChips phrase={phrase} />
        ) : (
          <>
            <div className="chips">
              {terms.map(({ value, selected: on, locked, custom }, index) =>
                locked ? (
                  <span key={value} className="chip on chip--expand-in" style={{ animationDelay: `${index * 45}ms` }} title="The main keyword is always included">
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
                    className={`chip chip--expand-in${on ? ' on' : ''}`}
                    style={{ cursor: 'pointer', animationDelay: `${index * 45}ms` }}
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
              {refining ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--amber-ink)', fontWeight: 600 }}>
                  <span className="chip-spin" aria-hidden />
                  Sharpening suggestions…
                </span>
              ) : (
                <>
                  {selected.length} of {terms.length} selected · each keyword widens the same single search.
                </>
              )}
            </p>
            {expansionSource === 'fallback' && (
              <p className="hint">Suggestions came from templates this time — edit them freely.</p>
            )}
          </>
        )}
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
          onClick={() => onSubmit({ phrase, keywords: selected, frequency: 'weekly', name: phrase })}
        >
          {submitting ? 'Starting…' : nextLabel} <Arrow />
        </button>
      </div>
    </>
  );
}
