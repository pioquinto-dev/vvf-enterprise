import { Head, usePage } from '@inertiajs/react';

const BRAND_NAME = 'Brand Beacon';

function buildStructuredData({ siteUrl, canonical, schema }) {
  if (!siteUrl || !schema) return null;

  const organizationId = `${siteUrl}/#organization`;
  const graph = [];

  if (schema.organization) {
    graph.push({
      '@type': 'Organization',
      '@id': organizationId,
      name: BRAND_NAME,
      url: siteUrl,
      logo: `${siteUrl}/brand-beacon-logo.png`,
      email: 'hello@brandbeacon.com',
    });
  }

  if (schema.webSite) {
    graph.push({
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      name: BRAND_NAME,
      url: siteUrl,
      publisher: { '@id': organizationId },
    });
  }

  if (schema.softwareApplication) {
    graph.push({
      '@type': 'SoftwareApplication',
      name: BRAND_NAME,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      url: canonical,
      description: schema.softwareApplication.description,
      provider: { '@id': organizationId },
    });
  }

  const questions = Array.isArray(schema.faqs) ? schema.faqs : [];
  if (questions.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: questions.map(({ q, a }) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: a,
        },
      })),
    });
  }

  if (graph.length === 0) return null;

  // Escape HTML-significant characters before injecting a JSON-LD script tag.
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');
}

export default function Seo({ title, description, noIndex = false, schema = null }) {
  const { app = {}, url = '/' } = usePage();
  const siteUrl = String(app.url ?? '').replace(/\/$/, '');
  const path = String(url).split('?')[0] || '/';
  const canonical = siteUrl ? new URL(path, `${siteUrl}/`).toString() : undefined;
  const robots = noIndex ? 'noindex,follow' : 'index,follow';
  const structuredData = buildStructuredData({ siteUrl, canonical, schema });

  return (
    <Head title={title}>
      <meta head-key="description" name="description" content={description} />
      <meta head-key="robots" name="robots" content={robots} />
      {canonical && <link head-key="canonical" rel="canonical" href={canonical} />}
      <meta head-key="og:type" property="og:type" content="website" />
      <meta head-key="og:site_name" property="og:site_name" content={BRAND_NAME} />
      <meta head-key="og:title" property="og:title" content={title} />
      <meta head-key="og:description" property="og:description" content={description} />
      {canonical && <meta head-key="og:url" property="og:url" content={canonical} />}
      <meta head-key="twitter:card" name="twitter:card" content="summary" />
      <meta head-key="twitter:title" name="twitter:title" content={title} />
      <meta head-key="twitter:description" name="twitter:description" content={description} />
      {structuredData && <script head-key="structured-data" type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />}
    </Head>
  );
}
