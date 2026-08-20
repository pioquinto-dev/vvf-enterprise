<?php

namespace App\Services\Admin;

use App\Models\Subscription;
use App\Models\User;
use App\Models\UtmAttribution;
use App\Models\UtmPageVisit;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;

class AcquisitionDashboardService
{
    private const TRIALING_STATUSES = ['trialing', 'trial'];

    private const PAID_STATUSES = ['active', 'paid'];

    /** @return array<string, mixed> */
    public function payload(int $days): array
    {
        [$start, $end] = $this->window($days);
        $visits = $this->visits($start, $end);
        $signups = $this->signups($start, $end);
        $trials = $this->trials($start, $end);

        return [
            'rangeLabel' => $start->format('M j').' - '.$end->format('M j, Y'),
            'metrics' => [
                $this->metric('page_views', 'Page views', $visits),
                $this->metric('sign_ups', 'Sign ups', $signups),
                $this->metric('trial_cc', 'Trial - CC', $trials),
                ['key' => 'trial_no_cc', 'label' => 'Trial - no CC', 'value' => null, 'locked' => true, 'caption' => 'Not enabled'],
            ],
            'details' => [
                'page_views' => $this->details($visits),
                'sign_ups' => $this->details($signups),
                'trial_cc' => $this->details($trials),
            ],
            'funnel' => $this->funnel($start, $end, $signups->count(), $trials->count()),
        ];
    }

    /** @return array{0: CarbonImmutable, 1: CarbonImmutable} */
    private function window(int $days): array
    {
        $end = CarbonImmutable::now('UTC')->endOfDay();
        $start = $end->startOfDay()->subDays(max(0, $days - 1));

        return [$start, $end];
    }

    private function visits(CarbonImmutable $start, CarbonImmutable $end): Collection
    {
        return UtmPageVisit::query()->whereBetween('created_at', [$start, $end])->latest('created_at')->get()
            ->map(fn (UtmPageVisit $visit): array => [
                'id' => 'visit-'.$visit->id,
                'name' => 'Anonymous visitor',
                'email' => 'Acquisition visit',
                'source' => $this->source($visit->utm_source),
                'date' => $visit->created_at?->toIso8601String(),
                'meta' => filled($visit->utm_medium) ? $visit->utm_medium : (filled($visit->referrer_host) ? "Referral: {$visit->referrer_host}" : 'Direct visit'),
            ]);
    }

    private function signups(CarbonImmutable $start, CarbonImmutable $end): Collection
    {
        return User::query()->whereBetween('created_at', [$start, $end])
            ->with(['utmAttributions' => fn ($query) => $query->whereNull('subscription_id')->latest('id')])
            ->latest('created_at')->get()
            ->map(function (User $user): array {
                return $this->userRow($user, $user->utmAttributions->first(), $user->created_at, $user->current_plan_slug ?? 'Free');
            });
    }

    private function trials(CarbonImmutable $start, CarbonImmutable $end): Collection
    {
        return Subscription::query()->whereIn('status', self::TRIALING_STATUSES)->whereBetween('trial_started_at', [$start, $end])
            ->with(['user.utmAttributions' => fn ($query) => $query->whereNull('subscription_id')->latest('id'), 'plan:id,name'])
            ->latest('trial_started_at')->get()->filter(fn (Subscription $subscription) => $subscription->user !== null)
            ->map(function (Subscription $subscription): array {
                return $this->userRow(
                    $subscription->user,
                    $subscription->user->utmAttributions->first(),
                    $subscription->trial_started_at,
                    $subscription->plan?->name ?? 'Trial',
                );
            })->values();
    }

    /** @return array<string, mixed> */
    private function userRow(User $user, ?UtmAttribution $attribution, mixed $date, string $meta): array
    {
        return [
            'id' => 'user-'.$user->id,
            'name' => $user->name ?: 'Unnamed user',
            'email' => $user->email,
            'source' => $this->source($attribution?->utm_source),
            'date' => $date?->toIso8601String(),
            'meta' => $meta,
        ];
    }

    /** @param Collection<int, array<string, mixed>> $rows @return array<string, mixed> */
    private function metric(string $key, string $label, Collection $rows): array
    {
        return ['key' => $key, 'label' => $label, 'value' => $rows->count(), 'locked' => false, 'caption' => $key === 'page_views' ? 'Unique sessions' : 'This range'];
    }

    /** @param Collection<int, array<string, mixed>> $rows @return array<string, mixed> */
    private function details(Collection $rows): array
    {
        $total = $rows->count();
        $sources = $rows->groupBy('source')->map(fn (Collection $group, string $source): array => [
            'source' => $source,
            'count' => $group->count(),
            'percentage' => $total === 0 ? 0 : (int) round(($group->count() / $total) * 100),
        ])->sortByDesc('count')->values()->all();

        return ['total' => $total, 'sources' => $sources, 'rows' => $rows->take(50)->values()->all()];
    }

    private function source(?string $source): string
    {
        $normalized = strtolower(trim((string) $source));

        return $normalized === '' ? 'direct' : $normalized;
    }

    /** @return array<string, mixed> */
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
