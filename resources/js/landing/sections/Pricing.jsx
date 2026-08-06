import { useState } from 'react';
import { PRICING } from '../data/dummy.js';
import { Check, Arrow } from '../components/Icons.jsx';
import Reveal from '../components/Reveal.jsx';

export default function Pricing({ onStart, onTrial }) {
  const [annual, setAnnual] = useState(false);

  const price = (p) => (p === 0 ? 0 : annual ? Math.round((p * 12 * 0.8) / 12) : p);

  return (
    <section id="pricing" className="mx-auto mt-28 max-w-page px-4 sm:mt-36 sm:px-6 lg:px-8">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="eyebrow justify-center">
          <span className="h-px w-6 bg-accent/50" /> Pricing
        </p>
        <h2 className="section-title mt-4">Simple, per-search pricing</h2>
        <p className="mt-5 text-[15.5px] leading-relaxed muted sm:text-base">
          Start with one free search. Upgrade when you want tracking on a schedule.
        </p>

        <div className="mt-8 inline-flex items-center gap-1 rounded-2xl border border-black/[.06] bg-black/[.035] p-1.5 dark:border-white/[.08] dark:bg-white/[.05]">
          {[
            { k: false, label: 'Monthly' },
            { k: true, label: 'Annual −20%' },
          ].map((o) => (
            <button
              key={o.label}
              onClick={() => setAnnual(o.k)}
              className={`rounded-xl px-5 py-2 text-[13.5px] font-semibold transition-all duration-300 ${
                annual === o.k
                  ? 'bg-white text-ink shadow-[0_2px_10px_-2px_rgba(16,18,32,.2)] dark:bg-ink-700 dark:text-white'
                  : 'muted'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </Reveal>

      <div className="mx-auto mt-12 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {PRICING.monthly.map((t, i) => (
          <Reveal key={t.name} delay={i * 90} className={t.popular ? 'lg:-mt-4 lg:mb-4' : ''}>
            <div
              className={`relative flex h-full flex-col rounded-3xl p-6 transition-all duration-300 sm:p-7 ${
                t.popular
                  ? 'ring-gradient bg-white shadow-[0_40px_90px_-45px_rgba(109,75,255,.7)] dark:bg-white/[.06]'
                  : 'border border-black/[.06] bg-white hover:-translate-y-1 hover:border-accent/25 dark:border-white/[.08] dark:bg-white/[.03]'
              }`}
            >
              {t.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-linear-to-r from-accent-glow to-accent px-3 py-1 text-[10.5px] font-bold tracking-wider text-white uppercase shadow-[0_8px_20px_-8px_rgba(109,75,255,1)]">
                  Most popular
                </span>
              )}

              <h3 className="font-display text-[17px] font-bold">{t.name}</h3>
              <p className="mt-1 text-[12.5px] faint">{t.tagline}</p>

              <p className="mt-5 font-display text-[40px] leading-none font-bold tracking-[-.03em]">
                ${price(t.price)}
                <span className="text-[13px] font-medium muted">/mo</span>
              </p>
              <p className="mt-2 h-4 text-[11.5px] faint">
                {annual && t.price > 0 ? `Billed $${price(t.price) * 12}/year` : t.price > 0 ? 'Billed monthly' : ''}
              </p>

              <button
                onClick={() => (t.price === 0 ? onStart() : onTrial())}
                className={`mt-6 h-12 w-full text-sm ${t.popular ? 'btn-accent' : 'btn-ghost'}`}
              >
                {t.cta} <Arrow />
              </button>

              <ul className="mt-6 space-y-3 border-t border-black/[.05] pt-6 dark:border-white/[.07]">
                {t.features.map((f) => (
                  <li key={f} className="flex gap-3 text-[13.5px] muted">
                    <span className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent dark:text-accent-glow">
                      <Check className="h-2.5 w-2.5" />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
