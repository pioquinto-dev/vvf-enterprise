<?php

namespace App\Services\Brevo;

use App\Models\EmailSend;
use App\Models\User;
use Illuminate\Database\QueryException;

/**
 * Owns "has this lifecycle email already gone out?".
 *
 * Delayed emails are found by a daily scan, so the answer has to survive
 * between runs and be safe against two workers scanning at once. The claim is
 * therefore taken by inserting the row first and letting the unique index on
 * (flow_key, dedupe_key) reject the loser, rather than by reading and then
 * writing.
 */
class EmailSendLedger
{
    /**
     * Take the send slot for this flow and subject. Returns null when someone
     * already holds it, which the caller should treat as "nothing to do"
     * rather than an error.
     *
     * The slot belongs to the FLOW, not the template: a flow that chooses
     * between variants at send time must not be able to claim twice.
     *
     * @param  array<string, mixed>  $context
     */
    public function claim(string $flowKey, string $dedupeKey, ?User $user, string $email, array $context = []): ?EmailSend
    {
        try {
            return EmailSend::create([
                'flow_key' => $flowKey,
                'dedupe_key' => $dedupeKey,
                'user_id' => $user?->id,
                'email' => $email,
                'status' => EmailSend::STATUS_SENT,
                'context' => $context === [] ? null : $context,
            ]);
        } catch (QueryException) {
            // Unique violation — another run (or another worker) already has it.
            return null;
        }
    }

    public function markSent(EmailSend $send, ?string $templateKey = null, ?int $brevoTemplateId = null, ?string $messageId = null): void
    {
        $send->forceFill([
            'status' => EmailSend::STATUS_SENT,
            'template_key' => $templateKey,
            'brevo_template_id' => $brevoTemplateId,
            'message_id' => $messageId,
            'error' => null,
        ])->save();
    }

    /**
     * Deliberate non-send (opted out, template disabled). The row stays so the
     * daily scan does not reconsider this recipient tomorrow.
     */
    public function markSuppressed(EmailSend $send, string $reason): void
    {
        $send->forceFill([
            'status' => EmailSend::STATUS_SUPPRESSED,
            'error' => $reason,
        ])->save();
    }

    /**
     * Release the slot after a failed send. Brevo failures are usually
     * transient (timeout, rate limit), and holding the dedupe key would retire
     * the email permanently on a single bad night.
     */
    public function release(EmailSend $send): void
    {
        $send->delete();
    }

    public function alreadySent(string $flowKey, string $dedupeKey): bool
    {
        return EmailSend::query()
            ->where('flow_key', $flowKey)
            ->where('dedupe_key', $dedupeKey)
            ->exists();
    }
}
