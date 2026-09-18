<?php

namespace App\Support;

use App\Models\CustomKeywordSearch;
use App\Models\Subscription;
use App\Models\User;
use RuntimeException;
use Illuminate\Support\Facades\URL;

class BrevoTransactionalEmail
{
    public static function newRegistration(User $user): array
    {
        return self::payload('new_registration', $user, [
            'firstName' => self::firstName($user->name),
            'fullName' => $user->name,
            'loginUrl' => url('/login'),
            'dashboardUrl' => url('/home'),
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
            'searchLimit' => self::limitLabel(data_get($subscription->metadata, 'subscription.search_limits.limit', 0)),
            'videoBookmarkLimit' => self::limitLabel(data_get($subscription->metadata, 'subscription.viral_video_bookmarks.limit', 0)),
            'searchBookmarkLimit' => self::limitLabel(data_get($subscription->metadata, 'subscription.search_bookmarks.limit', 0)),
            'videoAnalysisLimit' => self::limitLabel(data_get($subscription->metadata, 'subscription.video_analysis.limit', 0)),
            'dashboardUrl' => url('/home'),
            'savedSearchesUrl' => url('/library'),
            'settingsUrl' => url('/settings/subscription'),
        ], new EmailContext($user, $subscription));
    }

    public static function subscriptionCanceled(User $user, Subscription $subscription): array
    {
        $planName = ucfirst((string) ($subscription->plan?->name ?? $subscription->plan?->slug ?? 'Plan'));

        return self::payload('subscription_canceled', $user, [
            'firstName' => self::firstName($user->name),
            'fullName' => $user->name,
            'planName' => $planName,
            'accessEndsAt' => $subscription->current_period_ends_at?->timezone(config('app.timezone'))->format('F j, Y') ?? 'the end of your current billing period',
            'dashboardUrl' => url('/home'),
            'plansUrl' => url('/plans'),
            'supportEmail' => (string) config('mail.from.address', 'support@example.com'),
        ], new EmailContext($user, $subscription));
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

        return self::payload('trial_ending_cc', $user, [
            'firstName' => self::firstName($user->name),
            'fullName' => $user->name,
            'planName' => $planName,
            'daysRemaining' => max(0, $daysRemaining),
            'trialEndsAt' => $endsAt?->timezone(config('app.timezone'))->format('F j, Y') ?? 'soon',
            'dashboardUrl' => url('/home'),
            'settingsUrl' => url('/settings/subscription'),
            'plansUrl' => url('/plans'),
        ], new EmailContext($user, $subscription));
    }

    public static function finalFailedPayment(User $user, Subscription $subscription): array
    {
        $planName = ucfirst((string) ($subscription->plan?->name ?? $subscription->plan?->slug ?? 'Plan'));

        return self::payload('final_failed_payment', $user, [
            'firstName' => self::firstName($user->name),
            'fullName' => $user->name,
            'planName' => $planName,
            'accessEndedAt' => $subscription->current_period_ends_at?->timezone(config('app.timezone'))->format('F j, Y') ?? 'today',
            'dashboardUrl' => url('/home'),
            'settingsUrl' => url('/settings/subscription'),
            'contactUrl' => url('/contact'),
            'plansUrl' => url('/plans'),
            'supportEmail' => (string) config('mail.from.address', 'support@example.com'),
        ], new EmailContext($user, $subscription));
    }

    public static function noCardTrialEnding(User $user, Subscription $subscription, int $daysRemaining): array
    {
        $planName = ucfirst((string) ($subscription->plan?->name ?? $subscription->plan?->slug ?? 'Plan'));
        $endsAt = $subscription->trial_ends_at ?? $subscription->current_period_ends_at;

        return self::payload('trial_ending_no_cc', $user, [
            'firstName' => self::firstName($user->name),
            'fullName' => $user->name,
            'planName' => $planName,
            'daysRemaining' => max(0, $daysRemaining),
            'trialEndsAt' => $endsAt?->timezone(config('app.timezone'))->format('F j, Y') ?? 'soon',
            'dashboardUrl' => url('/home'),
            'settingsUrl' => url('/settings/subscription'),
            'plansUrl' => url('/plans'),
        ], new EmailContext($user, $subscription));
    }

