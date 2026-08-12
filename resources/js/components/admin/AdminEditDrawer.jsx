import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';

import { Close } from '../../landing/components/Icons.jsx';

/**
 * Slide-over editor. Fields are described by the server (`editableFields`), so
 * adding a field to a resource never requires touching this component.
 */
export default function AdminEditDrawer({ open, resource, title, fields = [], row, onClose }) {
    const form = useForm({});

    useEffect(() => {
        if (!open || !row) {
            return;
        }

        const initial = {};

        fields.forEach((field) => {
            const value = row.values?.[field.name];
            initial[field.name] = field.type === 'toggle' ? Boolean(value) : (value ?? '');
        });

        form.setDefaults(initial);
        form.setData(initial);
    }, [open, row?.id]);

    if (!open) {
        return null;
    }

    const submit = (event) => {
        event.preventDefault();

        form.transform((data) => ({
            ...data,
            // Inertia sends booleans as-is; the API expects them for toggles.
            ...Object.fromEntries(
                fields.filter((field) => field.type === 'toggle').map((field) => [field.name, Boolean(data[field.name])]),
            ),
        })).patch(`/x/admin/records/${resource}/${row.id}`, {
            preserveScroll: true,
            onSuccess: onClose,
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" />

            <aside className="relative flex h-full w-[min(420px,92vw)] flex-col border-l border-white/[.08] bg-[#0d1020] shadow-[0_0_60px_-10px_rgba(0,0,0,.9)]">
                <header className="flex items-center justify-between border-b border-white/[.07] px-4 py-3">
                    <div>
                        <p className="text-[10px] font-semibold tracking-[.18em] text-white/35 uppercase">Edit</p>
                        <h2 className="mt-0.5 truncate text-[14px] font-semibold text-white">{title}</h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-white/40 transition hover:bg-white/[.06] hover:text-white"
                    >
                        <Close className="h-4 w-4" />
                    </button>
                </header>

                <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
                    <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
                        {fields.map((field) => (
                            <div key={field.name}>
                                {field.type === 'toggle' ? (
                                    <label className="flex cursor-pointer items-start gap-2.5">
                                        <input
                                            type="checkbox"
                                            checked={Boolean(form.data[field.name])}
                                            onChange={(event) => form.setData(field.name, event.target.checked)}
                                            className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/[.06] accent-[#6d4bff]"
                                        />
                                        <span>
                                            <span className="block text-[13px] text-white">{field.label}</span>
                                            {field.help && <span className="mt-0.5 block text-[11.5px] text-white/40">{field.help}</span>}
                                        </span>
                                    </label>
                                ) : (
                                    <>
                                        <label className="mb-1.5 block text-[11.5px] font-medium text-white/50">{field.label}</label>
                                        {field.type === 'select' ? (
                                            <select
                                                value={form.data[field.name] ?? ''}
                                                onChange={(event) => form.setData(field.name, event.target.value)}
                                                className="h-9 w-full rounded-lg border border-white/[.09] bg-[#0f1220] px-2.5 text-[13px] text-white outline-none focus:border-accent/45"
                                            >
                                                {(field.options ?? [])
                                                    // Options are plain strings or {value,label} pairs.
                                                    .map((option) =>
                                                        typeof option === 'string' ? { value: option, label: option } : option,
                                                    )
                                                    .map((option) => (
                                                        <option key={option.value} value={option.value} className="bg-[#0f1220]">
                                                            {option.label}
                                                        </option>
                                                    ))}
                                            </select>
                                        ) : (
                                            <input
                                                type={
                                                    field.type === 'number'
                                                        ? 'number'
                                                        : field.type === 'password'
                                                          ? 'password'
                                                          : 'text'
                                                }
                                                autoComplete={field.type === 'password' ? 'new-password' : undefined}
                                                step={field.step}
                                                min={field.type === 'number' ? 0 : undefined}
                                                value={form.data[field.name] ?? ''}
                                                onChange={(event) => form.setData(field.name, event.target.value)}
                                                className="h-9 w-full rounded-lg border border-white/[.09] bg-[#0f1220] px-2.5 text-[13px] text-white outline-none focus:border-accent/45"
                                            />
                                        )}
                                        {field.help && <p className="mt-1 text-[11.5px] text-white/40">{field.help}</p>}
                                    </>
                                )}

                                {form.errors[field.name] && (
                                    <p className="mt-1 text-[11.5px] text-rose-300">{form.errors[field.name]}</p>
                                )}
                            </div>
                        ))}
                    </div>

                    <footer className="flex items-center justify-end gap-2 border-t border-white/[.07] px-4 py-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="h-8 rounded-md px-3 text-[12.5px] text-white/55 transition hover:text-white"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="h-8 rounded-md bg-accent px-3.5 text-[12.5px] font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
                        >
                            {form.processing ? 'Saving…' : 'Save changes'}
                        </button>
                    </footer>
                </form>
            </aside>
        </div>
    );
}
