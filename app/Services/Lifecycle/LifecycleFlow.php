<?php

namespace App\Services\Lifecycle;

/**
 * A lifecycle flow knows how to find the emails it owes today.
 *
 * Flows deliberately do not dedupe or send: the dispatcher does both, so every
 * flow inherits the same idempotency guarantee instead of reinventing it in
 * subscription metadata the way the original trial cron did.
 */
interface LifecycleFlow
{
    /**
     * @return iterable<LifecycleCandidate>
     */
    public function due(): iterable;

    public function name(): string;
}
