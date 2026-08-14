import { Head, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';

import { Lock, Logo } from '../../landing/components/Icons.jsx';

function PasswordField({ value, onChange }) {
    const [visible, setVisible] = useState(false);

    return (
        <div className="relative">
            <input
                type={visible ? 'text' : 'password'}
                value={value}
                onChange={onChange}
                className="field h-12 rounded-2xl border-[var(--line)] bg-white pr-12 text-[14px] text-[var(--ink)] placeholder:text-[var(--faint)]"
                placeholder="Enter root password"
                autoComplete="current-password"
            />
            <button
                type="button"
                onClick={() => setVisible((current) => !current)}
                className="absolute top-1/2 right-3 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-[var(--faint)] transition hover:bg-[var(--wash)] hover:text-[var(--ink)]"
            >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M1.5 12s3.8-6 10.5-6 10.5 6 10.5 6-3.8 6-10.5 6S1.5 12 1.5 12Z" />
                    <circle cx="12" cy="12" r="3.2" />
                </svg>
            </button>
        </div>
    );
}

export default function Login({ adminRootEmail = '' }) {
    const form = useForm({
        email: adminRootEmail,
        password: '',
    });

    useEffect(() => {
        if (typeof document === 'undefined') {
            return undefined;
        }

        document.documentElement.classList.remove('dark');

        return undefined;
    }, []);

    const submit = (event) => {
        event.preventDefault();
        form.post('/x/admin/login');
    };

    return (
        <>
            <Head title="Admin Login - Outlier Vault" />

            <div className="min-h-screen bg-[var(--canvas)] px-4 py-8 text-[var(--ink)] sm:px-6">
                <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,198,41,.22),_transparent_28%),linear-gradient(180deg,_#faf9f6,_#f5f4f0)]" />
                    <div className="absolute inset-0 opacity-45 [background-image:linear-gradient(to_right,rgba(92,90,84,.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(92,90,84,.06)_1px,transparent_1px)] [background-size:44px_44px]" />
                </div>

                <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
                    <section className="w-full max-w-[560px] rounded-[32px] border border-[var(--line)] bg-[rgba(250,249,246,.94)] p-7 shadow-[0_32px_120px_-52px_rgba(20,15,0,.28)] backdrop-blur-xl sm:p-8">
                        <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-[var(--line)] bg-white px-4 py-2 text-[11px] font-semibold tracking-[.18em] text-[var(--amber-ink)] uppercase">
                            <Logo className="h-7 w-7" />
                            VVF Admin
                        </div>

                        <section className="rounded-[28px] border border-[var(--line)] bg-white p-6 shadow-[0_1px_2px_rgba(20,15,0,.04),0_20px_40px_-28px_rgba(20,15,0,.18)] sm:p-7">
                            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--yellow)] shadow-[0_16px_40px_-20px_rgba(255,198,41,.85)]">
                                <Lock className="h-6 w-6 text-[#1a1400]" />
                            </div>
                            <h2 className="mt-6 text-[34px] font-bold tracking-[-.05em] text-[var(--ink)]">Admin login</h2>
                            <p className="mt-2 text-[14px] leading-6 text-[var(--muted)]">
                                Sign in with the root credentials from the environment configuration.
                            </p>

                            <form onSubmit={submit} className="mt-8 space-y-4">
                                <div>
                                    <label className="mb-2 block text-[13px] font-semibold text-[var(--body)]">Email</label>
                                    <input
                                        type="email"
                                        value={form.data.email}
                                        onChange={(event) => form.setData('email', event.target.value)}
                                        className="field h-12 rounded-2xl border-[var(--line)] bg-white text-[14px] text-[var(--ink)] placeholder:text-[var(--faint)]"
                                        placeholder="admin@example.com"
                                        autoComplete="email"
                                    />
                                    {form.errors.email && <p className="mt-2 text-sm text-[var(--warn)]">{form.errors.email}</p>}
                                </div>

                                <div>
                                    <label className="mb-2 block text-[13px] font-semibold text-[var(--body)]">Password</label>
                                    <PasswordField value={form.data.password} onChange={(event) => form.setData('password', event.target.value)} />
                                    {form.errors.password && <p className="mt-2 text-sm text-[var(--warn)]">{form.errors.password}</p>}
                                </div>

                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-[var(--yellow)] text-[14px] font-semibold text-[#1a1400] shadow-[0_22px_46px_-26px_rgba(255,198,41,.9)] transition hover:brightness-105 disabled:opacity-50"
                                >
                                    {form.processing ? 'Signing in...' : 'Sign in to admin'}
                                </button>
                            </form>
                        </section>
                    </section>
                </div>
            </div>
        </>
    );
}
