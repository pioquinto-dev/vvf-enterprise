<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * One row per Apify run we start, whatever kicked it off. Keeping this
     * separate from the saved-search run table means cost and dataset
     * bookkeeping stays in one place across future scrape sources.
     */
    public function up(): void
    {
        Schema::create('apify_triggers', function (Blueprint $table): void {
            $table->id();

            $table->string('source_type', 32);
            $table->string('source_id')->nullable();

            $table->string('apify_run_id')->nullable()->index();
            $table->string('dataset_id')->nullable()->index();
            $table->string('actor_id')->nullable();
            $table->string('status', 30)->default('queued')->index();
            $table->string('request_source', 32)->nullable()->index();

            $table->json('input')->nullable();
            $table->json('search_keywords')->nullable();
            $table->json('filter_summary')->nullable();

            $table->unsignedInteger('item_count')->nullable();
            $table->unsignedInteger('result_count')->nullable();
            $table->unsignedInteger('imported_count')->nullable();

            $table->decimal('compute_units', 10, 6)->nullable();
            $table->decimal('usage_total_usd', 10, 4)->nullable();

            $table->timestamp('started_at')->nullable();
            $table->timestamp('finished_at')->nullable();
            $table->text('error_message')->nullable();

            $table->foreignId('requested_by_user_id')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();

            $table->index(['source_type', 'source_id']);
            $table->index(['requested_by_user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('apify_triggers');
    }
};
