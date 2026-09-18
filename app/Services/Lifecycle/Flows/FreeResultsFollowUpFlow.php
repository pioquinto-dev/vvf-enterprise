<?php

namespace App\Services\Lifecycle\Flows;

use App\Models\CustomKeywordSearch;
use App\Models\CustomKeywordSearchVideo;
use App\Models\Subscription;
use App\Services\Brevo\BrevoLifecycleEmailService;
use App\Services\Lifecycle\LifecycleCandidate;
use App\Services\Lifecycle\LifecycleFlow;
use Carbon\CarbonImmutable;

/**
 * The two follow-ups after a free search delivers results: a nudge to look
 * again on day 1, and a final note on day 3.
 *
 * Both stop the moment someone starts a trial or subscribes — the point of
 * these emails is conversion, and continuing to sell to a customer who already
 * bought is the fastest way to get marked as spam.
 */
class FreeResultsFollowUpFlow implements LifecycleFlow
{
    /** Day offset => stage name. */
    private const STAGES = [1 => 'second_look', 3 => 'last_note'];

    /** Anything here means they are past the free tier. */
    private const CONVERTED_STATUSES = ['active', 'trialing', 'trial', 'past_due'];

    public function __construct(private readonly BrevoLifecycleEmailService $emails) {}

    public function name(): string
    {
        return 'free_results_follow_up';
    }

    /**
     * @return iterable<LifecycleCandidate>
     */
    public function due(): iterable
    {
        $converted = Subscription::query()
            ->whereIn('status', self::CONVERTED_STATUSES)
            ->pluck('user_id')
            ->filter()
            ->unique()
            ->all();

        foreach (self::STAGES as $days => $stage) {
            $day = CarbonImmutable::now()->startOfDay()->subDays($days);

            $searches = CustomKeywordSearch::query()
                ->with('user')
                ->where('status', CustomKeywordSearch::STATUS_DONE)
                ->whereNotNull('user_id')
                ->whereNotIn('user_id', $converted)
                ->whereBetween('last_run_at', [$day, $day->addDay()])
                ->get();

            foreach ($searches as $search) {
                $user = $search->user;

                if ($user === null) {
                    continue;
                }

                $breakouts = CustomKeywordSearchVideo::query()
                    ->where('custom_keyword_search_id', $search->id)
                    ->where('is_new_breakout', true)
                    ->count();

                yield new LifecycleCandidate(
                    flowKey: 'free_results_'.$stage,
                    dedupeKey: "search:{$search->id}",
                    user: $user,
                    send: fn (): bool => $this->emails->sendFreeResultsFollowUp($user, $search, $breakouts, $stage),
                    templateKey: $stage === 'last_note' ? 'free_results_last_note' : 'free_results_second_look',
                    context: [
                        'search_id' => $search->id,
                        'stage' => $stage,
                        'breakouts' => $breakouts,
                    ],
                );
            }
        }
    }
}
