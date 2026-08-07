import { usePage } from '@inertiajs/react';
import { PRICING, PRICING_PLAN_ORDER } from '../data/dummy.js';
import { Check, Arrow } from '../components/Icons.jsx';
import Reveal from '../components/Reveal.jsx';

export default function Pricing({ onStart, onTrial, onTrialStart, compact = false }) {
  const { pricingPlans = [], billing = {}, subscription = null } = usePage().props;
  const plans = (pricingPlans.length > 0 ? [...pricingPlans] : [...PRICING.monthly]).sort((a, b) => {
    const aKey = a.slug ?? a.name?.toLowerCase();
    const bKey = b.slug ?? b.name?.toLowerCase();
    const aIndex = PRICING_PLAN_ORDER.indexOf(aKey);
    const bIndex = PRICING_PLAN_ORDER.indexOf(bKey);

    return (aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex) - (bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex);
  });
  const currentPlan = billing.currentPlan ?? 'free';
  const subscriptionStatus = subscription?.status ?? null;
  const onBasicTrial = currentPlan === 'basic' && subscriptionStatus === 'trialing';
  const trialEligible = billing.trialEligible ?? true;
  const launchTrial = () => {
    if (typeof onTrialStart === 'function') {
      onTrialStart();
      return;
    }

    onTrial?.({ slug: 'basic' });
  };

  const trialHeading = onBasicTrial ? 'Your 7-day Basic trial is active' : 'Start a 7-day Basic trial';
  const trialBody = onBasicTrial
    ? 'You already have trial access to Basic. Upgrade to Premium any time, or keep using your current trial until it ends.'
    : 'Try the full Basic plan for 7 days. Card details are collected up front, and billing starts only after the trial ends unless you cancel.';
  const trialButtonLabel = onBasicTrial ? 'Currently in Trial' : 'Start 7-day trial';

  const cardState = (plan) => {
    const isCurrent = plan.slug === currentPlan;

    if (plan.slug === 'free') {
      if (currentPlan !== 'free') {
        return {
          disabled: true,
          cta: 'Free plan unavailable',
        };
      }

      return {
        disabled: true,
        cta: 'Current plan',
      };
    }

    if (plan.slug === 'basic') {
      if (isCurrent) {
        return {
          disabled: true,
          cta: subscriptionStatus === 'trialing' ? 'Currently in Trial' : 'Current plan',
        };
      }

      return {
        disabled: false,
        cta: 'Choose Basic',
      };
    }

    if (plan.slug === 'premium') {
      if (isCurrent) {
        return {
          disabled: true,
          cta: 'Current plan',
        };
      }

      return {
        disabled: false,
        cta: currentPlan === 'basic' ? 'Upgrade to Premium' : 'Choose Premium',
      };
    }

    return {
      disabled: false,
      cta: plan.cta,
    };
  };

  return (
    <section
      id="pricing"
      className={`mx-auto max-w-page px-4 sm:px-6 lg:px-8 ${compact ? 'mt-6 sm:mt-8' : 'mt-28 sm:mt-36'}`}
    >
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="eyebrow justify-center">
          <span className="h-px w-6 bg-accent/50" /> Pricing
        </p>
        <h2 className="section-title mt-4">Simple, per-search pricing</h2>
        <p className="mt-5 text-[15.5px] leading-relaxed muted sm:text-base">
          Start with one free search. Upgrade when you want tracking on a schedule.
        </p>

        <div className="mt-8 inline-flex items-center gap-1 rounded-2xl border border-black/[.06] bg-black/[.035] p-1.5 dark:border-white/[.08] dark:bg-white/[.05]">
          <button className="rounded-xl bg-white px-5 py-2 text-[13.5px] font-semibold text-ink shadow-[0_2px_10px_-2px_rgba(16,18,32,.2)] dark:bg-ink-700 dark:text-white">
            Monthly
          </button>
          <div
            aria-disabled="true"
            title="Annual pricing is coming soon"
            className="flex cursor-not-allowed items-center gap-2 rounded-xl px-5 py-2 text-[13.5px] font-semibold text-ink/45 dark:text-white/45"
          >
            <span>Annual -20%</span>
            <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-bold tracking-[.1em] text-accent uppercase dark:text-accent-glow">
              Soon
            </span>
          </div>
        </div>
      </Reveal>

      {trialEligible && <Reveal className="mx-auto mt-8 max-w-5xl">
        <div className="rounded-[30px] border border-accent/20 bg-white/78 p-6 shadow-[0_18px_45px_-36px_rgba(109,75,255,.22)] backdrop-blur-xl dark:border-white/[.08] dark:bg-white/[.05] sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="eyebrow">
                <span className="h-px w-6 bg-accent/50" /> Trial
              </p>
              <h3 className="mt-3 font-display text-[24px] font-bold tracking-[-.03em] sm:text-[30px]">
                {trialHeading}
              </h3>
              <p className="mt-3 text-[14px] leading-relaxed muted sm:text-[15px]">
                {trialBody}
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 lg:w-auto lg:min-w-[280px]">
              <button onClick={launchTrial} disabled={onBasicTrial} className="btn-accent h-12 w-full px-6 text-sm">
                {trialButtonLabel} {!onBasicTrial && <Arrow />}
              </button>
              <p className="text-center text-[12px] faint">Includes 150 searches and 50 watchlist slots.</p>
            </div>
          </div>
        </div>
      </Reveal>}

      <div className="mx-auto mt-12 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((t, i) => (
          <Reveal key={t.name} delay={i * 90} className={t.popular ? 'lg:-mt-4 lg:mb-4' : ''}>
            {(() => {
              const state = cardState(t);
              const current = t.slug === currentPlan;

              return (
            <div
              className={`relative flex h-full flex-col rounded-3xl p-6 transition-all duration-300 sm:p-7 ${
                current
                  ? 'border-2 border-accent/45 bg-white shadow-[0_32px_80px_-46px_rgba(109,75,255,.42)] dark:border-accent/40 dark:bg-white/[.06]'
                  : t.popular
                    ? 'ring-gradient bg-white shadow-[0_40px_90px_-45px_rgba(109,75,255,.7)] dark:bg-white/[.06]'
                    : 'border border-black/[.06] bg-white hover:-translate-y-1 hover:border-accent/25 dark:border-white/[.08] dark:bg-white/[.03]'
              }`}
            >
              {current && (
                <span className="absolute top-4 right-4 rounded-full bg-accent/10 px-2.5 py-1 text-[10.5px] font-bold tracking-[.08em] text-accent uppercase dark:text-accent-glow">
                  {subscriptionStatus === 'trialing' ? 'On trial' : 'Current plan'}
                </span>
              )}
              {t.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-linear-to-r from-accent-glow to-accent px-3 py-1 text-[10.5px] font-bold tracking-wider text-white uppercase shadow-[0_8px_20px_-8px_rgba(109,75,255,1)]">
                  Most popular
                </span>
              )}

              <h3 className="font-display text-[17px] font-bold">{t.name}</h3>
              <p className="mt-1 text-[12.5px] faint">{t.tagline}</p>

              <p className="mt-5 font-display text-[40px] leading-none font-bold tracking-[-.03em]">
                ${t.price}
                <span className="text-[13px] font-medium muted">/mo</span>
              </p>
              <p className="mt-2 h-4 text-[11.5px] faint">{t.price > 0 ? 'Billed monthly' : ''}</p>

              <button
                onClick={() => (t.price === 0 ? onStart() : onTrial(t))}
                disabled={state.disabled}
                className={`mt-6 h-12 w-full text-sm ${
                  state.disabled
                    ? 'cursor-not-allowed rounded-xl border border-black/[.08] bg-black/[.03] text-ink/40 dark:border-white/[.12] dark:bg-white/[.04] dark:text-white/40'
                    : t.popular || current
                      ? 'btn-accent'
                      : 'btn-ghost'
                }`}
              >
                {state.cta} {!state.disabled && <Arrow />}
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
              );
            })()}
          </Reveal>
        ))}
      </div>
    </section>
  );
}
