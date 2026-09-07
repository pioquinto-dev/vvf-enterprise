import { useEffect, useRef, useState } from 'react';

import { fetchNotifications, updateTracked } from '../api.js';
import { EXAMPLE_BREAKOUTS } from '../../data/exampleBreakouts.js';

const POLL_MS = 10000;

/* The five visible passes of a run. The ticker walks through the first three
 * and holds on "Analyzing" — scoring and the final polish only tick over to
 * done once the real run completes. */
const STEPS = [
  'Scanning TikTok’s videos for your selected keywords',
  'Pulling video and creator information',
  'Analyzing videos with our AI agents',
  'Scoring each video and extracting winners',
  'Making it look pretty for you',
];

const Check = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.6 4.5L19 7" /></svg>
);

function elapsedLabel(seconds) {
  if (seconds < 60) return `Started ${Math.max(1, seconds)} second${seconds === 1 ? '' : 's'} ago`;
  const mins = Math.floor(seconds / 60);
  return `Started ${mins} minute${mins === 1 ? '' : 's'} ago`;
}

/* Render a beat: optional lead text, a bold clause, optional tail. */
function Beat({ beat }) {
  return (
    <div className="m4-beat">
      <span className="m4-beat__ts">{beat.ts}</span>
      <p>
        {beat.text}
        {beat.strong && <b>{beat.strong}</b>}
        {beat.tail}
      </p>
    </div>
  );
}

/* The full-bleed art layer behind a featured card: a real thumbnail when we
 * have one, else a stable gradient. */
function CardArt({ item }) {
  return (
    <span className="m4-art" style={{ background: item.gradient }}>
      {item.thumbnail && <img className="m4-art__img" src={item.thumbnail} alt="" loading="lazy" />}
    </span>
  );
}

/* A rail thumbnail with its score chip. */
function RailThumb({ item }) {
  return (
    <span className="m4-vc" style={{ background: item.gradient }}>
      {item.thumbnail && <img className="m4-art__img" src={item.thumbnail} alt="" loading="lazy" />}
      {item.score && <span className="m4-sc">{item.score}</span>}
    </span>
  );
}

