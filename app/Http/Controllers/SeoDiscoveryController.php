<?php

namespace App\Http\Controllers;

use Illuminate\Http\Response;

class SeoDiscoveryController extends Controller
{
    /**
     * Return crawler guidance from the configured canonical application URL.
     */
    public function robots(): Response
    {
        $baseUrl = $this->baseUrl();

        return response("User-agent: *\nAllow: /\n\nSitemap: {$baseUrl}/sitemap.xml\n", 200, [
            'Content-Type' => 'text/plain; charset=UTF-8',
        ]);
    }

    /**
     * List only stable, publicly useful pages. Search, account, and checkout
     * pages intentionally stay out of the sitemap.
     */
    public function sitemap(): Response
    {
        $urls = [
            '/',
            '/contact',
            '/privacy',
            '/terms',
            '/dpa',
            '/security',
            '/tiktok-brand-tracking',
            '/tiktok-product-research',
            '/viral-video-monitoring',
            '/ugc-trend-discovery',
        ];
        $entries = collect($urls)
            ->map(fn (string $path) => '    <url><loc>'.$this->escape($this->baseUrl().$path).'</loc></url>')
            ->implode("\n");

        $xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
            ."<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n"
            ."{$entries}\n"
            ."</urlset>\n";

        return response($xml, 200, [
            'Content-Type' => 'application/xml; charset=UTF-8',
        ]);
    }

    private function baseUrl(): string
    {
        return rtrim((string) config('app.url'), '/');
    }

    private function escape(string $value): string
    {
        return htmlspecialchars($value, ENT_XML1 | ENT_QUOTES, 'UTF-8');
    }
}
