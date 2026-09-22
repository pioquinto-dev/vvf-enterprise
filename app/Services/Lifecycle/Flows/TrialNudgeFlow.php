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

/**
 * The three teaching moments inside the 8-day trial: how to read a Breakout
 * Score on day 2, what video analysis gives you on day 5, and one real
 * breakout from their own searches on day 7.
 *
 * Day 7 sends nothing when there is no video to show. A "look at this
 * breakout" email with no breakout in it is worse than silence, and it lands
 * the day before the trial ends, when credibility matters most.
 */
class TrialNudgeFlow implements LifecycleFlow
{
    /** Which day of the trial each email lands on, in sequence order. */
    private const TEMPLATES = [
        'trial_breakout_score',
        'trial_day5_video_analysis',
        'trial_one_breakout',
    ];

    private const TRIAL_STATUSES = ['trialing', 'trial'];

    public function __construct(private readonly BrevoLifecycleEmailService $emails) {}

    public function name(): string
    {
        return 'trial_nudges';
    }

    /**
     * @return iterable<LifecycleCandidate>
     */
    public function due(): iterable
    {
        $today = CarbonImmutable::now()->startOfDay();

        $subscriptions = Subscription::query()
            ->with(['user', 'plan'])
            ->whereIn('status', self::TRIAL_STATUSES)
            ->whereNotNull('trial_started_at')
            ->get();

        foreach ($subscriptions as $subscription) {
            $user = $subscription->user;

            if ($user === null) {
                continue;
            }

            $dayOfTrial = (int) CarbonImmutable::instance($subscription->trial_started_at)
                ->startOfDay()
                ->diffInDays($today, false);

            // Day offsets live in config/email_lifecycle.php next to the send
            // slots, so moving an email in the trial sequence is a config edit.
            $templateKey = LifecycleSchedule::stages(self::TEMPLATES)[$dayOfTrial] ?? null;

            if ($templateKey === null) {
                continue;
            }

            if ($templateKey === 'trial_breakout_score') {
                yield new LifecycleCandidate(
                    flowKey: 'trial_breakout_score',
                    dedupeKey: "subscription:{$subscription->id}",
                    user: $user,
                    send: fn (): bool => $this->emails->sendTrialBreakoutScore($user, $subscription),
                    templateKey: 'trial_breakout_score',
                    context: ['subscription_id' => $subscription->id, 'day_of_trial' => $dayOfTrial],
                );

                continue;
            }

            if ($templateKey === 'trial_day5_video_analysis') {
                yield new LifecycleCandidate(
                    flowKey: 'trial_day5_video_analysis',
                    dedupeKey: "subscription:{$subscription->id}",
                    user: $user,
                    send: fn (): bool => $this->emails->sendTrialDay5VideoAnalysis($user, $subscription),
                    templateKey: 'trial_day5_video_analysis',
                    context: ['subscription_id' => $subscription->id, 'day_of_trial' => $dayOfTrial],
                );

                continue;
            }

            $pick = $this->topBreakout($user->id);

            if ($pick === null) {
                continue;
            }

            [$search, $video] = $pick;

            yield new LifecycleCandidate(
                flowKey: 'trial_one_breakout',
                dedupeKey: "subscription:{$subscription->id}",
                user: $user,
                send: fn (): bool => $this->emails->sendTrialOneBreakout($user, $subscription, $search, $video),
                templateKey: 'trial_one_breakout',
                context: [
                    'subscription_id' => $subscription->id,
                    'search_id' => $search->id,
                    'viral_score' => $video['score'] ?? null,
                ],
            );
        }
    }

    /**
     * The strongest breakout across everything this user tracks.
     *
     * Ranked by viral_score, which is the same number the results page shows
     * as the Breakout Score, with id as a tiebreak so the pick is stable if
     * the flow is re-run.
     *
     * @return array{0: CustomKeywordSearch, 1: array<string, mixed>}|null
     */
    private function topBreakout(int $userId): ?array
    {
        $searchIds = CustomKeywordSearch::query()->where('user_id', $userId)->pluck('id');

        if ($searchIds->isEmpty()) {
            return null;
        }

        $row = CustomKeywordSearchVideo::query()
            ->whereIn('custom_keyword_search_id', $searchIds)
            ->where('is_new_breakout', true)
            ->whereHas('video', fn ($query) => $query->visible())
            ->with(['video', 'search'])
            ->orderByDesc('viral_score')
            ->orderBy('id')
            ->first();

        if ($row === null || $row->search === null || $row->video === null) {
            return null;
        }

        return [$row->search, [
            'handle' => $row->video->username ? '@'.$row->video->username : '',
            'caption' => (string) ($row->video->title ?? ''),
            'thumbnail' => (string) ($row->video?->previewImageUrl() ?? ''),
            'views' => number_format((int) ($row->video->views ?? 0)),
            'score' => $row->viral_score === null ? '' : (string) round((float) $row->viral_score, 1),
            // The day-7 email links the video itself, not just the results page.
            'url' => (string) ($row->video->video_url ?? ''),
        ]];
    }
}