/* --------------------------- M4b: opened breakout --------------------------- */
function BreakoutModal({ item, subject, step, others, onClose }) {
  useEffect(() => {
    const onEsc = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [onClose]);

  const hasBeats = Array.isArray(item.beats) && item.beats.length > 0;

  return (
    <div className="m4-modal" role="dialog" aria-modal="true" aria-label={`Why ${item.handle || 'this creator'} broke out`}>
      <button className="m4-modal__bg" aria-label="Back to your search" onClick={onClose} />
      <div className="m4-modal__panel">
        <div className="m4-runbar">
          <span className="m4-runbar__mini" aria-hidden>
            <svg viewBox="0 0 24 24" fill="none" stroke="#ffc629" strokeWidth="2.4" strokeLinecap="round"><path d="M12 2.8a9.2 9.2 0 1 0 9.2 9.2" /></svg>
          </span>
          <span className="m4-runbar__bd">
            <strong>Your {subject} search is still running</strong>
            <span>{STEPS[Math.min(step, STEPS.length - 1)]} · we will not lose it</span>
          </span>
          <button type="button" className="m4-runbar__go" onClick={onClose}>Back to it</button>
        </div>

        <div className="m4-modal__scroll">
          <div className="m4-fcard m4-fcard--tall">
            <CardArt item={item} />
            <span className="m4-veil" />
            {item.score && <span className="m4-oscore"><b>{item.score}</b><span>outlier</span></span>}
            {item.tag && <span className="m4-tagd">{item.tag}</span>}
            <div className="m4-fmeta">
              {item.handle && <span className="m4-fmeta__h">{item.handle}</span>}
              <p>{item.caption}</p>
            </div>
          </div>

          {item.stats?.length > 0 && (
            <div className="m4-sb2">
              {item.stats.map((stat) => (
                <div key={stat.label}>
                  <span className="l">{stat.label}</span>
                  <span className="v" style={stat.accent ? { color: 'var(--amber-ink)' } : undefined}>{stat.value}</span>
                </div>
              ))}
            </div>
          )}

          <div className="m4-sec"><h2>why it worked</h2></div>
          {hasBeats ? (
            <div className="m4-card m4-beats">
              {item.beats.map((beat) => <Beat key={beat.ts} beat={beat} />)}
            </div>
          ) : (
            <div className="m4-card m4-breakdown">
              <div className="m4-irows">
                {(item.rows ?? []).map((row) => (
                  <span className="m4-irow" key={row.label}><span className="m4-itag">{row.label}</span><span>{row.text}</span></span>
                ))}
              </div>
            </div>
          )}

          <div className="m4-note">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round"><path d="M12 8.4v4.4" /><circle cx="12" cy="16.4" r=".9" fill="currentColor" /><circle cx="12" cy="12" r="8.4" /></svg>
            <span>This is the short version. The full second-by-second breakdown, the creators behind it and the words the comments repeat are what your own search is building right now.</span>
          </div>

          {others.length > 0 && (
            <>
              <div className="m4-sec"><h2>more we found for others</h2></div>
              <div className="m4-rail">
                {others.map((b) => (
                  <button type="button" key={b.id} className="m4-rail__t" onClick={() => onClose(b)}>
                    <RailThumb item={b} />
                    <p className="m4-ti">{b.caption}</p>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * The cold-free-user "while you wait" experience (M4 / M4b). A live view of the
 * scrape running server-side, wrapped in curated breakout examples so the wait
 * teaches what a breakout looks like. Opening one shows the M4b breakdown over
 * the top, with the search still running underneath.
 */
export default function RunningScreen({ searchId, initialSearch = null, examples = [], onBack, onDone }) {
  const [search, setSearch] = useState(initialSearch);
  const [unavailable, setUnavailable] = useState(!searchId);
  const [failed, setFailed] = useState(null);
  const [completed, setCompleted] = useState(null);
  const [step, setStep] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [openBreakout, setOpenBreakout] = useState(null);
  const finished = useRef(false);
  const polling = useRef(false);
  const completionTimer = useRef(null);

  const subject = search?.name || 'your';
  // Real breakouts from the corpus when the server has them; the curated set is
  // only a fallback (e.g. an empty corpus in local dev).
  const source = Array.isArray(examples) && examples.length > 0 ? examples : EXAMPLE_BREAKOUTS;
  const [featured, ...rail] = source;

  useEffect(() => {
    if (!searchId) return undefined;

    let timer;
    let cancelled = false;

    const poll = async () => {
      if (cancelled || finished.current || polling.current) return;

      polling.current = true;

      try {
        const payload = await fetchNotifications([searchId]);
        const found = payload?.searches?.[0];

        if (!found) {
          finished.current = true;
          setSearch(null);
          setUnavailable(true);
          return;
        }

        setSearch(found);

        if (found.status === 'done') {
          finished.current = true;
          updateTracked(searchId, { completedPromptShown: true, name: found.name });
          setCompleted(found);
          completionTimer.current = window.setTimeout(() => onDone?.(found), 900);
          return;
        }

        if (found.status === 'failed') {
          finished.current = true;
          setFailed(found.latest_run_error || 'The scrape did not finish. Try running the search again.');
          return;
        }

        if (found.status !== 'scraping') {
          finished.current = true;
          setSearch(null);
          setUnavailable(true);
          return;
        }
      } catch {
        /* transient — the next tick will retry */
      } finally {
        polling.current = false;
      }

      timer = window.setTimeout(poll, POLL_MS);
    };

    const onVisibility = () => {
      if (document.visibilityState === 'visible' && !finished.current) {
        window.clearTimeout(timer);
        poll();
      }
    };

    poll();
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      window.clearTimeout(completionTimer.current);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [searchId, onDone]);

  // Cosmetic step progression so the wait reads as movement, holding on the
  // "Analyzing" pass until the run actually completes.
  useEffect(() => {
    if (failed || unavailable || search?.status !== 'scraping') return undefined;
    const timer = window.setInterval(() => setStep((s) => Math.min(s + 1, 2)), 9000);
    return () => window.clearInterval(timer);
  }, [failed, unavailable, search?.status]);

  // "Started N seconds ago" — count up from mount.
  useEffect(() => {
    if (failed || unavailable || completed) return undefined;
    const timer = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(timer);
  }, [failed, unavailable, completed]);

  /* ------------------------------- states ------------------------------- */
  if (unavailable || !search) {
    return (
      <>
        <style>{scopedCss}</style>
        <div className="m4-card m4-state">
          <h1>{unavailable ? 'No search available' : 'Checking search status'}</h1>
          <p>{unavailable ? 'Start a search to discover breakout videos for your brand or product.' : 'Confirming the latest status of your search.'}</p>
          {unavailable && <button onClick={onBack} className="m4-btn m4-btn--y">Start a search</button>}
        </div>
      </>
    );
  }

  if (failed) {
    return (
      <>
        <style>{scopedCss}</style>
        <div className="m4-card m4-state">
          <span className="m4-badbadge">Search failed</span>
          <h1>That run didn’t finish</h1>
          <p>{failed}</p>
          <button onClick={onBack} className="m4-btn m4-btn--ghost">Edit keywords and retry</button>
        </div>
      </>
    );
  }

  if (completed) {
    return (
      <>
        <style>{scopedCss}</style>
        <div className="m4-card m4-state">
          <span className="m4-okbadge"><i />Search complete</span>
          <h1>Your results are ready</h1>
          <p>Videos, winner analysis, and search insights are ready. Opening your results now.</p>
        </div>
      </>
    );
  }

  /* -------------------------------- M4 -------------------------------- */
  return (
    <>
      <style>{scopedCss}</style>

      <div className="m4-head">
        <span className="m4-spin" aria-hidden>
          <svg viewBox="0 0 108 108">
            <defs>
              <linearGradient id="m4-g" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#ffd84d" />
                <stop offset="1" stopColor="#ff9f1c" />
              </linearGradient>
            </defs>
            <circle className="m4-spin__tr" cx="54" cy="54" r="46" />
            <circle className="m4-spin__arc" cx="54" cy="54" r="46" />
          </svg>
          <i />
        </span>
        <h1>Let us do our thing&hellip;</h1>
        <p className="m4-lede">1 to 5 minutes, mostly around 2 minutes.</p>
      </div>

      <div className="m4-card m4-proc">
        <div className="m4-proc__top">
          <span className="m4-live"><i />Live</span>
          <span className="m4-meta">{elapsedLabel(seconds)}</span>
        </div>
        <div className="m4-sweep" aria-hidden><i /></div>
        <div className="m4-steps">
          {STEPS.map((label, i) => {
            const state = i < step ? 'done' : i === step ? 'now' : 'wait';
            return (
              <span key={label} className={`m4-tick m4-tick--${state}`}>
                <span className="m4-tick__d">{state === 'wait' ? '•' : Check}</span>
                {label}
                {state === 'now' && (
                  <span className="m4-tick__c" aria-hidden>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><path d="M12 3.4a8.6 8.6 0 1 0 8.6 8.6" /></svg>
                  </span>
                )}
              </span>
            );
          })}
        </div>
      </div>

      <div className="m4-sec"><h2>while we’re working</h2><span className="m4-stag">Brand Beacon</span></div>
      <p className="m4-desc">Check out these breakout videos we found. Look at the hooks, formatting, and why we believe it worked.</p>

      <button type="button" className="m4-fcard" onClick={() => setOpenBreakout(featured)}>
        <CardArt item={featured} />
        <span className="m4-veil" />
        {featured.score && <span className="m4-oscore"><b>{featured.score}</b><span>outlier</span></span>}
        {featured.tag && <span className="m4-tagd">{featured.tag}</span>}
        <div className="m4-fmeta">
          {featured.handle && <span className="m4-fmeta__h">{featured.handle}</span>}
          <p>{featured.caption}</p>
        </div>
      </button>

      <div className="m4-card m4-breakdown">
        {featured.summary && <span className="m4-breakdown__sum">{featured.summary}</span>}
        <div className="m4-irows">
          {(featured.rows ?? []).map((row) => (
            <span className="m4-irow" key={row.label}><span className="m4-itag">{row.label}</span><span>{row.text}</span></span>
          ))}
        </div>
        <button type="button" className="m4-btn m4-btn--ghost" onClick={() => setOpenBreakout(featured)}>Read the short breakdown</button>
      </div>

      <div className="m4-rail">
        {rail.map((b) => (
          <button type="button" key={b.id} className="m4-rail__t" onClick={() => setOpenBreakout(b)}>
            <RailThumb item={b} />
            <p className="m4-ti">{b.caption}</p>
          </button>
        ))}
      </div>

      <div className="m4-note m4-note--amber">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8.6a6 6 0 1 0-12 0c0 6-2.2 7.4-2.2 7.4h16.4S18 14.6 18 8.6z" /><path d="M13.7 19.6a2 2 0 0 1-3.4 0" /></svg>
        <span>Close the tab if you like. We’ll send a browser notification and an email the moment it lands.</span>
      </div>

      {openBreakout && (
        <BreakoutModal
          item={openBreakout}
          subject={subject}
          step={step}
          others={source.filter((b) => b.id !== openBreakout.id).slice(0, 3)}
          onClose={(next) => setOpenBreakout(next && next.id ? next : null)}
        />
      )}
    </>
  );
}

const scopedCss = `
.m4-card{border:1px solid var(--line,#e7e5df);border-radius:16px;background:var(--white,#fff);box-shadow:0 1px 2px rgba(20,15,0,.04)}
.m4-head{display:flex;flex-direction:column;align-items:center;gap:14px;text-align:center;padding:6px 0 4px;margin-bottom:18px}
.m4-head h1{margin:0;font-size:1.5rem;line-height:1.2;font-weight:800;letter-spacing:-.04em;color:var(--ink,#0b0b0b)}
.m4-lede{margin:0;font-size:.9rem;line-height:1.5;color:var(--muted,#33312c)}
.m4-spin{position:relative;width:108px;height:108px;flex:none;display:grid;place-items:center}
.m4-spin svg{position:absolute;inset:0;width:100%;height:100%;animation:m4-turn 1.15s linear infinite}
.m4-spin__tr{fill:none;stroke:#f1efe9;stroke-width:9}
.m4-spin__arc{fill:none;stroke:url(#m4-g);stroke-width:9;stroke-linecap:round;stroke-dasharray:108 400}
.m4-spin>i{position:absolute;inset:-10px;border-radius:50%;border:2px solid rgba(255,198,41,.5);animation:m4-ring 2.4s ease-out infinite}
@keyframes m4-turn{to{transform:rotate(360deg)}}
@keyframes m4-ring{0%{transform:scale(.9);opacity:1}100%{transform:scale(1.12);opacity:0}}
@keyframes m4-sweepmove{0%{left:-40%}100%{left:100%}}
@keyframes m4-pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.24);opacity:.6}}
@keyframes m4-blink{0%,100%{opacity:1}50%{opacity:.25}}

.m4-proc{padding:15px 16px 16px;display:flex;flex-direction:column;gap:13px;margin-bottom:16px}
.m4-proc__top{display:flex;align-items:center;gap:9px}
.m4-live{display:inline-flex;align-items:center;gap:6px;padding:3px 9px;border-radius:999px;background:#fdf0ef;color:#a3231b;font-size:.63rem;font-weight:800;text-transform:uppercase;letter-spacing:.08em}
.m4-live i{width:6px;height:6px;border-radius:50%;background:#d13a2c;animation:m4-blink 1.3s ease infinite}
.m4-meta{margin-left:auto;font-weight:600;font-size:.78rem;color:var(--muted,#33312c)}
.m4-sweep{position:relative;height:5px;border-radius:999px;background:#f1efe9;overflow:hidden}
.m4-sweep i{position:absolute;top:0;bottom:0;width:38%;border-radius:999px;background:linear-gradient(90deg,#ffd84d,#ff9f1c);animation:m4-sweepmove 1.7s ease-in-out infinite}
.m4-steps{display:flex;flex-direction:column;gap:11px}
.m4-tick{display:flex;align-items:flex-start;gap:11px;font-size:.87rem;font-weight:500;color:#33312c;line-height:1.45}
.m4-tick__d{width:18px;height:18px;flex:none;margin-top:1px;display:grid;place-items:center;border-radius:50%;background:#edf7f0;color:#12703f;font-size:.7rem;line-height:1}
.m4-tick__d svg{width:9px;height:9px}
.m4-tick__c{margin-left:auto;flex:none;width:15px;height:15px;margin-top:2px;color:var(--amber-ink,#9a6b00)}
.m4-tick__c svg{width:15px;height:15px;animation:m4-turn .9s linear infinite}
.m4-tick--now{color:#0b0b0b;font-weight:700}
.m4-tick--now .m4-tick__d{background:var(--yellow,#ffc629);color:#0b0b0b;animation:m4-pulse 1.4s ease-in-out infinite}
.m4-tick--wait{color:#5c5a54}
.m4-tick--wait .m4-tick__d{background:#f1efe9;color:#f1efe9}

.m4-sec{display:flex;align-items:baseline;gap:9px;margin:6px 0 0}
.m4-sec h2{margin:0;display:flex;align-items:center;gap:8px;font-size:.98rem;font-weight:700;letter-spacing:-.03em;color:var(--ink,#0b0b0b)}
.m4-sec h2::before{content:'';width:3px;height:15px;flex:none;border-radius:2px;background:var(--yellow,#ffc629)}
.m4-stag{margin-left:auto;flex:none;display:inline-flex;align-items:center;min-height:21px;padding:0 8px;border-radius:6px;background:#f1efe9;color:#26241f;font-size:.6rem;font-weight:800;text-transform:uppercase;letter-spacing:.09em;white-space:nowrap}
.m4-desc{margin:8px 0 2px;color:#26241f;font-size:.83rem;line-height:1.55;font-weight:500}

.m4-fcard{position:relative;display:block;width:100%;height:300px;border:0;padding:0;border-radius:16px;overflow:hidden;background:#efece4;cursor:pointer;text-align:left;margin-top:14px}
.m4-fcard--tall{height:330px;margin-top:0}
.m4-art{position:absolute;inset:0}
.m4-art__img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
.m4-veil{position:absolute;inset:0;background:linear-gradient(rgba(0,0,0,.42) 0%,rgba(0,0,0,0) 24%,rgba(0,0,0,0) 40%,rgba(0,0,0,.86) 100%)}
.m4-oscore{position:absolute;top:11px;left:11px;display:inline-flex;align-items:center;gap:7px;min-height:28px;padding:0 11px;border-radius:999px;background:var(--yellow,#ffc629);color:#0b0b0b}
.m4-oscore b{font-family:ui-monospace,Menlo,monospace;font-size:.79rem;font-weight:700}
.m4-oscore span{font-size:.58rem;font-weight:800;text-transform:uppercase;letter-spacing:.07em}
.m4-tagd{position:absolute;top:11px;right:11px;display:inline-flex;align-items:center;min-height:26px;padding:0 10px;border-radius:999px;background:rgba(0,0,0,.55);backdrop-filter:blur(6px);color:#fff;font-size:.68rem;font-weight:700}
.m4-fmeta{position:absolute;left:0;right:14px;bottom:0;padding:0 14px 15px;display:flex;flex-direction:column;gap:6px}
.m4-fmeta__h{color:#fff;font-size:.88rem;font-weight:800}
.m4-fmeta p{margin:0;color:#f1efe9;font-size:.9rem;line-height:1.4}

.m4-breakdown{padding:14px 15px;display:flex;flex-direction:column;gap:11px;margin-top:14px}
.m4-breakdown__sum{font-size:.86rem;font-weight:600;color:#26241f;line-height:1.5}
.m4-irows{display:flex;flex-direction:column;gap:9px}
.m4-irow{display:flex;align-items:flex-start;gap:9px;font-size:.85rem;font-weight:600;line-height:1.5;color:var(--ink,#0b0b0b)}
.m4-itag{flex:none;width:64px;justify-content:center;display:inline-flex;align-items:center;padding:4px 10px;border-radius:7px;background:#fff8e6;color:#9a6b00;font-size:.75rem;font-weight:600}

.m4-rail{display:flex;gap:10px;overflow-x:auto;margin:14px -6px 0;padding:1px 6px 4px;scrollbar-width:thin}
.m4-rail__t{width:116px;flex:none;display:flex;flex-direction:column;gap:6px;border:0;background:transparent;padding:0;cursor:pointer;text-align:left}
.m4-vc{position:relative;display:block;width:100%;aspect-ratio:9/16;border-radius:12px;overflow:hidden;background:#f1efe9}
.m4-sc{position:absolute;left:8px;bottom:8px;display:inline-flex;align-items:center;padding:3px 8px;border-radius:6px;background:var(--yellow,#ffc629);color:#0b0b0b;font-family:ui-monospace,Menlo,monospace;font-size:.7rem;font-weight:700}
.m4-ti{margin:0;font-size:.75rem;font-weight:600;line-height:1.35;color:#33312c}

.m4-note{display:flex;align-items:flex-start;gap:10px;padding:13px 14px;border:1px solid var(--line,#e7e5df);border-radius:14px;background:var(--white,#fff);margin-top:14px;font-size:.8rem;font-weight:500;color:#26241f;line-height:1.5}
.m4-note svg{width:15px;height:15px;flex:none;margin-top:2px;color:#33312c}
.m4-note--amber{background:#fffaeb;border-color:rgba(255,198,41,.34)}
.m4-note--amber svg{color:#9a6b00}
.m4-note--amber span{color:#0b0b0b;font-weight:600}

.m4-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:38px;padding:0 16px;border-radius:10px;font-size:.83rem;font-weight:700;border:1px solid transparent;cursor:pointer;width:100%}
.m4-btn--ghost{background:var(--white,#fff);border-color:rgba(0,0,0,.09);color:#0b0b0b}
.m4-btn--ghost:hover{background:#faf9f6}
.m4-btn--y{background:var(--yellow,#ffc629);color:#1a1400;width:auto;padding:0 22px;min-height:44px;margin:6px auto 0}

.m4-state{padding:34px 22px;display:flex;flex-direction:column;align-items:center;text-align:center;gap:10px}
.m4-state h1{margin:0;font-size:1.3rem;font-weight:800;letter-spacing:-.03em;color:var(--ink,#0b0b0b)}
.m4-state p{margin:0;font-size:.88rem;color:var(--muted,#33312c);max-width:420px;line-height:1.5}
.m4-okbadge{display:inline-flex;align-items:center;gap:7px;padding:5px 12px;border-radius:999px;background:#e9f6ef;color:#1f7a4d;font-size:.78rem;font-weight:700}
.m4-okbadge i{width:7px;height:7px;border-radius:50%;background:currentColor}
.m4-badbadge{display:inline-flex;align-items:center;padding:5px 12px;border-radius:999px;background:#fbede6;color:#b0431b;font-size:.78rem;font-weight:700}

/* -------- M4b modal -------- */
.m4-modal{position:fixed;inset:0;z-index:120;display:flex;justify-content:center;align-items:flex-start;overflow:hidden}
.m4-modal__bg{position:absolute;inset:0;border:0;background:rgba(11,11,11,.5);backdrop-filter:blur(2px);cursor:pointer}
.m4-modal__panel{position:relative;z-index:1;width:min(560px,100%);max-height:100dvh;margin-top:0;display:flex;flex-direction:column;background:var(--paper,#faf9f6);border-radius:0 0 20px 20px;box-shadow:0 30px 80px -20px rgba(0,0,0,.5)}
.m4-modal__scroll{flex:1;min-height:0;overflow-y:auto;padding:15px 16px 22px;display:flex;flex-direction:column;gap:15px}
.m4-modal__scroll>*{flex:0 0 auto}
.m4-runbar{position:sticky;top:0;z-index:2;display:flex;align-items:center;gap:11px;padding:10px 16px;background:#0b0b0b;color:#fff}
.m4-runbar__mini{width:26px;height:26px;flex:none;display:grid;place-items:center}
.m4-runbar__mini svg{width:24px;height:24px;animation:m4-turn 1.05s linear infinite}
.m4-runbar__bd{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:1px}
.m4-runbar__bd strong{font-size:.82rem;font-weight:700;letter-spacing:-.02em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.m4-runbar__bd span{color:#d6d2c6;font-size:.71rem;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.m4-runbar__go{flex:none;display:inline-flex;align-items:center;min-height:30px;padding:0 12px;border-radius:999px;background:var(--yellow,#ffc629);color:#0b0b0b;font-size:.75rem;font-weight:700;white-space:nowrap;border:0;cursor:pointer}
.m4-sb2{display:grid;grid-template-columns:1fr 1fr;background:var(--white,#fff);border:1px solid rgba(0,0,0,.06);border-radius:14px;overflow:hidden}
.m4-sb2>div{padding:12px 14px 13px;display:flex;flex-direction:column;gap:6px;border-top:1px solid rgba(0,0,0,.06);border-left:1px solid rgba(0,0,0,.06)}
.m4-sb2>div:nth-child(-n+2){border-top:0}
.m4-sb2>div:nth-child(2n+1){border-left:0}
.m4-sb2 .l{color:#33312c;font-size:.62rem;font-weight:600;text-transform:uppercase;letter-spacing:.08em;line-height:1.3}
.m4-sb2 .v{font-family:ui-monospace,Menlo,monospace;font-size:1.24rem;font-weight:700;letter-spacing:-.03em;line-height:1;color:var(--ink,#0b0b0b)}
.m4-beats{padding:6px 16px 8px}
.m4-beat{display:flex;gap:13px;padding:11px 0;border-bottom:1px solid var(--line,#e7e5df)}
.m4-beat:last-child{border-bottom:0}
.m4-beat__ts{flex:none;font-family:ui-monospace,Menlo,monospace;font-size:.75rem;font-weight:700;color:var(--amber-ink,#9a6b00);padding-top:1px}
.m4-beat p{margin:0;font-size:.85rem;font-weight:500;line-height:1.5;color:#26241f}
.m4-beat p b{font-weight:700;color:var(--ink,#0b0b0b)}

@media (max-width:560px){
.m4-head h1{font-size:1.32rem}
.m4-spin{width:96px;height:96px}
.m4-fcard{height:280px}
.m4-modal__panel{width:100%}
}
@media (prefers-reduced-motion:reduce){
.m4-spin svg,.m4-spin>i,.m4-sweep i,.m4-tick--now .m4-tick__d,.m4-tick__c svg,.m4-live i,.m4-runbar__mini svg{animation:none}
}
`;
