import { useEffect, useRef, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { Google, Arrow, Check, Search } from '../../components/Icons.jsx';
import { fetchNotifications, updateTracked } from '../api.js';

const POLL_MS = 10000;
const AUTO_RETURN_MS = 5000;

const STAGES = [
  'Starting the scrape',
  'Pulling videos from TikTok',
  'Filtering against your keywords',
  'Ranking by outlier score',
];

/**
 * The transitional loading state after a run is dispatched. Not a wizard step —
 * it has no stepper — just a live view of a scrape already running server-side.
 */
export default function RunningScreen({ searchId, onBack, onDone, onAutoReturn }) {
  // The capture card exists to get an anonymous visitor an account before the
  // run finishes. Someone already signed in has nothing to claim.
  const { auth = {} } = usePage().props;
  const signedIn = auth.signedIn ?? Boolean(auth.user);

  const [search, setSearch] = useState(null);
  const [failed, setFailed] = useState(null);
  const [email, setEmail] = useState('');
  const [emailSaved, setEmailSaved] = useState(false);
  const [stage, setStage] = useState(0);
  const finished = useRef(false);
  const polling = useRef(false);

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

        if (found) {
          setSearch(found);

          if (found.status === 'done') {
            finished.current = true;
            updateTracked(searchId, { completedPromptShown: true, name: found.name });
            onDone?.(found);
            return;
          }

          if (found.status === 'failed') {
            finished.current = true;
            setFailed(found.latest_run_error || 'The scrape did not finish. Try running the search again.');
            return;
          }
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
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [searchId, onDone]);

  useEffect(() => {
    if (!searchId || failed || finished.current) return undefined;

    const timer = window.setTimeout(() => {
      updateTracked(searchId, { runningPromptShown: true });
      onAutoReturn?.();
    }, AUTO_RETURN_MS);

    return () => window.clearTimeout(timer);
  }, [failed, onAutoReturn, searchId]);

  // Purely cosmetic progression so the wait reads as movement, not a hang.
  useEffect(() => {
    if (failed) return undefined;
    const timer = window.setInterval(() => setStage((s) => Math.min(s + 1, STAGES.length - 1)), 12000);
    return () => window.clearInterval(timer);
  }, [failed]);

  if (failed) {
    return (
      <div className="card">
        <div className="run">
          <span className="pill pill--bad" style={{ margin: '0 auto' }}>
            <i />
            Search failed
          </span>
          <h1 style={{ marginTop: 20 }}>That run didn&rsquo;t finish</h1>
          <p className="muted" style={{ maxWidth: 420, margin: '12px auto 0' }}>{failed}</p>
          <button onClick={onBack} className="btn btn--g" style={{ margin: '24px auto 0' }}>
            Edit keywords and retry
          </button>
        </div>
      </div>
    );
  }

  const progress = ((stage + 1) / STAGES.length) * 100;

  return (
    <div className="card">
      <div className="run">
        <div className="run__d">
          <Search className="h-[26px] w-[26px]" />
        </div>

        <span className="pill pill--run" style={{ margin: '0 auto' }}>
          <i />
          Search running · 1 to 20 min
        </span>

        <h1 style={{ marginTop: 18 }}>{search?.name ? `Scouting “${search.name}”` : 'Scouting your niche'}</h1>
        <p className="muted" style={{ maxWidth: 420, margin: '12px auto 0' }}>
          We&rsquo;ll send you back to the dashboard in a few seconds while this keeps running.
        </p>

        <div className="run__s">
          {STAGES.map((label, i) => {
            const state = i < stage ? 'done' : i === stage ? 'now' : '';
            return (
              <div key={label} className={`stg ${state}`.trim()}>
                <span className="stg__d">{state === 'done' && <Check />}</span>
                {label}
              </div>
            );
          })}
        </div>

        <div className="runbar">
          <span style={{ width: `${progress}%` }} />
        </div>

        {!signedIn && (
          <div className="capture">
            <p style={{ textAlign: 'center', fontWeight: 700, fontSize: '.9rem', color: 'var(--ink)' }}>
              Or have them emailed when they&rsquo;re done
            </p>

            <a href="/auth/google" className="btn btn--k btn--w" style={{ marginTop: 14, height: 48 }}>
              <span className="gic">
                <Google />
              </span>
              Continue with Google
            </a>

            <div className="divid">or</div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setEmailSaved(true);
              }}
              style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@brand.com"
                className="fld"
                style={{ flex: 1, minWidth: 180 }}
              />
              <button type="submit" className="btn btn--y">
                {emailSaved ? 'Saved' : 'Email me'} {!emailSaved && <Arrow />}
              </button>
            </form>
          </div>
        )}

        <p className="faint" style={{ fontSize: '.8rem', marginTop: signedIn ? 24 : 18 }}>
          Safe to close this tab — the search keeps running and stays in Bookmarks.
        </p>
      </div>
    </div>
  );
}
