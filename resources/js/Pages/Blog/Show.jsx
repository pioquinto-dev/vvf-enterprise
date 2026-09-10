import { Link } from '@inertiajs/react';
import { Art, ArticleBlocks, Badges, Card, Cta, Shell } from './components.jsx';

export default function Show({ seo, jsonLd, article, blocks, tocItems, relatedArticles }) {
    return <Shell seo={seo} jsonLd={jsonLd}><main className="blog-wrap blog-detail">
        <nav className="blog-breadcrumb" aria-label="Breadcrumb"><Link href="/blog">Blog</Link>{article.category && <> / <Link href={`/blog?category=${encodeURIComponent(article.category.slug)}`}>{article.category.name}</Link></>} / <span>{article.title.length > 52 ? `${article.title.slice(0, 52)}…` : article.title}</span></nav>
        <div className="blog-reading-layout"><article className="min-w-0"><Badges article={article} /><h1 className="blog-article-title">{article.title}</h1>{article.excerpt && <p className="blog-article-excerpt">{article.excerpt}</p>}<div className="blog-byline"><img src="/brand-beacon-logo.svg" alt="" width="32" height="32" /><strong>{article.author}</strong><time>{article.publishedLabel}</time><span>{article.readMinutes} min read</span><span>{article.blockCount} sections</span></div>{article.heroLarge ? <img className="blog-article-hero" src={article.heroLarge} alt={article.title} /> : <Art className="blog-article-hero" label="No hero image selected" />}<ArticleBlocks blocks={blocks} /></article>
        <aside><div>{tocItems.length > 0 && <nav className="blog-toc" aria-label="In this article"><h2 className="blog-eyebrow mb-4">In this article</h2>{tocItems.map((item) => <a key={item.id} href={`#${item.id}`} style={{ paddingLeft: item.level === 3 ? 16 : 0 }}>{item.label}</a>)}</nav>}<Cta /></div></aside></div>
        {relatedArticles.length > 0 && <section className="mt-20"><h2 className="text-2xl font-semibold mb-6">Continue Reading</h2><div className="blog-grid related">{relatedArticles.map((related) => <Card key={related.id} article={related} />)}</div></section>}
    </main></Shell>;
}
