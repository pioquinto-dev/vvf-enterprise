import { useEffect, useMemo, useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';

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
  const currentPlan = orderedPlans.find((plan) => plan.slug === current);
  const [billingCycle, setBillingCycle] = useState((currentPlan?.duration ?? 'monthly') === 'annual' ? 'annual' : 'monthly');
  const visiblePlans = orderedPlans.filter((plan) => plan.slug === 'free' || (plan.duration ?? 'monthly') === billingCycle);
  const annualBanner = useMemo(() => {
    const percents = orderedPlans
      .filter((plan) => (plan.duration ?? 'monthly') === 'annual')
      .map((plan) => Number(plan.annualSavingsPercent ?? 0))
      .filter((value) => value > 0);

    return percents.length > 0 ? Math.max(...percents) : 0;
  }, [orderedPlans]);

  const upgrade = (slug, cycle = billingCycle) => billing.checkout(slug, cycle);
  // Trial-eligible accounts see a "Try free for 8 days" CTA, so the click has to
  // start a trial checkout — not a straight paid one.
  const canOfferTrial = !hasUsedTrial && !isTrialing;
  const startPlan = (slug, cycle = billingCycle) =>
    canOfferTrial ? billing.trialCheckout(slug, cycle) : billing.checkout(slug, cycle);
  const promptPlanSlug =
    flash.trialAccessPrompt?.plan_slug ?? visiblePlans.find((plan) => plan.planType === 'growth')?.slug ?? 'growth';

  useEffect(() => {
    setTrialPromptOpen(Boolean(flash.trialAccessPrompt));
  }, [flash.trialAccessPrompt]);

  const priceLine = (plan) => {
    const annual = billingCycle === 'annual';

    if ((plan.price ?? 0) <= 0) {
      return { amount: '$0', suffix: '/mo', subline: '' };
    }

    if (!hasUsedTrial || isTrialing) {
      return {
        amount: `$${plan.price}`,
        suffix: annual ? '/yr' : '/mo',
        subline: annual ? `Save ${plan.annualSavingsPercent}% with annual billing` : '$0 for 8 days',
      };
    }

    return {
      amount: `$${plan.price}`,
      suffix: annual ? '/yr' : '/mo',
      subline: annual ? `Save ${plan.annualSavingsPercent}% with annual billing` : '',
    };
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
          <div className="toggle" style={{ marginTop: 16 }}>
            <button className={billingCycle === 'monthly' ? 'is-on' : ''} type="button" onClick={() => setBillingCycle('monthly')}>
              Monthly
            </button>
            <button className={billingCycle === 'annual' ? 'is-on' : ''} type="button" onClick={() => setBillingCycle('annual')}>
              Annual{annualBanner > 0 ? ` · save up to ${annualBanner}%` : ''}
            </button>
          </div>
        </div>

        <div className="plans">
          {visiblePlans.map((plan) => {
            const isCurrent = plan.slug === current;
            const isFree = plan.slug === 'free';
            // Scale is not self-serve yet — its CTA collects interest via the
            // contact form instead of starting a checkout.
            const isScale = plan.planType === 'scale' || plan.slug === 'scale' || plan.slug === 'scale-annual';
            const contactHref = `/contact?category=plan-upgrade&subject=${encodeURIComponent(`Interested in the ${plan.name} plan`)}`;
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
                ) : isScale ? (
                  <Link href={contactHref} className="btn btn--y btn--w">
                    Contact Us <Arrow />
                  </Link>
                ) : (
                  <button type="button" className="btn btn--y btn--w" onClick={() => startPlan(plan.slug, billingCycle)}>
                    {canOfferTrial ? 'Try free for 8 days' : `Upgrade to ${plan.name}`}{' '}
                    <Arrow />
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
