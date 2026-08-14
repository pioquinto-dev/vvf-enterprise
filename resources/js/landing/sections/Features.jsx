import { useState } from 'react';

import { Check, Play } from '../components/Icons.jsx';
import { FEATURES } from '../data/dummy.js';

/* Static marketing preview content (the whole landing is illustrative). */
const PREVIEW_VIDS = [
  { handle: '@glossier', mult: '18x', views: '4.2M', image: '/images/landing/discovery-coco-shimmy.png' },
  { handle: '@glowwithtay', mult: '12x', views: '3.1M', image: '/images/landing/discovery-buyer-beware.png' },
  { handle: '@cleangirl.ari', mult: '22x', views: '2.8M', image: '/images/landing/discovery-brow-grooming.png' },
];

const PREVIEW_BARS = [
  { label: 'Outlier 20x+', fill: 92, n: 11 },
  { label: '10–20x', fill: 68, n: 21 },
  { label: '5–10x', fill: 44, n: 34 },
  { label: '3–5x', fill: 26, n: 52 },
];

export default function Features() {
  const [active, setActive] = useState(FEATURES[0].id);
  const current = FEATURES.find((f) => f.id === active) ?? FEATURES[0];

  return (
    <section className="sec wrap" id="features">
      <div className="head">
        <p className="eyebrow">Research &amp; monitor</p>
        <h2>Everything you need to read TikTok</h2>
        <p>
          Four tools built on one index. Find what broke out, watch who is moving, and get told when something about you
          starts climbing.
        </p>
      </div>

      <div className="feat__grid">
        <div className="feat__list">
          {FEATURES.map((feature) => (
            <button
              key={feature.id}
              type="button"
              className={`fbtn${feature.id === active ? ' is-on' : ''}`}
              onClick={() => setActive(feature.id)}
            >
              <div className="fbtn__top">
                <span className="fdot" />
                <span className="fbtn__t">{feature.title}</span>
              </div>
              <p className="fbtn__b">{feature.body}</p>
              <ul className="fbtn__ul">
                {feature.bullets.map((bullet) => (
                  <li key={bullet}>
                    <Check className="h-[13px] w-[13px]" />
                    {bullet}
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>

        <div>
          <div className="prev">
            <div className="prev__top">
              <span className="prev__tag">{current.tag}</span>
              <span className="prev__live">
                <i />
                Live preview
              </span>
            </div>

            <div className="prev__vids">
              {PREVIEW_VIDS.map((v) => (
                <div key={v.handle}>
                  <div className="vid__t">
                    <img className="vid__img" src={v.image} alt={v.handle} />
                    <span className="vid__x">{v.mult}</span>
                    <span className="vid__p">
                      <Play className="h-[11px] w-[11px]" />
                    </span>
                  </div>
                  <p className="vid__v">{v.views}</p>
                  <p className="vid__h">{v.handle}</p>
                </div>
              ))}
            </div>

            <div className="bars">
              {PREVIEW_BARS.map((bar) => (
                <div className="bar" key={bar.label}>
                  <span className="bar__l">{bar.label}</span>
                  <span className="bar__t">
                    <span className="bar__f" style={{ width: `${bar.fill}%` }} />
                  </span>
                  <span className="bar__n">{bar.n}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
