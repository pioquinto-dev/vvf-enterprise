<?php

namespace Tests\Unit;

use App\Models\PricingPlan;
use App\Models\Subscription;
use App\Models\User;
use App\Support\BrevoTransactionalEmail;
use Tests\TestCase;

class BrevoTransactionalEmailLimitsTest extends TestCase
{
    public function test_subscription_started_labels_unlimited_entitlements(): void
    {
        config()->set('brevo_notifications.notifications.subscription_started.template_id', 20);

        $user = User::factory()->make(['name' => 'Jane Example']);
        $plan = (new PricingPlan())->forceFill(['name' => 'Scale', 'slug' => 'scale']);
        $subscription = (new Subscription())->forceFill([
            'status' => 'active',
            'metadata' => [
                'subscription' => [
                    'search_limits' => ['limit' => -1],
                    'viral_video_bookmarks' => ['limit' => -1],
                    'search_bookmarks' => ['limit' => -1],
                    'video_analysis' => ['limit' => -1],
                ],
            ],
        ])->setRelation('plan', $plan);

        $params = BrevoTransactionalEmail::subscriptionStarted($user, $subscription)['params'];

        $this->assertSame('Unlimited', $params['searchLimit']);
        $this->assertSame('Unlimited', $params['videoBookmarkLimit']);
        $this->assertSame('Unlimited', $params['searchBookmarkLimit']);
        $this->assertSame('Unlimited', $params['videoAnalysisLimit']);
    }
}
