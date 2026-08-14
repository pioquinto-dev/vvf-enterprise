import AdminRowMenu from './AdminRowMenu.jsx';

function statusTone(value) {
    switch ((value || '').toLowerCase()) {
        case 'active':
        case 'published':
        case 'complete':
            return { dot: 'bg-[var(--ok)]', text: 'text-[var(--ok)]' };
        case 'running':
        case 'trial':
        case 'trialing':
        case 'queued':
        case 'scheduled':
        case 'invited':
            return { dot: 'bg-[var(--yellow)]', text: 'text-[var(--amber-ink)]' };
        case 'past_due':
        case 'inactive':
        case 'archived':
        case 'suspended':
            return { dot: 'bg-[var(--warn)]', text: 'text-[var(--warn)]' };
        default:
            return { dot: 'bg-[var(--line-2)]', text: 'text-[var(--muted)]' };
    }
}

function initials(value) {
    return String(value)
        .split(/\s+/)
        .slice(0, 2)
        .map((word) => word.charAt(0))
        .join('')
        .toUpperCase();
}

function renderCell(column, row, index) {
    const value = row[column.key] ?? '-';
    const text = String(value);

    if (column.key === 'status') {
        const tone = statusTone(text);

        return (
            <span className={`inline-flex items-center gap-1.5 text-[12.5px] font-medium capitalize ${tone.text}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
                {text.replaceAll('_', ' ')}
            </span>
        );
    }

    if (['role', 'type', 'plan'].includes(column.key)) {
        return (
            <span className="inline-flex rounded border border-[var(--line)] bg-[var(--wash)] px-1.5 py-0.5 text-[11.5px] font-medium text-[var(--amber-ink)] capitalize">
                {text.replaceAll('_', ' ')}
            </span>
        );
    }

    if (index === 0) {
        return (
            <span className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[var(--wash)] text-[10px] font-semibold text-[var(--amber-ink)]">
                    {initials(text)}
                </span>
                <span className="truncate text-[13px] font-medium text-[var(--ink)]">{text}</span>
            </span>
        );
    }

    return <span className="text-[13px] text-[var(--muted)]">{text}</span>;
}

export default function AdminDataTable({ columns = [], rows = [], resource, capabilities = {}, onEdit = () => {}, onPreview = () => {} }) {
    const hasActions = Boolean(capabilities.preview || capabilities.edit || capabilities.archive || capabilities.delete);

    return (
        <>
            <div className="hidden overflow-x-auto md:block">
                <table className="min-w-full border-separate border-spacing-0">
                    <thead>
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className="sticky top-0 z-10 border-b border-[var(--line)] bg-[var(--paper)] px-4 py-2 text-left text-[11px] font-semibold tracking-[.06em] whitespace-nowrap text-[var(--faint)] uppercase"
                                >
                                    {column.label}
                                </th>
                            ))}
                            {hasActions && (
                                <th className="sticky top-0 z-10 w-[104px] border-b border-[var(--line)] bg-[var(--paper)] px-4 py-2 text-right text-[11px] font-semibold tracking-[.06em] whitespace-nowrap text-[var(--faint)] uppercase">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, rowIndex) => (
                            <tr key={row.id ?? rowIndex} className="group transition-colors hover:bg-[rgba(255,248,230,.65)]">
                                {columns.map((column, columnIndex) => (
                                    <td
                                        key={column.key}
                                        className="max-w-[280px] truncate border-b border-[var(--line)] px-4 py-2.5 align-middle whitespace-nowrap"
                                    >
                                        {renderCell(column, row, columnIndex)}
                                    </td>
                                ))}
                                {hasActions && (
                                    <td className="border-b border-[var(--line)] px-4 py-2.5 text-right">
                                        <AdminRowMenu
                                            resource={resource}
                                            row={row}
                                            capabilities={capabilities}
                                            onEdit={onEdit}
                                            onPreview={onPreview}
                                        />
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="divide-y divide-[var(--line)] md:hidden">
                {rows.map((row, rowIndex) => (
                    <article key={row.id ?? rowIndex} className="group grid gap-2 px-4 py-3">
                        <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0">{renderCell(columns[0], row, 0)}</div>
                            {hasActions && (
                                <AdminRowMenu resource={resource} row={row} capabilities={capabilities} onEdit={onEdit} onPreview={onPreview} />
                            )}
                        </div>
                        {columns.slice(1).map((column) => (
                            <div key={column.key} className="flex items-center justify-between gap-4">
                                <span className="text-[11px] text-[var(--faint)]">{column.label}</span>
                                <span className="min-w-0 text-right">{renderCell(column, row, 1)}</span>
                            </div>
                        ))}
                    </article>
                ))}
            </div>
        </>
    );
}
