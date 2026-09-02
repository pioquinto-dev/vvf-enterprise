import { Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

import Seo from '../../components/Seo.jsx';
import { Arrow, Check, Google, Plus, Search, Store } from '../../landing/components/Icons.jsx';
import { expandKeywords, fetchKeywordSuggestions } from '../../landing/flow/api.js';
import Nav from '../../landing/sections/Nav.jsx';

const TYPES = [
  { key: 'brand', label: 'Your brand', icon: Store, placeholder: 'e.g. rhode skin' },
  { key: 'product', label: 'A product', icon: Search, placeholder: 'e.g. lip oil' },
];

const csrfToken = () => document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';

function Stepper({ step }) {
  return <div className="fs-stepper" aria-label={`Step ${step} of 3`}>
    {['Subject', 'Keywords', 'Results'].map((label, index) => {
      const number = index + 1;
      const state = number < step ? 'done' : number === step ? 'now' : '';
      return <span key={label} className={`fs-step ${state}`}><i>{state === 'done' ? <Check /> : number}</i><b>{label}</b>{number < 3 && <em />}</span>;
    })}
  </div>;
}

export default function Free({ phrase = '', type = 'brand', error = null }) {
  const [screen, setScreen] = useState(phrase ? 'refine' : 'subject');
  const [showGateCard, setShowGateCard] = useState(false);
  const [kind, setKind] = useState(type === 'competitor' ? 'brand' : type);
  const [subject, setSubject] = useState(phrase);
  const [terms, setTerms] = useState([]);
  const [subjectSuggestions, setSubjectSuggestions] = useState([]);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [draft, setDraft] = useState('');
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(error);
  const requested = useRef('');
  const subjectFieldRef = useRef(null);
  const config = TYPES.find((item) => item.key === kind) ?? TYPES[0];
  const selected = terms.filter((term) => term.selected).map((term) => term.value);

  useEffect(() => {
    if (screen !== 'refine' || !subject || requested.current === `${kind}:${subject}`) return;
    let active = true;
    requested.current = `${kind}:${subject}`;
    setLoading(true);
    expandKeywords(subject, { type: kind }).then((payload) => {
      if (!active) return;
      const seen = new Set([subject.toLowerCase()]);
      const suggestions = (Array.isArray(payload?.keywords) ? payload.keywords : []).filter((value) => {
        const key = String(value).toLowerCase();
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      }).slice(0, 11).map((value, index) => ({ value, selected: index < 3 }));
      setTerms([{ value: subject, selected: true, locked: true }, ...suggestions]);
    }).catch(() => active && setTerms([{ value: subject, selected: true, locked: true }])).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [kind, screen, subject]);

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
    if (screen !== 'gate') {
      setShowGateCard(false);
      return undefined;
    }

    const timer = window.setTimeout(() => setShowGateCard(true), 2000);
    return () => window.clearTimeout(timer);
  }, [screen]);

  const beginRefine = (event) => {
    event.preventDefault();
    const clean = subject.trim().replace(/\s+/g, ' ');
    if (!clean) return;
    setSubject(clean);
    setScreen('refine');
  };
  const toggle = (value) => setTerms((current) => current.map((term) => term.value === value && !term.locked ? { ...term, selected: !term.selected } : term));
  const addKeyword = () => {
    const clean = draft.trim().replace(/\s+/g, ' ');
    setDraft(''); setAdding(false);
    if (!clean || terms.some((term) => term.value.toLowerCase() === clean.toLowerCase()) || terms.length >= 12) return;
    setTerms((current) => [...current, { value: clean, selected: true }]);
  };
  const [pendingRoute, setPendingRoute] = useState(null);
  const stashAndGo = async (destination, tag) => {
    setSaving(true); setPendingRoute(tag); setMessage(null);
    try {
      const response = await fetch('/search/pending', { method: 'POST', credentials: 'same-origin', headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest', 'X-CSRF-TOKEN': csrfToken() }, body: JSON.stringify({ type: kind, phrase: subject, keywords: selected, frequency: 'weekly' }) });
      if (!response.ok) throw new Error('We could not save your search. Please try again.');
      window.location.assign(destination);
    } catch (caught) { setMessage(caught.message); setSaving(false); setPendingRoute(null); }
  };
  const prepareAndSignIn = () => stashAndGo('/auth/google', 'google');
  const goCreateAccount = () => stashAndGo('/register', 'register');
  const goLogin = () => stashAndGo('/login', 'login');
  const initials = (subject || '?').trim().replace(/[^a-zA-Z0-9]/g, '').slice(0, 2).toUpperCase() || '?';
  const kindLabel = kind === 'brand' ? 'Brand' : 'Product';
  const stages = ['Pulling videos from TikTok', 'Filtering against your keywords', 'Scoring outliers vs creator baseline', 'Ranking your top breakouts'];
  const visibleSuggestions = subjectSuggestions.filter((suggestion) => suggestion.label?.trim());
  const applySuggestion = (label) => {
    setSubject(label);
    setShowSuggestions(false);
    setActiveSuggestion(-1);
  };
  const gateCard = <div className="ff-signup ff-signup--m5"><h2>Where should we send it?</h2><p>Your search is running. Create an account and we will email you when it lands.</p><div className="ff-runchip"><span className="ff-runchip__mono">{initials}</span><span className="ff-runchip__body"><b>{subject}</b><em>{kindLabel} · {selected.length} keyword{selected.length === 1 ? '' : 's'} · weekly</em></span><span className="ff-runchip__pill">RUNNING</span></div>{message && <p className="ff-error">{message}</p>}<button type="button" className="ff-google ff-google--outline" disabled={saving} onClick={prepareAndSignIn}><Google />{saving && pendingRoute === 'google' ? 'Opening Google…' : 'Continue with Google'}</button><button type="button" className="ff-create" disabled={saving} onClick={goCreateAccount}>{saving && pendingRoute === 'register' ? 'Opening sign up…' : 'Create account'}</button><p className="ff-trust ff-trust--muted">Then you can close the tab.</p><button type="button" className="ff-havelogin" disabled={saving} onClick={goLogin}>{saving && pendingRoute === 'login' ? 'Opening sign in…' : 'I already have an account'}</button></div>;

  return <><Seo title="Free TikTok Search | Brand Beacon" description="Start a TikTok brand or product search with Brand Beacon." noIndex /><div className="bbh"><Nav homeHref="/" /><main className={`free-flow ${screen === 'gate' ? 'free-flow--gate' : ''}`}>
    <style>{`
      .free-flow{min-height:calc(100vh - 72px);background:#fff;color:#111;padding:0 22px 64px;font-family:Figtree,ui-sans-serif,system-ui,sans-serif}
      .ff-shell{max-width:594px;margin:0 auto;padding-top:28px}.fs-stepper{display:flex;align-items:center;justify-content:center;margin:0 0 28px}.fs-step{display:flex;align-items:center;gap:8px;color:#77726b;font-size:11px}.fs-step i{width:23px;height:23px;border:1px solid #ddd8cf;border-radius:50%;display:grid;place-items:center;font-size:11px;font-style:normal}.fs-step.done,.fs-step.now{color:#151515}.fs-step.done i{background:#111;color:#fff;border-color:#111}.fs-step.now i{background:#ffc629;border-color:#ffc629}.fs-step i svg{width:11px;height:11px}.fs-step em{width:27px;height:1px;background:#ddd8cf;margin:0 9px;font-style:normal}.ff-card{border:1px solid #e4e0d8;border-radius:20px;overflow:hidden;background:#fff;box-shadow:0 12px 32px -30px rgba(0,0,0,.3)}.ff-subject{height:66px;padding:0 21px;display:flex;align-items:center;border-bottom:1px solid #e4e0d8}.ff-subject__label,.ff-eyebrow{font-size:10px;font-weight:850;color:#a16d00;letter-spacing:.13em;text-transform:uppercase}.ff-subject strong{margin-left:12px;font-size:15px;letter-spacing:-.03em}.ff-edit{margin-left:auto;width:30px;height:30px;border:1px solid #e4e0d8;border-radius:50%;background:#fff;color:#777;display:grid;place-items:center;cursor:pointer}.ff-edit svg{width:14px;height:14px}.ff-section{padding:23px 21px 24px}.ff-section h1{margin:10px 0 0;font-size:17px;line-height:1.25;letter-spacing:-.035em}.ff-section>p{margin:10px 0 0;font-size:13px;line-height:1.55;color:#625e58}.ff-chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:18px}.ff-chip{height:37px;padding:0 14px;border:1.5px solid #b8b1a2 !important;border-radius:999px;background:#fff;color:#302d29;font:inherit;font-size:12px;font-weight:700;display:inline-flex;align-items:center;gap:8px;cursor:pointer;transition:border-color .15s,background .15s,box-shadow .15s}.ff-chip:hover:not(:disabled){border-color:#8a8271 !important}.ff-chip:disabled{cursor:default}.ff-chip.on{border-color:#ffc629 !important;box-shadow:0 0 0 1.5px #ffc629 inset}.ff-check{width:15px;height:15px;border:1px solid #d9d4ca;border-radius:50%;display:grid;place-items:center}.ff-chip.on .ff-check{background:#ffc629;border-color:#ffc629}.ff-check svg{width:9px;height:9px}.ff-add{border-style:dashed;color:#9d6900}.ff-add svg{width:13px;height:13px}.ff-add-input{height:37px;width:130px;padding:0 12px;border:1px solid #ffc629;border-radius:999px;outline:0;font:inherit;font-size:12px;font-weight:700}.ff-count{margin:14px 0 0!important;font-size:11px!important;color:#756f68!important}.ff-count b{color:#111}.ff-footer{min-height:85px;padding:0 21px;border-top:1px solid #e4e0d8;display:flex;align-items:center;justify-content:space-between;gap:12px}.ff-back,.ff-run{height:41px;padding:0 20px;border-radius:10px;font:inherit;font-size:13px;font-weight:800;cursor:pointer}.ff-back{border:1px solid #ddd8cf;background:#fff;color:#111}.ff-run{border:0;background:#ffc629;color:#1a1400;display:inline-flex;align-items:center;gap:10px;box-shadow:0 1px 2px rgba(20,15,0,.1),0 10px 24px -8px rgba(255,198,41,.72)}.ff-run:hover:not(:disabled){background:#ffd84d;transform:translateY(-1px);box-shadow:0 2px 4px rgba(20,15,0,.1),0 16px 30px -10px rgba(255,198,41,.85)}.ff-run svg{width:15px;height:15px}.ff-run:disabled{opacity:.55;cursor:not-allowed}.ff-subject-form{max-width:520px;margin:66px auto;border:1px solid #e4e0d8;border-radius:20px;padding:26px}.ff-subject-form h1{margin:0;font-size:25px;letter-spacing:-.05em}.ff-modes{display:grid;grid-template-columns:repeat(2,1fr);gap:7px;margin-top:22px}.ff-mode{height:45px;border:1px solid #ddd8cf;border-radius:10px;background:#fff;font:inherit;font-size:12px;font-weight:750;cursor:pointer}.ff-mode.is-on{background:#111;border-color:#111;color:#fff}.ff-mode svg{width:14px;height:14px;vertical-align:-2px;margin-right:5px}.ff-input{width:100%;box-sizing:border-box;height:48px;margin-top:16px;padding:0 13px;border:1px solid #d9d4ca;border-radius:10px;font:inherit;font-weight:650;outline:0}.ff-input:focus{border-color:#ffc629;box-shadow:0 0 0 4px rgba(255,198,41,.2)}
      .ff-subject-field{position:relative;margin-top:16px}
      .ff-subject-suggest{position:absolute;top:calc(100% + 10px);left:0;right:0;z-index:20;overflow:hidden;border:1px solid #eadfca;border-radius:18px;background:rgba(255,255,255,.98);box-shadow:0 24px 48px -24px rgba(33,26,12,.3),0 8px 18px -12px rgba(33,26,12,.14);backdrop-filter:blur(10px)}
      .ff-subject-suggest__head{display:flex;align-items:center;justify-content:space-between;padding:11px 14px 10px;background:linear-gradient(180deg,#fff8e3 0%,#fffdf7 100%);border-bottom:1px solid #f0e5cf;font-size:.68rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#9d6900}
      .ff-subject-suggest__list{max-height:300px;overflow-y:auto;padding:6px}
      .ff-subject-suggest__item{width:100%;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:11px 12px;border:0;border-radius:14px;background:transparent;text-align:left;cursor:pointer;transition:background .15s,transform .15s}
      .ff-subject-suggest__item:hover,.ff-subject-suggest__item.is-active{background:#fff7df}
      .ff-subject-suggest__item.is-active{transform:translateX(2px)}
      .ff-subject-suggest__copy{display:flex;min-width:0;flex-direction:column;gap:3px}
      .ff-subject-suggest__copy strong{font-size:.92rem;font-weight:700;letter-spacing:-.02em;color:#181614}
      .ff-subject-suggest__copy em{font-style:normal;font-size:.74rem;font-weight:600;color:#8b8577}
      .ff-shell{max-width:594px;margin:0 auto;padding-top:28px}.fs-stepper{display:flex;align-items:center;justify-content:center;margin:0 0 28px}.fs-step{display:flex;align-items:center;gap:8px;color:#77726b;font-size:11px}.fs-step i{width:23px;height:23px;border:1px solid #ddd8cf;border-radius:50%;display:grid;place-items:center;font-size:11px;font-style:normal}.fs-step.done,.fs-step.now{color:#151515}.fs-step.done i{background:#111;color:#fff;border-color:#111}.fs-step.now i{background:#ffc629;border-color:#ffc629}.fs-step i svg{width:11px;height:11px}.fs-step em{width:27px;height:1px;background:#ddd8cf;margin:0 9px;font-style:normal}.ff-card{border:1px solid #e4e0d8;border-radius:20px;overflow:hidden;background:#fff;box-shadow:0 12px 32px -30px rgba(0,0,0,.3)}.ff-subject{height:66px;padding:0 21px;display:flex;align-items:center;border-bottom:1px solid #e4e0d8}.ff-subject__label,.ff-eyebrow{font-size:10px;font-weight:850;color:#a16d00;letter-spacing:.13em;text-transform:uppercase}.ff-subject strong{margin-left:12px;font-size:15px;letter-spacing:-.03em}.ff-edit{margin-left:auto;width:30px;height:30px;border:1px solid #e4e0d8;border-radius:50%;background:#fff;color:#777;display:grid;place-items:center;cursor:pointer}.ff-edit svg{width:14px;height:14px}.ff-section{padding:23px 21px 24px}.ff-section h1{margin:10px 0 0;font-size:17px;line-height:1.25;letter-spacing:-.035em}.ff-section>p{margin:10px 0 0;font-size:13px;line-height:1.55;color:#625e58}.ff-chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:18px}.ff-chip{height:37px;padding:0 14px;border:1.5px solid #b8b1a2 !important;border-radius:999px;background:#fff;color:#302d29;font:inherit;font-size:12px;font-weight:700;display:inline-flex;align-items:center;gap:8px;cursor:pointer;transition:border-color .15s,background .15s,box-shadow .15s}.ff-chip:hover:not(:disabled){border-color:#8a8271 !important}.ff-chip:disabled{cursor:default}.ff-chip.on{border-color:#ffc629 !important;box-shadow:0 0 0 1.5px #ffc629 inset}.ff-check{width:15px;height:15px;border:1px solid #d9d4ca;border-radius:50%;display:grid;place-items:center}.ff-chip.on .ff-check{background:#ffc629;border-color:#ffc629}.ff-check svg{width:9px;height:9px}.ff-add{border-style:dashed;color:#9d6900}.ff-add svg{width:13px;height:13px}.ff-add-input{height:37px;width:130px;padding:0 12px;border:1px solid #ffc629;border-radius:999px;outline:0;font:inherit;font-size:12px;font-weight:700}.ff-count{margin:14px 0 0!important;font-size:11px!important;color:#756f68!important}.ff-count b{color:#111}.ff-footer{min-height:85px;padding:0 21px;border-top:1px solid #e4e0d8;display:flex;align-items:center;justify-content:space-between;gap:12px}.ff-back,.ff-run{height:41px;padding:0 20px;border-radius:10px;font:inherit;font-size:13px;font-weight:800;cursor:pointer}.ff-back{border:1px solid #ddd8cf;background:#fff;color:#111}.ff-run{border:0;background:#ffc629;color:#1a1400;display:inline-flex;align-items:center;gap:10px;box-shadow:0 1px 2px rgba(20,15,0,.1),0 10px 24px -8px rgba(255,198,41,.72)}.ff-run:hover:not(:disabled){background:#ffd84d;transform:translateY(-1px);box-shadow:0 2px 4px rgba(20,15,0,.1),0 16px 30px -10px rgba(255,198,41,.85)}.ff-run svg{width:15px;height:15px}.ff-run:disabled{opacity:.55;cursor:not-allowed}.ff-subject-form{max-width:520px;margin:66px auto;border:1px solid #e4e0d8;border-radius:20px;padding:26px}.ff-subject-form h1{margin:0;font-size:25px;letter-spacing:-.05em}.ff-modes{display:grid;grid-template-columns:repeat(2,1fr);gap:7px;margin-top:22px}.ff-mode{height:45px;border:1px solid #ddd8cf;border-radius:10px;background:#fff;font:inherit;font-size:12px;font-weight:750;cursor:pointer}.ff-mode.is-on{background:#111;border-color:#111;color:#fff}.ff-mode svg{width:14px;height:14px;vertical-align:-2px;margin-right:5px}.ff-input{width:100%;box-sizing:border-box;height:48px;margin-top:16px;padding:0 13px;border:1px solid #d9d4ca;border-radius:10px;font:inherit;font-weight:650;outline:0}.ff-input:focus{border-color:#ffc629;box-shadow:0 0 0 4px rgba(255,198,41,.2)}
      .free-flow--gate{padding:0;background:#fff}.ff-gate{min-height:calc(100vh - 72px);display:grid;grid-template-columns:1fr 1fr}.ff-gate__copy{padding:clamp(48px,11vh,120px) clamp(29px,5vw,90px);display:flex;align-items:center}.ff-gate__inner{max-width:420px}.ff-gate h1{margin:12px 0 0;font-size:clamp(27px,3vw,38px);line-height:1.08;letter-spacing:-.065em}.ff-gate__copy>div>p{font-size:13px;line-height:1.55;color:#625e58;margin:15px 0 0}.ff-stages{margin-top:35px;display:flex;flex-direction:column;gap:12px}.ff-stage{min-height:34px;padding:0 10px;display:flex;align-items:center;gap:11px;border-radius:9px;font-size:12px;font-weight:650}.ff-stage i{width:15px;height:15px;border-radius:50%;background:#111;color:#fff;display:grid;place-items:center}.ff-stage i svg{width:9px;height:9px}.ff-stage.now{background:#fff5da}.ff-stage.now i{background:transparent;border:1.5px solid #ffc629;border-top-color:transparent;animation:ff-spin .8s linear infinite}.ff-email{display:flex;align-items:center;gap:9px;margin-top:20px;padding:12px;border:1px solid #f1d798;border-radius:10px;background:#fffaf0;color:#9d6900;font-size:11px;font-weight:750}.ff-email svg{width:15px;height:15px}@keyframes ff-spin{to{transform:rotate(360deg)}}.ff-gate__visual{padding:28px 30px;background:#faf9f6;border-left:1px solid #ece8df;display:flex;align-items:center;justify-content:center}.ff-preview{width:min(100%,560px)}.ff-videos{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.ff-video{height:200px;width:100%;border-radius:10px;object-fit:cover;filter:blur(3px);opacity:.75}.ff-gate__sheet--desktop{display:block}.ff-gate__sheet--mobile{display:none}.ff-signup{margin:18px auto 0;padding:23px;border:1px solid #e4e0d8;border-radius:16px;background:#fff;text-align:center;box-shadow:0 20px 35px -30px rgba(0,0,0,.25);max-width:100%}.ff-signup h2{font-size:16px;letter-spacing:-.035em;margin:0}.ff-signup p{font-size:11px!important;line-height:1.55!important;margin:13px auto 0!important;color:#756f68!important}.ff-google{appearance:none;-webkit-appearance:none;height:50px;width:100%;margin-top:18px;border:1px solid #111!important;border-radius:9px;background:#111!important;color:#fff!important;font:inherit;font-size:12px;font-weight:800;display:flex;align-items:center;justify-content:center;gap:9px;cursor:pointer;box-shadow:0 8px 16px -10px rgba(0,0,0,.7);transition:transform .16s,background .16s,box-shadow .16s}.ff-google:hover:not(:disabled){background:#292929!important;box-shadow:0 11px 20px -10px rgba(0,0,0,.65);transform:translateY(-1px)}.ff-google svg{width:19px;height:19px;background:#fff;border-radius:50%;padding:2px}.ff-google:disabled{opacity:.6}.ff-trust{font-size:10px!important;margin-top:12px!important}.ff-error{margin-top:12px!important;color:#aa3820!important;font-weight:700}
      @media(max-width:720px){.free-flow--gate{padding:0;background:#f7f4ed}.ff-gate{position:relative;display:block;min-height:calc(100vh - 72px);padding:44px 16px 250px;overflow:hidden}.ff-gate__copy{display:flex;justify-content:center;padding:0;text-align:center}.ff-gate__inner{max-width:430px}.ff-gate h1{margin:14px 0 0;font-size:clamp(26px,8vw,36px);line-height:1.04}.ff-gate__copy>div>p{max-width:280px;margin-left:auto;margin-right:auto}.ff-stages{margin:32px auto 0;max-width:none}.ff-stage{text-align:left}.ff-stage i{flex:none}.ff-email{margin:20px auto 0;max-width:none;text-align:left}.ff-email svg{flex:none}.ff-gate__visual{display:none}.ff-gate__sheet--desktop{display:none}.ff-gate__sheet--mobile{position:fixed;left:0;right:0;bottom:0;z-index:20;display:flex;justify-content:center;padding:0 6px;pointer-events:none}.ff-gate__sheet--mobile.is-open .ff-signup{transform:translateY(0);opacity:1}.ff-signup{width:min(100%,560px);margin-top:0;padding:18px 18px 22px;border-bottom:0;border-radius:18px 18px 0 0;box-shadow:0 -12px 40px rgba(0,0,0,.10);transform:translateY(110%);opacity:0;transition:transform .34s ease,opacity .24s ease;pointer-events:auto}.ff-signup::before{content:'';display:block;width:46px;height:4px;border-radius:999px;background:#d7d2c8;margin:0 auto 16px}}@media(max-width:500px){.free-flow{padding:0 12px 35px}.free-flow--gate{padding:0}.ff-shell{padding-top:20px}.fs-step b{display:none}.fs-step em{width:20px;margin:0 5px}.ff-card{border-radius:16px}.ff-section{padding:20px 17px}.ff-subject{padding:0 17px}.ff-footer{padding:0 17px}.ff-run{padding:0 14px}.ff-modes{grid-template-columns:1fr}.ff-subject-form{margin:32px auto}.ff-gate{padding:38px 10px 248px}.ff-signup{padding:16px 14px 20px}.ff-subject-suggest{top:calc(100% + 8px);border-radius:16px}.ff-subject-suggest__head{padding:10px 12px 9px;font-size:.62rem}.ff-subject-suggest__item{padding:10px}.ff-subject-suggest__copy strong{font-size:.86rem}}
    `}</style><style>{`
      .ff-chip.on{background:#fff8e1}
      .ff-chips .ff-add{flex:0 0 auto;margin-right:100%;white-space:nowrap}
      .ff-subject{background:#fffaea}
      .ff-topbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
      .ff-topbar__back{color:#4a4741;background:transparent;border:0;padding:6px 4px;cursor:pointer;font:inherit;font-size:12px;font-weight:650;display:inline-flex;align-items:center;gap:6px}
      .ff-topbar__back:hover{color:#111}
      .ff-topbar__free{display:inline-flex;align-items:center;gap:7px;height:28px;padding:0 12px;background:#fff5da;color:#9d6900;border-radius:999px;font-size:10.5px;font-weight:800;letter-spacing:.02em}
      .ff-topbar__free::before{content:'\\2726';font-size:10px}
      .ff-signup--m5{text-align:left;padding:24px}
      .ff-signup--m5 h2{font-size:19px;letter-spacing:-.03em}
      .ff-signup--m5>p{text-align:left!important;margin:8px 0 0!important;font-size:12px!important;color:#5a5651!important}
      .ff-runchip{display:flex;align-items:center;gap:12px;margin:18px 0 18px;padding:12px 14px;background:#fff8e1;border:1px solid #f1d798;border-radius:12px}
      .ff-runchip__mono{width:34px;height:34px;flex:none;border-radius:8px;background:#ffe9a3;color:#7a5300;font-weight:800;font-size:12px;display:grid;place-items:center;letter-spacing:.02em}
      .ff-runchip__body{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px;font-size:12px;text-align:left}
      .ff-runchip__body b{font-weight:800;color:#181614;letter-spacing:-.02em}
      .ff-runchip__body em{font-style:normal;color:#75694a;font-size:11px}
      .ff-runchip__pill{font-size:9.5px;font-weight:800;letter-spacing:.12em;color:#8a5a00;background:#ffdf80;padding:5px 8px;border-radius:6px}
      .ff-google--outline{background:#fff!important;color:#111!important;border:1px solid #d9d4ca!important;box-shadow:none;margin-top:6px}
      .ff-google--outline:hover:not(:disabled){background:#faf8f2!important;box-shadow:0 4px 10px -6px rgba(0,0,0,.2)}
      .ff-google--outline svg{background:transparent;padding:0}
      .ff-create{appearance:none;-webkit-appearance:none;height:50px;width:100%;margin-top:10px;border:0;border-radius:9px;background:#ffc629;color:#1a1400;font:inherit;font-size:13px;font-weight:800;cursor:pointer;box-shadow:0 8px 18px -10px rgba(255,198,41,.9);transition:transform .16s,background .16s,box-shadow .16s}
      .ff-create:hover:not(:disabled){background:#ffd84d;transform:translateY(-1px);box-shadow:0 12px 22px -10px rgba(255,198,41,1)}
      .ff-create:disabled{opacity:.65;cursor:not-allowed}
      .ff-trust--muted{text-align:center;color:#8b8577!important;margin-top:8px!important}
      .ff-havelogin{display:block;margin:14px auto 0;background:transparent;border:0;font:inherit;font-size:12px;font-weight:700;color:#111;text-decoration:underline;cursor:pointer;padding:6px}
      .ff-havelogin:disabled{opacity:.55;cursor:not-allowed}
    `}</style>
    {screen === 'subject' && <section className="ff-subject-form"><h1>What do you want to scan?</h1><form onSubmit={beginRefine} ref={subjectFieldRef}><div className="ff-modes">{TYPES.map(({ key, label, icon: Icon }) => <button key={key} type="button" className={`ff-mode ${kind === key ? 'is-on' : ''}`} onClick={() => setKind(key)}><Icon />{label}</button>)}</div><div className="ff-subject-field"><input className="ff-input" autoFocus autoComplete="off" value={subject} placeholder={config.placeholder} onChange={(event) => { setSubject(event.target.value); setShowSuggestions(true); }} onFocus={() => setShowSuggestions(true)} onKeyDown={(event) => { if (!visibleSuggestions.length) return; if (event.key === 'ArrowDown') { event.preventDefault(); setShowSuggestions(true); setActiveSuggestion((current) => (current + 1) % visibleSuggestions.length); } if (event.key === 'ArrowUp') { event.preventDefault(); setShowSuggestions(true); setActiveSuggestion((current) => (current <= 0 ? visibleSuggestions.length - 1 : current - 1)); } if (event.key === 'Enter' && activeSuggestion >= 0 && visibleSuggestions[activeSuggestion]) { event.preventDefault(); applySuggestion(visibleSuggestions[activeSuggestion].label); } if (event.key === 'Escape') { setShowSuggestions(false); setActiveSuggestion(-1); } }} aria-expanded={showSuggestions && visibleSuggestions.length > 0} aria-haspopup="listbox" />{showSuggestions && visibleSuggestions.length > 0 && <div className="ff-subject-suggest" role="listbox" aria-label={`${kind} suggestions`}><div className="ff-subject-suggest__head"><span>Suggested {kind === 'brand' ? 'brands' : 'products'}</span><span>{visibleSuggestions.length}</span></div><div className="ff-subject-suggest__list">{visibleSuggestions.map((suggestion, index) => <button key={`${suggestion.type}-${suggestion.id}`} type="button" className={`ff-subject-suggest__item ${index === activeSuggestion ? 'is-active' : ''}`.trim()} onMouseEnter={() => setActiveSuggestion(index)} onMouseDown={(event) => event.preventDefault()} onClick={() => applySuggestion(suggestion.label)}><span className="ff-subject-suggest__copy"><strong>{suggestion.label}</strong>{suggestion.sector && <em>{suggestion.sector}</em>}</span></button>)}</div></div>}</div><button className="ff-run" style={{ marginTop: 16, marginLeft: 'auto' }} disabled={!subject.trim()}>Continue <Arrow /></button></form></section>}
    {screen === 'refine' && <section className="ff-shell"><div className="ff-topbar"><button type="button" className="ff-topbar__back" onClick={() => window.location.assign('/')}>&larr; Back</button><span className="ff-topbar__free">Free search &middot; no card needed</span></div><Stepper step={2} /><div className="ff-card"><div className="ff-subject"><span className="ff-subject__label">Searching</span><strong>{subject}</strong><button type="button" className="ff-edit" aria-label="Change subject" onClick={() => window.location.assign('/')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></svg></button></div><div className="ff-section"><span className="ff-eyebrow">Widen the pull</span><h1>Add keywords to catch more of the trend</h1><p>These are the terms people pair with your subject on TikTok. Ticking more still counts as one free search.</p>{loading ? <p>Suggesting keywords...</p> : <div className="ff-chips">{terms.map((term) => <button key={term.value} type="button" disabled={term.locked} className={`ff-chip ${term.selected ? 'on' : ''}`} onClick={() => toggle(term.value)}><span className="ff-check">{term.selected && <Check />}</span>{term.value}</button>)}{adding ? <input className="ff-add-input" autoFocus value={draft} onChange={(event) => setDraft(event.target.value)} onBlur={addKeyword} onKeyDown={(event) => { if (event.key === 'Enter') addKeyword(); if (event.key === 'Escape') setAdding(false); }} placeholder="Add a keyword" /> : <button type="button" className="ff-chip ff-add" onClick={() => setAdding(true)}><Plus />Add your own</button>}</div>}<p className="ff-count"><b>{selected.length}</b> selected · all covered by your one free search.</p>{message && <p className="ff-error">{message}</p>}</div><div className="ff-footer"><button type="button" className="ff-back" onClick={() => window.location.assign('/')} disabled={saving}>Back</button><button type="button" className="ff-run" disabled={loading || selected.length === 0 || saving} onClick={prepareAndSignIn}>{saving && pendingRoute === 'google' ? 'Opening Google…' : 'Run my free search'} <Arrow /></button></div></div></section>}
    {screen === 'gate' && <section className="ff-gate"><div className="ff-gate__copy"><div className="ff-gate__inner"><span className="ff-eyebrow">Scanning TikTok</span><h1>Building your report<br />for {subject}</h1><p>This is a deep scan, so it takes about 5 to 10 minutes. We are pulling videos, scoring them against each creator&apos;s baseline, and ranking the breakouts. You do not need to wait around.</p><div className="ff-stages">{stages.map((label, index) => <div key={label} className={`ff-stage ${index === stages.length - 1 ? 'now' : ''}`}><i>{index < stages.length - 1 && <Check />}</i>{label}</div>)}</div><div className="ff-email"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>We will email your report the moment it is done.</div></div></div><div className="ff-gate__visual"><div className="ff-preview"><div className="ff-videos"><img className="ff-video" src="/images/landing/discovery-coco-shimmy.png" alt="" /><img className="ff-video" src="/images/landing/discovery-buyer-beware.png" alt="" /><img className="ff-video" src="/images/landing/discovery-brow-grooming.png" alt="" /></div><div className="ff-gate__sheet--desktop">{gateCard}</div></div></div><div className={`ff-gate__sheet--mobile ${showGateCard ? 'is-open' : ''}`}>{gateCard}</div></section>}
  </main></div></>;
}
