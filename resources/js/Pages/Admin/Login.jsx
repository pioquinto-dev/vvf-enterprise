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
                className="field h-12 rounded-2xl border-white/[.08] bg-white/[.04] pr-12 text-[14px] text-white placeholder:text-white/28"
                placeholder="Enter root password"
                autoComplete="current-password"
            />
            <button
                type="button"
                onClick={() => setVisible((current) => !current)}
                className="absolute top-1/2 right-3 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-white/40 transition hover:bg-white/[.06] hover:text-white"
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

        document.documentElement.classList.add('dark');

        return () => {
            document.documentElement.classList.remove('dark');
        };
    }, []);

    const submit = (event) => {
        event.preventDefault();
        form.post('/x/admin/login');
    };

    return (
        <>
            <Head title="Admin Login - Outlier Vault" />

            <div className="min-h-screen bg-[#090b16] px-4 py-8 text-white sm:px-6">
                <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,61,113,.12),_transparent_26%),radial-gradient(circle_at_30%_20%,_rgba(109,75,255,.18),_transparent_34%),linear-gradient(180deg,_#0b0d18,_#090b16)]" />
                    <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,rgba(255,255,255,.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.04)_1px,transparent_1px)] [background-size:44px_44px]" />
                </div>

                <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
                    <section className="w-full max-w-[560px] rounded-[32px] border border-white/[.06] bg-[#101321]/94 p-7 shadow-[0_32px_120px_-52px_rgba(0,0,0,.95)] backdrop-blur-xl sm:p-8">
                        <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/[.08] bg-white/[.04] px-4 py-2 text-[11px] font-semibold tracking-[.18em] text-white/58 uppercase">
                            <Logo className="h-7 w-7" />
                            VVF Admin
                        </div>

                        <section className="rounded-[28px] border border-white/[.04] bg-[#0d1020]/65 p-6 sm:p-7">
                            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-hot to-accent shadow-[0_16px_40px_-20px_rgba(255,61,113,.8)]">
                                <Lock className="h-6 w-6 text-white" />
                            </div>
                            <h2 className="mt-6 text-[34px] font-bold tracking-[-.05em]">Admin login</h2>
                            <p className="mt-2 text-[14px] leading-6 text-white/52">
                                Sign in with the root credentials from the environment configuration.
                            </p>

                            <form onSubmit={submit} className="mt-8 space-y-4">
                                <div>
                                    <label className="mb-2 block text-[13px] font-semibold text-white/76">Email</label>
                                    <input
                                        type="email"
                                        value={form.data.email}
                                        onChange={(event) => form.setData('email', event.target.value)}
                                        className="field h-12 rounded-2xl border-white/[.08] bg-white/[.04] text-[14px] text-white placeholder:text-white/28"
                                        placeholder="admin@example.com"
                                        autoComplete="email"
                                    />
                                    {form.errors.email && <p className="mt-2 text-sm text-hot">{form.errors.email}</p>}
                                </div>

                                <div>
                                    <label className="mb-2 block text-[13px] font-semibold text-white/76">Password</label>
                                    <PasswordField
                                        value={form.data.password}
                                        onChange={(event) => form.setData('password', event.target.value)}
                                    />
                                    {form.errors.password && <p className="mt-2 text-sm text-hot">{form.errors.password}</p>}
                                </div>

                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-linear-to-r from-hot to-accent text-[14px] font-semibold text-white shadow-[0_22px_46px_-26px_rgba(109,75,255,.95)] transition hover:opacity-95 disabled:opacity-50"
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
