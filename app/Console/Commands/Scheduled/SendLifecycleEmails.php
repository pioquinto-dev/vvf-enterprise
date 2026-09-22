<?php

namespace App\Console\Commands\Scheduled;

use App\Services\Lifecycle\LifecycleDispatcher;
use Illuminate\Console\Command;

/**
 * The one scheduled sender for every delayed lifecycle email. Flows register
 * themselves in config/email_lifecycle.php; adding a flow should never mean
 * adding another cron entry.
 *
 * Scheduled hourly rather than daily, because each template has its own
 * wall-clock send slot (config/email_lifecycle.php). The dispatcher is what
 * decides which slots are open on any given run, so running this by hand at
 * any hour is safe and sends only what is actually due.
 */
class SendLifecycleEmails extends Command
{
    protected $signature = 'lifecycle:send-due-emails';

    protected $description = 'Send every lifecycle email that is due today, exactly once.';

    public function handle(LifecycleDispatcher $dispatcher): int
    {
        $result = $dispatcher->run();

        $this->info(sprintf(
            'Lifecycle emails — sent: %d, skipped: %d, failed: %d, waiting for their slot: %d.',
            $result['sent'],
            $result['skipped'],
            $result['failed'],
            $result['deferred'] ?? 0,
        ));

        // Named rather than counted: "nothing sent" with no explanation is the
        // confusing part of shipping the flows before the Brevo IDs exist.
        if (($result['unmapped'] ?? []) !== []) {
            $this->warn('No Brevo template ID yet, so these were held back: '
                .implode(', ', $result['unmapped']));
            $this->line('  Enter the IDs in Admin -> Email Templates to start sending them.');
        }

        return self::SUCCESS;
    }
}
