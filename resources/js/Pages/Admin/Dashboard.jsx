import { Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
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

const SOURCE_COLORS = ['#19c7bd', '#ff2d78', '#f6a819', '#7f80ff', '#8bbd4d'];

function sourceColor(index) {
    return SOURCE_COLORS[index % SOURCE_COLORS.length];
}

function AcquisitionDashboard({ acquisition = {} }) {
    const metrics = acquisition.metrics ?? [];
    const [activeKey, setActiveKey] = useState('page_views');
    const [sourceFilter, setSourceFilter] = useState('all');
    const activeMetric = metrics.find((metric) => metric.key === activeKey && !metric.locked) ?? metrics.find((metric) => !metric.locked);
    const details = acquisition.details?.[activeMetric?.key] ?? { total: 0, sources: [], rows: [] };
    const rows = sourceFilter === 'all' ? details.rows : details.rows.filter((row) => row.source === sourceFilter);
    const metricLabel = activeMetric?.label ?? 'Acquisition';

    const selectMetric = (metric) => {
        if (metric.locked) {
            return;
        }

        setActiveKey(metric.key);
        setSourceFilter('all');
    };

    return (
        <section className="overflow-hidden rounded-2xl border border-[#dce4f0] bg-[linear-gradient(135deg,_#ffffff_0%,_#f6f9ff_100%)] p-4 shadow-[0_18px_42px_-32px_rgba(50,85,150,.45)] sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <p className="text-[10px] font-semibold tracking-[.22em] text-[#188fb7] uppercase">Acquisition</p>
                    <h3 className="mt-1 text-[17px] font-semibold text-[var(--ink)]">Where they come from</h3>
                </div>
                <span className="rounded-full border border-[#dce4f0] bg-white px-2.5 py-1 text-[10px] font-semibold tracking-[.12em] text-[#74849a] uppercase">
                    {acquisition.rangeLabel ?? 'Current range'}
                </span>
            </div>

            <div className="mt-3 grid grid-cols-2 overflow-hidden rounded-2xl border border-[#dce4f0] bg-[#fbfdff] sm:grid-cols-4">
                {metrics.map((metric) => {
                    const active = activeMetric?.key === metric.key;

                    return (
                        <button
                            key={metric.key}
                            type="button"
                            disabled={metric.locked}
                            onClick={() => selectMetric(metric)}
                            className={`min-h-[62px] border-b border-[#e8edf5] px-3 py-2.5 text-left transition odd:border-r sm:border-r sm:border-b-0 last:sm:border-r-0 ${
                                active
                                    ? 'bg-white ring-1 ring-inset ring-[#49d4ef]'
                                    : metric.locked
                                      ? 'cursor-not-allowed bg-[#f6f7fa] opacity-55'
                                      : 'hover:bg-white'
                            }`}
                        >
                            <span className="block text-[9px] font-semibold tracking-[.16em] text-[#7b8ba0] uppercase">{metric.label}</span>
                            <span className="mt-1.5 flex items-center gap-2 text-[21px] leading-none font-bold text-[var(--ink)]">
                                {metric.locked ? 'Locked' : metric.value.toLocaleString()}
                                {active && <span className="rounded-full bg-[#dff7fc] px-1.5 py-0.5 text-[8px] font-semibold tracking-[.1em] text-[#2388a4] uppercase">Active</span>}
                            </span>
                        </button>
                    );
                })}
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-[14px] font-semibold text-[var(--ink)]">{metricLabel}</h4>
                <strong className="text-[23px] leading-none tracking-[-.04em] text-[var(--ink)]">{details.total.toLocaleString()}</strong>
            </div>

            <div className="mt-3 flex h-1.5 overflow-hidden rounded-full bg-[#e9eef5]">
                {details.sources.map((source, index) => (
                    <span key={source.source} style={{ width: `${source.percentage}%`, backgroundColor: sourceColor(index) }} />
                ))}
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
                <button
                    type="button"
                    onClick={() => setSourceFilter('all')}
                    className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-[.08em] uppercase transition ${
                        sourceFilter === 'all' ? 'border-[#49d4ef] bg-[#ebfbff] text-[#2388a4]' : 'border-[#dce4f0] bg-white text-[#718197]'
                    }`}
                >
                    All - {details.total}
                </button>
                {details.sources.map((source, index) => (
                    <button
                        key={source.source}
                        type="button"
                        onClick={() => setSourceFilter(source.source)}
                        className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-[.08em] uppercase transition ${
                            sourceFilter === source.source ? 'border-[#49d4ef] bg-[#ebfbff] text-[#2388a4]' : 'border-[#dce4f0] bg-white text-[#718197]'
                        }`}
                    >
                        <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: sourceColor(index) }} />
                        {source.source} - {source.count}
                    </button>
                ))}
            </div>

            <div className="mt-3 max-h-[236px] overflow-y-auto rounded-xl border border-[#dce4f0] bg-white">
                {rows.length === 0 ? (
                    <p className="px-4 py-8 text-center text-[12px] text-[#718197]">No {metricLabel.toLowerCase()} recorded in this range.</p>
                ) : (
                    rows.map((row) => (
                        <div key={row.id} className="flex items-center justify-between gap-3 border-b border-[#e8edf5] px-3 py-2.5 last:border-b-0">
                            <div className="min-w-0">
                                <p className="truncate text-[12px] font-semibold text-[var(--ink)]">{row.name}</p>
                                <p className="truncate text-[10px] text-[#718197]">{row.email}</p>
                                <div className="mt-1 flex flex-wrap gap-1">
                                    <span className="rounded bg-[#e8faff] px-1.5 py-0.5 text-[9px] font-semibold text-[#2388a4] capitalize">{row.source}</span>
                                    <span className="rounded bg-[#f1f4f8] px-1.5 py-0.5 text-[9px] text-[#718197]">{row.date ? formatDay(row.date.slice(0, 10)) : '-'}</span>
                                </div>
                            </div>
                            <span className="shrink-0 rounded-full border border-[#dce4f0] px-2 py-1 text-[9px] font-semibold tracking-[.08em] text-[#718197] uppercase">{row.meta}</span>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}

const FUNNEL_TONES = {
    teal: 'bg-[#20cfc2]',
    amber: 'bg-[#ffae19]',
    blue: 'bg-[#7f80ff]',
    rose: 'bg-[#fb5c6a]',
};

function ConversionFunnel({ funnel = {} }) {
    const steps = funnel.steps ?? [];

    return (
        <section className="rounded-2xl border border-[#dce4f0] bg-[linear-gradient(135deg,_#ffffff_0%,_#f6f9ff_100%)] p-4 shadow-[0_18px_42px_-32px_rgba(50,85,150,.45)] sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <p className="text-[10px] font-semibold tracking-[.22em] text-[#188fb7] uppercase">Funnel</p>
                    <h3 className="mt-1 text-[17px] font-semibold text-[var(--ink)]">Conversion funnel</h3>
                </div>
                <span className="text-[10px] font-medium text-[#718197]">Same selected range</span>
            </div>

            <div className="mt-5 space-y-3">
                {steps.map((step) => (
                    <div key={step.key} className="grid grid-cols-[58px_1fr_78px] items-center gap-2 sm:grid-cols-[54px_1fr_112px] sm:gap-3">
                        <span className="text-[10.5px] leading-tight font-medium text-[#55667d]">{step.label}</span>
                        <div className="flex items-center gap-2">
                            <strong className="w-7 text-[12px] text-[var(--ink)]">{step.value.toLocaleString()}</strong>
                            <div className="h-3 flex-1 overflow-hidden rounded-full bg-[#edf1f6]">
                                <span
                                    className={`block h-full rounded-full ${FUNNEL_TONES[step.tone] ?? FUNNEL_TONES.teal}`}
                                    style={{ width: `${step.percentage}%` }}
                                />
                            </div>
                        </div>
                        <span className="text-right text-[10px] text-[#718197]">
                            {step.key === 'signups' ? step.caption : `${step.percentage.toFixed(1)}% ${step.caption}`}
                        </span>
                    </div>
                ))}
            </div>
        </section>
    );
}

const ACTIVITY_TONES = { sign_up: '#20cfc2', subscription: '#ee4393', engagement: '#7b5cff', coupon_usage: '#f6a819' };
const ACTIVITY_FILTERS = [
    ['all', 'All'],
    ['sign_up', 'Sign up'],
    ['subscription', 'Subscription'],
    ['engagement', 'Engagement'],
    ['coupon_usage', 'Coupon'],
];

function RecentActivity({ activity = {} }) {
    const [filter, setFilter] = useState('all');
    const rows = (activity.rows ?? []).filter((row) => filter === 'all' || row.category === filter);

    return (
        <section className="rounded-2xl border border-[#dce4f0] bg-[linear-gradient(135deg,_#ffffff_0%,_#f6f9ff_100%)] p-4 shadow-[0_18px_42px_-32px_rgba(50,85,150,.45)] sm:p-5">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-[10px] font-semibold tracking-[.22em] text-[#ed3d8d] uppercase">Activity</p>
                    <h3 className="mt-1 text-[17px] font-semibold text-[var(--ink)]">Recent activity</h3>
                </div>
                <Link href="/x/admin/activity" className="text-[11px] font-semibold text-[#ed3d8d] transition hover:text-[#b82367]">
                    Show All -&gt;
                </Link>
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">
                {ACTIVITY_FILTERS.map(([key, label]) => (
                    <button
                        key={key}
                        type="button"
                        onClick={() => setFilter(key)}
                        className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold transition ${
                            filter === key ? 'border-[#ed3d8d] bg-[#fbe1ef] text-[#b82367]' : 'border-[#dce4f0] bg-white text-[#718197]'
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>
            <div className="mt-4 rounded-xl border border-[#dce4f0] bg-white">
                {rows.length === 0 ? (
                    <p className="px-4 py-8 text-center text-[12px] text-[#718197]">No recent activity matches this filter.</p>
                ) : (
                    rows.map((row) => (
                        <div key={row.id} className="flex gap-2.5 border-b border-[#e8edf5] px-3 py-2.5 last:border-b-0">
                            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: ACTIVITY_TONES[row.category] ?? '#718197' }} />
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-1.5">
                                    <strong className="text-[12px] text-[var(--ink)]">{row.name}</strong>
                                    <span className="rounded-full border border-[#dce4f0] px-1.5 py-0.5 text-[8px] font-semibold tracking-[.1em] text-[#53657d] uppercase">{row.category.replace('_', ' ')}</span>
                                    <span className="rounded-full bg-[#f1f4f8] px-1.5 py-0.5 text-[8px] font-semibold tracking-[.08em] text-[#718197] uppercase">{row.date ? formatDay(row.date.slice(0, 10)) : '-'}</span>
                                </div>
                                <p className="mt-1 text-[10.5px] text-[#718197]">{row.summary}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}

function CouponProgramsPanel({ coupons = {} }) {
    const programs = coupons.programs ?? [];
    const alerts = coupons.alerts ?? [];
    const recent = coupons.recent ?? [];

    if (programs.length === 0) return null;

    return (
        <section className="rounded-2xl border border-[var(--line)] bg-white p-4 shadow-[0_1px_2px_rgba(20,15,0,.04),0_16px_32px_-26px_rgba(20,15,0,.18)] sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <p className="text-[10px] font-semibold tracking-[.22em] text-[var(--amber-ink)] uppercase">Coupons</p>
                    <h3 className="mt-1 text-[17px] font-semibold text-[var(--ink)]">Program redemptions</h3>
                </div>
            </div>

            {alerts.length > 0 && (
                <div className="mt-3 flex flex-col gap-1.5">
                    {alerts.map((alert) => (
                        <div
                            key={`${alert.program}-${alert.type}`}
                            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-[11.5px] font-medium ${
                                alert.type === 'full'
                                    ? 'border-[rgba(154,52,18,.25)] bg-[var(--warn-bg)] text-[var(--warn)]'
                                    : 'border-[var(--yellow)] bg-[var(--wash)] text-[var(--amber-ink)]'
                            }`}
                        >
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            {alert.message}
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {programs.map((program) => {
                    const pct = program.max ? Math.min(100, Math.round((program.redeemed / program.max) * 100)) : 0;
                    return (
                        <div key={program.code} className="rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3.5 py-3">
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-[12.5px] font-bold text-[var(--ink)]">{program.code}</span>
                                <span className={`text-[10px] font-semibold uppercase tracking-[.08em] ${program.active ? 'text-[var(--ok)]' : 'text-[var(--faint)]'}`}>
                                    {program.active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <div className="mt-2 flex items-baseline gap-1.5">
                                <span className="text-[20px] font-bold tracking-[-.02em] text-[var(--ink)] [font-variant-numeric:tabular-nums]">{program.redeemed}</span>
                                <span className="text-[12px] text-[var(--faint)]">/ {program.max ?? '∞'} redeemed</span>
                            </div>
                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#edebe4]">
                                <span className={`block h-full rounded-full ${program.full ? 'bg-[var(--warn)]' : program.low ? 'bg-[var(--yellow)]' : 'bg-[var(--ok)]'}`} style={{ width: `${pct}%` }} />
                            </div>
                            <p className="mt-1.5 text-[10.5px] text-[var(--faint)]">
                                {program.remaining === null ? 'No cap' : `${program.remaining} slots left`}
                            </p>
                        </div>
                    );
                })}
            </div>

            {recent.length > 0 && (
                <div className="mt-4">
                    <p className="mb-2 text-[11px] font-semibold tracking-[.08em] text-[var(--faint)] uppercase">Recent redemptions</p>
                    <div className="rounded-xl border border-[var(--line)] bg-white">
                        {recent.map((row, i) => (
                            <div key={i} className="flex items-center gap-3 border-b border-[var(--line)] px-3 py-2.5 last:border-b-0">
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-[12px] font-semibold text-[var(--ink)]">{row.name}</p>
                                    <p className="truncate text-[10.5px] text-[var(--faint)]">{row.email}</p>
                                </div>
                                <span className="shrink-0 rounded-full bg-[var(--wash)] px-2 py-0.5 text-[9px] font-semibold tracking-[.06em] text-[var(--amber-ink)] uppercase">{row.program}</span>
                                <span className="shrink-0 text-[10.5px] text-[var(--faint)]">{row.redeemedAt ? formatDay(row.redeemedAt.slice(0, 10)) : '-'}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}

export default function Dashboard({ trend = [], stats = [], snapshot = {}, range = '30D', ranges = [], acquisition = {}, activity = {}, coupons = {} }) {
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
                        {formatDay(snapshot.rangeStart)} - {formatDay(snapshot.rangeEnd)}
                        <span className="hidden sm:inline"> · {snapshot.rangeStart} to {snapshot.rangeEnd}</span>
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

            <div className="mt-3 grid grid-cols-2 gap-2 min-[420px]:grid-cols-3 sm:gap-3 lg:grid-cols-5">
                {stats.map((card) => (
                    <StatCard key={card.key} card={card} />
                ))}
            </div>

            <div className="mt-3">
                <ConversionFunnel funnel={acquisition.funnel} />
            </div>
            <div className="mt-3 grid gap-3 xl:grid-cols-2">
                <RecentActivity activity={activity} />
                <AcquisitionDashboard acquisition={acquisition} />
            </div>
            <div className="mt-3">
                <CouponProgramsPanel coupons={coupons} />
            </div>
        </AdminLayout>
    );
}
