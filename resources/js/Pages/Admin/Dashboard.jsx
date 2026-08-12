import { router, useForm } from '@inertiajs/react';
import AdminTrendChart from '../../components/admin/AdminTrendChart.jsx';
import AdminLayout from './components/AdminLayout.jsx';

function formatDay(value) {
    if (!value) {
        return '—';
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
        <div className="rounded-xl border border-white/[.07] bg-[#0f1220] px-3.5 py-3">
            <p className="text-[10px] font-semibold tracking-[.16em] text-white/38 uppercase">{card.label}</p>
            <p className="mt-2 text-[26px] leading-none font-bold tracking-[-.02em] text-white">
                {card.value.toLocaleString()}
            </p>
            <p className="mt-2 text-[11px] text-white/38">
                {typeof delta === 'number' && delta !== 0 ? (
                    <span className={delta > 0 ? 'text-emerald-300' : 'text-rose-300'}>
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
            {/* Hero — identity, freshness, and the manual refresh in one band. */}
            <section className="rounded-2xl border border-white/[.07] bg-[linear-gradient(115deg,_#141033_0%,_#0f1326_45%,_#0b1020_100%)] px-5 py-5">
                <p className="text-[10px] font-semibold tracking-[.22em] text-hot uppercase">Admin dashboard</p>
                <h2 className="mt-1.5 text-[26px] font-bold tracking-[-.03em] text-white">Admin Dashboard</h2>

                <div className="mt-3 flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center rounded-md border border-emerald-400/30 bg-emerald-400/10 px-2 py-1 text-[10px] font-semibold tracking-[.16em] text-emerald-300 uppercase">
                        {snapshot.capturedAt ? 'Snapshot loaded' : 'No snapshot'}
                    </span>
                    <span className="text-[12px] text-white/45">
                        {formatDay(snapshot.rangeStart)} – {formatDay(snapshot.rangeEnd)} · {snapshot.rangeStart} to{' '}
                        {snapshot.rangeEnd}
                    </span>
                    <button
                        type="button"
                        disabled={refresh.processing}
                        onClick={() => refresh.post('/x/admin/dashboard/refresh', { preserveScroll: true })}
                        className="ml-auto h-8 rounded-md border border-white/[.12] bg-white/[.07] px-3 text-[12.5px] font-medium text-white transition hover:bg-white/[.12] disabled:opacity-50"
                    >
                        {refresh.processing ? 'Refreshing…' : 'Refresh data'}
                    </button>
                </div>
            </section>

            <section className="mt-3 rounded-2xl border border-white/[.07] bg-[#0c0f1e] px-5 py-4">
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <p className="text-[10px] font-semibold tracking-[.22em] text-hot uppercase">Growth</p>
                        <h3 className="mt-1 text-[17px] font-semibold text-white">Daily momentum</h3>
                    </div>
                    <div className="flex items-center gap-1">
                        {ranges.map((option) => (
                            <button
                                key={option}
                                type="button"
                                onClick={() => selectRange(option)}
                                className={`h-7 rounded-md px-2.5 text-[11.5px] font-semibold transition ${
                                    option === range
                                        ? 'bg-hot text-white'
                                        : 'text-white/45 hover:bg-white/[.06] hover:text-white'
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