    /**
     * Dunning notice. `$attempt` is Stripe's invoice attempt_count, which is
     * the only thing that distinguishes the first polite nudge from the
     * second, more urgent one.
     */
    public static function paymentFailed(User $user, Subscription $subscription, int $attempt, ?string $nextAttemptAt): array
    {
        $planName = ucfirst((string) ($subscription->plan?->name ?? $subscription->plan?->slug ?? 'Plan'));

        return self::payload($attempt >= 2 ? 'payment_failed_second' : 'payment_failed_first', $user, [
            'firstName' => self::firstName($user->name),
            'fullName' => $user->name,
            'planName' => $planName,
            'attempt' => $attempt,
            'nextAttemptAt' => $nextAttemptAt ?? 'in a few days',
            'billingUrl' => url('/settings/subscription'),
            'dashboardUrl' => url('/home'),
            'supportEmail' => (string) config('mail.from.address', 'support@example.com'),
        ], new EmailContext($user, $subscription));
    }

    /**
     * Heads-up before the card on file expires. Uses the card details captured
     * on the last successful invoice, so it costs no Stripe call.
     */
    public static function cardExpiring(User $user, Subscription $subscription, string $brand, string $last4, string $expiresOn): array
    {
        return self::payload('card_expiring', $user, [
            'firstName' => self::firstName($user->name),
            'fullName' => $user->name,
            'cardBrand' => $brand,
            'cardLast4' => $last4,
            'cardExpiryDate' => $expiresOn,
            'planName' => ucfirst((string) ($subscription->plan?->name ?? $subscription->plan?->slug ?? 'Plan')),
            'billingUrl' => url('/settings/subscription'),
            'supportEmail' => (string) config('mail.from.address', 'support@example.com'),
        ], new EmailContext($user, $subscription));
    }

    /**
     * The Monday digest.
     *
     * @param  array<string, int>  $breakouts  Counts keyed by search type.
     */
    public static function weeklyDigest(User $user, Subscription $subscription, int $total, array $breakouts, string $weekOf, string $topSearch = ''): array
    {
        return self::payload('weekly_digest', $user, [
            'firstName' => self::firstName($user->name),
            'fullName' => $user->name,
            'breakoutCount' => $total,
            'searchTerm' => $topSearch,
            'brandBreakouts' => (int) ($breakouts['brand'] ?? 0),
            'productBreakouts' => (int) ($breakouts['product'] ?? 0),
            'weekOf' => $weekOf,
            'planName' => ucfirst((string) ($subscription->plan?->name ?? $subscription->plan?->slug ?? 'Plan')),
            'libraryUrl' => url('/library'),
            'dashboardUrl' => url('/home'),
        ], new EmailContext($user, $subscription));
    }

    /** Day 2 after signup, still no search run. */
    public static function onboardingNoSearch(User $user): array
    {
        return self::payload('onboarding_no_search', $user, [
            'firstName' => self::firstName($user->name),
            'fullName' => $user->name,
            'searchUrl' => url('/brands'),
            'dashboardUrl' => url('/home'),
        ]);
    }

    /**
     * Days 1 and 3 after a free search finished. Same shape, different nudge,
     * so one builder takes the stage.
     */
    public static function freeResultsFollowUp(User $user, CustomKeywordSearch $search, int $breakoutCount, string $stage): array
    {
        return self::payload($stage === 'last_note' ? 'free_results_last_note' : 'free_results_second_look', $user, [
            'firstName' => self::firstName($user->name),
            'fullName' => $user->name,
            'searchTerm' => (string) ($search->name ?: $search->phrase),
            'breakoutCount' => $breakoutCount,
            'resultsUrl' => url($search->url()),
            'trialUrl' => url('/trial'),
            'plansUrl' => url('/plans'),
        ], new EmailContext($user, null, $search));
    }

    /** Day 2 of the trial: how to read the Breakout Score. */
    public static function trialBreakoutScore(User $user, Subscription $subscription): array
    {
        return self::payload('trial_breakout_score', $user, [
            'firstName' => self::firstName($user->name),
            'fullName' => $user->name,
            'planName' => ucfirst((string) ($subscription->plan?->name ?? $subscription->plan?->slug ?? 'Plan')),
            'dashboardUrl' => url('/home'),
            'libraryUrl' => url('/library'),
        ], new EmailContext($user, $subscription));
    }

