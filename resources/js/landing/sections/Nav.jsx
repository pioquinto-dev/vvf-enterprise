import { useEffect, useState } from 'react';
import { Logo, Menu, Close, Arrow } from '../components/Icons.jsx';
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
            ? 'border-b border-black/[.06] bg-canvas/70 backdrop-blur-xl dark:border-white/[.07] dark:bg-canvas-dark/70'
            : 'border-b border-transparent'
        }`}
      >
        <div className="mx-auto flex h-[68px] max-w-page items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="#top" className="group flex items-center gap-2.5 font-display text-[17px] font-bold">
            <span className="relative">
              <Logo />
              <span
                aria-hidden
                className="absolute inset-0 rounded-[7px] bg-accent/50 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100"
              />
            </span>
            VVF
          </a>

          <nav className="hidden items-center gap-0.5 rounded-full border border-black/[.06] bg-white/50 p-1 backdrop-blur-xl lg:flex dark:border-white/[.08] dark:bg-white/[.04]">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="rounded-full px-4 py-2 text-[13.5px] font-medium muted transition-all duration-300 hover:bg-black/[.05] hover:text-ink dark:hover:bg-white/[.08] dark:hover:text-white"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
            <a href="/saved-searches" className="btn-ghost hidden h-10 px-4 text-sm sm:inline-flex">
              Saved searches
            </a>
            <button onClick={() => onStart()} className="btn-accent hidden h-10 px-4 text-sm sm:inline-flex">
              Get started <Arrow />
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
            <a href="/saved-searches" className="btn-ghost h-11 w-full text-sm">
              Saved searches
            </a>
            <button
              onClick={() => {
                setOpen(false);
                onStart();
              }}
              className="btn-accent h-11 w-full text-sm"
            >
              Get started <Arrow />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
