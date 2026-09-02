import { router } from '@inertiajs/react';
import AdminLayout from './components/AdminLayout.jsx';

const RANGES = ['7D', '30D', '6M', '1Y'];
const CATEGORIES = [
    ['all', 'All activity'],
    ['sign_up', 'Sign ups'],
    ['subscription', 'Subscription'],
    ['engagement', 'Engagement'],
    ['analysis', 'Analysis'],
    ['coupon_usage', 'Coupon usage'],
];
const EVENT_LABELS = {
    account_created: 'Signup Created',
    logged_in: 'Login',
    search_triggered: 'Custom Keyword Search Started',
    search_bookmarked: 'Search Bookmarked',
    video_bookmarked: 'Bookmark Saved',
    video_analysis_triggered: 'Video Analysis Triggered',
    checkout_initiated: 'Checkout Initiated',
    trial_started: 'Trial Started',
    trial_completed: 'Trial Completed',
    subscription_paid: 'Subscription Activated',
    subscription_reactivated: 'Subscription Reactivated',
    subscription_cancellation_requested: 'Cancellation Requested',
    subscription_cancellation_scheduled: 'Cancellation Scheduled',
    subscription_cancellation_reverted: 'Cancellation Reverted',
    subscription_reactivation_requested: 'Reactivation Requested',
    subscription_cancelled: 'Subscription Canceled',
    subscription_reverted_to_free: 'Reverted To Free',
    payment_failed: 'Payment Failed',
    payment_recovered: 'Payment Recovered',
    invoice_paid: 'Invoice Paid',
    account_deletion_requested: 'Account Deletion Requested',
    account_deleted: 'Account Deleted',
    coupon_checkout_initiated: 'Coupon Checkout Started',
    coupon_redeemed: 'Coupon Redeemed',
    coupon_blocked_invalid_email: 'Coupon Blocked: Invalid Email',
    coupon_blocked_slots_exhausted: 'Coupon Blocked: Slots Exhausted',
    coupon_blocked_already_redeemed: 'Coupon Blocked: Already Redeemed',
    coupon_blocked_trial_already_used: 'Coupon Blocked: Trial Used',
    coupon_blocked_reverted_to_free: 'Coupon Blocked: Reverted To Free',
    coupon_blocked_program_inactive: 'Coupon Blocked: Program Inactive',
};
const TONES = { sign_up: '#20cfc2', subscription: '#ee4393', engagement: '#7b5cff', analysis: '#25a6d9', coupon_usage: '#f6a819' };

function formatTimestamp(value) {
    if (!value) return '-';

    return new Date(value).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export default function ActivityLog({ rows = [], filters = {}, events = [], pagination = {} }) {
    const current = { range: filters.range ?? '30D', category: filters.category ?? 'all', event: filters.event ?? 'all' };
    const update = (changes) => router.get('/x/admin/activity', { ...current, ...changes, page: 1 }, { preserveScroll: true, replace: true });
    const goToPage = (page) => router.get('/x/admin/activity', { ...current, page }, { preserveScroll: true });

    return (
        <AdminLayout title="Activity Log" section="activity">
            <section className="rounded-2xl border border-[#dce4f0] bg-[linear-gradient(135deg,_#ffffff_0%,_#f6f9ff_100%)] p-4 shadow-[0_18px_42px_-32px_rgba(50,85,150,.45)] sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <p className="text-[10px] font-semibold tracking-[.22em] text-[#ed3d8d] uppercase">Activity</p>
                        <h2 className="mt-1 text-[22px] font-bold tracking-[-.03em] text-[var(--ink)]">Activity log</h2>
                        <p className="mt-1 text-[11px] text-[#718197]">All recorded user activity in the selected time range.</p>
                    </div>
                    <div className="flex rounded-xl border border-[#dce4f0] bg-white p-1">
                        {RANGES.map((range) => (
                            <button key={range} type="button" onClick={() => update({ range })} className={`rounded-lg px-2.5 py-1.5 text-[10px] font-semibold ${current.range === range ? 'bg-[#ed3d8d] text-white' : 'text-[#718197] hover:bg-[#f6f9ff]'}`}>
                                {range}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                    <label className="sr-only" htmlFor="activity-category">Activity category</label>
                    <select id="activity-category" value={current.category} onChange={(event) => update({ category: event.target.value })} className="h-9 rounded-lg border border-[#dce4f0] bg-white px-3 text-[11px] font-medium text-[var(--ink)] outline-none focus:border-[#49d4ef]">
                        {CATEGORIES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                    <label className="sr-only" htmlFor="activity-event">Activity event</label>
                    <select id="activity-event" value={current.event} onChange={(event) => update({ event: event.target.value })} className="h-9 min-w-[190px] rounded-lg border border-[#dce4f0] bg-white px-3 text-[11px] font-medium text-[var(--ink)] outline-none focus:border-[#49d4ef]">
                        <option value="all">All event keys</option>
                        {events.map((event) => <option key={event} value={event}>{EVENT_LABELS[event] ?? event.replaceAll('_', ' ')}</option>)}
                    </select>
                </div>

                <div className="mt-4 overflow-hidden rounded-xl border border-[#dce4f0] bg-white">
                    {rows.length === 0 ? (
                        <p className="px-4 py-10 text-center text-[12px] text-[#718197]">No activity matches these filters.</p>
                    ) : rows.map((row) => (
                        <article key={row.id} className="flex gap-3 border-b border-[#e8edf5] px-4 py-3 last:border-b-0">
                            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: TONES[row.category] ?? '#718197' }} />
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-1.5">
                                    <strong className="text-[12px] text-[var(--ink)]">{row.name}</strong>
                                    <span className="rounded-full border border-[#dce4f0] px-1.5 py-0.5 text-[8px] font-semibold tracking-[.1em] text-[#53657d] uppercase">{row.category.replace('_', ' ')}</span>
                                </div>
                                <p className="mt-1 text-[11px] text-[#55667d]">{row.summary}</p>
                                <p className="mt-1 text-[10px] text-[#8a98aa]">{row.email} - {formatTimestamp(row.date)}</p>
                            </div>
                            <span className="hidden shrink-0 self-start rounded-full bg-[#f1f4f8] px-2 py-1 text-[8px] font-semibold tracking-[.08em] text-[#718197] uppercase sm:block">{EVENT_LABELS[row.event] ?? row.event.replaceAll('_', ' ')}</span>
                        </article>
                    ))}
                </div>

                <div className="mt-4 flex flex-col gap-2 text-[11px] text-[#718197] sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                    <span>{pagination.total ?? 0} activities</span>
                    <div className="flex items-center gap-2">
                        <button type="button" disabled={(pagination.currentPage ?? 1) <= 1} onClick={() => goToPage(pagination.currentPage - 1)} className="rounded-lg border border-[#dce4f0] bg-white px-3 py-1.5 font-semibold text-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-45">Previous</button>
                        <span className="px-1 py-1.5">Page {pagination.currentPage ?? 1} of {pagination.lastPage ?? 1}</span>
                        <button type="button" disabled={(pagination.currentPage ?? 1) >= (pagination.lastPage ?? 1)} onClick={() => goToPage(pagination.currentPage + 1)} className="rounded-lg border border-[#dce4f0] bg-white px-3 py-1.5 font-semibold text-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-45">Next</button>
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}
