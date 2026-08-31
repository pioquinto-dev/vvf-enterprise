import { Close } from '../../landing/components/Icons.jsx';

function PreviewField({ label, value, multiline = false }) {
    const displayValue = value === null || value === undefined || value === '' ? '-' : value;

    return (
        <div>
            <p className="mb-1.5 text-[11.5px] font-medium text-[var(--muted)]">{label}</p>
            {multiline ? (
                <div className="min-h-[120px] rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 text-[13px] leading-6 whitespace-pre-wrap text-[var(--body)]">
                    {displayValue}
                </div>
            ) : (
                <div className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 text-[13px] text-[var(--body)]">
                    {displayValue}
                </div>
            )}
        </div>
    );
}

function normalizeSections(preview) {
    return (preview.sections ?? [])
        .map((section) => ({
            ...section,
            fields: (section.fields ?? []).filter((field) => {
                const value = field?.value;

                return value !== null && value !== undefined && String(value).trim() !== '';
            }),
        }))
        .filter((section) => section.fields.length > 0);
}

export default function AdminPreviewDrawer({ open, title, row, onClose }) {
    if (!open || !row) {
        return null;
    }

    const preview = row.preview ?? {};
    const sections = normalizeSections(preview);

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-[rgba(11,11,11,.38)] backdrop-blur-[2px]" />

            <aside className="relative flex h-full w-[min(460px,92vw)] flex-col border-l border-[var(--line)] bg-[var(--paper)] shadow-[0_0_60px_-10px_rgba(20,15,0,.24)]">
                <header className="flex items-center justify-between border-b border-[var(--line)] px-4 py-3">
                    <div>
                        <p className="text-[10px] font-semibold tracking-[.18em] text-[var(--faint)] uppercase">{preview.eyebrow ?? 'Preview'}</p>
                        <h2 className="mt-0.5 truncate text-[14px] font-semibold text-[var(--ink)]">{title}</h2>
                        {preview.summary && <p className="mt-1 text-[12px] text-[var(--muted)]">{preview.summary}</p>}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--faint)] transition hover:bg-white hover:text-[var(--ink)]"
                    >
                        <Close className="h-4 w-4" />
                    </button>
                </header>

                <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
                    {sections.length > 0 ? (
                        sections.map((section) => (
                            <section key={section.title ?? 'details'} className="space-y-3 rounded-xl border border-[var(--line)] bg-white p-3">
                                {section.title && <h3 className="text-[11px] font-semibold tracking-[.12em] text-[var(--faint)] uppercase">{section.title}</h3>}
                                <div className="space-y-3">
                                    {section.fields.map((field) => (
                                        <PreviewField
                                            key={`${section.title ?? 'details'}-${field.label}`}
                                            label={field.label}
                                            value={field.value}
                                            multiline={field.multiline === true}
                                        />
                                    ))}
                                </div>
                            </section>
                        ))
                    ) : (
                        <PreviewField label="Details" value="No additional details available for this record yet." multiline />
                    )}
                </div>

                <footer className="flex items-center justify-end border-t border-[var(--line)] px-4 py-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-8 rounded-md px-3 text-[12.5px] text-[var(--muted)] transition hover:text-[var(--ink)]"
                    >
                        Close
                    </button>
                </footer>
            </aside>
        </div>
    );
}
