<?php

namespace App\Services\Lifecycle;

use App\Services\Brevo\EmailSendLedger;
use App\Support\AppEventLogger;
use Throwable;

/**
 * Runs every registered flow and sends what each one says is due, exactly once.
 *
 * The claim is taken before the send, not after: if the process dies
 * mid-send the slot stays taken and the email is not repeated. The cost of
 * that choice is a possible missed email after a crash, which is the right
 * trade for lifecycle mail — a duplicate winback email is worse than a missing
 * one.
 */
class LifecycleDispatcher
{
    /**
     * @param  iterable<LifecycleFlow>  $flows
     */
    public function __construct(
        private readonly EmailSendLedger $ledger,
        private readonly iterable $flows,
    ) {}

    /**
     * @return array{sent: int, skipped: int, failed: int}
     */
    public function run(): array
    {
        $sent = 0;
        $skipped = 0;
        $failed = 0;

        foreach ($this->flows as $flow) {
            foreach ($flow->due() as $candidate) {
                $claim = $this->ledger->claim(
                    $candidate->flowKey,
                    $candidate->dedupeKey,
                    $candidate->user,
                    $candidate->user->email,
                    $candidate->context,
                );

                if ($claim === null) {
                    $skipped++;

                    continue;
                }

                try {
                    $delivered = ($candidate->send)();
                } catch (Throwable $error) {
                    $this->ledger->release($claim);
                    $failed++;

                    AppEventLogger::error('lifecycle.send.failed', $error, [
                        'flow' => $flow->name(),
                        'flow_key' => $candidate->flowKey,
                        'template_key' => $candidate->templateKey,
                        'dedupe_key' => $candidate->dedupeKey,
                        'user_id' => $candidate->user->id,
                    ]);

                    continue;
                }

                if ($delivered) {
                    $this->ledger->markSent($claim, $candidate->templateKey);
                    $sent++;

                    continue;
                }

                // A false return is a deliberate non-send (suppressed by the
                // unsubscribe list, or the template is switched off). Keep the
                // row so tomorrow's run does not reconsider this recipient.
                $this->ledger->markSuppressed($claim, 'Send declined by the email service.');
                $skipped++;
            }
        }

        return ['sent' => $sent, 'skipped' => $skipped, 'failed' => $failed];
    }
}
