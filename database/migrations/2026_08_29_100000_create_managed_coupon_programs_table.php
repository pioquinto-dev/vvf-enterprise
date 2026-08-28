<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('managed_coupon_programs', function (Blueprint $table): void {
            $table->id();
            $table->string('code', 60)->unique();
            $table->string('name', 120);
            $table->string('link_path', 120)->unique();
            $table->string('plan_slug', 60);
            $table->string('billing_cycle', 20)->default('monthly');
            $table->unsignedInteger('max_redemptions')->nullable();

            // Eligibility policy.
            $table->string('allowed_domain', 191)->nullable();
            $table->boolean('whitelist_only')->default(false);
            $table->boolean('trial_only')->default(false);
            $table->boolean('collect_payment_method')->default(true);
            $table->boolean('block_trial_used')->default(false);
            $table->boolean('block_reverted_free')->default(false);

            // Stripe discount applied server-side (filled in later via admin/seeder).
            $table->string('stripe_coupon_id', 120)->nullable();
            $table->string('stripe_promotion_code_id', 120)->nullable();

            $table->boolean('is_active')->default(true)->index();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('managed_coupon_programs');
    }
};
