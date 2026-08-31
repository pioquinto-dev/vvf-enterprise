<?php

namespace App\Services\Brevo;

use App\Models\CustomKeywordSearch;
use App\Models\Subscription;
use App\Models\User;
use App\Support\AppEventLogger;
use App\Support\BrevoTransactionalEmail;
use Throwable;

class BrevoLifecycleEmailService
{
    public function __construct(private readonly BrevoTransactionalEmailSender $sender) {}

    public function sendNewRegistration(User $user): void
    {
        try {
            $payload = BrevoTransactionalEmail::newRegistration($user);
            $result = $this->sender->send($payload);

            AppEventLogger::result('brevo.registration_email.sent', [
                'user_id' => $user->id,
                'email' => $user->email,
                'template_id' => $payload['templateId'] ?? null,
                'message_id' => $result['messageId'] ?? null,
            ]);
        } catch (Throwable $error) {
            AppEventLogger::error('brevo.registration_email.failed', $error, [
                'user_id' => $user->id,
                'email' => $user->email,
            ]);
        }
    }

    public function sendSubscriptionStarted(User $user, Subscription $subscription): void
    {
        $this->send(
            event: 'brevo.subscription_started',
            failureEvent: 'brevo.subscription_started.failed',
            payload: BrevoTransactionalEmail::subscriptionStarted($user, $subscription),
            context: [
                'user_id' => $user->id,
                'email' => $user->email,
                'subscription_id' => $subscription->id,
                'plan_id' => $subscription->plan_id,
                'status' => $subscription->status,
            ],
        );
    }

    public function sendSubscriptionCanceled(User $user, Subscription $subscription): void
    {
        $this->send(
            event: 'brevo.subscription_canceled',
            failureEvent: 'brevo.subscription_canceled.failed',
            payload: BrevoTransactionalEmail::subscriptionCanceled($user, $subscription),
            context: [
                'user_id' => $user->id,
                'email' => $user->email,
                'subscription_id' => $subscription->id,
                'plan_id' => $subscription->plan_id,
                'status' => $subscription->status,
            ],
        );
    }

    public function sendVerifyEmail(User $user): void
    {
        $this->send(
            event: 'brevo.verify_email.sent',
            failureEvent: 'brevo.verify_email.failed',
            payload: BrevoTransactionalEmail::verifyEmail($user),
            context: [
                'user_id' => $user->id,
                'email' => $user->email,
            ],
        );
    }

    public function sendTrialEnding(User $user, Subscription $subscription, int $daysRemaining): void
    {
        $this->send(
            event: 'brevo.trial_ending.sent',
            failureEvent: 'brevo.trial_ending.failed',
            payload: BrevoTransactionalEmail::trialEnding($user, $subscription, $daysRemaining),
            context: [
                'user_id' => $user->id,
                'email' => $user->email,
                'subscription_id' => $subscription->id,
                'plan_id' => $subscription->plan_id,
                'status' => $subscription->status,
                'days_remaining' => $daysRemaining,
            ],
        );
    }

    public function sendFinalFailedPayment(User $user, Subscription $subscription): void
    {
        $this->send(
            event: 'brevo.final_failed_payment.sent',
            failureEvent: 'brevo.final_failed_payment.failed',
            payload: BrevoTransactionalEmail::finalFailedPayment($user, $subscription),
            context: [
                'user_id' => $user->id,
                'email' => $user->email,
                'subscription_id' => $subscription->id,
                'plan_id' => $subscription->plan_id,
                'status' => $subscription->status,
            ],
        );
    }

    public function sendNoCardTrialEnding(User $user, Subscription $subscription, int $daysRemaining): void
    {
        $this->send(
            event: 'brevo.no_cc_trial_ending.sent',
            failureEvent: 'brevo.no_cc_trial_ending.failed',
            payload: BrevoTransactionalEmail::noCardTrialEnding($user, $subscription, $daysRemaining),
            context: [
                'user_id' => $user->id,
                'email' => $user->email,
                'subscription_id' => $subscription->id,
                'plan_id' => $subscription->plan_id,
                'status' => $subscription->status,
                'days_remaining' => $daysRemaining,
            ],
        );
    }

    public function sendSearchDone(User $user, CustomKeywordSearch $search): void
    {
        if (! config('brevo_notifications.search_done_enabled', false)) {
            return;
        }

        $this->send(
            event: 'brevo.search_done.sent',
            failureEvent: 'brevo.search_done.failed',
            payload: BrevoTransactionalEmail::searchDone($user, $search),
            context: [
                'user_id' => $user->id,
                'email' => $user->email,
                'search_id' => $search->id,
                'search_public_id' => $search->public_id,
                'search_type' => $search->search_type,
            ],
        );
    }

    /**
     * @param  array<string, mixed>  $payload
     * @param  array<string, mixed>  $context
     */
    private function send(string $event, string $failureEvent, array $payload, array $context): void
    {
        try {
            $result = $this->sender->send($payload);

            AppEventLogger::result($event, array_merge($context, [
                'template_id' => $payload['templateId'] ?? null,
                'message_id' => $result['messageId'] ?? null,
            ]));
        } catch (Throwable $error) {
            AppEventLogger::error($failureEvent, $error, $context);
        }
    }
}
