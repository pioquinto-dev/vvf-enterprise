<?php

namespace App\Support;

use App\Models\Subscription;
use App\Models\User;
use Illuminate\Support\Facades\URL;

class BrevoTransactionalEmail
{
    public static function newRegistration(User $user): array
    {
        return self::payload('new_registration', $user, [
            'firstName' => self::firstName($user->name),
            'fullName' => $user->name,
            'loginUrl' => url('/login'),
            'dashboardUrl' => url('/dashboard'),
            'plansUrl' => url('/plans'),
        ]);
    }

    public static function subscriptionStarted(User $user, Subscription $subscription): array
    {
        $planName = ucfirst((string) ($subscription->plan?->name ?? $subscription->plan?->slug ?? 'Plan'));
        $isTrial = in_array($subscription->status, ['trialing', 'trial'], true);
        $endsAt = $isTrial
            ? ($subscription->trial_ends_at ?? $subscription->current_period_ends_at)
            : $subscription->current_period_ends_at;

        return self::payload('subscription_started', $user, [
            'firstName' => self::firstName($user->name),
            'fullName' => $user->name,
            'planName' => $planName,
            'planSlug' => (string) ($subscription->plan?->slug ?? ''),
            'isTrial' => $isTrial ? 'yes' : 'no',
            'accessEndsAt' => $endsAt?->timezone(config('app.timezone'))->format('F j, Y') ?? 'your renewal date',
            'renewalLabel' => $isTrial ? 'Trial ends' : 'Renews',
            'searchLimit' => (int) data_get($subscription->metadata, 'subscription.search_limits.limit', 0),
            'videoBookmarkLimit' => (int) data_get($subscription->metadata, 'subscription.viral_video_bookmarks.limit', 0),
            'searchBookmarkLimit' => (int) data_get($subscription->metadata, 'subscription.search_bookmarks.limit', 0),
            'videoAnalysisLimit' => (int) data_get($subscription->metadata, 'subscription.video_analysis.limit', 0),
            'dashboardUrl' => url('/dashboard'),
            'savedSearchesUrl' => url('/bookmark'),
            'settingsUrl' => url('/settings/subscription'),
        ]);
    }

    public static function subscriptionCanceled(User $user, Subscription $subscription): array
    {
        $planName = ucfirst((string) ($subscription->plan?->name ?? $subscription->plan?->slug ?? 'Plan'));

        return self::payload('subscription_canceled', $user, [
            'firstName' => self::firstName($user->name),
            'fullName' => $user->name,
            'planName' => $planName,
            'accessEndsAt' => $subscription->current_period_ends_at?->timezone(config('app.timezone'))->format('F j, Y') ?? 'the end of your current billing period',
            'dashboardUrl' => url('/dashboard'),
            'plansUrl' => url('/plans'),
            'supportEmail' => (string) config('mail.from.address', 'support@example.com'),
        ]);
    }

    public static function verifyEmail(User $user): array
    {
        return self::payload('verify_email_manual_account', $user, [
            'firstName' => self::firstName($user->name),
            'fullName' => $user->name,
            'verifyUrl' => URL::temporarySignedRoute(
                'verification.verify',
                now()->addDays(7),
                [
                    'id' => $user->id,
                    'hash' => sha1($user->getEmailForVerification()),
                ],
            ),
            'supportEmail' => (string) config('mail.from.address', 'support@example.com'),
            'expiresInDays' => 7,
        ]);
    }

    public static function trialEnding(User $user, Subscription $subscription, int $daysRemaining): array
    {
        $planName = ucfirst((string) ($subscription->plan?->name ?? $subscription->plan?->slug ?? 'Plan'));
        $endsAt = $subscription->trial_ends_at ?? $subscription->current_period_ends_at;

        return self::payload('trial_ending', $user, [
            'firstName' => self::firstName($user->name),
            'fullName' => $user->name,
            'planName' => $planName,
            'daysRemaining' => max(0, $daysRemaining),
            'trialEndsAt' => $endsAt?->timezone(config('app.timezone'))->format('F j, Y') ?? 'soon',
            'dashboardUrl' => url('/dashboard'),
            'settingsUrl' => url('/settings/subscription'),
            'plansUrl' => url('/plans'),
        ]);
    }

    private static function payload(string $notification, User $user, array $params): array
    {
        $definition = config("brevo_notifications.notifications.{$notification}", []);

        return [
            'sender' => [
                'name' => (string) config('brevo_notifications.sender.name'),
                'email' => (string) config('brevo_notifications.sender.email'),
            ],
            'to' => [[
                'email' => $user->email,
                'name' => $user->name,
            ]],
            'subject' => (string) ($definition['subject'] ?? 'BrandBeacon update'),
            'templateId' => (int) ($definition['template_id'] ?? 0),
            'tags' => (array) ($definition['tags'] ?? []),
            'params' => array_merge([
                'logoUrl' => (string) config('brevo_notifications.logo_url'),
                'appName' => (string) config('app.name', 'BrandBeacon'),
            ], $params),
        ];
    }

    private static function firstName(string $name): string
    {
        return str($name)->trim()->before(' ')->value() ?: 'there';
    }
}
