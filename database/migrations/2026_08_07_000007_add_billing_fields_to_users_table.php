<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->string('stripe_customer_id')->nullable()->after('remember_token');
            $table->string('current_plan_slug')->default('free')->after('stripe_customer_id');
            $table->unsignedInteger('monthly_credits_remaining')->default(0)->after('current_plan_slug');
            $table->timestamp('plan_renews_at')->nullable()->after('monthly_credits_remaining');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn([
                'stripe_customer_id',
                'current_plan_slug',
                'monthly_credits_remaining',
                'plan_renews_at',
            ]);
        });
    }
};
