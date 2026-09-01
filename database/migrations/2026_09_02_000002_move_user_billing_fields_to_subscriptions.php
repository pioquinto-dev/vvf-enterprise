<?php

use App\Models\PricingPlan;
use App\Models\Subscription;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('users', 'stripe_customer_id')) {
            return;
        }

        User::query()->with('subscriptions.plan')->orderBy('id')->each(function (User $user): void {
            $subscription = $user->subscriptions
                ->sortByDesc(fn (Subscription $item) => match ($item->status) {
                    'active' => 5,
                    'trialing' => 4,
                    'pending' => 3,
                    'paid' => 2,
                    'free' => 1,
                    default => 0,
                })
                ->first();

            $planSlug = (string) ($user->current_plan_slug ?: 'free');
            $plan = PricingPlan::query()->where('slug', $planSlug)->first()
                ?? PricingPlan::query()->where('slug', 'free')->first();

            if ($subscription === null) {
                $subscription = Subscription::query()->create([
                    'id' => (string) Str::ulid(),
                    'user_id' => $user->id,
                    'plan_id' => $plan?->id,
                    'status' => $planSlug === 'free' ? 'free' : 'pending',
                    'stripe_customer_id' => $user->stripe_customer_id,
                    'current_period_starts_at' => CarbonImmutable::now(),
                    'current_period_ends_at' => $user->plan_renews_at,
                    'metadata' => ['plan_slug' => $plan?->slug ?? $planSlug],
                ]);
            } else {
                $metadata = (array) $subscription->metadata;
                data_set($metadata, 'plan_slug', data_get($metadata, 'plan_slug', $plan?->slug ?? $planSlug));

                $subscription->forceFill([
                    'plan_id' => $subscription->plan_id ?? $plan?->id,
                    'stripe_customer_id' => $subscription->stripe_customer_id ?: $user->stripe_customer_id,
                    'current_period_ends_at' => $subscription->current_period_ends_at ?? $user->plan_renews_at,
                    'metadata' => $metadata,
                ])->save();
            }
        });

        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn(['stripe_customer_id', 'current_plan_slug', 'plan_renews_at']);
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->string('stripe_customer_id')->nullable();
            $table->string('current_plan_slug')->default('free');
            $table->timestamp('plan_renews_at')->nullable();
        });
    }
};
