import { useEffect, useRef, useState } from 'react';

import { Arrow, Google, Search, Store, Target, Trend } from '../components/Icons.jsx';
import { STATS } from '../data/dummy.js';

const MODES = [
  { key: 'brand', label: 'Your brand', icon: Store, prompt: 'Which brand do you want to research?', sample: 'rhode skin' },
  { key: 'competitor', label: 'A competitor', icon: Target, prompt: 'Which competitor should we watch?', sample: 'skims' },
  { key: 'product', label: 'A product', icon: Search, prompt: 'Which product do you want to track?', sample: 'lip oil' },
];

export default function Hero({ onStart }) {
  const [type, setType] = useState('brand');
  const [value, setValue] = useState('');
  const [ghost, setGhost] = useState('');
  const inputRef = useRef(null);

  const mode = MODES.find((m) => m.key === type) ?? MODES[0];
  const query = value.trim().replace(/\s+/g, ' ');
  const showGhost = value === '';

  // Typewriter for the placeholder sample, looping while the field is empty.
  useEffect(() => {
    if (!showGhost) return undefined;
    const sample = mode.sample;
    let i = 0;
    let dir = 1;
    let timer;
    const tick = () => {
      setGhost(sample.slice(0, i));
      if (dir === 1) {
        i += 1;
        if (i > sample.length) {
          dir = -1;
          timer = window.setTimeout(tick, 1600);
          return;
        }
      } else {
        i -= 1;
        if (i < 0) {
          i = 0;
          dir = 1;
        }
      }
      timer = window.setTimeout(tick, dir === 1 ? 95 : 45);
    };
    tick();
    return () => window.clearTimeout(timer);
  }, [mode.sample, showGhost]);

  const submit = (e) => {
    e?.preventDefault();
    if (!query) {
      inputRef.current?.focus();
      return;
    }
    onStart(type, query);
  };

  return (
    <section className="hero" id="top">
      <div className="wrap">
        <h1>
          TikTok Brand and Social Media <span className="hl">Intelligence Tool</span>
        </h1>
        <p className="hero__sub">
          Enter your brand, a competitor or single product; then we will scan TikTok and return the most viral outlier
          videos, the creators behind them and the reason they went viral
        </p>

        <div className="modes" role="tablist" aria-label="What to research">
          {MODES.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              className={`mode${key === type ? ' is-on' : ''}`}
              role="tab"
              aria-selected={key === type}
              onClick={() => setType(key)}
            >
              <Icon className="h-[15px] w-[15px]" />
              {label}
            </button>
          ))}
        </div>

        <label className="box__label" htmlFor="search-subject">
          {mode.prompt}
        </label>

        <form className="box" onSubmit={submit}>
          <div className="field">
            <div className={`field__ghost${showGhost ? '' : ' is-off'}`} aria-hidden>
              <span>{ghost}</span>
              <span className="caret" />
            </div>
            <textarea
              ref={inputRef}
              id="search-subject"
              rows={2}
              maxLength={80}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) submit(e);
              }}
              aria-label={mode.prompt}
            />
          </div>

          <div className="box__foot">
            <p className="box__try">
              Try{' '}
              <button
                type="button"
                onClick={() => {
                  setValue(mode.sample);
                  inputRef.current?.focus();
                }}
              >
                “{mode.sample}”
              </button>
              <span>One subject per search keeps each result tight.</span>
            </p>
            <button type="submit" className="btn btn--primary btn--lg btn--pulse">
              Find outliers
              <Arrow className="btn__arrow h-[15px] w-[15px]" />
            </button>
          </div>
        </form>

        <div className="hero__ctas">
          <a href="/auth/google" className="btn btn--ghost btn--lg">
            <span className="gicon">
              <Google />
            </span>
            Get started free
            <Arrow className="btn__arrow h-[15px] w-[15px]" />
          </a>
          <a href="#how" className="btn btn--ghost btn--lg">
            See how it works
          </a>
        </div>
        <p className="hero__note">1 free search · no credit card</p>

        <dl className="stats">
          {STATS.map((s) => (
            <div className="stat" key={s.label}>
              <dt className="stat__v">{s.value}</dt>
              <dd className="stat__l">
                <Trend className="h-[11px] w-[11px]" />
                {s.label}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
