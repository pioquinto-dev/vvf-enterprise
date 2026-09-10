import { Head, Link } from '@inertiajs/react';
import Nav from '../../landing/sections/Nav.jsx';
import Footer from '../../landing/sections/Footer.jsx';
import '../../../css/blog.css';

export function Shell({ seo, jsonLd, children }) {
    return <><Head title={seo.title}>
        <meta head-key="description" name="description" content={seo.description} />
        <meta head-key="robots" name="robots" content={seo.noIndex ? 'noindex,follow' : 'index,follow'} />
        <link head-key="canonical" rel="canonical" href={seo.canonical} />
        <meta head-key="og:type" property="og:type" content={seo.type ?? 'website'} />
        <meta head-key="og:title" property="og:title" content={seo.title} />
        <meta head-key="og:description" property="og:description" content={seo.description} />
        <meta head-key="og:url" property="og:url" content={seo.canonical} />
        <meta head-key="og:image" property="og:image" content={seo.image || new URL('/brand-beacon-logo.svg', seo.canonical).href} />
        <meta head-key="twitter:card" name="twitter:card" content="summary_large_image" />
        {seo.published && <meta head-key="published" property="article:published_time" content={seo.published} />}
        {seo.modified && <meta head-key="modified" property="article:modified_time" content={seo.modified} />}
        <script head-key="blog-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
    </Head><div className="blog-public"><div className="bbh"><Nav homeHref="/" /></div>{children}<div className="bbh"><Footer homeHref="/" /></div></div></>;
}

export function Badges({ article }) {
    return <div className="flex flex-wrap gap-2">{article.category && <span className="blog-badge">{article.category.name}</span>}{article.tags.map((tag) => <span className="blog-badge" key={tag.name}>{tag.name}</span>)}</div>;
}

export function Art({ label = 'Creator intelligence', className = '' }) {
    return <div className={`blog-art ${className}`}><span>{label}</span></div>;
}

export function Card({ article }) {
    return <Link href={article.url} className="blog-card">{article.heroMedium ? <img src={article.heroMedium} alt="" loading="lazy" /> : <Art />}<div className="blog-card-copy"><Badges article={article} /><h3>{article.title}</h3><p>{article.excerpt}</p><div className="blog-card-footer"><time>{article.publishedDate}</time><span>Read article ↗</span></div></div></Link>;
}

export function Cta({ eyebrow = 'Put your research to work', title = 'Find your next breakout idea.', text = 'Discover the videos, brands and products gaining momentum with Brand Beacon.', button_label = 'Explore Brand Beacon', button_url = '/home' }) {
    return <section className="blog-cta"><p className="blog-eyebrow">{eyebrow}</p><h2>{title}</h2><p className="text-sm leading-relaxed">{text}</p>{button_label && button_url && <a className="blog-button primary" href={button_url}>{button_label} →</a>}</section>;
}

export function ArticleBlocks({ blocks }) {
    return <div className="blog-blocks">{blocks.map((b, i) => {
        switch (b.type) {
            case 'paragraph': return b.text ? <p key={i}>{b.text}</p> : null;
            case 'heading': { const Tag = `h${b.level}`; return b.text ? <Tag key={i} id={b.anchor}>{b.text}</Tag> : null; }
            case 'list': { const Tag = b.style === 'ordered' ? 'ol' : 'ul'; return b.items.length ? <Tag key={i}>{b.items.map((item, n) => <li key={n}>{item}</li>)}</Tag> : null; }
            case 'quote': return b.text ? <blockquote key={i}><p>{b.text}</p>{b.attribution && <cite>— {b.attribution}</cite>}</blockquote> : null;
            case 'callout': return b.title || b.text ? <section className={`blog-callout ${b.tone}`} key={i}>{b.title && <strong>{b.title}</strong>}{b.text && <p>{b.text}</p>}</section> : null;
            case 'link': return b.label && b.url ? <a className="blog-panel" key={i} href={b.url} target="_blank" rel="noopener noreferrer"><strong>{b.label} ↗</strong>{b.text && <p>{b.text}</p>}</a> : null;
            case 'image': return b.src ? <figure key={i}><img src={b.src} alt={b.alt} loading="lazy" />{b.caption && <figcaption>{b.caption}</figcaption>}</figure> : null;
            case 'embed': return b.url ? <figure key={i}><iframe src={b.url} title={b.caption || `Embedded video ${i + 1}`} loading="lazy" allowFullScreen sandbox="allow-scripts allow-same-origin allow-presentation" referrerPolicy="strict-origin-when-cross-origin" allow="fullscreen; picture-in-picture" />{b.caption && <figcaption>{b.caption}</figcaption>}</figure> : null;
            case 'cta': return b.title || b.text ? <Cta key={i} {...b} /> : null;
            case 'divider': return <hr className="border-slate-200" key={i} />;
            default: return null;
        }
    })}</div>;
}
