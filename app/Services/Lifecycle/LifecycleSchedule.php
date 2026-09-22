<?php

namespace App\Services\Lifecycle;

use App\Support\EmailTemplateRegistry;
use Carbon\CarbonImmutable;

/**
 * Answers the two scheduling questions every flow and the dispatcher need:
 *
 *   how many days after its trigger does this email go out   (offsetDays)
 *   is this the hour it is supposed to go out in              (slotIsOpen)
 *
 * The offsets used to live as private constants inside each flow, which meant
 * the handover board and the code could disagree without anything noticing.
 * They live in config now and the flows ask for them.
 *
 * Slots are wall-clock times in the lifecycle timezone, not offsets from the
 * cron, because that is how the board specifies them ("Mon 7:00am"). The
 * dispatcher runs hourly and only sends what is due in the current hour, plus a
 * catch-up window so a missed run does not drop a day of mail.
 *
 * The schedule itself lives on the template row in email_templates, read
 * through EmailTemplateRegistry. config/email_lifecycle.php is the fallback and
 * the seed, which is the same arrangement subjects and preview text already
 * have: moving an email in the sequence is an edit in Admin -> Email Templates,
 * not a deploy, and an environment with no schedule columns yet keeps the
 * timings it shipped with.
 */
class LifecycleSchedule
{
    /**
     * @return array<string, mixed>
     */
    public static function for(string $templateKey): array
    {
        return EmailTemplateRegistry::schedule($templateKey);
    }

    /**
     * The clock a template's slot is read on. A row may override it; almost
     * none do, which is why the default lives in config.
     */
    public static function timezone(?string $templateKey = null): string
    {
        $override = $templateKey === null ? null : (self::for($templateKey)['timezone'] ?? null);

        return is_string($override) && $override !== ''
            ? $override
            : (string) config('email_lifecycle.timezone', 'UTC');
    }

    /**
     * Days between the trigger event and the send. Negative counts backwards
     * from a future date (a card expiring, a trial ending).
     */
    public static function offsetDays(string $templateKey, int $default = 0): int
    {
        $offset = self::for($templateKey)['offset_days'] ?? null;

        return is_numeric($offset) ? (int) $offset : $default;
    }

    /**
     * Day offsets for a set of template keys, keyed by offset.
     *
     * Flows that step through a sequence ("day 1, day 7, day 21") want the
     * stages the other way round, so they can ask "is anything due at this
     * many days since the event".
     *
     * @param  array<int, string>  $templateKeys
     * @return array<int, string>
     */
    public static function stages(array $templateKeys): array
    {
        $stages = [];

        foreach ($templateKeys as $key) {
            $stages[self::offsetDays($key)] = $key;
        }

        return $stages;
    }

    /**
     * True when the current run is inside this email's send window.
     *
     * Immediate mail (results ready, first dunning notice) has no window: it
     * goes when the event happens, so the gate always opens.
     */
    public static function slotIsOpen(string $templateKey, ?CarbonImmutable $now = null): bool
    {
        $spec = self::for($templateKey);

        // An email with no schedule entry is not gated. New flows should add
        // one, but a missing entry must never mean "never send".
        if ($spec === [] || ($spec['immediate'] ?? false) === true || ! isset($spec['at'])) {
            return true;
        }

        $now = ($now ?? CarbonImmutable::now())->setTimezone(self::timezone($templateKey));

        if (! self::cadenceMatches($spec, $now, self::timezone($templateKey))) {
            return false;
        }

        $slot = self::slotOn($now, (string) $spec['at']);
        $catchUp = max(0, (int) config('email_lifecycle.catch_up_hours', 6));

        // Before the slot: not yet. After it: allowed until the window closes,
        // so an hourly run that was skipped still gets its chance.
        return $now->greaterThanOrEqualTo($slot)
            && $now->lessThan($slot->addHours($catchUp + 1));
    }

    /**
     * The wall-clock slot for a template on a given day, in the lifecycle
     * timezone. Exposed so a flow can log or display it.
     */
    public static function slotFor(string $templateKey, ?CarbonImmutable $day = null): ?CarbonImmutable
    {
        $at = self::for($templateKey)['at'] ?? null;

        if (! is_string($at)) {
            return null;
        }

        return self::slotOn(($day ?? CarbonImmutable::now())->setTimezone(self::timezone($templateKey)), $at);
    }

