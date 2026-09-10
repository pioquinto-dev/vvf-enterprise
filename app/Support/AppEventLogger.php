<?php

namespace App\Support;

use App\Models\CriticalErrorLog;
use Illuminate\Support\Facades\Log;
use Throwable;

class AppEventLogger
{
    /**
     * @param  array<string, mixed>  $context
     */
    public static function result(string $event, array $context = []): void
    {
        Log::channel('operations')->info($event, self::normalize($context));
    }

    /**
     * @param  array<string, mixed>  $context
     */
    public static function error(string $event, Throwable|string $error, array $context = []): void
    {
        $payload = self::normalize($context);

        if ($error instanceof Throwable) {
            $payload['error'] = $error->getMessage();
            $payload['exception'] = get_class($error);
            $payload['file'] = $error->getFile();
            $payload['line'] = $error->getLine();
        } else {
            $payload['error'] = $error;
        }

        Log::channel('errors')->error($event, $payload);

        self::recordCritical($event, $error, $payload, $context);
    }

    /**
     * Every AppEventLogger::error() call is already this codebase's signal
     * for a high-priority failure (third-party connection errors, limit
     * exhaustion, core-feature exceptions) — mirror it into a queryable table
     * so the admin dashboard can surface it. This must never itself break the
     * caller: a logging table outage should not take down billing/search/etc.
     *
     * @param  array<string, mixed>  $payload
     * @param  array<string, mixed>  $context
     */
    private static function recordCritical(string $event, Throwable|string $error, array $payload, array $context): void
    {
        try {
            CriticalErrorLog::query()->create([
                'event' => $event,
                'message' => $error instanceof Throwable ? $error->getMessage() : $error,
                'exception_class' => $payload['exception'] ?? null,
                'file' => $payload['file'] ?? null,
                'line' => $payload['line'] ?? null,
                'context' => self::normalize($context),
                'created_at' => now(),
            ]);
        } catch (Throwable) {
            // Never let error-logging itself become a source of errors.
        }
    }

    /**
     * @param  array<string, mixed>  $context
     * @return array<string, mixed>
     */
    private static function normalize(array $context): array
    {
        foreach ($context as $key => $value) {
            if ($value instanceof Throwable) {
                $context[$key] = [
                    'message' => $value->getMessage(),
                    'exception' => get_class($value),
                ];
            }
        }

        return $context;
    }
}
