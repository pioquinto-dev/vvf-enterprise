import { useEffect, useState } from 'react';
import { Logo, Menu, Close, Chevron } from '../components/Icons.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';
import { NAV_LINKS } from '../data/dummy.js';

export default function Nav({ theme, onToggleTheme, onStart }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50">
      <div
        className={`transition-all duration-500 ${
          scrolled
            ? 'border-b border-black/[.06] bg-canvas/88 backdrop-blur-xl dark:border-white/[.07] dark:bg-canvas-dark/88'
            : 'border-b border-transparent'
        }`}
      >
        <div className="mx-auto grid h-[74px] max-w-page grid-cols-[auto_1fr_auto] items-center gap-8 px-4 sm:px-6 lg:px-8">
          <a href="#top" className="group flex shrink-0 items-center gap-3 font-display text-[17px] font-bold">
            <span className="relative">
              <Logo />
              <span
                aria-hidden
                className="absolute inset-0 rounded-[7px] bg-accent/50 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100"
              />
            </span>
            Outlier Vault
          </a>

          <nav className="hidden items-center justify-center gap-7 xl:flex">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="py-2 text-[15px] font-medium text-ink/76 transition-all duration-300 hover:text-ink dark:text-white/72 dark:hover:text-white"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center justify-end gap-3 sm:gap-4">
            <div className="hidden xl:block">
              <ThemeToggle theme={theme} onToggle={onToggleTheme} />
            </div>
            <a href="/login" className="hidden py-2 text-[15px] font-medium text-ink/76 transition hover:text-ink xl:inline-flex dark:text-white/72 dark:hover:text-white">
              Sign In
            </a>
            <button
              onClick={() => onStart()}
              className="hidden h-[42px] items-center rounded-full bg-ink px-6 text-[15px] font-semibold text-white shadow-[0_12px_30px_-16px_rgba(15,15,15,.55)] transition hover:-translate-y-px hover:bg-black xl:inline-flex dark:bg-white dark:text-ink dark:hover:bg-white/90"
            >
              Try for Free
            </button>
            <button
              onClick={() => setOpen((o) => !o)}
              aria-label="Menu"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-black/[.09] lg:hidden dark:border-white/[.12]"
            >
              {open ? <Close /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="border-b border-black/[.06] bg-canvas/95 px-4 pt-3 pb-5 backdrop-blur-xl lg:hidden dark:border-white/[.07] dark:bg-canvas-dark/95">
          <nav className="flex flex-col">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-[15px] font-medium muted transition hover:bg-black/[.04] dark:hover:bg-white/[.06]"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="mt-3 flex flex-col gap-2">
            <button className="btn-ghost h-11 w-full justify-between px-4 text-sm">
              <span>Theme</span>
              <span className="inline-flex items-center gap-2">
                <ThemeToggle theme={theme} onToggle={onToggleTheme} />
                <Chevron className="h-3.5 w-3.5" />
              </span>
            </button>
            <a href="/login" className="btn-ghost h-11 w-full text-sm">
              Sign In
            </a>
            <button
              onClick={() => {
                setOpen(false);
                onStart();
              }}
              className="h-11 w-full rounded-full bg-ink text-sm font-semibold text-white transition hover:bg-black dark:bg-white dark:text-ink"
            >
              Try for Free
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