    /**
     * Weekday and every-N-weeks gating for the cadence emails.
     *
     * The interval counts whole weeks from a fixed anchor rather than from
     * each recipient's own history, so "every two weeks" means the same
     * fortnight for the whole list. Without an anchor the list would split
     * into two cohorts that each got the pack on alternate weeks.
     *
     * @param  array<string, mixed>  $spec
     */
    private static function cadenceMatches(array $spec, CarbonImmutable $now, string $timezone): bool
    {
        $weekday = $spec['weekday'] ?? null;

        if (is_string($weekday) && strtolower($now->englishDayOfWeek) !== strtolower($weekday)) {
            return false;
        }

        $interval = (int) ($spec['interval_weeks'] ?? 1);

        if ($interval <= 1) {
            return true;
        }

        $anchor = $spec['anchor'] ?? null;
        $anchorWeek = is_string($anchor) && $anchor !== ''
            ? CarbonImmutable::parse($anchor, $timezone)->startOfWeek()
            : CarbonImmutable::parse('2026-01-05', $timezone)->startOfWeek();

        // Rounded off whole days rather than taken from diffInWeeks, which
        // truncates: a daylight-saving shift makes one of these gaps 6d23h, and
        // truncation would drop that fortnight and flip the parity of every
        // pack after it.
        $days = (int) $anchorWeek->diffInDays($now->startOfWeek(), false);
        $weeks = (int) round($days / 7);

        return $weeks % $interval === 0;
    }

    /**
     * The schedule in one sentence, for the admin drawer.
     *
     * Reads off the same config the dispatcher gates on, so what an admin is
     * told and what actually happens cannot drift apart.
     */
    public static function describe(string $templateKey): string
    {
        $spec = self::for($templateKey);

        if ($spec === []) {
            return 'Not scheduled. Sent by the code that triggers it.';
        }

        $at = isset($spec['at'])
            ? ' at '.$spec['at'].' '.self::timezone($templateKey)
            : '';

        if (($spec['immediate'] ?? false) === true) {
            $hours = $spec['offset_hours'] ?? null;

            return is_numeric($hours) && (int) $hours > 0
                ? sprintf('About %d hours after %s.', (int) $hours, self::triggerLabel($spec))
                : sprintf('Immediately on %s.', self::triggerLabel($spec));
        }

        if (($spec['trigger'] ?? null) === 'cadence') {
            $interval = (int) ($spec['interval_weeks'] ?? 1);
            $weekday = ucfirst((string) ($spec['weekday'] ?? 'monday'));

            return $interval > 1
                ? sprintf('Every %d weeks on %s%s.', $interval, $weekday, $at)
                : sprintf('Every %s%s.', $weekday, $at);
        }

        $days = self::offsetDays($templateKey);

        if ($days === 0) {
            return sprintf('On the day of %s%s.', self::triggerLabel($spec), $at);
        }

        return $days < 0
            ? sprintf('%d days before %s%s.', abs($days), self::triggerLabel($spec), $at)
            : sprintf('%d days after %s%s.', $days, self::triggerLabel($spec), $at);
    }

    /**
     * @param  array<string, mixed>  $spec
     */
    private static function triggerLabel(array $spec): string
    {
        return match ($spec['trigger'] ?? '') {
            'signup' => 'signup',
            'search_completed' => 'a search finishing',
            'trial_start' => 'the trial starting',
            'trial_end' => 'the trial ending',
            'payment_failed' => 'the first failed payment',
            'card_expiry' => 'the card on file expiring',
            'access_ended' => 'access ending',
            'cancellation' => 'cancellation',
            default => 'its trigger',
        };
    }

    private static function slotOn(CarbonImmutable $day, string $at): CarbonImmutable
    {
        [$hour, $minute] = array_pad(explode(':', $at, 2), 2, '0');

        return $day->setTime((int) $hour, (int) $minute, 0);
    }
}
