import { router, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout.jsx';
import { base, BlogTabs, Notice } from './shared.jsx';

export default function Featured({ articles }) {
    const [order, setOrder] = useState(articles);
    const [busy, setBusy] = useState(false);
    const form = useForm({ ordered_ids: [] });
    useEffect(() => setOrder(articles), [articles]);
    const dirty = order.some((a, i) => a.id !== articles[i]?.id);
    const move = (i, delta) => { const next = [...order]; [next[i], next[i + delta]] = [next[i + delta], next[i]]; setOrder(next); };
    const save = () => form.transform(() => ({ ordered_ids: order.map((a) => a.id) })).put(`${base}/featured`, { preserveScroll: true });
    const remove = (article) => {
        if (!confirm(`Remove “${article.title}” from featured articles?`)) return;
        router.post(`${base}/${article.id}/unfeature`, {}, { preserveScroll: true, onStart: () => setBusy(true), onFinish: () => setBusy(false) });
    };
    return <AdminLayout title="Featured articles" section="blogs-featured" actions={dirty && <button className="blog-button primary" disabled={form.processing || busy} onClick={save}>Save order</button>}>
        <div className="blog-admin"><BlogTabs /><Notice /><section className="blog-panel">{order.map((article, i) => <div key={article.id} className="blog-taxonomy-row"><span className="blog-badge">{i + 1}</span>{article.heroUrl && <img src={article.heroUrl} alt="" className="h-12 w-16 rounded-lg object-cover" />}<div className="min-w-0 flex-1"><strong className="block truncate">{article.title}</strong><small>{article.category?.name ?? 'Uncategorized'}</small></div><div className="blog-actions"><button aria-label={`Move ${article.title} up`} disabled={i === 0 || busy || form.processing} onClick={() => move(i, -1)}>↑ Up</button><button aria-label={`Move ${article.title} down`} disabled={i === order.length - 1 || busy || form.processing} onClick={() => move(i, 1)}>↓ Down</button><button className="text-red-700" disabled={busy || form.processing} onClick={() => remove(article)}>Remove</button></div></div>)}{!order.length && <div className="text-center py-12"><h2 className="font-semibold">No featured articles yet.</h2><p className="mt-2 text-slate-500">Feature a published article from the articles table.</p></div>}</section></div>
    </AdminLayout>;
}
