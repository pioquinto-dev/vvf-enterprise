import { Link } from '@inertiajs/react';

import Seo from '../components/Seo.jsx';
import { Arrow, Check, Trend } from '../landing/components/Icons.jsx';
import { SOLUTION_LINKS, SOLUTIONS } from '../landing/data/solutions.js';
import Nav from '../landing/sections/Nav.jsx';
import Footer from '../landing/sections/Footer.jsx';

export default function LandingSolution({ topic }) {
  const solution = SOLUTIONS[topic];

  if (!solution) return null;

  const related = SOLUTION_LINKS.filter((link) => link.key !== topic);

  return (
    <>
      <Seo title={solution.title} description={solution.description} />

      <div className="bbh solution-page">
        <Nav homeHref="/" />

        <main>
          <section className="solution-hero">
            <div className="wrap solution-hero__grid">
              <div className="solution-hero__copy">
                <p className="eyebrow">{solution.eyebrow}</p>
                <h1>{solution.heading}</h1>
                <p>{solution.intro}</p>
                <div className="solution-hero__actions">
                  <Link href={`/search?type=${solution.searchType}`} className="btn btn--primary btn--lg">
                    {solution.searchLabel}
                    <Arrow className="btn__arrow h-[15px] w-[15px]" />
                  </Link>
                  <a href="#workflow" className="solution-text-link">See the workflow</a>
                </div>
              </div>

              <aside className="solution-signal" aria-label="What you can monitor">
                <div className="solution-signal__head"><Trend className="h-4 w-4" /> Signal stack</div>
                {solution.signal.map((item, index) => (
                  <div className="solution-signal__row" key={item}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <p>{item}</p>
                  </div>
                ))}
                <div className="solution-signal__foot"><i /> Built for repeatable research</div>
              </aside>
            </div>
          </section>

          <section className="solution-section wrap" id="workflow">
            <div className="solution-section__head">
              <p className="eyebrow">A focused workflow</p>
              <h2>From one subject to useful TikTok evidence.</h2>
            </div>
            <div className="solution-steps">
              {solution.workflow.map(([title, body], index) => (
                <article className="solution-step" key={title}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="solution-outcomes">
            <div className="wrap solution-outcomes__grid">
              <div>
                <p className="eyebrow">What this unlocks</p>
                <h2>Better questions, better creative decisions.</h2>
              </div>
              <ul>
                {solution.outcomes.map((outcome) => (
                  <li key={outcome}><Check className="h-4 w-4" />{outcome}</li>
                ))}
              </ul>
            </div>
          </section>

          <section className="solution-related wrap">
            <p className="eyebrow">Explore more</p>
            <h2>More ways to research TikTok.</h2>
            <div>
              {related.map((link) => (
                <Link href={link.path} key={link.key} className="solution-related__link">
                  {link.label}<Arrow className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </section>
        </main>

        <Footer homeHref="/" />
      </div>
    </>
  );
}
