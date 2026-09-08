import { Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Art, Badges, Card, Shell } from './components.jsx';
import { Pagination } from '../Admin/Blogs/shared.jsx';

export default function Index({ seo, jsonLd, search, selectedCategory, categories, featuredArticle, articles }) {
    const [query, setQuery] = useState(search);
    useEffect(() => setQuery(search), [search]);
    const categoryUrl = (slug) => `/blog?${new URLSearchParams({ ...(search ? { search } : {}), ...(slug ? { category: slug } : {}) })}`;
    return <Shell seo={seo} jsonLd={jsonLd}><main className="blog-wrap pb-32">
        <header className="blog-hero blog-hero--centered">
            <p className="blog-eyebrow-pill">Creator Intelligence</p>
            <h1><span className="ink">Signals, </span><span className="accent">breakdowns &amp; real data</span><br /><span className="ink">to spot your next breakout.</span></h1>
            <p>Go beyond the scroll. Explore the strategies, signals and stories behind the videos, brands and products gaining momentum right now.</p>
            <form className="blog-search" onSubmit={(e) => { e.preventDefault(); router.get('/blog', { search: query, ...(selectedCategory ? { category: selectedCategory } : {}) }); }}><input aria-label="Search articles" placeholder="Search strategies, brands, ideas…" value={query} onChange={(e) => setQuery(e.target.value)} maxLength={255} /><button className="blog-button primary">Search</button></form>
        </header>
        <nav className="blog-chips blog-chips--centered" aria-label="Article categories"><Link href={categoryUrl('')} className={!selectedCategory ? 'active' : ''} aria-current={!selectedCategory ? 'page' : undefined}>All articles</Link>{categories.map((category) => <Link key={category.id} href={categoryUrl(category.slug)} className={selectedCategory === category.slug ? 'active' : ''} aria-current={selectedCategory === category.slug ? 'page' : undefined}>{category.name}</Link>)}</nav>
        {featuredArticle && <><p className="blog-section-label">Featured article</p><Link href={featuredArticle.url} className="blog-feature">{featuredArticle.heroLarge ? <img src={featuredArticle.heroLarge} alt="" /> : <Art label={`${featuredArticle.readMinutes} minute read`} />}<div className="blog-feature-copy"><Badges article={featuredArticle} /><h2>{featuredArticle.title}</h2><p>{featuredArticle.excerpt}</p><div className="blog-byline"><strong>{featuredArticle.author}</strong><span>·</span><span>{featuredArticle.publishedDate}</span><span>·</span><span>Read article ↗</span></div></div></Link></>}
        <div className="flex items-center justify-between mb-6"><p className="blog-section-label mb-0">{search || selectedCategory ? 'Search Results' : 'Latest Articles'}</p><span className="text-sm text-slate-500">{articles.total} articles</span></div>
        <div className="blog-grid">{articles.data.map((article) => <Card key={article.id} article={article} />)}</div>
        {!articles.data.length && <div className="blog-panel text-center py-16"><h2 className="text-xl font-semibold">No articles matched that search.</h2><p className="text-slate-500 mt-3">Try a broader keyword or explore all categories.</p><Link className="blog-button mt-6" href="/blog">View all articles</Link></div>}
        <Pagination links={articles.links} />
    </main></Shell>;
}
