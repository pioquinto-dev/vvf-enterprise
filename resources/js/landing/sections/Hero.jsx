import { useRef, useState } from 'react';
import { Arrow, Google, Lock, Search, Store, Target, Trend } from '../components/Icons.jsx';
import CountUp from '../components/CountUp.jsx';
import Reveal from '../components/Reveal.jsx';
import { STATS } from '../data/dummy.js';

/**
 * The hero is one job: pick a subject and go. Everything else on this page is
 * persuasion for people who did not do that yet.
 *
 * Modes sit above the box rather than inside it so the input stays the largest
 * thing on screen, and the sample is a hint under the field — one tap fills it,
 * nothing runs until the visitor presses the button.
 */

const MODES = [
  {
    key: 'brand',
    label: 'Your brand',
    icon: Store,
    prompt: 'Which brand do you want to research?',
    sample: 'rhode skin',
  },
  {
    key: 'competitor',
    label: 'A competitor',
    icon: Target,
    prompt: 'Which competitor should we watch?',
    sample: 'skims',
  },
  {
    key: 'product',
    label: 'A product',
    icon: Search,
    prompt: 'Which product do you want to track?',
    sample: 'lip oil',
    locked: true,
  },
];

export default function Hero({ onStart }) {
  const [type, setType] = useState('brand');
  const [value, setValue] = useState('');
  const inputRef = useRef(null);

  const mode = MODES.find((m) => m.key === type) ?? MODES[0];
  const query = value.trim().replace(/\s+/g, ' ');

  const submit = (e) => {
    e?.preventDefault();
    if (!query) {
      inputRef.current?.focus();
      return;
    }
    onStart(type, query);
  };

  return (
    <section id="top" className="relative isolate overflow-hidden pt-12 sm:pt-20 lg:pt-24">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-grid mask-radial-fade absolute inset-0" />
        <div className="absolute top-[-18%] left-1/2 h-[560px] w-[900px] max-w-[140vw] -translate-x-1/2 rounded-full bg-accent/25 blur-[150px] dark:bg-accent/30" />
        <div className="animate-float absolute top-[24%] right-[6%] h-[260px] w-[260px] rounded-full bg-hot/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[4%] h-[240px] w-[240px] rounded-full bg-accent-glow/15 blur-[130px]" />
      </div>

      <div className="relative mx-auto max-w-page px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal delay={80}>
            <h1 className="mt-7 font-display text-[38px] leading-[1.04] font-bold tracking-[-.035em] sm:text-[58px] lg:text-[72px]">
              TikTok Brand and Social Media
              <span className="text-gradient"> Intelligence Tool</span>
            </h1>
          </Reveal>

          <Reveal delay={140}>
            <p className="mx-auto mt-6 max-w-xl text-[15.5px] leading-relaxed muted sm:text-[17px]">
              Enter your brand, a competitor or single product; then we will scan TikTok and return the most viral
              outlier videos, the creators behind them and the reason they went viral
            </p>
          </Reveal>
        </div>

        <Reveal delay={200} className="mx-auto mt-10 max-w-2xl">
          {/* mode tabs */}
          <div role="tablist" aria-label="What to research" className="flex flex-wrap items-center justify-center gap-1.5">
            {MODES.map(({ key, label, icon: Icon, locked }) => {
              const active = key === type;

              return (
                <button
                  key={key}
                  role="tab"
                  type="button"
                  aria-selected={active}
                  disabled={locked}
                  title={locked ? 'Product searches are coming soon' : undefined}
                  onClick={() => !locked && setType(key)}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[13.5px] font-semibold transition-all duration-300 ${
                    locked
                      ? 'cursor-not-allowed border-transparent faint'
                      : active
                        ? 'border-black/[.08] bg-white text-ink shadow-[0_10px_30px_-20px_rgba(20,20,50,.6)] dark:border-white/[.14] dark:bg-white/[.08] dark:text-white'
                        : 'border-transparent muted hover:bg-black/[.04] hover:text-ink dark:hover:bg-white/[.06] dark:hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                  {locked && <Lock className="h-3 w-3 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* the box */}
          <form
            onSubmit={submit}
            className="mt-4 rounded-[24px] border border-accent/30 bg-white/80 p-5 shadow-[0_40px_100px_-50px_rgba(20,20,50,.5),0_0_0_4px_rgba(109,75,255,.06)] backdrop-blur-2xl sm:p-6 dark:border-accent-glow/30 dark:bg-[rgba(18,17,28,.75)] dark:shadow-[0_50px_120px_-60px_rgba(0,0,0,1),0_0_0_4px_rgba(123,92,255,.08)]"
          >
            <textarea
              ref={inputRef}
              /* Secondary CTAs elsewhere on the page focus this by id. */
              id="search-subject"
              rows={2}
              value={value}
              maxLength={80}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) submit(e);
              }}
              placeholder={mode.prompt}
              aria-label={mode.prompt}
              className="w-full resize-none border-0 bg-transparent p-0 font-display text-[18px] leading-snug font-semibold tracking-[-.01em] text-ink placeholder:text-black/30 focus:ring-0 focus:outline-none sm:text-[20px] dark:text-white dark:placeholder:text-white/30"
            />

            <div className="mt-5 flex items-end justify-between gap-4">
              <p className="text-left text-[12.5px] faint">
                Try{' '}
                <button
                  type="button"
                  onClick={() => {
                    setValue(mode.sample);
                    inputRef.current?.focus();
                  }}
                  className="font-semibold text-accent underline-offset-4 hover:underline dark:text-accent-glow"
                >
                  “{mode.sample}”
                </button>
                <span className="mt-1 block">One subject per search keeps each result tight.</span>
              </p>

              <button type="submit" className="btn-accent h-11 shrink-0 px-5 text-[14.5px]">
                Find outliers <Arrow />
              </button>
            </div>
          </form>

          {/* secondary calls to action */}
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="/auth/google"
              className="btn-accent h-[52px] w-full justify-center px-6 text-[15px] sm:w-auto"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white">
                <Google />
              </span>
              Get started free <Arrow />
            </a>

            <a href="#how" className="btn-ghost h-[52px] w-full justify-center px-6 text-[15px] sm:w-auto">
              See how it works
            </a>
          </div>

          <p className="mt-4 text-center text-[13px] faint">1 free search - no credit card</p>
        </Reveal>

        <dl className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-black/[.06] bg-black/[.06] sm:mt-20 sm:grid-cols-4 dark:border-white/[.08] dark:bg-white/[.08]">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 70} className="bg-canvas px-4 py-6 text-center dark:bg-canvas-dark">
              <dt className="font-display text-[26px] font-bold tracking-tight sm:text-[32px]">
                <CountUp value={s.value} />
              </dt>
              <dd className="mt-1.5 flex items-center justify-center gap-1.5 text-[12.5px] faint">
                <Trend className="h-2.5 w-2.5 text-accent dark:text-accent-glow" />
                {s.label}
              </dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
