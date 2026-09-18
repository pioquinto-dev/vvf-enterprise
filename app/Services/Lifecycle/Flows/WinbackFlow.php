<?php

namespace App\Services\Lifecycle\Flows;

use App\Models\CustomKeywordSearch;
use App\Models\CustomKeywordSearchVideo;
use App\Models\Subscription;
use App\Models\UserActivity;
use App\Services\Brevo\BrevoLifecycleEmailService;
use App\Services\Lifecycle\LifecycleCandidate;
use App\Services\Lifecycle\LifecycleFlow;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;

/**
 * Both winback sequences: the trial that lapsed without a purchase, and the
 * subscription that was paid for and then ended.
 *
 * They are one class because they are the same shape — three emails at
 * increasing distance from the day access stopped — and because the two
 * audiences must never overlap. Splitting them across two flows that each
 * decide "is this mine?" independently is how a churned customer ends up
 * getting both sequences.
 *
 * The middle email in each leads on a real number: breakouts the account
 * missed since it lapsed. That only works because lapsed searches keep
 * refreshing — the paywall locks the view, not the data.
 */
class WinbackFlow implements LifecycleFlow
{
    /** Days after access stopped => template key, for someone who never paid. */
    private const TRIAL_STAGES = [
        1 => 'trial_winback_ended',
        7 => 'trial_winback_missed',
        21 => 'trial_winback_last_note',
    ];

    /** Days after access stopped => template key, for someone who did pay. */
    private const CHURN_STAGES = [
        3 => 'churn_winback_ended',
        14 => 'churn_winback_missed',
        45 => 'churn_winback_last_note',
    ];

    /** Subscription states that mean access has stopped. */
    private const ENDED_STATUSES = ['canceled', 'unpaid', 'incomplete_expired'];

    public function __construct(private readonly BrevoLifecycleEmailService $emails) {}

    public function name(): string
    {
        return 'winback';
    }

    /**
     * @return iterable<LifecycleCandidate>
     */
    public function due(): iterable
    {
        $today = CarbonImmutable::now()->startOfDay();

        $ended = Subscription::query()
            ->with(['user', 'plan'])
            ->whereIn('status', self::ENDED_STATUSES)
            ->get()
            ->filter(fn (Subscription $subscription): bool => $subscription->user !== null);

        if ($ended->isEmpty()) {
            return;
        }

        // Someone who resubscribed is not a winback target, whatever an older
        // ended row still says.
        $activeUserIds = Subscription::query()
            ->whereIn('status', ['active', 'trialing', 'trial', 'past_due'])
            ->pluck('user_id')
            ->filter()
            ->unique()
            ->flip();

        $paidUserIds = $this->usersWhoEverPaid($ended->pluck('user_id')->filter()->unique());

        foreach ($ended as $subscription) {
            $user = $subscription->user;

            if ($activeUserIds->has($user->id)) {
                continue;
            }

            $lapsedAt = $this->lapsedAt($subscription);

            if ($lapsedAt === null) {
                continue;
            }

            $daysSince = (int) $lapsedAt->startOfDay()->diffInDays($today, false);
            $everPaid = $paidUserIds->has($user->id);
            $stages = $everPaid ? self::CHURN_STAGES : self::TRIAL_STAGES;

            if (! array_key_exists($daysSince, $stages)) {
                continue;
            }

            $templateKey = $stages[$daysSince];
            $missed = str_contains($templateKey, 'missed')
                ? $this->missedBreakouts($user->id, $lapsedAt)
                : 0;

            // The middle email is entirely about the number. Without one there
            // is no email worth sending.
            if (str_contains($templateKey, 'missed') && $missed === 0) {
                continue;
            }

            yield new LifecycleCandidate(
                flowKey: $templateKey,
                dedupeKey: "subscription:{$subscription->id}",
                user: $user,
                send: fn (): bool => $this->emails->sendWinback(
                    $user,
                    $subscription,
                    $templateKey,
                    $missed,
                    $lapsedAt->format('F j, Y'),
                ),
                templateKey: $templateKey,
                context: [
                    'subscription_id' => $subscription->id,
                    'days_since' => $daysSince,
                    'ever_paid' => $everPaid,
                    'missed_breakouts' => $missed,
                ],
            );
        }
    }

    /**
     * The day access actually stopped. canceled_at is the most precise signal;
     * the period end is the fallback for a subscription that simply ran out.
     */
    private function lapsedAt(Subscription $subscription): ?CarbonImmutable
    {
        $at = $subscription->canceled_at
            ?? $subscription->current_period_ends_at
            ?? $subscription->trial_ends_at;

        return $at === null ? null : CarbonImmutable::instance($at);
    }

    /**
     * Users with a recorded successful invoice. This is what separates the two
     * sequences: a trial that never converted has no invoice_paid activity.
     *
     * @param  Collection<int, int>  $userIds
     * @return Collection<int, mixed>
     */
    private function usersWhoEverPaid(Collection $userIds): Collection
    {
        if ($userIds->isEmpty()) {
            return collect();
        }

        return UserActivity::query()
            ->whereIn('user_id', $userIds)
            ->where('event', 'invoice_paid')
            ->pluck('user_id')
            ->unique()
            ->flip();
    }

    /**
     * Breakouts found across this user's searches since they lapsed.
     *
     * These are their own searches, still running — which is what lets the
     * email say "you missed these" rather than describing the market.
     */
    private function missedBreakouts(int $userId, CarbonImmutable $since): int
    {
        $searchIds = CustomKeywordSearch::query()->where('user_id', $userId)->pluck('id');

        if ($searchIds->isEmpty()) {
            return 0;
        }

        return CustomKeywordSearchVideo::query()
            ->whereIn('custom_keyword_search_id', $searchIds)
            ->where('is_new_breakout', true)
            ->where('created_at', '>=', $since)
            ->count();
    }
}
