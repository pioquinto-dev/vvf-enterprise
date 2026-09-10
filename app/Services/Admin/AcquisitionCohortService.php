<?php

namespace App\Services\Admin;

use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class AcquisitionCohortService
{
    public function payload(CarbonImmutable $start, CarbonImmutable $end): array
    {
        $asOf = CarbonImmutable::now('UTC');
        $users = User::withTrashed()->whereBetween('created_at', [$start, $end])
            ->with(['utmAttributions' => fn ($q) => $q->whereNull('subscription_id')->orderBy('id')])
            ->orderByDesc('created_at')->orderByDesc('id')->get();
        $ids = $users->modelKeys();
        $subscriptions = DB::table('subscriptions')->whereIn('user_id', $ids)->get()->groupBy('user_id');
        $completed = DB::table('custom_keyword_search_runs as runs')
            ->join('custom_keyword_searches as searches', 'searches.id', '=', 'runs.custom_keyword_search_id')
            ->whereIn('searches.user_id', $ids)->where('runs.status', 'done')
            ->where('runs.completed_at', '<=', $asOf)->pluck('searches.user_id')->flip();
        $paid = DB::table('user_activities')->whereIn('user_id', $ids)
            ->where('category', 'subscription')->whereIn('event', ['subscription_paid', 'subscription_reactivated', 'payment_recovered'])
            ->where('created_at', '<=', $asOf)->pluck('user_id')->flip();
        $programs = DB::table('managed_coupon_redemptions')->whereIn('user_id', $ids)
            ->where('redeemed_at', '<=', $asOf)->pluck('user_id')->flip();

        $rows = $users->map(function ($user) use ($subscriptions, $completed, $paid, $programs, $asOf) {
            $attribution = $user->utmAttributions->first();
            $source = strtolower(trim((string) $attribution?->utm_source));
            $medium = strtolower(trim((string) $attribution?->utm_medium));
            $owned = $subscriptions->get($user->id, collect());

            return [
                'id' => $user->id, 'name' => $user->name, 'email' => $user->email,
                'signup_at' => $user->created_at->toIso8601String(),
                'source' => $source === '' ? 'Source not recorded' : $source,
                'medium' => $medium === '' ? 'Medium not recorded' : $medium,
                'campaign' => trim((string) $attribution?->utm_campaign) ?: 'No campaign recorded',
                'signups' => true,
                'completed' => $completed->has($user->id),
                'trials' => $owned->contains(fn ($s) => $s->trial_started_at !== null && $s->trial_started_at <= $asOf->toDateTimeString()),
                // Trial completion alone is not proof of payment. Historical paid
                // events survive cancellation; current paid status is a legacy fallback.
                'paid' => $paid->has($user->id) || $owned->contains(fn ($s) => in_array($s->status, ['active', 'paid'], true) && $s->created_at <= $asOf->toDateTimeString()),
                'program' => $programs->has($user->id),
            ];
        });

        return [
            'asOf' => $asOf->toIso8601String(),
            'rows' => $rows->values()->all(),
            'groups' => $rows->groupBy(fn ($row) => json_encode([$row['source'], $row['medium']]))
                ->map(fn ($group, $key) => [
                    'key' => $key, 'source' => $group->first()['source'], 'medium' => $group->first()['medium'],
                    ...$this->counts($group),
                    'campaigns' => $group->groupBy('campaign')->map(fn ($campaign, $name) => [
                        'campaign' => $name, ...$this->counts($campaign),
                    ])->values()->all(),
                ])->values()->all(),
            'totals' => $this->counts($rows),
        ];
    }

    private function counts(Collection $rows): array
    {
        $counts = [];
        foreach (['signups', 'completed', 'trials', 'paid'] as $metric) {
            $counts[$metric] = $rows->where($metric, true)->count();
        }
        $counts['rate'] = $counts['signups'] === 0 ? 0 : round(100 * $counts['paid'] / $counts['signups'], 1);

        return $counts;
    }
}
