<?php

namespace App\Repositories\Admin\Listings;

use App\Models\CustomKeywordSearch;
use App\Models\IndexedKeyword;
use App\Models\Inquiry;
use App\Models\PricingPlan;
use App\Models\Subscription;
use App\Models\User;
use App\Models\ViralVideo;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

/**
 * Read side of the admin listings.
 *
 * Every resource except `admin-users` maps to a real table. Admin access is
 * config-driven (a root email, no table), so that one listing stays a
 * read-only projection of config and exposes no row actions.
 */
class AdminListingRepository
{
    public function title(string $resource): string
    {
        return match ($resource) {
            'viral-videos' => 'Viral Videos',
            'searches' => 'Searches',
            'inquiries' => 'Inquiries',
            'plans' => 'Plans',
            'subscription' => 'Subscription',
            'users' => 'Users',
            'admin-users' => 'Admin Users',
            'keyword-index' => 'Keyword Index',
            default => 'Admin',
        };
    }

    /**
     * @return array<int, string>
     */
    public function supportedFilters(string $resource): array
    {
        return match ($resource) {
            'viral-videos' => ['search', 'status', 'date'],
            'searches' => ['search', 'type', 'owner', 'date'],
            'inquiries' => ['search', 'category', 'date'],
            'plans' => ['search', 'status'],
            'subscription' => ['search', 'status', 'plan'],
            'users' => ['search', 'status', 'plan'],
            'admin-users' => ['search', 'role', 'status'],
            'keyword-index' => ['search', 'type', 'status'],
            default => ['search'],
        };
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function filterDefinitions(string $resource): array
    {
        return match ($resource) {
            'viral-videos' => [
                ['name' => 'status', 'label' => 'Status', 'options' => ['visible', 'archived', 'deleted']],
                ['name' => 'date', 'label' => 'Range', 'options' => ['today', '7d', '30d', 'custom']],
            ],
            'searches' => [
                ['name' => 'type', 'label' => 'Type', 'options' => ['brand', 'product']],
                ['name' => 'owner', 'label' => 'Owner', 'options' => $this->ownerOptions()],
                ['name' => 'date', 'label' => 'Range', 'options' => ['today', '7d', '30d', 'custom']],
            ],
            'inquiries' => [
                ['name' => 'category', 'label' => 'Category', 'options' => ['general', 'account', 'billing', 'feature-request', 'bug-report']],
                ['name' => 'date', 'label' => 'Range', 'options' => ['today', '7d', '30d', 'custom']],
            ],
            'plans' => [
                ['name' => 'status', 'label' => 'Status', 'options' => ['active', 'inactive', 'archived', 'deleted']],
            ],
            'subscription' => [
                ['name' => 'status', 'label' => 'Status', 'options' => ['active', 'trialing', 'past_due', 'canceled', 'deleted']],
            ],
            'users' => [
                ['name' => 'status', 'label' => 'Status', 'options' => ['active', 'deleted']],
            ],
            'admin-users' => [
                ['name' => 'role', 'label' => 'Role', 'options' => ['root']],
            ],
            'keyword-index' => [
                ['name' => 'type', 'label' => 'Type', 'options' => ['brand', 'product']],
                ['name' => 'status', 'label' => 'Status', 'options' => ['live', 'archived', 'deleted']],
            ],
            default => [],
        };
    }

    /**
     * @return array<int, array<string, string>>
     */
    public function columns(string $resource): array
    {
        return match ($resource) {
            'viral-videos' => [
                ['key' => 'video', 'label' => 'Video'],
                ['key' => 'source', 'label' => 'Source'],
                ['key' => 'status', 'label' => 'Status'],
                ['key' => 'published_at', 'label' => 'Published'],
            ],
            'searches' => [
                ['key' => 'search', 'label' => 'Search'],
                ['key' => 'type', 'label' => 'Type'],
                ['key' => 'owner', 'label' => 'Owner'],
                ['key' => 'status', 'label' => 'Status'],
            ],
            'inquiries' => [
                ['key' => 'contact', 'label' => 'Contact'],
                ['key' => 'category', 'label' => 'Category'],
                ['key' => 'subject', 'label' => 'Subject'],
                ['key' => 'message', 'label' => 'Message'],
                ['key' => 'received_at', 'label' => 'Received'],
            ],
            'plans' => [
                ['key' => 'plan', 'label' => 'Plan'],
                ['key' => 'price', 'label' => 'Price'],
                ['key' => 'status', 'label' => 'Status'],
                ['key' => 'updated_at', 'label' => 'Updated'],
            ],
            'subscription' => [
                ['key' => 'subscriber', 'label' => 'Subscriber'],
                ['key' => 'plan', 'label' => 'Plan'],
                ['key' => 'credits', 'label' => 'Credits'],
                ['key' => 'status', 'label' => 'Status'],
                ['key' => 'renewal', 'label' => 'Renewal'],
            ],
            'users' => [
                ['key' => 'user', 'label' => 'User'],
                ['key' => 'email', 'label' => 'Email'],
                ['key' => 'plan', 'label' => 'Plan'],
                ['key' => 'credits', 'label' => 'Credits'],
                ['key' => 'status', 'label' => 'Status'],
                ['key' => 'joined_at', 'label' => 'Joined'],
            ],
            'admin-users' => [
                ['key' => 'admin', 'label' => 'Admin'],
                ['key' => 'role', 'label' => 'Role'],
                ['key' => 'status', 'label' => 'Status'],
            ],
            'keyword-index' => [
                ['key' => 'keyword', 'label' => 'Keyword'],
                ['key' => 'type', 'label' => 'Type'],
                ['key' => 'sector', 'label' => 'Sector'],
                ['key' => 'source', 'label' => 'Source'],
                ['key' => 'status', 'label' => 'Status'],
            ],
            default => [],
        };
    }

    /**
     * The base query for a resource, including trashed rows - the listing has a
     * "deleted" filter, and an admin needs to see what they removed in order to
     * restore it.
     */
    public function query(string $resource): ?Builder
    {
        return match ($resource) {
            'viral-videos' => ViralVideo::query()->withTrashed(),
            'searches' => CustomKeywordSearch::query()->withTrashed()->with('user'),
            'inquiries' => Inquiry::query()->with('user'),
            'plans' => PricingPlan::query()->withTrashed(),
            'subscription' => Subscription::query()->withTrashed()->with(['user', 'plan']),
            'users' => User::query()->withTrashed(),
            'keyword-index' => IndexedKeyword::query()->withTrashed(),
            default => null,
        };
    }

    public function applySearch(string $resource, Builder $query, string $term): void
    {
        $like = '%'.$term.'%';

        match ($resource) {
            'viral-videos' => $query->where(
                fn (Builder $inner) => $inner->where('title', 'like', $like)
                    ->orWhere('username', 'like', $like)
                    ->orWhere('name', 'like', $like),
            ),
            'searches' => $query->where(
                fn (Builder $inner) => $inner->where('name', 'like', $like)->orWhere('phrase', 'like', $like),
            ),
            'inquiries' => $query->where(
                fn (Builder $inner) => $inner->where('name', 'like', $like)
                    ->orWhere('email', 'like', $like)
                    ->orWhere('subject', 'like', $like)
                    ->orWhere('message', 'like', $like),
            ),
            'plans' => $query->where(
                fn (Builder $inner) => $inner->where('name', 'like', $like)->orWhere('slug', 'like', $like),
            ),
            'subscription' => $query->whereHas(
                'user',
                fn (Builder $inner) => $inner->where('name', 'like', $like)->orWhere('email', 'like', $like),
            ),
            'users' => $query->where(
                fn (Builder $inner) => $inner->where('name', 'like', $like)->orWhere('email', 'like', $like),
            ),
            'keyword-index' => $query->where(
                fn (Builder $inner) => $inner->where('label', 'like', $like)
                    ->orWhere('sector', 'like', $like)
                    ->orWhere('source', 'like', $like),
            ),
            default => null,
        };
    }

    /**
     * @param  array<string, string>  $activeFilters
     */
    public function applyFilter(string $resource, Builder $query, string $name, string $value, array $activeFilters = []): void
    {
        if ($name === 'date') {
            $this->applyDateFilter($query, $value, $activeFilters['date_from'] ?? null, $activeFilters['date_to'] ?? null);

            return;
        }

        if ($name === 'status') {
            $this->applyStatusFilter($resource, $query, $value);

            return;
        }

        if ($name === 'type' && $resource === 'searches') {
            $query->where('search_type', $value);

            return;
        }

        if ($name === 'type' && $resource === 'keyword-index') {
            $query->where('keyword_type', $value);

            return;
        }

        if ($name === 'category' && $resource === 'inquiries') {
            $query->where('category', $value);

            return;
        }

        if ($name === 'owner' && $resource === 'searches') {
            // Guest searches have no user_id until the visitor signs in and
            // claims them, so they need their own bucket rather than being
            // invisible under every owner filter.
            $value === 'guest'
                ? $query->whereNull('user_id')
                : $query->where('user_id', $value);
        }
    }

    public function applyDateFilter(Builder $query, ?string $range, ?string $dateFrom, ?string $dateTo): void
    {
        $since = match ($range) {
            'today' => now()->startOfDay(),
            '7d' => now()->subDays(7),
            '30d' => now()->subDays(30),
            default => null,
        };

        if ($since !== null) {
            $query->where('created_at', '>=', $since);

            return;
        }

        if ($range !== 'custom') {
            return;
        }

        $from = $this->parseDateBoundary($dateFrom, false);
        $to = $this->parseDateBoundary($dateTo, true);

        if ($from !== null) {
            $query->where('created_at', '>=', $from);
        }

        if ($to !== null) {
            $query->where('created_at', '<=', $to);
        }
    }

    /**
     * @return array<int, array<string, string>>
     */
    public function searchInsights(Builder $query, array $activeFilters): array
    {
        $records = (clone $query)
            ->select(['id', 'name', 'phrase', 'search_type', 'user_id', 'created_at'])
            ->with(['user:id,name,email'])
            ->get();

        if ($records->isEmpty()) {
            return [];
        }

        return [
            $this->themeSummaryInsight($records),
            $this->trendShiftInsight($activeFilters),
            $this->repeatSignalInsight($records),
        ];
    }

    private function applyStatusFilter(string $resource, Builder $query, string $value): void
    {
        if ($value === 'deleted') {
            $query->onlyTrashed();

            return;
        }

        // Anything other than an explicit "deleted" request is a question about
        // live records, so trashed rows drop out here rather than leaking in.
        $query->whereNull('deleted_at');

        match ($resource) {
            'viral-videos' => $value === 'archived'
                ? $query->whereNotNull('archived_at')
                : $query->whereNull('archived_at'),
            'plans' => match ($value) {
                'archived' => $query->whereNotNull('archived_at'),
                'active' => $query->whereNull('archived_at')->where('is_active', true),
                'inactive' => $query->whereNull('archived_at')->where('is_active', false),
                default => null,
            },
            'subscription' => $query->where('status', $value),
            'keyword-index' => match ($value) {
                'archived' => $query->whereNotNull('archived_at'),
                'live' => $query->whereNull('archived_at'),
                default => null,
            },
            default => null,
        };
    }

    /**
     * @return array<string, mixed>
     */
    public function mapRow(string $resource, Model $record): array
    {
        return match ($resource) {
            'viral-videos' => [
                'id' => $record->id,
                'video' => $record->title ?: ($record->video_id ?? 'Untitled'),
                'source' => trim(Str::title($record->platform ?? '').' / '.($record->username ? '@'.$record->username : '-')),
                'status' => $this->viralVideoStatus($record),
                'published_at' => $record->uploaded_at?->diffForHumans() ?? '-',
            ],
            'searches' => [
                'id' => $record->id,
                'search' => $record->name,
                'type' => $record->search_type ?? '-',
                'owner' => $record->user?->name ?? $record->user?->email ?? 'Guest',
                'status' => $record->trashed() ? 'deleted' : $record->status,
            ],
            'inquiries' => [
                'id' => $record->id,
                'contact' => trim($record->name.' / '.$record->email),
                'category' => Str::headline((string) $record->category),
                'subject' => $record->subject ?: '-',
                'message' => Str::limit((string) preg_replace('/\s+/', ' ', (string) $record->message), 96),
                'received_at' => $record->created_at?->diffForHumans() ?? '-',
                'preview' => [
                    'name' => $record->name,
                    'email' => $record->email,
                    'category' => Str::headline((string) $record->category),
                    'subject' => $record->subject ?: '-',
                    'message' => $record->message,
                    'received_at' => $record->created_at?->format('M j, Y g:i A') ?? '-',
                ],
            ],
            'plans' => [
                'id' => $record->id,
                'plan' => $record->name,
                'price' => '$'.number_format((float) $record->amount, 2).' / '.($record->duration ?? 'month'),
                'status' => $this->planStatus($record),
                'updated_at' => $record->updated_at?->diffForHumans() ?? '-',
            ],
            'subscription' => [
                'id' => $record->id,
                'subscriber' => match (true) {
                    $record->user !== null && filled($record->user->name) && filled($record->user->email) => $record->user->name.' / '.$record->user->email,
                    $record->user !== null && filled($record->user->email) => $record->user->email,
                    $record->user !== null && filled($record->user->name) => $record->user->name,
                    default => 'Unknown',
                },
                'plan' => $record->plan?->name ?? '-',
                'credits' => (string) ($record->user?->monthly_credits_remaining ?? 0),
                'status' => $record->trashed() ? 'deleted' : $record->status,
                'renewal' => $record->current_period_ends_at?->format('M j') ?? '-',
            ],
            'users' => [
                'id' => $record->id,
                'user' => $record->name ?: $record->email,
                'email' => $record->email ?: '-',
                'plan' => $record->current_plan_slug ?? 'free',
                'credits' => (string) ($record->monthly_credits_remaining ?? 0),
                'status' => $record->trashed() ? 'deleted' : 'active',
                'joined_at' => $record->created_at?->format('M j, Y') ?? '-',
            ],
            'keyword-index' => [
                'id' => $record->id,
                'keyword' => $record->label,
                'type' => $record->keyword_type,
                'sector' => $record->sector ?: '-',
                'source' => str_replace('_', ' ', $record->source ?: 'manual'),
                'status' => $record->trashed() ? 'deleted' : ($record->archived_at !== null ? 'archived' : 'live'),
            ],
            default => [],
        };
    }

    private function viralVideoStatus(ViralVideo $video): string
    {
        return match (true) {
            $video->trashed() => 'deleted',
            $video->archived_at !== null => 'archived',
            default => $video->video_status ?? 'visible',
        };
    }

    private function planStatus(PricingPlan $plan): string
    {
        return match (true) {
            $plan->trashed() => 'deleted',
            $plan->archived_at !== null => 'archived',
            $plan->is_active => 'active',
            default => 'inactive',
        };
    }

    /**
     * Owners that actually have searches, newest account first. Capped because
     * this renders as a dropdown, not a directory.
     *
     * @return array<int, array<string, string>>
     */
    private function ownerOptions(): array
    {
        $owners = User::query()
            ->whereHas('customKeywordSearches')
            ->orderByDesc('created_at')
            ->limit(100)
            ->get(['id', 'name', 'email'])
            ->map(fn (User $user): array => [
                'value' => (string) $user->id,
                'label' => $user->name ?: $user->email,
            ])
            ->all();

        return [...$owners, ['value' => 'guest', 'label' => 'Guest (unclaimed)']];
    }

    /**
     * @param  Collection<int, CustomKeywordSearch>  $records
     * @return array<string, string>
     */
    private function themeSummaryInsight(Collection $records): array
    {
        $topTypes = $records
            ->countBy(fn (CustomKeywordSearch $search): string => (string) ($search->search_type ?: 'unknown'))
            ->sortDesc();

        $topType = (string) ($topTypes->keys()->first() ?? 'search');
        $typeShare = max(1, (int) round(((int) ($topTypes->first() ?? 0) / max(1, $records->count())) * 100));

        $topTerms = $records
            ->map(fn (CustomKeywordSearch $search): string => trim((string) ($search->phrase ?: $search->name)))
            ->filter()
            ->countBy()
            ->sortDesc()
            ->keys()
            ->take(2)
            ->values();

        $termsText = $topTerms->count() > 0
            ? $topTerms->map(fn (string $term): string => "'{$term}'")->implode(' and ')
            : 'current demand';

        return [
            'label' => 'Theme Summary',
            'tone' => 'warm',
            'body' => sprintf(
                '%s searches lead this slice at %d%% of activity, with %s surfacing most often.',
                Str::headline($topType),
                $typeShare,
                $termsText
            ),
        ];
    }

    /**
     * @param  array<string, string>  $activeFilters
     * @return array<string, string>
     */
    private function trendShiftInsight(array $activeFilters): array
    {
        [$currentStart, $currentEnd] = $this->comparisonWindow($activeFilters);

        $currentQuery = CustomKeywordSearch::query()->whereBetween('created_at', [$currentStart, $currentEnd]);
        $previousQuery = CustomKeywordSearch::query()->whereBetween('created_at', [
            $currentStart->subSeconds($currentEnd->diffInSeconds($currentStart) + 1),
            $currentStart->subSecond(),
        ]);

        if (($type = $activeFilters['type'] ?? null) !== null && $type !== '') {
            $currentQuery->where('search_type', $type);
            $previousQuery->where('search_type', $type);
        }

        if (($owner = $activeFilters['owner'] ?? null) !== null && $owner !== '') {
            $owner === 'guest'
                ? $currentQuery->whereNull('user_id')
                : $currentQuery->where('user_id', $owner);

            $owner === 'guest'
                ? $previousQuery->whereNull('user_id')
                : $previousQuery->where('user_id', $owner);
        }

        $currentProduct = (clone $currentQuery)->where('search_type', CustomKeywordSearch::TYPE_PRODUCT)->count();
        $currentBrand = (clone $currentQuery)->where('search_type', CustomKeywordSearch::TYPE_BRAND)->count();
        $previousProduct = (clone $previousQuery)->where('search_type', CustomKeywordSearch::TYPE_PRODUCT)->count();
        $previousBrand = (clone $previousQuery)->where('search_type', CustomKeywordSearch::TYPE_BRAND)->count();

        $currentLeader = $currentProduct >= $currentBrand ? 'product' : 'brand';
        $previousLeader = $previousProduct >= $previousBrand ? 'product' : 'brand';

        $body = $currentLeader !== $previousLeader
            ? sprintf(
                '%s searches now edge past %s searches, a noticeable shift from the previous comparison window.',
                Str::headline($currentLeader),
                Str::headline($previousLeader)
            )
            : sprintf(
                '%s searches remain the stronger pattern, with the current window broadly matching the previous one.',
                Str::headline($currentLeader)
            );

        return [
            'label' => 'Trend Shift',
            'tone' => 'amber',
            'body' => $body,
        ];
    }

    /**
     * @param  Collection<int, CustomKeywordSearch>  $records
     * @return array<string, string>
     */
    private function repeatSignalInsight(Collection $records): array
    {
        $duplicates = $records
            ->map(fn (CustomKeywordSearch $search): string => mb_strtolower(trim((string) ($search->phrase ?: $search->name))))
            ->filter()
            ->countBy()
            ->filter(fn (int $count): bool => $count > 1)
            ->sortDesc();

        if ($duplicates->isEmpty()) {
            return [
                'label' => 'Repeat Signal',
                'tone' => 'slate',
                'body' => 'Search activity is relatively spread out right now, with little repeated tracking around the same exact terms.',
            ];
        }

        $leaders = $duplicates->keys()
            ->take(2)
            ->map(fn (string $term): string => "'{$term}'")
            ->implode(' and ');

        $repeatCount = (int) $duplicates->sum();

        return [
            'label' => 'Repeat Signal',
            'tone' => 'rose',
            'body' => sprintf(
                'Repeated tracking is clustering around %s, accounting for %d repeated search entries in this slice.',
                $leaders,
                $repeatCount
            ),
        ];
    }

    private function parseDateBoundary(?string $value, bool $endOfDay): ?CarbonImmutable
    {
        if (blank($value)) {
            return null;
        }

        try {
            $date = CarbonImmutable::parse($value);
        } catch (\Throwable) {
            return null;
        }

        return $endOfDay ? $date->endOfDay() : $date->startOfDay();
    }

    /**
     * @param  array<string, string>  $activeFilters
     * @return array{0: CarbonImmutable, 1: CarbonImmutable}
     */
    private function comparisonWindow(array $activeFilters): array
    {
        $now = CarbonImmutable::now();
        $range = $activeFilters['date'] ?? '';

        if ($range === 'today') {
            return [$now->startOfDay(), $now];
        }

        if ($range === '7d') {
            return [$now->subDays(7), $now];
        }

        if ($range === '30d') {
            return [$now->subDays(30), $now];
        }

        if ($range === 'custom') {
            $from = $this->parseDateBoundary($activeFilters['date_from'] ?? null, false);
            $to = $this->parseDateBoundary($activeFilters['date_to'] ?? null, true);

            if ($from !== null || $to !== null) {
                return [$from ?? $now->subDays(30), $to ?? $now];
            }
        }

        return [$now->subDays(30), $now];
    }

    /**
     * Plan slugs an account can sit on. `free` is not a row in `plans`, so it
     * is added explicitly.
     *
     * @return array<int, array<string, string>>
     */
    private function planSlugOptions(): array
    {
        $plans = PricingPlan::query()
            ->orderBy('amount')
            ->get(['slug', 'name'])
            ->map(fn (PricingPlan $plan): array => ['value' => (string) $plan->slug, 'label' => $plan->name])
            ->all();

        return [['value' => 'free', 'label' => 'Free'], ...$plans];
    }

    /**
     * @return array<int, array<string, string>>
     */
    private function planOptions(): array
    {
        return PricingPlan::query()
            ->orderBy('amount')
            ->get(['id', 'name'])
            ->map(fn (PricingPlan $plan): array => ['value' => (string) $plan->id, 'label' => $plan->name])
            ->all();
    }

    /**
     * Rows for resources with no table behind them.
     *
     * @return array<int, array<string, mixed>>
     */
    public function staticRows(string $resource): array
    {
        if ($resource !== 'admin-users') {
            return [];
        }

        return [
            [
                'id' => 'root',
                'admin' => (string) config('admin.root_email'),
                'role' => 'root',
                'status' => 'active',
            ],
        ];
    }

    /**
     * What the row menu is allowed to offer, per resource.
     *
     * @return array<string, bool>
     */
    public function capabilities(string $resource): array
    {
        return match ($resource) {
            'viral-videos', 'plans' => ['edit' => true, 'archive' => true, 'delete' => true],
            // Searches are an audit trail of what customers ran. Editing or
            // deleting one here would rewrite their history, so this listing
            // stays read-only.
            'searches' => ['preview' => false, 'edit' => false, 'archive' => false, 'delete' => false],
            'inquiries' => ['preview' => true, 'edit' => false, 'archive' => false, 'delete' => false],
            'subscription' => ['edit' => true, 'archive' => false, 'delete' => true],
            'users' => ['edit' => true, 'archive' => false, 'delete' => true, 'impersonate' => true],
            'keyword-index' => ['edit' => true, 'archive' => true, 'delete' => true],
            default => ['preview' => false, 'edit' => false, 'archive' => false, 'delete' => false],
        };
    }

    /**
     * Fields the edit drawer renders. Deliberately narrow: nothing here can
     * desync Stripe, which owns billing state.
     *
     * @return array<int, array<string, mixed>>
     */
    public function editableFields(string $resource): array
    {
        return match ($resource) {
            'viral-videos' => [
                ['name' => 'title', 'label' => 'Title', 'type' => 'text'],
                ['name' => 'video_status', 'label' => 'Video status', 'type' => 'select', 'options' => ['visible', 'hidden']],
                ['name' => 'archived', 'label' => 'Archived', 'type' => 'toggle', 'help' => 'Hidden from detail pages and public listings.'],
            ],
            'plans' => [
                ['name' => 'name', 'label' => 'Name', 'type' => 'text'],
                ['name' => 'slug', 'label' => 'Slug', 'type' => 'text', 'help' => 'Used in URLs and to match a user\'s current plan. Changing it affects existing accounts.', 'rules' => ['required', 'string', 'max:255', 'unique:plans,slug,{id}']],
                ['name' => 'description', 'label' => 'Tagline', 'type' => 'text'],
                ['name' => 'plan_type', 'label' => 'Plan type', 'type' => 'text'],
                ['name' => 'cta', 'label' => 'CTA label', 'type' => 'text'],
                ['name' => 'popular', 'label' => 'Highlight as popular', 'type' => 'toggle'],
                ['name' => 'trial_enabled', 'label' => 'Trial enabled', 'type' => 'toggle'],
                ['name' => 'amount', 'label' => 'Monthly price', 'type' => 'number', 'step' => '0.01'],
                ['name' => 'annual_amount', 'label' => 'Annual price', 'type' => 'number', 'step' => '0.01'],
                ['name' => 'saved_amount', 'label' => 'Annual saving', 'type' => 'number', 'step' => '0.01'],
                ['name' => 'price_cents', 'label' => 'Price (cents)', 'type' => 'number'],
                ['name' => 'unit_amount', 'label' => 'Unit amount', 'type' => 'number'],
                ['name' => 'currency', 'label' => 'Currency', 'type' => 'text'],
                ['name' => 'interval', 'label' => 'Interval', 'type' => 'select', 'options' => ['day', 'week', 'month', 'year']],
                ['name' => 'interval_count', 'label' => 'Interval count', 'type' => 'number'],
                ['name' => 'duration', 'label' => 'Duration label', 'type' => 'text'],
                ['name' => 'search_credits_limit', 'label' => 'Search credits per period', 'type' => 'number', 'help' => 'Stored in plan metadata. Drives the credit allowance for this plan.'],
                ['name' => 'video_bookmark_limit', 'label' => 'Video bookmark limit', 'type' => 'number', 'min' => -1, 'help' => '-1 means unlimited.'],
                ['name' => 'search_bookmark_limit', 'label' => 'Search bookmark limit', 'type' => 'number', 'min' => -1, 'help' => '-1 means unlimited.'],
                ['name' => 'video_analysis_limit', 'label' => 'Video analysis limit', 'type' => 'number', 'min' => -1, 'help' => '-1 means unlimited.'],
                ['name' => 'stripe_product_id', 'label' => 'Stripe product ID', 'type' => 'text'],
                ['name' => 'stripe_price_id', 'label' => 'Stripe price ID', 'type' => 'text'],
                ['name' => 'plan_environment', 'label' => 'Environment', 'type' => 'select', 'options' => ['production', 'test']],
                ['name' => 'is_active', 'label' => 'Active', 'type' => 'toggle'],
                ['name' => 'archived', 'label' => 'Archived', 'type' => 'toggle', 'help' => 'Hidden from pricing cards. Existing subscriptions keep the plan.'],
            ],
            'searches', 'inquiries' => [],
            'subscription' => [
                ['name' => 'status', 'label' => 'Status', 'type' => 'select', 'options' => ['active', 'trialing', 'past_due', 'canceled', 'pending']],
                ['name' => 'plan_id', 'label' => 'Plan', 'type' => 'select', 'options' => $this->planOptions()],
                ['name' => 'credits', 'label' => 'Subscriber credits remaining', 'type' => 'number', 'help' => 'Applies to the subscriber account, not the subscription row.'],
                ['name' => 'cta', 'label' => 'Plan CTA label', 'type' => 'text', 'help' => 'Edits the linked plan metadata.'],
                ['name' => 'popular', 'label' => 'Plan marked as popular', 'type' => 'toggle', 'help' => 'Edits the linked plan metadata.'],
                ['name' => 'trial_enabled', 'label' => 'Plan trial enabled', 'type' => 'toggle', 'help' => 'Edits the linked plan metadata.'],
                ['name' => 'search_credits_limit', 'label' => 'Plan search credits per period', 'type' => 'number', 'help' => 'Edits the plan metadata - this changes the allowance for every subscriber on this plan.'],
                ['name' => 'video_bookmark_limit', 'label' => 'Plan video bookmark limit', 'type' => 'number', 'min' => -1, 'help' => 'Edits the plan metadata for every subscriber on this plan.'],
                ['name' => 'search_bookmark_limit', 'label' => 'Plan search bookmark limit', 'type' => 'number', 'min' => -1, 'help' => 'Edits the plan metadata for every subscriber on this plan.'],
                ['name' => 'video_analysis_limit', 'label' => 'Plan video analysis limit', 'type' => 'number', 'min' => -1, 'help' => 'Edits the plan metadata for every subscriber on this plan.'],
                ['name' => 'stripe_subscription_id', 'label' => 'Stripe subscription ID', 'type' => 'text'],
                ['name' => 'stripe_customer_id', 'label' => 'Stripe customer ID', 'type' => 'text'],
            ],
            'users' => [
                ['name' => 'name', 'label' => 'Name', 'type' => 'text'],
                ['name' => 'email', 'label' => 'Email', 'type' => 'text', 'rules' => ['required', 'email', 'max:255', 'unique:users,email,{id}']],
                ['name' => 'current_plan_slug', 'label' => 'Current plan', 'type' => 'select', 'options' => $this->planSlugOptions()],
                ['name' => 'credits', 'label' => 'Search credits remaining', 'type' => 'number'],
                ['name' => 'stripe_customer_id', 'label' => 'Stripe customer ID', 'type' => 'text'],
                ['name' => 'email_verified', 'label' => 'Email verified', 'type' => 'toggle', 'help' => 'Stored as a timestamp; turning this off clears the verification date.'],
                ['name' => 'free_search_used', 'label' => 'Free search used', 'type' => 'toggle', 'help' => 'Turning this off gives the account its one free search back.'],
                ['name' => 'password', 'label' => 'Set new password', 'type' => 'password', 'help' => 'Leave blank to keep the current password.', 'rules' => ['nullable', 'string', 'min:8']],
            ],
            'keyword-index' => [
                ['name' => 'label', 'label' => 'Keyword', 'type' => 'text', 'rules' => ['required', 'string', 'max:120']],
                ['name' => 'keyword_type', 'label' => 'Type', 'type' => 'select', 'options' => ['brand', 'product']],
                ['name' => 'sector', 'label' => 'Sector', 'type' => 'text'],
                ['name' => 'source', 'label' => 'Source', 'type' => 'text'],
                ['name' => 'usage_count', 'label' => 'Usage count', 'type' => 'number'],
                ['name' => 'archived', 'label' => 'Archived', 'type' => 'toggle', 'help' => 'Keeps the keyword in admin history while hiding it from live suggestions.'],
            ],
            default => [],
        };
    }

    /**
     * Current values for the edit drawer.
     *
     * @return array<string, mixed>
     */
    public function editValues(string $resource, Model $record): array
    {
        return match ($resource) {
            'viral-videos' => [
                'title' => $record->title,
                'video_status' => $record->video_status ?? 'visible',
                'archived' => $record->archived_at !== null,
            ],
            'plans' => [
                'name' => $record->name,
                'slug' => $record->slug,
                'description' => $record->description,
                'plan_type' => $record->plan_type,
                'cta' => (string) data_get($record->metadata, 'settings.cta', 'Choose plan'),
                'popular' => (bool) data_get($record->metadata, 'settings.popular', false),
                'trial_enabled' => (bool) data_get($record->metadata, 'subscription.trialEnabled', false),
                'amount' => (float) $record->amount,
                'annual_amount' => (float) $record->annual_amount,
                'saved_amount' => (float) $record->saved_amount,
                'price_cents' => (int) $record->price_cents,
                'unit_amount' => (int) $record->unit_amount,
                'currency' => $record->currency,
                'interval' => $record->interval,
                'interval_count' => (int) $record->interval_count,
                'duration' => $record->duration,
                'search_credits_limit' => (int) data_get($record->metadata, 'subscription.search_limits.limit', 0),
                'video_bookmark_limit' => (int) data_get($record->metadata, 'subscription.viral_video_bookmarks.limit', 0),
                'search_bookmark_limit' => (int) data_get($record->metadata, 'subscription.search_bookmarks.limit', 0),
                'video_analysis_limit' => (int) data_get($record->metadata, 'subscription.video_analysis.limit', 0),
                'stripe_product_id' => $record->stripe_product_id,
                'stripe_price_id' => $record->stripe_price_id,
                'plan_environment' => $record->plan_environment,
                'is_active' => (bool) $record->is_active,
                'archived' => $record->archived_at !== null,
            ],
            'searches', 'inquiries' => [],
            'subscription' => [
                'status' => $record->status,
                'plan_id' => (string) ($record->plan_id ?? ''),
                'credits' => (int) ($record->user?->monthly_credits_remaining ?? 0),
                'cta' => (string) data_get($record->plan?->metadata, 'settings.cta', 'Choose plan'),
                'popular' => (bool) data_get($record->plan?->metadata, 'settings.popular', false),
                'trial_enabled' => (bool) data_get($record->plan?->metadata, 'subscription.trialEnabled', false),
                'search_credits_limit' => (int) data_get($record->plan?->metadata, 'subscription.search_limits.limit', 0),
                'video_bookmark_limit' => (int) data_get($record->plan?->metadata, 'subscription.viral_video_bookmarks.limit', 0),
                'search_bookmark_limit' => (int) data_get($record->plan?->metadata, 'subscription.search_bookmarks.limit', 0),
                'video_analysis_limit' => (int) data_get($record->plan?->metadata, 'subscription.video_analysis.limit', 0),
                'stripe_subscription_id' => $record->stripe_subscription_id,
                'stripe_customer_id' => $record->stripe_customer_id,
            ],
            'users' => [
                'name' => $record->name,
                'email' => $record->email,
                'current_plan_slug' => $record->current_plan_slug ?? 'free',
                'credits' => (int) ($record->monthly_credits_remaining ?? 0),
                'stripe_customer_id' => $record->stripe_customer_id,
                'email_verified' => $record->email_verified_at !== null,
                'free_search_used' => $record->free_search_used_at !== null,
                // Never round-trips the hash - the field is write-only.
                'password' => '',
            ],
            'keyword-index' => [
                'label' => $record->label,
                'keyword_type' => $record->keyword_type,
                'sector' => $record->sector,
                'source' => $record->source,
                'usage_count' => (int) $record->usage_count,
                'archived' => $record->archived_at !== null,
            ],
            default => [],
        };
    }

    /**
     * @return array<string, mixed>
     */
    public function createValues(string $resource): array
    {
        return match ($resource) {
            'plans' => [
                'name' => '',
                'slug' => '',
                'description' => '',
                'plan_type' => '',
                'cta' => 'Choose plan',
                'popular' => false,
                'trial_enabled' => true,
                'amount' => 0,
                'annual_amount' => 0,
                'saved_amount' => 0,
                'price_cents' => 0,
                'unit_amount' => 0,
                'currency' => 'usd',
                'interval' => 'month',
                'interval_count' => 1,
                'duration' => 'monthly',
                'search_credits_limit' => 0,
                'video_bookmark_limit' => 0,
                'search_bookmark_limit' => 0,
                'video_analysis_limit' => 0,
                'stripe_product_id' => '',
                'stripe_price_id' => '',
                'plan_environment' => 'production',
                'is_active' => true,
                'archived' => false,
            ],
            'keyword-index' => [
                'label' => '',
                'keyword_type' => 'brand',
                'sector' => '',
                'source' => 'manual',
                'usage_count' => 0,
                'archived' => false,
            ],
            default => [],
        };
    }

    public function emptyMessage(string $resource): string
    {
        return match ($resource) {
            'viral-videos' => 'No viral videos match the current filters yet.',
            'searches' => 'No searches match the current filters yet.',
            'inquiries' => 'No inquiries match the current filters yet.',
            'plans' => 'No plans match the current filters yet.',
            'subscription' => 'No subscriptions match the current filters yet.',
            'users' => 'No users match the current filters yet.',
            'admin-users' => 'No admin users match the current filters yet.',
            'keyword-index' => 'No indexed keywords match the current filters yet.',
            default => 'No records match the current filters yet.',
        };
    }

    public function searchPlaceholder(string $resource): string
    {
        return 'Search '.Str::lower($this->title($resource));
    }
}