    /**
     * Day 7 of the trial: one video, picked as the strongest breakout across
     * everything they track.
     *
     * @param  array<string, mixed>  $video
     */
    public static function trialOneBreakout(User $user, Subscription $subscription, CustomKeywordSearch $search, array $video): array
    {
        return self::payload('trial_one_breakout', $user, [
            'firstName' => self::firstName($user->name),
            'fullName' => $user->name,
            'searchTerm' => (string) ($search->name ?: $search->phrase),
            'videoHandle' => (string) ($video['handle'] ?? ''),
            'videoCaption' => (string) ($video['caption'] ?? ''),
            'videoThumbnail' => (string) ($video['thumbnail'] ?? ''),
            'videoViews' => (string) ($video['views'] ?? ''),
            'breakoutScore' => (string) ($video['score'] ?? ''),
            'resultsUrl' => url($search->url()),
            'dashboardUrl' => url('/home'),
        ], new EmailContext($user, $subscription, $search));
    }

    /**
     * Any of the six winback emails. They share a shape — what ended, when,
     * and what has happened since — so the template key is the only thing that
     * varies.
     */
    public static function winback(User $user, Subscription $subscription, string $templateKey, int $missedCount, string $endedOn): array
    {
        return self::payload($templateKey, $user, [
            'firstName' => self::firstName($user->name),
            'fullName' => $user->name,
            'planName' => ucfirst((string) ($subscription->plan?->name ?? $subscription->plan?->slug ?? 'Plan')),
            'missedCount' => $missedCount,
            'endedOn' => $endedOn,
            'plansUrl' => url('/plans'),
            'libraryUrl' => url('/library'),
            'dashboardUrl' => url('/home'),
            'contactUrl' => url('/contact'),
        ], new EmailContext($user, $subscription));
    }

    /**
     * @param  array<int, array<string, mixed>>  $picks
     */
    public static function biweeklyPack(User $user, Subscription $subscription, array $picks, string $since): array
    {
        $first = $picks[0] ?? [];

        return self::payload('biweekly_pack', $user, [
            'firstName' => self::firstName($user->name),
            'fullName' => $user->name,
            'breakoutCount' => count($picks),
            'since' => $since,
            // Brevo templates address params by name rather than iterating, so
            // the three picks are flattened instead of passed as a list.
            'pick1Handle' => (string) ($picks[0]['handle'] ?? ''),
            'pick1Caption' => (string) ($picks[0]['caption'] ?? ''),
            'pick1Thumbnail' => (string) ($picks[0]['thumbnail'] ?? ''),
            'pick1Views' => (string) ($picks[0]['views'] ?? ''),
            'pick1Score' => (string) ($picks[0]['score'] ?? ''),
            'pick1Subject' => (string) ($picks[0]['subject'] ?? ''),
            'pick2Handle' => (string) ($picks[1]['handle'] ?? ''),
            'pick2Caption' => (string) ($picks[1]['caption'] ?? ''),
            'pick2Thumbnail' => (string) ($picks[1]['thumbnail'] ?? ''),
            'pick2Views' => (string) ($picks[1]['views'] ?? ''),
            'pick2Score' => (string) ($picks[1]['score'] ?? ''),
            'pick2Subject' => (string) ($picks[1]['subject'] ?? ''),
            'pick3Handle' => (string) ($picks[2]['handle'] ?? ''),
            'pick3Caption' => (string) ($picks[2]['caption'] ?? ''),
            'pick3Thumbnail' => (string) ($picks[2]['thumbnail'] ?? ''),
            'pick3Views' => (string) ($picks[2]['views'] ?? ''),
            'pick3Score' => (string) ($picks[2]['score'] ?? ''),
            'pick3Subject' => (string) ($picks[2]['subject'] ?? ''),
            'topSubject' => (string) ($first['subject'] ?? ''),
            'planName' => ucfirst((string) ($subscription->plan?->name ?? $subscription->plan?->slug ?? 'Plan')),
            'libraryUrl' => url('/library'),
            'dashboardUrl' => url('/home'),
        ], new EmailContext($user, $subscription));
    }

