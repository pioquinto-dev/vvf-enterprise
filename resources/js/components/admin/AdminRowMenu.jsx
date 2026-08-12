import { router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

import { Dots } from '../../landing/components/Icons.jsx';

export default function AdminRowMenu({ resource, row, capabilities = {}, onEdit, onPreview }) {
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

    // Edit is the action people actually reach for, so it stays a visible
    // button. Everything rarer (and everything destructive) lives in the menu.
    const canPreview = capabilities.preview === true;
    const canEdit = capabilities.edit && !row.trashed;

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

    if (items.length === 0 && !canEdit && !canPreview) {
        return null;
    }

    return (
        <div ref={container} className="relative flex items-center justify-end gap-1">
            {canPreview && (
                <button
                    type="button"
                    onClick={() => onPreview(row)}
                    className="inline-flex h-6 items-center rounded-md border border-white/[.12] bg-white/[.05] px-2 text-[11.5px] font-medium text-white/75 transition hover:border-sky-400/45 hover:bg-sky-400/12 hover:text-white"
                >
                    View
                </button>
            )}

            {canEdit && (
                <button
                    type="button"
                    onClick={() => onEdit(row)}
                    className="inline-flex h-6 items-center rounded-md border border-white/[.12] bg-white/[.05] px-2 text-[11.5px] font-medium text-white/75 transition hover:border-accent/45 hover:bg-accent/15 hover:text-white"
                >
                    Edit
                </button>
            )}

            {items.length > 0 && (
                <button
                    type="button"
                    aria-label="More actions"
                    onClick={() => setOpen((current) => !current)}
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-md border transition ${
                        open
                            ? 'border-white/[.2] bg-white/[.1] text-white'
                            : 'border-white/[.12] bg-white/[.05] text-white/55 hover:border-white/25 hover:text-white'
                    }`}
                >
                    <Dots className="h-3.5 w-3.5" />
                </button>
            )}

            {open && (
                <div className="absolute top-7 right-0 z-30 w-40 overflow-hidden rounded-lg border border-white/[.09] bg-[#12152a] py-1 shadow-[0_18px_40px_-18px_rgba(0,0,0,.95)]">
                    {items.map((item) => (
                        <button
                            key={item.label}
                            type="button"
                            onClick={item.onClick}
                            className={`block w-full px-3 py-1.5 text-left text-[12.5px] transition hover:bg-white/[.06] ${
                                item.danger ? 'text-rose-300' : 'text-white/75'
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
