import { Head, usePage } from '@inertiajs/react';
import AppFooter from './components/AppFooter.jsx';

export default function Home({ stack, integrations }) {
    const { props } = usePage();
    const status = props.flash?.status;

    return (
        <>
            <Head title="Project Base" />

            <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.18),_transparent_32%),linear-gradient(160deg,_#0c0a09,_#1c1917_55%,_#0f172a)]">
                <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 py-10 lg:px-10">
                    <section className="rounded-3xl border border-white/10 bg-white/6 p-8 shadow-2xl shadow-orange-950/20 backdrop-blur">
                        <p className="text-sm uppercase tracking-[0.35em] text-orange-300">
                            Laravel + React Starter
                        </p>
                        <h1 className="mt-4 max-w-3xl font-serif text-4xl leading-tight text-white md:text-6xl">
                            A base app for content ops, scraping workflows, and paid access.
                        </h1>
                        <p className="mt-5 max-w-2xl text-base text-stone-300 md:text-lg">
                            This starter is wired for Inertia React on the frontend, Laravel on the
                            backend, PostgreSQL for persistence, and Redis for cache, queues, and sessions.
                        </p>

                        {status ? (
                            <div className="mt-6 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                                {status}
                            </div>
                        ) : null}
                    </section>

                    <section className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
                        <article className="rounded-3xl border border-white/10 bg-black/20 p-6">
                            <h2 className="text-xl font-semibold text-white">Stack</h2>
                            <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                {Object.entries(stack).map(([label, value]) => (
                                    <div
                                        key={label}
                                        className="rounded-2xl border border-white/10 bg-white/5 p-4"
                                    >
                                        <p className="text-xs uppercase tracking-[0.25em] text-stone-400">
                                            {label}
                                        </p>
                                        <p className="mt-2 text-lg text-stone-100">{value}</p>
                                    </div>
                                ))}
                            </div>
                        </article>

                        <article className="rounded-3xl border border-white/10 bg-black/20 p-6">
                            <h2 className="text-xl font-semibold text-white">Integrations</h2>
                            <div className="mt-5 space-y-3">
                                {integrations.map((integration) => (
                                    <div
                                        key={integration}
                                        className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-stone-200"
                                    >
                                        {integration}
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 rounded-2xl border border-orange-300/20 bg-orange-400/10 p-4 text-sm text-orange-100">
                                Google auth routes and service env keys are stubbed. Stripe and Apify credentials are ready to drop into <code>.env</code>.
                            </div>
                        </article>
                    </section>

                    <AppFooter
                        label="VVF starter shell"
                        className="mt-auto border-white/10 bg-white/5 dark:border-white/10 dark:bg-white/5"
                    />
                </div>
            </main>
        </>
    );
}
