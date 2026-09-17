import { useEffect, useMemo, useRef, useState } from 'react';
import { router, usePage } from '@inertiajs/react';

import { Arrow, Check, Close, Search, Plus, Refresh } from '../../landing/components/Icons.jsx';
import DuplicateSearchModal from './DuplicateSearchModal.jsx';
import UpgradePromptModal from './UpgradePromptModal.jsx';
import {
  billing as billingApi,
  createSavedSearch,
  checkDuplicateSavedSearch,
  expandKeywords,
  fetchKeywordSuggestions,
  trackSearch,
} from '../../landing/flow/api.js';

/**
 * The brand/product page's expand-in-place search flow (matches the
 * "Brand Beacon — Inline search flow" mockup).
 *
 * States: collapsed → keywords, then straight to the results page (which
 * owns the loading state). The card sits at
 * the top of the page and expands in-place — the page context beneath it
 * (moving-this-week, suggested-to-track, all-searches) never unmounts.
 *
 * This is the only search flow now — the dashboard's older SearchWizard was
 * retired along with the search homepage.
 */

/* Types and deletes sample subjects into a ghost placeholder. Pauses while
 * the field is focused or filled; shows the first word statically when the
 * user prefers reduced motion. */
function useTypingWords(words, active) {
  const list = Array.isArray(words) ? words.filter(Boolean) : [];
  const [text, setText] = useState(list[0] ?? '');
  const key = list.join('|');

  useEffect(() => {
    if (!list.length) return undefined;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!active || reduce) { setText(list[0]); return undefined; }

    let w = 0; let i = 0; let del = false; let timer;
    const step = () => {
      const word = list[w];
      i += del ? -1 : 1;
      setText(word.slice(0, i));
      let wait = del ? 40 : 80 + Math.random() * 50;
      if (!del && i === word.length) { del = true; wait = 1600; }
      else if (del && i === 0) { del = false; w = (w + 1) % list.length; wait = 300; }
      timer = window.setTimeout(step, wait);
    };
    step();
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, active]);

  return text;
}

