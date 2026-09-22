<?php

namespace App\Services\Lifecycle\Flows;

use App\Models\CustomKeywordSearch;
use App\Models\CustomKeywordSearchVideo;
use App\Models\Subscription;
use App\Services\Brevo\BrevoLifecycleEmailService;
use App\Services\Lifecycle\LifecycleCandidate;
use App\Services\Lifecycle\LifecycleFlow;
use App\Services\Lifecycle\LifecycleSchedule;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;

/**
 * The Monday digest: what broke out across someone's searches last week.
 *
 * Audience is deliberately narrow — people currently paying, plus trial users
 * on their last refresh. A lapsed account still has searches refreshing (that
 * is what makes the winback emails honest), but sending them a weekly digest
 * would be giving away the product the paywall is meant to sell.
 */
class WeeklyDigestFlow implements LifecycleFlow
{
    /** Statuses that count as "currently paying". */
    private const PAID_STATUSES = ['active'];

    private const TRIAL_STATUSES = ['trialing', 'trial'];

    /**
     * A trial user earns the digest on their last refresh before the trial
     * ends — the point where seeing the week's haul matters most.
     */
    private const TRIAL_LAST_REFRESH_DAYS = 1;

    public function __construct(private readonly BrevoLifecycleEmailService $emails) {}

    public function name(): string
    {
        return 'weekly_digest';
    }

    /**
     * @return iterable<LifecycleCandidate>
     */
    public function due(): iterable
    {
        $today = CarbonImmutable::now();

        // Weekday and the 7:00am slot both come from config; this flow has no
        // work on any other day or hour.
        if (! LifecycleSchedule::slotIsOpen('weekly_digest', $today)) {
            return;
        }

        $weekStart = $today->startOfWeek()->subWeek();
        $weekEnd = $weekStart->addWeek();

        foreach ($this->eligibleSubscriptions() as $subscription) {
            $user = $subscription->user;

            if ($user === null) {
                continue;
            }

            $searches = CustomKeywordSearch::query()
                ->where('user_id', $user->id)
                ->get(['id', 'name', 'phrase', 'search_type']);

            if ($searches->isEmpty()) {
                continue;
            }

            $searchIds = $searches->pluck('id');
            $breakouts = $this->breakoutsByType($searchIds, $weekStart, $weekEnd);
            $total = array_sum($breakouts);

            // Nothing broke out — an empty digest is worse than no digest.
            if ($total === 0) {
                continue;
            }

            // The digest leads each of its three sections on one video, so the
            // searches are split by type here rather than in the template.
            $byType = $searches->groupBy('search_type');

            $week = [
                'breakoutCount' => $total,
                'resultsCount' => $this->videosSeen($searchIds, $weekStart, $weekEnd),
                'newCreators' => $this->newCreators($searchIds, $weekStart, $weekEnd),
                'searchTerm' => (string) ($searches->first()?->name ?: $searches->first()?->phrase ?: ''),
                'weekOf' => $weekStart->format('M j'),
                'resultsUrl' => url((string) ($searches->first()?->url() ?? '/library')),
                'own' => $this->leadVideo($byType->get(CustomKeywordSearch::TYPE_BRAND), $weekStart, $weekEnd, 'handle'),
                'comp' => $this->leadVideo($byType->get(CustomKeywordSearch::TYPE_COMPETITOR), $weekStart, $weekEnd, 'brand'),
                'prod' => $this->leadVideo($byType->get(CustomKeywordSearch::TYPE_PRODUCT), $weekStart, $weekEnd, 'name'),
            ];

            yield new LifecycleCandidate(
                flowKey: 'weekly_digest',
                dedupeKey: "user:{$user->id}:week:{$weekStart->format('o-\WW')}",
                user: $user,
                send: fn (): bool => $this->emails->sendWeeklyDigest($user, $subscription, $week),
                templateKey: 'weekly_digest',
                context: [
                    'subscription_id' => $subscription->id,
                    'breakouts' => $total,
                    'week_of' => $weekStart->toDateString(),
                ],
            );
        }
    }

    /**
     * @return Collection<int, Subscription>
     */
    private function eligibleSubscriptions(): Collection
    {
        $statuses = array_merge(self::PAID_STATUSES, self::TRIAL_STATUSES);

        return Subscription::query()
            ->with(['user', 'plan'])
            ->whereIn('status', $statuses)
            ->get()
            ->filter(function (Subscription $subscription): bool {
                if (in_array($subscription->status, self::PAID_STATUSES, true)) {
                    return true;
                }

                // Trial: only on the last refresh before it ends.
                if ($subscription->trial_ends_at === null) {
                    return false;
                }

                $daysLeft = (int) CarbonImmutable::now()->startOfDay()->diffInDays(
                    CarbonImmutable::instance($subscription->trial_ends_at)->startOfDay(),
                    false,
                );

                return $daysLeft >= 0 && $daysLeft <= self::TRIAL_LAST_REFRESH_DAYS;
            })
            ->values();
    }

