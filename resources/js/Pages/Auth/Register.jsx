import { Head, Link, useForm } from '@inertiajs/react';
import AppFooter from '../components/AppFooter.jsx';

export default function Register() {
  const form = useForm({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });

  const submit = (event) => {
    event.preventDefault();
    form.post('/register');
  };

  return (
    <>
      <Head title="Create account — VVF" />

      <div className="vvf-landing relative flex min-h-screen flex-col overflow-hidden px-4 py-10 sm:px-6">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="bg-grid mask-radial-fade absolute inset-0" />
          <div className="absolute top-[-10%] left-1/2 h-[380px] w-[760px] -translate-x-1/2 rounded-full bg-hot/12 blur-[150px]" />
        </div>

        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="font-display text-[20px] font-bold tracking-[-.02em]">
            VVF
          </Link>
          <Link href="/login" className="btn-ghost h-10 px-4 text-sm">
            Log in
          </Link>
        </div>

        <div className="mx-auto mt-14 flex-1 grid max-w-5xl gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
          <div>
            <p className="eyebrow">
              <span className="h-px w-6 bg-accent/50" /> New account
            </p>
            <h1 className="mt-4 font-display text-[36px] font-bold tracking-[-.03em] sm:text-[52px]">
              Create your VVF account
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed muted sm:text-[16px]">
              Start with email and password, then choose a plan when you’re ready. Any guest searches you ran in this
              session will be attached to your account after sign-in.
            </p>
          </div>

          <div className="rounded-[28px] border border-black/[.06] bg-white/78 p-7 shadow-[0_30px_90px_-50px_rgba(16,18,32,.45)] backdrop-blur-xl dark:border-white/[.08] dark:bg-white/[.05] sm:p-8">
            <h2 className="font-display text-[24px] font-bold">Create account</h2>
            <p className="mt-2 text-[13.5px] muted">Use a normal email/password login or add Google later.</p>

            <form onSubmit={submit} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[.14em] faint">Name</label>
                <input
                  type="text"
                  value={form.data.name}
                  onChange={(event) => form.setData('name', event.target.value)}
                  className="w-full rounded-2xl border border-black/[.08] bg-white px-4 py-3 text-[14px] outline-none transition focus:border-accent/45 dark:border-white/[.12] dark:bg-white/[.04]"
                  placeholder="Your name"
                  autoComplete="name"
                />
                {form.errors.name && <p className="mt-2 text-sm text-hot">{form.errors.name}</p>}
              </div>

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
                  placeholder="Choose a password"
                  autoComplete="new-password"
                />
                {form.errors.password && <p className="mt-2 text-sm text-hot">{form.errors.password}</p>}
              </div>

              <div>
                <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[.14em] faint">Confirm password</label>
                <input
                  type="password"
                  value={form.data.password_confirmation}
                  onChange={(event) => form.setData('password_confirmation', event.target.value)}
                  className="w-full rounded-2xl border border-black/[.08] bg-white px-4 py-3 text-[14px] outline-none transition focus:border-accent/45 dark:border-white/[.12] dark:bg-white/[.04]"
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                />
              </div>

              <button type="submit" disabled={form.processing} className="btn-accent h-12 w-full text-sm">
                {form.processing ? 'Creating account…' : 'Create account'}
              </button>
            </form>

            <p className="mt-5 text-center text-[13px] muted">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-accent underline-offset-4 hover:underline dark:text-accent-glow">
                Log in
              </Link>
            </p>
          </div>
        </div>

        <AppFooter label="VVF account creation" className="mt-12" />
      </div>
    </>
  );
}
