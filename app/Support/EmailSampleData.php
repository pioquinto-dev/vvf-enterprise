<?php

namespace App\Support;

use App\Models\CustomKeywordSearch;
use App\Models\CustomKeywordSearchVideo;
use App\Models\PricingPlan;
use App\Models\Subscription;
use App\Models\User;
use App\Models\ViralVideo;
use Carbon\CarbonImmutable;

/**
 * Builds a complete, filled-in payload for any lifecycle template, for previewing.
 *
 * Two modes:
 *
 *   invented — an unsaved user, plan, subscription and search, with sample
 *   videos. Nothing is read from or written to the database.
 *
 *   borrowed — a real account. Its subscription, searches and breakouts are
 *   read and used, and anything the account does not have falls back to the
 *   invented value with a note saying so. A preview of an account with no
 *   searches is more useful with sample rows in it than with three blanks.
 *
 * Every field a template declares is filled in both modes. A preview with gaps
 * in it is the thing this class exists to prevent: an empty merge field looks
 * identical to a broken one, so nobody can tell from looking whether the
 * template is right.
 */
class EmailSampleData
{
    /** @var array<int, string> */
    private array $notes = [];

    private function __construct(
        private readonly User $user,
        private readonly Subscription $subscription,
        private readonly Subscription $trialSubscription,
        private readonly CustomKeywordSearch $search,
        /** @var array<int, array<string, string>> */
        private readonly array $breakouts,
        /** @var array<string, int> */
        private readonly array $counts,
        private readonly bool $borrowed,
    ) {}

    /**
     * An account that does not exist. The id is high and fixed so a signed
     * verification link is stable between runs and obviously not a real user.
     */
    public static function invented(string $email, string $name): self
    {
        $user = (new User())->forceFill([
            'id' => 999999,
            'name' => $name,
            'email' => $email,
            'created_at' => CarbonImmutable::now()->subDays(9),
        ]);

        return new self(
            user: $user,
            subscription: self::inventedSubscription($user, 'active'),
            trialSubscription: self::inventedSubscription($user, 'trialing'),
            search: self::inventedSearch($user),
            breakouts: self::inventedBreakouts(),
            counts: self::inventedCounts(),
            borrowed: false,
        );
    }

    /**
     * A real account, with sample values standing in for whatever it lacks.
     *
     * The recipient is still whoever the command was told to send to — this
     * borrows the account's data, it does not email the account.
     */
    public static function borrowedFrom(User $account, string $email, string $name): self
    {
        $recipient = (clone $account)->forceFill([
            'name' => $name !== '' ? $name : (string) $account->name,
            'email' => $email,
        ]);

        $notes = [];

        $subscription = Subscription::query()
            ->with('plan')
            ->where('user_id', $account->id)
            ->orderByRaw("CASE status WHEN 'active' THEN 0 WHEN 'trialing' THEN 1 WHEN 'trial' THEN 2 ELSE 3 END")
            ->orderByDesc('id')
            ->first();

        if ($subscription === null) {
            $notes[] = 'no subscription on this account, so plan, dates and card are sample values';
            $subscription = self::inventedSubscription($recipient, 'active');
        } else {
            $subscription = (clone $subscription)->setRelation('user', $recipient);

            if ($subscription->plan === null) {
                $notes[] = 'the subscription has no plan, so the plan name and price are sample values';
                $subscription->setRelation('plan', self::inventedPlan());
            }

            // The card is cached by the Stripe webhook and is often absent on a
            // trial or a free row. Dunning copy names it, so it cannot be blank.
            if (data_get($subscription->metadata, 'card.last4') === null) {
                $notes[] = 'no card cached on the subscription, so the card brand and last four are sample values';
                $metadata = (array) $subscription->metadata;
                data_set($metadata, 'card', self::inventedCard());
                $subscription->forceFill(['metadata' => $metadata]);
            }
        }

        // The trial variants read trial_ends_at and trial_started_at. A paid
        // subscription has neither, so they are filled in rather than left null,
        // which would render as "ends on " with nothing after it.
        $trial = (clone $subscription)->forceFill([
            'status' => 'trialing',
            'trial_started_at' => $subscription->trial_started_at ?? CarbonImmutable::now()->subDays(5),
            'trial_ends_at' => $subscription->trial_ends_at ?? CarbonImmutable::now()->addDays(3),
        ])->setRelation('user', $recipient)->setRelation('plan', $subscription->plan);

        // The search with the most breakouts, which is what the real flows pick.
        $search = CustomKeywordSearch::query()
            ->where('user_id', $account->id)
            ->withCount(['videos as breakouts_count' => fn ($query) => $query->where('is_new_breakout', true)])
            ->orderByDesc('breakouts_count')
            ->orderBy('id')
            ->first();

        $breakouts = [];

        if ($search === null) {
            $notes[] = 'no searches on this account, so the search name and all video rows are sample values';
            $search = self::inventedSearch($recipient);
        } else {
            $search = (clone $search)->setRelation('user', $recipient);
            $breakouts = BrevoTransactionalEmail::topBreakouts($search, 3);

            if ($breakouts === []) {
                $notes[] = 'that search has no visible breakouts, so the video rows are sample values';
            }
        }

        if ($breakouts === []) {
            $breakouts = self::inventedBreakouts();
        }

        $counts = self::inventedCounts();

        if ($search->exists) {
            $counts = self::borrowedCounts($account->id, $search, $counts);
        }

        $instance = new self(
            user: $recipient,
            subscription: $subscription,
            trialSubscription: $trial,
            search: $search,
            breakouts: $breakouts,
            counts: $counts,
            borrowed: true,
        );

        $instance->notes = $notes;

        return $instance;
    }

