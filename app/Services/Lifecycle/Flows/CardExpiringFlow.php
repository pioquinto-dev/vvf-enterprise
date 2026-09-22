<?php

namespace App\Services\Lifecycle\Flows;

use App\Models\Subscription;
use App\Services\Brevo\BrevoLifecycleEmailService;
use App\Services\Lifecycle\LifecycleCandidate;
use App\Services\Lifecycle\LifecycleFlow;
use App\Services\Lifecycle\LifecycleSchedule;
use Carbon\CarbonImmutable;

/**
 * Warns before the card on file expires, so a renewal does not fail for a
 * reason the customer could have fixed in ten seconds.
 *
 * Reads the card cached on the last paid invoice rather than asking Stripe:
 * a daily scan that called Stripe once per subscriber would be thousands of
 * API calls to find the handful of cards expiring this week.
 */
class CardExpiringFlow implements LifecycleFlow
{
    public function __construct(private readonly BrevoLifecycleEmailService $emails) {}

    public function name(): string
    {
        return 'card_expiring';
    }

    /**
     * @return iterable<LifecycleCandidate>
     */
    public function due(): iterable
    {
        $today = CarbonImmutable::now()->startOfDay();

        // Config holds this as a negative offset from the expiry date, which is
        // how every other backwards-looking email in the schedule is written.
        $warnDays = abs(LifecycleSchedule::offsetDays('card_expiring', -7));

        $subscriptions = Subscription::query()
            ->with(['user', 'plan'])
            ->whereIn('status', ['active', 'trialing', 'trial', 'past_due'])
            ->whereNotNull('metadata')
            ->get();

        foreach ($subscriptions as $subscription) {
            $user = $subscription->user;
            $card = data_get($subscription->metadata, 'card');

            if ($user === null || ! is_array($card)) {
                continue;
            }

            $month = (int) ($card['exp_month'] ?? 0);
            $year = (int) ($card['exp_year'] ?? 0);

            if ($month < 1 || $month > 12 || $year < 2000) {
                continue;
            }

            // A card is valid through the END of its expiry month, so the
            // deadline is the first of the following month.
            $lapsesOn = CarbonImmutable::create($year, $month, 1)->addMonth()->startOfDay();

            if ((int) $today->diffInDays($lapsesOn, false) !== $warnDays) {
                continue;
            }

            yield new LifecycleCandidate(
                flowKey: 'card_expiring',
                // Keyed by the card's own expiry, so replacing the card with
                // one that expires later earns a fresh warning, while the same
                // card is never warned about twice.
                dedupeKey: "subscription:{$subscription->id}:{$year}-{$month}",
                user: $user,
                send: fn (): bool => $this->emails->sendCardExpiring(
                    $user,
                    $subscription,
                    (string) ($card['brand'] ?? 'Card'),
                    (string) ($card['last4'] ?? ''),
                    CarbonImmutable::create($year, $month, 1)->format('F Y'),
                ),
                templateKey: 'card_expiring',
                context: [
                    'subscription_id' => $subscription->id,
                    'card_last4' => $card['last4'] ?? null,
                    'expires' => sprintf('%04d-%02d', $year, $month),
                ],
            );
        }
    }
}
