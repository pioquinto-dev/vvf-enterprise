import { useMemo, useState } from 'react';
import { Check } from '../components/Icons.jsx';
import { PRICING, PRICING_PLAN_ORDER } from '../data/dummy.js';

export default function Pricing({ plans = [], onStart, onTrial }) {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const allPlans = plans.length > 0 ? [...plans] : [...PRICING.monthly, ...PRICING.annual];
  const sortedPlans = allPlans.sort((a, b) => {
    const aKey = a.slug ?? a.name?.toLowerCase();
    const bKey = b.slug ?? b.name?.toLowerCase();
    const aIndex = PRICING_PLAN_ORDER.indexOf(aKey);
    const bIndex = PRICING_PLAN_ORDER.indexOf(bKey);

    return (aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex) - (bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex);
  });
  const visiblePlans = useMemo(
    () => sortedPlans.filter((plan) => plan.slug === 'free' || (plan.duration ?? 'monthly') === billingCycle),
    [billingCycle, sortedPlans],
  );
  const paidPlans = useMemo(() => visiblePlans.filter((plan) => plan.price > 0), [visiblePlans]);
  const annualBanner = useMemo(() => {
    const percents = paidPlans
      .map((plan) => Number(plan.annualSavingsPercent ?? 0))
      .filter((value) => value > 0);

    return percents.length > 0 ? Math.max(...percents) : 0;
  }, [paidPlans]);

  return (
    <section className="sec--pad" id="pricing">
      <div className="wrap">
        <div className="head head--c">
          <p className="eyebrow">Pricing</p>
          <h2>Simple, per-search pricing</h2>
          <p>Start with one free search. Upgrade when you want tracking on a schedule.</p>
          <div className="toggle">
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
            const free = plan.slug === 'free';
            // Scale is not self-serve yet — collect interest via the contact form.
            const isScale = plan.planType === 'scale' || plan.slug === 'scale' || plan.slug === 'scale-annual';
            const contactHref = `/contact?category=plan-upgrade&subject=${encodeURIComponent(`Interested in the ${plan.name} plan`)}`;
            return (
              <div className={`plan${plan.popular ? ' plan--pop' : ''}`} key={plan.slug}>
                {plan.popular && <span className="plan__pop">Most popular</span>}
                <div className="plan__n">{plan.name}</div>
                <p className="plan__t">{plan.tagline}</p>
                <div className="plan__p">
                  {free ? '$0' : `$${plan.price}`}
                  <span>{free ? '/mo' : billingCycle === 'annual' ? '/yr' : '/mo'}</span>
                </div>
                <p className="plan__s">
                  {free
                    ? ''
                    : billingCycle === 'annual'
                      ? `Save ${plan.annualSavingsPercent}% with annual billing`
                      : '$0 for 8 days'}
                </p>

                <ul>
                  {plan.features.map((feature) => (
                    <li key={feature}>
                      <Check className="h-[15px] w-[15px]" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {free ? (
                  <button type="button" className="btn btn--ghost btn--wide" onClick={() => onStart()}>
                    Run a free search
                  </button>
                ) : isScale ? (
                  <a href={contactHref} className={`btn btn--wide ${plan.popular ? 'btn--primary' : 'btn--ghost'}`}>
                    Contact Us
                  </a>
                ) : (
                  <button
                    type="button"
                    className={`btn btn--wide ${plan.popular ? 'btn--primary' : 'btn--ghost'}`}
                    onClick={() => onTrial(plan, billingCycle)}
                  >
                    Try free for 8 days
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="trial">
          <div>
            <h3>Start an 8-day Growth trial</h3>
            <p>
              Try the full Growth plan for 8 days. Card details are collected up front, and billing starts only after the
              trial ends unless you cancel.
            </p>
          </div>
          <button
            type="button"
            className="btn btn--ink"
            style={{ flex: 'none' }}
            onClick={() => onTrial(visiblePlans.find((p) => p.planType === 'growth'), billingCycle)}
          >
            Start 8-day trial
          </button>
        </div>
      </div>
    </section>
  );
}
