import { router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

import { Dots } from '../../landing/components/Icons.jsx';

export default function AdminRowMenu({ resource, row, capabilities = {}, onEdit, onPreview, onImpersonate }) {
    const [open, setOpen] = useState(false);
    const container = useRef(null);

    useEffect(() => {
        if (!open) {
            return undefined;
        }

        const close = (event) => {
            if (!container.current?.contains(event.target)) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', close);

        return () => document.removeEventListener('mousedown', close);
    }, [open]);

    const act = (method, url, data = {}) => {
        setOpen(false);
        router[method](url, data, { preserveScroll: true, preserveState: false });
    };

    const base = `/x/admin/records/${resource}/${row.id}`;
    const items = [];

    const canPreview = capabilities.preview === true;
    const canEdit = capabilities.edit && !row.trashed;
    const canImpersonate = capabilities.impersonate === true && !row.trashed;

    if (capabilities.archive && !row.trashed) {
        items.push({
            label: row.archived ? 'Unarchive' : 'Archive',
            onClick: () => act('patch', `${base}/archive`, { archived: !row.archived }),
        });
    }

    if (capabilities.delete) {
        items.push(
            row.trashed
                ? { label: 'Restore', onClick: () => act('patch', `${base}/restore`) }
                : {
                      label: 'Delete',
                      danger: true,
                      onClick: () => {
                          if (window.confirm('Delete this record? It is soft deleted and can be restored.')) {
                              act('delete', base);
                          }
                      },
                  },
        );
    }

    if (items.length === 0 && !canEdit && !canPreview && !canImpersonate) {
        return null;
    }

    return (
        <div ref={container} className="relative flex items-center justify-end gap-1">
            {canPreview && (
                <button
                    type="button"
                    onClick={() => onPreview(row)}
                    className="inline-flex h-6 items-center rounded-md border border-[var(--line)] bg-white px-2 text-[11.5px] font-medium text-[var(--ink)] transition hover:border-[var(--yellow)] hover:bg-[var(--wash)]"
                >
                    View
                </button>
            )}

            {canEdit && (
                <button
                    type="button"
                    onClick={() => onEdit(row)}
                    className="inline-flex h-6 items-center rounded-md border border-[var(--yellow)] bg-[var(--wash)] px-2 text-[11.5px] font-medium text-[var(--amber-ink)] transition hover:bg-[var(--yellow)] hover:text-[#1a1400]"
                >
                    Edit
                </button>
            )}

            {canImpersonate && (
                <button
                    type="button"
                    onClick={() => {
                        if (window.confirm(`Log in as ${row.email || row.user} for one hour?`)) {
                            onImpersonate(row);
                        }
                    }}
                    className="inline-flex h-6 items-center rounded-md border border-[var(--line)] bg-white px-2 text-[11.5px] font-medium text-[var(--ink)] transition hover:border-[var(--yellow)] hover:bg-[var(--wash)]"
                >
                    Log in as
                </button>
            )}

            {items.length > 0 && (
                <button
                    type="button"
                    aria-label="More actions"
                    onClick={() => setOpen((current) => !current)}
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-md border transition ${
                        open
                            ? 'border-[var(--yellow)] bg-[var(--wash)] text-[var(--ink)]'
                            : 'border-[var(--line)] bg-white text-[var(--muted)] hover:border-[var(--line-2)] hover:text-[var(--ink)]'
                    }`}
                >
                    <Dots className="h-3.5 w-3.5" />
                </button>
            )}

            {open && (
                <div className="absolute top-7 right-0 z-30 w-40 overflow-hidden rounded-lg border border-[var(--line)] bg-white py-1 shadow-[0_18px_40px_-18px_rgba(20,15,0,.3)]">
                    {items.map((item) => (
                        <button
                            key={item.label}
                            type="button"
                            onClick={item.onClick}
                            className={`block w-full px-3 py-1.5 text-left text-[12.5px] transition hover:bg-[var(--wash)] ${
                                item.danger ? 'text-[var(--warn)]' : 'text-[var(--ink)]'
                            }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
