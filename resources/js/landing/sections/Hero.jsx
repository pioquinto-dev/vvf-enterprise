import { useState } from 'react';
import { Mascot, Arrow, Trend } from '../components/Icons.jsx';
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
              Enter your brand, a competitor or single product; then we will scan TikTok and return the most viral outlier videos, the creators behind them and the reason they went viral
            </p>
          </Reveal>
        </div>

        <Reveal delay={200} className="mx-auto mt-11 max-w-2xl">
          <div className="ring-gradient rounded-[26px] bg-white/70 p-1.5 shadow-[0_40px_100px_-50px_rgba(20,20,50,.5)] backdrop-blur-2xl dark:bg-[rgba(110,88,200,.14)] dark:shadow-[0_50px_120px_-60px_rgba(0,0,0,1)]">
            <div className="rounded-[20px] bg-white/85 p-4 sm:p-5 dark:bg-[linear-gradient(180deg,rgba(22,20,36,.92),rgba(12,11,20,.96))]">
              <div className="mb-5 flex items-start gap-3.5 text-left">
                <div className="pt-1">
                  <Mascot className="animate-float h-12 w-12 shrink-0 sm:h-14 sm:w-14" />
                </div>
                <div className="relative rounded-[24px] border border-[#e8e3f6] bg-[linear-gradient(180deg,rgba(255,255,255,.96),rgba(245,242,252,.94))] px-4 py-3 text-[13.5px] leading-relaxed text-[#2e3148] shadow-[0_18px_40px_-28px_rgba(104,93,151,.38)] dark:border-[#5d4f86] dark:bg-[linear-gradient(180deg,rgba(244,240,255,.94),rgba(221,214,244,.9))] dark:text-[#2d2740] dark:shadow-[0_18px_40px_-26px_rgba(0,0,0,.5)]">
                  <span
                    aria-hidden
                    className="absolute top-4 -left-1.5 h-3 w-3 rotate-45 border-l border-b border-[#e8e3f6] bg-[#f7f4fc] dark:border-[#5d4f86] dark:bg-[#ece5fb]"
                  />
                  I scan TikTok for your brand, products, and competitors, and pull the recent viral videos.
                </div>
              </div>

              <div className="mb-2.5 flex items-center justify-between gap-3">
                <p className="text-left font-display text-[15px] font-semibold">What do you want to research?</p>
                <span className="rounded-full border border-accent/15 bg-accent/8 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-accent dark:border-accent-glow/20 dark:bg-accent-glow/10 dark:text-accent-glow">
                  Search
                </span>
              </div>

              <div className="flex gap-2 rounded-[18px] border border-[#d9d1ef] bg-[linear-gradient(180deg,#f4f0fb,#ece7f7)] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,.9),0_10px_24px_-20px_rgba(106,84,173,.35)] dark:border-[#4b4269] dark:bg-[linear-gradient(180deg,rgba(31,29,43,.98),rgba(24,22,35,.98))] dark:shadow-[inset_0_1px_0_rgba(255,255,255,.06),0_10px_24px_-20px_rgba(0,0,0,.55)]">
                {TYPE_KEYS.map((k) => (
                  <button
                    key={k}
                    onClick={() => setType(k)}
                    className={`flex-1 rounded-[14px] border px-3 py-2.5 text-[13px] font-semibold transition-all duration-300 sm:text-[13.5px] ${
                      type === k
                        ? 'border-[#cfc2f2] bg-[linear-gradient(180deg,#ffffff,#f7f2ff)] text-[#221b39] shadow-[0_12px_28px_-18px_rgba(94,74,163,.42),inset_0_1px_0_rgba(255,255,255,.95)] dark:border-[#8b7bd0] dark:bg-[linear-gradient(180deg,rgba(91,79,146,.98),rgba(74,64,121,.98))] dark:text-white dark:shadow-[0_12px_26px_-18px_rgba(0,0,0,.55),inset_0_1px_0_rgba(255,255,255,.08)]'
                        : 'border-transparent bg-white/18 text-[#5d6177] hover:border-[#ddd4f6] hover:bg-white/55 hover:text-[#2e3148] dark:bg-transparent dark:text-white/68 dark:hover:border-[#4f456f] dark:hover:bg-white/[.04] dark:hover:text-white'
                    }`}
                    aria-pressed={type === k}
                  >
                    {SEARCH_TYPES[k].label}
                  </button>
                ))}
              </div>

              <form onSubmit={submit} className="mt-3 flex flex-col gap-2 sm:flex-row">
                <label className="group flex h-[54px] flex-1 items-center gap-3 rounded-[18px] border border-black/8 bg-white px-4 shadow-[0_16px_40px_-28px_rgba(76,56,255,.55)] transition-all duration-300 focus-within:-translate-y-0.5 focus-within:border-accent/35 focus-within:shadow-[0_22px_50px_-28px_rgba(76,56,255,.6)] dark:border-[#3a3550] dark:bg-[#1f1d2b] dark:focus-within:border-accent-glow/35">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(123,92,255,.16),rgba(255,83,143,.12))] text-accent dark:bg-[linear-gradient(135deg,rgba(123,92,255,.18),rgba(255,83,143,.1))] dark:text-accent-glow">
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden
                      className="h-4.5 w-4.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="11" cy="11" r="7" />
                      <path d="m20 20-3.5-3.5" />
                    </svg>
                  </div>

                  <div className="min-w-0 flex-1 text-left">
                    <input
                      id="search-subject"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder={config.placeholder}
                      className="w-full border-0 bg-transparent p-0 text-[14px] font-medium text-ink placeholder:text-black/35 focus:outline-none focus:ring-0 dark:text-white dark:placeholder:text-white/38"
                    />
                  </div>
                </label>
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
                  "{config.sample}"
                </button>{' '}
                - one subject per search keeps each result tight.
              </p>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-center">
            <span className="text-[13px] faint">1 free search - no credit card</span>
          </div>
        </Reveal>

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
