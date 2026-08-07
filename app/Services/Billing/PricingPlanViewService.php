<?php

namespace App\Services\Billing;

use App\Models\PricingPlan;
use Illuminate\Support\Facades\Schema;
use Throwable;

class PricingPlanViewService
{
    /**
     * @return array<int, array<string, mixed>>
     */
    public function activePlans(): array
    {
        try {
            if (! Schema::hasTable('plans')) {
                return [];
            }

            return PricingPlan::query()
                ->where('is_active', true)
                ->get([
                    'id',
                    'slug',
                    'name',
                    'features',
                    'metadata',
                    'description',
                    'amount',
                    'annual_amount',
                    'saved_amount',
                ])
                ->map(function (PricingPlan $plan): array {
                    $cta = (string) data_get($plan->metadata, 'cta', 'Choose plan');

                    if ($plan->slug === 'basic') {
                        $cta = 'Choose Basic';
                    }

                    return [
                        'id' => $plan->id,
                        'slug' => $plan->slug,
                        'name' => $plan->name,
                        'price' => (float) $plan->amount,
                        'annualPrice' => (float) $plan->annual_amount,
                        'savedAmount' => (float) $plan->saved_amount,
                        'tagline' => $plan->description,
                        'cta' => $cta,
                        'features' => $plan->features ?? [],
                        'popular' => (bool) data_get($plan->metadata, 'popular', false),
                        'trialEnabled' => (bool) data_get($plan->metadata, 'trialEnabled', false),
                        'searchCreditsLimit' => (int) data_get($plan->metadata, 'searchCreditsLimit', 0),
                        'searchCreditsUsed' => (int) data_get($plan->metadata, 'searchCreditsUsed', 0),
                        'bookmarkLimit' => (int) data_get($plan->metadata, 'bookmarkLimit', 0),
                        'bookmarksUsed' => (int) data_get($plan->metadata, 'bookmarksUsed', 0),
                    ];
                })
                ->all();
        } catch (Throwable) {
            return [];
        }
    }
}
