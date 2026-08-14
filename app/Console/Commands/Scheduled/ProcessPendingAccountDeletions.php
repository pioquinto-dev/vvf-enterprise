<?php

namespace App\Console\Commands\Scheduled;

use App\Models\Subscription;
use App\Models\User;
use Illuminate\Console\Command;

class ProcessPendingAccountDeletions extends Command
{
    protected $signature = 'users:process-pending-account-deletions';

    protected $description = 'Soft delete users whose account deletion grace period has expired.';

    public function handle(): int
    {
        $deleted = 0;
        $skipped = 0;

        User::query()
            ->whereNull('deleted_at')
            ->whereNotNull('deletion_scheduled_for')
            ->where('deletion_scheduled_for', '<=', now())
            ->chunkById(100, function ($users) use (&$deleted, &$skipped): void {
                foreach ($users as $user) {
                    $hasActiveSubscription = Subscription::query()
                        ->where('user_id', $user->id)
                        ->whereIn('status', ['active', 'paid', 'trialing', 'trial'])
                        ->exists();

                    if ($hasActiveSubscription) {
                        $user->forceFill([
                            'deletion_requested_at' => null,
                            'deletion_scheduled_for' => null,
                        ])->save();

                        $skipped++;

                        continue;
                    }

                    $user->forceFill([
                        'deletion_requested_at' => null,
                        'deletion_scheduled_for' => null,
                    ])->save();

                    $user->delete();

                    $deleted++;
                }
            });

        $this->info(sprintf(
            'Processed pending account deletions: %d deleted, %d skipped because a subscription became active.',
            $deleted,
            $skipped,
        ));

        return self::SUCCESS;
    }
}
