import { useEffect, useState } from 'react';

import { Check, Play, Trend } from '../components/Icons.jsx';
import { FEATURES } from '../data/dummy.js';

/* Static marketing preview content (the whole landing is illustrative). */
const OUTLIER_VIDEOS = [
  { handle: '@glossier', mult: '18×', views: '4.2M', image: '/images/landing/discovery-coco-shimmy.png' },
  { handle: '@glowwithtay', mult: '12×', views: '3.1M', image: '/images/landing/discovery-buyer-beware.png' },
  { handle: '@cleangirl.ari', mult: '22×', views: '2.8M', image: '/images/landing/discovery-brow-grooming.png' },
];

const BRAND_FEED = [
  {
    title: '"the serum that survived my wedding weekend"',
    meta: '2.1M views · @styledbymia',
    chip: 'Affiliate',
    tone: 'aff',
    image: '/images/landing/competitor-sourdough-loaf.jpg',
  },
  {
    title: 'New drop just landed. Shop the routine.',
    meta: '1.4M views · @glossier',
    chip: 'Brand video',
    tone: 'brand',
    image: '/images/landing/discovery-coco-shimmy.png',
  },
  {
    title: 'glossier dupe vs the real thing, tested',
    meta: '870K views · @honestfinds',
    chip: 'UGC',
    tone: 'ugc',
    image: '/images/landing/alert-summer-fridays.jpg',
  },
];

const ALERTS = [
  { title: '@faithfessel crossed 1.2M views mentioning your brand (14×)', meta: '2m ago', channel: 'Slack' },
  { title: '@kymieann is climbing fast, +380K views in 6 hours', meta: '1h ago', channel: 'Email' },
  { title: 'A critical review hit 500K views, worth a look', meta: 'yesterday', channel: 'Slack' },
];

export default function Features() {
  const [active, setActive] = useState(FEATURES[0].id);
  const [hoverEnabled, setHoverEnabled] = useState(false);
  const current = FEATURES.find((f) => f.id === active) ?? FEATURES[0];

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined;
    }

    const media = window.matchMedia('(hover: hover) and (pointer: fine)');
    const sync = () => setHoverEnabled(media.matches);

    sync();

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', sync);
      return () => media.removeEventListener('change', sync);
    }

    media.addListener(sync);
    return () => media.removeListener(sync);
  }, []);

  return (
    <section className="sec wrap" id="features">
      <div className="head">
        <p className="eyebrow">Research &amp; monitor</p>
        <h2>
          Everything you need to read <span className="hl">TikTok</span>
        </h2>
        <p>
          Three tools built on one index. Find what broke out, watch what is moving, and get pinged when something about
          you starts climbing.
        </p>
      </div>

      <div className="feat__grid">
        <div className="feat__list">
          {FEATURES.map((feature) => (
            <div key={feature.id} className="feat__item">
              <button
                type="button"
                className={`fbtn${feature.id === active ? ' is-on' : ''}`}
                onClick={() => setActive(feature.id)}
                onMouseEnter={() => {
                  if (hoverEnabled) setActive(feature.id);
                }}
                onFocus={() => setActive(feature.id)}
                aria-pressed={feature.id === active}
              >
                <div className="fbtn__top">
                  <span className="fdot" />
                  <span className="fbtn__t">{feature.title}</span>
                  <span className="fbtn__tag">{feature.tag}</span>
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

              {feature.id === active && (
                <div className="feat__mobileprev">
                  <PreviewPane active={active} current={current} />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="feat__desktopprev">
          <PreviewPane active={active} current={current} />
        </div>
      </div>
    </section>
  );
}

function PreviewPane({ active, current }) {
  return (
    <div className="prev">
      <div className="prev__top">
        <span className="prev__tag">{current.tag}</span>
        <span className="prev__live">
          <i />
          Live preview
        </span>
      </div>

      <div className={`pane${active === 'outliers' ? '' : ' hide'}`}>
        <VideoGrid videos={OUTLIER_VIDEOS} />
      </div>

      <div className={`pane${active === 'tracking' ? '' : ' hide'}`}>
        <div className="comp">
          <div className="comp__head">
            <span className="comp__logo">
              <img src="/landing/brands/glossier.svg" alt="Glossier logo" />
            </span>
            <div>
              <div className="comp__name">glossier</div>
              <div className="comp__sub">@glossier · tracked weekly</div>
            </div>
            <div className="comp__stat">
              <span>Videos this week</span>
              <strong>
                <Trend className="h-[13px] w-[13px]" />
                12 new
              </strong>
            </div>
          </div>

          <div className="feed">
            {BRAND_FEED.map((item) => (
              <div className="feed__row" key={item.title}>
                <span className="feed__thumb">
                  <img src={item.image} alt="" />
                </span>
                <div className="feed__copy">
                  <div className="feed__title">{item.title}</div>
                  <div className="feed__meta">{item.meta}</div>
                </div>
                <span className={`feed__chip feed__chip--${item.tone}`}>{item.chip}</span>
              </div>
            ))}
          </div>

          <div className="digest">
            <Bell />
            Weekly digest ready · 12 new videos, 2 breakouts
          </div>
        </div>
      </div>

      <div className={`pane${active === 'alerts' ? '' : ' hide'}`}>
        <div className="alerts">
          <div className="threshold">
            <div className="threshold__title">Alert me when a video mentioning my brand crosses</div>
            <div className="threshold__rules">
              <span>1M views</span>
              or
              <span>10× outlier</span>
            </div>
            <div className="deliver">
              <span className="deliver__btn is-on">
                <i />
                Slack
              </span>
              <span className="deliver__btn is-on">
                <i />
                Email
              </span>
            </div>
          </div>

          <div className="alerts__list">
            {ALERTS.map((alert) => (
              <div className="alert" key={alert.title}>
                <span className="alert__icon">
                  <Bell />
                </span>
                <div className="alert__body">
                  <div className="alert__title">{alert.title}</div>
                  <div className="alert__meta">
                    {alert.meta}
                    <span>{alert.channel}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function VideoGrid({ videos }) {
  return (
    <div className="prev__vids">
      {videos.map((v, index) => (
        <div key={`${v.handle}-${index}`}>
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
  );
}

function Bell() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M18 8a6 6 0 1 0-12 0c0 7-3 8-3 8h18s-3-1-3-8M13.7 21a2 2 0 0 1-3.4 0"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}
