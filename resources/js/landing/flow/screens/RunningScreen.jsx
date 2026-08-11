import { useEffect, useRef, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { Google, Arrow, Check } from '../../components/Icons.jsx';
import { fetchNotifications, updateTracked } from '../api.js';

const POLL_MS = 10000;

const STAGES = [
  'Starting the scrape',
  'Pulling videos from TikTok',
  'Filtering against your keywords',
  'Ranking by outlier score',
];

export default function RunningScreen({ searchId, onBack, onDone }) {
  // The capture card exists to get an anonymous visitor an account before the
  // run finishes. Someone already signed in has nothing to claim, so it is
  // theirs by default and the card would just be asking them to log in twice.
  const { auth = {} } = usePage().props;
  const signedIn = auth.signedIn ?? Boolean(auth.user);

  const [search, setSearch] = useState(null);
  const [failed, setFailed] = useState(null);
  const [email, setEmail] = useState('');
  const [emailSaved, setEmailSaved] = useState(false);
  const [stage, setStage] = useState(0);
  const finished = useRef(false);

  // Poll only while the tab is visible — a backgrounded tab does not need to
  // keep hitting the endpoint, and the run continues server-side regardless.
  useEffect(() => {
    if (!searchId) return undefined;

    let timer;
    let cancelled = false;

    const poll = async () => {
      if (cancelled || finished.current) return;

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

  // Purely cosmetic progression so the wait reads as movement, not a hang.
  useEffect(() => {
    if (failed) return undefined;
    const timer = window.setInterval(() => setStage((s) => Math.min(s + 1, STAGES.length - 1)), 12000);
    return () => window.clearInterval(timer);
  }, [failed]);

  return (
    <div className="animate-fade-up">
      <button onClick={onBack} className="text-[13px] font-semibold muted transition hover:text-accent">
        ← Back to keywords
      </button>

      <div className="mx-auto mt-8 max-w-md text-center">
        {failed ? (
          <>
            <span className="inline-flex items-center gap-2.5 rounded-full border border-hot/25 bg-hot/10 px-4 py-2 text-[12.5px] font-semibold text-hot">
              Search failed
            </span>
            <h1 className="mt-7 font-display text-[26px] leading-tight font-bold tracking-[-.02em] sm:text-[32px]">
              That run didn't finish
            </h1>
            <p className="mt-3 text-[14.5px] muted">{failed}</p>
            <button onClick={onBack} className="btn-ghost mx-auto mt-7 h-[52px] px-6 text-[15px]">
              Edit keywords and retry
            </button>
          </>
        ) : (
          <>
            <span className="inline-flex items-center gap-2.5 rounded-full border border-accent/25 bg-accent/10 px-4 py-2 text-[12.5px] font-semibold text-accent dark:text-accent-glow">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
              Search running · 1 to 20 min
            </span>

            <h1 className="mt-7 font-display text-[26px] leading-tight font-bold tracking-[-.02em] sm:text-[32px]">
              {search?.name ? `Scouting “${search.name}”` : 'Scouting your niche'}
            </h1>
            <p className="mt-3 text-[14.5px] muted">
              We'll show the results right here the moment they're ready.
            </p>

            <ol className="mx-auto mt-8 max-w-sm space-y-2.5 text-left">
              {STAGES.map((label, i) => {
                const state = i < stage ? 'done' : i === stage ? 'active' : 'pending';
                return (
                  <li
                    key={label}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-[13.5px] transition-all duration-500 ${
                      state === 'pending'
                        ? 'border-black/[.06] faint dark:border-white/[.07]'
                        : 'border-accent/25 bg-accent/[.06]'
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                        state === 'done'
                          ? 'bg-accent text-white'
                          : state === 'active'
                            ? 'border-2 border-accent border-t-transparent animate-spin'
                            : 'border border-black/15 dark:border-white/20'
                      }`}
                    >
                      {state === 'done' && <Check className="h-2.5 w-2.5" />}
                    </span>
                    {label}
                  </li>
                );
              })}
            </ol>

            {!signedIn && (
              <div className="ring-gradient mt-8 rounded-3xl bg-white/70 p-6 text-left backdrop-blur-2xl dark:bg-white/[.04]">
                <p className="mb-4 text-center font-display text-sm font-semibold">
                  Or have them emailed when they're done
                </p>

                <a
                  href="/auth/google"
                  className="flex h-[52px] w-full items-center justify-center gap-3 rounded-full bg-[#2f2a2a] px-5 text-[15px] font-semibold text-white shadow-[0_18px_40px_-26px_rgba(0,0,0,.55)] transition hover:opacity-95"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
                    <Google />
                  </span>
                  Continue with Google
                </a>

                <div className="my-4 flex items-center gap-3 text-xs faint">
                  <span className="h-px flex-1 bg-black/[.08] dark:bg-white/10" />
                  or
                  <span className="h-px flex-1 bg-black/[.08] dark:bg-white/10" />
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setEmailSaved(true);
                  }}
                  className="flex flex-col gap-2 sm:flex-row"
                >
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@brand.com"
                    className="field h-[52px] flex-1"
                  />
                  <button type="submit" className="btn-accent h-[52px] px-5 text-[15px]">
                    {emailSaved ? 'Saved' : 'Email me'} {!emailSaved && <Arrow />}
                  </button>
                </form>
              </div>
            )}

            <p className={`text-[12.5px] leading-relaxed faint ${signedIn ? 'mt-8' : 'mt-5'}`}>
              Safe to close this tab — the search keeps running and stays in Bookmark.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
