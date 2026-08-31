<?php

namespace App\Services\Admin;

use App\Models\ManagedCouponProgram;
use App\Models\ManagedCouponRedemption;
use App\Repositories\Admin\AdminDashboardRepository;

class AdminDashboardService
{
    public function __construct(
        private readonly AdminDashboardRepository $dashboard,
        private readonly DashboardSnapshotService $snapshots,
        private readonly AcquisitionDashboardService $acquisition,
        private readonly UserActivityService $activity,
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
            'acquisition' => $this->acquisition->payload($days),
            'activity' => $this->activity->recentPayload(),
            'coupons' => $this->couponPayload(),
        ];
    }

    /**
     * Per-program redemption usage, low/full-slot alerts, and the most recent
     * redemptions, for the admin dashboard coupon widget.
     *
     * @return array<string, mixed>
     */
    private function couponPayload(): array
    {
        $programs = ManagedCouponProgram::query()->withCount(['redemptions as redeemed_count' => function ($query): void {
            $query->whereNotNull('redeemed_at');
        }])->orderBy('code')->get();

        $programRows = [];
        $alerts = [];

        foreach ($programs as $program) {
            $redeemed = (int) $program->redeemed_count;
            $cap = $program->max_redemptions;
            $remaining = $cap === null ? null : max(0, $cap - $redeemed);
            $full = $cap !== null && $remaining === 0;
            $low = ! $full && $cap !== null && $cap > 0 && $remaining <= (int) ceil($cap * 0.2);

            $programRows[] = [
                'code' => $program->code,
                'name' => $program->name,
                'active' => (bool) $program->is_active,
                'redeemed' => $redeemed,
                'max' => $cap,
                'remaining' => $remaining,
                'full' => $full,
                'low' => $low,
            ];

            if ($full) {
                $alerts[] = ['program' => $program->code, 'type' => 'full', 'message' => "{$program->code} has used all {$cap} slots."];
            } elseif ($low) {
                $alerts[] = ['program' => $program->code, 'type' => 'low', 'message' => "{$program->code} is running low: {$remaining} of {$cap} slots left."];
            }
        }

        $recent = ManagedCouponRedemption::query()
            ->with(['program:id,code', 'user:id,name'])
            ->whereNotNull('redeemed_at')
            ->latest('redeemed_at')
            ->limit(8)
            ->get()
            ->map(fn (ManagedCouponRedemption $redemption): array => [
                'name' => $redemption->user?->name ?: $redemption->email,
                'email' => $redemption->email,
                'program' => $redemption->program?->code ?? '-',
                'status' => $redemption->subscription_status ?: '-',
                'redeemedAt' => $redemption->redeemed_at?->toIso8601String(),
            ])
            ->all();

        return [
            'programs' => $programRows,
            'alerts' => $alerts,
            'recent' => $recent,
        ];
    }
}
