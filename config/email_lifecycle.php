<?php

use App\Services\Lifecycle\Flows\BiweeklyPackFlow;
use App\Services\Lifecycle\Flows\CardExpiringFlow;
use App\Services\Lifecycle\Flows\FreeResultsFollowUpFlow;
use App\Services\Lifecycle\Flows\OnboardingNoSearchFlow;
use App\Services\Lifecycle\Flows\TrialNudgeFlow;
use App\Services\Lifecycle\Flows\WinbackFlow;
use App\Services\Lifecycle\Flows\TrialEndingFlow;
use App\Services\Lifecycle\Flows\WeeklyDigestFlow;

return [
    /*
     * Flows the dispatcher runs, in order. Each one implements
     * App\Services\Lifecycle\LifecycleFlow and only has to answer "whose turn
     * is it" — dedupe, suppression, the send window and logging are the
     * dispatcher's job.
     *
     * Adding a flow should not need a new command or a new schedule entry.
     */
    'flows' => [
        OnboardingNoSearchFlow::class,
        FreeResultsFollowUpFlow::class,
        TrialNudgeFlow::class,
        TrialEndingFlow::class,
        CardExpiringFlow::class,
        WinbackFlow::class,
        // Both return immediately on the days they do not run.
        WeeklyDigestFlow::class,
        BiweeklyPackFlow::class,
    ],

    /*
     * The clock the send slots are read on. The handover board specifies
     * wall-clock times ("Mon 7:00am"), not offsets, so they need a zone of
     * their own rather than inheriting app.timezone, which is UTC in this app.
     *
     * A single template can override this with its own send_timezone; nothing
     * does by default, and a whole-schedule change belongs here.
     */
    'timezone' => env('LIFECYCLE_EMAIL_TIMEZONE', 'America/New_York'),

    /*
     * How long after its slot an email may still go out. The dispatcher runs
     * hourly, so a slot normally fires within the hour; this window is what
     * stops a skipped deploy, a queue backlog or a daylight-saving shift from
     * silently dropping a day of lifecycle mail. The ledger is what keeps it
     * from sending twice.
     */
    'catch_up_hours' => (int) env('LIFECYCLE_EMAIL_CATCH_UP_HOURS', 6),

    /*
     * Numbers the dunning copy promises. They are here rather than inline in
     * the templates because all three dunning emails and the final notice have
     * to name the same deadline and the same retention window; two of them
     * would otherwise contradict each other.
     */
    'dunning' => [
        'lock_after_days' => (int) env('LIFECYCLE_DUNNING_LOCK_AFTER_DAYS', 7),
        'retention_days' => (int) env('LIFECYCLE_DUNNING_RETENTION_DAYS', 30),
    ],

    /*
     * The DEFAULT schedule for each email, per the final handover board:
     * https://atienzaveejay.github.io/brandbeacon-emails/final/
     *
     * These are the seed and the fallback, not the live values. The schedule an
     * email actually runs on lives on its row in `email_templates` and is edited
     * in Admin -> Email Templates; LifecycleSchedule reads the row first and
     * only comes back here when the row has nothing set. That is the same
     * arrangement subjects and preview text already have, and it is what makes
     * moving an email in the sequence an edit rather than a deploy.
     *
     * So: change these to change what a fresh install or a newly seeded row
     * starts with. Change the row to change when an email goes out now.
     *
     * Keys are template keys from config/brevo_notifications.php.
     *
     *   trigger        what the offset counts from. Documentation for the
     *                  reader; the owning flow is what queries it.
     *   offset_days    days after that event. Absent for cadence emails.
     *   at             the wall-clock slot in the timezone above, "HH:MM".
     *   weekday        cadence emails only: which day it goes out.
     *   interval_weeks cadence emails only: every Nth week.
     *   anchor         cadence emails only: the Monday the interval counts
     *                  from, so "every 2 weeks" lands on the same fortnight
     *                  for everyone rather than drifting per recipient.
     *   immediate      true for event-driven mail with no delay. These are not
     *                  slot-gated: a results-ready email that waited until
     *                  7am would be a worse email.
     *
     * Each maps to a column: send_trigger, send_offset_days, send_offset_hours,
     * send_at, send_weekday, send_interval_weeks, send_anchor_date,
     * send_immediate, plus send_timezone, which has no default here because
     * the zone below covers every template that does not override it.
     */
    'schedule' => [
        // 1. Free, never searched.
        'new_registration' => ['trigger' => 'signup', 'offset_hours' => 3, 'immediate' => true],
        'onboarding_no_search' => ['trigger' => 'signup', 'offset_days' => 2, 'at' => '08:05'],

        // 2. Free, results ready.
        'search_done' => ['trigger' => 'search_completed', 'immediate' => true],
        'free_results_second_look' => ['trigger' => 'search_completed', 'offset_days' => 1, 'at' => '09:12'],
        'free_results_last_note' => ['trigger' => 'search_completed', 'offset_days' => 3, 'at' => '09:30'],

        // 3. The 8-day trial.
        'subscription_started' => ['trigger' => 'trial_start', 'offset_days' => 0, 'immediate' => true],
        'trial_breakout_score' => ['trigger' => 'trial_start', 'offset_days' => 2, 'at' => '07:40'],
        'trial_day5_video_analysis' => ['trigger' => 'trial_start', 'offset_days' => 5, 'at' => '07:40'],
        'trial_one_breakout' => ['trigger' => 'trial_start', 'offset_days' => 7, 'at' => '09:00'],

        // 4. Dunning and the card. Early slot: a billing problem is worth
        // catching before the working day starts.
        'payment_failed_first' => ['trigger' => 'payment_failed', 'offset_days' => 0, 'immediate' => true],
        'payment_failed_second' => ['trigger' => 'payment_failed', 'offset_days' => 2, 'at' => '06:12'],
        'final_failed_payment' => ['trigger' => 'payment_failed', 'offset_days' => 5, 'at' => '06:12'],
        'card_expiring' => ['trigger' => 'card_expiry', 'offset_days' => -7, 'at' => '06:00'],

        // 4 (not on the board). Trial ending, branched on a card being on file.
        // TrialEndingFlow sends two reminders, at 3 days and 1 day out; the
        // offset here is the first of them, and both use this slot.
        'trial_ending_cc' => ['trigger' => 'trial_end', 'offset_days' => -3, 'at' => '07:40'],
        'trial_ending_no_cc' => ['trigger' => 'trial_end', 'offset_days' => -3, 'at' => '07:40'],

        // 5. Trial expired without a purchase.
        'trial_winback_ended' => ['trigger' => 'access_ended', 'offset_days' => 1, 'at' => '09:00'],
        'trial_winback_missed' => ['trigger' => 'access_ended', 'offset_days' => 7, 'at' => '08:30'],
        'trial_winback_last_note' => ['trigger' => 'access_ended', 'offset_days' => 21, 'at' => '09:00'],

        // 6. A paying subscription ended.
        'churn_winback_ended' => ['trigger' => 'access_ended', 'offset_days' => 3, 'at' => '09:00'],
        'churn_winback_missed' => ['trigger' => 'access_ended', 'offset_days' => 14, 'at' => '08:30'],
        'churn_winback_last_note' => ['trigger' => 'access_ended', 'offset_days' => 45, 'at' => '09:00'],

        // 7 and 8. Ongoing.
        'weekly_digest' => [
            'trigger' => 'cadence',
            'weekday' => 'monday',
            'interval_weeks' => 1,
            'at' => '07:00',
        ],
        'biweekly_pack' => [
            'trigger' => 'cadence',
            'weekday' => 'thursday',
            'interval_weeks' => 2,
            'anchor' => env('LIFECYCLE_BIWEEKLY_ANCHOR', '2026-01-05'),
            'at' => '08:00',
        ],

        // Not on the board, event-driven, no delay.
        'verify_email_manual_account' => ['trigger' => 'signup', 'immediate' => true],
        'subscription_canceled' => ['trigger' => 'cancellation', 'immediate' => true],
    ],
];
