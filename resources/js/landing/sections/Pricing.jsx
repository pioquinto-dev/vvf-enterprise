import { Check } from '../components/Icons.jsx';
import { PRICING, PRICING_PLAN_ORDER } from '../data/dummy.js';

export default function Pricing({ plans = [], onStart, onTrial }) {
  const visiblePlans = (plans.length > 0 ? [...plans] : [...PRICING.monthly]).sort((a, b) => {
    const aKey = a.slug ?? a.name?.toLowerCase();
    const bKey = b.slug ?? b.name?.toLowerCase();
    const aIndex = PRICING_PLAN_ORDER.indexOf(aKey);
    const bIndex = PRICING_PLAN_ORDER.indexOf(bKey);

    return (aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex) - (bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex);
  });

  return (
    <section className="sec--pad" id="pricing">
      <div className="wrap">
        <div className="head head--c">
          <p className="eyebrow">Pricing</p>
          <h2>Simple, per-search pricing</h2>
          <p>Start with one free search. Upgrade when you want tracking on a schedule.</p>
          <div className="toggle">
            <button className="is-on" type="button">
              Monthly
            </button>
            <button type="button" disabled>
              Annual · save 20%
            </button>
          </div>
        </div>

        <div className="plans">
          {visiblePlans.map((plan) => {
            const free = plan.slug === 'free';
            return (
              <div className={`plan${plan.popular ? ' plan--pop' : ''}`} key={plan.slug}>
                {plan.popular && <span className="plan__pop">Most popular</span>}
                <div className="plan__n">{plan.name}</div>
                <p className="plan__t">{plan.tagline}</p>
                <div className="plan__p">
                  $0{free && <span>/mo</span>}
                </div>
                <p className="plan__s">{free ? '' : `then $${plan.price} after 7 days`}</p>

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
                ) : (
                  <button
                    type="button"
                    className={`btn btn--wide ${plan.popular ? 'btn--primary' : 'btn--ghost'}`}
                    onClick={() => onTrial(plan)}
                  >
                    {plan.cta}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="trial">
          <div>
            <h3>Start a 7-day Growth trial</h3>
            <p>
              Try the full Growth plan for 7 days. Card details are collected up front, and billing starts only after the
              trial ends unless you cancel.
            </p>
          </div>
          <button type="button" className="btn btn--ink" style={{ flex: 'none' }} onClick={() => onTrial(visiblePlans.find((p) => p.slug === 'basic'))}>
            Start 7-day trial
          </button>
        </div>
      </div>
    </section>
  );
}