    /**
     * What was substituted, so the person reading the preview knows which
     * numbers in it are real.
     *
     * @return array<int, string>
     */
    public function notes(): array
    {
        return $this->notes;
    }

    public function borrowedFromAccount(): bool
    {
        return $this->borrowed;
    }

    public function describeSubject(): string
    {
        return sprintf(
            '%s · %s · %s',
            (string) $this->user->email,
            (string) ($this->search->name ?: $this->search->phrase),
            (string) ($this->subscription->plan?->name ?? 'no plan'),
        );
    }

    /**
     * The payload for one template key, fully filled in.
     *
     * @return array<string, mixed>|null  null when nothing here builds that key,
     *                                    which is the caller's cue to skip it.
     */
    public function payload(string $key): ?array
    {
        $user = $this->user;
        $paid = $this->subscription;
        $trial = $this->trialSubscription;
        $search = $this->search;
        $counts = $this->counts;

        return match ($key) {
            // 1. Free, never searched.
            'new_registration' => BrevoTransactionalEmail::newRegistration($user),
            // The configured still for this one is an asset that has to be
            // uploaded to public/emails/. Until it is there, a preview borrows a
            // real thumbnail so the layout is visible rather than broken.
            'onboarding_no_search' => BrevoTransactionalEmail::onboardingNoSearch(
                $user,
                (string) ($this->breakouts[0]['thumbnail'] ?? '') ?: null,
            ),

            // 2. Free, results ready.
            'search_done' => BrevoTransactionalEmail::searchDone($user, $search, [
                'breakouts' => $this->breakouts,
                'breakoutCount' => $counts['breakouts'],
                'resultsCount' => $counts['videos'],
            ]),
            'free_results_second_look' => BrevoTransactionalEmail::freeResultsFollowUp($user, $search, $counts['breakouts'], 'second_look'),
            'free_results_last_note' => BrevoTransactionalEmail::freeResultsFollowUp($user, $search, $counts['breakouts'], 'last_note'),

            // 3. The 8-day trial.
            'subscription_started' => BrevoTransactionalEmail::subscriptionStarted($user, $trial),
            'trial_breakout_score' => BrevoTransactionalEmail::trialBreakoutScore($user, $trial),
            'trial_day5_video_analysis' => BrevoTransactionalEmail::trialDay5VideoAnalysis($user, $trial),
            'trial_one_breakout' => BrevoTransactionalEmail::trialOneBreakout($user, $trial, $search, $this->leadVideo()),

            // 4. Dunning and the card.
            'payment_failed_first' => BrevoTransactionalEmail::paymentFailed($user, $paid, 1, CarbonImmutable::now()->addDays(2)->format('F j, Y')),
            'payment_failed_second' => BrevoTransactionalEmail::paymentFailed($user, $paid, 2, CarbonImmutable::now()->addDays(3)->format('F j, Y')),
            'final_failed_payment' => BrevoTransactionalEmail::finalFailedPayment($user, $paid),
            'card_expiring' => BrevoTransactionalEmail::cardExpiring(
                $user,
                $paid,
                (string) (data_get($paid->metadata, 'card.brand') ?: 'Visa'),
                (string) (data_get($paid->metadata, 'card.last4') ?: '4242'),
                CarbonImmutable::now()->addMonth()->format('F Y'),
            ),

            // 4, not on the handover board.
            'trial_ending_cc' => BrevoTransactionalEmail::trialEnding($user, $trial, 3),
            'trial_ending_no_cc' => BrevoTransactionalEmail::noCardTrialEnding($user, $trial, 3),
            'verify_email_manual_account' => BrevoTransactionalEmail::verifyEmail($user),
            'subscription_canceled' => BrevoTransactionalEmail::subscriptionCanceled($user, $paid),

            // 5 and 6. Winback. Every fact is sent for all six, because the
            // template decides which of them it renders.
            'trial_winback_ended',
            'trial_winback_missed',
            'trial_winback_last_note',
            'churn_winback_ended',
            'churn_winback_missed',
            'churn_winback_last_note' => BrevoTransactionalEmail::winback($user, $paid, $key, [
                'missedCount' => $counts['missed'],
                'endedOn' => CarbonImmutable::now()->subDays(7)->format('F j, Y'),
                'searchTerm' => (string) ($search->name ?: $search->phrase),
                'competitorBreakouts' => $counts['competitor'],
                'trialSearches' => $counts['searches'],
                'trialVideos' => $counts['videos'],
                'trialBreakouts' => $counts['breakouts'],
                'breakout' => $this->breakouts[0] ?? [],
            ]),

            // 7 and 8. Ongoing.
            'weekly_digest' => BrevoTransactionalEmail::weeklyDigest($user, $paid, [
                'breakoutCount' => $counts['breakouts'],
                'resultsCount' => $counts['videos'],
                'newCreators' => $counts['newCreators'],
                'searchTerm' => (string) ($search->name ?: $search->phrase),
                'weekOf' => CarbonImmutable::now()->startOfWeek()->format('M j'),
                'resultsUrl' => url($search->url()),
                // One lead video per section, each with the meta key that
                // section's row shows.
                'own' => $this->sectionVideo(0, 'handle'),
                'comp' => $this->sectionVideo(1, 'brand'),
                'prod' => $this->sectionVideo(2, 'name'),
            ]),
            'biweekly_pack' => BrevoTransactionalEmail::biweeklyPack(
                $user,
                $paid,
                $this->packPicks(),
                (string) ($search->name ?: $search->phrase),
                url($search->url()),
                'all three open on the product already in frame, no intro',
            ),

            default => null,
        };
    }

