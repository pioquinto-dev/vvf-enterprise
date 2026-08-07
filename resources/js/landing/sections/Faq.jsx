import { useState } from 'react';
import { FAQS } from '../data/dummy.js';
import { Chevron } from '../components/Icons.jsx';
import Reveal from '../components/Reveal.jsx';

export default function Faq() {
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="mx-auto mt-28 max-w-page px-4 sm:mt-36 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)] lg:gap-16">
        <Reveal className="lg:sticky lg:top-28 lg:self-start">
          <p className="eyebrow">
            <span className="h-px w-6 bg-accent/50" /> FAQ
          </p>
          <h2 className="section-title mt-4">Questions? Answers.</h2>
          <p className="mt-5 text-[15.5px] leading-relaxed muted">
            Still stuck? Email{' '}
            <a
              href="mailto:hello@outliervault.com"
              className="font-semibold text-accent underline-offset-4 hover:underline dark:text-accent-glow"
            >
              hello@outliervault.com
            </a>{' '}
            and a human replies same day.
          </p>
        </Reveal>

        <div className="flex flex-col gap-2.5">
          {FAQS.map((f, i) => {
            const on = open === i;
            return (
              <Reveal key={f.q} delay={Math.min(i, 5) * 50}>
                <div
                  className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
                    on
                      ? 'border-accent/30 bg-white shadow-[0_24px_50px_-34px_rgba(109,75,255,.5)] dark:bg-white/[.05]'
                      : 'border-black/[.06] hover:border-accent/20 dark:border-white/[.08]'
                  }`}
                >
                  <button
                    onClick={() => setOpen(on ? -1 : i)}
                    aria-expanded={on}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <span className="font-display text-[15px] font-semibold">{f.q}</span>
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                        on
                          ? 'rotate-180 bg-linear-to-br from-accent-glow to-accent text-white'
                          : 'bg-black/[.05] muted dark:bg-white/[.08]'
                      }`}
                    >
                      <Chevron className="h-3.5 w-3.5" />
                    </span>
                  </button>

                  <div
                    className={`grid transition-all duration-300 ${
                      on ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 pb-5 text-[14px] leading-relaxed muted">{f.a}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
