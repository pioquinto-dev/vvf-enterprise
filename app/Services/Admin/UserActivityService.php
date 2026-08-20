<?php

namespace App\Services\Admin;

use App\Models\User;
use App\Models\UserActivity;
use Illuminate\Http\Request;

class UserActivityService
{
    public function record(User $user, string $category, string $event, string $summary, array $metadata = [], ?string $dedupeKey = null): void
    {
        $data = ['user_id' => $user->id, 'user_name' => $user->name ?: 'Unnamed user', 'user_email' => $user->email, 'category' => $category, 'event' => $event, 'summary' => $summary, 'metadata' => $metadata];
        $dedupeKey === null ? UserActivity::query()->create($data) : UserActivity::query()->firstOrCreate(['dedupe_key' => $dedupeKey], $data);
    }

    /** @return array<string, mixed> */
    public function recentPayload(int $limit = 5): array
    {
        return ['rows' => $this->mapRows(UserActivity::query()->latest('created_at')->limit($limit)->get())];
    }

    /** @return array<string, mixed> */
    public function activityLogPayload(Request $request): array
    {
        $range = strtoupper((string) $request->query('range', '30D'));
        $rangeDays = ['7D' => 7, '30D' => 30, '6M' => 180, '1Y' => 365];
        $range = array_key_exists($range, $rangeDays) ? $range : '30D';
        $categories = ['sign_up', 'regular_trial', 'affiliate_trial', 'paid', 'engagement', 'cancelled'];
        $category = (string) $request->query('category', 'all');
        $category = in_array($category, $categories, true) ? $category : 'all';
        $event = trim((string) $request->query('event', 'all'));

        $query = UserActivity::query()
            ->where('created_at', '>=', now()->subDays($rangeDays[$range]))
            ->when($category !== 'all', fn ($builder) => $builder->where('category', $category))
            ->when($event !== '' && $event !== 'all', fn ($builder) => $builder->where('event', $event))
            ->latest('created_at');
        $activities = $query->paginate(50)->withQueryString();

        return [
            'rows' => $this->mapRows($activities->getCollection()),
            'filters' => ['range' => $range, 'category' => $category, 'event' => $event ?: 'all'],
            'events' => UserActivity::query()->distinct()->orderBy('event')->pluck('event')->values()->all(),
            'pagination' => [
                'currentPage' => $activities->currentPage(),
                'lastPage' => $activities->lastPage(),
                'total' => $activities->total(),
            ],
        ];
    }

    /** @return list<array<string, mixed>> */
    private function mapRows(iterable $activities): array
    {
        return collect($activities)->map(fn (UserActivity $activity): array => [
            'id' => $activity->id,
            'name' => $activity->user_name,
            'email' => $activity->user_email,
            'category' => $activity->category,
            'event' => $activity->event,
            'summary' => $activity->summary,
            'date' => $activity->created_at?->toIso8601String(),
        ])->values()->all();
    }
}
