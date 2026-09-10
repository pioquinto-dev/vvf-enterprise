<?php

namespace App\Services\Analytics;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class AnalyticsEventManager
{
    private const CACHE_TTL_SECONDS = 86400;

    /**
     * @param  array<string, mixed>  $event
     */
    public function queueForUser(User $user, array $event): void
    {
        $key = $this->cacheKey($user->id);
        $events = Cache::get($key, []);

        if (! is_array($events)) {
            $events = [];
        }

        $events[] = $this->normalize($event);

        Cache::put($key, array_slice($events, -25), now()->addSeconds(self::CACHE_TTL_SECONDS));
    }

    /**
     * @param  array<string, mixed>  $event
     */
    public function flashToSession(Request $request, array $event): void
    {
        $events = $request->session()->get('analytics_events', []);

        if (! is_array($events)) {
            $events = [];
        }

        $events[] = $this->normalize($event);

        $request->session()->flash('analytics_events', array_slice($events, -25));
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function pullForRequest(Request $request): array
    {
        $sessionEvents = $request->session()->pull('analytics_events', []);
        $userEvents = [];
        $user = $request->user();

        if ($user !== null) {
            $userEvents = Cache::pull($this->cacheKey($user->id), []);
        }

        return collect(array_merge(
            is_array($sessionEvents) ? $sessionEvents : [],
            is_array($userEvents) ? $userEvents : [],
        ))
            ->filter(fn ($event): bool => is_array($event) && isset($event['event']))
            ->map(fn (array $event): array => $this->normalize($event))
            ->values()
            ->all();
    }

    /**
     * @param  array<string, mixed>  $event
     * @return array<string, mixed>
     */
    private function normalize(array $event): array
    {
        return [
            'event' => (string) ($event['event'] ?? 'custom_event'),
            'parameters' => array_merge(
                ['sent_at' => now()->toIso8601String()],
                is_array($event['parameters'] ?? null) ? $event['parameters'] : [],
            ),
        ];
    }

    private function cacheKey(int|string $userId): string
    {
        return 'analytics:user:'.$userId.':events';
    }
}
