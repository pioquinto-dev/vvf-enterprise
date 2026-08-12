import { useState } from 'react';

import AdminDataTable from '../../components/admin/AdminDataTable.jsx';
import AdminEditDrawer from '../../components/admin/AdminEditDrawer.jsx';
import AdminEmptyState from '../../components/admin/AdminEmptyState.jsx';
import AdminFiltersBar from '../../components/admin/AdminFiltersBar.jsx';
import AdminPagination from '../../components/admin/AdminPagination.jsx';
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
}) {
    const [editing, setEditing] = useState(null);

    const toolbar = <AdminFiltersBar title={title} search={search} searchPlaceholder={searchPlaceholder} filters={filters} />;
    const total = pagination?.total ?? rows.length;

    return (
        <AdminLayout
            title={title}
            section={resource}
            toolbar={toolbar}
            actions={
                <span className="inline-flex items-center gap-1.5 rounded-md border border-white/[.09] bg-white/[.03] px-2 py-1 text-[11.5px] text-white/55">
                    <span className="font-semibold text-white">{total.toLocaleString()}</span>
                    {total === 1 ? 'record' : 'records'}
                </span>
            }
        >
            <section className="overflow-hidden rounded-xl border border-white/[.07] bg-[#0f1220] shadow-[0_1px_0_rgba(255,255,255,.03)_inset,0_10px_30px_-24px_rgba(0,0,0,.9)]">
                {rows.length > 0 ? (
                    <AdminDataTable
                        columns={columns}
                        rows={rows}
                        resource={resource}
                        capabilities={capabilities}
                        onEdit={setEditing}
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
        </AdminLayout>
    );
}
