<?php

namespace App\Console\Commands\Scheduled;

use App\Services\Lifecycle\LifecycleDispatcher;
use Illuminate\Console\Command;

/**
 * The one scheduled sender for every delayed lifecycle email. Flows register
 * themselves in config/email_lifecycle.php; adding a flow should never mean
 * adding another cron entry.
 */
class SendLifecycleEmails extends Command
{
    protected $signature = 'lifecycle:send-due-emails';

    protected $description = 'Send every lifecycle email that is due today, exactly once.';

    public function handle(LifecycleDispatcher $dispatcher): int
    {
        $result = $dispatcher->run();

        $this->info(sprintf(
            'Lifecycle emails — sent: %d, skipped: %d, failed: %d.',
            $result['sent'],
            $result['skipped'],
            $result['failed'],
        ));

        return self::SUCCESS;
    }
}
