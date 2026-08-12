<?php

namespace App\Services\Admin;

use App\Repositories\Admin\AdminDashboardRepository;

class AdminDashboardService
{
    public function __construct(
        private readonly AdminDashboardRepository $dashboard,
        private readonly DashboardSnapshotService $snapshots,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function dashboardPayload(?string $range = null): array
    {
        $rangeKey = $this->snapshots->resolveRange($range);
        $days = DashboardSnapshotService::RANGES[$rangeKey];
        $stats = $this->snapshots->stats($days);

        return [
            'area' => 'admin',
            'screen' => 'dashboard',
            'sections' => $this->dashboard->sections(),
            'trend' => $this->snapshots->trend($days),
            'stats' => $stats['cards'],
            'range' => $rangeKey,
            'ranges' => array_keys(DashboardSnapshotService::RANGES),
            'snapshot' => [
                'capturedAt' => $stats['capturedAt'],
                'date' => $stats['snapshotDate'],
                'rangeStart' => $stats['rangeStart'],
                'rangeEnd' => $stats['rangeEnd'],
            ],
        ];
    }
}
