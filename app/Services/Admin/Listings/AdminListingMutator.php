<?php

namespace App\Services\Admin\Listings;

use App\Models\CustomKeywordSearch;
use App\Models\PricingPlan;
use App\Models\Subscription;
use App\Models\User;
use App\Models\ViralVideo;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\ValidationException;

/**
 * Write side of the admin listings.
 *
 * Deletes are always soft — every model behind these listings uses SoftDeletes,
 * and `forceDelete` is intentionally never called. Records here are referenced
 * by imports, saved searches, and billing history; a hard delete would leave
 * those pointing at nothing.
 */
class AdminListingMutator
{
    /**
     * Resolve a record by resource and id, including trashed rows so a deleted
     * record can still be restored.
     */
    public function find(string $resource, string $id): ?Model
    {
        return match ($resource) {
            'viral-videos' => ViralVideo::withTrashed()->find($id),
            'searches' => CustomKeywordSearch::withTrashed()->find($id),
            'plans' => PricingPlan::withTrashed()->find($id),
            'subscription' => Subscription::withTrashed()->with('user')->find($id),
            'users' => User::withTrashed()->find($id),
            default => null,
        };
    }

    /**
     * @param  array<string, mixed>  $input
     */
    public function update(string $resource, Model $record, array $input): void
    {
        match ($resource) {
            'viral-videos' => $this->updateViralVideo($record, $input),
            'plans' => $this->updatePlan($record, $input),
            'subscription' => $this->updateSubscription($record, $input),
            'users' => $this->updateUser($record, $input),
            default => throw ValidationException::withMessages(['resource' => 'This resource cannot be edited.']),
        };
    }

    public function archive(Model $record, bool $archived): void
    {
        if (! in_array($record::class, [ViralVideo::class, PricingPlan::class], true)) {
            throw ValidationException::withMessages(['archive' => 'This resource cannot be archived.']);
        }

        $record->forceFill(['archived_at' => $archived ? now() : null])->save();
    }

    public function delete(Model $record): void
    {
        $record->delete();
    }

    public function restore(Model $record): void
    {
        $record->restore();
    }

    /**
     * @param  array<string, mixed>  $input
     */
    private function updateViralVideo(ViralVideo $video, array $input): void
    {
        $video->fill([
            'title' => $input['title'] ?? $video->title,
            'video_status' => $input['video_status'] ?? $video->video_status,
        ]);

        $video->archived_at = ($input['archived'] ?? false) ? ($video->archived_at ?? now()) : null;
        $video->save();
    }

    /**
     * @param  array<string, mixed>  $input
     */
    private function updatePlan(PricingPlan $plan, array $input): void
    {
        foreach ([
            'name', 'slug', 'description', 'plan_type', 'currency', 'interval',
            'duration', 'stripe_product_id', 'stripe_price_id', 'plan_environment',
        ] as $field) {
            if (array_key_exists($field, $input) && $input[$field] !== null) {
                $plan->{$field} = (string) $input[$field];
            }
        }

        foreach (['amount', 'annual_amount', 'saved_amount'] as $field) {
            if (array_key_exists($field, $input) && $input[$field] !== null) {
                $plan->{$field} = (float) $input[$field];
            }
        }

        foreach (['price_cents', 'unit_amount', 'interval_count'] as $field) {
            if (array_key_exists($field, $input) && $input[$field] !== null) {
                $plan->{$field} = (int) $input[$field];
            }
        }

        $plan->is_active = (bool) ($input['is_active'] ?? $plan->is_active);
        $plan->metadata = $this->mergePlanMetadata($plan, $input);
        $plan->archived_at = ($input['archived'] ?? false) ? ($plan->archived_at ?? now()) : null;
        $plan->save();
    }

