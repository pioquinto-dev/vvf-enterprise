import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

import {
  billing as billingApi,
  fetchKeywordSuggestions,
  trackVideoAnalysis,
  videoAnalysis,
} from '../landing/flow/api.js';
import AnalysisModal from './VideoAnalysis/AnalysisModal.jsx';
import AppLayout from './components/AppLayout.jsx';
import MyFeed from './components/MyFeed.jsx';
import SearchFlashModals from './components/SearchFlashModals.jsx';
import {
  AnalysisUpgradeModal,
  UsageConfirmModal,
  handleAnalyzeAction,
  videoAnalysisRemaining,
} from './components/VideoAnalysisGate.jsx';

/**
 * "My Feed" — the signed-in landing page. The search card on top starts every
 * search: picking Brand or Product and typing a subject hands off to the
 * matching hub (/brands or /products) with the subject prefilled, which opens
 * that page's inline flow on the keyword step. Below it the feed is built from
 * the searches the user already owns.
 */

const Icons = {
  brand: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l1.5-5h15L21 9M3 9v10a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V9M3 9h18M9 20v-6h6v6" /></svg>,
  product: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.4" fill="currentColor" /></svg>,
  search: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>,
};

const TYPES = [
  { key: 'brand', label: 'Brand', icon: Icons.brand },
  { key: 'product', label: 'Product', icon: Icons.product },
];

/**
 * Brand / Product toggle. The indicator is a single sliding pill measured from
 * the active button, so it stays correct at any label width or font size.
 */
function TypeToggle({ value, onChange }) {
  const wrapRef = useRef(null);
  const [pill, setPill] = useState(null);

  useEffect(() => {
    const measure = () => {
      const active = wrapRef.current?.querySelector('[aria-pressed="true"]');
      if (!active) return;
      setPill({ width: active.offsetWidth, x: active.offsetLeft - 3 });
    };

    measure();
    window.addEventListener('resize', measure);

    return () => window.removeEventListener('resize', measure);
  }, [value]);

  return (
    <span className="bbs-seg" ref={wrapRef}>
      {pill && <span className="bbs-seg__ind" style={{ width: pill.width, transform: `translateX(${pill.x}px)` }} aria-hidden />}
      {TYPES.map((type) => (
        <button
          key={type.key}
          type="button"
          className={value === type.key ? 'on' : undefined}
          aria-pressed={value === type.key}
          onClick={() => onChange(type.key)}
        >
          {type.icon}{type.label}
        </button>
      ))}
    </span>
  );
}