    /**
     * @return array<string, mixed>
     */
    private function leadVideo(): array
    {
        $lead = $this->breakouts[0] ?? [];

        return [
            'handle' => (string) ($lead['handle'] ?? ''),
            'caption' => (string) ($lead['title'] ?? ''),
            'thumbnail' => (string) ($lead['thumbnail'] ?? ''),
            'views' => (string) ($lead['views'] ?? ''),
            'score' => (string) ($lead['score'] ?? ''),
            'url' => (string) ($lead['url'] ?? ''),
        ];
    }

    /**
     * A digest section's lead video. Falls back to the first breakout so a
     * section is never blank just because the account has fewer than three.
     *
     * @return array<string, string>
     */
    private function sectionVideo(int $index, string $metaKey): array
    {
        $pick = $this->breakouts[$index] ?? $this->breakouts[0] ?? [];

        return [
            'title' => (string) ($pick['title'] ?? ''),
            $metaKey => (string) ($pick[$metaKey] ?? $pick['handle'] ?? ''),
            'views' => (string) ($pick['views'] ?? '').' views',
            'score' => (string) ($pick['score'] ?? ''),
            'thumbnail' => (string) ($pick['thumbnail'] ?? ''),
        ];
    }

    /**
     * Three picks in the shape the pack builder wants. Padded to three by
     * cycling, so the preview shows all three rows.
     *
     * @return array<int, array<string, string>>
     */
    private function packPicks(): array
    {
        $picks = [];
        $subject = (string) ($this->search->name ?: $this->search->phrase);

        for ($i = 0; $i < 3; $i++) {
            $source = $this->breakouts[$i] ?? $this->breakouts[$i % max(1, count($this->breakouts))] ?? [];

            $picks[] = [
                'handle' => (string) ($source['handle'] ?? ''),
                'caption' => (string) ($source['title'] ?? ''),
                'thumbnail' => (string) ($source['thumbnail'] ?? ''),
                'views' => (string) ($source['views'] ?? ''),
                'score' => (string) ($source['score'] ?? ''),
                'subject' => $subject,
            ];
        }

        return $picks;
    }

