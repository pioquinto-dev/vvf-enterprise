import { useEffect, useMemo, useRef, useState } from 'react';
import { router, usePage } from '@inertiajs/react';

import { Arrow, Check, Close, Search, Plus, Refresh } from '../../landing/components/Icons.jsx';
import {
  createSavedSearch,
  expandKeywords,
  fetchNotifications,
  trackSearch,
} from '../../landing/flow/api.js';

/**
 * The brand/product page's expand-in-place search flow (matches the
 * "Brand Beacon — Inline search flow" mockup).
 *
 * States: collapsed → keywords → sources → running → done. The card sits at
 * the top of the page and expands in-place — the page context beneath it
 * (moving-this-week, suggested-to-track, all-searches) never unmounts.
 *
 * The dashboard's SearchWizard flow is untouched — this is a separate,
 * lighter surface for the brand/product hubs.
 */

const STEPS = [
  { key: 'keywords', label: 'Keywords' },
  { key: 'sources',  label: 'Sources'  },
];

const STAGE_LIST = [
  { key: 'start',   label: 'Starting the scrape' },
  { key: 'pull',    label: 'Pulling videos from TikTok' },
  { key: 'filter',  label: 'Filtering against your keywords' },
  { key: 'rank',    label: 'Ranking by outlier score' },
];

/* animate the stages while a run is in flight — the API's status text is
 * coarse (pending → running → scraping → done), so a paced fake tick keeps
 * the visible progress moving. It stops at the last stage and only marks
 * everything done when the real notification says the run finished. */
function useRunStages(active, done) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!active) { setIdx(0); return undefined; }
    if (done) { setIdx(STAGE_LIST.length); return undefined; }

    const timer = window.setInterval(() => {
      setIdx((i) => (i < STAGE_LIST.length - 1 ? i + 1 : i));
    }, 1200);
    return () => window.clearInterval(timer);
  }, [active, done]);

  return idx;
}

function MiniStepper({ current }) {
  const activeIdx = STEPS.findIndex((s) => s.key === current);
  const shown = current === 'sources' || current === 'keywords';
  if (!shown) return null;

  return (
    <div className="mini">
      {[{ key: 'subject', label: 'Subject' }, ...STEPS].map((s, i, arr) => {
        const stateIdx = i === 0 ? 0 : STEPS.findIndex((x) => x.key === s.key) + 1;
        const cur = activeIdx + 1;
        const cls = stateIdx < cur ? 'done' : stateIdx === cur ? 'now' : 'todo';
        return (
          <span key={s.key} className="mst-wrap" style={{ display: 'inline-flex', alignItems: 'center' }}>
            <span className={`mst ${cls}`}>
              <span className="mst__n">{cls === 'done' ? <Check /> : i + 1}</span>
              <span className="mst__l">{s.label}</span>
            </span>
            {i < arr.length - 1 && <span className="mst__line" />}
          </span>
        );
      })}
    </div>
  );
}

