import { Head, usePage } from '@inertiajs/react';

import SettingsShell from './Settings/SettingsShell.jsx';
import { billing } from '../landing/flow/api.js';
import { Check, Arrow } from '../landing/components/Icons.jsx';
import { PRICING_PLAN_ORDER } from '../landing/data/dummy.js';

export default function Plans() {
  const { billing: billingState = {}, pricingPlans = [] } = usePage().props;
  const current = String(billingState.currentPlan ?? 'free').toLowerCase();
  const orderedPlans = [...pricingPlans].sort((a, b) => {
    const aKey = a.slug ?? a.name?.toLowerCase();
    const bKey = b.slug ?? b.name?.toLowerCase();
    const aIndex = PRICING_PLAN_ORDER.indexOf(aKey);
    const bIndex = PRICING_PLAN_ORDER.indexOf(bKey);

    return (aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex) - (bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex);
  });

  const upgrade = (slug) => billing.checkout(slug);

  return (
    <>
      <Head title="Plans · Brand Beacon" />

      <SettingsShell section="plans">
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

            return (
              <div key={plan.slug} className={`plan${isCurrent ? ' plan--on' : ''}`}>
                {isCurrent && <span className="plan__tag">Current plan</span>}
                <div className="plan__n">{plan.name}</div>
                <p className="plan__t">{plan.tagline}</p>
                <div className="plan__p">
                  ${plan.price}
                  <span>/mo</span>
                </div>
                <p className="plan__s">{isCurrent ? 'Your current plan' : plan.price > 0 ? 'Billed monthly' : ''}</p>

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
