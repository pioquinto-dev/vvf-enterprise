<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('managed_coupon_redemptions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('managed_coupon_program_id')
                ->constrained('managed_coupon_programs')
                ->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('email', 191)->index();
            $table->string('stripe_checkout_session_id', 191)->nullable();
            $table->string('stripe_subscription_id', 191)->nullable();
            $table->string('subscription_status', 40)->nullable();
            $table->timestamp('redeemed_at')->nullable()->index();
            $table->timestamps();

            // One durable redemption per user per program (slot-safe with a DB uniqueness guard).
            $table->unique(['managed_coupon_program_id', 'user_id'], 'managed_coupon_redemptions_unique_user');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('managed_coupon_redemptions');
    }
};
