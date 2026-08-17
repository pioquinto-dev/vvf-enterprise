<?php

namespace App\Console\Commands\Debug;

use App\Models\Subscription;
use App\Models\User;
use App\Services\Billing\BillingService;
use Illuminate\Console\Command;

class BackfillVideoAnalysisUsage extends Command
{
    protected $signature = 'billing:backfill-video-analysis-usage
        {user? : Optional user ID or email}
        {--dry-run : Show changes without saving them}';

    protected $description = 'Backfill subscription video-analysis usage from completed analyses.';

    public function handle(BillingService $billing): int
    {
        $userArg = $this->argument('user');
        $dryRun = (bool) $this->option('dry-run');

        $users = $this->usersToProcess($userArg);

        if ($users->isEmpty()) {
            $this->warn('No matching users found.');

            return self::SUCCESS;
        }

        $rows = [];
        $updated = 0;

        foreach ($users as $user) {
            $subscription = Subscription::query()
                ->where('user_id', $user->id)
                ->whereNull('deleted_at')
                ->orderByRaw("case when status = 'active' then 0 when status = 'trialing' then 1 when status = 'pending' then 2 else 3 end")
                ->orderByDesc('current_period_ends_at')
                ->first();

            if ($subscription === null) {
                $rows[] = [
                    $user->id,
                    $user->email,
                    '(none)',
                    '(none)',
                    '(none)',
                    'skipped: no subscription',
                ];

                continue;
            }

            $before = (int) data_get($subscription->metadata, 'subscription.video_analysis.used', 0);
            $after = $billing->videoAnalysisUsed($user);

            if (! $dryRun && $before !== $after) {
                $metadata = (array) $subscription->metadata;
                data_set($metadata, 'subscription.video_analysis.used', $after);

                $subscription->forceFill([
                    'metadata' => $metadata,
                ])->save();

                $updated++;
            }

            $rows[] = [
                $user->id,
                $user->email,
                $subscription->id,
                (string) $before,
                (string) $after,
                $before === $after ? 'unchanged' : ($dryRun ? 'would update' : 'updated'),
            ];
        }

        $this->table(
            ['User ID', 'Email', 'Subscription ID', 'Before', 'Derived', 'Action'],
            $rows
        );

        if ($dryRun) {
            $this->info('Dry run only. No rows were updated.');
        } else {
            $this->info("Updated {$updated} subscription(s).");
        }

        return self::SUCCESS;
    }

    private function usersToProcess(mixed $userArg)
    {
        if ($userArg === null || $userArg === '') {
            return User::query()
                ->whereNotNull('current_plan_slug')
                ->orderBy('id')
                ->get();
        }

        $query = User::query();
        $value = (string) $userArg;

        if (filter_var($value, FILTER_VALIDATE_EMAIL)) {
            return $query->where('email', $value)->get();
        }

        if (ctype_digit($value)) {
            return $query->where('id', $value)->get();
        }

        return $query->where('email', $value)->get();
    }
}
