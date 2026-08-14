import { router, useForm } from '@inertiajs/react';
import AdminTrendChart from '../../components/admin/AdminTrendChart.jsx';
import AdminLayout from './components/AdminLayout.jsx';

function formatDay(value) {
    if (!value) {
        return '-';
    }

    return new Date(`${value}T00:00:00Z`).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
    });
}

function StatCard({ card }) {
    const delta = card.delta;

    return (
        <div className="rounded-xl border border-[var(--line)] bg-white px-3.5 py-3 shadow-[0_1px_2px_rgba(20,15,0,.04),0_12px_28px_-22px_rgba(20,15,0,.18)]">
            <p className="text-[10px] font-semibold tracking-[.16em] text-[var(--faint)] uppercase">{card.label}</p>
            <p className="mt-2 text-[26px] leading-none font-bold tracking-[-.02em] text-[var(--ink)]">
                {card.value.toLocaleString()}
            </p>
            <p className="mt-2 text-[11px] text-[var(--faint)]">
                {typeof delta === 'number' && delta !== 0 ? (
                    <span className={delta > 0 ? 'text-[var(--ok)]' : 'text-[var(--warn)]'}>
                        {delta > 0 ? '↑' : '↓'} {Math.abs(delta).toLocaleString()} vs prev
                    </span>
                ) : (
                    card.caption
                )}
            </p>
        </div>
    );
}

export default function Dashboard({ trend = [], stats = [], snapshot = {}, range = '30D', ranges = [] }) {
    const refresh = useForm({});

    const selectRange = (next) => {
        router.get('/x/admin', { range: next }, { preserveScroll: true, preserveState: true, replace: true });
    };

    return (
        <AdminLayout title="Dashboard" section="dashboard" showHeader={false}>
            <section className="rounded-2xl border border-[var(--line)] bg-[linear-gradient(135deg,_#fffaf0_0%,_#fff4cf_42%,_#faf9f6_100%)] px-5 py-5 shadow-[0_1px_2px_rgba(20,15,0,.04),0_24px_48px_-34px_rgba(255,198,41,.7)]">
                <p className="text-[10px] font-semibold tracking-[.22em] text-[var(--amber-ink)] uppercase">Admin dashboard</p>
                <h2 className="mt-1.5 text-[26px] font-bold tracking-[-.03em] text-[var(--ink)]">Admin Dashboard</h2>

                <div className="mt-3 flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center rounded-md border border-[var(--yellow)] bg-[var(--wash)] px-2 py-1 text-[10px] font-semibold tracking-[.16em] text-[var(--amber-ink)] uppercase">
                        {snapshot.capturedAt ? 'Snapshot loaded' : 'No snapshot'}
                    </span>
                    <span className="text-[12px] text-[var(--muted)]">
                        {formatDay(snapshot.rangeStart)} - {formatDay(snapshot.rangeEnd)} · {snapshot.rangeStart} to {snapshot.rangeEnd}
                    </span>
                    <button
                        type="button"
                        disabled={refresh.processing}
                        onClick={() => refresh.post('/x/admin/dashboard/refresh', { preserveScroll: true })}
                        className="ml-auto h-8 rounded-md border border-[var(--line)] bg-white px-3 text-[12.5px] font-medium text-[var(--ink)] transition hover:border-[var(--yellow)] hover:bg-[var(--wash)] disabled:opacity-50"
                    >
                        {refresh.processing ? 'Refreshing...' : 'Refresh data'}
                    </button>
                </div>
            </section>

            <section className="mt-3 rounded-2xl border border-[var(--line)] bg-white px-5 py-4 shadow-[0_1px_2px_rgba(20,15,0,.04),0_16px_32px_-26px_rgba(20,15,0,.18)]">
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <p className="text-[10px] font-semibold tracking-[.22em] text-[var(--amber-ink)] uppercase">Growth</p>
                        <h3 className="mt-1 text-[17px] font-semibold text-[var(--ink)]">Daily momentum</h3>
                    </div>
                    <div className="flex items-center gap-1">
                        {ranges.map((option) => (
                            <button
                                key={option}
                                type="button"
                                onClick={() => selectRange(option)}
                                className={`h-7 rounded-md px-2.5 text-[11.5px] font-semibold transition ${
                                    option === range
                                        ? 'bg-[var(--yellow)] text-[#1a1400]'
                                        : 'text-[var(--muted)] hover:bg-[var(--wash)] hover:text-[var(--ink)]'
                                }`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>

                <AdminTrendChart points={trend} />
            </section>

            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {stats.map((card) => (
                    <StatCard key={card.key} card={card} />
                ))}
            </div>
        </AdminLayout>
    );
}
