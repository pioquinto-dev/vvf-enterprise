<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * The free search is "one forever", so it cannot be inferred from mutable
     * state. Row counts lie (searches are soft-deletable) and session tokens
     * evaporate on logout. This stamp is written once and never cleared.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->timestamp('free_search_used_at')->nullable()->after('plan_renews_at');
        });

        // Anyone who already ran a search has spent theirs — including rows
        // they have since deleted, which is exactly the hole being closed.
        DB::table('users')
            ->whereIn('id', DB::table('custom_keyword_searches')->select('user_id')->whereNotNull('user_id'))
            ->update(['free_search_used_at' => now()]);
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn('free_search_used_at');
        });
    }
};
