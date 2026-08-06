import { useEffect, useRef, useState } from 'react';

/**
 * Animates a numeric stat when it first scrolls into view. Values like "62B+"
 * or "<20min" are split into prefix / number / suffix so the units survive.
 */
const PARTS = /^(\D*?)([\d.]+)(.*)$/;

export default function CountUp({ value, duration = 1400, className = '' }) {
  const ref = useRef(null);
  const match = String(value).match(PARTS);
  const target = match ? parseFloat(match[2]) : null;
  const decimals = match && match[2].includes('.') ? match[2].split('.')[1].length : 0;

  const [shown, setShown] = useState(() => (target === null ? value : null));

  useEffect(() => {
    if (target === null) return undefined;

    const el = ref.current;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const settle = () => setShown(value);

    if (!el || reduced || typeof IntersectionObserver === 'undefined') {
      settle();
      return undefined;
    }

    let frame;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        const start = performance.now();
        const tick = (now) => {
          const t = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - t, 3);
          const current = (target * eased).toFixed(decimals);
          setShown(`${match[1]}${current}${match[3]}`);
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
  }, [value, target, duration, decimals, match]);

  return (
    <span ref={ref} className={className}>
      {shown ?? `${match?.[1] ?? ''}0${match?.[3] ?? ''}`}
    </span>
  );
}
