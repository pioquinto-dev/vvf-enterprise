import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';

import { Close } from '../../landing/components/Icons.jsx';

export default function AdminEditDrawer({ open, resource, title, fields = [], row, createValues = null, mode = 'edit', onClose }) {
    const form = useForm({});

    useEffect(() => {
        if (!open) {
            return;
        }

        const initial = {};

        fields.forEach((field) => {
            const source = mode === 'create' ? createValues : row?.values;
            const value = source?.[field.name];
            initial[field.name] = field.type === 'toggle' ? Boolean(value) : (value ?? '');
        });

        form.setDefaults(initial);
        form.setData(initial);
    }, [open, row?.id, mode, createValues]);

    if (!open) {
        return null;
    }

    const submit = (event) => {
        event.preventDefault();

        form.transform((data) => ({
            ...data,
            ...Object.fromEntries(
                fields.filter((field) => field.type === 'toggle').map((field) => [field.name, Boolean(data[field.name])]),
            ),
        }));

        const options = {
            preserveScroll: true,
            onSuccess: onClose,
        };

        if (mode === 'create') {
            form.post(`/x/admin/records/${resource}`, options);

            return;
        }

        form.patch(`/x/admin/records/${resource}/${row.id}`, options);
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-[rgba(11,11,11,.38)] backdrop-blur-[2px]" />

            <aside className="relative flex h-full w-[min(420px,92vw)] flex-col border-l border-[var(--line)] bg-[var(--paper)] shadow-[0_0_60px_-10px_rgba(20,15,0,.24)]">
                <header className="flex items-center justify-between border-b border-[var(--line)] px-4 py-3">
                    <div>
                        <p className="text-[10px] font-semibold tracking-[.18em] text-[var(--faint)] uppercase">{mode === 'create' ? 'Create' : 'Edit'}</p>
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
                                            className="mt-0.5 h-4 w-4 rounded border-[var(--line)] bg-white accent-[#ffc629]"
                                        />
                                        <span>
                                            <span className="block text-[13px] text-[var(--ink)]">{field.label}</span>
                                            {field.help && <span className="mt-0.5 block text-[11.5px] text-[var(--faint)]">{field.help}</span>}
                                        </span>
                                    </label>
                                ) : (
                                    <>
                                        <label className="mb-1.5 block text-[11.5px] font-medium text-[var(--muted)]">{field.label}</label>
                                        {field.type === 'select' ? (
                                            <select
                                                value={form.data[field.name] ?? ''}
                                                onChange={(event) => form.setData(field.name, event.target.value)}
                                                className="h-9 w-full rounded-lg border border-[var(--line)] bg-white px-2.5 text-[13px] text-[var(--ink)] outline-none focus:border-[var(--yellow)]"
                                            >
                                                {(field.options ?? [])
                                                    .map((option) => (typeof option === 'string' ? { value: option, label: option } : option))
                                                    .map((option) => (
                                                        <option key={option.value} value={option.value} className="bg-white">
                                                            {option.label}
                                                        </option>
                                                    ))}
                                            </select>
                                        ) : (
                                            <input
                                                type={field.type === 'number' ? 'number' : field.type === 'password' ? 'password' : 'text'}
                                                autoComplete={field.type === 'password' ? 'new-password' : undefined}
                                                step={field.step}
                                                min={field.type === 'number' ? (field.min ?? 0) : undefined}
                                                value={form.data[field.name] ?? ''}
                                                onChange={(event) => form.setData(field.name, event.target.value)}
                                                className="h-9 w-full rounded-lg border border-[var(--line)] bg-white px-2.5 text-[13px] text-[var(--ink)] outline-none focus:border-[var(--yellow)]"
                                            />
                                        )}
                                        {field.help && <p className="mt-1 text-[11.5px] text-[var(--faint)]">{field.help}</p>}
                                    </>
                                )}

                                {form.errors[field.name] && (
                                    <p className="mt-1 text-[11.5px] text-[var(--warn)]">{form.errors[field.name]}</p>
                                )}
                            </div>
                        ))}
                    </div>

                    <footer className="flex items-center justify-end gap-2 border-t border-[var(--line)] px-4 py-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="h-8 rounded-md px-3 text-[12.5px] text-[var(--muted)] transition hover:text-[var(--ink)]"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="h-8 rounded-md bg-[var(--yellow)] px-3.5 text-[12.5px] font-semibold text-[#1a1400] transition hover:brightness-105 disabled:opacity-50"
                        >
                            {form.processing ? (mode === 'create' ? 'Creating...' : 'Saving...') : mode === 'create' ? 'Create plan' : 'Save changes'}
                        </button>
                    </footer>
                </form>
            </aside>
        </div>
    );
}
