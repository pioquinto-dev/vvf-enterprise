<?php

namespace App\Services\Lifecycle;

use App\Services\Brevo\EmailSendLedger;
use App\Support\AppEventLogger;
use App\Support\EmailTemplateRegistry;
use Carbon\CarbonImmutable;
use Throwable;

/**
 * Runs every registered flow and sends what each one says is due, exactly once.
 *
 * The claim is taken before the send, not after: if the process dies
 * mid-send the slot stays taken and the email is not repeated. The cost of
 * that choice is a possible missed email after a crash, which is the right
 * trade for lifecycle mail — a duplicate winback email is worse than a missing
 * one.
 *
 * Two gates run before the claim, and both deliberately leave no trace:
 *
 *   the send window — this command runs hourly, and each template has its own
 *   wall-clock slot from config/email_lifecycle.php. A candidate outside its
 *   window is left alone so a later run today can send it.
 *
 *   the Brevo mapping — a template whose Brevo ID has not been entered in
 *   Admin -> Email Templates cannot render, so it is skipped rather than
 *   claimed and failed. Claiming it would retire that recipient's slot
 *   permanently, and the first run after the ID is entered would find nothing
 *   left to send.
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
     * @return array{sent: int, skipped: int, failed: int, deferred: int, unmapped: array<int, string>}
     */
    public function run(): array
    {
        $sent = 0;
        $skipped = 0;
        $failed = 0;
        $deferred = 0;
        $unmapped = [];
        $now = CarbonImmutable::now();

        foreach ($this->flows as $flow) {
            foreach ($flow->due() as $candidate) {
                $scheduleKey = $candidate->templateKey ?? $candidate->flowKey;

                // Outside today's slot for this template. Not a skip: no row is
                // written, so a later run in the catch-up window still sends it.
                if (! LifecycleSchedule::slotIsOpen($scheduleKey, $now)) {
                    $deferred++;

                    continue;
                }

                // No Brevo template ID yet. Same reasoning — leave the slot
                // free so the sequence resumes once the ID is entered.
                if (! EmailTemplateRegistry::isSendable($scheduleKey)) {
                    $deferred++;
                    $unmapped[$scheduleKey] = true;

                    continue;
                }

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

        if ($unmapped !== []) {
            AppEventLogger::result('lifecycle.send.unmapped_templates', [
                'templates' => array_keys($unmapped),
            ]);
        }

        return [
            'sent' => $sent,
            'skipped' => $skipped,
            'failed' => $failed,
            'deferred' => $deferred,
            'unmapped' => array_keys($unmapped),
        ];
    }
}
