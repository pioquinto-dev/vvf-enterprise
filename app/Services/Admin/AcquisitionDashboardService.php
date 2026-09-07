<?php

namespace App\Services\Admin;

use App\Models\Subscription;
use App\Models\User;
use Carbon\CarbonImmutable;

class AcquisitionDashboardService
{
    private const TRIALING_STATUSES = ['trialing', 'trial'];

    private const PAID_STATUSES = ['active', 'paid'];

    /** @return array<string, mixed> */
    public function payload(int $days): array
    {
        [$start, $end] = $this->window($days);
        $signups = User::query()->whereBetween('created_at', [$start, $end])->count();
        $trials = Subscription::query()->whereIn('status', self::TRIALING_STATUSES)
            ->whereBetween('trial_started_at', [$start, $end])->whereHas('user')->count();

        return [
            'cohort' => app(AcquisitionCohortService::class)->payload($start, $end),
            'rangeLabel' => $start->format('M j').' - '.$end->format('M j, Y'),
            // The existing operations funnel remains event-window based.
            'funnel' => $this->funnel($start, $end, $signups, $trials),
        ];
    }

    /** @return array{0: CarbonImmutable, 1: CarbonImmutable} */
    private function window(int $days): array
    {
        $end = CarbonImmutable::now('UTC')->endOfDay();
        $start = $end->startOfDay()->subDays(max(0, $days - 1));

        return [$start, $end];
    }

    private function funnel(CarbonImmutable $start, CarbonImmutable $end, int $signups, int $trialing): array
    {
        $paid = Subscription::query()
            ->whereIn('status', self::PAID_STATUSES)
            ->where(function ($query) use ($start, $end): void {
                $query->whereBetween('trial_completed_at', [$start, $end])
                    ->orWhere(function ($directPaid) use ($start, $end): void {
                        $directPaid->whereNull('trial_started_at')->whereBetween('created_at', [$start, $end]);
                    });
            })
            ->count();

        $churned = Subscription::query()->whereBetween('canceled_at', [$start, $end])->count();

        return [
            'steps' => [
                ['key' => 'signups', 'label' => 'Sign ups', 'value' => $signups, 'percentage' => $signups > 0 ? 100 : 0, 'caption' => 'in selected range', 'tone' => 'teal'],
                ['key' => 'trialing', 'label' => 'Trialing', 'value' => $trialing, 'percentage' => $this->percentage($trialing, $signups), 'caption' => 'of sign ups', 'tone' => 'amber'],
                ['key' => 'paid', 'label' => 'Paid', 'value' => $paid, 'percentage' => $this->percentage($paid, $signups), 'caption' => 'of sign ups', 'tone' => 'blue'],
                ['key' => 'churned', 'label' => 'Churned', 'value' => $churned, 'percentage' => $this->percentage($churned, $trialing), 'caption' => 'churn rate', 'tone' => 'rose'],
            ],
        ];
    }

    private function percentage(int $value, int $total): float
    {
        return $total === 0 ? 0 : round(($value / $total) * 100, 1);
    }
}
