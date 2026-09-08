import { Link, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout.jsx';
import { base, BlogTabs, Field, Notice, slugify } from './shared.jsx';
import { ArticleBlocks } from '../../Blog/components.jsx';

function ImageBlockField({ block, onChange, error }) {
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const upload = async (file) => {
        if (!file) return;
        setUploading(true);
        setUploadError(null);
        const data = new FormData();
        data.append('image', file);
        try {
            const csrf = document.querySelector('meta[name="csrf-token"]')?.content;
            const res = await fetch(`${base}/images`, { method: 'POST', body: data, headers: { 'X-Requested-With': 'XMLHttpRequest', ...(csrf ? { 'X-CSRF-TOKEN': csrf } : {}) } });
            if (!res.ok) throw new Error('Upload failed');
            const json = await res.json();
            onChange('src', json.url);
        } catch {
            setUploadError('Could not upload that image. Try again.');
        } finally {
            setUploading(false);
        }
    };
    return <Field label="Image" error={error || uploadError}>
        <div className="blog-image-drop">
            {block.src && <img src={block.src} alt="" />}
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={uploading} onChange={(e) => upload(e.target.files[0])} />
            {uploading && <span className="text-xs text-slate-500">Uploading…</span>}
        </div>
        <input placeholder="Or paste an image URL" value={block.src} onChange={(e) => onChange('src', e.target.value)} />
    </Field>;
}

const fields = { paragraph: ['text'], heading: ['text'], list: [], quote: ['text', 'attribution'], callout: ['title', 'text'], link: ['label', 'url', 'text'], image: ['src', 'alt', 'caption'], embed: ['url', 'caption'], cta: ['eyebrow', 'title', 'text', 'button_label', 'button_url'], divider: [] };
function newBlock(type) {
    return { type, ...Object.fromEntries(fields[type].map((key) => [key, key === 'eyebrow' ? 'Next step' : ''])), ...(type === 'heading' ? { level: 2 } : {}), ...(type === 'list' ? { style: 'bullet', items: ['', ''] } : {}), ...(type === 'callout' ? { tone: 'info' } : {}) };
}

export default function Editor({ article, content, categories, tags, publishedLocal, timezone, heroUrl }) {
    const form = useForm({ title: article?.title ?? '', slug: article?.slug ?? '', excerpt: article?.excerpt ?? '', status: article?.status ?? 'draft', published_at: publishedLocal ?? '', category_id: article?.category_id ?? '', tag_ids: article?.tags.map((t) => t.id) ?? [], is_featured: article?.is_featured ?? false, layout: content.layout, blocks: content.blocks, heroImageUpload: null });
    const [manualSlug, setManualSlug] = useState(!!article);
    const [preview, setPreview] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    useEffect(() => {
        if (!form.data.heroImageUpload) { setPreview(null); return; }
        const url = URL.createObjectURL(form.data.heroImageUpload);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [form.data.heroImageUpload]);
    const blocks = form.data.blocks;
    const update = (i, key, value) => form.setData('blocks', blocks.map((b, n) => n === i ? { ...b, [key]: value } : b));
    const move = (i, delta) => {
        const next = [...blocks];
        [next[i], next[i + delta]] = [next[i + delta], next[i]];
        form.setData('blocks', next);
    };
    const save = (status) => {
        form.transform((data) => ({ ...data, status, ...(article ? { _method: 'put' } : {}) }));
        form.post(article ? `${base}/${article.id}` : base, { forceFormData: true, preserveScroll: true, onSuccess: () => form.setData('heroImageUpload', null) });
    };
    return <AdminLayout title={article ? 'Edit article' : 'New article'} section="blogs-create" actions={<div className="blog-actions"><button type="button" className="blog-button" onClick={() => setShowPreview(true)}>Preview</button><button className="blog-button" disabled={form.processing} onClick={() => save('draft')}>Save draft</button><button className="blog-button primary" disabled={form.processing} onClick={() => save('published')}>{form.processing ? 'Saving…' : 'Publish'}</button></div>}>
        <div className="blog-admin"><BlogTabs /><Notice /><Link className="inline-block mb-4" href={base}>← Articles</Link>
            <div className="blog-editor"><div className="space-y-5">
                <section className="blog-panel space-y-5"><Field label="Title" error={form.errors.title}><input maxLength={255} value={form.data.title} onChange={(e) => form.setData({ ...form.data, title: e.target.value, ...(!manualSlug ? { slug: slugify(e.target.value) } : {}) })} /></Field><Field label="Slug" error={form.errors.slug}><input maxLength={255} value={form.data.slug} onChange={(e) => { setManualSlug(true); form.setData('slug', e.target.value); }} /></Field><Field label="Excerpt" error={form.errors.excerpt}><textarea rows={3} maxLength={500} value={form.data.excerpt} onChange={(e) => form.setData('excerpt', e.target.value)} /></Field></section>
                <div className="flex justify-between items-center"><h2 className="font-semibold text-lg">Content blocks</h2><span className="text-sm text-slate-500">Plain text · {blocks.length} blocks</span></div>
                {blocks.map((block, i) => <section key={i} className="blog-panel space-y-4"><div className="flex flex-wrap justify-between gap-3"><h3 className="capitalize font-semibold">{i + 1}. {block.type}</h3><div className="blog-actions"><button type="button" aria-label={`Move block ${i + 1} up`} disabled={i === 0} onClick={() => move(i, -1)}>↑ Up</button><button type="button" aria-label={`Move block ${i + 1} down`} disabled={i === blocks.length - 1} onClick={() => move(i, 1)}>↓ Down</button><button type="button" onClick={() => form.setData('blocks', [...blocks.slice(0, i + 1), JSON.parse(JSON.stringify(block)), ...blocks.slice(i + 1)])}>Duplicate</button><button type="button" className="text-red-700" onClick={() => form.setData('blocks', blocks.filter((_, n) => n !== i))}>Remove</button></div></div>
                    {block.type === 'heading' && <Field label="Heading level"><select value={block.level} onChange={(e) => update(i, 'level', Number(e.target.value))}>{[1, 2, 3].map((n) => <option value={n} key={n}>H{n}</option>)}</select></Field>}
                    {block.type === 'callout' && <Field label="Tone"><select value={block.tone} onChange={(e) => update(i, 'tone', e.target.value)}>{['info', 'tip', 'warning'].map((tone) => <option key={tone}>{tone}</option>)}</select></Field>}
                    {block.type === 'image' && <ImageBlockField block={block} onChange={(key, value) => update(i, key, value)} error={form.errors[`blocks.${i}.src`]} />}
                    {fields[block.type]?.filter((key) => !(block.type === 'image' && key === 'src')).map((key) => <Field key={key} label={key.replaceAll('_', ' ')} error={form.errors[`blocks.${i}.${key}`]}>{key === 'text' ? <textarea rows={4} value={block[key]} onChange={(e) => update(i, key, e.target.value)} /> : <input value={block[key]} onChange={(e) => update(i, key, e.target.value)} />}</Field>)}
                    {block.type === 'embed' && <p className="text-xs text-slate-500">YouTube or Vimeo HTTPS video links. Watch links are converted automatically.</p>}
                    {block.type === 'list' && <><Field label="List style"><select value={block.style} onChange={(e) => update(i, 'style', e.target.value)}><option value="bullet">Bullet</option><option value="ordered">Ordered</option></select></Field>{block.items.map((item, n) => <div key={n} className="flex gap-2"><input aria-label={`Block ${i + 1}, list item ${n + 1}`} value={item} onChange={(e) => update(i, 'items', block.items.map((v, j) => j === n ? e.target.value : v))} /><button type="button" aria-label={`Remove list item ${n + 1}`} onClick={() => update(i, 'items', block.items.filter((_, j) => j !== n))}>Remove</button></div>)}<button type="button" className="blog-button" onClick={() => update(i, 'items', [...block.items, ''])}>Add item</button></>}
                    {block.type === 'divider' && <hr className="border-slate-200" />}
                </section>)}
                {!blocks.length && <p className="blog-panel">No blocks yet. Add one below.</p>}
                <section className="blog-panel"><h3 className="font-semibold mb-3">Add a block</h3><div className="blog-actions">{Object.keys(fields).map((type) => <button type="button" className="blog-button capitalize" key={type} onClick={() => form.setData('blocks', [...blocks, newBlock(type)])}>+ {type}</button>)}</div></section>
            </div><aside className="space-y-5">
                <section className="blog-panel space-y-4"><h2 className="font-semibold">Settings</h2><Field label="Status"><select value={form.data.status} onChange={(e) => form.setData('status', e.target.value)}><option value="draft">Draft</option><option value="published">Published</option></select></Field><Field label={`Publication date (${timezone})`}><input type="datetime-local" value={form.data.published_at} onChange={(e) => form.setData('published_at', e.target.value)} /></Field><p className="text-xs text-slate-500">Publish makes the article public immediately. The date does not schedule publication.</p><Field label="Layout"><select value={form.data.layout} onChange={(e) => form.setData('layout', e.target.value)}>{['standard', 'guide', 'analysis'].map((v) => <option key={v}>{v}</option>)}</select></Field><Field label="Category"><select value={form.data.category_id} onChange={(e) => form.setData('category_id', e.target.value)}><option value="">Uncategorized</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field><label className="flex gap-2 items-center"><input type="checkbox" checked={form.data.is_featured} onChange={(e) => form.setData('is_featured', e.target.checked)} /> Featured</label></section>
                <section className="blog-panel"><h2 className="font-semibold mb-3">Tags</h2><div className="blog-actions">{tags.map((tag) => <button type="button" aria-pressed={form.data.tag_ids.includes(tag.id)} className={`blog-button ${form.data.tag_ids.includes(tag.id) ? 'primary' : ''}`} key={tag.id} onClick={() => form.setData('tag_ids', form.data.tag_ids.includes(tag.id) ? form.data.tag_ids.filter((id) => id !== tag.id) : [...form.data.tag_ids, tag.id])}>{tag.name}</button>)}{!tags.length && <p>No tags yet.</p>}</div></section>
                <section className="blog-panel space-y-3"><h2 className="font-semibold">Hero image</h2>{(preview || heroUrl) && <img className="rounded-xl w-full" src={preview || heroUrl} alt="Article hero preview" />}<Field label="Upload image (up to 5 MB)" error={form.errors.heroImageUpload}><input key={article?.updated_at ?? 'new'} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => form.setData('heroImageUpload', e.target.files[0] ?? null)} /></Field></section>
            </aside></div>
        </div>
        {showPreview && <div className="blog-modal-backdrop" role="dialog" aria-modal="true" aria-label="Article preview" onClick={(e) => e.target === e.currentTarget && setShowPreview(false)}>
            <div className="blog-modal">
                <div className="blog-modal-head">
                    <div><p className="blog-eyebrow">Preview</p><strong>{form.data.title || 'Untitled article'}</strong></div>
                    <button type="button" className="blog-button" onClick={() => setShowPreview(false)}>Close ✕</button>
                </div>
                <div className="blog-modal-body">
                    {(preview || heroUrl) && <img className="blog-article-hero" src={preview || heroUrl} alt={form.data.title} />}
                    {form.data.category_id && <p className="blog-eyebrow mb-3">{categories.find((c) => String(c.id) === String(form.data.category_id))?.name}</p>}
                    <h1 className="blog-article-title">{form.data.title || 'Untitled article'}</h1>
                    {form.data.excerpt && <p className="blog-article-excerpt">{form.data.excerpt}</p>}
                    <ArticleBlocks blocks={blocks} />
                </div>
            </div>
        </div>}
    </AdminLayout>;
}
