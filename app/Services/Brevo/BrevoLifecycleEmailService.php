<?php

namespace App\Services\Brevo;

use App\Models\CustomKeywordSearch;
use App\Models\EmailSend;
use App\Models\Subscription;
use App\Models\User;
use App\Support\AppEventLogger;
use App\Support\BrevoTransactionalEmail;
use App\Support\EmailTemplateRegistry;
use Throwable;

class BrevoLifecycleEmailService
{
    public function __construct(
        private readonly BrevoTransactionalEmailSender $sender,
        private readonly EmailSendLedger $ledger,
    ) {}

    public function sendNewRegistration(User $user): bool
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

            return true;
        } catch (Throwable $error) {
            AppEventLogger::error('brevo.registration_email.failed', $error, [
                'user_id' => $user->id,
                'email' => $user->email,
            ]);

            return false;
        }
    }

    public function sendSubscriptionStarted(User $user, Subscription $subscription): bool
    {
        return $this->send(
            event: 'brevo.subscription_started',
            failureEvent: 'brevo.subscription_started.failed',
            notification: 'subscription_started',
            user: $user,
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

    public function sendSubscriptionCanceled(User $user, Subscription $subscription): bool
    {
        return $this->send(
            event: 'brevo.subscription_canceled',
            failureEvent: 'brevo.subscription_canceled.failed',
            notification: 'subscription_canceled',
            user: $user,
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

    public function sendVerifyEmail(User $user): bool
    {
        return $this->send(
            event: 'brevo.verify_email.sent',
            failureEvent: 'brevo.verify_email.failed',
            notification: 'verify_email_manual_account',
            user: $user,
            payload: BrevoTransactionalEmail::verifyEmail($user),
            context: [
                'user_id' => $user->id,
                'email' => $user->email,
            ],
        );
    }

    public function sendTrialEnding(User $user, Subscription $subscription, int $daysRemaining): bool
    {
        return $this->send(
            event: 'brevo.trial_ending_cc.sent',
            failureEvent: 'brevo.trial_ending_cc.failed',
            notification: 'trial_ending_cc',
            user: $user,
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

    public function sendFinalFailedPayment(User $user, Subscription $subscription): bool
    {
        return $this->send(
            event: 'brevo.final_failed_payment.sent',
            failureEvent: 'brevo.final_failed_payment.failed',
            notification: 'final_failed_payment',
            user: $user,
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

    public function sendNoCardTrialEnding(User $user, Subscription $subscription, int $daysRemaining): bool
    {
        return $this->send(
            event: 'brevo.trial_ending_no_cc.sent',
            failureEvent: 'brevo.trial_ending_no_cc.failed',
            notification: 'trial_ending_no_cc',
            user: $user,
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

    public function sendPaymentFailed(User $user, Subscription $subscription, int $attempt, ?string $nextAttemptAt = null): bool
    {
        $notification = $attempt >= 2 ? 'payment_failed_second' : 'payment_failed_first';

        return $this->send(
            event: 'brevo.'.$notification.'.sent',
            failureEvent: 'brevo.'.$notification.'.failed',
            notification: $notification,
            user: $user,
            payload: BrevoTransactionalEmail::paymentFailed($user, $subscription, $attempt, $nextAttemptAt),
            context: [
                'user_id' => $user->id,
                'email' => $user->email,
                'subscription_id' => $subscription->id,
                'attempt' => $attempt,
            ],
        );
    }

    public function sendCardExpiring(User $user, Subscription $subscription, string $brand, string $last4, string $expiresOn): bool
    {
        return $this->send(
            event: 'brevo.card_expiring.sent',
            failureEvent: 'brevo.card_expiring.failed',
            notification: 'card_expiring',
            user: $user,
            payload: BrevoTransactionalEmail::cardExpiring($user, $subscription, $brand, $last4, $expiresOn),
            context: [
                'user_id' => $user->id,
                'email' => $user->email,
                'subscription_id' => $subscription->id,
                'card_last4' => $last4,
            ],
        );
    }

    /**
     * @param  array<string, int>  $breakouts
     */
    public function sendWeeklyDigest(User $user, Subscription $subscription, int $total, array $breakouts, string $weekOf, string $topSearch = ''): bool
    {
        return $this->send(
            event: 'brevo.weekly_digest.sent',
            failureEvent: 'brevo.weekly_digest.failed',
            notification: 'weekly_digest',
            user: $user,
            payload: BrevoTransactionalEmail::weeklyDigest($user, $subscription, $total, $breakouts, $weekOf, $topSearch),
            context: [
                'user_id' => $user->id,
                'email' => $user->email,
                'subscription_id' => $subscription->id,
                'breakouts' => $total,
            ],
        );
    }

    public function sendOnboardingNoSearch(User $user): bool
    {
        return $this->send(
            event: 'brevo.onboarding_no_search.sent',
            failureEvent: 'brevo.onboarding_no_search.failed',
            notification: 'onboarding_no_search',
            user: $user,
            payload: BrevoTransactionalEmail::onboardingNoSearch($user),
            context: ['user_id' => $user->id, 'email' => $user->email],
        );
    }

    public function sendFreeResultsFollowUp(User $user, CustomKeywordSearch $search, int $breakoutCount, string $stage): bool
    {
        $notification = $stage === 'last_note' ? 'free_results_last_note' : 'free_results_second_look';

        return $this->send(
            event: 'brevo.'.$notification.'.sent',
            failureEvent: 'brevo.'.$notification.'.failed',
            notification: $notification,
            user: $user,
            payload: BrevoTransactionalEmail::freeResultsFollowUp($user, $search, $breakoutCount, $stage),
            context: [
                'user_id' => $user->id,
                'email' => $user->email,
                'search_id' => $search->id,
                'breakouts' => $breakoutCount,
            ],
        );
    }

    public function sendTrialBreakoutScore(User $user, Subscription $subscription): bool
    {
        return $this->send(
            event: 'brevo.trial_breakout_score.sent',
            failureEvent: 'brevo.trial_breakout_score.failed',
            notification: 'trial_breakout_score',
            user: $user,
            payload: BrevoTransactionalEmail::trialBreakoutScore($user, $subscription),
            context: ['user_id' => $user->id, 'email' => $user->email, 'subscription_id' => $subscription->id],
        );
    }

    /**
     * @param  array<string, mixed>  $video
     */
    public function sendTrialOneBreakout(User $user, Subscription $subscription, CustomKeywordSearch $search, array $video): bool
    {
        return $this->send(
            event: 'brevo.trial_one_breakout.sent',
            failureEvent: 'brevo.trial_one_breakout.failed',
            notification: 'trial_one_breakout',
            user: $user,
            payload: BrevoTransactionalEmail::trialOneBreakout($user, $subscription, $search, $video),
            context: [
                'user_id' => $user->id,
                'email' => $user->email,
                'subscription_id' => $subscription->id,
                'search_id' => $search->id,
            ],
        );
    }

    public function sendWinback(User $user, Subscription $subscription, string $templateKey, int $missedCount, string $endedOn): bool
    {
        return $this->send(
            event: 'brevo.'.$templateKey.'.sent',
            failureEvent: 'brevo.'.$templateKey.'.failed',
            notification: $templateKey,
            user: $user,
            payload: BrevoTransactionalEmail::winback($user, $subscription, $templateKey, $missedCount, $endedOn),
            context: [
                'user_id' => $user->id,
                'email' => $user->email,
                'subscription_id' => $subscription->id,
                'missed_count' => $missedCount,
            ],
        );
    }

    /**
     * @param  array<int, array<string, mixed>>  $picks
     */
    public function sendBiweeklyPack(User $user, Subscription $subscription, array $picks, string $since): bool
    {
        return $this->send(
            event: 'brevo.biweekly_pack.sent',
            failureEvent: 'brevo.biweekly_pack.failed',
            notification: 'biweekly_pack',
            user: $user,
            payload: BrevoTransactionalEmail::biweeklyPack($user, $subscription, $picks, $since),
            context: [
                'user_id' => $user->id,
                'email' => $user->email,
                'subscription_id' => $subscription->id,
                'picks' => count($picks),
            ],
        );
    }

    public function sendSearchDone(User $user, CustomKeywordSearch $search): bool
    {
        if (! config('brevo_notifications.search_done_enabled', false)) {
            return false;
        }

        return $this->send(
            event: 'brevo.search_done.sent',
            failureEvent: 'brevo.search_done.failed',
            notification: 'search_done',
            user: $user,
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
     * True when this notification must not go to this recipient.
     *
     * Two independent reasons: the template is switched off in the registry,
     * or the recipient opted out and the template is marketing.
     */
    private function suppressed(string $notification, ?User $user): bool
    {
        if (! EmailTemplateRegistry::isEnabled($notification)) {
            return true;
        }

        return $user?->email_opted_out_at !== null
            && ! EmailTemplateRegistry::isTransactional($notification);
    }

    /**
     * @param  array<string, mixed>  $payload
     * @param  array<string, mixed>  $context
     */
    private function send(string $event, string $failureEvent, array $payload, array $context, ?string $notification = null, ?User $user = null): bool
    {
        // Marketing mail respects the unsubscribe list; transactional mail
        // (billing, verification, search results) never does, so a person who
        // opted out of winback still gets told their card failed.
        if ($notification !== null && $this->suppressed($notification, $user)) {
            AppEventLogger::result($event.'.suppressed', array_merge($context, [
                'notification' => $notification,
            ]));

            return false;
        }

        try {
            $result = $this->sender->send($payload);

            AppEventLogger::result($event, array_merge($context, [
                'template_id' => $payload['templateId'] ?? null,
                'message_id' => $result['messageId'] ?? null,
            ]));

            return true;
        } catch (Throwable $error) {
            AppEventLogger::error($failureEvent, $error, $context);

            return false;
        }
    }
}
