import { usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { PRICING, PRICING_PLAN_ORDER } from '../../data/dummy.js';
import { Check, Arrow } from '../../components/Icons.jsx';
import { billing } from '../api.js';

export default function TrialScreen({ onBack, backLabel = 'Back to results' }) {
  const { pricingPlans = [], auth = {} } = usePage().props;
  const [billingCycle, setBillingCycle] = useState('monthly');
  const allPlans = pricingPlans.length > 0 ? [...pricingPlans] : [...PRICING.monthly, ...PRICING.annual];
  const plans = allPlans.sort((a, b) => {
    const aKey = a.slug ?? a.name?.toLowerCase();
    const bKey = b.slug ?? b.name?.toLowerCase();
    const aIndex = PRICING_PLAN_ORDER.indexOf(aKey);
    const bIndex = PRICING_PLAN_ORDER.indexOf(bKey);

    return (aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex) - (bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex);
  });
  const tiers = plans.filter((t) => t.price > 0 && (t.duration ?? 'monthly') === billingCycle);
  const trialTier = tiers.find((t) => t.popular) || tiers[0];
  const annualBanner = useMemo(() => {
    const percents = plans
      .filter((plan) => plan.price > 0 && (plan.duration ?? 'monthly') === 'annual')
      .map((plan) => Number(plan.annualSavingsPercent ?? 0))
      .filter((value) => value > 0);

    return percents.length > 0 ? Math.max(...percents) : 0;
  }, [plans]);

  const startCheckout = (slug, cycle = billingCycle) => {
    if (!auth.signedIn) {
      window.location.assign(`/login?redirect=trial_checkout&plan=${encodeURIComponent(slug)}&trial=1&cycle=${encodeURIComponent(cycle)}`);
      return;
    }

    billing.trialCheckout(slug, cycle);
  };

  return (
    <div className="animate-fade-up">
      <button onClick={onBack} className="text-[13px] font-semibold muted transition hover:text-accent">
        {'<- '} {backLabel}
      </button>

      <div className="mx-auto mt-8 max-w-3xl text-center">
        <span className="eyebrow justify-center">
          <span className="h-px w-6 bg-accent/50" /> Subscription plans
        </span>

        <h1 className="mt-4 font-display text-[30px] leading-tight font-bold tracking-[-.025em] sm:text-[40px]">
          Unlock paid tracking
        </h1>
        <p className="mt-3 text-[14.5px] muted">
          Start on an 8-day trial. Growth includes 100 searches, 100 viral breakout video analyses, weekly + monthly
          scheduling, virality alerts, and unlimited bookmarks. Scale lifts those limits with unlimited searches and
          unlimited viral breakout video analysis.
        </p>

        <div className="toggle mx-auto mt-6">
          <button className={billingCycle === 'monthly' ? 'is-on' : ''} type="button" onClick={() => setBillingCycle('monthly')}>
            Monthly
          </button>
          <button className={billingCycle === 'annual' ? 'is-on' : ''} type="button" onClick={() => setBillingCycle('annual')}>
            Annual{annualBanner > 0 ? ` · save up to ${annualBanner}%` : ''}
          </button>
        </div>

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
                  Most popular
                </span>
              )}

              <p className="font-display text-[16px] font-bold">{t.name}</p>
              <p className="mt-1 text-[12.5px] faint">{t.tagline}</p>

              <p className="mt-3 font-display text-[32px] leading-none font-bold tracking-[-.03em]">
                ${t.price}
              </p>
              <p className="mt-2 min-h-[32px] text-[11.5px] leading-[1.35] faint">
                {billingCycle === 'annual' ? `First 2 months free. Billed annually. Save ${t.annualSavingsPercent}%` : '$0 for 8 days'}
              </p>

              <p className="mt-4 text-[12px] faint">
                {t.searchCreditsLimit === -1 ? 'Unlimited' : t.searchCreditsLimit} searches
                {' · '}
                {t.searchBookmarkLimit === -1 ? 'Unlimited' : t.searchBookmarkLimit} search bookmarks
              </p>

              <ul className="mt-5 space-y-2.5 border-t border-black/[.05] pt-5 text-[13.5px] muted dark:border-white/[.07]">
                {t.features.slice(0, 4).map((f) => (
                  <li key={f} className="flex gap-2.5">
                    <span className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent dark:text-accent-glow">
                      <Check className="h-2.5 w-2.5" />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => startCheckout(t.slug, billingCycle)}
                className={`mt-6 h-11 w-full text-sm ${t.popular ? 'btn-accent' : 'btn-ghost'}`}
              >
                Try free for 8 days <Arrow />
              </button>
            </div>
          ))}
        </div>

        <button onClick={() => startCheckout(trialTier.slug, billingCycle)} className="btn-accent mx-auto mt-9 h-[52px] px-8 text-[15px]">
          Try free for 8 days <Arrow />
        </button>
        <p className="mt-4 text-xs faint">
          Card details are collected up front, and billing starts after 8 days unless you cancel.
        </p>
      </div>
    </div>
  );
}
