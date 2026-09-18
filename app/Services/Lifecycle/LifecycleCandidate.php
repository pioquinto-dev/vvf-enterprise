<?php

namespace App\Services\Lifecycle;

use App\Models\User;

/**
 * One email that is due to go out: who gets it, which template, and the key
 * that makes it send exactly once.
 */
class LifecycleCandidate
{
    /**
     * @param  string  $flowKey  What the send slot is claimed under. One per
     *                           flow, even when the flow picks between several
     *                           templates — claiming per template would let a
     *                           flow whose branch flips send twice.
     * @param  string  $dedupeKey  Names the subject of the email — "subscription:91:d3".
     *                             Include whatever makes this send distinct from
     *                             the next one in the same flow.
     * @param  string|null  $templateKey  Registry key of the template this will
     *                                    actually send, recorded after delivery.
     * @param  callable(): bool  $send  Performs the send; returns false on failure
     *                                  so the ledger can release the slot for a retry.
     * @param  array<string, mixed>  $context
     */
    public function __construct(
        public readonly string $flowKey,
        public readonly string $dedupeKey,
        public readonly User $user,
        public $send,
        public readonly ?string $templateKey = null,
        public readonly array $context = [],
    ) {}
}
