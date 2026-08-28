import { useEffect, useRef, useState } from 'react';

import { Arrow, Search, Store } from '../components/Icons.jsx';
import { fetchKeywordSuggestions } from '../flow/api.js';

const MODES = [
  {
    key: 'brand',
    label: 'Your brand',
    icon: Store,
    prompt: 'Which brand do you want to research?',
    sample: 'rhode skin',
    samples: ['rhode skin', 'rare beauty', 'summer fridays'],
  },
  {
    key: 'product',
    label: 'A product',
    icon: Search,
    prompt: 'Which product do you want to track?',
    sample: 'lip oil',
    samples: ['lip oil', 'blush stick', 'collagen mask'],
  },
];

export default function Hero({ onStart }) {
  const [type, setType] = useState('brand');
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [typingText, setTypingText] = useState('');
  const [subjectSuggestions, setSubjectSuggestions] = useState([]);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const fieldRef = useRef(null);

  const mode = MODES.find((m) => m.key === type) ?? MODES[0];
  const query = value.trim().replace(/\s+/g, ' ');
  const visibleSuggestions = subjectSuggestions.filter((suggestion) => suggestion.label?.trim());

  useEffect(() => {
    const controller = new AbortController();

    fetchKeywordSuggestions(type, value.trim(), { signal: controller.signal })
      .then((payload) => setSubjectSuggestions(Array.isArray(payload?.suggestions) ? payload.suggestions : []))
      .catch(() => {});

    return () => controller.abort();
  }, [type, value]);

  useEffect(() => {
    const close = (event) => {
      if (!fieldRef.current?.contains(event.target)) {
        setShowSuggestions(false);
        setActiveSuggestion(-1);
      }
    };

    document.addEventListener('mousedown', close);

    return () => document.removeEventListener('mousedown', close);
  }, []);

  useEffect(() => {
    if (value) {
      setTypingText('');
      return undefined;
    }

    const samples = mode.samples?.length ? mode.samples : [mode.sample];
    let sampleIndex = 0;
    let charIndex = 0;
    let deleting = false;
    let timeoutId;

    const tick = () => {
      const current = samples[sampleIndex] ?? '';

      if (!deleting) {
        charIndex += 1;
        setTypingText(current.slice(0, charIndex));

        if (charIndex >= current.length) {
          deleting = true;
          timeoutId = window.setTimeout(tick, 1300);
          return;
        }

        timeoutId = window.setTimeout(tick, 75);
        return;
      }

      charIndex -= 1;
      setTypingText(current.slice(0, Math.max(0, charIndex)));

      if (charIndex <= 0) {
        deleting = false;
        sampleIndex = (sampleIndex + 1) % samples.length;
        timeoutId = window.setTimeout(tick, 260);
        return;
      }

      timeoutId = window.setTimeout(tick, 38);
    };

    setTypingText('');
    timeoutId = window.setTimeout(tick, 360);

    return () => window.clearTimeout(timeoutId);
  }, [mode, value]);

  const submit = (e) => {
    e?.preventDefault();
    if (!query) {
      inputRef.current?.focus();
      return;
    }
    onStart(type, query);
  };

  const applySuggestion = (label) => {
    setValue(label);
    setShowSuggestions(false);
    setActiveSuggestion(-1);
    window.requestAnimationFrame(() => inputRef.current?.focus());
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

          <div className="box__field" ref={fieldRef}>
            <input
              ref={inputRef}
              id="search-subject"
              maxLength={80}
              value={value}
              autoComplete="off"
              onChange={(e) => {
                setValue(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => {
                setIsFocused(true);
                setShowSuggestions(true);
              }}
              onBlur={() => setIsFocused(false)}
              onKeyDown={(event) => {
                if (!visibleSuggestions.length) return;

                if (event.key === 'ArrowDown') {
                  event.preventDefault();
                  setShowSuggestions(true);
                  setActiveSuggestion((current) => (current + 1) % visibleSuggestions.length);
                }

                if (event.key === 'ArrowUp') {
                  event.preventDefault();
                  setShowSuggestions(true);
                  setActiveSuggestion((current) => (current <= 0 ? visibleSuggestions.length - 1 : current - 1));
                }

                if (event.key === 'Enter' && activeSuggestion >= 0 && visibleSuggestions[activeSuggestion]) {
                  event.preventDefault();
                  applySuggestion(visibleSuggestions[activeSuggestion].label);
                }

                if (event.key === 'Escape') {
                  setShowSuggestions(false);
                  setActiveSuggestion(-1);
                }
              }}
              placeholder=""
              aria-label={`Type your ${type === 'product' ? 'product' : 'brand name'}`}
              aria-expanded={showSuggestions && visibleSuggestions.length > 0}
              aria-haspopup="listbox"
            />
            {!value && (
              <span className={`box__ghost${isFocused ? ' is-focused' : ''}`} aria-hidden="true">
                {typingText || mode.sample}
              </span>
            )}
            {showSuggestions && visibleSuggestions.length > 0 && (
              <div className="hero-suggest" role="listbox" aria-label={`${type} suggestions`}>
                <div className="hero-suggest__head">
                  <span>Suggested {type === 'brand' ? 'brands' : 'products'}</span>
                  <span>{visibleSuggestions.length}</span>
                </div>
                <div className="hero-suggest__list">
                  {visibleSuggestions.map((suggestion, index) => (
                    <button
                      key={`${suggestion.type}-${suggestion.id}`}
                      type="button"
                      className={`hero-suggest__item${index === activeSuggestion ? ' is-active' : ''}`}
                      onMouseEnter={() => setActiveSuggestion(index)}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => applySuggestion(suggestion.label)}
                    >
                      <span className="hero-suggest__text">
                        <strong>{suggestion.label}</strong>
                        {suggestion.sector && <em>{suggestion.sector}</em>}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
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
