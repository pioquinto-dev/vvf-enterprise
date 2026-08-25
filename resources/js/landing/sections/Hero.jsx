import { useRef, useState } from 'react';

import { Arrow, Search, Store } from '../components/Icons.jsx';

const MODES = [
  { key: 'brand', label: 'Your brand', icon: Store, prompt: 'Which brand do you want to research?', sample: 'rhode skin' },
  { key: 'product', label: 'A product', icon: Search, prompt: 'Which product do you want to track?', sample: 'lip oil' },
];

export default function Hero({ onStart }) {
  const [type, setType] = useState('brand');
  const [value, setValue] = useState('');
  const inputRef = useRef(null);

  const mode = MODES.find((m) => m.key === type) ?? MODES[0];
  const query = value.trim().replace(/\s+/g, ' ');

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
          Facebook has an ad library. Organic TikTok doesn't. So we built it.
        </p>

        <form className="box" onSubmit={submit}>
          <p className="box__label">
            <span className="box__step">1</span>
            Pick what you want to search
          </p>

          <div className="modes" role="tablist" aria-label="What to research">
            {MODES.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
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
            <span className="box__step">2</span>
            Type your {type === 'product' ? 'product' : 'brand name'}
          </label>

          <div className="box__field">
            <input
              ref={inputRef}
              id="search-subject"
              maxLength={80}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={mode.sample}
              aria-label={`Type your ${type === 'product' ? 'product' : 'brand name'}`}
            />
            <button type="submit" className="btn btn--primary btn--lg btn--pulse">
              Find outliers
              <Arrow className="btn__arrow h-[15px] w-[15px]" />
            </button>
          </div>

          <div className="box__foot">
            <span>1 free search · no credit card</span>
            <a href="#how">See how it works</a>
          </div>
        </form>
      </div>
    </section>
  );
}