    public static function searchDone(User $user, CustomKeywordSearch $search): array
    {
        $latestRun = $search->latestRun;
        $resultsCount = $search->videos_count ?? $search->videos()->count();

        return self::payload('search_done', $user, [
            'firstName' => self::firstName($user->name),
            'fullName' => $user->name,
            'searchName' => (string) ($search->name ?: $search->phrase),
            // The spec's subject line uses these names; kept alongside the
            // originals so existing templates do not break.
            'searchTerm' => (string) ($search->name ?: $search->phrase),
            'breakoutCount' => $resultsCount,
            'searchPhrase' => (string) $search->phrase,
            'searchType' => (string) $search->search_type,
            'resultsCount' => $resultsCount,
            'resultsUrl' => url($search->url()),
            'dashboardUrl' => url('/home'),
            'latestRunAt' => $latestRun?->completed_at?->timezone(config('app.timezone'))->format('F j, Y g:i A') ?? 'just now',
        ], new EmailContext($user, null, $search));
    }

    private static function payload(string $notification, User $user, array $params, ?EmailContext $context = null): array
    {
        $context ??= new EmailContext($user);
        // The registry reads the email_templates table and falls back to
        // config/brevo_notifications.php, so this keeps working on an
        // environment that has not run the backfill migration.
        $definition = EmailTemplateRegistry::find($notification) ?? [];
        $templateId = $definition['brevo_template_id'] ?? null;

        if (! is_numeric($templateId) || (int) $templateId <= 0) {
            throw new RuntimeException("Brevo template ID is not configured for [{$notification}].");
        }

        return [
            'sender' => [
                'name' => (string) config('brevo_notifications.sender.name'),
                'email' => (string) config('brevo_notifications.sender.email'),
            ],
            'to' => [[
                'email' => $user->email,
                'name' => $user->name,
            ]],
            'subject' => self::renderSubject((string) ($definition['subject'] ?? 'BrandBeacon update'), $params),
            'templateId' => (int) $templateId,
            'tags' => (array) ($definition['tags'] ?? []),
            // Library fields go UNDER the built-ins: a template that switches
            // on a field colliding with one the code sends must not be able to
            // overwrite it.
            'params' => array_merge(
                EmailFieldLibrary::resolve((array) ($definition['extra_fields'] ?? []), $context),
                [
                'logoUrl' => (string) config('brevo_notifications.logo_url'),
                'appName' => (string) config('app.name', 'BrandBeacon'),
                // The inbox preview line. Rendered in a hidden block at the
                // top of every template, so it is set here rather than baked
                // into the HTML an admin pastes into Brevo.
                'previewText' => self::renderSubject((string) ($definition['preview_text'] ?? ''), $params),
                // Every template gets the link. Transactional templates simply
                // do not render it; marketing templates must.
                'unsubscribeUrl' => UnsubscribeLink::for($user),
                ],
                $params,
            ),
        ];
    }

    /**
     * Fill {{placeholders}} in a registry subject line from the same params the
     * body gets.
     *
     * The payload's `subject` overrides whatever the Brevo template carries, so
     * without this every email would ship a static subject — and the lifecycle
     * spec leans on dynamic ones ("rhode skin: 14 viral breakouts found"),
     * which is most of their open rate.
     *
     * @param  array<string, mixed>  $params
     */
    private static function renderSubject(string $subject, array $params): string
    {
        if (! str_contains($subject, '{{')) {
            return $subject;
        }

        return preg_replace_callback(
            '/\{\{\s*([A-Za-z0-9_]+)\s*\}\}/',
            static function (array $match) use ($params): string {
                $value = $params[$match[1]] ?? '';

                return is_scalar($value) ? (string) $value : '';
            },
            $subject,
        ) ?? $subject;
    }

    private static function firstName(string $name): string
    {
        return str($name)->trim()->before(' ')->value() ?: 'there';
    }

    private static function limitLabel(mixed $limit): int|string
    {
        $limit = (int) $limit;

        return $limit === -1 ? 'Unlimited' : $limit;
    }
}
