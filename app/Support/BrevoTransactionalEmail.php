<?php

namespace App\Support;

use App\Models\CustomKeywordSearch;
use App\Models\CustomKeywordSearchVideo;
use App\Models\Subscription;
use App\Models\User;
use Carbon\CarbonImmutable;
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
            // The handover leads the trial version with "You're on the 8-day
            // trial". A subject line is one string per template, so the
            // headline is a param and the registry subject is just {{...}}.
            'startHeadline' => $isTrial ? "You're on the 8-day trial" : 'Your plan is live',
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
            'cardLast4' => self::cardLast4($subscription),
            'lockDate' => self::lockDate(),
            // How long the workspace is held after the account pauses. The
            // whole point of the final notice is that this window exists.
            'retentionDays' => (int) config('email_lifecycle.dunning.retention_days', 30),
            'billingUrl' => url('/settings/subscription'),
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
    public static function paymentFailed(User $user, Subscription $subscription, int $attempt, ?string $nextAttemptAt, ?string $amount = null): array
    {
        $planName = ucfirst((string) ($subscription->plan?->name ?? $subscription->plan?->slug ?? 'Plan'));

        return self::payload($attempt >= 2 ? 'payment_failed_second' : 'payment_failed_first', $user, [
            'firstName' => self::firstName($user->name),
            'fullName' => $user->name,
            'planName' => $planName,
            'attempt' => $attempt,
            'nextAttemptAt' => $nextAttemptAt ?? 'in a few days',
            // Both dunning emails name the card rather than the plan, which is
            // what the customer has to go and change.
            'cardLast4' => self::cardLast4($subscription),
            'amount' => $amount ?? self::planAmount($subscription),
            'lockDate' => self::lockDate(),
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
            // What is about to fail, and when. Without both, the email is a
            // warning with nothing at stake in it.
            'amount' => self::planAmount($subscription),
            'nextChargeDate' => $subscription->current_period_ends_at
                ?->timezone(self::timezone())
                ->format('F j, Y') ?? 'your next renewal',
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
    public static function weeklyDigest(User $user, Subscription $subscription, array $week): array
    {
        // Three sections, one lead video each: their own brand, the
        // competitors they watch, their products. A section with nothing in it
        // renders as nothing rather than as an empty heading, which is why the
        // template guards each block on its title param.
        $sections = [];

        foreach (['own' => 'handle', 'comp' => 'brand', 'prod' => 'name'] as $prefix => $metaKey) {
            $pick = $week[$prefix] ?? null;
            $sections[$prefix.'1Title'] = (string) (is_array($pick) ? ($pick['title'] ?? '') : '');
            $sections[$prefix.'1'.ucfirst($metaKey)] = (string) (is_array($pick) ? ($pick[$metaKey] ?? '') : '');
            $sections[$prefix.'1Views'] = (string) (is_array($pick) ? ($pick['views'] ?? '') : '');
            $sections[$prefix.'1Score'] = (string) (is_array($pick) ? ($pick['score'] ?? '') : '');
            $sections[$prefix.'1Thumbnail'] = (string) (is_array($pick) ? ($pick['thumbnail'] ?? '') : '');
        }

        return self::payload('weekly_digest', $user, array_merge([
            'firstName' => self::firstName($user->name),
            'fullName' => $user->name,
            'breakoutCount' => (int) ($week['breakoutCount'] ?? 0),
            'resultsCount' => (int) ($week['resultsCount'] ?? 0),
            'newCreators' => (int) ($week['newCreators'] ?? 0),
            'searchTerm' => (string) ($week['searchTerm'] ?? ''),
            'weekOf' => (string) ($week['weekOf'] ?? ''),
            'planName' => ucfirst((string) ($subscription->plan?->name ?? $subscription->plan?->slug ?? 'Plan')),
            'resultsUrl' => (string) ($week['resultsUrl'] ?? url('/library')),
            'libraryUrl' => url('/library'),
            'dashboardUrl' => url('/home'),
        ], $sections), new EmailContext($user, $subscription));
    }

    /**
     * Day 2 after signup, still no search run.
     *
     * @param  string|null  $exampleImageUrl  Overrides the configured still. The
     *              test-send command passes a real video's thumbnail, because the
     *              configured default points at an asset that has to be uploaded
     *              and a preview of a broken image tells you nothing.
     */
    public static function onboardingNoSearch(User $user, ?string $exampleImageUrl = null): array
    {
        return self::payload('onboarding_no_search', $user, [
            'firstName' => self::firstName($user->name),
            'fullName' => $user->name,
            'searchUrl' => url('/brands'),
            'dashboardUrl' => url('/home'),
            // The one picture in this email. A still, not a live thumbnail:
            // the copy quotes fixed numbers (4.6M against a 10k baseline), so
            // the image has to stay the video those numbers describe.
            'exampleImageUrl' => $exampleImageUrl ?? (string) config('brevo_notifications.example_image_url'),
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

    /** Day 5 of the trial: the nudge towards video analysis. */
    public static function trialDay5VideoAnalysis(User $user, Subscription $subscription): array
    {
        return self::payload('trial_day5_video_analysis', $user, [
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
            'videoUrl' => (string) ($video['url'] ?? url($search->url())),
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
    public static function winback(User $user, Subscription $subscription, string $templateKey, array $facts): array
    {
        $breakout = is_array($facts['breakout'] ?? null) ? $facts['breakout'] : [];

        return self::payload($templateKey, $user, [
            'firstName' => self::firstName($user->name),
            'fullName' => $user->name,
            'planName' => ucfirst((string) ($subscription->plan?->name ?? $subscription->plan?->slug ?? 'Plan')),
            'missedCount' => (int) ($facts['missedCount'] ?? 0),
            'endedOn' => (string) ($facts['endedOn'] ?? ''),
            // The middle and last emails in each sequence name what they are
            // about: the search that kept moving, and how much of it went to
            // someone else.
            'searchTerm' => (string) ($facts['searchTerm'] ?? ''),
            'competitorBreakouts' => (int) ($facts['competitorBreakouts'] ?? 0),
            // The last note totals up what the trial actually produced.
            'trialSearches' => (int) ($facts['trialSearches'] ?? 0),
            'trialVideos' => (int) ($facts['trialVideos'] ?? 0),
            'trialBreakouts' => (int) ($facts['trialBreakouts'] ?? 0),
            'breakoutTitle' => (string) ($breakout['title'] ?? ''),
            'breakoutScore' => (string) ($breakout['score'] ?? ''),
            'breakoutUrl' => (string) ($breakout['url'] ?? ''),
            'breakoutThumbnail' => (string) ($breakout['thumbnail'] ?? ''),
            'plansUrl' => url('/plans'),
            'libraryUrl' => url('/library'),
            'dashboardUrl' => url('/home'),
            'contactUrl' => url('/contact'),
        ], new EmailContext($user, $subscription));
    }

    /**
     * @param  array<int, array<string, mixed>>  $picks
     */
    public static function biweeklyPack(User $user, Subscription $subscription, array $picks, string $searchTerm, string $resultsUrl, string $takeaway = ''): array
    {
        return self::payload('biweekly_pack', $user, [
            'firstName' => self::firstName($user->name),
            'fullName' => $user->name,
            'breakoutCount' => count($picks),
            // One brand or product per pack, named in the subject line.
            'searchTerm' => $searchTerm,
            // Left blank when there is nothing honest to say about what the
            // three have in common; the template drops the line rather than
            // printing a guess.
            'takeaway' => $takeaway,
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
            'planName' => ucfirst((string) ($subscription->plan?->name ?? $subscription->plan?->slug ?? 'Plan')),
            'resultsUrl' => $resultsUrl,
            'plansUrl' => url('/plans'),
            'libraryUrl' => url('/library'),
            'dashboardUrl' => url('/home'),
        ], new EmailContext($user, $subscription));
    }

    /**
     * @param  array<string, mixed>|null  $sample  Overrides the counts and the
     *              ranked videos instead of querying for them. Production passes
     *              null; the test-send command passes sample or borrowed data, so
     *              a preview shows three filled rows rather than the three blanks
     *              an unsaved search would query its way to.
     */
    public static function searchDone(User $user, CustomKeywordSearch $search, ?array $sample = null): array
    {
        $latestRun = $search->latestRun;
        $resultsCount = $sample !== null
            ? (int) ($sample['resultsCount'] ?? 0)
            : (int) ($search->videos_count ?? $search->videos()->count());

        // breakoutCount used to be the total video count, which made the
        // subject line ("14 viral breakouts found") wrong whenever some of the
        // results were not breakouts. It is the real count now, and
        // resultsCount carries the total the copy compares it against.
        $breakouts = $sample !== null
            ? (array) ($sample['breakouts'] ?? [])
            : self::topBreakouts($search, 3);

        $breakoutCount = $sample !== null
            ? (int) ($sample['breakoutCount'] ?? count($breakouts))
            : CustomKeywordSearchVideo::query()
                ->where('custom_keyword_search_id', $search->id)
                ->where('is_new_breakout', true)
                ->count();

        return self::payload('search_done', $user, array_merge([
            'firstName' => self::firstName($user->name),
            'fullName' => $user->name,
            'searchName' => (string) ($search->name ?: $search->phrase),
            // The spec's subject line uses these names; kept alongside the
            // originals so existing templates do not break.
            'searchTerm' => (string) ($search->name ?: $search->phrase),
            'breakoutCount' => $breakoutCount,
            'searchPhrase' => (string) $search->phrase,
            'searchType' => (string) $search->search_type,
            'resultsCount' => $resultsCount,
            'resultsUrl' => url($search->url()),
            'dashboardUrl' => url('/home'),
            'latestRunAt' => $latestRun?->completed_at?->timezone(self::timezone())->format('F j, Y g:i A') ?? 'just now',
        ], self::flattenPicks('breakout', $breakouts)), new EmailContext($user, null, $search));
    }

    /**
     * The strongest breakouts in one search, ranked by the same Breakout Score
     * the results page shows, with id as a tiebreak so two runs pick the same
     * videos in the same order.
     *
     * @return array<int, array<string, string>>
     */
    public static function topBreakouts(CustomKeywordSearch $search, int $limit): array
    {
        return CustomKeywordSearchVideo::query()
            ->where('custom_keyword_search_id', $search->id)
            ->where('is_new_breakout', true)
            ->whereHas('video', fn ($query) => $query->visible())
            ->with('video')
            ->orderByDesc('viral_score')
            ->orderBy('id')
            ->limit($limit)
            ->get()
            ->map(static fn (CustomKeywordSearchVideo $row): array => [
                'title' => (string) ($row->video->title ?? ''),
                'handle' => $row->video?->username ? '@'.$row->video->username : '',
                'views' => number_format((int) ($row->video->views ?? 0)),
                'score' => $row->viral_score === null ? '' : (string) round((float) $row->viral_score, 1),
                'thumbnail' => (string) ($row->video?->previewImageUrl() ?? ''),
                'url' => (string) ($row->video->video_url ?? ''),
            ])
            ->values()
            ->all();
    }

    /**
     * Brevo templates address params by name rather than iterating a list, so
     * a ranked set has to go out as breakout1Title, breakout2Title and so on.
     * Missing positions are sent as empty strings: the template guards each
     * row on its own title, so a search with one breakout renders one row.
     *
     * @param  array<int, array<string, string>>  $picks
     * @return array<string, string>
     */
    private static function flattenPicks(string $prefix, array $picks, int $slots = 3): array
    {
        $flat = [];

        for ($i = 0; $i < $slots; $i++) {
            $pick = $picks[$i] ?? [];

            foreach (['Title', 'Handle', 'Views', 'Score', 'Thumbnail'] as $field) {
                $flat[$prefix.($i + 1).$field] = (string) ($pick[lcfirst($field)] ?? '');
            }
        }

        return $flat;
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

    /**
     * The zone dates in email copy are rendered in.
     *
     * Lifecycle mail is written to wall-clock times ("we will try again on
     * March 4"), so it reads on the same clock the send slots use rather than
     * on app.timezone, which is UTC here.
     */
    private static function timezone(): string
    {
        return (string) config('email_lifecycle.timezone', config('app.timezone', 'UTC'));
    }

    /**
     * Last four digits of the card cached on the subscription by the Stripe
     * webhook. Empty when nothing is cached, which the templates handle by
     * simply naming no card.
     */
    private static function cardLast4(Subscription $subscription): string
    {
        return (string) data_get($subscription->metadata, 'card.last4', '');
    }

    /**
     * The day access pauses if a failed payment is not fixed.
     *
     * Counted from today rather than from the invoice, because every dunning
     * email in the sequence has to name the same deadline, and only the first
     * one is triggered by an invoice event.
     */
    private static function lockDate(): string
    {
        return CarbonImmutable::now(self::timezone())
            ->addDays((int) config('email_lifecycle.dunning.lock_after_days', 7))
            ->format('F j, Y');
    }

    /**
     * What the plan costs, formatted for body copy.
     *
     * Read from the plan rather than the Stripe invoice so the card-expiry
     * warning, which has no invoice behind it, can name a figure too.
     */
    private static function planAmount(Subscription $subscription): string
    {
        $cents = $subscription->plan?->price_cents;

        if (! is_numeric($cents) || (int) $cents <= 0) {
            return 'your usual amount';
        }

        return self::money(((int) $cents) / 100, (string) ($subscription->plan?->currency ?? 'USD'));
    }

    public static function money(float $amount, string $currency = 'USD'): string
    {
        $symbols = ['USD' => '$', 'EUR' => '€', 'GBP' => '£', 'PHP' => '₱'];
        $symbol = $symbols[strtoupper($currency)] ?? (strtoupper($currency).' ');

        return $symbol.number_format($amount, 2);
    }

    private static function limitLabel(mixed $limit): int|string
    {
        $limit = (int) $limit;

        return $limit === -1 ? 'Unlimited' : $limit;
    }
}
