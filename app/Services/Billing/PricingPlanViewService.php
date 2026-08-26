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
                ->purchasable()
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
                    'duration',
                    'plan_type',
                ])
                ->map(function (PricingPlan $plan): array {
                    $cta = (string) data_get($plan->metadata, 'settings.cta', 'Choose plan');
                    $trialEnabled = (bool) data_get($plan->metadata, 'subscription.trialEnabled', false);
                    $searchLimit = (int) data_get($plan->metadata, 'subscription.search_limits.limit', 0);
                    $videoBookmarkLimit = (int) data_get($plan->metadata, 'subscription.viral_video_bookmarks.limit', 0);
                    $searchBookmarkLimit = (int) data_get($plan->metadata, 'subscription.search_bookmarks.limit', 0);
                    $videoAnalysisLimit = (int) data_get($plan->metadata, 'subscription.video_analysis.limit', 0);
                    $annualSavingsPercent = (int) data_get(
                        $plan->metadata,
                        'settings.annualSavingsPercent',
                        ($plan->amount ?? 0) > 0 && ($plan->annual_amount ?? 0) > 0
                            ? round((1 - ((float) $plan->annual_amount / (((float) $plan->amount) * 12))) * 100)
                            : 0
                    );

                    if ($plan->plan_type === 'growth') {
                        $cta = 'Choose Growth';
                    }

                    if ($plan->plan_type === 'scale') {
                        $cta = 'Choose Scale';
                    }

                    return [
                        'id' => $plan->id,
                        'slug' => $plan->slug,
                        'planType' => $plan->plan_type,
                        'duration' => $plan->duration ?? 'monthly',
                        'name' => $plan->name,
                        'price' => (float) $plan->amount,
                        'savedAmount' => (float) $plan->saved_amount,
                        'annualSavingsPercent' => $annualSavingsPercent,
                        'tagline' => $plan->description,
                        'cta' => $cta,
                        'features' => $plan->features ?? [],
                        'popular' => (bool) data_get($plan->metadata, 'settings.popular', false),
                        'trialEnabled' => $trialEnabled,
                        'searchCreditsLimit' => $searchLimit,
                        'searchCreditsUsed' => (int) data_get($plan->metadata, 'subscription.search_limits.used', 0),
                        'bookmarkLimit' => $searchBookmarkLimit,
                        'bookmarksUsed' => (int) data_get($plan->metadata, 'subscription.search_bookmarks.used', 0),
                        'videoBookmarkLimit' => $videoBookmarkLimit,
                        'videoBookmarkUsed' => (int) data_get($plan->metadata, 'subscription.viral_video_bookmarks.used', 0),
                        'searchBookmarkLimit' => $searchBookmarkLimit,
                        'searchBookmarkUsed' => (int) data_get($plan->metadata, 'subscription.search_bookmarks.used', 0),
                        'videoAnalysisLimit' => $videoAnalysisLimit,
                        'videoAnalysisUsed' => (int) data_get($plan->metadata, 'subscription.video_analysis.used', 0),
                    ];
                })
                ->all();
        } catch (Throwable) {
            return [];
        }
    }
}
