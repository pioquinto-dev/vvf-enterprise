import { router } from '@inertiajs/react';

function pageUrl(page, query) {
    const next = new URLSearchParams();

    Object.entries(query).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
            next.set(key, value);
        }
    });

    next.set('page', String(page));

    return `${window.location.pathname}?${next.toString()}`;
}

export default function AdminPagination({ pagination, query = {} }) {
    if (!pagination || pagination.lastPage <= 1) {
        return (
            <div className="flex items-center justify-between gap-2 border-t border-[var(--line)] bg-[var(--paper)] px-4 py-2.5 text-[12px] text-[var(--faint)]">
                <span>
                    Showing <span className="text-[var(--ink)]">{pagination?.from ?? 0}</span>-
                    <span className="text-[var(--ink)]">{pagination?.to ?? 0}</span> of{' '}
                    <span className="text-[var(--ink)]">{pagination?.total ?? 0}</span>
                </span>
                <span>25 per page</span>
            </div>
        );
    }

    const goTo = (page) => {
        router.get(pageUrl(page, query), {}, {
            preserveState: true,
            replace: true,
            preserveScroll: true,
        });
    };

    return (
        <div className="flex flex-col gap-2 border-t border-[var(--line)] bg-[var(--paper)] px-4 py-2.5 text-[12px] text-[var(--faint)] sm:flex-row sm:items-center sm:justify-between">
            <span>
                Showing <span className="text-[var(--ink)]">{pagination.from}</span>-
                <span className="text-[var(--ink)]">{pagination.to}</span> of{' '}
                <span className="text-[var(--ink)]">{pagination.total}</span>
            </span>
            <div className="flex items-center gap-1.5">
                <button
                    type="button"
                    disabled={pagination.page <= 1}
                    onClick={() => goTo(pagination.page - 1)}
                    className="h-7 rounded-md border border-[var(--line)] px-2.5 text-[var(--muted)] transition hover:bg-white hover:text-[var(--ink)] disabled:opacity-35 disabled:hover:bg-transparent"
                >
                    Previous
                </button>
                <span className="px-1 text-[var(--muted)]">
                    Page {pagination.page} of {pagination.lastPage}
                </span>
                <button
                    type="button"
                    disabled={pagination.page >= pagination.lastPage}
                    onClick={() => goTo(pagination.page + 1)}
                    className="h-7 rounded-md border border-[var(--line)] px-2.5 text-[var(--muted)] transition hover:bg-white hover:text-[var(--ink)] disabled:opacity-35 disabled:hover:bg-transparent"
                >
                    Next
                </button>
            </div>
        </div>
    );
}
