import { Logo, Close } from '../components/Icons.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';
import { useTheme } from '../components/useTheme.js';

const TONES = {
  ok: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  accent: 'border-accent/25 bg-accent/10 text-accent dark:text-accent-glow',
};

const STEP_ORDER = ['keywords', 'running', 'results'];

/**
 * Page chrome for the search flow screens. Each step is its own page, so this
 * renders a real sticky header rather than modal furniture.
 */
export default function SearchShell({ pill, step, onNewSearch, onExit, width = 'max-w-4xl', children }) {
  const { theme, toggle } = useTheme();
  const stepIndex = STEP_ORDER.indexOf(step);

  return (
    <div className="vvf-landing relative isolate min-h-screen font-body">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="bg-grid mask-radial-fade absolute inset-0" />
        <div className="absolute top-[-20%] left-1/2 h-[420px] w-[760px] max-w-[140vw] -translate-x-1/2 rounded-full bg-accent/15 blur-[140px] dark:bg-accent/20" />
      </div>

      <header className="sticky top-0 z-40 border-b border-black/[.06] bg-canvas/70 backdrop-blur-xl dark:border-white/[.07] dark:bg-canvas-dark/70">
        <div className={`mx-auto flex h-[68px] ${width} items-center justify-between px-4 sm:px-6`}>
          <button
            onClick={onExit}
            className="flex items-center gap-2.5 font-display text-[17px] font-bold"
            aria-label="Back to home"
          >
            <Logo />
            VVF
          </button>

          <div className="flex items-center gap-2 sm:gap-3">
            {pill && (
              <span
                className={`rounded-full border px-3 py-1 text-[11.5px] font-semibold ${TONES[pill.tone]}`}
              >
                {pill.text}
              </span>
            )}
            <ThemeToggle theme={theme} onToggle={toggle} className="hidden sm:inline-flex" />
            <button onClick={onNewSearch} className="btn-ghost hidden h-10 px-4 text-[13px] sm:inline-flex">
              New search
            </button>
            <button
              onClick={onExit}
              aria-label="Close"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-black/[.09] transition-all duration-300 hover:-translate-y-px hover:border-accent/40 dark:border-white/[.12]"
            >
              <Close className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* thin progress rail across the three search steps */}
        {stepIndex >= 0 && (
          <div className="h-[2px] w-full bg-black/[.05] dark:bg-white/[.06]">
            <div
              className="h-full bg-linear-to-r from-accent-glow to-accent transition-all duration-700 ease-out"
              style={{ width: `${((stepIndex + 1) / STEP_ORDER.length) * 100}%` }}
            />
          </div>
        )}
      </header>

      <main className={`mx-auto ${width} px-4 py-10 sm:px-6 sm:py-12`}>{children}</main>
    </div>
  );
}
