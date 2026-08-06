import { PRICING } from '../../data/dummy.js';
import { Check, Arrow } from '../../components/Icons.jsx';

export default function TrialScreen({ onBack, backLabel = 'Back to results' }) {
  const tiers = PRICING.monthly.filter((t) => t.price > 0);
  const trialTier = tiers.find((t) => t.popular) || tiers[0];

  return (
    <div className="animate-fade-up">
      <button onClick={onBack} className="text-[13px] font-semibold muted transition hover:text-accent">
        ← {backLabel}
      </button>

      <div className="mx-auto mt-8 max-w-3xl text-center">
        <span className="eyebrow justify-center">
          <span className="h-px w-6 bg-accent/50" /> 10 day trial
        </span>

        <h1 className="mt-4 font-display text-[30px] leading-tight font-bold tracking-[-.025em] sm:text-[40px]">
          Start your 10 day trial
        </h1>
        <p className="mt-3 text-[14.5px] muted">
          Card up front, cancel anytime before day 10. Then it becomes {trialTier.name} at ${trialTier.price}/mo.
        </p>

        <div className="mx-auto mt-9 grid max-w-2xl gap-5 text-left sm:grid-cols-2">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`relative rounded-3xl p-6 transition-all duration-300 ${
                t.popular
                  ? 'ring-gradient bg-white shadow-[0_40px_90px_-45px_rgba(109,75,255,.7)] dark:bg-white/[.06]'
                  : 'border border-black/[.06] bg-white hover:-translate-y-1 hover:border-accent/25 dark:border-white/[.08] dark:bg-white/[.03]'
              }`}
            >
              {t.popular && (
                <span className="absolute -top-3 left-6 rounded-full bg-linear-to-r from-accent-glow to-accent px-3 py-1 text-[10.5px] font-bold tracking-wider text-white uppercase shadow-[0_8px_20px_-8px_rgba(109,75,255,1)]">
                  Your trial
                </span>
              )}

              <p className="font-display text-[16px] font-bold">{t.name}</p>
              <p className="mt-2 font-display text-[32px] leading-none font-bold tracking-[-.03em]">
                ${t.price}
                <span className="text-[13px] font-medium muted">/mo</span>
              </p>

              <ul className="mt-5 space-y-2.5 border-t border-black/[.05] pt-5 text-[13.5px] muted dark:border-white/[.07]">
                {t.features.slice(0, 3).map((f) => (
                  <li key={f} className="flex gap-2.5">
                    <span className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent dark:text-accent-glow">
                      <Check className="h-2.5 w-2.5" />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <button className="btn-accent mx-auto mt-9 h-[52px] px-8 text-[15px]">
          Start {trialTier.name} trial <Arrow />
        </button>
        <p className="mt-4 text-xs faint">
          {tiers
            .filter((t) => !t.popular)
            .map((t) => t.name)
            .join(' and ')}{' '}
          is a direct upgrade, no trial.
        </p>
      </div>
    </div>
  );
}
