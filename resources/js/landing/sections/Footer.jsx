import { useState } from 'react';
import { Logo, Arrow } from '../components/Icons.jsx';
import { FOOTER_LINKS } from '../data/dummy.js';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <footer className="relative mt-28 overflow-hidden border-t border-black/[.06] pt-16 sm:mt-36 dark:border-white/[.07]">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-[240px] w-[700px] max-w-[140vw] -translate-x-1/2 rounded-full bg-accent/10 blur-[120px]"
      />

      <div className="relative mx-auto max-w-page px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,2fr)]">
          <div>
            <a href="#top" className="flex items-center gap-2.5 font-display text-[17px] font-bold">
              <Logo />
              Outlier Vault
            </a>
            <p className="mt-4 max-w-xs text-[13.5px] leading-relaxed muted">
              TikTok social intelligence for brands. Find the viral videos moving your category, and the creators
              behind them.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
              className="mt-7 max-w-sm"
            >
              <label className="block text-[12.5px] font-semibold">Weekly viral digest</label>
              <div className="mt-2.5 flex gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@brand.com"
                  className="field h-11 flex-1 text-[14px]"
                />
                <button type="submit" className="btn-accent h-11 px-4 text-[13.5px]">
                  {sent ? 'Subscribed' : 'Subscribe'}
                  {!sent && <Arrow className="h-3 w-3" />}
                </button>
              </div>
              <p className="mt-2.5 text-[11.5px] faint">One email a week. Unsubscribe anytime.</p>
            </form>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {FOOTER_LINKS.map((col) => (
              <div key={col.heading}>
                <h4 className="font-display text-[11.5px] font-semibold tracking-[.14em] uppercase faint">
                  {col.heading}
                </h4>
                <ul className="mt-4 space-y-3">
                  {col.links.map((l) => (
                    <li key={l}>
                      <a
                        href="#top"
                        className="text-[13.5px] muted transition-colors duration-200 hover:text-accent dark:hover:text-accent-glow"
                      >
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-3 border-t border-black/[.06] py-7 sm:flex-row dark:border-white/[.07]">
          <p className="text-[12.5px] faint">© {new Date().getFullYear()} Outlier Vault. Prototype - dummy data throughout.</p>
          <div className="flex gap-6 text-[12.5px] faint">
            {['Terms', 'Privacy', 'Contact'].map((l) => (
              <a key={l} href="#top" className="transition-colors hover:text-accent dark:hover:text-accent-glow">
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
