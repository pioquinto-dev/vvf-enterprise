<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * New enrichment columns to back the redesigned tracker page:
 *
 *   custom_keyword_searches.insights_bullets   — JSON array of 3 bullet
 *     strings. Bolded fragments are wrapped in **double asterisks** so the
 *     UI can render them without HTML.
 *   custom_keyword_searches.best_post_time     — JSON {day, hour_local,
 *     sentence} derived from the outlier posting heatmap.
 *
 *   viral_videos.content_why_broke_out         — one-sentence "why it went"
 *     line shown in the winner + per-card auto-analysis panel.
 *   viral_videos.content_replicate_with        — one-sentence "what to make
 *     next" line shown in the same panel.
 *
 * All four are populated by SearchEnrichmentService in a single OpenAI call
 * per run, so the results page can render information-rich analysis without
 * spawning a call per video or per section.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('custom_keyword_searches', function (Blueprint $table): void {
            $table->json('insights_bullets')->nullable()->after('ai_summary_generated_at');
            $table->json('best_post_time')->nullable()->after('insights_bullets');
        });

        Schema::table('viral_videos', function (Blueprint $table): void {
            $table->text('content_why_broke_out')->nullable()->after('content_angle');
            $table->text('content_replicate_with')->nullable()->after('content_why_broke_out');
        });
    }

    public function down(): void
    {
        Schema::table('custom_keyword_searches', function (Blueprint $table): void {
            $table->dropColumn(['insights_bullets', 'best_post_time']);
        });

        Schema::table('viral_videos', function (Blueprint $table): void {
            $table->dropColumn(['content_why_broke_out', 'content_replicate_with']);
        });
    }
};