export default function BrandInlineFlow({
  kind = 'brand',
  placeholder = 'Which brand do you want to research?',
  sample = 'rhode skin',
  eyebrow = 'Start a brand search',
  hint = 'One brand per search — we widen it with keywords next.',
  onCreated = null,
}) {
  const { billing = {}, auth = {} } = usePage().props;
  const signedIn = auth.signedIn ?? Boolean(auth.user);

  const [state, setState] = useState('collapsed'); // collapsed|keywords|sources|running|done
  const [subject, setSubject] = useState('');
  const [keywords, setKeywords] = useState([]); // [{label, selected, source: 'ai'|'yours'}]
  const [frequency, setFrequency] = useState('weekly');
  const [tiktokHandle, setTiktokHandle] = useState('');
  const [website, setWebsite] = useState('');
  const [emailWhenReady, setEmailWhenReady] = useState(true);
  const [addKeyword, setAddKeyword] = useState('');
  const [expanding, setExpanding] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [searchResult, setSearchResult] = useState(null); // {id, name, url, status, initial_count, top_score}
  const [runDone, setRunDone] = useState(false);
  const runIdxRef = useRef(0);
  const runIdx = useRunStages(state === 'running', runDone);
  runIdxRef.current = runIdx;

  const inputRef = useRef(null);
  const kwCount = useMemo(() => keywords.filter((k) => k.selected).length, [keywords]);
  const searchLeft = billing.searchCreditsRemaining;
  const searchLimit = billing.searchCreditsLimit;

  /* -------- collapsed -> keywords: fetch suggested terms -------- */
  const startFlow = async () => {
    const q = subject.trim().replace(/\s+/g, ' ');
    if (!q) return;

    setSubject(q);
    setError(null);
    setState('keywords');
    setExpanding(true);

    try {
      const payload = await expandKeywords(q);
      const seed = [
        ...(payload?.keywords ?? []).slice(0, 6).map((label) => ({ label, selected: true, source: 'ai' })),
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
    setState('collapsed');
    setKeywords([]);
    setSearchResult(null);
    setRunDone(false);
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
      const payload = await expandKeywords(subject, { fresh: true });
      const fresh = (payload?.keywords ?? []).slice(0, 6);
      // keep the user's own additions, replace AI batch
      setKeywords((current) => [
        ...fresh.map((label) => ({ label, selected: true, source: 'ai' })),
        ...current.filter((k) => k.source === 'yours'),
      ]);
    } catch (e) {
      setError(e.message || 'Could not regenerate keywords.');
    } finally {
      setExpanding(false);
    }
  };

  /* -------- create + run -------- */
  const runSearch = async () => {
    if (!signedIn) {
      // fall back to the normal flow if not signed in
      window.location.assign(`/search?type=${kind}&q=${encodeURIComponent(subject)}`);
      return;
    }
    const selected = keywords.filter((k) => k.selected).map((k) => k.label);
    if (selected.length === 0) {
      setError('Pick at least one keyword.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setState('running');
    setRunDone(false);

    try {
      const created = await createSavedSearch({
        type: kind,
        phrase: subject,
        name: subject,
        keywords: selected,
        frequency,
        sources: {
          tiktokHandle: tiktokHandle.trim().replace(/^@/, ''),
          website: website.trim(),
        },
      });
      trackSearch({ id: created.id, name: created.name, url: created.url });
      setSearchResult(created);
      onCreated?.(created);
    } catch (e) {
      setError(e.message || 'Could not start the search.');
      setState('sources');
      setSubmitting(false);
    }
  };

  /* poll for completion once a run is queued */
  useEffect(() => {
    if (state !== 'running' || !searchResult?.id) return undefined;

    let cancelled = false;
    let timer;

    const tick = async () => {
      if (cancelled) return;
      try {
        const payload = await fetchNotifications([searchResult.id]);
        const s = payload?.searches?.[0];
        if (!cancelled && s && (s.status === 'done' || s.status === 'complete')) {
          setSearchResult((current) => ({ ...current, ...s }));
          setRunDone(true);
          setSubmitting(false);
          window.setTimeout(() => !cancelled && setState('done'), 800);
          return;
        }
        if (!cancelled && s?.status === 'failed') {
          setError('The search failed to complete.');
          setSubmitting(false);
          setState('sources');
          return;
        }
      } catch {
        /* transient — next tick will retry */
      }
      timer = window.setTimeout(tick, 4000);
    };

    tick();
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [state, searchResult?.id]);

  const viewResults = () => {
    if (searchResult?.url) router.visit(searchResult.url);
  };

  /* -------- render -------- */

  const showFlowBar = state !== 'collapsed';
  const pFillWidth = state === 'running'
    ? `${8 + (runIdx / STAGE_LIST.length) * 88}%`
    : runDone ? '100%' : '8%';

  return (
    <>
      <style>{`
        .bif{background:var(--white);border:1px solid var(--line);border-radius:20px;padding:26px 28px;margin-bottom:44px}
        .bif__ey{display:flex;align-items:center;gap:10px;margin-bottom:18px;font-size:.72rem;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--amber-ink)}
        .bif__ey::before{content:'';width:22px;height:2px;background:var(--yellow)}
        .bif__bar{display:flex;align-items:center;gap:14px;padding:9px 9px 9px 22px;background:var(--white);border:1.5px solid var(--line-2,#DEDBD3);border-radius:100px;transition:border-color .18s,box-shadow .18s,background .18s}
        .bif__entry{display:flex;align-items:center;gap:14px;flex:1 1 auto;min-width:0;white-space:nowrap}
        .bif__bar:hover{border-color:var(--faint-2,#9A968E)}
        .bif__bar:focus-within{border-color:var(--yellow);box-shadow:0 0 0 5px rgba(255,198,41,.22);background:#FFFDF6}
        .bif__bar svg.q{width:22px;height:22px;color:var(--faint-2,#9A968E);flex:none;transition:color .18s}
        .bif__bar:focus-within svg.q{color:var(--amber-ink)}
        .bif__bar input{flex:1 1 auto;min-width:0;width:100%;height:54px;line-height:54px;border:0;outline:0;background:transparent;font:inherit;font-size:1.14rem;font-weight:600;letter-spacing:-.02em;color:var(--ink);padding:0 4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .bif__bar input::placeholder{color:var(--faint-2,#9A968E);font-weight:500;letter-spacing:-.01em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .bif__cta{flex:none;display:inline-flex;align-items:center;gap:9px;height:54px;padding:0 26px;border-radius:100px;font-size:.96rem;font-weight:800;letter-spacing:-.015em;color:#1A1400;background:var(--yellow);border:0;cursor:pointer;box-shadow:0 1px 0 rgba(0,0,0,.04),0 4px 12px -6px rgba(255,198,41,.5);transition:background .18s,box-shadow .18s,transform .18s}
        .bif__cta svg{width:16px;height:16px;flex:none}
        .bif__cta:hover:not(:disabled){background:var(--yellow-hot,#FFD84D);box-shadow:0 1px 0 rgba(0,0,0,.05),0 6px 18px -6px rgba(255,198,41,.75);transform:translateY(-1px)}
        .bif__cta:active:not(:disabled){transform:translateY(0)}
        .bif__cta:disabled{opacity:.55;cursor:not-allowed;box-shadow:none}
        .bif__hint{margin-top:14px;padding-left:6px;font-size:.85rem;color:var(--faint-2,#9A968E);line-height:1.5}
        .bif__hint b{color:var(--muted);font-weight:700}
        @media (max-width:640px){
          .bif{padding:20px}
          .bif__bar{flex-wrap:wrap;padding:12px;border-radius:20px;gap:10px}
          .bif__entry{width:100%;gap:10px}
          .bif__bar input{width:100%;height:44px;font-size:1.02rem;padding:0 6px}
          .bif__cta{width:100%;justify-content:center;height:48px}
        }
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

      <section className="bif">
        {/* ---------- COLLAPSED ---------- */}
        {state === 'collapsed' && (
          <>
            <p className="bif__ey">{eyebrow}</p>
            <form
              className="bif__bar"
              onSubmit={(e) => { e.preventDefault(); startFlow(); }}
            >
              <div className="bif__entry">
                <svg className="q" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  autoComplete="off"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={placeholder}
                  aria-label={eyebrow}
                />
              </div>
              <button type="submit" className="bif__cta" disabled={!subject.trim()}>
                <Search className="h-4 w-4" /> Find outliers
              </button>
            </form>
            <p className="bif__hint">
              {hint} Try <b>"{sample}"</b>
              {searchLimit > 0 && (
                <> · {searchLeft} of {searchLimit} searches left this cycle</>
              )}
            </p>
          </>
        )}

        {/* ---------- EXPANDED (all non-collapsed states) ---------- */}
        {showFlowBar && (
          <>
            <div className="flowbar">
              <div className="flowbar__head">
                <span className="subject">
                  <b>{subject}</b>
                  <button
                    type="button"
                    className="edit"
                    title="Change subject"
                    onClick={() => { collapse(); setTimeout(() => inputRef.current?.focus(), 0); }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
                    </svg>
                  </button>
                </span>
                {state !== 'running' && state !== 'done' && (
                  <button className="cancel" title="Cancel" onClick={collapse}>
                    <Close className="h-4 w-4" />
                  </button>
                )}
              </div>
              <MiniStepper current={state} />
            </div>
            <div className="divide" />
          </>
        )}

        {/* ---------- KEYWORDS ---------- */}
        {state === 'keywords' && (
          <div>
            <div className="ph ph__row">
              <div>
                <p className="ph__k">Expand</p>
                <h3>Widen the pull</h3>
                <p className="sub">Terms people actually pair with {subject} on TikTok.</p>
              </div>
              <button type="button" className="btn btn--g btn--sm" onClick={regenerate} disabled={expanding}>
                <Refresh className="h-4 w-4" /> {expanding ? 'Loading…' : 'Regenerate'}
              </button>
            </div>

            <div className="chips">
              {keywords.map((k) => (
                <button
                  key={k.label}
                  type="button"
                  className={`kw${k.selected ? ' on' : ''}`}
                  onClick={() => toggleKeyword(k.label)}
                >
                  <span className="kw__c">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m5 13 4 4L19 7" />
                    </svg>
                  </span>
                  {k.label}
                  {k.source === 'yours' && <span className="kw__tag">yours</span>}
                </button>
              ))}

              <span className="kw--input">
                <input
                  type="text"
                  value={addKeyword}
                  onChange={(e) => setAddKeyword(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addOwnKeyword(); } }}
                  placeholder="Add your own"
                  aria-label="Add your own keyword"
                />
                <button type="button" onClick={addOwnKeyword} title="Add">
                  <Plus className="h-3 w-3" />
                </button>
              </span>
            </div>
            <p className="khint"><b>{kwCount}</b> selected · each keyword widens the same single search.</p>

            <p className="schead">How often should we re-run it?</p>
            <div className="freq">
              {[
                { key: 'weekly',  label: 'Weekly',  desc: 'Fresh viral videos every week. Best for fast-moving categories.' },
                { key: 'monthly', label: 'Monthly', desc: 'A lighter monthly pull for slower niches.' },
              ].map((f) => (
                <button
                  key={f.key}
                  type="button"
                  className={`fq${frequency === f.key ? ' on' : ''}`}
                  onClick={() => setFrequency(f.key)}
                >
                  <span className="fq__t"><span className="fq__r" />{f.label}</span>
                  <p>{f.desc}</p>
                </button>
              ))}
            </div>

            {error && <div className="bif__err">{error}</div>}

            <div className="biffoot">
              <button type="button" className="btn btn--g" onClick={collapse}>Cancel</button>
              <button
                type="button"
                className="btn btn--y"
                onClick={() => setState('sources')}
                disabled={kwCount === 0}
              >
                Continue <Arrow />
              </button>
            </div>
          </div>
        )}

        {/* ---------- SOURCES ---------- */}
        {state === 'sources' && (
          <div>
            <div className="ph">
              <p className="ph__k">Optional</p>
              <h3>Add the {kind === 'product' ? 'product' : 'brand'}'s handle or website</h3>
              <p className="sub">Helps us match videos more accurately and unlock better insights.</p>
            </div>

            <div className="srcs">
              <div className="src">
                <div className="src__h">
                  <span className="src__i">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                  </span>
                  <span className="src__t">TikTok handle</span>
                </div>
                <div className="src__f">
                  <span className="src__pre">@</span>
                  <input
                    value={tiktokHandle}
                    onChange={(e) => setTiktokHandle(e.target.value.replace(/^@/, ''))}
                    placeholder={sample.split(' ')[0]}
                  />
                </div>
                <p className="src__m faint">Optional</p>
              </div>

              <div className="src">
                <div className="src__h">
                  <span className="src__i">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l1.5-5h15L21 9M3 9v10a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V9M3 9h18M9 20v-6h6v6" />
                    </svg>
                  </span>
                  <span className="src__t">Website</span>
                </div>
                <div className="src__f">
                  <span className="src__pre">https://</span>
                  <input
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder={`${sample.split(' ')[0]}.com`}
                  />
                </div>
                <p className="src__m faint">Optional</p>
              </div>
            </div>

            {error && <div className="bif__err">{error}</div>}

            <div className="biffoot">
              <button type="button" className="btn btn--g" onClick={() => setState('keywords')}>Back</button>
              <div className="biffoot__r">
                <button type="button" className="btn btn--g" onClick={runSearch} disabled={submitting}>Skip</button>
                <button type="button" className="btn btn--y" onClick={runSearch} disabled={submitting}>
                  {submitting ? 'Starting…' : 'Run the search'} <Arrow />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ---------- RUNNING ---------- */}
        {state === 'running' && (
          <div className="run">
            <div className="run__ring" />
            <h3>Scanning TikTok for {subject}</h3>
            <p className="sub">Widening with {kwCount} keyword{kwCount === 1 ? '' : 's'} · {frequency} schedule</p>
            <div className="pbar"><div className="pbar__f" style={{ width: pFillWidth }} /></div>
            <div className="stages">
              {STAGE_LIST.map((s, i) => {
                const cls = runDone || i < runIdx ? 'done' : i === runIdx ? 'now' : '';
                return (
                  <div key={s.key} className={`stg ${cls}`.trim()}>
                    <span className="stg__i">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m5 13 4 4L19 7" />
                      </svg>
                    </span>
                    {s.label}
                  </div>
                );
              })}
            </div>
            <div className="run__note">
              Email me when it's ready
              <button
                type="button"
                className={`sw${emailWhenReady ? ' on' : ''}`}
                onClick={() => setEmailWhenReady((v) => !v)}
                aria-pressed={emailWhenReady}
                aria-label="Toggle email notification"
              />
            </div>
          </div>
        )}

        {/* ---------- DONE ---------- */}
        {state === 'done' && searchResult && (
          <div className="done">
            <span className="done__c">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="m5 13 4 4L19 7" />
              </svg>
            </span>
            <div>
              <h3>{searchResult.name || subject} is ready</h3>
              <p>
                {searchResult.outlier_count ?? 0} outlier{(searchResult.outlier_count ?? 0) === 1 ? '' : 's'} this week
                {searchResult.top_score ? ` · top score ${Math.round(searchResult.top_score)}×` : ''}
                {searchResult.result_count != null ? ` · ${searchResult.result_count} videos scanned` : ''}
              </p>
            </div>
            <div className="done__r">
              <button type="button" className="btn btn--g" onClick={collapse}>Start another</button>
              <button type="button" className="btn btn--y" onClick={viewResults}>
                View results <Arrow />
              </button>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
