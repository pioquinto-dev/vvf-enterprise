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
    emptyMessage,
    pagination,
    query,
    insights = [],
}) {
    const [editing, setEditing] = useState(null);
    const [previewing, setPreviewing] = useState(null);

    const toolbar = <AdminFiltersBar title={title} search={search} searchPlaceholder={searchPlaceholder} filters={filters} />;
    const total = pagination?.total ?? rows.length;

    return (
        <AdminLayout
            title={title}
            section={resource}
            toolbar={toolbar}
            actions={
                <span className="inline-flex items-center gap-1.5 rounded-md border border-[var(--line)] bg-white px-2 py-1 text-[11.5px] text-[var(--muted)]">
                    <span className="font-semibold text-[var(--ink)]">{total.toLocaleString()}</span>
                    {total === 1 ? 'record' : 'records'}
                </span>
            }
        >
            <AdminInsightsStrip insights={insights} />

            <section className="overflow-hidden rounded-xl border border-[var(--line)] bg-white shadow-[0_1px_2px_rgba(20,15,0,.04),0_16px_36px_-28px_rgba(20,15,0,.18)]">
                {rows.length > 0 ? (
                    <AdminDataTable
                        columns={columns}
                        rows={rows}
                        resource={resource}
                        capabilities={capabilities}
                        onEdit={setEditing}
                        onPreview={setPreviewing}
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
                onClose={() => setEditing(null)}
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
