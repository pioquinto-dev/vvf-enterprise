import { Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Art, Badges, Card, Shell } from './components.jsx';
import { Pagination } from '../Admin/Blogs/shared.jsx';

export default function Index({ seo, jsonLd, search, selectedCategory, categories, featuredArticle, articles }) {
    const [query, setQuery] = useState(search);
    useEffect(() => setQuery(search), [search]);
    const categoryUrl = (slug) => `/blog?${new URLSearchParams({ ...(search ? { search } : {}), ...(slug ? { category: slug } : {}) })}`;
    return <Shell seo={seo} jsonLd={jsonLd}><main className="blog-wrap pb-20">
        <header className="blog-hero"><p className="blog-eyebrow">The Brand Beacon journal / Creator intelligence</p><h1>Good research.<br />Breakout ideas.</h1><p>Go beyond the scroll. Explore the strategies, signals and stories behind videos that get people talking.</p><form className="blog-search" onSubmit={(e) => { e.preventDefault(); router.get('/blog', { search: query, ...(selectedCategory ? { category: selectedCategory } : {}) }); }}><input aria-label="Search articles" placeholder="Search strategies, brands, ideas…" value={query} onChange={(e) => setQuery(e.target.value)} maxLength={255} /><button className="blog-button primary">Search</button></form></header>
        <nav className="blog-chips" aria-label="Article categories"><Link href={categoryUrl('')} className={!selectedCategory ? 'active' : ''} aria-current={!selectedCategory ? 'page' : undefined}>All articles</Link>{categories.map((category) => <Link key={category.id} href={categoryUrl(category.slug)} className={selectedCategory === category.slug ? 'active' : ''} aria-current={selectedCategory === category.slug ? 'page' : undefined}>{category.name}</Link>)}</nav>
        {featuredArticle && <Link href={featuredArticle.url} className="blog-feature">{featuredArticle.heroLarge ? <img src={featuredArticle.heroLarge} alt="" /> : <Art label={`${featuredArticle.readMinutes} minute read`} />}<div className="blog-feature-copy"><p className="blog-eyebrow mb-5">Featured story</p><Badges article={featuredArticle} /><h2>{featuredArticle.title}</h2><p>{featuredArticle.excerpt}</p><div className="blog-byline"><strong>{featuredArticle.author}</strong><span>{featuredArticle.publishedDate}</span></div><span className="blog-button primary">Read article ↗</span></div></Link>}
        <div className="flex items-center justify-between mb-6"><h2 className="text-2xl font-semibold tracking-tight">{search || selectedCategory ? 'Search Results' : 'Latest Articles'}</h2><span className="text-sm text-slate-500">{articles.total} articles</span></div>
        <div className="blog-grid">{articles.data.map((article) => <Card key={article.id} article={article} />)}</div>
        {!articles.data.length && <div className="blog-panel text-center py-16"><h2 className="text-xl font-semibold">No articles matched that search.</h2><p className="text-slate-500 mt-3">Try a broader keyword or explore all categories.</p><Link className="blog-button mt-6" href="/blog">View all articles</Link></div>}
        <Pagination links={articles.links} />
    </main></Shell>;
}
