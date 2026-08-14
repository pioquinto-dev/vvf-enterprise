<?php

use App\Models\User;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        User::withTrashed()
            ->chunkById(100, function ($users): void {
                foreach ($users as $user) {
                    $preferences = is_array($user->preferences) ? $user->preferences : [];

                    $user->forceFill([
                        'preferences' => array_replace_recursive([
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
                        ], $preferences),
                    ])->save();
                }
            });
    }

    public function down(): void
    {
        User::withTrashed()
            ->chunkById(100, function ($users): void {
                foreach ($users as $user) {
                    $preferences = is_array($user->preferences) ? $user->preferences : [];

                    unset($preferences['appearance']);

                    $user->forceFill([
                        'preferences' => $preferences,
                    ])->save();
                }
            });
    }
};
