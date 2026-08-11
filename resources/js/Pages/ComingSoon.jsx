import { Head, useForm, usePage } from '@inertiajs/react';

export default function ComingSoon() {
    const { flash = {} } = usePage().props;
    const form = useForm({
        email: '',
    });

    const submit = (event) => {
        event.preventDefault();
        form.post('/coming-soon-interest', {
            preserveScroll: true,
            onSuccess: () => form.reset('email'),
        });
    };

    return (
        <>
            <Head title="Coming Soon - Outlier Vault" />

            <div className="vvf-landing relative min-h-screen overflow-hidden">
                <div aria-hidden className="pointer-events-none absolute inset-0">
                    <div className="bg-grid absolute inset-0 opacity-70" />
                    <div className="absolute top-[-12%] left-1/2 h-[420px] w-[780px] -translate-x-1/2 rounded-full bg-accent/18 blur-[160px]" />
                    <div className="absolute right-[-8%] bottom-[-12%] h-[360px] w-[360px] rounded-full bg-hot/12 blur-[140px]" />
                </div>

                <main className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center px-5 py-12 sm:px-8 lg:px-10">
                    <div className="grid w-full gap-10 lg:grid-cols-[1.15fr_.85fr] lg:items-center">
                        <section>
                            <div className="eyebrow">
                                <span className="inline-flex h-2 w-2 rounded-full bg-hot shadow-[0_0_0_6px_rgba(255,61,113,.14)]" />
                                Launching Soon
                            </div>

                            <h1 className="mt-6 max-w-3xl font-display text-[44px] leading-[0.95] font-bold tracking-[-0.05em] text-ink sm:text-[58px] lg:text-[76px] dark:text-white">
                                Viral intelligence for brands is almost <span className="text-gradient">ready</span>.
                            </h1>

                            <p className="mt-6 max-w-2xl text-[17px] leading-8 text-ink/72 dark:text-white/68">
                                Outlier Vault is getting its final polish. Leave your email and we&apos;ll notify you when the site is live so you can get early access.
                            </p>

                            <div className="mt-8 flex flex-wrap gap-3 text-sm text-ink/62 dark:text-white/62">
                                <span className="surface px-4 py-2">Track breakout TikTok content</span>
                                <span className="surface px-4 py-2">Spot brand and competitor momentum</span>
                                <span className="surface px-4 py-2">Join the launch list</span>
                            </div>
                        </section>

                        <section className="surface ring-gradient rounded-[28px] p-6 sm:p-8">
                            <div className="inline-flex rounded-full border border-accent/15 bg-accent-soft px-3 py-1 text-[11px] font-semibold tracking-[.16em] text-accent uppercase">
                                Notify Me
                            </div>

                            <h2 className="mt-5 font-display text-[30px] leading-tight font-bold tracking-[-0.04em] text-ink dark:text-white">
                                Be first in line when we open the doors.
                            </h2>

                            <p className="mt-3 text-[15px] leading-7 text-ink/65 dark:text-white/62">
                                We&apos;re collecting early interest now and will use this list to send launch updates once the app goes live.
                            </p>

                            {flash.status && (
                                <div className="mt-5 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
                                    {flash.status}
                                </div>
                            )}

                            <form onSubmit={submit} className="mt-6 space-y-4">
                                <div>
                                    <label htmlFor="coming-soon-email" className="mb-2 block text-sm font-semibold text-ink dark:text-white">
                                        Email address
                                    </label>
                                    <input
                                        id="coming-soon-email"
                                        type="email"
                                        value={form.data.email}
                                        onChange={(event) => form.setData('email', event.target.value)}
                                        className="field h-13"
                                        placeholder="you@example.com"
                                        autoComplete="email"
                                    />
                                    {form.errors.email && <p className="mt-2 text-sm text-hot">{form.errors.email}</p>}
                                </div>

                                <button type="submit" disabled={form.processing} className="btn-accent h-13 w-full px-5 text-sm">
                                    {form.processing ? 'Saving your interest...' : 'Notify me at launch'}
                                </button>
                            </form>

                            <p className="mt-4 text-xs leading-6 text-ink/48 dark:text-white/45">
                                One email per address is enough. We&apos;ll keep it for launch notification reference later on.
                            </p>
                        </section>
                    </div>
                </main>
            </div>
        </>
    );
}
