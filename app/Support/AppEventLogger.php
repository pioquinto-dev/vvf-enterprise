<?php

namespace App\Support;

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
