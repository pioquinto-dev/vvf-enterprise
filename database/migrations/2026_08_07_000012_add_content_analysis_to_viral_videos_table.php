<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Creative classification for a video: what shape it takes, how it opens,
     * and what argument it makes. Written by an OpenAI pass over the top
     * results of a run, not by the scrape.
     *
     * These live on the canonical video rather than on the search-video pivot
     * so a video surfacing in five searches is classified once.
     */
    public function up(): void
    {
        Schema::table('viral_videos', function (Blueprint $table): void {
            $table->string('content_format', 80)->nullable()->after('title_language_bucket');
            $table->string('content_hook', 120)->nullable()->after('content_format');
            $table->string('content_angle', 120)->nullable()->after('content_hook');

            // Null means never analysed. Set even when the model returns
            // nothing usable, so a failed video is not retried on every run.
            $table->timestamp('analyzed_at')->nullable()->after('content_angle');
        });
    }

    public function down(): void
    {
        Schema::table('viral_videos', function (Blueprint $table): void {
            $table->dropColumn(['content_format', 'content_hook', 'content_angle', 'analyzed_at']);
        });
    }
};
