import { Link, router, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout.jsx';
import { base, BlogTabs, Field, Notice, Pagination } from './shared.jsx';

export default function Articles({ articles, categories, tags, filters, stats }) {
    const [search, setSearch] = useState(filters.search ?? '');
    const form = useForm({ ids: [], action: '' });
    const [busy, setBusy] = useState(false);
    useEffect(() => { form.setData({ ids: [], action: '' }); }, [articles]);
    useEffect(() => setSearch(filters.search ?? ''), [filters.search]);
    const filter = (key, value) => router.get(base, { ...filters, [key]: value, page: 1 }, { preserveState: true });
    const mutate = (article, action) => {
        if (action === 'delete' && !confirm(`Permanently delete “${article.title}”?`)) return;
        router.visit(`${base}/${article.id}${action === 'delete' ? '' : `/${action}`}`, { method: action === 'delete' ? 'delete' : 'post', preserveScroll: true, onStart: () => setBusy(true), onFinish: () => setBusy(false) });
    };
    const bulk = (e) => {
        e.preventDefault();
        if (form.data.action === 'delete' && !confirm(`Permanently delete ${form.data.ids.length} selected articles?`)) return;
        form.post(`${base}/bulk`, { preserveScroll: true, onSuccess: () => form.reset() });
    };
    return <AdminLayout title="Articles" section="blogs" actions={<Link className="blog-button primary" href={`${base}/create`}>New article</Link>}>
        <div className="blog-admin"><BlogTabs /><Notice />
            <div className="blog-stats">{Object.entries(stats).map(([label, count]) => <div className="blog-panel" key={label}><span>{label}</span><strong>{count}</strong></div>)}</div>
            <section className="blog-panel">
                <div className="blog-filters">
                    <form onSubmit={(e) => { e.preventDefault(); filter('search', search); }}><Field label="Search articles"><input placeholder="Title, slug or excerpt" value={search} onChange={(e) => setSearch(e.target.value)} /></Field></form>
                    <Field label="Status"><select value={filters.status ?? ''} onChange={(e) => filter('status', e.target.value)}><option value="">All statuses</option><option value="published">Published</option><option value="draft">Draft</option></select></Field>
                    <Field label="Category"><select value={filters.category ?? ''} onChange={(e) => filter('category', e.target.value)}><option value="">All categories</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
                    <Field label="Tag"><select value={filters.tag ?? ''} onChange={(e) => filter('tag', e.target.value)}><option value="">All tags</option>{tags.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></Field>
                    <Field label="Featured"><select value={filters.featured ?? ''} onChange={(e) => filter('featured', e.target.value)}><option value="">All</option><option value="featured">Featured</option><option value="standard">Not featured</option></select></Field>
                    <Field label="Per page"><select value={filters.per_page ?? 10} onChange={(e) => filter('per_page', e.target.value)}>{[10, 25, 50].map((n) => <option key={n}>{n}</option>)}</select></Field>
                </div>
                {form.data.ids.length > 0 && <form onSubmit={bulk} className="blog-actions my-5"><strong>{form.data.ids.length} selected</strong><select aria-label="Bulk action" value={form.data.action} onChange={(e) => form.setData('action', e.target.value)}><option value="">Choose action</option><option value="publish">Publish</option><option value="draft">Move to draft</option><option value="feature">Feature</option><option value="delete">Delete</option></select><button className="blog-button" disabled={!form.data.action || form.processing || busy}>Apply</button></form>}
                <div className="overflow-x-auto"><table className="blog-table"><thead><tr><th><input type="checkbox" aria-label="Select all articles on this page" checked={articles.data.length > 0 && form.data.ids.length === articles.data.length} onChange={(e) => form.setData('ids', e.target.checked ? articles.data.map((a) => a.id) : [])} /></th><th>Title</th><th>Category</th><th>Status</th><th>Published</th><th>Actions</th></tr></thead><tbody>
                    {articles.data.map((article) => <tr key={article.id}><td><input type="checkbox" aria-label={`Select ${article.title}`} checked={form.data.ids.includes(article.id)} onChange={(e) => form.setData('ids', e.target.checked ? [...form.data.ids, article.id] : form.data.ids.filter((id) => id !== article.id))} /></td><td><Link className="font-semibold" href={`${base}/${article.id}/edit`}>{article.title}</Link><small className="block text-slate-500">{article.slug}</small>{article.is_featured && <span className="blog-badge">Featured</span>}</td><td>{article.category?.name ?? '—'}</td><td><span className={`blog-badge ${article.status}`}>{article.status}</span></td><td>{article.published_at?.slice(0, 10) ?? '—'}</td><td><div className="blog-actions"><Link className="blog-button" href={`${base}/${article.id}/edit`}>Edit</Link><button className="blog-button" disabled={busy || form.processing} onClick={() => mutate(article, article.status === 'published' ? 'unpublish' : 'publish')}>{article.status === 'published' ? 'Unpublish' : 'Publish'}</button><button className="blog-button" disabled={busy || form.processing} onClick={() => mutate(article, 'duplicate')}>Duplicate</button><button className="blog-button danger" disabled={busy || form.processing} onClick={() => mutate(article, 'delete')}>Delete</button></div></td></tr>)}
                    {!articles.data.length && <tr><td colSpan="6" className="text-center py-12">No articles found.</td></tr>}
                </tbody></table></div><Pagination links={articles.links} />
            </section>
        </div>
    </AdminLayout>;
}