    /**
     * Credit allowances live inside the plan's JSON metadata, so they are
     * merged rather than assigned — the blob also carries cta, popular, and
     * trial flags this form never shows.
     *
     * @param  array<string, mixed>  $input
     * @return array<string, mixed>
     */
    private function mergePlanMetadata(PricingPlan $plan, array $input): array
    {
        $metadata = $plan->metadata ?? [];
        $metadata['settings'] ??= [
            'cta' => 'Choose plan',
            'popular' => false,
        ];
        $metadata['subscription'] ??= [
            'trialEnabled' => true,
            'search_limits' => ['used' => 0, 'limit' => 0],
            'viral_video_bookmarks' => ['used' => 0, 'limit' => 0],
            'search_bookmarks' => ['used' => 0, 'limit' => 0],
            'video_analysis' => ['used' => 0, 'limit' => 0],
        ];

        if (array_key_exists('search_credits_limit', $input) && $input['search_credits_limit'] !== null) {
            $metadata['subscription']['search_limits']['limit'] = max(0, (int) $input['search_credits_limit']);
        }

        if (array_key_exists('cta', $input) && $input['cta'] !== null) {
            $metadata['settings']['cta'] = (string) $input['cta'];
        }

        if (array_key_exists('popular', $input)) {
            $metadata['settings']['popular'] = (bool) $input['popular'];
        }

        if (array_key_exists('trial_enabled', $input)) {
            $metadata['subscription']['trialEnabled'] = (bool) $input['trial_enabled'];
        }

        if (array_key_exists('video_bookmark_limit', $input) && $input['video_bookmark_limit'] !== null) {
            $metadata['subscription']['viral_video_bookmarks']['limit'] = (int) $input['video_bookmark_limit'];
        }

        if (array_key_exists('search_bookmark_limit', $input) && $input['search_bookmark_limit'] !== null) {
            $metadata['subscription']['search_bookmarks']['limit'] = (int) $input['search_bookmark_limit'];
        }

        if (array_key_exists('video_analysis_limit', $input) && $input['video_analysis_limit'] !== null) {
            $metadata['subscription']['video_analysis']['limit'] = (int) $input['video_analysis_limit'];
        }

        return $metadata;
    }

    /**
     * @param  array<string, mixed>  $input
     */
    private function updateSubscription(Subscription $subscription, array $input): void
    {
        foreach (['status', 'plan_id', 'stripe_subscription_id', 'stripe_customer_id'] as $field) {
            if (array_key_exists($field, $input) && $input[$field] !== null && $input[$field] !== '') {
                $subscription->{$field} = (string) $input[$field];
            }
        }

        $subscription->save();

        // Credits live on the account, not the subscription row.
        if (array_key_exists('credits', $input) && $input['credits'] !== null && $subscription->user) {
            $subscription->user->forceFill([
                'monthly_credits_remaining' => max(0, (int) $input['credits']),
            ])->save();
        }

        // The allowance fields belong to the plan, so editing them here changes
        // every subscriber on that plan. The drawer says so explicitly.
        $plan = $subscription->plan()->first();

        if ($plan && (
            array_key_exists('search_credits_limit', $input)
            || array_key_exists('video_bookmark_limit', $input)
            || array_key_exists('search_bookmark_limit', $input)
            || array_key_exists('video_analysis_limit', $input)
        )) {
            $plan->metadata = $this->mergePlanMetadata($plan, $input);
            $plan->save();
        }
    }

    /**
     * @param  array<string, mixed>  $input
     */
    private function updateUser(User $user, array $input): void
    {
        foreach (['name', 'email', 'current_plan_slug', 'stripe_customer_id'] as $field) {
            if (array_key_exists($field, $input) && $input[$field] !== null) {
                $user->{$field} = (string) $input[$field];
            }
        }

        if (array_key_exists('credits', $input) && $input['credits'] !== null) {
            $user->monthly_credits_remaining = max(0, (int) $input['credits']);
        }

        // These two are timestamps the product reads as flags. Toggling one on
        // stamps "now" only when it was previously unset, so an existing date
        // is never quietly rewritten.
        if (array_key_exists('email_verified', $input)) {
            $user->email_verified_at = $input['email_verified'] ? ($user->email_verified_at ?? now()) : null;
        }

        if (array_key_exists('free_search_used', $input)) {
            $user->free_search_used_at = $input['free_search_used'] ? ($user->free_search_used_at ?? now()) : null;
        }

        // Blank means "leave it alone" — the field is write-only and the model
        // cast hashes whatever is assigned.
        if (! blank($input['password'] ?? null)) {
            $user->password = $input['password'];
        }

        $user->save();
    }
}
