import { Link, usePage } from '@inertiajs/react';
import '../../../../css/blog.css';

export const base = '/x/admin/blogs';
export const slugify = (value) => value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export function Notice() {
    const { flash = {}, errors = {} } = usePage().props;
    return <>{flash.status && <p role="status" className="blog-notice">{flash.status}</p>}{Object.keys(errors).length > 0 && <div role="alert" className="blog-errors"><strong>Please check the following:</strong>{Object.entries(errors).map(([key, error]) => <p key={key}>{key}: {error}</p>)}</div>}</>;
}

export function Field({ label, children, error }) {
    return <label className="blog-field"><span>{label}</span>{children}{error && <small className="text-red-700">{error}</small>}</label>;
}

export function Pagination({ links = [] }) {
    if (links.length <= 3) return null;
    return <nav aria-label="Pagination" className="blog-pagination">{links.map((link, i) => {
        const label = i === 0 ? '← Previous' : i === links.length - 1 ? 'Next →' : String(link.label).replace(/<[^>]*>/g, '').replace(/&hellip;/g, '…');
        return link.url ? <Link key={i} href={link.url} aria-current={link.active ? 'page' : undefined} className={link.active ? 'active' : ''}>{label}</Link> : <span key={i} aria-disabled="true">{label}</span>;
    })}</nav>;
}

export function BlogTabs() {
    return <nav aria-label="Blog management" className="blog-tabs"><Link href={base}>Articles</Link><Link href={`${base}/create`}>Create article</Link><Link href={`${base}/categories`}>Categories</Link><Link href={`${base}/tags`}>Tags</Link><Link href={`${base}/featured`}>Featured</Link><a href="/blog" target="_blank" rel="noreferrer">View blog ↗</a></nav>;
}
