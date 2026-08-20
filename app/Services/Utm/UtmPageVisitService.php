<?php

namespace App\Services\Utm;

use App\Models\UtmPageVisit;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class UtmPageVisitService
{
    private const SESSION_KEY = 'utm_page_visit_key';

    /**
     * Store one acquisition visit per browser session. This is intentionally
     * limited to public GET requests so admin and in-app navigation do not
     * pollute the acquisition report.
     */
    public function record(Request $request, array $utmParams): void
    {
        if (! $this->shouldRecord($request) || $request->session()->has(self::SESSION_KEY)) {
            return;
        }

        $visitKey = (string) Str::uuid();

        UtmPageVisit::query()->create([
            'visit_key' => $visitKey,
            'utm_source' => $this->source($utmParams['utm_source'] ?? null, $request),
            'utm_medium' => $utmParams['utm_medium'] ?? null,
            'utm_campaign' => $utmParams['utm_campaign'] ?? null,
            'referrer_host' => $this->referrerHost($request),
        ]);

        $request->session()->put(self::SESSION_KEY, $visitKey);
    }

    public function source(?string $utmSource, Request $request): ?string
    {
        $source = strtolower(trim((string) $utmSource));

        if ($source !== '' && $source !== 'organic') {
            return $source;
        }

        return $this->referrerHost($request);
    }

    public function referrerHost(Request $request): ?string
    {
        $host = strtolower((string) parse_url((string) $request->headers->get('referer'), PHP_URL_HOST));
        $host = preg_replace('/^www\\./', '', $host) ?? $host;
        $currentHost = strtolower((string) $request->getHost());

        return $host === '' || $host === $currentHost ? null : $host;
    }

    private function shouldRecord(Request $request): bool
    {
        return $request->isMethod('GET')
            && ! $request->user()
            && ! $request->header('X-Inertia')
            && ! $request->is('x/admin*')
            && ! $request->is('api/*');
    }
}