export default function BrandInlineFlow({
  kind = 'brand',
  placeholder = 'Which brand do you want to research?',
  sample = 'rhode skin',
  eyebrow = 'Start a brand search',
  hint = 'One brand per search — we widen it with keywords next.',
  prefillSubject = '',
  prefillNonce = 0,
  expandOnPrefill = false,
  onReset = null,
  onCreated = null,
  // Opt-in list-page variant: mode chip, typing placeholder, quick-pick row.
  modeLabel = null,
  typingWords = null,
  quickPicks = null,
}) {
  const { billing = {}, auth = {} } = usePage().props;
  const signedIn = auth.signedIn ?? Boolean(auth.user);

  const [state, setState] = useState('collapsed'); // collapsed|keywords|running|done
  const [subject, setSubject] = useState('');
  const [subjectSuggestions, setSubjectSuggestions] = useState([]);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [keywords, setKeywords] = useState([]); // [{label, selected, source: 'ai'|'yours'}]
  const [addKeyword, setAddKeyword] = useState('');
  const [expanding, setExpanding] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [duplicateSearch, setDuplicateSearch] = useState(null);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  const inputRef = useRef(null);
  const [inputFocused, setInputFocused] = useState(false);
  const typedWord = useTypingWords(typingWords, state === 'collapsed' && !subject && !inputFocused);
  const subjectFieldRef = useRef(null);
  const rootRef = useRef(null);
  const kwCount = useMemo(() => keywords.filter((k) => k.selected).length, [keywords]);
  const searchLeft = billing.searchCreditsRemaining;
  const searchLimit = billing.searchCreditsLimit;
  const searchCreditsAvailable = !signedIn || searchLimit === -1 || Number(searchLeft ?? 0) > 0;
  const shouldOfferTrial = (billing.trialEligible ?? true) && !(billing.hasUsedTrial ?? false);

  useEffect(() => {
    const controller = new AbortController();

    fetchKeywordSuggestions(kind, subject.trim(), { signal: controller.signal })
      .then((payload) => setSubjectSuggestions(Array.isArray(payload?.suggestions) ? payload.suggestions : []))
      .catch(() => {});

    return () => controller.abort();
  }, [kind, subject]);

  useEffect(() => {
    const close = (event) => {
      if (!subjectFieldRef.current?.contains(event.target)) {
        setShowSuggestions(false);
        setActiveSuggestion(-1);
      }
    };

    document.addEventListener('mousedown', close);

    return () => document.removeEventListener('mousedown', close);
  }, []);

  useEffect(() => {
    const nextSubject = prefillSubject.trim().replace(/\s+/g, ' ');
    if (!nextSubject) return;

    setState('collapsed');
    setSubject(nextSubject);
    setShowSuggestions(false);
    setActiveSuggestion(-1);
    setError(null);

    if (expandOnPrefill) {
      startFlow(nextSubject);
      return;
    }

    rootRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.requestAnimationFrame(() => inputRef.current?.focus());
  }, [prefillNonce, prefillSubject, expandOnPrefill]);

  /* -------- collapsed -> keywords: fetch suggested terms -------- */
  const startFlow = async (prefill) => {
    const q = (typeof prefill === 'string' ? prefill : subject).trim().replace(/\s+/g, ' ');
    if (!q) return;
    if (!searchCreditsAvailable) {
      setUpgradeModalOpen(true);
      return;
    }

    setSubject(q);
    setError(null);
    setState('keywords');
    setExpanding(true);

    try {
      const payload = await expandKeywords(q, { type: kind });
      const seed = [
        ...(payload?.keywords ?? []).slice(0, 6).map((label, i) => ({ label, selected: i < 2, source: 'ai' })),
      ];
      // dedupe and cap
      const seen = new Set();
      const deduped = seed.filter((k) => {
        const key = k.label.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      setKeywords(deduped);
    } catch (e) {
      setError(e.message || 'Could not suggest keywords.');
      setKeywords([{ label: q, selected: true, source: 'yours' }]);
    } finally {
      setExpanding(false);
    }
  };

  const collapse = () => {
    if (onReset) {
      onReset(subject);
      return;
    }
    setState('collapsed');
    setKeywords([]);
    setError(null);
    setAddKeyword('');
  };

  const toggleKeyword = (label) => {
    setKeywords((current) => current.map((k) => (k.label === label ? { ...k, selected: !k.selected } : k)));
  };

  const addOwnKeyword = () => {
    const v = addKeyword.trim().replace(/\s+/g, ' ');
    if (!v) return;
    if (keywords.some((k) => k.label.toLowerCase() === v.toLowerCase())) {
      setAddKeyword('');
      return;
    }
    setKeywords((current) => [...current, { label: v, selected: true, source: 'yours' }]);
    setAddKeyword('');
  };

  const regenerate = async () => {
    if (!subject) return;
    setExpanding(true);
    try {
      const payload = await expandKeywords(subject, { fresh: true, type: kind });
      const fresh = (payload?.keywords ?? []).slice(0, 6);
      // keep the user's own additions, replace AI batch
      setKeywords((current) => [
        ...fresh.map((label, i) => ({ label, selected: i < 2, source: 'ai' })),
        ...current.filter((k) => k.source === 'yours'),
      ]);
    } catch (e) {
      setError(e.message || 'Could not regenerate keywords.');
    } finally {
      setExpanding(false);
    }
  };

  /* -------- create + run -------- */
  const startSearch = async (refreshExisting = false) => {
    if (!signedIn) {
      // fall back to the normal flow if not signed in
      window.location.assign(`/search?type=${kind}&q=${encodeURIComponent(subject)}`);
      return;
    }
    // The subject is always the main keyword; extra keywords are optional.
    const selected = [subject, ...keywords.filter((k) => k.selected).map((k) => k.label)];

    setSubmitting(true);
    setError(null);

    try {
      const created = await createSavedSearch({
        type: kind,
        phrase: subject,
        name: subject,
        keywords: selected,
        frequency: 'weekly',
        refreshExisting,
      });
      trackSearch({ id: created.id, name: created.name, url: created.url });
      onCreated?.(created);

      // Straight to the results page, which shows its own live loading state.
      router.visit(created?.url ?? `/library/${created.id}`);
    } catch (e) {
      if (e.status === 409 && e.payload?.code === 'existing_search') {
        setDuplicateSearch({ search: e.payload.search, newKeywords: e.payload.new_keywords });
        setState('keywords');
        setSubmitting(false);
        return;
      }

      setError(e.message || 'Could not start the search.');
      setSubmitting(false);
    }
  };

  const checkAndConfirmSearch = async () => {
    if (!signedIn) {
      window.location.assign(`/search?type=${kind}&q=${encodeURIComponent(subject)}`);
      return;
    }

    // The subject is always the main keyword; extra keywords are optional.
    const selected = [subject, ...keywords.filter((k) => k.selected).map((k) => k.label)];

    setSubmitting(true);
    setError(null);
    try {
      const duplicate = await checkDuplicateSavedSearch({
        type: kind,
        phrase: subject,
        name: subject,
        keywords: selected,
        frequency: 'weekly',
      });
      if (duplicate.existing) {
        setDuplicateSearch({ search: duplicate.search, newKeywords: duplicate.new_keywords });
        setSubmitting(false);
        return;
      }
    } catch (e) {
      setError(e.message || 'Could not check your search history. Try again.');
      setSubmitting(false);
      return;
    }
    await startSearch(false);
  };

  /* -------- render -------- */

  const visibleSuggestions = subjectSuggestions.filter((suggestion) => suggestion.label?.trim());

  const applySuggestion = (label) => {
    setSubject(label);
    setShowSuggestions(false);
    setActiveSuggestion(-1);
    window.requestAnimationFrame(() => inputRef.current?.focus());
  };

  return (
    <>
      <style>{`
        .bif{background:var(--white);border:1px solid var(--line);border-radius:20px;padding:26px 28px;margin-bottom:44px}
        .bif__ey{display:flex;align-items:center;gap:10px;margin-bottom:18px;font-size:.72rem;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--amber-ink)}
        .bif__ey::before{content:'';width:22px;height:2px;background:var(--yellow)}
        .bif__bar{position:relative;display:flex;align-items:center;gap:14px;padding:9px 9px 9px 22px;background:var(--white);border:1.5px solid var(--line-2,#DEDBD3);border-radius:100px;transition:border-color .18s,box-shadow .18s,background .18s}
        .bif__entry{position:relative;display:flex;align-items:center;gap:14px;flex:1 1 auto;min-width:0;white-space:nowrap}
        .bif__field{position:relative;flex:1 1 auto;min-width:0}
        .bif__bar:hover{border-color:var(--faint-2,#9A968E)}
        .bif__bar:focus-within{border-color:var(--yellow);box-shadow:0 0 0 5px rgba(255,198,41,.22);background:#FFFDF6}
        .bif__bar svg.q{width:22px;height:22px;color:var(--faint-2,#9A968E);flex:none;transition:color .18s}
        .bif__bar:focus-within svg.q{color:var(--amber-ink)}
        .bif__bar input{flex:1 1 auto;min-width:0;width:100%;height:54px;line-height:54px;border:0;outline:0;background:transparent;font:inherit;font-size:1.14rem;font-weight:600;letter-spacing:-.02em;color:var(--ink);padding:0 4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .bif__bar input::placeholder{color:var(--faint-2,#9A968E);font-weight:500;letter-spacing:-.01em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .bif__suggest{position:absolute;top:calc(100% + 12px);left:-8px;right:-4px;z-index:20;overflow:hidden;border:1px solid #eadfca;border-radius:18px;background:rgba(255,255,255,.98);box-shadow:0 24px 48px -24px rgba(33,26,12,.3),0 8px 18px -12px rgba(33,26,12,.14);backdrop-filter:blur(10px)}
        .bif__suggest-head{display:flex;align-items:center;justify-content:space-between;padding:11px 14px 10px;background:linear-gradient(180deg,#fff8e3 0%,#fffdf7 100%);border-bottom:1px solid #f0e5cf;font-size:.68rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#9d6900}
        .bif__suggest-list{max-height:300px;overflow-y:auto;padding:6px}
        .bif__suggest-item{width:100%;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:11px 12px;border:0;border-radius:14px;background:transparent;text-align:left;cursor:pointer;transition:background .15s,transform .15s}
        .bif__suggest-item:hover,.bif__suggest-item.is-active{background:#fff7df}
        .bif__suggest-item.is-active{transform:translateX(2px)}
        .bif__suggest-copy{display:flex;min-width:0;flex-direction:column;gap:3px}
        .bif__suggest-copy strong{font-size:.92rem;font-weight:700;letter-spacing:-.02em;color:var(--ink)}
        .bif__suggest-copy em{font-style:normal;font-size:.74rem;font-weight:600;color:var(--faint-2,#9A968E)}
        .bif__cta{flex:none;display:inline-flex;align-items:center;gap:9px;height:54px;padding:0 26px;border-radius:100px;font-size:.96rem;font-weight:800;letter-spacing:-.015em;color:#1A1400;background:var(--yellow);border:0;cursor:pointer;box-shadow:0 1px 0 rgba(0,0,0,.04),0 4px 12px -6px rgba(255,198,41,.5);transition:background .18s,box-shadow .18s,transform .18s}
        .bif__cta svg{width:16px;height:16px;flex:none}
        .bif__cta:hover:not(:disabled){background:var(--yellow-hot,#FFD84D);box-shadow:0 1px 0 rgba(0,0,0,.05),0 6px 18px -6px rgba(255,198,41,.75);transform:translateY(-1px)}
        .bif__cta:active:not(:disabled){transform:translateY(0)}
        .bif__cta:disabled{opacity:.55;cursor:not-allowed;box-shadow:none}
        .bif__hint{margin-top:14px;padding-left:6px;font-size:.85rem;color:var(--faint-2,#9A968E);line-height:1.5}
        .bif__hint b{color:var(--muted);font-weight:700}
        .bif--bare{background:none;border:0;padding:0;margin-bottom:34px}
        .bif__mode{flex:none;display:inline-flex;align-items:center;height:42px;padding:0 17px;margin-left:-13px;border-radius:100px;background:var(--yellow);color:#1A1400;font-size:.84rem;font-weight:800;letter-spacing:-.01em;box-shadow:0 2px 8px -2px rgba(255,198,41,.9)}
        .bif__ghost{position:absolute;left:4px;top:50%;transform:translateY(-50%);display:flex;align-items:center;max-width:100%;overflow:hidden;white-space:nowrap;pointer-events:none;font-size:1.14rem;font-weight:500;letter-spacing:-.01em;color:var(--faint-2,#9A968E)}
        .bif__ghost b{font-weight:600;color:var(--body,#34332F)}
        .bif__caret{width:1.5px;height:22px;margin-left:2px;flex:none;background:var(--ink);animation:bifBlink 1s steps(1) infinite}
        @keyframes bifBlink{50%{opacity:0}}
        @media (prefers-reduced-motion:reduce){.bif__caret{animation:none}}
        .bif__picks{display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin-top:12px;padding:0 10px}
        .bif__picks-l{font-size:.8rem;font-weight:700;color:var(--faint-2,#9A968E);margin-right:2px}
        .bif__pick{display:inline-flex;align-items:center;gap:7px;height:30px;padding:0 12px;border:1px solid var(--line);border-radius:100px;background:var(--white);font-size:.83rem;font-weight:600;color:var(--muted);cursor:pointer;transition:border-color .16s,background .16s,color .16s}
        .bif__pick i{width:5px;height:5px;border-radius:50%;background:var(--yellow);flex:none}
        .bif__pick:hover{border-color:var(--yellow);background:var(--wash,#FFF8E6);color:var(--ink)}
        @media (max-width:640px){
          .bif{padding:20px}
          .bif--bare{padding:0}
          .bif__mode{margin-left:0}
          .bif__ghost{font-size:1.02rem;left:6px}
          .bif__picks{padding:0 2px}
          .bif__bar{flex-wrap:wrap;padding:12px;border-radius:20px;gap:10px}
          .bif__entry{width:100%;gap:10px}
          .bif__bar input{width:100%;height:44px;font-size:1.02rem;padding:0 6px}
          .bif__cta{width:100%;justify-content:center;height:48px}
          .bif__suggest{left:-2px;right:-2px;top:calc(100% + 8px);border-radius:16px}
          .bif__suggest-head{padding:10px 12px 9px;font-size:.62rem}
          .bif__suggest-item{padding:10px}
          .bif__suggest-copy strong{font-size:.86rem}
        }
        .bif:has(.kx){background:var(--white);border:1px solid var(--line);border-radius:22px;padding:28px 30px}
        /* list-page search card (Brand / Product searches) */
        .bif--list{padding:20px 22px 18px;border-radius:22px;margin-bottom:40px;box-shadow:0 1px 2px rgba(20,15,0,.03)}
        .bif--list .bif__bar{padding:8px;gap:12px;border:1px solid #E4E1DA;background:#fff;box-shadow:0 0 0 4px #FAF9F6,0 1px 2px rgba(20,15,0,.04)}
        .bif--list .bif__bar:hover{border-color:#D6D2C9}
        .bif--list .bif__bar:focus-within{border-color:var(--yellow);box-shadow:0 0 0 4px rgba(255,198,41,.22);background:#fff}
        .bif--list .bif__mode{margin-left:0;gap:8px;height:44px;padding:0 18px;font-size:.86rem;box-shadow:0 4px 12px -4px rgba(255,198,41,.8)}
        .bif--list .bif__mode svg{width:15px;height:15px;flex:none}
        .bif--list .bif__entry{gap:12px;padding-left:4px}
        .bif--list .bif__bar svg.q{width:18px;height:18px}
        .bif--list .bif__bar input{height:44px;line-height:44px;font-size:1.02rem;font-weight:500}
        .bif--list .bif__ghost{font-size:1.02rem}
        .bif--list .bif__ghost b{font-weight:500;color:var(--faint-2,#9A968E)}
        .bif--list .bif__caret{height:20px;margin-left:1px}
        .bif--list .bif__cta{height:48px;padding:0 24px;font-size:.92rem;box-shadow:0 6px 18px -6px rgba(255,198,41,.9)}
        .bif--list .bif__cta:disabled{opacity:1;cursor:default;box-shadow:0 6px 18px -6px rgba(255,198,41,.9)}
        .bif--list .bif__picks{margin-top:16px;padding:16px 0 0;border-top:1px solid var(--line);gap:8px}
        .bif--list .bif__picks-l{font-size:.8rem;font-weight:700;color:var(--muted);margin-right:4px}
        .bif--list .bif__pick{height:32px;padding:0 14px;font-size:.83rem;color:var(--body,#34332F)}
        @media (max-width:640px){
          .bif--list{padding:16px}
          .bif--list .bif__bar{box-shadow:none;padding:10px;border-radius:18px}
          .bif--list .bif__mode{height:40px}
          .bif--list .bif__entry{padding:0 12px;border:1px solid var(--line);border-radius:14px;background:var(--paper,#FAF9F6)}
          .bif--list .bif__bar input,.bif__bar input{height:52px;line-height:52px;font-size:16px;font-weight:600}
          .bif--list .bif__ghost,.bif__ghost{font-size:16px}
          .bif--list .bif__cta{height:52px;font-size:1rem}
          .kx__add input{font-size:16px}
        }
        .kx{animation:kxIn .28s cubic-bezier(.22,.61,.36,1)}
        @keyframes kxIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
        .kx__top{display:flex;align-items:center;justify-content:space-between;gap:16px}
        .kx__subject{display:flex;align-items:center;gap:12px;min-width:0}
        .kx__mono{width:40px;height:40px;flex:none;border-radius:12px;background:var(--wash,#FFF8E6);color:var(--amber-ink);display:grid;place-items:center;font-weight:800;font-size:.82rem}
        .kx__name{display:flex;align-items:center;gap:8px;min-width:0}
        .kx__name span{font-size:1.25rem;font-weight:800;color:var(--ink);letter-spacing:-.01em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .kx__name button{flex:none;border:0;background:none;padding:0;cursor:pointer;font-size:.78rem;font-weight:600;color:var(--muted);text-decoration:underline;text-underline-offset:3px}
        .kx__name button:hover{color:var(--ink)}
        .kx__subject small{display:block;font-size:.8rem;color:var(--muted)}
        .kx__x{width:36px;height:36px;flex:none;border-radius:50%;border:1px solid var(--line);background:var(--white);display:grid;place-items:center;color:var(--muted);cursor:pointer}
        .kx__x:hover{border-color:var(--ink);color:var(--ink)}
        .kx__box{margin-top:22px;padding-top:22px;border-top:1px solid var(--line)}
        .kx__row{display:flex;justify-content:space-between;align-items:baseline;gap:16px;flex-wrap:wrap}
        .bif .kx__row h3{font-size:.94rem;font-weight:700;color:var(--ink);letter-spacing:0}
        .kx__link{display:inline-flex;align-items:center;gap:6px;border:0;background:none;padding:0;cursor:pointer;font-size:.8rem;font-weight:600;color:var(--muted)}
        .kx__link:hover:not(:disabled){color:var(--ink)}
        .kx__link:disabled{opacity:.6;cursor:default}
        .kx__chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}
        .kx__chip{display:inline-flex;align-items:center;gap:8px;height:36px;padding:0 14px 0 10px;border:1px solid var(--line-2,#D9D6CF);border-radius:999px;background:var(--white);font-size:.84rem;font-weight:600;color:var(--muted);cursor:pointer;transition:background .15s,border-color .15s,color .15s}
        .kx__chip:hover:not(.is-lock){border-color:#BDBAB2}
        .kx__ck{width:18px;height:18px;flex:none;border-radius:50%;border:1.5px solid var(--line-2,#D9D6CF);display:grid;place-items:center;transition:.15s}
        .kx__ck svg{width:10px;height:10px;opacity:0;color:#0B0B0B}
        .kx__chip.is-on{background:var(--wash,#FFF8E6);border-color:var(--yellow);color:var(--ink)}
        .kx__chip.is-on .kx__ck{background:var(--yellow);border-color:var(--yellow)}
        .kx__chip.is-on .kx__ck svg{opacity:1}
        .kx__chip.is-lock{cursor:default}
        .kx__chip em{font-style:normal;font-size:.68rem;font-weight:700;color:var(--amber-ink)}
        .kx__chip--sk{padding:0;border-color:var(--line);background:linear-gradient(90deg,#f1efe9 25%,#faf9f6 50%,#f1efe9 75%);background-size:200% 100%;animation:kxShim 1.2s linear infinite;cursor:default}
        @keyframes kxShim{to{background-position:-200% 0}}
        .kx__add{display:inline-flex;align-items:center;height:36px;padding:0 4px 0 14px;border:1px dashed var(--line-2,#D9D6CF);border-radius:999px}
        .kx__add:focus-within{border-style:solid;border-color:var(--ink)}
        .kx__add input{width:140px;border:0;outline:0;background:none;font:inherit;font-size:.84rem;color:var(--ink)}
        .kx__add button{width:28px;height:28px;flex:none;border:0;border-radius:50%;background:var(--ink);color:#fff;display:grid;place-items:center;cursor:pointer}
        .kx__foot{display:flex;justify-content:flex-end;gap:10px;margin-top:26px;padding-top:20px;border-top:1px solid var(--line)}
        .kx__btn{display:inline-flex;align-items:center;gap:8px;height:44px;padding:0 22px;border-radius:999px;font:inherit;font-size:.9rem;font-weight:700;cursor:pointer;transition:background .15s,border-color .15s}
        .kx__btn svg{width:16px;height:16px}
        .kx__btn--g{border:1px solid var(--line-2,#D9D6CF);background:var(--white);color:var(--ink)}
        .kx__btn--g:hover:not(:disabled){border-color:#BDBAB2}
        .kx__btn--y{border:0;background:var(--yellow);color:var(--ink)}
        .kx__btn--y:hover:not(:disabled){background:var(--yellow-hot,#FFD84D)}
        .kx__btn:disabled{opacity:.6;cursor:not-allowed}
        @media (max-width:640px){
          .bif:has(.kx){padding:20px 18px}
          .kx__name span{font-size:1.08rem}
          .kx__add{flex:1 1 100%}
          .kx__add input{flex:1;width:auto}
          .kx__foot{justify-content:stretch}
          .kx__btn{flex:1;justify-content:center}
        }
        @media (prefers-reduced-motion:reduce){.kx,.kx__chip--sk{animation:none}}
        .flowbar{display:flex;align-items:center;gap:14px;flex-wrap:wrap}
        .flowbar__head{display:flex;align-items:center;gap:14px;width:100%}
        .subject{display:inline-flex;align-items:center;gap:9px;height:40px;padding:0 8px 0 14px;border:1px solid var(--line-2,#DEDBD3);border-radius:100px;background:var(--paper,#FAF9F6)}
        .subject b{font-size:.96rem;font-weight:800;color:var(--ink);letter-spacing:-.01em}
        .subject .edit{width:26px;height:26px;border-radius:50%;display:grid;place-items:center;color:var(--faint,#7C7972);border:0;background:transparent;cursor:pointer;transition:.15s}
        .subject .edit:hover{background:#fff;color:var(--ink)} .subject .edit svg{width:14px;height:14px}
        .mini{display:flex;align-items:center;gap:6px}
        .mst{display:flex;align-items:center;gap:7px}
        .mst__n{width:22px;height:22px;border-radius:50%;display:grid;place-items:center;font-size:.72rem;font-weight:800;flex:none}
        .mst__n svg{width:11px;height:11px}
        .mst.todo .mst__n{background:#fff;border:1.5px solid var(--line-2,#DEDBD3);color:var(--faint-2,#9A968E)}
        .mst.now .mst__n{background:var(--yellow);color:#1A1400}
        .mst.done .mst__n{background:var(--ink);color:#fff}
        .mst__l{font-size:.8rem;font-weight:700;color:var(--faint-2,#9A968E)}
        .mst.now .mst__l{color:var(--ink)}
        .mst__line{width:22px;height:1.5px;background:var(--line-2,#DEDBD3);margin:0 4px}
        .flowbar .cancel{margin-left:auto;width:38px;height:38px;border-radius:50%;display:grid;place-items:center;color:var(--faint,#7C7972);border:1px solid var(--line);background:transparent;cursor:pointer}
        .flowbar .cancel:hover{color:var(--ink);border-color:var(--line-2,#DEDBD3);background:var(--paper,#FAF9F6)} .flowbar .cancel svg{width:16px;height:16px}
        .divide{height:1px;background:var(--line);margin:20px 0}
        .ph{margin-bottom:14px}
        .ph__k{font-size:.7rem;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--amber-ink);margin-bottom:6px}
        .ph h3{font-size:.96rem;font-weight:800;color:var(--ink);letter-spacing:-.028em}
        .ph p.sub{font-size:.85rem;color:var(--faint-2,#9A968E);margin-top:5px}
        .ph__row{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}
        .chips{display:flex;flex-wrap:wrap;gap:8px}
        .kw{display:inline-flex;align-items:center;gap:8px;height:38px;padding:0 14px;border-radius:100px;background:var(--white);border:1px solid var(--line-2,#DEDBD3);font-size:.86rem;font-weight:600;color:var(--body);cursor:pointer;transition:.15s}
        .kw:hover{border-color:var(--faint-2,#9A968E)}
        .kw__c{width:16px;height:16px;border-radius:50%;border:1.5px solid var(--line-2,#DEDBD3);display:grid;place-items:center;color:transparent;transition:.15s}
        .kw__c svg{width:10px;height:10px}
        .kw.on{background:var(--wash);border-color:var(--yellow);color:#5C4200}
        .kw.on .kw__c{background:var(--yellow);border-color:var(--yellow);color:#1A1400}
        .kw__tag{font-size:.64rem;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:var(--amber-ink);background:#fff;border-radius:5px;padding:2px 5px}
        .kw--add{border-style:dashed;color:var(--amber-ink);font-weight:700;background:transparent;display:inline-flex;align-items:center;gap:8px;height:38px;padding:0 14px;border-radius:100px;border:1px dashed var(--line-2,#DEDBD3);cursor:pointer;font-size:.86rem}
        .kw--add svg{width:14px;height:14px}
        .kw--input{display:inline-flex;align-items:center;height:38px;padding:0 6px 0 14px;border-radius:100px;border:1.5px solid var(--yellow);background:var(--white);gap:6px}
        .kw--input input{border:0;outline:0;background:transparent;font:inherit;font-size:.86rem;font-weight:600;color:var(--ink);min-width:120px}
        .kw--input button{width:26px;height:26px;border-radius:50%;border:0;background:var(--yellow);color:#1A1400;display:grid;place-items:center;cursor:pointer}
        .kw--input button svg{width:12px;height:12px}
        .khint{font-size:.8rem;color:var(--faint-2,#9A968E);margin-top:12px}
        .khint b{color:var(--ink)}
        .schead{font-size:.9rem;font-weight:700;color:var(--ink);margin-top:22px}
        .freq{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:16px}
        .fq{text-align:left;padding:14px 16px;border:1px solid var(--line-2,#DEDBD3);border-radius:16px;background:var(--white);cursor:pointer;transition:.15s}
        .fq:hover{border-color:var(--faint-2,#9A968E)}
        .fq__t{display:flex;align-items:center;gap:9px;font-size:.9rem;font-weight:700;color:var(--ink)}
        .fq__r{width:17px;height:17px;border-radius:50%;border:2px solid var(--line-2,#DEDBD3);flex:none;transition:.15s}
        .fq p{font-size:.79rem;color:var(--faint-2,#9A968E);margin-top:6px}
        .fq.on{border-color:var(--yellow);background:var(--wash)}
        .fq.on .fq__r{border-color:var(--yellow);box-shadow:inset 0 0 0 3.5px var(--yellow)}
        .srcs{display:flex;flex-direction:column;gap:10px}
        .src{border:1px solid var(--line-2,#DEDBD3);border-radius:16px;padding:15px 16px;background:var(--white)}
        .src__h{display:flex;align-items:center;gap:10px;margin-bottom:11px}
        .src__i{width:30px;height:30px;border-radius:8px;background:var(--paper,#FAF9F6);display:grid;place-items:center;color:var(--muted);flex:none}
        .src__i svg{width:15px;height:15px}
        .src__t{font-size:.88rem;font-weight:700;color:var(--ink)}
        .src__f{display:flex;align-items:center;gap:2px;height:44px;padding:0 14px;border:1px solid var(--line-2,#DEDBD3);border-radius:100px;background:var(--white);transition:.16s}
        .src__f:focus-within{border-color:var(--yellow);box-shadow:0 0 0 4px rgba(255,198,41,.22)}
        .src__pre{font-size:.92rem;font-weight:600;color:var(--faint-2,#9A968E)}
        .src__f input{flex:1;border:0;outline:0;background:transparent;font:inherit;font-size:.92rem;font-weight:600;color:var(--ink)}
        .src__m{font-size:.78rem;color:var(--muted);margin-top:9px;padding-left:2px}
        .src__m.faint{color:var(--faint-2,#9A968E)}
        .biffoot{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:20px}
        .biffoot__r{display:flex;gap:10px;flex-wrap:wrap}
        .run{text-align:center;padding:8px 0 4px}
        .run__ring{width:46px;height:46px;margin:0 auto 14px;border-radius:50%;border:3px solid var(--wash);border-top-color:var(--yellow);animation:bif-spin 1s linear infinite}
        @keyframes bif-spin{to{transform:rotate(360deg)}}
        .run h3{font-size:1.08rem;font-weight:800;color:var(--ink)}
        .run .sub{font-size:.86rem;color:var(--muted);margin-top:5px}
        .pbar{height:7px;border-radius:100px;background:var(--paper,#FAF9F6);overflow:hidden;margin:18px 0 16px}
        .pbar__f{height:100%;border-radius:100px;background:var(--yellow);transition:width .6s cubic-bezier(.22,.61,.36,1)}
        .stages{display:flex;flex-direction:column;gap:2px;text-align:left;max-width:400px;margin:0 auto}
        .stg{display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:11px;font-size:.88rem;font-weight:600;color:var(--faint-2,#9A968E);transition:.2s}
        .stg__i{width:20px;height:20px;border-radius:50%;border:1.5px solid var(--line-2,#DEDBD3);flex:none;display:grid;place-items:center;color:transparent} .stg__i svg{width:11px;height:11px}
        .stg.now{background:var(--wash);color:var(--ink)}
        .stg.now .stg__i{border-color:var(--yellow);border-top-color:transparent;animation:bif-spin 1s linear infinite}
        .stg.done{color:var(--muted)} .stg.done .stg__i{background:var(--ink);border-color:var(--ink);color:#fff}
        .run__note{display:flex;align-items:center;justify-content:center;gap:10px;margin-top:18px;font-size:.83rem;color:var(--faint-2,#9A968E)}
        .sw{width:36px;height:21px;border-radius:100px;background:var(--line-2,#DEDBD3);position:relative;transition:.18s;flex:none;cursor:pointer;border:0}
        .sw::after{content:'';position:absolute;top:2px;left:2px;width:17px;height:17px;border-radius:50%;background:#fff;transition:.18s}
        .sw.on{background:var(--yellow)} .sw.on::after{left:17px}
        .done{display:flex;align-items:center;gap:16px;flex-wrap:wrap}
        .done__c{width:44px;height:44px;border-radius:50%;background:var(--ok-bg);color:var(--ok);display:grid;place-items:center;flex:none}
        .done__c svg{width:22px;height:22px}
        .done h3{font-size:1.06rem;font-weight:800;color:var(--ink)}
        .done p{font-size:.85rem;color:var(--muted);margin-top:2px}
        .done__r{margin-left:auto;display:flex;gap:10px;flex-wrap:wrap}
        .bif__err{margin-top:12px;padding:10px 14px;border-radius:12px;background:#FBEDE6;color:#B0431B;font-size:.85rem;font-weight:600}
      `}</style>

      {upgradeModalOpen && (
        <UpgradePromptModal
          eyebrow="Keep your momentum"
          title="Ready to find your next breakout?"
          body={shouldOfferTrial
            ? 'Turn your first signal into a repeatable edge with Growth.'
            : 'Keep spotting breakout content before the trend moves on.'}
          visual="search-momentum"
          primaryLabel={shouldOfferTrial ? 'Start my 8-day trial' : 'Unlock more searches'}
          onPrimary={() => (shouldOfferTrial ? billingApi.trialCheckout('growth') : router.visit('/plans'))}
          onClose={() => setUpgradeModalOpen(false)}
        />
      )}

      <section className={`bif${typingWords && state === 'collapsed' ? ' bif--list' : ''}`} ref={rootRef}>
        {/* ---------- COLLAPSED ---------- */}
        {state === 'collapsed' && (
          <>
            {!typingWords && <p className="bif__ey">{eyebrow}</p>}
            <form
              className="bif__bar"
              ref={subjectFieldRef}
              onSubmit={(e) => { e.preventDefault(); startFlow(); }}
            >
              {modeLabel && (
                <span className="bif__mode">
                  {kind === 'brand' ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 9l1.5-5h15L21 9M3 9v10a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V9M3 9h18M9 20v-6h6v6" /></svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /></svg>
                  )}
                  {modeLabel}
                </span>
              )}
              <div className="bif__entry">
                <svg className="q" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
                <div className="bif__field">
                  <input
                    ref={inputRef}
                    type="text"
                    autoComplete="off"
                    value={subject}
                    onChange={(e) => {
                      setSubject(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => { setInputFocused(true); setShowSuggestions(true); }}
                    onBlur={() => setInputFocused(false)}
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
                    placeholder={typingWords ? (inputFocused ? `Search a ${kind}` : '') : placeholder}
                    aria-label={eyebrow}
                    aria-expanded={showSuggestions && visibleSuggestions.length > 0}
                    aria-haspopup="listbox"
                  />

                  {typingWords && !subject && !inputFocused && (
                    <span className="bif__ghost" aria-hidden="true">
                      <b>{typedWord}</b><i className="bif__caret" />
                    </span>
                  )}

                  {showSuggestions && visibleSuggestions.length > 0 && (
                    <div className="bif__suggest" role="listbox" aria-label={`${kind} suggestions`}>
                      <div className="bif__suggest-head">
                        <span>Suggested {kind === 'brand' ? 'brands' : 'products'}</span>
                        <span>{visibleSuggestions.length}</span>
                      </div>
                      <div className="bif__suggest-list">
                        {visibleSuggestions.map((suggestion, index) => (
                          <button
                            key={`${suggestion.type}-${suggestion.id}`}
                            type="button"
                            className={`bif__suggest-item${index === activeSuggestion ? ' is-active' : ''}`}
                            onMouseEnter={() => setActiveSuggestion(index)}
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => applySuggestion(suggestion.label)}
                          >
                            <span className="bif__suggest-copy">
                              <strong>{suggestion.label}</strong>
                              {suggestion.sector && <em>{suggestion.sector}</em>}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <button type="submit" className="bif__cta" disabled={!subject.trim()}>
                <Search className="h-4 w-4" /> Find breakouts
              </button>
            </form>
            {Array.isArray(quickPicks) ? (
              quickPicks.length > 0 && (
                <div className="bif__picks">
                  <span className="bif__picks-l">Suggested to track</span>
                  {quickPicks.map((name) => (
                    <button key={name} type="button" className="bif__pick" onClick={() => applySuggestion(name)}>
                      <i />{name}
                    </button>
                  ))}
                </div>
              )
            ) : (
            <p className="bif__hint">
              {hint} Try <b>"{sample}"</b>
              {searchLimit > 0 && (
                <> · {searchLeft} of {searchLimit} searches left this cycle</>
              )}
            </p>
            )}
          </>
        )}

        {/* ---------- KEYWORDS (expand) ---------- */}
        {state !== 'collapsed' && (
          <div className="kx">
            <div className="kx__top">
              <div className="kx__subject">
                <span className="kx__mono">{subject.replace(/[^a-z0-9]/gi, '').slice(0, 2).toUpperCase() || '?'}</span>
                <div style={{ minWidth: 0 }}>
                  <div className="kx__name">
                    <span>{subject}</span>
                    <button
                      type="button"
                      onClick={() => { collapse(); window.setTimeout(() => inputRef.current?.focus(), 0); }}
                      disabled={submitting}
                    >
                      Change
                    </button>
                  </div>
                  <small>{kind === 'product' ? 'Product search' : 'Brand search'}</small>
                </div>
              </div>
              <button type="button" className="kx__x" aria-label="Cancel search" onClick={collapse} disabled={submitting}>
                <Close className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="kx__box">
              <div className="kx__row">
                <h3>Add keywords to find more videos</h3>
                <button type="button" className="kx__link" onClick={regenerate} disabled={expanding || submitting}>
                  <Refresh className="h-3.5 w-3.5" />
                  {expanding ? 'Finding keywords…' : 'Suggest different keywords'}
                </button>
              </div>

              <div className="kx__chips">
                <span className="kx__chip is-on is-lock">
                  <span className="kx__ck"><Check /></span>
                  {subject} <em>Main</em>
                </span>
                {expanding && keywords.length === 0 && [0, 1, 2, 3].map((i) => (
                  <span key={i} className="kx__chip kx__chip--sk" style={{ width: 96 + i * 18 }} />
                ))}
                {keywords
                  .filter((k) => k.label.toLowerCase() !== subject.toLowerCase())
                  .map((k) => (
                    <button
                      key={k.label}
                      type="button"
                      className={`kx__chip${k.selected ? ' is-on' : ''}`}
                      aria-pressed={k.selected}
                      onClick={() => toggleKeyword(k.label)}
                      disabled={submitting}
                    >
                      <span className="kx__ck"><Check /></span>
                      {k.label}
                    </button>
                  ))}
                <form
                  className="kx__add"
                  onSubmit={(e) => { e.preventDefault(); addOwnKeyword(); }}
                >
                  <input
                    type="text"
                    value={addKeyword}
                    onChange={(e) => setAddKeyword(e.target.value)}
                    placeholder="Add a keyword"
                    aria-label="Add a keyword"
                  />
                  <button type="submit" aria-label="Add">
                    <Plus className="h-3 w-3" />
                  </button>
                </form>
              </div>

              {error && <div className="bif__err">{error}</div>}
            </div>

            <div className="kx__foot">
              <button type="button" className="kx__btn kx__btn--g" onClick={collapse} disabled={submitting}>Cancel</button>
              <button
                type="button"
                className="kx__btn kx__btn--y"
                onClick={checkAndConfirmSearch}
                disabled={submitting}
              >
                {submitting ? 'Starting search…' : 'Run search'} {!submitting && <Arrow />}
              </button>
            </div>
          </div>
        )}
      </section>
      {duplicateSearch && (
        <DuplicateSearchModal
          search={duplicateSearch.search}
          newKeywords={duplicateSearch.newKeywords}
          busy={submitting}
          onCancel={() => setDuplicateSearch(null)}
          onRefresh={() => {
            setDuplicateSearch(null);
            startSearch(true);
          }}
        />
      )}
    </>
  );
}
