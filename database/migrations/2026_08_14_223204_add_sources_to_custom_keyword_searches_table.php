<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('custom_keyword_searches', function (Blueprint $table): void {
            $table->string('source_tiktok_handle', 120)->nullable()->after('search_type');
            $table->string('source_website', 255)->nullable()->after('source_tiktok_handle');
        });
    }

    public function down(): void
    {
        Schema::table('custom_keyword_searches', function (Blueprint $table): void {
            $table->dropColumn(['source_tiktok_handle', 'source_website']);
        });
    }
};
