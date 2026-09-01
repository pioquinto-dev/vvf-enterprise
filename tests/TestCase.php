<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setSearchCredits(\App\Models\User $user, int $remaining): void
    {
        $subscription = app(\App\Services\Billing\BillingService::class)->ensureSubscriptionRecord($user);
        $metadata = (array) $subscription->metadata;
        $limit = max($remaining, (int) data_get($metadata, 'subscription.search_limits.limit', 0));

        data_set($metadata, 'subscription.search_limits.limit', $limit);
        data_set($metadata, 'subscription.search_limits.used', max(0, $limit - $remaining));

        $subscription->forceFill(['metadata' => $metadata])->save();
    }

    protected function searchCreditsRemaining(\App\Models\User $user): int
    {
        return app(\App\Services\Billing\BillingEntitlementService::class)->searchCreditsRemaining($user);
    }
}
