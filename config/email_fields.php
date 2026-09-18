<?php

/*
 * The merge-field library.
 *
 * Every email already receives a fixed set of params built in code (see each
 * builder in App\Support\BrevoTransactionalEmail). This file adds a second,
 * admin-controlled set: fields anyone can switch on for a template from the
 * admin screen, without a deploy.
 *
 * The honest constraint, and the reason `source` exists: a field can only
 * resolve from an object the sending code actually has. A trial end date needs
 * a subscription; a search name needs a search. An email with no subscription
 * in scope cannot produce `subscriptionEndsAt` no matter what is ticked, so the
 * admin screen greys those out rather than letting someone add a field that
 * silently renders blank in a live email.
 *
 * Adding a field here is a code change, but adding one to an EMAIL is not, and
 * the second is the thing that happens weekly.
 *
 *   param  - the merge tag the template uses: {{ params.<param> }}
 *   source - which object it reads from: user, subscription, search, video
 *   get    - resolver, handed the source object
 *   sample - shown in the admin screen so an admin knows the shape
 */

use App\Models\CustomKeywordSearch;
use App\Models\Subscription;
use App\Models\User;
use App\Models\ViralVideo;

return [
    'fields' => [
        // ---- user -----------------------------------------------------------
        'user_first_name' => [
            'label' => 'First name',
            'group' => 'User',
            'source' => 'user',
            'param' => 'userFirstName',
            'sample' => 'Lester',
            'get' => fn (User $user): string => str($user->name)->trim()->before(' ')->value() ?: 'there',
        ],
        'user_full_name' => [
            'label' => 'Full name',
            'group' => 'User',
            'source' => 'user',
            'param' => 'userFullName',
            'sample' => 'Lester Pioquinto',
            'get' => fn (User $user): string => (string) $user->name,
        ],
        'user_email' => [
            'label' => 'Email address',
            'group' => 'User',
            'source' => 'user',
            'param' => 'userEmail',
            'sample' => 'lester@example.com',
            'get' => fn (User $user): string => (string) $user->email,
        ],
        'user_joined_on' => [
            'label' => 'Signed up on',
            'group' => 'User',
            'source' => 'user',
            'param' => 'userJoinedOn',
            'sample' => 'September 4, 2026',
            'get' => fn (User $user): string => $user->created_at?->timezone(config('app.timezone'))->format('F j, Y') ?? '',
        ],
        'user_free_search_used' => [
            'label' => 'Free search used',
            'group' => 'User',
            'source' => 'user',
            'param' => 'userFreeSearchUsed',
            'sample' => 'yes',
            'get' => fn (User $user): string => $user->free_search_used_at === null ? 'no' : 'yes',
        ],

        // ---- subscription ---------------------------------------------------
        'subscription_plan' => [
            'label' => 'Plan name',
            'group' => 'Subscription',
            'source' => 'subscription',
            'param' => 'subscriptionPlan',
            'sample' => 'Growth',
            'get' => fn (Subscription $s): string => ucfirst((string) ($s->plan?->name ?? $s->plan?->slug ?? 'Plan')),
        ],
        'subscription_status' => [
            'label' => 'Status',
            'group' => 'Subscription',
            'source' => 'subscription',
            'param' => 'subscriptionStatus',
            'sample' => 'active',
            'get' => fn (Subscription $s): string => (string) $s->status,
        ],
        'subscription_ends_at' => [
            'label' => 'Access ends on',
            'group' => 'Subscription',
            'source' => 'subscription',
            'param' => 'subscriptionEndsAt',
            'sample' => 'October 12, 2026',
            'get' => fn (Subscription $s): string => $s->current_period_ends_at?->timezone(config('app.timezone'))->format('F j, Y') ?? '',
        ],
        'subscription_renews_on' => [
            'label' => 'Renews on',
            'group' => 'Subscription',
            'source' => 'subscription',
            'param' => 'subscriptionRenewsOn',
            'sample' => 'October 12, 2026',
            'get' => fn (Subscription $s): string => $s->current_period_ends_at?->timezone(config('app.timezone'))->format('F j, Y') ?? '',
        ],
        'subscription_trial_ends_at' => [
            'label' => 'Trial ends on',
            'group' => 'Subscription',
            'source' => 'subscription',
            'param' => 'trialEndsOn',
            'sample' => 'September 27, 2026',
            'get' => fn (Subscription $s): string => $s->trial_ends_at?->timezone(config('app.timezone'))->format('F j, Y') ?? '',
        ],
        'subscription_trial_started_at' => [
            'label' => 'Trial started on',
            'group' => 'Subscription',
            'source' => 'subscription',
            'param' => 'trialStartedOn',
            'sample' => 'September 19, 2026',
            'get' => fn (Subscription $s): string => $s->trial_started_at?->timezone(config('app.timezone'))->format('F j, Y') ?? '',
        ],
        'subscription_canceled_at' => [
            'label' => 'Cancelled on',
            'group' => 'Subscription',
            'source' => 'subscription',
            'param' => 'canceledOn',
            'sample' => 'September 19, 2026',
            'get' => fn (Subscription $s): string => $s->canceled_at?->timezone(config('app.timezone'))->format('F j, Y') ?? '',
        ],
        'subscription_card_last4' => [
            'label' => 'Card last 4',
            'group' => 'Subscription',
            'source' => 'subscription',
            'param' => 'cardLastFour',
            'sample' => '4242',
            'get' => fn (Subscription $s): string => (string) data_get($s->metadata, 'card.last4', ''),
        ],

        // ---- search ---------------------------------------------------------
        'search_name' => [
            'label' => 'Search name',
            'group' => 'Search',
            'source' => 'search',
            'param' => 'searchLabel',
            'sample' => 'rhode skin',
            'get' => fn (CustomKeywordSearch $s): string => (string) ($s->name ?: $s->phrase),
        ],
        'search_type' => [
            'label' => 'Search type',
            'group' => 'Search',
            'source' => 'search',
            'param' => 'searchKind',
            'sample' => 'brand',
            'get' => fn (CustomKeywordSearch $s): string => (string) $s->search_type,
        ],
        'search_last_run_at' => [
            'label' => 'Last refreshed on',
            'group' => 'Search',
            'source' => 'search',
            'param' => 'searchLastRunOn',
            'sample' => 'September 18, 2026',
            'get' => fn (CustomKeywordSearch $s): string => $s->last_run_at?->timezone(config('app.timezone'))->format('F j, Y') ?? '',
        ],
        'search_next_run_at' => [
            'label' => 'Next refresh on',
            'group' => 'Search',
            'source' => 'search',
            'param' => 'searchNextRunOn',
            'sample' => 'September 25, 2026',
            'get' => fn (CustomKeywordSearch $s): string => $s->next_run_at?->timezone(config('app.timezone'))->format('F j, Y') ?? '',
        ],
        'search_url' => [
            'label' => 'Link to results',
            'group' => 'Search',
            'source' => 'search',
            'param' => 'searchUrlLink',
            'sample' => 'https://brandbeacon.io/library/12',
            'get' => fn (CustomKeywordSearch $s): string => url($s->url()),
        ],

        // ---- video ----------------------------------------------------------
        'video_handle' => [
            'label' => 'Creator handle',
            'group' => 'Video',
            'source' => 'video',
            'param' => 'topVideoHandle',
            'sample' => '@noteable',
            'get' => fn (ViralVideo $v): string => $v->username ? '@'.$v->username : '',
        ],
        'video_views' => [
            'label' => 'Views',
            'group' => 'Video',
            'source' => 'video',
            'param' => 'topVideoViews',
            'sample' => '4,600,000',
            'get' => fn (ViralVideo $v): string => number_format((int) ($v->views ?? 0)),
        ],
        'video_thumbnail' => [
            'label' => 'Thumbnail URL',
            'group' => 'Video',
            'source' => 'video',
            'param' => 'topVideoThumbnail',
            'sample' => 'https://…/cover.jpg',
            'get' => fn (ViralVideo $v): string => (string) ($v->thumbnail_url ?: $v->cover ?: ''),
        ],
    ],
];
