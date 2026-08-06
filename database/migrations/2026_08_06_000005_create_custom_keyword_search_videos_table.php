<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * One row per video per saved search. The unique key means a video that
     * keeps reappearing across refreshes is updated in place — rank and score
     * are recomputed each run rather than duplicated.
     */
    public function up(): void
    {
        Schema::create('custom_keyword_search_videos', function (Blueprint $table): void {
            $table->id();

            $table->foreignId('custom_keyword_search_id')
                ->constrained('custom_keyword_searches')
                ->cascadeOnDelete();

            $table->foreignId('custom_keyword_search_run_id')
                ->nullable()
                ->constrained('custom_keyword_search_runs')
                ->nullOnDelete();

            $table->foreignUlid('viral_video_id')->constrained('viral_videos')->cascadeOnDelete();

            $table->string('source', 20)->default('external_scrape');
            $table->decimal('viral_score', 12, 6)->default(0);
            $table->unsignedSmallInteger('rank')->default(0);
            $table->boolean('is_new_breakout')->default(false);

            $table->timestamps();

            $table->unique(['custom_keyword_search_id', 'viral_video_id'], 'cks_videos_search_video_unique');
            $table->index(['custom_keyword_search_id', 'rank'], 'cks_videos_search_rank_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('custom_keyword_search_videos');
    }
};
