<?php

namespace App\Services\Lifecycle\Flows;

use App\Models\CustomKeywordSearch;
use App\Models\CustomKeywordSearchVideo;
use App\Models\Subscription;
use App\Services\Brevo\BrevoLifecycleEmailService;
use App\Services\Lifecycle\LifecycleCandidate;
use App\Services\Lifecycle\LifecycleFlow;
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

        // The dispatcher runs daily; this flow only has work on Mondays.
        if (! $today->isMonday()) {
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

            $breakouts = $this->breakoutsByType($searches->pluck('id'), $weekStart, $weekEnd);
            $total = array_sum($breakouts);

            // Nothing broke out — an empty digest is worse than no digest.
            if ($total === 0) {
                continue;
            }

            yield new LifecycleCandidate(
                flowKey: 'weekly_digest',
                dedupeKey: "user:{$user->id}:week:{$weekStart->format('o-\WW')}",
                user: $user,
                send: fn (): bool => $this->emails->sendWeeklyDigest(
                    $user,
                    $subscription,
                    $total,
                    $breakouts,
                    $weekStart->format('M j'),
                    (string) ($searches->first()?->name ?: $searches->first()?->phrase ?: ''),
                ),
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