    /**
     * The one video a section leads on: the week's strongest breakout across
     * the searches of that type.
     *
     * `$metaKey` is what the second line of the row shows, and it differs per
     * section — the creator's handle for their own brand, the competitor's
     * name, the product's name — so the caller names it.
     *
     * @param  Collection<int, CustomKeywordSearch>|null  $searches
     * @return array<string, string>|null
     */
    private function leadVideo(?Collection $searches, CarbonImmutable $from, CarbonImmutable $to, string $metaKey): ?array
    {
        if ($searches === null || $searches->isEmpty()) {
            return null;
        }

        $row = CustomKeywordSearchVideo::query()
            ->whereIn('custom_keyword_search_id', $searches->pluck('id'))
            ->where('is_new_breakout', true)
            ->whereBetween('created_at', [$from, $to])
            ->whereHas('video', fn ($query) => $query->visible())
            ->with(['video', 'search'])
            ->orderByDesc('viral_score')
            ->orderBy('id')
            ->first();

        if ($row === null || $row->video === null) {
            return null;
        }

        return [
            'title' => (string) ($row->video->title ?? ''),
            $metaKey => $metaKey === 'handle'
                ? ($row->video->username ? '@'.$row->video->username : '')
                : (string) ($row->search?->name ?: $row->search?->phrase ?: ''),
            'views' => number_format((int) ($row->video->views ?? 0)).' views',
            'score' => $row->viral_score === null ? '' : (string) round((float) $row->viral_score, 1),
            'thumbnail' => (string) ($row->video?->previewImageUrl() ?? ''),
        ];
    }

    /**
     * Every video the week's refreshes turned up, breakout or not. The digest
     * quotes it as the denominator, so it has to count the same window the
     * breakouts were counted in.
     *
     * @param  Collection<int, int>  $searchIds
     */
    private function videosSeen(Collection $searchIds, CarbonImmutable $from, CarbonImmutable $to): int
    {
        return CustomKeywordSearchVideo::query()
            ->whereIn('custom_keyword_search_id', $searchIds)
            ->whereBetween('created_at', [$from, $to])
            ->count();
    }

    /**
     * Creators who showed up in these searches this week and had not before.
     *
     * @param  Collection<int, int>  $searchIds
     */
    private function newCreators(Collection $searchIds, CarbonImmutable $from, CarbonImmutable $to): int
    {
        $thisWeek = CustomKeywordSearchVideo::query()
            ->join('viral_videos', 'viral_videos.id', '=', 'custom_keyword_search_videos.viral_video_id')
            ->whereIn('custom_keyword_search_videos.custom_keyword_search_id', $searchIds)
            ->whereBetween('custom_keyword_search_videos.created_at', [$from, $to])
            ->distinct()
            ->pluck('viral_videos.username')
            ->filter()
            ->unique();

        if ($thisWeek->isEmpty()) {
            return 0;
        }

        $seenBefore = CustomKeywordSearchVideo::query()
            ->join('viral_videos', 'viral_videos.id', '=', 'custom_keyword_search_videos.viral_video_id')
            ->whereIn('custom_keyword_search_videos.custom_keyword_search_id', $searchIds)
            ->where('custom_keyword_search_videos.created_at', '<', $from)
            ->whereIn('viral_videos.username', $thisWeek)
            ->distinct()
            ->pluck('viral_videos.username');

        return $thisWeek->diff($seenBefore)->count();
    }

    /**
     * Breakout counts for the week, split the way the digest reads them.
     *
     * @param  Collection<int, int>  $searchIds
     * @return array<string, int>
     */
    private function breakoutsByType(Collection $searchIds, CarbonImmutable $from, CarbonImmutable $to): array
    {
        $rows = CustomKeywordSearchVideo::query()
            ->join('custom_keyword_searches', 'custom_keyword_searches.id', '=', 'custom_keyword_search_videos.custom_keyword_search_id')
            ->whereIn('custom_keyword_search_videos.custom_keyword_search_id', $searchIds)
            ->where('custom_keyword_search_videos.is_new_breakout', true)
            ->whereBetween('custom_keyword_search_videos.created_at', [$from, $to])
            ->groupBy('custom_keyword_searches.search_type')
            ->selectRaw('custom_keyword_searches.search_type, COUNT(*) as total')
            ->pluck('total', 'search_type');

        return [
            'brand' => (int) ($rows[CustomKeywordSearch::TYPE_BRAND] ?? 0),
            'product' => (int) ($rows[CustomKeywordSearch::TYPE_PRODUCT] ?? 0),
        ];
    }
}
