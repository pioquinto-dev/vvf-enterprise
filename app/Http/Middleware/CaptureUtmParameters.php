<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CaptureUtmParameters
{
    private const SESSION_KEY = 'utm_params';

    private const PARAMS = [
        'utm_source',
        'utm_medium',
        'utm_campaign',
        'utm_content',
        'utm_term',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $params = collect(self::PARAMS)
            ->mapWithKeys(fn (string $key): array => [$key => $request->query($key)])
            ->filter(fn (mixed $value): bool => filled($value))
            ->all();

        if ($params !== []) {
            $request->session()->put(self::SESSION_KEY, $params);
        }

        return $next($request);
    }
}
