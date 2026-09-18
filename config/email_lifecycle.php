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
     * Flows the daily dispatcher runs, in order. Each one implements
     * App\Services\Lifecycle\LifecycleFlow and only has to answer "what is due
     * today" — dedupe, suppression and logging are the dispatcher's job.
     *
     * Phases 2 to 4 of the lifecycle build append to this list; they should not
     * need a new command or a new schedule entry.
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
];
