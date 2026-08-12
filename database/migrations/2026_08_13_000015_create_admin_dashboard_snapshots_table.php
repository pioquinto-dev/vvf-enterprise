<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('admin_dashboard_snapshots', function (Blueprint $table): void {
            $table->id();
            // One row per UTC day. The daily job writes today's row; a manual
            // refresh overwrites it, so the series never grows duplicates.
            $table->date('snapshot_date')->unique();
            $table->unsignedInteger('paid_subscriptions')->default(0);
            $table->unsignedInteger('trialing_subscriptions')->default(0);
            $table->unsignedInteger('signups')->default(0);
            $table->unsignedInteger('viral_videos')->default(0);
            $table->unsignedInteger('custom_keyword_searches')->default(0);
            $table->timestamp('captured_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('admin_dashboard_snapshots');
    }
};
