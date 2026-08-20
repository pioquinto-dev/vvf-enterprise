<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('video_analyses', function (Blueprint $table): void {
            $table->boolean('counts_toward_quota')
                ->default(true)
                ->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('video_analyses', function (Blueprint $table): void {
            $table->dropColumn('counts_toward_quota');
        });
    }
};
