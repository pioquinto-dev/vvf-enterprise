<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('viral_videos', function (Blueprint $table): void {
            $table->string('song_id')->nullable()->after('embed_url');
            $table->text('song_cover_url')->nullable()->after('song_id');
        });
    }

    public function down(): void
    {
        Schema::table('viral_videos', function (Blueprint $table): void {
            $table->dropColumn([
                'song_id',
                'song_cover_url',
            ]);
        });
    }
};
