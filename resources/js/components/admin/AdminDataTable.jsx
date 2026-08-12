import AdminRowMenu from './AdminRowMenu.jsx';

function statusTone(value) {
    switch ((value || '').toLowerCase()) {
        case 'active':
        case 'published':
        case 'complete':
            return { dot: 'bg-emerald-400', text: 'text-emerald-300/90' };
        case 'running':
        case 'trial':
        case 'trialing':
        case 'queued':
        case 'scheduled':
        case 'invited':
            return { dot: 'bg-sky-400', text: 'text-sky-300/90' };
        case 'past_due':
        case 'inactive':
        case 'archived':
        case 'suspended':
            return { dot: 'bg-rose-400', text: 'text-rose-300/90' };
        default:
            return { dot: 'bg-white/35', text: 'text-white/60' };
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
    const value = row[column.key] ?? '—';
    const text = String(value);

    // Status reads as a state, not a label — a coloured dot carries that faster
    // than a filled pill, and keeps a dense table from looking like confetti.
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
            <span className="inline-flex rounded border border-white/[.09] bg-white/[.03] px-1.5 py-0.5 text-[11.5px] font-medium text-white/65 capitalize">
                {text.replaceAll('_', ' ')}
            </span>
        );
    }

    // The first column is the row's identity — give it an avatar and weight so
    // the eye has an anchor when scanning.
    if (index === 0) {
        return (
            <span className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-white/[.06] text-[10px] font-semibold text-white/55">
                    {initials(text)}
                </span>
                <span className="truncate text-[13px] font-medium text-white">{text}</span>
            </span>
        );
    }

    return <span className="text-[13px] text-white/65">{text}</span>;
}

export default function AdminDataTable({ columns = [], rows = [], resource, capabilities = {}, onEdit = () => {}, onPreview = () => {} }) {
    // A read-only listing should not reserve a column for actions it will
    // never render.
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
                                    className="sticky top-0 z-10 border-b border-white/[.07] bg-[#13162a] px-4 py-2 text-left text-[11px] font-semibold tracking-[.06em] whitespace-nowrap text-white/40 uppercase"
                                >
                                    {column.label}
                                </th>
                            ))}
                            {hasActions && (
                                <th className="sticky top-0 z-10 w-[104px] border-b border-white/[.07] bg-[#13162a] px-4 py-2 text-right text-[11px] font-semibold tracking-[.06em] whitespace-nowrap text-white/40 uppercase">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, rowIndex) => (
                            <tr key={row.id ?? rowIndex} className="group transition-colors hover:bg-white/[.025]">
                                {columns.map((column, columnIndex) => (
                                    <td
                                        key={column.key}
                                        className="max-w-[280px] truncate border-b border-white/[.05] px-4 py-2.5 align-middle whitespace-nowrap"
                                    >
                                        {renderCell(column, row, columnIndex)}
                                    </td>
                                ))}
                                {hasActions && (
                                    <td className="border-b border-white/[.05] px-4 py-2.5 text-right">
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

            <div className="divide-y divide-white/[.05] md:hidden">
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
                                <span className="text-[11px] text-white/35">{column.label}</span>
                                <span className="min-w-0 text-right">{renderCell(column, row, 1)}</span>
                            </div>
                        ))}
                    </article>
                ))}
            </div>
        </>
    );
}
