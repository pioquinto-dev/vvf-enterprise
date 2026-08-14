import { Close } from '../../landing/components/Icons.jsx';

function PreviewField({ label, value, multiline = false }) {
    return (
        <div>
            <p className="mb-1.5 text-[11.5px] font-medium text-[var(--muted)]">{label}</p>
            {multiline ? (
                <div className="min-h-[120px] rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 text-[13px] leading-6 whitespace-pre-wrap text-[var(--body)]">
                    {value || '-'}
                </div>
            ) : (
                <div className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 text-[13px] text-[var(--body)]">
                    {value || '-'}
                </div>
            )}
        </div>
    );
}

export default function AdminPreviewDrawer({ open, title, row, onClose }) {
    if (!open || !row) {
        return null;
    }

    const preview = row.preview ?? {};

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-[rgba(11,11,11,.38)] backdrop-blur-[2px]" />

            <aside className="relative flex h-full w-[min(460px,92vw)] flex-col border-l border-[var(--line)] bg-[var(--paper)] shadow-[0_0_60px_-10px_rgba(20,15,0,.24)]">
                <header className="flex items-center justify-between border-b border-[var(--line)] px-4 py-3">
                    <div>
                        <p className="text-[10px] font-semibold tracking-[.18em] text-[var(--faint)] uppercase">Preview</p>
                        <h2 className="mt-0.5 truncate text-[14px] font-semibold text-[var(--ink)]">{title}</h2>
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
                    <PreviewField label="Name" value={preview.name} />
                    <PreviewField label="Email" value={preview.email} />
                    <PreviewField label="Category" value={preview.category} />
                    <PreviewField label="Subject" value={preview.subject} />
                    <PreviewField label="Received" value={preview.received_at} />
                    <PreviewField label="Message" value={preview.message} multiline />
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
