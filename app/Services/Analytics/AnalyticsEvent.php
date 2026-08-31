<?php

namespace App\Services\Analytics;

class AnalyticsEvent
{
    /**
     * @param  array<string, mixed>  $parameters
     * @return array<string, mixed>
     */
    public static function make(string $name, array $parameters = []): array
    {
        return [
            'event' => $name,
            'parameters' => $parameters,
        ];
    }
}
