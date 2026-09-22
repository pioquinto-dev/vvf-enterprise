<?php

namespace App\Services\Admin\Listings;

use App\Models\CustomKeywordSearch;
use App\Models\EmailTemplate;
use App\Models\IndexedKeyword;
use App\Models\ManagedCouponProgram;
use App\Models\ManagedCouponWhitelistEntry;
use App\Models\PricingPlan;
use App\Models\Subscription;
use App\Models\User;
use App\Models\ViralVideo;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use App\Support\EmailFieldLibrary;
use App\Support\EmailTemplateRegistry;
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
            'keyword-index' => IndexedKeyword::withTrashed()->find($id),
            'coupon-programs' => ManagedCouponProgram::withTrashed()->find($id),
            'coupon-whitelist' => ManagedCouponWhitelistEntry::find($id),
            'email-templates' => EmailTemplate::withTrashed()->whereKey($id)->first(),
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
            'keyword-index' => $this->updateIndexedKeyword($record, $input),
            'coupon-programs' => $this->updateCouponProgram($record, $input),
            'email-templates' => $this->updateEmailTemplate($record, $input),
            default => throw ValidationException::withMessages(['resource' => 'This resource cannot be edited.']),
        };
    }

    /**
     * @param  array<string, mixed>  $input
     */
    public function create(string $resource, array $input): Model
    {
        return match ($resource) {
            'plans' => $this->createPlan($input),
            'keyword-index' => $this->createIndexedKeyword($input),
            'coupon-whitelist' => $this->createCouponWhitelistEntry($input),
            'coupon-programs' => $this->createCouponProgram($input),
            'email-templates' => $this->createEmailTemplate($input),
            default => throw ValidationException::withMessages(['resource' => 'This resource cannot be created.']),
        };
    }

    public function archive(Model $record, bool $archived): void
    {
        if (! in_array($record::class, [ViralVideo::class, PricingPlan::class, IndexedKeyword::class], true)) {
            throw ValidationException::withMessages(['archive' => 'This resource cannot be archived.']);
        }

        $record->forceFill(['archived_at' => $archived ? now() : null])->save();
    }

    public function delete(Model $record): void
    {
        $record->delete();

        // Email templates are read through a cached registry; without this the
        // one just removed keeps sending until the cache expires.
        if ($record instanceof EmailTemplate) {
            EmailTemplateRegistry::forget();
        }
    }

    public function restore(Model $record): void
    {
        $record->restore();

        if ($record instanceof EmailTemplate) {
            EmailTemplateRegistry::forget();
        }
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
     * @param  array<string, mixed>  $input
     */
    private function createPlan(array $input): PricingPlan
    {
        $plan = new PricingPlan([
            'id' => (string) Str::ulid(),
            'slug' => (string) ($input['slug'] ?? ''),
            'name' => (string) ($input['name'] ?? ''),
            'description' => (string) ($input['description'] ?? ''),
            'plan_type' => (string) ($input['plan_type'] ?? ''),
            'stripe_product_id' => blank($input['stripe_product_id'] ?? null) ? null : (string) $input['stripe_product_id'],
            'stripe_price_id' => blank($input['stripe_price_id'] ?? null) ? null : (string) $input['stripe_price_id'],
            'price_cents' => (int) ($input['price_cents'] ?? 0),
            'currency' => (string) ($input['currency'] ?? 'usd'),
            'interval' => (string) ($input['interval'] ?? 'month'),
            'interval_count' => (int) ($input['interval_count'] ?? 1),
            'amount' => (float) ($input['amount'] ?? 0),
            'annual_amount' => (float) ($input['annual_amount'] ?? 0),
            'saved_amount' => (float) ($input['saved_amount'] ?? 0),
            'unit_amount' => (int) ($input['unit_amount'] ?? 0),
            'duration' => (string) ($input['duration'] ?? 'monthly'),
            'plan_environment' => (string) ($input['plan_environment'] ?? 'production'),
            'is_active' => (bool) ($input['is_active'] ?? true),
        ]);

        $plan->metadata = $this->mergePlanMetadata($plan, $input);
        $plan->archived_at = ($input['archived'] ?? false) ? now() : null;
        $plan->save();

        return $plan;
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
            $metadata['subscription']['search_limits']['limit'] = max(-1, (int) $input['search_credits_limit']);
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
            $metadata['subscription']['viral_video_bookmarks']['limit'] = max(-1, (int) $input['video_bookmark_limit']);
        }

        if (array_key_exists('search_bookmark_limit', $input) && $input['search_bookmark_limit'] !== null) {
            $metadata['subscription']['search_bookmarks']['limit'] = max(-1, (int) $input['search_bookmark_limit']);
        }

        if (array_key_exists('video_analysis_limit', $input) && $input['video_analysis_limit'] !== null) {
            $metadata['subscription']['video_analysis']['limit'] = max(-1, (int) $input['video_analysis_limit']);
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

        if (array_key_exists('credits', $input) && $input['credits'] !== null) {
            $this->setSearchCreditsRemaining($subscription, (int) $input['credits']);
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
        foreach (['name', 'email'] as $field) {
            if (array_key_exists($field, $input) && $input[$field] !== null) {
                $user->{$field} = (string) $input[$field];
            }
        }

        if (array_key_exists('credits', $input) && $input['credits'] !== null) {
            $subscription = $user->subscriptions()
                ->whereIn('status', ['active', 'trialing', 'pending', 'paid', 'free'])
                ->orderByRaw("case when status = 'active' then 0 when status = 'trialing' then 1 when status = 'pending' then 2 when status = 'paid' then 3 else 4 end")
                ->latest('created_at')
                ->first();

            if ($subscription !== null) {
                $this->setSearchCreditsRemaining($subscription, (int) $input['credits']);
            }
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

    private function setSearchCreditsRemaining(Subscription $subscription, int $remaining): void
    {
        $metadata = (array) $subscription->metadata;
        $limit = max($remaining, (int) data_get($metadata, 'subscription.search_limits.limit', 0));

        if ($limit === -1) {
            return;
        }

        data_set($metadata, 'subscription.search_limits.used', max(0, $limit - max(0, min($limit, $remaining))));

        $subscription->forceFill(['metadata' => $metadata])->save();
    }

    /**
     * @param  array<string, mixed>  $input
     */
    /**
     * @param  array<string, mixed>  $input
     */
    /**
     * @param  array<string, mixed>  $input
     */
    private function createEmailTemplate(array $input): EmailTemplate
    {
        $key = (string) ($input['key'] ?? '');

        // A soft-deleted row still owns its key. Reviving it keeps the history
        // rather than colliding on the primary key.
        $existing = EmailTemplate::withTrashed()->whereKey($key)->first();

        if ($existing !== null) {
            if ($existing->deleted_at === null) {
                throw ValidationException::withMessages(['key' => 'A template with this key already exists.']);
            }

            $existing->restore();
            $this->updateEmailTemplate($existing, $input);

            return $existing;
        }

        $brevoId = (int) ($input['brevo_template_id'] ?? 0);

        $template = EmailTemplate::query()->create([
            'key' => $key,
            'label' => (string) ($input['label'] ?? $key),
            'subject' => (string) ($input['subject'] ?? 'BrandBeacon update'),
            'preview_text' => filled($input['preview_text'] ?? null) ? (string) $input['preview_text'] : null,
            'brevo_template_id' => $brevoId > 0 ? $brevoId : null,
            'tags' => [],
            'is_transactional' => (bool) ($input['is_transactional'] ?? false),
            // Cannot be on without somewhere to send.
            'is_enabled' => $brevoId > 0 && (bool) ($input['is_enabled'] ?? false),
            'description' => filled($input['description'] ?? null) ? (string) $input['description'] : null,
        ]);

        // A template created by hand gets its schedule from the same drawer
        // fields as an edit, so a new key is not left with no timing at all.
        $this->applySendSchedule($template, $input);
        $template->save();

        EmailTemplateRegistry::forget();

        return $template;
    }

    private function updateEmailTemplate(EmailTemplate $template, array $input): void
    {
        // `key` is offered by the shared field list so the create drawer can
        // ask for it. It is the primary key and what the app sends by, so a
        // rename here would orphan the template silently — ignore it on update.
        unset($input['key']);

        // Reference-only values the drawer renders; they are not columns.
        unset($input['built_in_params'], $input['given_sources'], $input['send_schedule']);

        foreach (['label', 'subject'] as $field) {
            if (array_key_exists($field, $input) && filled($input[$field])) {
                $template->{$field} = (string) $input[$field];
            }
        }

        // Preview text may be cleared, so it cannot use the filled() guard
        // above — an empty value means "no preview line".
        if (array_key_exists('preview_text', $input)) {
            $template->preview_text = filled($input['preview_text']) ? (string) $input['preview_text'] : null;
        }

        if (array_key_exists('brevo_template_id', $input)) {
            $id = (int) $input['brevo_template_id'];
            // 0 is how the form says "not mapped"; a template with no id fails
            // loudly at send time rather than silently mailing the wrong thing.
            $template->brevo_template_id = $id > 0 ? $id : null;
        }

        if (array_key_exists('description', $input)) {
            $template->description = filled($input['description']) ? (string) $input['description'] : null;
        }

        if (array_key_exists('extra_fields', $input)) {
            // Only keys that exist in the library, so a stale selection cannot
            // survive a field being removed from config.
            $template->extra_fields = array_values(array_filter(
                (array) $input['extra_fields'],
                fn ($key): bool => is_string($key) && EmailFieldLibrary::find($key) !== null,
            ));
        }

        foreach (['is_transactional', 'is_enabled', 'send_immediate'] as $flag) {
            if (array_key_exists($flag, $input)) {
                $template->{$flag} = (bool) $input[$flag];
            }
        }

        $this->applySendSchedule($template, $input);

        $template->save();

        // The registry caches for five minutes; an admin who just changed a
        // template expects the next send to use it.
        EmailTemplateRegistry::forget();
    }

    /**
     * The send schedule: when this email is allowed to go out.
     *
     * Every field can be cleared, and clearing them is meaningful — an empty row
     * falls back to config/email_lifecycle.php — so none of these can use a
     * filled() guard the way the copy fields do.
     *
     * Values are normalised here rather than trusted: a slot that does not parse
     * would not fail loudly, it would quietly never open, and the email would
     * stop going out with nothing to show why.
     *
     * @param  array<string, mixed>  $input
     */
    private function applySendSchedule(EmailTemplate $template, array $input): void
    {
        if (array_key_exists('send_trigger', $input)) {
            $trigger = is_string($input['send_trigger']) ? trim($input['send_trigger']) : '';
            $template->send_trigger = $trigger === '' ? null : $trigger;
        }

        foreach (['send_offset_days', 'send_offset_hours', 'send_interval_weeks'] as $field) {
            if (array_key_exists($field, $input)) {
                $value = $input[$field];
                $template->{$field} = $value === null || $value === '' ? null : (int) $value;
            }
        }

        if (array_key_exists('send_at', $input)) {
            $at = is_string($input['send_at']) ? trim($input['send_at']) : '';

            if ($at !== '' && preg_match('/^([01][0-9]|2[0-3]):[0-5][0-9]$/', $at) !== 1) {
                throw ValidationException::withMessages([
                    'send_at' => 'Use a 24-hour time like 07:40, or leave it blank for no slot.',
                ]);
            }

            $template->send_at = $at === '' ? null : $at;
        }

        if (array_key_exists('send_weekday', $input)) {
            $weekday = is_string($input['send_weekday']) ? strtolower(trim($input['send_weekday'])) : '';
            $days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

            if ($weekday !== '' && ! in_array($weekday, $days, true)) {
                throw ValidationException::withMessages([
                    'send_weekday' => 'Pick a weekday, or leave it blank for an email that is not on a cadence.',
                ]);
            }

            $template->send_weekday = $weekday === '' ? null : $weekday;
        }

        if (array_key_exists('send_anchor_date', $input)) {
            $anchor = is_string($input['send_anchor_date']) ? trim($input['send_anchor_date']) : '';

            if ($anchor !== '' && strtotime($anchor) === false) {
                throw ValidationException::withMessages([
                    'send_anchor_date' => 'Use a date like 2026-01-05, or leave it blank.',
                ]);
            }

            $template->send_anchor_date = $anchor === '' ? null : $anchor;
        }

        if (array_key_exists('send_timezone', $input)) {
            $zone = is_string($input['send_timezone']) ? trim($input['send_timezone']) : '';

            if ($zone !== '' && ! in_array($zone, timezone_identifiers_list(), true)) {
                throw ValidationException::withMessages([
                    'send_timezone' => 'Use an IANA timezone like America/New_York, or leave it blank to follow the lifecycle default.',
                ]);
            }

            $template->send_timezone = $zone === '' ? null : $zone;
        }

        // An interval above 1 with no anchor would count its fortnights from the
        // hard-coded default, which is almost certainly not the week the admin
        // had in mind. Ask rather than guess.
        if ((int) $template->send_interval_weeks > 1 && $template->send_anchor_date === null) {
            throw ValidationException::withMessages([
                'send_anchor_date' => 'An interval above 1 week needs an anchor date, so the cadence lands on the same fortnight for everyone.',
            ]);
        }

        if ($template->send_weekday === null && (int) $template->send_interval_weeks > 1) {
            throw ValidationException::withMessages([
                'send_weekday' => 'Pick the weekday this cadence goes out on.',
            ]);
        }
    }

    private function updateIndexedKeyword(IndexedKeyword $keyword, array $input): void
    {
        foreach (['label', 'keyword_type', 'sector', 'source'] as $field) {
            if (array_key_exists($field, $input) && $input[$field] !== null) {
                $keyword->{$field} = $input[$field] === '' ? null : (string) $input[$field];
            }
        }

        if (array_key_exists('usage_count', $input) && $input['usage_count'] !== null) {
            $keyword->usage_count = max(0, (int) $input['usage_count']);
        }

        if (array_key_exists('archived', $input)) {
            $keyword->archived_at = $input['archived'] ? ($keyword->archived_at ?? now()) : null;
        }

        if ($keyword->label !== null) {
            $keyword->normalized_label = app(\App\Services\CustomKeywordSearch\KeywordNormalizer::class)->keyword((string) $keyword->label);
        }

        $keyword->save();
    }

    /**
     * @param  array<string, mixed>  $input
     */
    private function updateCouponProgram(ManagedCouponProgram $program, array $input): void
    {
        $this->fillCouponProgram($program, $input);
        $program->save();
    }

    /**
     * @param  array<string, mixed>  $input
     */
    private function createCouponProgram(array $input): ManagedCouponProgram
    {
        $program = new ManagedCouponProgram([
            // Sensible defaults; overwritten by fillCouponProgram below.
            'billing_cycle' => 'monthly',
            'collect_payment_method' => true,
            'is_active' => true,
        ]);

        $this->fillCouponProgram($program, $input);

        if (blank($program->code) || blank($program->plan_slug)) {
            throw ValidationException::withMessages(['code' => 'Code and plan are required.']);
        }

        $program->save();

        return $program;
    }

    /**
     * Shared field assignment for coupon-program create and update.
     *
     * @param  array<string, mixed>  $input
     */
    private function fillCouponProgram(ManagedCouponProgram $program, array $input): void
    {
        if (array_key_exists('code', $input) && filled($input['code'])) {
            $program->code = strtoupper(trim((string) $input['code']));
        }

        if (array_key_exists('name', $input) && filled($input['name'])) {
            $program->name = (string) $input['name'];
        }

        if (filled($program->code)) {
            $program->link_path = $this->uniqueCouponLinkPath(
                $program->code,
                $program->exists ? $program->getKey() : null,
            );
        }

        foreach (['plan_slug', 'billing_cycle'] as $field) {
            if (array_key_exists($field, $input) && filled($input[$field])) {
                $program->{$field} = (string) $input[$field];
            }
        }

        if (array_key_exists('max_redemptions', $input)) {
            $program->max_redemptions = $input['max_redemptions'] === null || $input['max_redemptions'] === ''
                ? null
                : max(0, (int) $input['max_redemptions']);
        }

        if (array_key_exists('allowed_domain', $input)) {
            $program->allowed_domain = blank($input['allowed_domain']) ? null : strtolower(trim((string) $input['allowed_domain']));
        }

        foreach (['whitelist_only', 'trial_only', 'collect_payment_method', 'block_trial_used', 'block_reverted_free', 'is_active'] as $flag) {
            if (array_key_exists($flag, $input)) {
                $program->{$flag} = (bool) $input[$flag];
            }
        }

        foreach (['stripe_coupon_id', 'stripe_promotion_code_id'] as $field) {
            if (array_key_exists($field, $input)) {
                $program->{$field} = blank($input[$field]) ? null : (string) $input[$field];
            }
        }
    }

    private function uniqueCouponLinkPath(string $code, mixed $ignoreId = null): string
    {
        $slug = Str::of($code)
            ->lower()
            ->replaceMatches('/[^a-z0-9]+/', '-')
            ->trim('-')
            ->value();

        $slug = $slug !== '' ? $slug : 'coupon-program';
        $basePath = '/subscription/'.$slug;
        $path = $basePath;
        $suffix = 2;

        while ($this->couponLinkPathExists($path, $ignoreId)) {
            $path = $basePath.'-'.$suffix;
            $suffix++;
        }

        return $path;
    }

    private function couponLinkPathExists(string $path, mixed $ignoreId = null): bool
    {
        return ManagedCouponProgram::query()
            ->when($ignoreId !== null, fn ($query) => $query->whereKeyNot($ignoreId))
            ->where('link_path', $path)
            ->exists();
    }

    /**
     * @param  array<string, mixed>  $input
     */
    private function createCouponWhitelistEntry(array $input): ManagedCouponWhitelistEntry
    {
        $program = ManagedCouponProgram::query()->where('code', strtoupper(trim((string) ($input['program_code'] ?? ''))))->first();

        if ($program === null) {
            throw ValidationException::withMessages(['program_code' => 'Select a valid coupon program.']);
        }

        $email = ManagedCouponWhitelistEntry::normalizeEmail($input['email'] ?? '');

        if ($email === '') {
            throw ValidationException::withMessages(['email' => 'A valid email is required.']);
        }

        if ($program->whitelistEntries()->where('email', $email)->exists()) {
            throw ValidationException::withMessages(['email' => 'This email is already whitelisted for that program.']);
        }

        $adminUser = request()->session()->get('admin.user');
        $addedBy = is_array($adminUser)
            ? (string) ($adminUser['email'] ?? 'admin')
            : (string) (config('admin.root_email') ?? 'admin');

        return $program->whitelistEntries()->create([
            'email' => $email,
            'note' => blank($input['note'] ?? null) ? null : (string) $input['note'],
            'added_by' => $addedBy,
        ]);
    }

    /**
     * @param  array<string, mixed>  $input
     */
    private function createIndexedKeyword(array $input): IndexedKeyword
    {
        $label = trim((string) ($input['label'] ?? ''));
        $normalizer = app(\App\Services\CustomKeywordSearch\KeywordNormalizer::class);

        return IndexedKeyword::query()->create([
            'label' => $label,
            'normalized_label' => $normalizer->keyword($label),
            'keyword_type' => (string) ($input['keyword_type'] ?? IndexedKeyword::TYPE_BRAND),
            'sector' => blank($input['sector'] ?? null) ? null : (string) $input['sector'],
            'source' => blank($input['source'] ?? null) ? 'manual' : (string) $input['source'],
            'usage_count' => max(0, (int) ($input['usage_count'] ?? 0)),
            'archived_at' => ($input['archived'] ?? false) ? now() : null,
            'last_seen_at' => now(),
        ]);
    }
}
