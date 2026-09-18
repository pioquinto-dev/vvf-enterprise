<?php

namespace App\Services\Lifecycle\Flows;

use App\Models\User;
use App\Services\Brevo\BrevoLifecycleEmailService;
use App\Services\Lifecycle\LifecycleCandidate;
use App\Services\Lifecycle\LifecycleFlow;
use Carbon\CarbonImmutable;

/**
 * Two days after signup with nothing searched yet.
 *
 * The one thing a new account has to do is run a search; everything the
 * product is for happens after that. This is the only nudge — if it does not
 * land, the free-results flow never starts and the account goes quiet on its
 * own.
 */
class OnboardingNoSearchFlow implements LifecycleFlow
{
    private const DAYS_AFTER_SIGNUP = 2;

    public function __construct(private readonly BrevoLifecycleEmailService $emails) {}

    public function name(): string
    {
        return 'onboarding_no_search';
    }

    /**
     * @return iterable<LifecycleCandidate>
     */
    public function due(): iterable
    {
        $day = CarbonImmutable::now()->startOfDay()->subDays(self::DAYS_AFTER_SIGNUP);

        $users = User::query()
            ->whereBetween('created_at', [$day, $day->addDay()])
            // A search of any kind means they activated; nothing to nudge.
            ->whereNotExists(fn ($query) => $query
                ->selectRaw(1)
                ->from('custom_keyword_searches')
                ->whereColumn('custom_keyword_searches.user_id', 'users.id'))
            ->get();

        foreach ($users as $user) {
            yield new LifecycleCandidate(
                flowKey: 'onboarding_no_search',
                dedupeKey: "user:{$user->id}",
                user: $user,
                send: fn (): bool => $this->emails->sendOnboardingNoSearch($user),
                templateKey: 'onboarding_no_search',
                context: ['signed_up_at' => $user->created_at?->toDateString()],
            );
        }
    }
}
