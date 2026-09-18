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
 * The fortnightly pack: the three strongest breakouts of the last two weeks,
 * for people currently paying.
 *
 * "Every other Thursday" needs an anchor, or the cadence drifts whenever a run
 * is missed. ISO week number parity is that anchor: the pack lands on even
 * weeks, so a skipped run resumes on schedule rather than shifting the whole
 * series by a fortnight.
 */
class BiweeklyPackFlow implements LifecycleFlow
{
    private const PICKS = 3;

    public function __construct(private readonly BrevoLifecycleEmailService $emails) {}

    public function name(): string
    {
        return 'biweekly_pack';
    }

    /**
     * @return iterable<LifecycleCandidate>
     */
    public function due(): iterable
    {
        $today = CarbonImmutable::now();

        if (! $today->isThursday() || (int) $today->format('W') % 2 !== 0) {
            return;
        }

        $since = $today->startOfDay()->subDays(14);

        $subscriptions = Subscription::query()
            ->with(['user', 'plan'])
            ->where('status', 'active')
            ->get();

        foreach ($subscriptions as $subscription) {
            $user = $subscription->user;

            if ($user === null) {
                continue;
            }

            $searchIds = CustomKeywordSearch::query()->where('user_id', $user->id)->pluck('id');

            if ($searchIds->isEmpty()) {
                continue;
            }

            $rows = CustomKeywordSearchVideo::query()
                ->whereIn('custom_keyword_search_id', $searchIds)
                ->where('is_new_breakout', true)
                ->where('created_at', '>=', $since)
                ->whereHas('video', fn ($query) => $query->visible())
                ->with(['video', 'search'])
                ->orderByDesc('viral_score')
                ->orderBy('id')
                ->limit(self::PICKS)
                ->get();

            if ($rows->isEmpty()) {
                continue;
            }

            $picks = $rows->map(fn (CustomKeywordSearchVideo $row): array => [
                'handle' => $row->video?->username ? '@'.$row->video->username : '',
                'caption' => (string) ($row->video?->title ?? ''),
                'thumbnail' => (string) ($row->video?->thumbnail_url ?? ''),
                'views' => number_format((int) ($row->video?->views ?? 0)),
                'score' => $row->viral_score === null ? '' : (string) round((float) $row->viral_score, 1),
                'subject' => (string) ($row->search?->name ?: $row->search?->phrase ?? ''),
            ])->all();

            yield new LifecycleCandidate(
                flowKey: 'biweekly_pack',
                dedupeKey: "user:{$user->id}:week:{$today->format('o-\WW')}",
                user: $user,
                send: fn (): bool => $this->emails->sendBiweeklyPack($user, $subscription, $picks, $since->format('M j')),
                templateKey: 'biweekly_pack',
                context: [
                    'subscription_id' => $subscription->id,
                    'picks' => count($picks),
                ],
            );
        }
    }
}
