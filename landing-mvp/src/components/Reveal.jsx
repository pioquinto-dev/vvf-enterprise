import { useEffect, useRef } from 'react';

/**
 * Releases `[data-reveal]` elements as they scroll into view. The hidden state
 * lives in CSS, so anything server-rendered still reads fine without JS, and
 * prefers-reduced-motion short-circuits the whole thing.
 */
export function useReveal() {
  const ref = useRef(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return undefined;

    const targets = root.querySelectorAll('[data-reveal]');
    if (!targets.length) return undefined;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || typeof IntersectionObserver === 'undefined') {
      targets.forEach((el) => el.setAttribute('data-reveal', 'shown'));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.setAttribute('data-reveal', 'shown');
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.08 }
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return ref;
}

/** Convenience wrapper: <Reveal delay={120}>…</Reveal> */
export default function Reveal({ delay = 0, as: Tag = 'div', className = '', children, ...rest }) {
  return (
    <Tag data-reveal="" style={{ '--reveal-delay': `${delay}ms` }} className={className} {...rest}>
      {children}
    </Tag>
  );
}
