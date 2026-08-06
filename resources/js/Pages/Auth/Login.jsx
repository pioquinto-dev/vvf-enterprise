import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AppFooter from '../components/AppFooter.jsx';

export default function Login() {
  const { flash = {} } = usePage().props;
  const form = useForm({
    email: '',
    password: '',
    remember: true,
  });

  const submit = (event) => {
    event.preventDefault();
    form.post('/login');
  };

  return (
    <>
      <Head title="Log in — VVF" />

      <div className="vvf-landing relative flex min-h-screen flex-col overflow-hidden px-4 py-10 sm:px-6">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="bg-grid mask-radial-fade absolute inset-0" />
          <div className="absolute top-[-10%] left-1/2 h-[380px] w-[760px] -translate-x-1/2 rounded-full bg-accent/18 blur-[140px]" />
        </div>

        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="font-display text-[20px] font-bold tracking-[-.02em]">
            VVF
          </Link>
          <Link href="/register" className="btn-ghost h-10 px-4 text-sm">
            Create account
          </Link>
        </div>

        <div className="mx-auto mt-14 flex-1 grid max-w-5xl gap-10 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
          <div>
            <p className="eyebrow">
              <span className="h-px w-6 bg-accent/50" /> Account access
            </p>
            <h1 className="mt-4 font-display text-[36px] font-bold tracking-[-.03em] sm:text-[52px]">
              Log in to your VVF workspace
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed muted sm:text-[16px]">
              Access your watchlist, plan limits, saved videos, and billing. Google sign-in can still be added later, but
              your email and password flow works independently.
            </p>
          </div>

          <div className="rounded-[28px] border border-black/[.06] bg-white/78 p-7 shadow-[0_30px_90px_-50px_rgba(16,18,32,.45)] backdrop-blur-xl dark:border-white/[.08] dark:bg-white/[.05] sm:p-8">
            <h2 className="font-display text-[24px] font-bold">Welcome back</h2>
            <p className="mt-2 text-[13.5px] muted">Use your email and password to continue.</p>

            {flash.status && (
              <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
                {flash.status}
              </div>
            )}

            <form onSubmit={submit} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[.14em] faint">Email</label>
                <input
                  type="email"
                  value={form.data.email}
                  onChange={(event) => form.setData('email', event.target.value)}
                  className="w-full rounded-2xl border border-black/[.08] bg-white px-4 py-3 text-[14px] outline-none transition focus:border-accent/45 dark:border-white/[.12] dark:bg-white/[.04]"
                  placeholder="you@company.com"
                  autoComplete="email"
                />
                {form.errors.email && <p className="mt-2 text-sm text-hot">{form.errors.email}</p>}
              </div>

              <div>
                <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[.14em] faint">Password</label>
                <input
                  type="password"
                  value={form.data.password}
                  onChange={(event) => form.setData('password', event.target.value)}
                  className="w-full rounded-2xl border border-black/[.08] bg-white px-4 py-3 text-[14px] outline-none transition focus:border-accent/45 dark:border-white/[.12] dark:bg-white/[.04]"
                  placeholder="Your password"
                  autoComplete="current-password"
                />
                {form.errors.password && <p className="mt-2 text-sm text-hot">{form.errors.password}</p>}
              </div>

              <label className="flex items-center gap-3 text-[13px] muted">
                <input
                  type="checkbox"
                  checked={form.data.remember}
                  onChange={(event) => form.setData('remember', event.target.checked)}
                  className="h-4 w-4 rounded border-black/[.15]"
                />
                Keep me signed in
              </label>

              <button type="submit" disabled={form.processing} className="btn-accent h-12 w-full text-sm">
                {form.processing ? 'Logging in…' : 'Log in'}
              </button>
            </form>

            <p className="mt-5 text-center text-[13px] muted">
              Need an account?{' '}
              <Link href="/register" className="font-semibold text-accent underline-offset-4 hover:underline dark:text-accent-glow">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        <AppFooter label="VVF account access" className="mt-12" />
      </div>
    </>
  );
}
