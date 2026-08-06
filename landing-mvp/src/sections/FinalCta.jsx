import { Arrow, Play } from '../components/Icons.jsx';
import Reveal from '../components/Reveal.jsx';

export default function FinalCta({ onStart }) {
  return (
    <section className="mx-auto mt-28 max-w-page px-4 sm:mt-36 sm:px-6 lg:px-8">
      <Reveal>
        <div className="relative isolate overflow-hidden rounded-[32px] bg-ink px-6 py-16 text-center sm:px-10 sm:py-24 dark:bg-white/[.05]">
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <div className="bg-grid absolute inset-0 opacity-[.35]" />
            <div className="absolute top-0 left-1/2 h-[340px] w-[680px] max-w-[140vw] -translate-x-1/2 -translate-y-1/3 rounded-full bg-accent/50 blur-[130px]" />
            <div className="animate-float absolute right-0 bottom-0 h-[240px] w-[240px] translate-x-1/4 translate-y-1/3 rounded-full bg-hot/35 blur-[110px]" />
          </div>

          <div className="relative mx-auto max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[12px] font-semibold text-white/80 backdrop-blur-xl">
              <span className="h-1.5 w-1.5 rounded-full bg-hot" />
              Your first search is free
            </span>

            <h2 className="mt-6 font-display text-[32px] leading-[1.06] font-bold tracking-[-.03em] text-white sm:text-[46px] lg:text-[56px]">
              See what TikTok is
              <br className="hidden sm:block" /> <span className="text-gradient">saying about you</span>
            </h2>

            <p className="mx-auto mt-5 max-w-lg text-[15.5px] leading-relaxed text-white/60">
              One free search, no card. Most brands get their first surprise within the top ten results.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button onClick={() => onStart()} className="btn-accent h-[52px] w-full px-8 text-[15px] sm:w-auto">
                Start free <Arrow />
              </button>
              <button className="inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-xl border border-white/20 px-7 text-[15px] font-semibold whitespace-nowrap text-white backdrop-blur-xl transition-all duration-300 hover:-translate-y-px hover:bg-white/10 sm:w-auto">
                <Play className="h-3.5 w-3.5" /> Watch demo · 2 min
              </button>
            </div>

            <p className="mt-6 text-[12.5px] text-white/40">
              No credit card required · cancel any trial in two clicks
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
