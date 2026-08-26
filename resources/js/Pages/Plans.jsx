import { useEffect, useState } from 'react';
import { Head, usePage } from '@inertiajs/react';

import SettingsShell from './Settings/SettingsShell.jsx';
import { billing } from '../landing/flow/api.js';
import { Check, Arrow } from '../landing/components/Icons.jsx';
import { PRICING_PLAN_ORDER } from '../landing/data/dummy.js';
import UpgradePromptModal from './components/UpgradePromptModal.jsx';

export default function Plans() {
  const { billing: billingState = {}, pricingPlans = [], flash = {} } = usePage().props;
  const current = String(billingState.currentPlan ?? 'free').toLowerCase();
  const isTrialing = Boolean(billingState.isTrialing);
  const hasUsedTrial = Boolean(billingState.hasUsedTrial);
  const [trialPromptOpen, setTrialPromptOpen] = useState(Boolean(flash.trialAccessPrompt));
  const orderedPlans = [...pricingPlans].sort((a, b) => {
    const aKey = a.slug ?? a.name?.toLowerCase();
    const bKey = b.slug ?? b.name?.toLowerCase();
    const aIndex = PRICING_PLAN_ORDER.indexOf(aKey);
    const bIndex = PRICING_PLAN_ORDER.indexOf(bKey);

    return (aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex) - (bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex);
  });

  const upgrade = (slug) => billing.checkout(slug);
  const promptPlanSlug = flash.trialAccessPrompt?.plan_slug ?? 'basic';

  useEffect(() => {
    setTrialPromptOpen(Boolean(flash.trialAccessPrompt));
  }, [flash.trialAccessPrompt]);

  const priceLine = (plan) => {
    if ((plan.price ?? 0) <= 0) {
      return { amount: '$0', suffix: '/mo', subline: '' };
    }

    if (!hasUsedTrial || isTrialing) {
      return { amount: `$${plan.price}`, suffix: '/mo', subline: '$0 for 8 days' };
    }

    return { amount: `$${plan.price}`, suffix: '/mo', subline: '' };
  };

  return (
    <>
      <Head title="Plans · Brand Beacon" />

      <SettingsShell section="plans">
        <UpgradePromptModal
          open={trialPromptOpen}
          eyebrow="Trial already used"
          title="Your 8-day trial has already been used"
          body="This account already finished its free trial, so the next step is a paid upgrade."
          detail="You can still unlock scheduled tracking, bookmarks, and video analysis right away."
          primaryLabel="Upgrade to Growth"
          onPrimary={() => upgrade(promptPlanSlug)}
          secondaryLabel="Maybe later"
          onSecondary={() => setTrialPromptOpen(false)}
          onClose={() => setTrialPromptOpen(false)}
        />

        <div style={{ marginBottom: 18 }}>
          <h2>Plans</h2>
          <p className="muted" style={{ fontSize: '.86rem', marginTop: 6 }}>
            Start with one free search. Upgrade when you want tracking on a schedule.
          </p>
        </div>

        <div className="plans">
          {orderedPlans.map((plan) => {
            const isCurrent = plan.slug === current;
            const isFree = plan.slug === 'free';
            const price = priceLine(plan);

            return (
              <div key={plan.slug} className={`plan${isCurrent ? ' plan--on' : ''}`}>
                {isCurrent && <span className="plan__tag">Current plan</span>}
                <div className="plan__n">{plan.name}</div>
                <p className="plan__t">{plan.tagline}</p>
                <div className="plan__p">
                  {price.amount}
                  {price.suffix && <span>{price.suffix}</span>}
                </div>
                <p className="plan__s">
                  {price.subline || (isCurrent ? 'Your current plan' : plan.price > 0 ? 'Billed monthly' : '')}
                </p>

                <ul>
                  {plan.features.map((feature) => (
                    <li key={feature}>
                      <Check className="h-3.5 w-3.5" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <button type="button" className="btn btn--g btn--w" disabled>
                    Current plan
                  </button>
                ) : isFree ? (
                  <button type="button" className="btn btn--g btn--w" disabled>
                    Free plan unavailable
                  </button>
                ) : (
                  <button type="button" className="btn btn--y btn--w" onClick={() => upgrade(plan.slug)}>
                    Upgrade to {plan.name} <Arrow />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </SettingsShell>
    </>
  );
}
