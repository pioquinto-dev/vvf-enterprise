import { STEPS } from '../data/dummy.js';
import { Arrow } from '../components/Icons.jsx';
import Reveal from '../components/Reveal.jsx';

export default function HowItWorks({ onStart }) {
  return (
    <section id="how" className="mx-auto mt-28 max-w-page px-4 sm:mt-36 sm:px-6 lg:px-8">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">
          <span className="h-px w-6 bg-accent/50" /> How it works
        </p>
        <h2 className="section-title mt-4">One subject in, a viral cut out</h2>
        <p className="mt-5 text-[15.5px] leading-relaxed muted sm:text-base">
          No dashboards to configure and no keyword research to do first. Four steps, most of them optional.
        </p>
      </Reveal>

      <div className="relative mt-14">
        {/* connecting line behind the steps */}
        <div
          aria-hidden
          className="absolute top-[46px] right-[12%] left-[12%] hidden h-px bg-linear-to-r from-transparent via-accent/30 to-transparent lg:block"
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 90} className="relative">
              <div className="surface-hover h-full p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-accent to-accent-deep font-display text-[13px] font-bold text-white shadow-[0_10px_24px_-12px_rgba(109,75,255,.9)]">
                  {s.n}
                </span>
                <h3 className="mt-5 font-display text-[17px] font-bold">{s.title}</h3>
                <p className="mt-2.5 text-[13.5px] leading-relaxed muted">{s.body}</p>
              </div>

              {i < STEPS.length - 1 && (
                <span
                  aria-hidden
                  className="absolute top-[46px] -right-[18px] z-10 hidden h-6 w-6 items-center justify-center rounded-full border border-black/[.06] bg-canvas text-accent lg:flex dark:border-white/[.08] dark:bg-canvas-dark"
                >
                  <Arrow className="h-3 w-3" />
                </span>
              )}
            </Reveal>
          ))}
        </div>
      </div>

      <Reveal delay={120} className="mt-12 text-center">
        <button onClick={() => onStart()} className="btn-accent h-[52px] px-7 text-[15px]">
          Run your free search <Arrow />
        </button>
      </Reveal>
    </section>
  );
}