function SearchCard({ suggestions }) {
  const [type, setType] = useState('brand');
  const [query, setQuery] = useState('');
  const [matches, setMatches] = useState([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const inputRef = useRef(null);
  const fieldRef = useRef(null);

  // The chip row follows the toggle, so it never offers a product while the
  // field is set to search brands.
  const chips = suggestions[type] ?? [];

  /*
   * Suggestions come from the same keyword index the brand/product hubs use, so
   * the feed offers exactly what those pages would. An empty query returns the
   * trending list, which is what makes the dropdown useful on first focus.
   */
  useEffect(() => {
    if (!open) return undefined;

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      fetchKeywordSuggestions(type, query.trim(), { signal: controller.signal })
        .then((payload) => {
          const rows = Array.isArray(payload?.suggestions) ? payload.suggestions : [];
          setMatches(rows.filter((row) => row.label?.trim()));
          setActive(-1);
        })
        .catch(() => {});
    }, 160);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [type, query, open]);

  // Clicking away closes the list; the field itself keeps it open so the
  // toggle and CTA stay usable while it is showing.
  useEffect(() => {
    if (!open) return undefined;

    const onDown = (e) => { if (!fieldRef.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDown);

    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  // Brand and product searches each own a hub with the inline flow; ?q= drops
  // the typed subject straight into it on the keyword step.
  const run = (phrase = query, kind = type) => {
    const subject = String(phrase).trim();
    if (!subject) {
      inputRef.current?.focus();
      return;
    }
    setOpen(false);
    router.visit(`${kind === 'product' ? '/products' : '/brands'}?q=${encodeURIComponent(subject)}`);
  };

  // Picking a suggestion runs it, the same as the chips below the field: the
  // hub's keyword step is still editable, so nothing is committed early.
  const choose = (row) => run(row.label, row.type === 'product' ? 'product' : 'brand');

  const onKeyDown = (event) => {
    if (event.key === 'Escape') {
      setOpen(false);
      setActive(-1);
      return;
    }

    if (event.key === 'Enter') {
      if (open && active >= 0 && matches[active]) {
        event.preventDefault();
        choose(matches[active]);
        return;
      }
      run();
      return;
    }

    if (!open || matches.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((cur) => (cur + 1) % matches.length);
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((cur) => (cur <= 0 ? matches.length - 1 : cur - 1));
    }
  };

  return (
    <section className="bbs-card">
      <div className="bbs-field" ref={fieldRef}>
        <TypeToggle value={type} onChange={setType} />
        {Icons.search}
        <input
          ref={inputRef}
          type="text"
          value={query}
          autoComplete="off"
          role="combobox"
          placeholder={type === 'product' ? 'lip oil' : 'rhode skin'}
          aria-label={type === 'product' ? 'Search a product' : 'Search a brand'}
          aria-expanded={open && matches.length > 0}
          aria-controls="bbs-suggest"
          aria-activedescendant={active >= 0 && matches[active] ? `bbs-opt-${matches[active].id}` : undefined}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />
        <button type="button" className="bbs-cta" onClick={() => run()}>
          {Icons.search}Find breakouts
        </button>

        {open && matches.length > 0 && (
          <div className="bbs-suggest" id="bbs-suggest" role="listbox" aria-label={type === 'product' ? 'Product suggestions' : 'Brand suggestions'}>
            <div className="bbs-suggest__h">
              <span>{query.trim() ? 'Matching' : 'Trending'} {type === 'product' ? 'products' : 'brands'}</span>
              <span>{matches.length}</span>
            </div>
            {matches.map((row, i) => (
              <button
                key={`${row.type}-${row.id}`}
                id={`bbs-opt-${row.id}`}
                type="button"
                role="option"
                aria-selected={i === active}
                className={`bbs-suggest__i${i === active ? ' on' : ''}`}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(row)}
              >
                <strong>{row.label}</strong>
                {row.sector && <em>{row.sector}</em>}
              </button>
            ))}
          </div>
        )}
      </div>

      {chips.length > 0 && (
        <div className="bbs-sugg">
          <span className="bbs-sugg__l">Suggested {type === 'product' ? 'products' : 'brands'} to track</span>
          {chips.map((chip) => (
            <button
              key={`${chip.type}-${chip.phrase}`}
              type="button"
              className={`bbs-kw${type === 'product' ? ' p' : ''}`}
              onClick={() => run(chip.phrase, type)}
            >
              <i />{chip.phrase}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

export default function Feed({ feed = {} }) {
  const { billing = {} } = usePage().props;
  const currentPath = typeof window === 'undefined'
    ? '/home'
    : `${window.location.pathname}${window.location.search}`;

  const [analysisVideo, setAnalysisVideo] = useState(null);
  const [analysisById, setAnalysisById] = useState({});
  const [confirmVideo, setConfirmVideo] = useState(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [starting, setStarting] = useState(false);
  // Analyses started here are not yet reflected in the shared billing prop, so
  // the confirm modal counts them itself.
  const [reserved, setReserved] = useState([]);

  const remainingNow = videoAnalysisRemaining(billing, reserved.length);
  const remainingAfterUse = remainingNow === -1 ? 'unlimited' : Math.max(0, remainingNow - 1);

  // The same gate the results page uses: no entitlement upgrades, an existing
  // analysis opens, anything else confirms the credit first.
  const onAnalyze = (video) => handleAnalyzeAction(
    { ...video, analysis: analysisById[video.id] ?? video.analysis ?? null },
    {
      billing,
      onUpgrade: () => setUpgradeOpen(true),
      onOpenAnalysis: setAnalysisVideo,
      onConfirm: setConfirmVideo,
    },
  );

  const startAnalysis = async (video) => {
    setStarting(true);
    setConfirmVideo(null);

    try {
      const payload = await videoAnalysis.request(video.id);
      const next = payload?.analysis ?? null;

      if (next) setAnalysisById((cur) => ({ ...cur, [video.id]: next }));

      setReserved((cur) => (
        cur.some((id) => String(id) === String(video.id)) ? cur : [...cur, video.id]
      ));
      trackVideoAnalysis({
        videoId: video.id,
        searchUrl: video.search_url,
        searchName: video.brand,
        videoLabel: video.handle || video.caption || 'Breakout video',
      });
    } catch (error) {
      setConfirmVideo(video);
      window.alert(error?.message || 'Could not start this analysis.');
    } finally {
      setStarting(false);
    }
  };

  const upgrade = () => {
    setUpgradeOpen(false);

    return (billing?.trialEligible ?? true) && !(billing?.hasUsedTrial ?? false)
      ? billingApi.trialCheckout('growth')
      : billingApi.checkout('growth');
  };

  return (
    <>
      <Head title="My Feed · Brand Beacon" />
      <AppLayout width="max-w-[1180px] lg:px-6 xl:px-8">
        <style>{scopedCss}</style>

        <SearchCard suggestions={feed.suggestions ?? {}} />
        <MyFeed feed={feed} currentPath={currentPath} onAnalyze={onAnalyze} analysisById={analysisById} />
      </AppLayout>

      {analysisVideo && (
        <AnalysisModal
          video={analysisVideo}
          initialAnalysis={analysisById[analysisVideo.id] ?? analysisVideo.analysis ?? null}
          onClose={() => setAnalysisVideo(null)}
          onAnalysisChange={(videoId, analysis) => setAnalysisById((cur) => ({ ...cur, [videoId]: analysis }))}
        />
      )}

      {confirmVideo && (
        <UsageConfirmModal
          video={confirmVideo}
          creditsRemaining={remainingNow}
          creditsRemainingAfterUse={remainingAfterUse}
          busy={starting}
          onCancel={() => { if (!starting) setConfirmVideo(null); }}
          onConfirm={() => startAnalysis(confirmVideo)}
        />
      )}

      {upgradeOpen && (
        <AnalysisUpgradeModal
          trialEligible={billing?.trialEligible ?? true}
          hasUsedTrial={billing?.hasUsedTrial ?? false}
          onClose={() => setUpgradeOpen(false)}
          onUpgrade={upgrade}
        />
      )}

      {/* Searches started from sign-up or checkout land here, so their progress
          and credit prompts follow them onto the feed. */}
      <SearchFlashModals currentPath={currentPath} />
    </>
  );
}

/* Search card styles, scoped under bbs- so they never collide with app.css. */
const scopedCss = `
.bbs-card{background:var(--white);border:1px solid var(--line);border-radius:22px;padding:20px 22px 18px;margin-bottom:26px}
.bbs-field{position:relative;display:flex;align-items:center;gap:12px;height:66px;padding:0 9px;border:1px solid var(--line-2,#D9D6CF);border-radius:100px;background:var(--white);transition:border-color .18s,box-shadow .18s}
.bbs-field:focus-within{border-color:var(--yellow);box-shadow:0 0 0 4px var(--wash)}
.bbs-field>svg{width:20px;height:20px;flex:none;margin-left:4px;color:var(--faint,#74716A)}
.bbs-field input{flex:1;min-width:0;border:0;outline:0;background:none;font:inherit;font-size:1.08rem;font-weight:500;color:var(--ink)}
.bbs-field input::placeholder{color:#A5A29A;font-weight:400}

.bbs-seg{position:relative;display:inline-flex;gap:3px;padding:3px;flex:none;border:1px solid var(--line);border-radius:100px;background:var(--paper,#FAF9F6)}
.bbs-seg__ind{position:absolute;top:3px;left:3px;height:calc(100% - 6px);border-radius:100px;background:var(--yellow);box-shadow:0 2px 8px -2px rgba(255,198,41,.9);transition:transform .26s cubic-bezier(.22,.61,.36,1),width .26s cubic-bezier(.22,.61,.36,1)}
.bbs-seg button{position:relative;z-index:2;display:inline-flex;align-items:center;gap:7px;height:36px;padding:0 15px;border:0;border-radius:100px;background:none;font:inherit;font-size:.84rem;font-weight:700;color:var(--muted);cursor:pointer;transition:color .18s}
.bbs-seg button svg{width:15px;height:15px;opacity:.75}
.bbs-seg button:hover{color:var(--ink)}
.bbs-seg button.on{color:#1A1400}
.bbs-seg button.on svg{opacity:1}

.bbs-cta{position:relative;overflow:hidden;flex:none;height:48px;padding:0 24px;display:inline-flex;align-items:center;gap:9px;border:0;border-radius:100px;background:var(--yellow);color:#1A1400;font:inherit;font-size:.92rem;font-weight:800;letter-spacing:-.01em;cursor:pointer;box-shadow:0 6px 18px -6px rgba(255,198,41,.9)}
.bbs-cta svg{width:16px;height:16px}
.bbs-cta:hover{background:var(--yellow-hot,#FFD84D);box-shadow:0 8px 26px -6px rgba(255,198,41,1)}

.bbs-suggest{position:absolute;top:calc(100% + 8px);left:0;right:0;z-index:40;max-height:340px;overflow-y:auto;padding:6px;border:1px solid var(--line);border-radius:16px;background:var(--white);box-shadow:0 18px 40px -18px rgba(20,15,0,.34)}
.bbs-suggest__h{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 12px 6px;font-size:.68rem;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:var(--amber-ink)}
.bbs-suggest__i{display:flex;align-items:baseline;gap:10px;width:100%;padding:10px 12px;border:0;border-radius:10px;background:none;font:inherit;text-align:left;cursor:pointer}
.bbs-suggest__i strong{min-width:0;flex:1;font-size:.9rem;font-weight:700;color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bbs-suggest__i em{flex:none;font-style:normal;font-size:.74rem;font-weight:600;color:var(--muted);opacity:.75}
.bbs-suggest__i.on,.bbs-suggest__i:focus-visible{background:var(--wash);outline:0}

.bbs-sugg{display:flex;align-items:center;flex-wrap:wrap;gap:9px;margin-top:16px;padding-top:16px;border-top:1px solid var(--line)}
.bbs-sugg__l{font-size:.82rem;font-weight:700;color:var(--muted)}
.bbs-kw{display:inline-flex;align-items:center;gap:7px;height:32px;padding:0 13px;border:1px solid var(--line);border-radius:100px;background:var(--white);font:inherit;font-size:.83rem;font-weight:600;color:var(--muted);cursor:pointer;transition:.16s}
.bbs-kw i{width:5px;height:5px;flex:none;border-radius:50%;background:var(--yellow)}
.bbs-kw.p i{background:#C2410C}
.bbs-kw:hover{border-color:var(--yellow);background:var(--wash);color:var(--ink)}
.bbs-cta:focus-visible,.bbs-kw:focus-visible,.bbs-seg button:focus-visible{outline:2px solid var(--ink);outline-offset:2px}

@media (prefers-reduced-motion:reduce){.bbs-seg__ind,.bbs-cta,.bbs-kw{transition:none}}

@media (max-width:680px){
  .bbs-card{padding:16px 14px 14px;border-radius:18px}
  .bbs-field{height:auto;flex-wrap:wrap;padding:12px;border-radius:16px;gap:10px}
  .bbs-field>svg{margin-left:2px}
  .bbs-field input{flex:1 1 auto;min-width:0;font-size:1rem}
  .bbs-seg{flex:1 0 100%}
  .bbs-seg button{flex:1;justify-content:center}
  .bbs-cta{flex:1 0 100%;justify-content:center}
  .bbs-suggest{max-height:260px}
}
`;
