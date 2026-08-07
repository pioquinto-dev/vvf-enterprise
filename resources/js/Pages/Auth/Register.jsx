import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

import AppFooter from '../components/AppFooter.jsx';

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.2-.9 2.3-1.9 3l3.1 2.4c1.8-1.7 2.9-4.1 2.9-7 0-.7-.1-1.4-.2-2H12z" />
      <path fill="#34A853" d="M12 22c2.6 0 4.7-.8 6.3-2.4l-3.1-2.4c-.8.6-1.9 1-3.2 1-2.4 0-4.5-1.7-5.2-3.9l-3.2 2.5C5.2 19.8 8.3 22 12 22z" />
      <path fill="#4A90E2" d="M6.8 14.3c-.2-.6-.3-1.2-.3-1.8s.1-1.2.3-1.8L3.6 8.2C2.9 9.6 2.5 11 2.5 12.5s.4 2.9 1.1 4.3l3.2-2.5z" />
      <path fill="#FBBC05" d="M12 6.8c1.4 0 2.7.5 3.7 1.4l2.8-2.8C16.7 3.8 14.6 3 12 3 8.3 3 5.2 5.2 3.6 8.2l3.2 2.5c.7-2.2 2.8-3.9 5.2-3.9z" />
    </svg>
  );
}

function PasswordField({ value, onChange, placeholder, autoComplete }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        className="field h-12 pr-12 text-[14px]"
        placeholder={placeholder}
        autoComplete={autoComplete}
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        className="absolute top-1/2 right-3 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-ink/40 transition hover:bg-black/[.04] hover:text-ink dark:text-white/40 dark:hover:bg-white/[.06] dark:hover:text-white"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M1.5 12s3.8-6 10.5-6 10.5 6 10.5 6-3.8 6-10.5 6S1.5 12 1.5 12Z" />
          <circle cx="12" cy="12" r="3.2" />
        </svg>
      </button>
    </div>
  );
}

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
      <Head title="Sign up - Outlier Vault" />

      <div className="vvf-landing relative flex min-h-screen flex-col overflow-hidden px-4 py-10 sm:px-6">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="bg-grid mask-radial-fade absolute inset-0" />
          <div className="absolute top-[-12%] left-1/2 h-[420px] w-[760px] -translate-x-1/2 rounded-full bg-hot/10 blur-[150px]" />
        </div>

        <div className="mx-auto flex w-full max-w-5xl items-center justify-between">
          <Link href="/" className="font-display text-[20px] font-bold tracking-[-.02em]">
            Outlier Vault
          </Link>
          <Link href="/login" className="btn-ghost h-10 px-4 text-sm">
            Sign in
          </Link>
        </div>

        <div className="mx-auto mt-12 flex w-full max-w-5xl flex-1 items-center justify-center">
          <div className="w-full max-w-[430px] rounded-[26px] border border-black/[.06] bg-white/90 p-8 shadow-[0_28px_90px_-50px_rgba(16,18,32,.42)] backdrop-blur-xl dark:border-white/[.08] dark:bg-white/[.05] sm:p-9">
            <h1 className="font-display text-[30px] font-bold tracking-[-.04em] text-ink sm:text-[40px] dark:text-white">
              Create your <span className="text-[#3568f3] italic">account</span>
            </h1>
            <p className="mt-1 text-[15px] muted">Sign up to start tracking viral videos with your team.</p>

            <a
              href="/auth/google"
              className="mt-6 flex h-12 w-full items-center justify-center gap-3 rounded-full bg-[#2f2a2a] px-5 text-[15px] font-semibold text-white shadow-[0_18px_40px_-26px_rgba(0,0,0,.55)] transition hover:opacity-95"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
                <GoogleMark />
              </span>
              Continue with Google
            </a>

            <div className="mt-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-black/[.08] dark:bg-white/[.1]" />
              <span className="text-[12px] font-semibold tracking-[.14em] faint uppercase">Or</span>
              <div className="h-px flex-1 bg-black/[.08] dark:bg-white/[.1]" />
            </div>

            <form onSubmit={submit} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-[14px] font-semibold text-ink dark:text-white">Name</label>
                <input
                  type="text"
                  value={form.data.name}
                  onChange={(event) => form.setData('name', event.target.value)}
                  className="field h-12 text-[14px]"
                  placeholder="Your name"
                  autoComplete="name"
                />
                {form.errors.name && <p className="mt-2 text-sm text-hot">{form.errors.name}</p>}
              </div>

              <div>
                <label className="mb-2 block text-[14px] font-semibold text-ink dark:text-white">Email</label>
                <input
                  type="email"
                  value={form.data.email}
                  onChange={(event) => form.setData('email', event.target.value)}
                  className="field h-12 text-[14px]"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
                {form.errors.email && <p className="mt-2 text-sm text-hot">{form.errors.email}</p>}
              </div>

              <div>
                <label className="mb-2 block text-[14px] font-semibold text-ink dark:text-white">Password</label>
                <PasswordField
                  value={form.data.password}
                  onChange={(event) => form.setData('password', event.target.value)}
                  placeholder="Create a password"
                  autoComplete="new-password"
                />
                {form.errors.password && <p className="mt-2 text-sm text-hot">{form.errors.password}</p>}
              </div>

              <div>
                <label className="mb-2 block text-[14px] font-semibold text-ink dark:text-white">Confirm password</label>
                <PasswordField
                  value={form.data.password_confirmation}
                  onChange={(event) => form.setData('password_confirmation', event.target.value)}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                />
              </div>

              <button type="submit" disabled={form.processing} className="mt-2 h-12 w-full rounded-full bg-[#3568f3] text-[15px] font-semibold text-white shadow-[0_20px_45px_-26px_rgba(53,104,243,.8)] transition hover:opacity-95 disabled:opacity-50">
                {form.processing ? 'Creating account...' : 'Sign up'}
              </button>
            </form>

            <p className="mt-6 text-center text-[14px] muted">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-[#3568f3] hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <AppFooter label="Outlier Vault sign up" className="mt-12" />
      </div>
    </>
  );
}
