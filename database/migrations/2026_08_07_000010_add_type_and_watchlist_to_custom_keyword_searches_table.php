<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('custom_keyword_searches', function (Blueprint $table): void {
            $table->string('search_type', 20)->default('brand')->after('phrase');
            $table->boolean('is_watchlisted')->default(false)->after('status')->index();
            $table->index(['user_id', 'search_type']);
            $table->index(['user_id', 'search_type', 'is_watchlisted']);
        });
    }

    public function down(): void
    {
        Schema::table('custom_keyword_searches', function (Blueprint $table): void {
            $table->dropIndex(['user_id', 'search_type', 'is_watchlisted']);
            $table->dropIndex(['user_id', 'search_type']);
            $table->dropColumn(['search_type', 'is_watchlisted']);
        });
    }
};
