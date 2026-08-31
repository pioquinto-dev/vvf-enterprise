<?php

namespace App\Console\Commands\OneTime;

use App\Models\User;
use Illuminate\Console\Command;

class BackfillUserPreferences extends Command
{
    protected $signature = 'users:backfill-preferences';

    protected $description = 'Backfill default notification and appearance preferences for all existing users.';

    public function handle(): int
    {
        $updated = 0;

        User::withTrashed()
            ->chunkById(100, function ($users) use (&$updated): void {
                foreach ($users as $user) {
                    $preferences = is_array($user->preferences) ? $user->preferences : [];

                    $merged = array_replace_recursive([
                        'notifications' => [
                            'search_finished' => true,
                            'virality_alerts' => true,
                            'weekly_viral_digest' => false,
                        ],
                        'appearance' => [
                            'disable_animations' => false,
                            'compact_rows' => false,
                            'autoplay_previews' => true,
                        ],
                    ], $preferences);

                    if ($user->preferences === $merged) {
                        continue;
                    }

                    $user->forceFill([
                        'preferences' => $merged,
                    ])->save();

                    $updated++;
                }
            });

        $this->info(sprintf('Backfilled preferences for %d user(s).', $updated));

        return self::SUCCESS;
    }
}
