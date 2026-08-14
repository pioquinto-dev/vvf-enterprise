import { useEffect, useMemo, useRef, useState } from 'react';

/**
 * Animates a numeric stat when it first scrolls into view. Values like "62B+"
 * or "<20min" are split into prefix / number / suffix so the units survive.
 */
const PARTS = /^(\D*?)([\d.]+)(.*)$/;

export default function CountUp({ value, duration = 1400, className = '' }) {
  const ref = useRef(null);
  const hasAnimated = useRef(false);
  const parts = useMemo(() => {
    const match = String(value).match(PARTS);

    if (!match) {
      return { prefix: '', numeric: null, suffix: '', decimals: 0 };
    }

    return {
      prefix: match[1],
      numeric: parseFloat(match[2]),
      suffix: match[3],
      decimals: match[2].includes('.') ? match[2].split('.')[1].length : 0,
    };
  }, [value]);

  const [shown, setShown] = useState(() => (parts.numeric === null ? value : null));
  const [settled, setSettled] = useState(parts.numeric === null);

  useEffect(() => {
    if (parts.numeric === null) {
      setShown(value);
      return undefined;
    }

    const el = ref.current;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const settle = () => {
      setShown(value);
      setSettled(true);
    };

    if (!el || reduced || typeof IntersectionObserver === 'undefined') {
      hasAnimated.current = true;
      settle();
      return undefined;
    }

    let frame;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasAnimated.current) return;
        hasAnimated.current = true;
        observer.disconnect();

        const start = performance.now();
        const tick = (now) => {
          const t = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - t, 3);
          const current = (parts.numeric * eased).toFixed(parts.decimals);
          setSettled(false);
          setShown(`${parts.prefix}${current}${parts.suffix}`);
          if (t < 1) frame = requestAnimationFrame(tick);
          else settle();
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [value, duration, parts]);

  return (
    <span
      ref={ref}
      className={`${className} ${settled ? '' : 'inline-block min-w-[3ch] animate-pulse rounded-[0.2em] bg-[linear-gradient(90deg,rgba(255,198,41,.15),rgba(255,198,41,.45),rgba(255,198,41,.15))] px-[0.12em] text-transparent bg-[length:220%_100%] animate-shimmer'}`.trim()}
    >
      {shown ?? `${parts.prefix}0${parts.suffix}`}
    </span>
  );
}
