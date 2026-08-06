import { useState } from 'react';
import { Mascot, Arrow, Play, Trend } from '../components/Icons.jsx';
import CountUp from '../components/CountUp.jsx';
import Reveal from '../components/Reveal.jsx';
import { SEARCH_TYPES, STATS } from '../data/dummy.js';

const TYPE_KEYS = ['brand', 'competitor', 'product'];

export default function Hero({ onStart }) {
  const [type, setType] = useState('brand');
  const [value, setValue] = useState('');
  const config = SEARCH_TYPES[type];

  const submit = (e) => {
    e.preventDefault();
    onStart(type, value);
  };

  return (
    <section id="top" className="relative isolate overflow-hidden pt-12 sm:pt-20 lg:pt-24">
      {/* backdrop: grid, then two soft light sources */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-grid mask-radial-fade absolute inset-0" />
        <div className="absolute top-[-18%] left-1/2 h-[560px] w-[900px] max-w-[140vw] -translate-x-1/2 rounded-full bg-accent/25 blur-[150px] dark:bg-accent/30" />
        <div className="animate-float absolute top-[24%] right-[6%] h-[260px] w-[260px] rounded-full bg-hot/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[4%] h-[240px] w-[240px] rounded-full bg-accent-glow/15 blur-[130px]" />
      </div>

      <div className="relative mx-auto max-w-page px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <span className="ring-gradient inline-flex items-center gap-2.5 rounded-full bg-white/60 px-4 py-2 text-[12.5px] font-semibold backdrop-blur-xl dark:bg-white/[.05]">
              <span className="relative flex h-2 w-2">
                <span className="animate-pulse-ring absolute inset-0 rounded-full bg-hot" />
                <span className="relative h-2 w-2 rounded-full bg-hot" />
              </span>
              TikTok social intelligence for brands
            </span>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="mt-7 font-display text-[38px] leading-[1.04] font-bold tracking-[-.035em] sm:text-[58px] lg:text-[72px]">
              Find the TikToks
              <br className="hidden sm:block" /> that are{' '}
              <span className="text-gradient">actually moving</span>
              <br className="hidden sm:block" /> your category
            </h1>
          </Reveal>

          <Reveal delay={140}>
            <p className="mx-auto mt-6 max-w-xl text-[15.5px] leading-relaxed muted sm:text-[17px]">
              Point VVF at your brand, a competitor, or a single product. We scan TikTok and hand back the viral
              videos, the creators behind them, and what changed since last week.
            </p>
          </Reveal>
        </div>

        {/* search widget = step one of the flow */}
        <Reveal delay={200} className="mx-auto mt-11 max-w-2xl">
          <div className="ring-gradient rounded-[26px] bg-white/70 p-1.5 shadow-[0_40px_100px_-50px_rgba(20,20,50,.5)] backdrop-blur-2xl dark:bg-white/[.045] dark:shadow-[0_50px_120px_-60px_rgba(0,0,0,1)]">
            <div className="rounded-[20px] bg-white/85 p-4 sm:p-5 dark:bg-black/25">
              <div className="mb-5 flex items-start gap-3 text-left">
                <Mascot className="animate-float h-12 w-12 shrink-0 sm:h-14 sm:w-14" />
                <div className="relative rounded-2xl bg-ink px-4 py-3 text-[13.5px] leading-relaxed text-white shadow-lg dark:bg-white dark:text-ink">
                  <span
                    aria-hidden
                    className="absolute top-4 -left-1.5 h-3 w-3 rotate-45 rounded-sm bg-ink dark:bg-white"
                  />
                  I scan TikTok for your brand, products, and competitors, and pull the recent viral videos.
                </div>
              </div>

              <p className="mb-2.5 text-left font-display text-[15px] font-semibold">What do you want to research?</p>

              <div className="flex gap-1.5 rounded-2xl bg-black/[.045] p-1.5 dark:bg-white/[.05]">
                {TYPE_KEYS.map((k) => (
                  <button
                    key={k}
                    onClick={() => setType(k)}
                    className={`flex-1 rounded-xl px-2 py-2.5 text-[13px] font-semibold transition-all duration-300 sm:text-[13.5px] ${
                      type === k
                        ? 'bg-white text-ink shadow-[0_2px_10px_-2px_rgba(16,18,32,.18)] dark:bg-ink-700 dark:text-white'
                        : 'muted hover:text-ink dark:hover:text-white'
                    }`}
                  >
                    {SEARCH_TYPES[k].label}
                  </button>
                ))}
              </div>

              <form onSubmit={submit} className="mt-3 flex flex-col gap-2 sm:flex-row">
                <input
                  id="search-subject"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={config.placeholder}
                  className="field h-[54px] flex-1"
                />
                <button type="submit" className="btn-accent h-[54px] px-6 text-[15px]">
                  Scout viral videos <Arrow />
                </button>
              </form>

              <p className="mt-3.5 text-left text-[12.5px] faint">
                Try{' '}
                <button
                  type="button"
                  onClick={() => setValue(config.sample)}
                  className="font-semibold text-accent underline-offset-4 hover:underline dark:text-accent-glow"
                >
                  “{config.sample}”
                </button>{' '}
                · one subject per search keeps each result tight.
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-6">
            <button className="group inline-flex items-center gap-2.5 text-[13.5px] font-semibold muted transition hover:text-accent dark:hover:text-accent-glow">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-black/[.09] transition group-hover:border-accent/50 group-hover:bg-accent/10 dark:border-white/15">
                <Play className="h-3 w-3" />
              </span>
              Watch 2 min demo
            </button>
            <span className="text-[13px] faint">1 free search · no credit card</span>
          </div>
        </Reveal>

        {/* stats */}
        <dl className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-black/[.06] bg-black/[.06] sm:mt-20 sm:grid-cols-4 dark:border-white/[.08] dark:bg-white/[.08]">
          {STATS.map((s, i) => (
            <Reveal
              key={s.label}
              delay={i * 70}
              className="bg-canvas px-4 py-6 text-center dark:bg-canvas-dark"
            >
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
