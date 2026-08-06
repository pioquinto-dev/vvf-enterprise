import { useState } from 'react';
import { FEATURES, RESULT_VIDEOS } from '../data/dummy.js';
import { Check, Arrow, Trend, Play } from '../components/Icons.jsx';
import Reveal from '../components/Reveal.jsx';

function Preview({ feature }) {
  const videos = RESULT_VIDEOS.slice(0, 3);

  return (
    <div className="ring-gradient animate-fade-up relative overflow-hidden rounded-3xl bg-white/70 p-5 backdrop-blur-2xl sm:p-6 dark:bg-white/[.04]">
      <div
        aria-hidden
        className={`pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-linear-to-br ${feature.accent} opacity-30 blur-3xl`}
      />

      <div className="relative flex items-center justify-between">
        <span className="rounded-lg border border-black/[.06] bg-black/[.03] px-2.5 py-1 text-[11px] font-semibold muted dark:border-white/[.08] dark:bg-white/[.06]">
          {feature.tag}
        </span>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-hot">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-pulse-ring absolute inset-0 rounded-full bg-hot" />
            <span className="relative h-1.5 w-1.5 rounded-full bg-hot" />
          </span>
          live
        </span>
      </div>

      <div className="relative mt-5 grid grid-cols-3 gap-3">
        {videos.map((v) => (
          <div key={v.rank} className="min-w-0">
            <div
              className={`relative flex aspect-[9/16] items-center justify-center overflow-hidden rounded-xl bg-linear-to-br ${v.gradient} shadow-[0_16px_34px_-20px_rgba(0,0,0,.8)]`}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/25 backdrop-blur-sm">
                <Play className="h-3 w-3 translate-x-px text-white" />
              </span>
              <span className="absolute bottom-1.5 left-1.5 rounded bg-hot px-1.5 py-0.5 text-[9px] font-bold text-white">
                {v.multiplier}
              </span>
            </div>
            <p className="mt-2 truncate font-display text-[13px] font-bold text-hot">{v.views}</p>
            <p className="truncate text-[10.5px] faint">{v.handle}</p>
          </div>
        ))}
      </div>

      <div className="relative mt-5 space-y-2.5 rounded-2xl border border-black/[.05] bg-black/[.02] p-4 dark:border-white/[.06] dark:bg-white/[.03]">
        {['Outlier score', 'Creator reach', 'Week over week'].map((label, i) => (
          <div key={label} className="flex items-center gap-3">
            <span className="w-[92px] shrink-0 text-[11px] faint">{label}</span>
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/[.07] dark:bg-white/10">
              <span
                className="block h-full rounded-full bg-linear-to-r from-accent to-accent-glow transition-all duration-700"
                style={{ width: `${[82, 64, 91][i]}%` }}
              />
            </span>
            <span className="w-9 shrink-0 text-right text-[11px] font-semibold muted">{[82, 64, 91][i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Features() {
  const [active, setActive] = useState(FEATURES[0].id);
  const feature = FEATURES.find((f) => f.id === active);

  return (
    <section id="features" className="mx-auto mt-28 max-w-page px-4 sm:mt-36 sm:px-6 lg:px-8">
      <Reveal className="max-w-2xl">
        <p className="eyebrow">
          <span className="h-px w-6 bg-accent/50" /> Research &amp; monitor
        </p>
        <h2 className="section-title mt-4">Everything you need to read TikTok</h2>
        <p className="mt-5 text-[15.5px] leading-relaxed muted sm:text-base">
          Four tools built on one index. Find what broke out, watch who is moving, and get told when something about
          you starts climbing.
        </p>
      </Reveal>

      <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-start lg:gap-12">
        <div className="flex flex-col gap-3">
          {FEATURES.map((f, i) => {
            const on = f.id === active;
            return (
              <Reveal key={f.id} delay={i * 70}>
                <button
                  onClick={() => setActive(f.id)}
                  className={`w-full rounded-2xl border p-5 text-left transition-all duration-300 sm:p-6 ${
                    on
                      ? 'ring-gradient border-transparent bg-white shadow-[0_28px_60px_-34px_rgba(109,75,255,.5)] dark:bg-white/[.06]'
                      : 'border-black/[.06] hover:-translate-y-px hover:border-accent/25 dark:border-white/[.08]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-2 w-2 rounded-full transition-all duration-300 ${
                        on ? 'bg-accent shadow-[0_0_12px_2px_rgba(109,75,255,.6)]' : 'bg-black/15 dark:bg-white/20'
                      }`}
                    />
                    <span className="font-display text-[16px] font-bold sm:text-[17px]">{f.title}</span>
                  </div>
                  <p className="mt-2.5 text-[13.5px] leading-relaxed muted">{f.body}</p>

                  {on && (
                    <ul className="animate-fade-up mt-4 flex flex-wrap gap-x-4 gap-y-2">
                      {f.bullets.map((b) => (
                        <li key={b} className="flex items-center gap-1.5 text-[12.5px] font-medium muted">
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent/15 text-accent dark:text-accent-glow">
                            <Check className="h-2.5 w-2.5" />
                          </span>
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}
                </button>
              </Reveal>
            );
          })}

          <a
            href="#pricing"
            className="mt-1 inline-flex items-center gap-1.5 px-1 text-sm font-semibold text-accent underline-offset-4 hover:underline dark:text-accent-glow"
          >
            See all features <Arrow />
          </a>
        </div>

        <Reveal delay={120} className="lg:sticky lg:top-24">
          <Preview key={feature.id} feature={feature} />
        </Reveal>
      </div>
    </section>
  );
}
