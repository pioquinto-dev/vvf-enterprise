<?php

namespace App\Services\Utm;

use App\Models\User;
use App\Models\UtmAttribution;
use Illuminate\Http\Request;

class UtmAttributionService
{
    private const SESSION_KEY = 'utm_params';

    /**
     * @return array<string, string>
     */
    public function sessionParams(Request $request): array
    {
        $params = $request->session()->get(self::SESSION_KEY, []);

        return is_array($params) ? array_filter($params, fn (mixed $value): bool => filled($value)) : [];
    }

    public function createSignupAttribution(User $user, Request $request): ?UtmAttribution
    {
        $params = $this->sessionParams($request);

        if ($params === []) {
            return null;
        }

        return UtmAttribution::query()->create([
            'user_id' => $user->id,
            'utm_source' => $params['utm_source'] ?? null,
            'utm_medium' => $params['utm_medium'] ?? null,
            'utm_campaign' => $params['utm_campaign'] ?? null,
            'utm_content' => $params['utm_content'] ?? null,
            'utm_term' => $params['utm_term'] ?? null,
        ]);
    }

    public function createSubscriptionAttribution(User $user, ?string $subscriptionId): ?UtmAttribution
    {
        if (blank($subscriptionId)) {
            return null;
        }

        $source = UtmAttribution::query()
            ->where('user_id', $user->id)
            ->whereNull('subscription_id')
            ->latest('id')
            ->first();

        if ($source === null) {
            return null;
        }

        return UtmAttribution::query()->firstOrCreate(
            [
                'user_id' => $user->id,
                'subscription_id' => $subscriptionId,
            ],
            [
                'utm_source' => $source->utm_source,
                'utm_medium' => $source->utm_medium,
                'utm_campaign' => $source->utm_campaign,
                'utm_content' => $source->utm_content,
                'utm_term' => $source->utm_term,
            ]
        );
    }
}
