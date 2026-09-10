import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from './components/AdminLayout.jsx';

const STATUSES = [
    ['unresolved', 'Unresolved'],
    ['resolved', 'Resolved'],
    ['all', 'All'],
];

function formatTimestamp(value) {
    if (!value) return '-';

    return new Date(value).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function ErrorRow({ row }) {
    const [expanded, setExpanded] = useState(false);
    const resolveForm = useForm({});
    const hasDetails = Boolean(row.exceptionClass || row.file || (row.context && Object.keys(row.context).length > 0));

    const resolve = () => {
        resolveForm.patch(`/x/admin/critical-errors/${row.id}/resolve`, { preserveScroll: true });
    };

    return (
        <article className="border-b border-[#e8edf5] px-4 py-3 last:border-b-0">
            <div className="flex gap-3">
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${row.resolvedAt ? 'bg-[#25a6d9]' : 'bg-[var(--warn)]'}`} />
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                        <strong className="text-[12px] text-[var(--ink)]">{row.event}</strong>
                        {row.exceptionClass && (
                            <span className="rounded-full border border-[#dce4f0] px-1.5 py-0.5 text-[8px] font-semibold tracking-[.1em] text-[#53657d] uppercase">{row.exceptionClass}</span>
                        )}
                        {row.resolvedAt && (
                            <span className="rounded-full bg-[#e6f6fb] px-1.5 py-0.5 text-[8px] font-semibold tracking-[.1em] text-[#1c7ba0] uppercase">Resolved</span>
                        )}
                    </div>
                    <p className="mt-1 text-[11px] text-[#55667d]">{row.message}</p>
                    <p className="mt-1 text-[10px] text-[#8a98aa]">
                        {formatTimestamp(row.date)}
                        {row.file && ` · ${row.file}${row.line ? `:${row.line}` : ''}`}
                    </p>
                    {hasDetails && (
                        <button
                            type="button"
                            onClick={() => setExpanded((value) => !value)}
                            className="mt-1.5 text-[10.5px] font-semibold text-[#718197] underline decoration-dotted"
                        >
                            {expanded ? 'Hide details' : 'Show details'}
                        </button>
                    )}
                    {expanded && row.context && Object.keys(row.context).length > 0 && (
                        <pre className="mt-2 max-h-64 overflow-auto rounded-lg bg-[#f6f9ff] p-3 text-[10px] text-[#40506a]">
                            {JSON.stringify(row.context, null, 2)}
                        </pre>
                    )}
                </div>
                {!row.resolvedAt && (
                    <button
                        type="button"
                        disabled={resolveForm.processing}
                        onClick={resolve}
                        className="h-7 shrink-0 self-start rounded-lg border border-[#dce4f0] bg-white px-2.5 text-[10px] font-semibold text-[var(--ink)] transition hover:border-[#49d4ef] disabled:opacity-50"
                    >
                        Mark resolved
                    </button>
                )}
            </div>
        </article>
    );
}

export default function CriticalErrors({ rows = [], filters = {}, events = [], pagination = {} }) {
    const current = { status: filters.status ?? 'unresolved', event: filters.event ?? 'all' };
    const update = (changes) => router.get('/x/admin/critical-errors', { ...current, ...changes, page: 1 }, { preserveScroll: true, replace: true });
    const goToPage = (page) => router.get('/x/admin/critical-errors', { ...current, page }, { preserveScroll: true });

    return (
        <AdminLayout title="Critical Errors" section="critical-errors">
            <section className="rounded-2xl border border-[#dce4f0] bg-[linear-gradient(135deg,_#ffffff_0%,_#f6f9ff_100%)] p-4 shadow-[0_18px_42px_-32px_rgba(50,85,150,.45)] sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <p className="text-[10px] font-semibold tracking-[.22em] text-[var(--warn)] uppercase">Critical errors</p>
                        <h2 className="mt-1 text-[22px] font-bold tracking-[-.03em] text-[var(--ink)]">Critical error log</h2>
                        <p className="mt-1 text-[11px] text-[#718197]">Third-party connection failures, usage-limit exhaustion, and core-feature exceptions worth reviewing.</p>
                    </div>
                    <div className="flex rounded-xl border border-[#dce4f0] bg-white p-1">
                        {STATUSES.map(([status, label]) => (
                            <button key={status} type="button" onClick={() => update({ status })} className={`rounded-lg px-2.5 py-1.5 text-[10px] font-semibold ${current.status === status ? 'bg-[var(--warn)] text-white' : 'text-[#718197] hover:bg-[#f6f9ff]'}`}>
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                    <label className="sr-only" htmlFor="critical-error-event">Event</label>
                    <select id="critical-error-event" value={current.event} onChange={(event) => update({ event: event.target.value })} className="h-9 min-w-[190px] rounded-lg border border-[#dce4f0] bg-white px-3 text-[11px] font-medium text-[var(--ink)] outline-none focus:border-[#49d4ef]">
                        <option value="all">All event keys</option>
                        {events.map((event) => <option key={event} value={event}>{event}</option>)}
                    </select>
                </div>

                <div className="mt-4 overflow-hidden rounded-xl border border-[#dce4f0] bg-white">
                    {rows.length === 0 ? (
                        <p className="px-4 py-10 text-center text-[12px] text-[#718197]">No errors match these filters.</p>
                    ) : rows.map((row) => <ErrorRow key={row.id} row={row} />)}
                </div>

                <div className="mt-4 flex flex-col gap-2 text-[11px] text-[#718197] sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                    <span>{pagination.total ?? 0} errors</span>
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
