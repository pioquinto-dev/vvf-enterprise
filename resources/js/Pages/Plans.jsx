import { useEffect, useMemo, useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';

import SettingsShell from './Settings/SettingsShell.jsx';
import { billing } from '../landing/flow/api.js';
import { Check, Arrow } from '../landing/components/Icons.jsx';
import { PRICING_PLAN_ORDER } from '../landing/data/dummy.js';
import UpgradePromptModal from './components/UpgradePromptModal.jsx';

function planTier(plan) {
  const slug = String(plan?.slug ?? '').toLowerCase();
  const type = String(plan?.planType ?? '').toLowerCase();

  if (type === 'scale' || slug.startsWith('scale')) return 2;
  if (type === 'growth' || slug.startsWith('growth')) return 1;

  return 0;
}

function formatUsd(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export default function Plans() {
  const { billing: billingState = {}, pricingPlans = [], flash = {} } = usePage().props;
  const current = String(billingState.currentPlan ?? 'free').toLowerCase();
  const isTrialing = Boolean(billingState.isTrialing);
  const hasUsedTrial = Boolean(billingState.hasUsedTrial);
  // Active Growth subscribers switch to Scale through the in-app upgrade path.
  const isActivePaidGrowth = current.startsWith('growth') && !isTrialing;
  const [trialPromptOpen, setTrialPromptOpen] = useState(Boolean(flash.trialAccessPrompt));
  const [upgradeError, setUpgradeError] = useState(null);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [pendingPlanChange, setPendingPlanChange] = useState(null);
  const orderedPlans = [...pricingPlans].sort((a, b) => {
    const aKey = a.slug ?? a.name?.toLowerCase();
    const bKey = b.slug ?? b.name?.toLowerCase();
    const aIndex = PRICING_PLAN_ORDER.indexOf(aKey);
    const bIndex = PRICING_PLAN_ORDER.indexOf(bKey);

    return (aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex) - (bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex);
  });
  const currentPlan = orderedPlans.find((plan) => plan.slug === current);
  const currentTier = planTier(currentPlan);
  const [billingCycle, setBillingCycle] = useState((currentPlan?.duration ?? 'monthly') === 'annual' ? 'annual' : 'monthly');
  const monthlyCtasDisabled = (currentPlan?.duration ?? 'monthly') === 'annual' && billingCycle === 'monthly';
  const isAnnualGrowth = current === 'growth-annual' && billingCycle === 'annual';
  const visiblePlans = orderedPlans.filter((plan) => plan.slug === 'free' || (plan.duration ?? 'monthly') === billingCycle);
  const annualBanner = useMemo(() => {
    const percents = orderedPlans
      .filter((plan) => (plan.duration ?? 'monthly') === 'annual')
      .map((plan) => Number(plan.annualSavingsPercent ?? 0))
      .filter((value) => value > 0);

    return percents.length > 0 ? Math.max(...percents) : 0;
  }, [orderedPlans]);

  const upgrade = (slug, cycle = billingCycle) => billing.checkout(slug, cycle);
  const upgradeToScale = async (slug) => {
    if (isUpgrading) return;

    setIsUpgrading(true);

    try {
      await billing.upgrade(slug);
      window.location.assign('/settings/subscription');
    } catch (error) {
      setUpgradeError(error.message || 'The Scale upgrade could not be completed.');
    } finally {
      setIsUpgrading(false);
    }
  };
  // Trial-eligible accounts see a "Try free for 8 days" CTA, so the click has to
  // start a trial checkout — not a straight paid one.
  const canOfferTrial = !hasUsedTrial && !isTrialing;
  const startPlan = (slug, cycle = billingCycle) =>
    canOfferTrial ? billing.trialCheckout(slug, cycle) : billing.checkout(slug, cycle);
  const beginPlanChange = (plan) => {
    const isInPlaceScaleUpgrade = currentTier === 1
      && planTier(plan) === 2
      && (plan.duration ?? 'monthly') === 'monthly';
    const needsConfirmation = !isTrialing
      && (currentPlan?.duration ?? 'monthly') === 'monthly'
      && currentTier > 0
      && (isInPlaceScaleUpgrade || (plan.duration ?? 'monthly') === 'annual');

    if (needsConfirmation) {
      setPendingPlanChange({ plan, isInPlaceScaleUpgrade });
      return;
    }

    if (isInPlaceScaleUpgrade) {
      upgradeToScale(plan.slug);
      return;
    }

    startPlan(plan.slug, billingCycle);
  };
  const confirmPlanChange = () => {
    if (pendingPlanChange === null) return;

    const { plan, isInPlaceScaleUpgrade } = pendingPlanChange;
    setPendingPlanChange(null);

    if (isInPlaceScaleUpgrade) {
      upgradeToScale(plan.slug);
      return;
    }

    startPlan(plan.slug, billingCycle);
  };
  const promptPlanSlug =
    flash.trialAccessPrompt?.plan_slug ?? visiblePlans.find((plan) => plan.planType === 'growth')?.slug ?? 'growth';
  const pendingPlan = pendingPlanChange?.plan;
  const pendingAdditionalCharge = pendingPlan && currentPlan
    ? Math.max(0, Number(pendingPlan.price ?? 0) - Number(currentPlan.price ?? 0))
    : 0;

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
        subline: annual ? `First 2 months free. Billed annually. Save ${plan.annualSavingsPercent}%` : '$0 for 8 days',
      };
    }

    return {
      amount: `$${plan.price}`,
      suffix: annual ? '/yr' : '/mo',
      subline: annual ? `First 2 months free. Billed annually. Save ${plan.annualSavingsPercent}%` : '',
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
        <UpgradePromptModal
          open={Boolean(upgradeError)}
          eyebrow="Scale upgrade"
          title="Upgrade not completed"
          body={upgradeError}
          primaryLabel="Got it"
          secondaryLabel={null}
          onPrimary={() => setUpgradeError(null)}
          onClose={() => setUpgradeError(null)}
        />
        <UpgradePromptModal
          open={pendingPlanChange !== null}
          eyebrow={pendingPlanChange?.isInPlaceScaleUpgrade ? 'Scale upgrade' : 'Annual plan review'}
          title={pendingPlanChange?.isInPlaceScaleUpgrade ? 'Confirm your Scale upgrade' : `Continue to ${pendingPlan?.name ?? 'your'} annual plan`}
          body={pendingPlanChange?.isInPlaceScaleUpgrade
            ? `Charge today: ${formatUsd(pendingAdditionalCharge)} — the difference between Growth and Scale.`
            : `You will continue to Stripe to review the ${pendingPlan?.name} annual plan and confirm payment.`}
          detail={pendingPlanChange?.isInPlaceScaleUpgrade
            ? 'Your renewal date and usage stay the same. Scale limits apply immediately.'
            : `The annual plan is ${formatUsd(Number(pendingPlan?.price ?? 0))} per year. Stripe will show the final payment details before any charge is made.`}
          emphasis={null}
          primaryLabel={pendingPlanChange?.isInPlaceScaleUpgrade ? 'Confirm and charge' : 'Review in Stripe'}
          primaryDisabled={isUpgrading}
          onPrimary={confirmPlanChange}
          secondaryLabel="Keep current plan"
          onSecondary={() => setPendingPlanChange(null)}
          onClose={() => setPendingPlanChange(null)}
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
            // A Growth subscriber upgrades the current Stripe subscription;
            // everyone else uses the normal hosted checkout flow.
            const isScale = plan.planType === 'scale' || plan.slug === 'scale' || plan.slug === 'scale-annual';
            const isGrowthToScaleUpgrade = isScale && isActivePaidGrowth && (plan.duration ?? 'monthly') === 'monthly';
            const isAnnualGrowthToScale = isScale && isAnnualGrowth;
            const isLowerTier = !isFree && !isTrialing && planTier(plan) < currentTier;
            const contactHref = `/contact?category=plan-upgrade&subject=${encodeURIComponent(`Interested in the ${plan.name} annual plan`)}`;
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
                ) : isLowerTier ? (
                  <button type="button" className="btn btn--g btn--w" disabled title="Your account already has a higher plan.">
                    Lower plan locked
                  </button>
                ) : monthlyCtasDisabled ? (
                  <button type="button" className="btn btn--g btn--w" disabled title="Your annual plan is active. Choose an annual plan to change tiers.">
                    Annual plan active
                  </button>
                ) : isAnnualGrowthToScale ? (
                  <Link href={contactHref} className="btn btn--y btn--w">
                    Contact Us <Arrow />
                  </Link>
                ) : isGrowthToScaleUpgrade ? (
                  <button type="button" className="btn btn--y btn--w" disabled={isUpgrading} onClick={() => beginPlanChange(plan)}>
                    {isUpgrading ? 'Upgrading...' : `Upgrade to ${plan.name}`}{' '}
                    <Arrow />
                  </button>
                ) : (
                  <button type="button" className="btn btn--y btn--w" onClick={() => beginPlanChange(plan)}>
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
