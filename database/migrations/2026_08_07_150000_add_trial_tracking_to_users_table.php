<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('subscriptions', function (Blueprint $table): void {
            $table->timestamp('trial_started_at')->nullable()->after('current_period_ends_at');
            $table->timestamp('trial_completed_at')->nullable()->after('trial_started_at');
        });
    }

    public function down(): void
    {
        Schema::table('subscriptions', function (Blueprint $table): void {
            $table->dropColumn([
                'trial_started_at',
                'trial_completed_at',
            ]);
        });
    }
};
