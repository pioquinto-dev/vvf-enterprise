import { router } from '@inertiajs/react';
import { useState } from 'react';

import AdminDataTable from '../../components/admin/AdminDataTable.jsx';
import AdminEditDrawer from '../../components/admin/AdminEditDrawer.jsx';
import AdminEmptyState from '../../components/admin/AdminEmptyState.jsx';
import AdminFiltersBar from '../../components/admin/AdminFiltersBar.jsx';
import AdminInsightsStrip from '../../components/admin/AdminInsightsStrip.jsx';
import AdminPagination from '../../components/admin/AdminPagination.jsx';
import AdminPreviewDrawer from '../../components/admin/AdminPreviewDrawer.jsx';
import AdminLayout from './components/AdminLayout.jsx';

export default function Listing({
    resource,
    title,
    search,
    searchPlaceholder,
    filters = [],
    columns = [],
    rows = [],
    capabilities = {},
    editableFields = [],
    createValues = {},
    emptyMessage,
    pagination,
    query,
    insights = [],
}) {
    const [editing, setEditing] = useState(null);
    const [previewing, setPreviewing] = useState(null);
    const [creating, setCreating] = useState(false);

    const toolbar = <AdminFiltersBar title={title} search={search} searchPlaceholder={searchPlaceholder} filters={filters} />;
    const total = pagination?.total ?? rows.length;

    return (
        <AdminLayout
            title={title}
            section={resource}
            toolbar={toolbar}
            actions={
                <div className="flex items-center gap-2">
                    {resource === 'plans' && (
                        <button
                            type="button"
                            onClick={() => setCreating(true)}
                            className="inline-flex h-8 items-center rounded-md bg-[var(--yellow)] px-3.5 text-[12.5px] font-semibold text-[#1a1400] transition hover:brightness-105"
                        >
                            New plan
                        </button>
                    )}
                    {resource === 'keyword-index' && (
                        <button
                            type="button"
                            onClick={() => setCreating(true)}
                            className="inline-flex h-8 items-center rounded-md bg-[var(--yellow)] px-3.5 text-[12.5px] font-semibold text-[#1a1400] transition hover:brightness-105"
                        >
                            New keyword
                        </button>
                    )}
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-[var(--line)] bg-white px-2 py-1 text-[11.5px] text-[var(--muted)]">
                        <span className="font-semibold text-[var(--ink)]">{total.toLocaleString()}</span>
                        {total === 1 ? 'record' : 'records'}
                    </span>
                </div>
            }
        >
            <AdminInsightsStrip insights={insights} />

            <section className="overflow-visible rounded-xl border border-[var(--line)] bg-white shadow-[0_1px_2px_rgba(20,15,0,.04),0_16px_36px_-28px_rgba(20,15,0,.18)]">
                {rows.length > 0 ? (
                    <AdminDataTable
                        columns={columns}
                        rows={rows}
                        resource={resource}
                        capabilities={capabilities}
                        onEdit={setEditing}
                        onPreview={setPreviewing}
                        onImpersonate={(row) => router.post(`/x/admin/users/${row.id}/impersonate`)}
                    />
                ) : (
                    <AdminEmptyState
                        title={`No ${title.toLowerCase()} found`}
                        message={emptyMessage || 'Nothing matches the current search and filters.'}
                    />
                )}

                <AdminPagination pagination={pagination} query={query} />
            </section>

            <AdminEditDrawer
                open={editing !== null}
                resource={resource}
                title={editing ? String(editing[columns[0]?.key] ?? title) : title}
                fields={editableFields}
                row={editing}
                mode="edit"
                onClose={() => setEditing(null)}
            />

            <AdminEditDrawer
                open={creating}
                resource={resource}
                title={`New ${title.slice(0, -1)}`}
                fields={editableFields}
                createValues={createValues}
                mode="create"
                onClose={() => setCreating(false)}
            />

            <AdminPreviewDrawer
                open={previewing !== null}
                title={previewing ? String(previewing[columns[0]?.key] ?? title) : title}
                row={previewing}
                onClose={() => setPreviewing(null)}
            />
        </AdminLayout>
    );
}
