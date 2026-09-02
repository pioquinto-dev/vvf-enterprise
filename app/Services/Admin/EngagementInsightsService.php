<?php

namespace App\Services\Admin;

use App\Models\UserActivity;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;

class EngagementInsightsService
{
    private const ANALYSIS_EVENTS = ['video_analysis_triggered'];

    private const BOOKMARK_EVENTS = ['video_bookmarked'];

    private const SEARCH_EVENTS = ['search_triggered'];

    private const LOGIN_EVENTS = ['logged_in'];

    private const PAID_EVENTS = ['subscription_paid'];

    /**
     * Build a concise, selected-range view of the activity ledger. The ledger
     * is the source of truth here so the panel only reports tracked behavior.
     *
     * @return array<string, mixed>
     */
    public function payload(int $days): array
    {
        $end = CarbonImmutable::now('UTC');
        $currentStart = $end->subDays($days);
        $previousStart = $currentStart->subDays($days);

        $activities = UserActivity::query()
            ->select(['user_id', 'event', 'created_at'])
            ->where('created_at', '>=', $previousStart)
            ->whereNotNull('user_id')
            ->get();

        $current = $activities->filter(fn (UserActivity $activity): bool => $activity->created_at->gte($currentStart));
        $previous = $activities->filter(fn (UserActivity $activity): bool => $activity->created_at->lt($currentStart));

        $activeCreators = $this->uniqueUsers($current);
        $analysis = $this->eventStats($current, self::ANALYSIS_EVENTS);
        $bookmarks = $this->eventStats($current, self::BOOKMARK_EVENTS);
        $searches = $this->eventStats($current, self::SEARCH_EVENTS);
        $paid = $this->eventStats($current, self::PAID_EVENTS);

        return [
            'activeCreators' => $activeCreators,
            'rangeLabel' => "Last {$days} days",
            'adoption' => [
                $this->adoptionRow('Ran an analysis', $analysis['users'], $activeCreators, 'violet'),
                $this->adoptionRow('Saved a bookmark', $bookmarks['users'], $activeCreators, 'violet'),
                $this->adoptionRow('Ran a keyword search', $searches['users'], $activeCreators, 'violet'),
                $this->adoptionRow('Converted to paid', $paid['users'], $activeCreators, 'rose'),
            ],
            'frequency' => [
                $this->frequencyRow('Analyses', $analysis),
                $this->frequencyRow('Bookmarks', $bookmarks),
            ],
            'trends' => [
                $this->trendRow('Logins', $this->eventStats($current, self::LOGIN_EVENTS)['count'], $this->eventStats($previous, self::LOGIN_EVENTS)['count']),
                $this->trendRow('Active creators', $activeCreators, $this->uniqueUsers($previous)),
                $this->trendRow('Paid conversions', $paid['users'], $this->eventStats($previous, self::PAID_EVENTS)['users']),
            ],
            'suggestions' => $this->suggestions($activeCreators, $analysis, $bookmarks, $searches, $paid, $current, $previous),
        ];
    }

    /** @return array{count: int, users: int} */
    private function eventStats(Collection $activities, array $events): array
    {
        $matching = $activities->whereIn('event', $events);

        return ['count' => $matching->count(), 'users' => $this->uniqueUsers($matching)];
    }

    private function uniqueUsers(Collection $activities): int
    {
        return $activities->pluck('user_id')->filter()->unique()->count();
    }

    /** @return array<string, int|string> */
    private function adoptionRow(string $label, int $users, int $activeCreators, string $tone): array
    {
        return [
            'label' => $label,
            'users' => $users,
            'percentage' => $this->percentage($users, $activeCreators),
            'tone' => $tone,
        ];
    }

    /** @param array{count: int, users: int} $stats
     * @return array<string, int|float|string>
     */
    private function frequencyRow(string $label, array $stats): array
    {
        return [
            'label' => $label,
            'average' => $stats['users'] === 0 ? 0 : round($stats['count'] / $stats['users'], 1),
            'adopters' => $stats['users'],
            'adoption' => $stats['count'] === 0 ? 0 : $stats['count'],
        ];
    }

    /** @return array<string, int|float|null|string> */
    private function trendRow(string $label, int $current, int $previous): array
    {
        return [
            'label' => $label,
            'current' => $current,
            'previous' => $previous,
            'change' => $previous === 0 ? null : round((($current - $previous) / $previous) * 100),
        ];
    }

    /**
     * @param array{count: int, users: int} $analysis
     * @param array{count: int, users: int} $bookmarks
     * @param array{count: int, users: int} $searches
     * @param array{count: int, users: int} $paid
     * @return list<string>
     */
    private function suggestions(int $activeCreators, array $analysis, array $bookmarks, array $searches, array $paid, Collection $current, Collection $previous): array
    {
        if ($activeCreators === 0) {
            return ['No tracked creator activity in this range yet. Engagement suggestions will appear as people use the product.'];
        }

        $suggestions = [];
        $analysisRate = $this->percentage($analysis['users'], $activeCreators);
        $bookmarkRate = $this->percentage($bookmarks['users'], $activeCreators);
        $searchRate = $this->percentage($searches['users'], $activeCreators);

        if ($analysisRate < 20) {
            $suggestions[] = "Only {$analysisRate}% of active creators ran an analysis. Consider an in-app prompt after they find a promising video.";
        }

        if ($bookmarkRate < 20) {
            $suggestions[] = "Bookmark adoption is {$bookmarkRate}%. Prompt creators to save videos so they can build a reusable library.";
        }

        if ($searchRate < 20) {
            $suggestions[] = "Only {$searchRate}% of active creators ran a keyword search. Surface search guidance in the dashboard or onboarding.";
        }

        if ($analysis['users'] > 0 && $analysis['count'] / $analysis['users'] < 2) {
            $suggestions[] = 'Analysis intensity is below two per adopter. A follow-up reminder can help build a repeat-use habit.';
        }

        $currentLogins = $this->eventStats($current, self::LOGIN_EVENTS)['count'];
        $previousLogins = $this->eventStats($previous, self::LOGIN_EVENTS)['count'];
        if ($previousLogins > 0 && $currentLogins < $previousLogins) {
            $drop = abs((int) round((($currentLogins - $previousLogins) / $previousLogins) * 100));
            $suggestions[] = "Logins are down {$drop}% versus the previous range. A re-engagement campaign could bring back lapsed creators.";
        }

        if ($paid['users'] === 0) {
            $suggestions[] = 'No paid conversions were recorded in this range. Review the upgrade moments shown to engaged free creators.';
        }

        return array_slice($suggestions, 0, 4);
    }

    private function percentage(int $value, int $total): int
    {
        return $total === 0 ? 0 : (int) round(($value / $total) * 100);
    }
}
