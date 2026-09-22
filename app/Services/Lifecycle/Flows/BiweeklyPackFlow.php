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
 * The fortnightly pack: one brand or product, and the three strongest
 * breakouts on it from the last two weeks, for people currently paying.
 *
 * "Every other Thursday" needs an anchor, or the cadence drifts whenever a run
 * is missed. The anchor now lives in config/email_lifecycle.php with the
 * weekday, the interval and the send slot, so the whole cadence is one entry
 * and LifecycleSchedule is what evaluates it.
 *
 * One subject per pack, not a mixed list: the email's argument is "here is what
 * is happening on this one thing", and three videos from three different
 * searches do not have anything in common to point at.
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

        // Weekday, fortnight parity and the 8:00am slot all come from config.
        if (! LifecycleSchedule::slotIsOpen('biweekly_pack', $today)) {
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

            // The one subject this pack is about: whichever of their searches
            // produced the most breakouts in the window.
            $search = CustomKeywordSearch::query()
                ->where('user_id', $user->id)
                ->withCount(['videos as window_breakouts' => fn ($query) => $query
                    ->where('is_new_breakout', true)
                    ->where('created_at', '>=', $since)])
                ->orderByDesc('window_breakouts')
                ->orderBy('id')
                ->first();

            if ($search === null || (int) $search->window_breakouts === 0) {
                continue;
            }

            $rows = CustomKeywordSearchVideo::query()
                ->where('custom_keyword_search_id', $search->id)
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
                'thumbnail' => (string) ($row->video?->previewImageUrl() ?? ''),
                'views' => number_format((int) ($row->video?->views ?? 0)),
                'score' => $row->viral_score === null ? '' : (string) round((float) $row->viral_score, 1),
                'subject' => (string) ($row->search?->name ?: $row->search?->phrase ?? ''),
            ])->all();

            yield new LifecycleCandidate(
                flowKey: 'biweekly_pack',
                dedupeKey: "user:{$user->id}:week:{$today->format('o-\WW')}",
                user: $user,
                send: fn (): bool => $this->emails->sendBiweeklyPack(
                    $user,
                    $subscription,
                    $picks,
                    (string) ($search->name ?: $search->phrase),
                    url($search->url()),
                    // The "what they have in common" line is left empty rather
                    // than generated. Nothing here knows why three videos
                    // worked, and inventing a reason is what makes a digest
                    // stop being worth opening.
                ),
                templateKey: 'biweekly_pack',
                context: [
                    'subscription_id' => $subscription->id,
                    'search_id' => $search->id,
                    'picks' => count($picks),
                ],
            );
        }
    }
}
