import { router, useForm } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import AdminLayout from '../components/AdminLayout.jsx';
import { base, BlogTabs, Field, Notice, slugify } from './shared.jsx';

export default function Taxonomy({ kind, items }) {
    const category = kind === 'categories';
    const singular = category ? 'category' : 'tag';
    const title = category ? 'Categories' : 'Tags';
    const dialog = useRef(null);
    const [editing, setEditing] = useState(null);
    const [open, setOpen] = useState(false);
    const [busy, setBusy] = useState(false);
    const [manualSlug, setManualSlug] = useState(false);
    const form = useForm({ name: '', slug: '', color: '#00e8c4' });
    useEffect(() => {
        if (!open) return;
        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        dialog.current.showModal();
        return () => { document.body.style.overflow = previous; };
    }, [open]);
    const close = () => { if (!form.processing) { dialog.current.close(); setOpen(false); } };
    const edit = (item = null) => {
        setEditing(item); setManualSlug(!!item); form.clearErrors();
        form.setData({ name: item?.name ?? '', slug: item?.slug ?? '', color: item?.color ?? '#00e8c4' });
        setOpen(true);
    };
    const submit = (e) => {
        e.preventDefault();
        form[editing ? 'put' : 'post'](`${base}/${kind}${editing ? `/${editing.id}` : ''}`, { preserveScroll: true, onSuccess: () => { dialog.current.close(); setOpen(false); form.reset(); } });
    };
    const remove = (item) => {
        if (!confirm(`Delete ${singular} “${item.name}”? Its ${item.articles_count} articles will be retained.`)) return;
        router.delete(`${base}/${kind}/${item.id}`, { preserveScroll: true, onStart: () => setBusy(true), onFinish: () => setBusy(false) });
    };
    return <AdminLayout title={title} section={`blogs-${kind}`} actions={<button className="blog-button primary" onClick={() => edit()}>New {singular}</button>}>
        <div className="blog-admin"><BlogTabs /><Notice /><section className="blog-panel">
            {items.map((item) => <div className="blog-taxonomy-row" key={item.id}>{category && <span className="w-5 h-5 rounded-full border border-slate-200 shrink-0" style={{ backgroundColor: item.color }} />}<div className="min-w-0 flex-1"><strong>{item.name}</strong><p className="text-sm text-slate-500">{item.slug} · {item.articles_count} articles</p></div><button className="blog-button" onClick={() => edit(item)}>Edit</button><button className="blog-button danger" disabled={busy} onClick={() => remove(item)}>Delete</button></div>)}
            {!items.length && <p className="text-center py-12">No {kind} yet.</p>}
        </section>
        <dialog ref={dialog} className="blog-dialog" aria-labelledby="taxonomy-title" onCancel={(e) => { e.preventDefault(); close(); }} onClick={(e) => { if (e.target === dialog.current) close(); }}>
            <form onSubmit={submit} className="blog-panel space-y-5"><div className="flex justify-between items-center"><h2 id="taxonomy-title" className="font-semibold text-xl">{editing ? 'Edit' : 'New'} {singular}</h2><button type="button" aria-label="Close dialog" disabled={form.processing} onClick={close}>✕</button></div><Field label="Name" error={form.errors.name}><input autoFocus required maxLength={255} value={form.data.name} onChange={(e) => form.setData({ ...form.data, name: e.target.value, ...(!manualSlug ? { slug: slugify(e.target.value) } : {}) })} /></Field><Field label="Slug" error={form.errors.slug}><input required maxLength={255} value={form.data.slug} onChange={(e) => { setManualSlug(true); form.setData('slug', e.target.value); }} /></Field>
            {category && <div className="flex gap-3"><Field label="Color picker"><input type="color" value={/^#[0-9a-f]{6}$/i.test(form.data.color) ? form.data.color : '#00e8c4'} onChange={(e) => form.setData('color', e.target.value)} /></Field><Field label="Hex color" error={form.errors.color}><input value={form.data.color} maxLength={7} pattern="#[0-9A-Fa-f]{6}" onChange={(e) => form.setData('color', e.target.value)} /></Field></div>}
            <div className="blog-actions justify-end"><button className="blog-button" type="button" disabled={form.processing} onClick={close}>Cancel</button><button className="blog-button primary" disabled={form.processing}>{form.processing ? 'Saving…' : 'Save'}</button></div></form>
        </dialog></div>
    </AdminLayout>;
}
