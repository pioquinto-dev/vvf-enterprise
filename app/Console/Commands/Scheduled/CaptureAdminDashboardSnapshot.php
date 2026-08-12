<?php

namespace App\Console\Commands\Scheduled;

use App\Services\Admin\DashboardSnapshotService;
use Illuminate\Console\Command;

class CaptureAdminDashboardSnapshot extends Command
{
    protected $signature = 'admin:capture-dashboard-snapshot';

    protected $description = 'Capture today\'s admin dashboard snapshot (subscriptions, signups, content counts).';

    public function handle(DashboardSnapshotService $snapshots): int
    {
        $snapshot = $snapshots->capture();

        $this->info(sprintf(
            'Snapshot %s captured: %d paid, %d trialing, %d signups, %d videos, %d searches.',
            $snapshot->snapshot_date->toDateString(),
            $snapshot->paid_subscriptions,
            $snapshot->trialing_subscriptions,
            $snapshot->signups,
            $snapshot->viral_videos,
            $snapshot->custom_keyword_searches,
        ));

        return self::SUCCESS;
    }
}
