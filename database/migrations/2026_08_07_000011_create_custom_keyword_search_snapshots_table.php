<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * One row per measurement of a saved search. `viral_videos` rows are
     * updated in place, so without this table there is no way to say what a
     * metric was last week — every trend line and delta chip on the detail
     * page reads from here.
     *
     * Two kinds of row live here, separated by `is_reconstructed`:
     *
     *  - Recorded: written at the end of a real run. The metrics are what the
     *    search actually looked like at that moment.
     *  - Reconstructed: derived by bucketing videos by `uploaded_at` so a new
     *    search has a chart on day one. These describe when posts went up and
     *    what their views are *now*, not what the metrics were at the time.
     *    They must stay visibly labelled and are replaced by recorded rows as
     *    real history accumulates.
     */
    public function up(): void
    {
        Schema::create('custom_keyword_search_snapshots', function (Blueprint $table): void {
            $table->id();

            $table->foreignId('custom_keyword_search_id')
                ->constrained('custom_keyword_searches')
                ->cascadeOnDelete();

            $table->foreignId('custom_keyword_search_run_id')
                ->nullable()
                ->constrained('custom_keyword_search_runs')
                ->nullOnDelete();

            // The point in time this snapshot describes. For recorded rows it
            // is when the run finished; for reconstructed rows it is the end of
            // the week bucket being described.
            $table->timestamp('captured_at')->index();
            $table->boolean('is_reconstructed')->default(false)->index();

            $table->unsignedInteger('video_count')->default(0);
            $table->unsignedBigInteger('total_views')->default(0);
            $table->unsignedBigInteger('total_engagement')->default(0);
            $table->decimal('avg_engagement_rate', 8, 4)->default(0);
            $table->unsignedBigInteger('median_views')->default(0);
            $table->unsignedInteger('outlier_count')->default(0);
            $table->decimal('top_multiple', 10, 2)->default(0);

            // Per-hashtag and per-sound post counts, so growth can be computed
            // against the previous snapshot without re-reading every video.
            $table->json('hashtag_counts')->nullable();
            $table->json('sound_counts')->nullable();

            $table->timestamps();

            $table->index(['custom_keyword_search_id', 'captured_at'], 'cks_snapshots_search_captured_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('custom_keyword_search_snapshots');
    }
};
