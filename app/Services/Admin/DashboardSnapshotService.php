<?php

namespace App\Services\Admin;

use App\Models\AdminDashboardSnapshot;
use App\Models\CustomKeywordSearch;
use App\Models\Subscription;
use App\Models\User;
use App\Models\ViralVideo;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;

class DashboardSnapshotService
{
    /**
     * Statuses that count as revenue. `past_due` is deliberately excluded —
     * it is a failed payment, not a paying customer.
     */
    private const PAID_STATUSES = ['active', 'paid'];

    private const TRIALING_STATUSES = ['trialing', 'trial'];

    public const TREND_DAYS = 30;

    /** Range key => number of days, in the order the UI renders them. */
    public const RANGES = [
        '1D' => 1,
        '3D' => 3,
        '7D' => 7,
        '30D' => 30,
        '6M' => 180,
        '1Y' => 365,
    ];

    public function resolveRange(?string $range): string
    {
        $key = strtoupper((string) $range);

        return array_key_exists($key, self::RANGES) ? $key : '30D';
    }

    /**
     * Capture (or overwrite) the snapshot row for a single UTC day.
     *
     * Subscription counts are point-in-time totals, so a snapshot for a past
     * date is only ever an approximation — the daily job is the source of
     * truth and a manual refresh only ever rewrites today.
     */
    public function capture(?CarbonImmutable $date = null): AdminDashboardSnapshot
    {
        $day = ($date ?? CarbonImmutable::now('UTC'))->startOfDay();

        return AdminDashboardSnapshot::updateOrCreate(
            ['snapshot_date' => $day->toDateString()],
            [
                'paid_subscriptions' => Subscription::whereIn('status', self::PAID_STATUSES)->count(),
                'trialing_subscriptions' => Subscription::whereIn('status', self::TRIALING_STATUSES)->count(),
                'signups' => User::whereBetween('created_at', [$day, $day->endOfDay()])->count(),
                'viral_videos' => ViralVideo::count(),
                'custom_keyword_searches' => CustomKeywordSearch::count(),
                'captured_at' => CarbonImmutable::now('UTC'),
            ],
        );
    }

    /**
     * The last N days of snapshots, oldest first, with missing days filled in
     * as zeroes so the chart's x-axis stays evenly spaced.
     *
     * @return array<int, array<string, mixed>>
     */
    public function trend(int $days = self::TREND_DAYS): array
    {
        $today = CarbonImmutable::now('UTC')->startOfDay();
        $start = $today->subDays($days - 1);

        $rows = AdminDashboardSnapshot::query()
            ->whereDate('snapshot_date', '>=', $start->toDateString())
            ->orderBy('snapshot_date')
            ->get()
            ->keyBy(fn (AdminDashboardSnapshot $row) => $row->snapshot_date->toDateString());

        return Collection::times($days, function (int $offset) use ($start, $rows): array {
            $date = $start->addDays($offset - 1);
            $row = $rows->get($date->toDateString());

            return [
                'date' => $date->toDateString(),
                'label' => $date->format('M j'),
                'paid' => (int) ($row?->paid_subscriptions ?? 0),
                'trialing' => (int) ($row?->trialing_subscriptions ?? 0),
                'signups' => (int) ($row?->signups ?? 0),
            ];
        })->all();
    }

    /**
     * Mini-stat totals. These read live rather than from the snapshot so the
     * cards are never stale, with the snapshot supplying the comparison.
     *
     * @return array<string, mixed>
     */
    public function stats(int $days = self::TREND_DAYS): array
    {
        $latest = AdminDashboardSnapshot::query()->orderByDesc('snapshot_date')->first();
        $previous = AdminDashboardSnapshot::query()
            ->when($latest, fn ($query) => $query->whereDate('snapshot_date', '<', $latest->snapshot_date->toDateString()))
            ->orderByDesc('snapshot_date')
            ->first();

        $viralVideos = ViralVideo::count();
        $searches = CustomKeywordSearch::count();

        $start = CarbonImmutable::now('UTC')->startOfDay()->subDays(max(0, $days - 1));
        $signupsInRange = AdminDashboardSnapshot::query()
            ->whereDate('snapshot_date', '>=', $start->toDateString())
            ->sum('signups');

        return [
            'capturedAt' => $latest?->captured_at?->toIso8601String(),
            'snapshotDate' => $latest?->snapshot_date?->toDateString(),
            'rangeStart' => $start->toDateString(),
            'rangeEnd' => CarbonImmutable::now('UTC')->toDateString(),
            'cards' => [
                [
                    'key' => 'viral_videos',
                    'label' => 'Viral videos',
                    'value' => $viralVideos,
                    'delta' => $previous ? $viralVideos - $previous->viral_videos : null,
                    'caption' => 'Total in library',
                ],
                [
                    'key' => 'custom_keyword_searches',
                    'label' => 'Keyword searches',
                    'value' => $searches,
                    'delta' => $previous ? $searches - $previous->custom_keyword_searches : null,
                    'caption' => 'Excluding deleted',
                ],
                [
                    'key' => 'active_paid',
                    'label' => 'Active paid',
                    'value' => Subscription::whereIn('status', self::PAID_STATUSES)->count(),
                    'delta' => null,
                    'caption' => 'Live count',
                ],
                [
                    'key' => 'trialing',
                    'label' => 'Trialing',
                    'value' => Subscription::whereIn('status', self::TRIALING_STATUSES)->count(),
                    'delta' => null,
                    'caption' => 'Live count',
                ],
                [
                    'key' => 'signups',
                    'label' => 'Sign ups',
                    'value' => (int) $signupsInRange,
                    'delta' => null,
                    'caption' => 'This range',
                ],
            ],
        ];
    }
}
