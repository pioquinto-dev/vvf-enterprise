<?php

namespace App\Repositories\Admin\Listings;

use App\Models\CustomKeywordSearch;
use App\Models\IndexedKeyword;
use App\Models\Inquiry;
use App\Models\ManagedCouponProgram;
use App\Models\ManagedCouponRedemption;
use App\Models\ManagedCouponWhitelistEntry;
use App\Models\PricingPlan;
use App\Models\Subscription;
use App\Models\User;
use App\Models\ViralVideo;
use App\Models\VideoAnalysis;
use App\Models\VideoBookmark;
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
            'coupon-programs' => 'Coupon Programs',
            'coupon-whitelist' => 'Coupon Whitelist',
            'coupon-usage' => 'Coupon Usage',
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
            'subscription' => ['search', 'status', 'plan', 'type'],
            'users' => ['search', 'status', 'plan'],
            'admin-users' => ['search', 'role', 'status'],
            'keyword-index' => ['search', 'type', 'status'],
            'coupon-programs' => ['search', 'status'],
            'coupon-whitelist' => ['search', 'program'],
            'coupon-usage' => ['search', 'program'],
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
                ['name' => 'type', 'label' => 'Type', 'options' => $this->subscriptionTypeOptions()],
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
            'coupon-programs' => [
                ['name' => 'status', 'label' => 'Status', 'options' => ['active', 'inactive']],
            ],
            'coupon-whitelist' => [
                ['name' => 'program', 'label' => 'Program', 'options' => $this->couponProgramOptions()],
            ],
            'coupon-usage' => [
                ['name' => 'program', 'label' => 'Program', 'options' => $this->couponProgramOptions()],
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
            'coupon-programs' => [
                ['key' => 'program', 'label' => 'Program'],
                ['key' => 'plan', 'label' => 'Plan'],
                ['key' => 'redemptions', 'label' => 'Redeemed'],
                ['key' => 'status', 'label' => 'Status'],
            ],
            'coupon-whitelist' => [
                ['key' => 'email', 'label' => 'Email'],
                ['key' => 'program', 'label' => 'Program'],
                ['key' => 'added_by', 'label' => 'Added by'],
                ['key' => 'created', 'label' => 'Added'],
            ],
            'coupon-usage' => [
                ['key' => 'subscriber', 'label' => 'Subscriber'],
                ['key' => 'program', 'label' => 'Program'],
                ['key' => 'status', 'label' => 'Status'],
                ['key' => 'redeemed', 'label' => 'Redeemed'],
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
            'users' => User::query()->withTrashed()->with(['subscriptions.plan']),
            'keyword-index' => IndexedKeyword::query()->withTrashed(),
            'coupon-programs' => ManagedCouponProgram::query()->withTrashed(),
            'coupon-whitelist' => ManagedCouponWhitelistEntry::query()->with('program'),
            'coupon-usage' => ManagedCouponRedemption::query()->with(['program', 'user'])->whereNotNull('redeemed_at'),
            default => null,
        };
    }

    public function applySearch(string $resource, Builder $query, string $term): void
    {
        $normalized = mb_strtolower($term);
        $like = '%'.$normalized.'%';

        match ($resource) {
            'viral-videos' => $query->where(
                fn (Builder $inner) => $inner->whereRaw('LOWER(title) like ?', [$like])
                    ->orWhereRaw('LOWER(username) like ?', [$like])
                    ->orWhereRaw('LOWER(name) like ?', [$like]),
            ),
            'searches' => $query->where(
                fn (Builder $inner) => $inner->whereRaw('LOWER(name) like ?', [$like])->orWhereRaw('LOWER(phrase) like ?', [$like]),
            ),
            'inquiries' => $query->where(
                fn (Builder $inner) => $inner->whereRaw('LOWER(name) like ?', [$like])
                    ->orWhereRaw('LOWER(email) like ?', [$like])
                    ->orWhereRaw('LOWER(subject) like ?', [$like])
                    ->orWhereRaw('LOWER(message) like ?', [$like]),
            ),
            'plans' => $query->where(
                fn (Builder $inner) => $inner->whereRaw('LOWER(name) like ?', [$like])->orWhereRaw('LOWER(slug) like ?', [$like]),
            ),
            'subscription' => $query->whereHas(
                'user',
                fn (Builder $inner) => $inner->whereRaw('LOWER(name) like ?', [$like])->orWhereRaw('LOWER(email) like ?', [$like]),
            ),
            'users' => $query->where(
                fn (Builder $inner) => $inner->whereRaw('LOWER(name) like ?', [$like])->orWhereRaw('LOWER(email) like ?', [$like]),
            ),
            'keyword-index' => $query->where(
                fn (Builder $inner) => $inner->whereRaw('LOWER(label) like ?', [$like])
                    ->orWhereRaw('LOWER(sector) like ?', [$like])
                    ->orWhereRaw('LOWER(source) like ?', [$like]),
            ),
            'coupon-programs' => $query->where(
                fn (Builder $inner) => $inner->whereRaw('LOWER(code) like ?', [$like])
                    ->orWhereRaw('LOWER(name) like ?', [$like])
                    ->orWhereRaw('LOWER(link_path) like ?', [$like]),
            ),
            'coupon-whitelist' => $query->whereRaw('LOWER(email) like ?', [$like]),
            'coupon-usage' => $query->whereRaw('LOWER(email) like ?', [$like]),
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

        if ($name === 'type' && $resource === 'subscription') {
            if ($value === 'regular') {
                $couponUserIds = $this->couponSubscriberUserIds(null);

                if ($couponUserIds !== []) {
                    $query->whereNotIn('user_id', $couponUserIds);
                }

                return;
            }

            // Any other value is a program code (IGNITEBB / IVANVIP).
            $query->whereIn('user_id', $this->couponSubscriberUserIds($value) ?: [-1]);

            return;
        }

        if ($name === 'program' && in_array($resource, ['coupon-whitelist', 'coupon-usage'], true)) {
            $programId = ManagedCouponProgram::withTrashed()->where('code', $value)->value('id');
            $query->where('managed_coupon_program_id', $programId ?? 0);

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
            'coupon-programs' => match ($value) {
                'active' => $query->where('is_active', true),
                'inactive' => $query->where('is_active', false),
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
                'preview' => [
                    'eyebrow' => 'Content record',
                    'summary' => $record->title ?: ($record->video_id ?? 'Untitled'),
                    'sections' => [
                        [
                            'title' => 'Content',
                            'fields' => [
                                ['label' => 'Title', 'value' => $record->title],
                                ['label' => 'Platform', 'value' => $record->platform],
                                ['label' => 'Video status', 'value' => $record->video_status],
                                ['label' => 'Creator handle', 'value' => $record->username ? '@'.$record->username : null],
                                ['label' => 'Creator name', 'value' => $record->name],
                                ['label' => 'Content format', 'value' => $record->content_format],
                                ['label' => 'Content hook', 'value' => $record->content_hook],
                                ['label' => 'Content angle', 'value' => $record->content_angle],
                                ['label' => 'Hashtags', 'value' => $this->tagList($record->hashtags), 'multiline' => true],
                            ],
                        ],
                        [
                            'title' => 'Creator',
                            'fields' => [
                                ['label' => 'Creator handle', 'value' => $record->username ? '@'.$record->username : null],
                                ['label' => 'Creator name', 'value' => $record->name],
                                ['label' => 'Followers', 'value' => $this->formatCount($record->followers)],
                                ['label' => 'Avatar URL', 'value' => $record->avatar, 'multiline' => true],
                            ],
                        ],
                        [
                            'title' => 'Statistics',
                            'fields' => [
                                ['label' => 'Views', 'value' => $this->formatCount($record->views)],
                                ['label' => 'Likes', 'value' => $this->formatCount($record->likes)],
                                ['label' => 'Comments', 'value' => $this->formatCount($record->comments)],
                                ['label' => 'Shares', 'value' => $this->formatCount($record->shares)],
                                ['label' => 'Bookmarks', 'value' => $this->formatCount($record->bookmarks)],
                                ['label' => 'Engagement rate', 'value' => $record->engagementRate() !== null ? number_format((float) $record->engagementRate(), 2).'%' : null],
                                ['label' => 'Virality score', 'value' => $record->virality_score !== null ? number_format((float) $record->virality_score, 2) : null],
                                ['label' => 'Duration', 'value' => $record->duration !== null ? number_format((float) $record->duration, 2).' sec' : null],
                            ],
                        ],
                        [
                            'title' => 'Sound',
                            'fields' => [
                                ['label' => 'Sound label', 'value' => $record->soundLabel()],
                                ['label' => 'Song', 'value' => $record->song],
                                ['label' => 'Artist', 'value' => $record->artist],
                                ['label' => 'Song cover URL', 'value' => $record->song_cover_url, 'multiline' => true],
                            ],
                        ],
                        [
                            'title' => 'Asset URLs',
                            'fields' => [
                                ['label' => 'Post URL', 'value' => $record->post_url, 'multiline' => true],
                                ['label' => 'Embed URL', 'value' => $record->embed_url, 'multiline' => true],
                                ['label' => 'Video URL', 'value' => $record->video_url, 'multiline' => true],
                                ['label' => 'Thumbnail URL', 'value' => $record->thumbnail_url, 'multiline' => true],
                                ['label' => 'Cover URL', 'value' => $record->cover, 'multiline' => true],
                            ],
                        ],
                        [
                            'title' => 'Operational',
                            'fields' => [
                                ['label' => 'Listing status', 'value' => $this->viralVideoStatus($record)],
                                ['label' => 'Scrape source', 'value' => $record->scrape_source],
                                ['label' => 'Language bucket', 'value' => $record->title_language_bucket],
                            ],
                        ],
                    ],
                ],
            ],
            'searches' => [
                'id' => $record->id,
                'search' => $record->name,
                'type' => $record->search_type ?? '-',
                'owner' => $record->user?->name ?? $record->user?->email ?? 'Guest',
                'status' => $record->trashed() ? 'deleted' : $record->status,
                'preview' => [
                    'eyebrow' => 'Search record',
                    'summary' => $record->phrase ?: $record->name,
                    'sections' => [
                        [
                            'title' => 'Search',
                            'fields' => [
                                ['label' => 'Name', 'value' => $record->name],
                                ['label' => 'Phrase', 'value' => $record->phrase],
                                ['label' => 'Type', 'value' => $record->search_type],
                                ['label' => 'Owner', 'value' => $record->user?->name ?? $record->user?->email ?? 'Guest'],
                                ['label' => 'Status', 'value' => $record->trashed() ? 'deleted' : $record->status],
                                ['label' => 'Frequency', 'value' => $record->frequency],
                            ],
                        ],
                        [
                            'title' => 'Inputs',
                            'fields' => [
                                ['label' => 'Keywords', 'value' => implode(', ', (array) ($record->keywords ?? [])), 'multiline' => true],
                                ['label' => 'TikTok handle source', 'value' => $record->source_tiktok_handle],
                                ['label' => 'Website source', 'value' => $record->source_website, 'multiline' => true],
                                ['label' => 'Guest token', 'value' => $record->guest_token],
                            ],
                        ],
                    ],
                ],
            ],
            'inquiries' => [
                'id' => $record->id,
                'contact' => trim($record->name.' / '.$record->email),
                'category' => Str::headline((string) $record->category),
                'subject' => $record->subject ?: '-',
                'message' => Str::limit((string) preg_replace('/\s+/', ' ', (string) $record->message), 96),
                'received_at' => $record->created_at?->diffForHumans() ?? '-',
                'preview' => [
                    'eyebrow' => 'Support inquiry',
                    'summary' => $record->subject ?: 'Inbound message',
                    'sections' => [
                        [
                            'title' => 'Contact',
                            'fields' => [
                                ['label' => 'Name', 'value' => $record->name],
                                ['label' => 'Email', 'value' => $record->email],
                                ['label' => 'Category', 'value' => Str::headline((string) $record->category)],
                                ['label' => 'Subject', 'value' => $record->subject],
                            ],
                        ],
                        [
                            'title' => 'Message',
                            'fields' => [
                                ['label' => 'Body', 'value' => $record->message, 'multiline' => true],
                            ],
                        ],
                    ],
                ],
            ],
            'plans' => [
                'id' => $record->id,
                'plan' => $record->name,
                'price' => '$'.number_format((float) $record->amount, 2).' / '.($record->duration ?? 'month'),
                'status' => $this->planStatus($record),
                'updated_at' => $record->updated_at?->diffForHumans() ?? '-',
                'preview' => [
                    'eyebrow' => 'Pricing plan',
                    'summary' => $record->description ?: $record->name,
                    'sections' => [
                        [
                            'title' => 'Plan',
                            'fields' => [
                                ['label' => 'Name', 'value' => $record->name],
                                ['label' => 'Slug', 'value' => $record->slug],
                                ['label' => 'Description', 'value' => $record->description, 'multiline' => true],
                                ['label' => 'Type', 'value' => $record->plan_type],
                                ['label' => 'Status', 'value' => $this->planStatus($record)],
                                ['label' => 'Environment', 'value' => $record->plan_environment],
                            ],
                        ],
                        [
                            'title' => 'Billing',
                            'fields' => [
                                ['label' => 'Monthly price', 'value' => '$'.number_format((float) $record->amount, 2)],
                                ['label' => 'Annual price', 'value' => '$'.number_format((float) $record->annual_amount, 2)],
                                ['label' => 'Interval', 'value' => trim(($record->interval_count ?? 1).' '.($record->interval ?? 'month'))],
                                ['label' => 'CTA label', 'value' => data_get($record->metadata, 'settings.cta')],
                                ['label' => 'Trial enabled', 'value' => $this->yesNo((bool) data_get($record->metadata, 'subscription.trialEnabled', false))],
                                ['label' => 'Popular', 'value' => $this->yesNo((bool) data_get($record->metadata, 'settings.popular', false))],
                            ],
                        ],
                        [
                            'title' => 'Limits',
                            'fields' => [
                                ['label' => 'Search credits limit', 'value' => $this->limitLabel((int) data_get($record->metadata, 'subscription.search_limits.limit', 0))],
                                ['label' => 'Video bookmark limit', 'value' => $this->limitLabel((int) data_get($record->metadata, 'subscription.viral_video_bookmarks.limit', 0))],
                                ['label' => 'Search bookmark limit', 'value' => $this->limitLabel((int) data_get($record->metadata, 'subscription.search_bookmarks.limit', 0))],
                                ['label' => 'Video analysis limit', 'value' => $this->limitLabel((int) data_get($record->metadata, 'subscription.video_analysis.limit', 0))],
                            ],
                        ],
                    ],
                ],
            ],
            'subscription' => $this->mapSubscriptionRow($record),
            'users' => $this->mapUserRow($record),
            'coupon-programs' => $this->mapCouponProgramRow($record),
            'coupon-whitelist' => [
                'id' => $record->id,
                'email' => $record->email,
                'program' => $record->program?->code ?? '-',
                'added_by' => $record->added_by ?: '-',
                'created' => $record->created_at?->format('M j, Y') ?? '-',
                'preview' => [
                    'eyebrow' => 'Whitelist entry',
                    'summary' => $record->email,
                    'sections' => [[
                        'title' => 'Entry',
                        'fields' => [
                            ['label' => 'Email', 'value' => $record->email],
                            ['label' => 'Program', 'value' => $record->program?->code],
                            ['label' => 'Added by', 'value' => $record->added_by],
                            ['label' => 'Note', 'value' => $record->note, 'multiline' => true],
                        ],
                    ]],
                ],
            ],
            'coupon-usage' => [
                'id' => $record->id,
                'subscriber' => match (true) {
                    $record->user !== null && filled($record->user->name) => $record->user->name.' / '.$record->email,
                    default => $record->email,
                },
                'program' => $record->program?->code ?? '-',
                'status' => $record->subscription_status ?: '-',
                'redeemed' => $record->redeemed_at?->format('M j, Y') ?? '-',
                'preview' => [
                    'eyebrow' => 'Coupon redemption',
                    'summary' => ($record->program?->code ?? 'Coupon').' · '.$record->email,
                    'sections' => [[
                        'title' => 'Redemption',
                        'fields' => [
                            ['label' => 'Program', 'value' => $record->program?->code],
                            ['label' => 'Subscriber', 'value' => $record->user?->name],
                            ['label' => 'Email', 'value' => $record->email],
                            ['label' => 'Subscription status', 'value' => $record->subscription_status],
                            ['label' => 'Redeemed at', 'value' => $record->redeemed_at?->format('M j, Y g:i A')],
                            ['label' => 'Stripe subscription ID', 'value' => $record->stripe_subscription_id],
                            ['label' => 'Stripe checkout session', 'value' => $record->stripe_checkout_session_id],
                        ],
                    ]],
                ],
            ],
            'keyword-index' => [
                'id' => $record->id,
                'keyword' => $record->label,
                'type' => $record->keyword_type,
                'sector' => $record->sector ?: '-',
                'source' => str_replace('_', ' ', $record->source ?: 'manual'),
                'status' => $record->trashed() ? 'deleted' : ($record->archived_at !== null ? 'archived' : 'live'),
                'preview' => [
                    'eyebrow' => 'Indexed keyword',
                    'summary' => $record->label,
                    'sections' => [
                        [
                            'title' => 'Keyword',
                            'fields' => [
                                ['label' => 'Label', 'value' => $record->label],
                                ['label' => 'Normalized label', 'value' => $record->normalized_label],
                                ['label' => 'Type', 'value' => $record->keyword_type],
                                ['label' => 'Sector', 'value' => $record->sector],
                                ['label' => 'Source', 'value' => $record->source],
                                ['label' => 'Usage count', 'value' => $this->formatCount((int) $record->usage_count)],
                            ],
                        ],
                    ],
                ],
            ],
            default => [],
        };
    }

    /**
     * @return array<string, mixed>
     */
    private function mapSubscriptionRow(Subscription $record): array
    {
        $usage = $this->subscriptionUsage($record);

        return [
            'id' => $record->id,
            'subscriber' => match (true) {
                $record->user !== null && filled($record->user->name) && filled($record->user->email) => $record->user->name.' / '.$record->user->email,
                $record->user !== null && filled($record->user->email) => $record->user->email,
                $record->user !== null && filled($record->user->name) => $record->user->name,
                default => 'Unknown',
            },
            'plan' => $record->plan?->name ?? '-',
            'credits' => $this->creditSummary($usage['search']),
            'status' => $record->trashed() ? 'deleted' : $record->status,
            'renewal' => $record->current_period_ends_at?->format('M j') ?? '-',
            'preview' => [
                'eyebrow' => 'Subscription',
                'summary' => $record->plan?->name ?? $record->status,
                'sections' => [
                    [
                        'title' => 'Subscriber',
                        'fields' => [
                            ['label' => 'Name', 'value' => $record->user?->name],
                            ['label' => 'Email', 'value' => $record->user?->email],
                            ['label' => 'Status', 'value' => $record->trashed() ? 'deleted' : $record->status],
                            ['label' => 'Plan', 'value' => $record->plan?->name],
                        ],
                    ],
                    [
                        'title' => 'Usage',
                        'fields' => [
                            ['label' => 'Search credits', 'value' => $this->usageSummary($usage['search'])],
                            ['label' => 'Video bookmarks', 'value' => $this->usageSummary($usage['video_bookmarks'])],
                            ['label' => 'Search bookmarks', 'value' => $this->usageSummary($usage['search_bookmarks'])],
                            ['label' => 'Video analysis', 'value' => $this->usageSummary($usage['video_analysis'])],
                        ],
                    ],
                    [
                        'title' => 'Stripe',
                        'fields' => [
                            ['label' => 'Stripe subscription ID', 'value' => $record->stripe_subscription_id],
                            ['label' => 'Stripe customer ID', 'value' => $record->stripe_customer_id],
                        ],
                    ],
                ],
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function mapUserRow(User $record): array
    {
        $usage = $this->userUsage($record);

        return [
            'id' => $record->id,
            'user' => $record->name ?: $record->email,
            'email' => $record->email ?: '-',
            'plan' => $record->subscriptions()->latest('created_at')->first()?->plan?->slug ?? 'free',
            'credits' => $this->creditSummary($usage['search']),
            'status' => $record->trashed() ? 'deleted' : 'active',
            'joined_at' => $record->created_at?->format('M j, Y') ?? '-',
            'preview' => [
                'eyebrow' => 'User account',
                'summary' => $record->email ?: $record->name,
                'sections' => [
                    [
                        'title' => 'Account',
                        'fields' => [
                            ['label' => 'Name', 'value' => $record->name],
                            ['label' => 'Email', 'value' => $record->email],
                            ['label' => 'Current plan', 'value' => $record->subscriptions()->latest('created_at')->first()?->plan?->slug ?? 'free'],
                            ['label' => 'Status', 'value' => $record->trashed() ? 'deleted' : 'active'],
                            ['label' => 'Email verified', 'value' => $this->yesNo($record->email_verified_at !== null)],
                            ['label' => 'Free search used', 'value' => $this->yesNo($record->free_search_used_at !== null)],
                        ],
                    ],
                    [
                        'title' => 'Usage',
                        'fields' => [
                            ['label' => 'Search credits', 'value' => $this->usageSummary($usage['search'])],
                            ['label' => 'Video bookmarks', 'value' => $this->usageSummary($usage['video_bookmarks'])],
                            ['label' => 'Search bookmarks', 'value' => $this->usageSummary($usage['search_bookmarks'])],
                            ['label' => 'Video analysis', 'value' => $this->usageSummary($usage['video_analysis'])],
                        ],
                    ],
                    [
                        'title' => 'Relationships',
                        'fields' => [
                            ['label' => 'Searches owned', 'value' => $this->formatCount((int) $record->customKeywordSearches()->count())],
                            ['label' => 'Inquiries sent', 'value' => $this->formatCount((int) $record->inquiries()->count())],
                            ['label' => 'Video bookmarks', 'value' => $this->formatCount((int) $record->videoBookmarks()->count())],
                            ['label' => 'Analyses created', 'value' => $this->formatCount((int) $record->videoAnalyses()->count())],
                        ],
                    ],
                ],
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function mapCouponProgramRow(ManagedCouponProgram $record): array
    {
        $redeemed = $record->redeemedCount();
        $cap = $record->max_redemptions;

        return [
            'id' => $record->id,
            'program' => $record->code,
            'plan' => $record->plan_slug,
            'redemptions' => $cap === null ? $redeemed.' / ∞' : $redeemed.' / '.$cap,
            'status' => $record->trashed() ? 'deleted' : ($record->is_active ? 'active' : 'inactive'),
            'preview' => [
                'eyebrow' => 'Coupon program',
                'summary' => $record->name.' ('.$record->code.')',
                'sections' => [
                    [
                        'title' => 'Program',
                        'fields' => [
                            ['label' => 'Code', 'value' => $record->code],
                            ['label' => 'Name', 'value' => $record->name],
                            ['label' => 'Link path', 'value' => $record->link_path],
                            ['label' => 'Plan slug', 'value' => $record->plan_slug],
                            ['label' => 'Billing cycle', 'value' => $record->billing_cycle],
                            ['label' => 'Status', 'value' => $record->is_active ? 'active' : 'inactive'],
                        ],
                    ],
                    [
                        'title' => 'Redemptions',
                        'fields' => [
                            ['label' => 'Redeemed', 'value' => (string) $redeemed],
                            ['label' => 'Max redemptions', 'value' => $cap === null ? 'Unlimited' : (string) $cap],
                            ['label' => 'Remaining', 'value' => $record->remainingSlots() === null ? 'Unlimited' : (string) $record->remainingSlots()],
                        ],
                    ],
                    [
                        'title' => 'Eligibility',
                        'fields' => [
                            ['label' => 'Allowed domain', 'value' => $record->allowed_domain],
                            ['label' => 'Whitelist only', 'value' => $this->yesNo($record->whitelist_only)],
                            ['label' => 'Trial only', 'value' => $this->yesNo($record->trial_only)],
                            ['label' => 'Skip card collection', 'value' => $this->yesNo(! $record->collect_payment_method)],
                            ['label' => 'Block trial-used', 'value' => $this->yesNo($record->block_trial_used)],
                            ['label' => 'Block reverted-free', 'value' => $this->yesNo($record->block_reverted_free)],
                        ],
                    ],
                    [
                        'title' => 'Stripe',
                        'fields' => [
                            ['label' => 'Coupon ID', 'value' => $record->stripe_coupon_id],
                            ['label' => 'Promotion code ID', 'value' => $record->stripe_promotion_code_id],
                        ],
                    ],
                ],
            ],
        ];
    }

    /**
     * Subscription "type" filter: Regular (no coupon) plus one entry per
     * managed program (Internal = IGNITEBB, VIP = IVANVIP).
     *
     * @return array<int, array<string, string>>
     */
    private function subscriptionTypeOptions(): array
    {
        $programs = ManagedCouponProgram::query()
            ->withTrashed()
            ->orderBy('code')
            ->get(['code', 'name'])
            ->map(fn (ManagedCouponProgram $program): array => [
                'value' => (string) $program->code,
                'label' => $program->name.' ('.$program->code.')',
            ])
            ->all();

        return [['value' => 'regular', 'label' => 'Regular'], ...$programs];
    }

    /**
     * User ids that redeemed a managed coupon program (optionally a specific
     * program code). Redemptions always carry a user id, so this is null-safe
     * for filtering the subscriptions listing.
     *
     * @return array<int, int>
     */
    private function couponSubscriberUserIds(?string $programCode): array
    {
        return ManagedCouponRedemption::query()
            ->whereNotNull('redeemed_at')
            ->when($programCode !== null, fn (Builder $query) => $query->whereHas(
                'program',
                fn (Builder $inner) => $inner->where('code', $programCode),
            ))
            ->pluck('user_id')
            ->filter()
            ->map(fn ($id): int => (int) $id)
            ->unique()
            ->values()
            ->all();
    }

    /**
     * @return array<int, array<string, string>>
     */
    private function couponProgramOptions(): array
    {
        return ManagedCouponProgram::query()
            ->withTrashed()
            ->orderBy('code')
            ->get(['code', 'name'])
            ->map(fn (ManagedCouponProgram $program): array => ['value' => (string) $program->code, 'label' => $program->code])
            ->all();
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
     * Purchasable plan slugs for a coupon program. `free` is intentionally
     * excluded — a coupon always maps to a paid plan.
     *
     * @return array<int, array<string, string>>
     */
    private function couponPlanSlugOptions(): array
    {
        $options = PricingPlan::query()
            ->orderBy('amount')
            ->get(['slug', 'name', 'duration'])
            ->map(function (PricingPlan $plan): array {
                $duration = strtolower((string) ($plan->duration ?? 'monthly'));
                $label = $plan->name;

                if (in_array($duration, ['monthly', 'annual'], true)) {
                    $label .= ' ('.ucfirst($duration).')';
                }

                return ['value' => (string) $plan->slug, 'label' => $label];
            })
            ->all();

        return $options === [] ? [['value' => 'growth', 'label' => 'growth']] : $options;
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
                'preview' => [
                    'eyebrow' => 'Admin access',
                    'summary' => 'Config-driven root administrator',
                    'sections' => [
                        [
                            'title' => 'Access',
                            'fields' => [
                                ['label' => 'Root email', 'value' => (string) config('admin.root_email')],
                                ['label' => 'Role', 'value' => 'root'],
                                ['label' => 'Status', 'value' => 'active'],
                            ],
                        ],
                    ],
                ],
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
            'viral-videos', 'plans' => ['preview' => true, 'edit' => true, 'archive' => true, 'delete' => true],
            // Searches are an audit trail of what customers ran. Editing or
            // deleting one here would rewrite their history, so this listing
            // stays read-only.
            'searches' => ['preview' => true, 'edit' => false, 'archive' => false, 'delete' => false],
            'inquiries' => ['preview' => true, 'edit' => false, 'archive' => false, 'delete' => false],
            'subscription' => ['preview' => true, 'edit' => true, 'archive' => false, 'delete' => true],
            'users' => ['preview' => true, 'edit' => true, 'archive' => false, 'delete' => true, 'impersonate' => true],
            'keyword-index' => ['preview' => true, 'edit' => true, 'archive' => true, 'delete' => true],
            'admin-users' => ['preview' => true, 'edit' => false, 'archive' => false, 'delete' => false],
            'coupon-programs' => ['preview' => true, 'edit' => true, 'archive' => false, 'delete' => false],
            'coupon-whitelist' => ['preview' => true, 'edit' => false, 'archive' => false, 'delete' => true],
            'coupon-usage' => ['preview' => true, 'edit' => false, 'archive' => false, 'delete' => false],
            default => ['preview' => false, 'edit' => false, 'archive' => false, 'delete' => false],
        };
    }

    /**
     * @return array{search: array{used: int, limit: int, remaining: int}, video_bookmarks: array{used: int, limit: int}, search_bookmarks: array{used: int, limit: int}, video_analysis: array{used: int, limit: int}}
     */
    private function subscriptionUsage(Subscription $subscription): array
    {
        $metadata = $subscription->metadata ?? [];
        $searchLimit = (int) data_get($metadata, 'subscription.search_limits.limit', 0);
        $searchUsed = max(0, (int) data_get($metadata, 'subscription.search_limits.used', 0));

        return [
            'search' => [
                'used' => $searchUsed,
                'limit' => $searchLimit,
                'remaining' => $searchLimit === -1 ? -1 : max(0, $searchLimit - $searchUsed),
            ],
            'video_bookmarks' => [
                'used' => max(0, (int) data_get($metadata, 'subscription.viral_video_bookmarks.used', 0)),
                'limit' => (int) data_get($metadata, 'subscription.viral_video_bookmarks.limit', 0),
            ],
            'search_bookmarks' => [
                'used' => max(0, (int) data_get($metadata, 'subscription.search_bookmarks.used', 0)),
                'limit' => (int) data_get($metadata, 'subscription.search_bookmarks.limit', 0),
            ],
            'video_analysis' => [
                'used' => max(0, (int) data_get($metadata, 'subscription.video_analysis.used', 0)),
                'limit' => (int) data_get($metadata, 'subscription.video_analysis.limit', 0),
            ],
        ];
    }

    /**
     * @return array{search: array{used: int, limit: int, remaining: int}, video_bookmarks: array{used: int, limit: int}, search_bookmarks: array{used: int, limit: int}, video_analysis: array{used: int, limit: int}}
     */
    private function userUsage(User $user): array
    {
        $subscription = $user->relationLoaded('subscriptions')
            ? $user->subscriptions->sortByDesc('created_at')->first()
            : $user->subscriptions()->latest('created_at')->first();

        if (! $subscription instanceof Subscription) {
            $videoBookmarksUsed = (int) VideoBookmark::query()->where('user_id', $user->id)->count();
            $videoAnalysisUsed = (int) VideoAnalysis::query()->where('user_id', $user->id)->where('counts_toward_quota', true)->count();

            return [
                'search' => [
                    'used' => 0,
                    'limit' => 0,
                    'remaining' => 0,
                ],
                'video_bookmarks' => ['used' => $videoBookmarksUsed, 'limit' => 0],
                'search_bookmarks' => ['used' => 0, 'limit' => 0],
                'video_analysis' => ['used' => $videoAnalysisUsed, 'limit' => 0],
            ];
        }

        return $this->subscriptionUsage($subscription);
    }

    /**
     * @param  array{used: int, limit: int, remaining?: int}  $usage
     */
    private function creditSummary(array $usage): string
    {
        return sprintf(
            '%s left / %s used',
            number_format((int) ($usage['remaining'] ?? max(0, $usage['limit'] - $usage['used']))),
            number_format((int) $usage['used'])
        );
    }

    /**
     * @param  array{used: int, limit: int, remaining?: int}  $usage
     */
    private function usageSummary(array $usage): string
    {
        return sprintf(
            '%s used / %s limit%s',
            number_format((int) $usage['used']),
            $this->limitLabel((int) $usage['limit']),
            array_key_exists('remaining', $usage)
                ? ' / '.number_format((int) ($usage['remaining'] ?? 0)).' left'
                : ''
        );
    }

    private function limitLabel(int $limit): string
    {
        return $limit === -1 ? 'Unlimited' : number_format($limit);
    }

    private function yesNo(bool $value): string
    {
        return $value ? 'Yes' : 'No';
    }

    private function formatCount(?int $value): string
    {
        return number_format(max(0, (int) $value));
    }

    /**
     * @param  array<int, string>|null  $tags
     */
    private function tagList(?array $tags): ?string
    {
        if (! is_array($tags) || $tags === []) {
            return null;
        }

        return implode(', ', array_map(
            static fn (string $tag): string => str_starts_with($tag, '#') ? $tag : '#'.$tag,
            array_values(array_filter($tags, static fn ($tag): bool => filled($tag))),
        ));
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
                ['name' => 'search_credits_limit', 'label' => 'Search credits per period', 'type' => 'number', 'min' => -1, 'help' => '-1 means unlimited. Stored in plan metadata and drives the credit allowance for this plan.'],
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
                ['name' => 'search_credits_limit', 'label' => 'Plan search credits per period', 'type' => 'number', 'min' => -1, 'help' => '-1 means unlimited. Edits the plan metadata - this changes the allowance for every subscriber on this plan.'],
                ['name' => 'video_bookmark_limit', 'label' => 'Plan video bookmark limit', 'type' => 'number', 'min' => -1, 'help' => 'Edits the plan metadata for every subscriber on this plan.'],
                ['name' => 'search_bookmark_limit', 'label' => 'Plan search bookmark limit', 'type' => 'number', 'min' => -1, 'help' => 'Edits the plan metadata for every subscriber on this plan.'],
                ['name' => 'video_analysis_limit', 'label' => 'Plan video analysis limit', 'type' => 'number', 'min' => -1, 'help' => 'Edits the plan metadata for every subscriber on this plan.'],
                ['name' => 'stripe_subscription_id', 'label' => 'Stripe subscription ID', 'type' => 'text'],
                ['name' => 'stripe_customer_id', 'label' => 'Stripe customer ID', 'type' => 'text'],
            ],
            'users' => [
                ['name' => 'name', 'label' => 'Name', 'type' => 'text'],
                ['name' => 'email', 'label' => 'Email', 'type' => 'text', 'rules' => ['required', 'email', 'max:255', 'unique:users,email,{id}']],
                ['name' => 'credits', 'label' => 'Search credits remaining', 'type' => 'number'],
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
            'coupon-programs' => [
                ['name' => 'code', 'label' => 'Code', 'type' => 'text', 'help' => 'Uppercase identifier, e.g. IGNITEBB. Not shown to users.', 'rules' => ['required', 'string', 'max:60', 'unique:managed_coupon_programs,code,{id}']],
                ['name' => 'name', 'label' => 'Name', 'type' => 'text', 'rules' => ['required', 'string', 'max:120']],
                ['name' => 'plan_slug', 'label' => 'Plan', 'type' => 'select', 'options' => $this->couponPlanSlugOptions()],
                ['name' => 'billing_cycle', 'label' => 'Billing cycle', 'type' => 'select', 'options' => ['monthly', 'annual']],
                ['name' => 'max_redemptions', 'label' => 'Max redemptions', 'type' => 'number', 'min' => 0, 'help' => 'Leave blank/0 handling: 0 means no slots. Cap on successful redemptions.'],
                ['name' => 'allowed_domain', 'label' => 'Allowed email domain', 'type' => 'text', 'help' => 'Optional. Leave blank to allow any signed-in email, or set a domain like igniteamz.com to restrict access unless whitelist-only is on.'],
                ['name' => 'whitelist_only', 'label' => 'Whitelist only', 'type' => 'toggle', 'help' => 'Only admin-added emails are eligible. When this is on, the domain rule is ignored.'],
                ['name' => 'trial_only', 'label' => 'Trial only', 'type' => 'toggle'],
                ['name' => 'collect_payment_method', 'label' => 'Require card at checkout', 'type' => 'toggle', 'help' => 'Off = skip card collection when Stripe allows a $0 start.'],
                ['name' => 'block_trial_used', 'label' => 'Block if trial already used', 'type' => 'toggle'],
                ['name' => 'block_reverted_free', 'label' => 'Block if reverted to free', 'type' => 'toggle'],
                ['name' => 'stripe_coupon_id', 'label' => 'Stripe coupon ID', 'type' => 'text'],
                ['name' => 'stripe_promotion_code_id', 'label' => 'Stripe promotion code ID', 'type' => 'text'],
                ['name' => 'is_active', 'label' => 'Active', 'type' => 'toggle'],
            ],
            'coupon-whitelist' => [
                ['name' => 'program_code', 'label' => 'Program', 'type' => 'select', 'options' => $this->couponProgramOptions()],
                ['name' => 'email', 'label' => 'Email', 'type' => 'text', 'rules' => ['required', 'email', 'max:191']],
                ['name' => 'note', 'label' => 'Note', 'type' => 'text'],
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
                'credits' => (int) data_get($record->metadata, 'subscription.search_limits.limit', 0) === -1
                    ? -1
                    : max(0, (int) data_get($record->metadata, 'subscription.search_limits.limit', 0) - (int) data_get($record->metadata, 'subscription.search_limits.used', 0)),
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
                'credits' => ($subscription = $record->subscriptions()->latest('created_at')->first())
                    ? ((int) data_get($subscription->metadata, 'subscription.search_limits.limit', 0) === -1
                        ? -1
                        : max(0, (int) data_get($subscription->metadata, 'subscription.search_limits.limit', 0) - (int) data_get($subscription->metadata, 'subscription.search_limits.used', 0)))
                    : 0,
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
            'coupon-programs' => [
                'code' => $record->code,
                'name' => $record->name,
                'plan_slug' => $record->plan_slug,
                'billing_cycle' => $record->billing_cycle,
                'max_redemptions' => (int) ($record->max_redemptions ?? 0),
                'allowed_domain' => $record->allowed_domain,
                'whitelist_only' => (bool) $record->whitelist_only,
                'trial_only' => (bool) $record->trial_only,
                'collect_payment_method' => (bool) $record->collect_payment_method,
                'block_trial_used' => (bool) $record->block_trial_used,
                'block_reverted_free' => (bool) $record->block_reverted_free,
                'stripe_coupon_id' => $record->stripe_coupon_id,
                'stripe_promotion_code_id' => $record->stripe_promotion_code_id,
                'is_active' => (bool) $record->is_active,
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
            'coupon-whitelist' => [
                'program_code' => (string) (ManagedCouponProgram::query()->orderBy('code')->value('code') ?? ''),
                'email' => '',
                'note' => '',
            ],
            'coupon-programs' => [
                'code' => '',
                'name' => '',
                'plan_slug' => (string) (PricingPlan::query()->orderBy('amount')->value('slug') ?? 'growth'),
                'billing_cycle' => 'monthly',
                'max_redemptions' => 0,
                'allowed_domain' => '',
                'whitelist_only' => false,
                'trial_only' => false,
                'collect_payment_method' => true,
                'block_trial_used' => false,
                'block_reverted_free' => false,
                'stripe_coupon_id' => '',
                'stripe_promotion_code_id' => '',
                'is_active' => true,
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
            'coupon-programs' => 'No coupon programs match the current filters yet.',
            'coupon-whitelist' => 'No whitelist entries match the current filters yet.',
            'coupon-usage' => 'No coupon redemptions match the current filters yet.',
            default => 'No records match the current filters yet.',
        };
    }

    public function searchPlaceholder(string $resource): string
    {
        return 'Search '.Str::lower($this->title($resource));
    }
}
