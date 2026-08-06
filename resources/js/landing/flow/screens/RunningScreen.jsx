import { useState } from 'react';
import { Google, Arrow } from '../../components/Icons.jsx';

export default function RunningScreen({ onBack, onContinue }) {
  const [email, setEmail] = useState('');

  return (
    <div className="animate-fade-up">
      <button onClick={onBack} className="text-[13px] font-semibold muted transition hover:text-accent">
        ← Back to keywords
      </button>

      <div className="mx-auto mt-8 max-w-md text-center">
        <span className="inline-flex items-center gap-2.5 rounded-full border border-accent/25 bg-accent/10 px-4 py-2 text-[12.5px] font-semibold text-accent dark:text-accent-glow">
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          Search running · 1 to 20 min
        </span>

        <h1 className="mt-7 font-display text-[26px] leading-tight font-bold tracking-[-.02em] sm:text-[32px]">
          Sign in to see your results
        </h1>
        <p className="mt-3 text-[14.5px] muted">
          We'll show them right here, or email them the moment they're ready.
        </p>

        <div className="ring-gradient mt-8 rounded-3xl bg-white/70 p-6 text-left backdrop-blur-2xl dark:bg-white/[.04]">
          <p className="mb-4 text-center font-display text-sm font-semibold">Where should we send them?</p>

          <button onClick={onContinue} className="btn-ghost h-[52px] w-full text-[15px]">
            <Google /> Continue with Google
          </button>

          <div className="my-4 flex items-center gap-3 text-xs faint">
            <span className="h-px flex-1 bg-black/[.08] dark:bg-white/10" />
            or
            <span className="h-px flex-1 bg-black/[.08] dark:bg-white/10" />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              onContinue();
            }}
            className="flex flex-col gap-2 sm:flex-row"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@brand.com"
              className="field h-[52px] flex-1"
            />
            <button type="submit" className="btn-accent h-[52px] px-5 text-[15px]">
              Get results <Arrow />
            </button>
          </form>
        </div>

        <p className="mt-5 text-[12.5px] leading-relaxed faint">
          Stay on this page, or leave and we'll email you when they're ready.
        </p>
      </div>
    </div>
  );
}