    // ---------------------------------------------------------------------
    // invented data
    // ---------------------------------------------------------------------

    private static function inventedPlan(): PricingPlan
    {
        return (new PricingPlan())->forceFill([
            'id' => 'test-plan',
            'name' => 'Scale',
            'slug' => 'scale',
            'price_cents' => 4900,
            'currency' => 'USD',
            'metadata' => [],
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private static function inventedCard(): array
    {
        $expires = CarbonImmutable::now()->addMonth();

        return [
            'brand' => 'Visa',
            'last4' => '4242',
            'exp_month' => (int) $expires->format('n'),
            'exp_year' => (int) $expires->format('Y'),
        ];
    }

    private static function inventedSubscription(User $user, string $status): Subscription
    {
        $plan = self::inventedPlan();

        return (new Subscription())->forceFill([
            'id' => 'test-subscription',
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'status' => $status,
            'current_period_starts_at' => CarbonImmutable::now()->subDays(16),
            'current_period_ends_at' => CarbonImmutable::now()->addDays(14),
            'trial_started_at' => CarbonImmutable::now()->subDays(5),
            'trial_ends_at' => CarbonImmutable::now()->addDays(3),
            'canceled_at' => null,
            'metadata' => [
                'card' => self::inventedCard(),
                'subscription' => [
                    'search_limits' => ['used' => 2, 'limit' => 20],
                    'viral_video_bookmarks' => ['used' => 4, 'limit' => 25],
                    'search_bookmarks' => ['used' => 1, 'limit' => 15],
                    'video_analysis' => ['used' => 0, 'limit' => 5],
                ],
            ],
        ])->setRelation('user', $user)->setRelation('plan', $plan);
    }

    private static function inventedSearch(User $user): CustomKeywordSearch
    {
        return (new CustomKeywordSearch())->forceFill([
            'id' => 999999,
            'public_id' => 'sampleresults',
            'user_id' => $user->id,
            'name' => 'Rhode',
            'phrase' => 'rhode skin',
            'search_type' => CustomKeywordSearch::TYPE_BRAND,
            'status' => CustomKeywordSearch::STATUS_DONE,
            'last_run_at' => CarbonImmutable::now()->subDay(),
        ])->setRelation('user', $user);
    }

    /**
     * Three ranked videos.
     *
     * The stills are borrowed from real `viral_videos` rows rather than written
     * here as a URL. TikTok CDN links expire, which is what
     * `viral-videos:repair-tiktok-cdn-media` exists to refresh, so any URL
     * hard-coded in this file is a broken image the day after it is written —
     * and a preview full of broken images cannot tell you whether the template
     * lays out correctly.
     *
     * The captions and handles stay invented, so a preview is never mistaken
     * for a real person's data. Only the picture is borrowed.
     *
     * @return array<int, array<string, string>>
     */
    private static function inventedBreakouts(): array
    {
        $thumbnails = self::borrowedThumbnails(3);

        return [
            [
                'title' => 'i cannot believe this is only $18',
                'handle' => '@mayaskin',
                'brand' => 'Rhode',
                'name' => 'Peptide Lip Treatment',
                'views' => '4,612,880',
                'score' => '461.3',
                'thumbnail' => $thumbnails[0] ?? '',
                'url' => 'https://www.tiktok.com/@mayaskin/video/7300000000000000001',
            ],
            [
                'title' => 'day 14 and my texture is gone',
                'handle' => '@dermbyjune',
                'brand' => 'Glossier',
                'name' => 'Glazing Milk',
                'views' => '892,140',
                'score' => '38.7',
                'thumbnail' => $thumbnails[1] ?? '',
                'url' => 'https://www.tiktok.com/@dermbyjune/video/7300000000000000002',
            ],
            [
                'title' => 'the only one that did not sting',
                'handle' => '@quietroutine',
                'brand' => 'Summer Fridays',
                'name' => 'Barrier Butter',
                'views' => '310,455',
                'score' => '12.4',
                'thumbnail' => $thumbnails[2] ?? '',
                'url' => 'https://www.tiktok.com/@quietroutine/video/7300000000000000003',
            ],
        ];
    }

    /**
     * Stills from real videos, newest and strongest first, for the invented
     * rows to use.
     *
     * Falls back to an empty list when the table has nothing usable, which the
     * templates render as no image rather than as a broken one: a missing
     * picture reads as "this row has no still", a broken one reads as "this
     * email is broken", and only one of those is true.
     *
     * @return array<int, string>
     */
    private static function borrowedThumbnails(int $limit): array
    {
        try {
            return ViralVideo::query()
                ->visible()
                ->where(fn ($query) => $query->whereNotNull('thumbnail_url')->orWhereNotNull('cover'))
                ->orderByDesc('virality_score')
                ->orderByDesc('id')
                ->limit($limit)
                ->get()
                ->map(static fn (ViralVideo $video): string => (string) ($video->previewImageUrl() ?? ''))
                ->filter()
                ->values()
                ->all();
        } catch (\Throwable) {
            // No database, or the table is not there yet. A preview without
            // pictures still shows whether the copy and layout are right.
            return [];
        }
    }

    /**
     * @return array<string, int>
     */
    private static function inventedCounts(): array
    {
        return [
            'searches' => 4,
            'videos' => 138,
            'breakouts' => 14,
            'missed' => 23,
            'competitor' => 9,
            'newCreators' => 6,
        ];
    }

    /**
     * The same counts, read off a real account. Anything that comes back zero
     * keeps the sample value, because zero in a preview reads as a bug.
     *
     * @param  array<string, int>  $fallback
     * @return array<string, int>
     */
    private static function borrowedCounts(int $userId, CustomKeywordSearch $search, array $fallback): array
    {
        $searchIds = CustomKeywordSearch::query()->where('user_id', $userId)->pluck('id');

        $videos = CustomKeywordSearchVideo::query()->whereIn('custom_keyword_search_id', $searchIds)->count();
        $breakouts = CustomKeywordSearchVideo::query()
            ->whereIn('custom_keyword_search_id', $searchIds)
            ->where('is_new_breakout', true)
            ->count();
        $competitor = CustomKeywordSearchVideo::query()
            ->join('custom_keyword_searches', 'custom_keyword_searches.id', '=', 'custom_keyword_search_videos.custom_keyword_search_id')
            ->where('custom_keyword_searches.user_id', $userId)
            ->where('custom_keyword_searches.search_type', CustomKeywordSearch::TYPE_COMPETITOR)
            ->where('custom_keyword_search_videos.is_new_breakout', true)
            ->count();

        return [
            'searches' => $searchIds->count() ?: $fallback['searches'],
            'videos' => $videos ?: $fallback['videos'],
            'breakouts' => $breakouts ?: $fallback['breakouts'],
            'missed' => $breakouts ?: $fallback['missed'],
            'competitor' => $competitor ?: $fallback['competitor'],
            'newCreators' => $fallback['newCreators'],
        ];
    }
}
