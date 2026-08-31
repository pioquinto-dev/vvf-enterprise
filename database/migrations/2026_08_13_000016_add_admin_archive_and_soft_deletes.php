<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Admin listings can archive and (soft) delete records.
 *
 * Archive and delete are deliberately separate. Archiving is an editorial
 * decision that hides a row from customer-facing surfaces while leaving it
 * fully queryable internally; deleting is a removal that must stay reversible.
 * Collapsing them into one column would make "hidden from pricing" and
 * "removed by an admin" indistinguishable after the fact.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('viral_videos', function (Blueprint $table): void {
            $table->softDeletes();
            $table->timestamp('archived_at')->nullable()->index()->after('uploaded_at');
        });

        Schema::table('plans', function (Blueprint $table): void {
            $table->softDeletes();
            $table->timestamp('archived_at')->nullable()->index();
        });

        Schema::table('subscriptions', function (Blueprint $table): void {
            $table->softDeletes();
        });

        Schema::table('users', function (Blueprint $table): void {
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::table('viral_videos', function (Blueprint $table): void {
            $table->dropSoftDeletes();
            $table->dropColumn('archived_at');
        });

        Schema::table('plans', function (Blueprint $table): void {
            $table->dropSoftDeletes();
            $table->dropColumn('archived_at');
        });

        Schema::table('subscriptions', function (Blueprint $table): void {
            $table->dropSoftDeletes();
        });

        Schema::table('users', function (Blueprint $table): void {
            $table->dropSoftDeletes();
        });
    }
};
