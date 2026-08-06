import { Head, router } from '@inertiajs/react';

import SearchShell from '../../landing/flow/SearchShell.jsx';
import { Arrow, Trend, Plus } from '../../landing/components/Icons.jsx';

const STATUS = {
    scraping: { label: 'Refreshing', className: 'border-accent/25 bg-accent/10 text-accent dark:text-accent-glow' },
    done: { label: 'Ready', className: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
    paused: { label: 'Paused', className: 'border-black/[.1] muted dark:border-white/[.15]' },
    failed: { label: 'Failed', className: 'border-hot/25 bg-hot/10 text-hot' },
};

function formatDate(iso) {
    return iso ? new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—';
}

export default function Index({ searches }) {
    return (
        <>
            <Head title="Saved searches — VVF" />

            <SearchShell
                pill={{ text: `${searches.length} saved`, tone: 'accent' }}
                onNewSearch={() => router.visit('/')}
                onExit={() => router.visit('/')}
                width="max-w-5xl"
            >
                <div className="animate-fade-up">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <h1 className="font-display text-[28px] leading-tight font-bold tracking-[-.025em] sm:text-[36px]">
                                Saved searches
                            </h1>
                            <p className="mt-2.5 text-[13.5px] muted">
                                Each one re-runs on its own schedule and keeps the top matches.
                            </p>
                        </div>

                        <button onClick={() => router.visit('/')} className="btn-accent h-11 px-5 text-sm">
                            <Plus className="h-3.5 w-3.5" /> New search
                        </button>
                    </div>

                    {searches.length === 0 ? (
                        <div className="ring-gradient mt-8 rounded-3xl bg-white/70 p-12 text-center backdrop-blur-2xl dark:bg-white/[.04]">
                            <h2 className="font-display text-[20px] font-bold">Nothing saved yet</h2>
                            <p className="mx-auto mt-3 max-w-sm text-[13.5px] leading-relaxed muted">
                                Run a search from the home page and it will land here, refreshing on the cadence you
                                pick.
                            </p>
                            <button onClick={() => router.visit('/')} className="btn-accent mx-auto mt-6 h-11 px-5 text-sm">
                                Run your first search <Arrow />
                            </button>
                        </div>
                    ) : (
                        <div className="mt-8 grid gap-4 sm:grid-cols-2">
                            {searches.map((s) => {
                                const status = STATUS[s.status] ?? STATUS.done;

                                return (
                                    <button
                                        key={s.id}
                                        onClick={() => router.visit(s.url)}
                                        className="surface-hover p-5 text-left"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <h2 className="font-display text-[16px] font-bold">{s.name}</h2>
                                            <span
                                                className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${status.className}`}
                                            >
                                                {status.label}
                                            </span>
                                        </div>

                                        <p className="mt-1.5 truncate text-[12.5px] faint">{s.phrase}</p>

                                        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] muted">
                                            <span className="flex items-center gap-1.5 font-semibold">
                                                <Trend className="h-3 w-3 text-hot" />
                                                {s.result_count} videos
                                            </span>
                                            <span className="capitalize">{s.frequency}</span>
                                            <span>Last run {formatDate(s.last_run_at)}</span>
                                        </div>

                                        <div className="mt-4 flex flex-wrap gap-1.5">
                                            {s.keywords.slice(0, 3).map((k) => (
                                                <span
                                                    key={k}
                                                    className="rounded-lg border border-black/[.06] bg-black/[.03] px-2 py-1 text-[11.5px] faint dark:border-white/[.08] dark:bg-white/[.05]"
                                                >
                                                    {k}
                                                </span>
                                            ))}
                                            {s.keywords.length > 3 && (
                                                <span className="px-1 py-1 text-[11.5px] faint">
                                                    +{s.keywords.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </SearchShell>
        </>
    );
}
