<?php

namespace App\Console\Commands\Testing;

use App\Models\PricingPlan;
use App\Models\Subscription;
use App\Models\User;
use App\Services\Brevo\BrevoTransactionalEmailSender;
use App\Support\BrevoTransactionalEmail;
use Illuminate\Console\Command;
use Carbon\CarbonImmutable;

class SendBrevoTestEmail extends Command
{
    protected $signature = 'testing:send-brevo-email
        {notification : One of new_registration, subscription_started, subscription_canceled, verify_email_manual_account, trial_ending, final_failed_payment, no_cc_trial_ending, search_done, or all}
        {--email= : Override the configured test recipient email}
        {--name=Test User : Recipient name}';

    protected $description = 'Send Brevo transactional test emails to the configured test inbox.';

    public function __construct(private readonly BrevoTransactionalEmailSender $sender)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $notification = (string) $this->argument('notification');
        $email = (string) ($this->option('email') ?: config('services.brevo.test_recipient_email', ''));
        $name = (string) $this->option('name');

        if ($email === '') {
            $this->error('Set BREVO_TEST_RECIPIENT_EMAIL or pass --email=');

            return self::FAILURE;
        }

        $user = $this->fakeUser($email, $name);
        $subscription = $this->fakeSubscription($user);
        $trialSubscription = $this->fakeSubscription($user)->forceFill(['status' => 'trialing']);

        $payloads = match ($notification) {
            'new_registration' => [BrevoTransactionalEmail::newRegistration($user)],
            'subscription_started' => [BrevoTransactionalEmail::subscriptionStarted($user, $subscription)],
            'subscription_canceled' => [BrevoTransactionalEmail::subscriptionCanceled($user, $subscription)],
            'verify_email_manual_account' => [BrevoTransactionalEmail::verifyEmail($user)],
            'trial_ending' => [BrevoTransactionalEmail::trialEnding($user, $trialSubscription, 3)],
            'final_failed_payment' => [BrevoTransactionalEmail::finalFailedPayment($user, $subscription)],
            'no_cc_trial_ending' => [BrevoTransactionalEmail::noCardTrialEnding($user, $trialSubscription, 3)],
            'search_done' => [BrevoTransactionalEmail::searchDone($user, $this->fakeSearch($user))],
            'all' => [
                BrevoTransactionalEmail::newRegistration($user),
                BrevoTransactionalEmail::subscriptionStarted($user, $subscription),
                BrevoTransactionalEmail::subscriptionCanceled($user, $subscription),
                BrevoTransactionalEmail::verifyEmail($user),
                BrevoTransactionalEmail::trialEnding($user, $trialSubscription, 3),
                BrevoTransactionalEmail::finalFailedPayment($user, $subscription),
                BrevoTransactionalEmail::noCardTrialEnding($user, $trialSubscription, 3),
                BrevoTransactionalEmail::searchDone($user, $this->fakeSearch($user)),
            ],
            default => null,
        };

        if ($payloads === null) {
            $this->error('Unknown notification. Use one of: new_registration, subscription_started, subscription_canceled, verify_email_manual_account, trial_ending, final_failed_payment, no_cc_trial_ending, search_done, all');

            return self::FAILURE;
        }

        foreach ($payloads as $payload) {
            $result = $this->sender->send($payload);

            $this->line(sprintf(
                'Sent template %s to %s (%s)',
                (string) ($payload['templateId'] ?? 'unknown'),
                (string) data_get($payload, 'to.0.name', $name),
                (string) data_get($payload, 'to.0.email', $email),
            ));
            $this->line('Brevo message ID: '.(string) ($result['messageId'] ?? json_encode($result)));
        }

        return self::SUCCESS;
    }

    private function fakeUser(string $email, string $name): User
    {
        return (new User())->forceFill([
            'id' => 999999,
            'name' => $name,
            'email' => $email,
        ]);
    }

    private function fakeSubscription(User $user): Subscription
    {
        $plan = (new PricingPlan())->forceFill([
            'id' => 'test-plan',
            'name' => 'Scale',
            'slug' => 'scale',
            'metadata' => [],
        ]);

        return (new Subscription())->forceFill([
            'id' => 'test-subscription',
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'status' => 'active',
            'current_period_starts_at' => CarbonImmutable::now()->subDays(16),
            'current_period_ends_at' => CarbonImmutable::now()->addDays(14),
            'trial_started_at' => CarbonImmutable::now()->subDays(4),
            'trial_ends_at' => CarbonImmutable::now()->addDays(3),
            'metadata' => [
                'subscription' => [
                    'search_limits' => ['used' => 2, 'limit' => 20],
                    'viral_video_bookmarks' => ['used' => 4, 'limit' => 25],
                    'search_bookmarks' => ['used' => 1, 'limit' => 15],
                    'video_analysis' => ['used' => 0, 'limit' => 5],
                ],
            ],
        ])->setRelation('user', $user)->setRelation('plan', $plan);
    }

    private function fakeSearch(User $user): \App\Models\CustomKeywordSearch
    {
        return (new \App\Models\CustomKeywordSearch())->forceFill([
            'id' => 12345,
            'public_id' => 'searchdone123',
            'user_id' => $user->id,
            'name' => 'Rhode',
            'phrase' => 'rhode',
            'search_type' => 'brand',
        ])->setRelation('user', $user);
    }
}
