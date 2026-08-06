<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * One row per scrape attempt. Search status is what the user sees; run
     * status is what the worker pipeline moves through.
     */
    public function up(): void
    {
        Schema::create('custom_keyword_search_runs', function (Blueprint $table): void {
            $table->id();

            $table->foreignId('custom_keyword_search_id')
                ->constrained('custom_keyword_searches')
                ->cascadeOnDelete();

            $table->foreignId('apify_trigger_id')->nullable()->constrained('apify_triggers')->nullOnDelete();
            $table->string('apify_run_id')->nullable()->index();

            $table->string('status', 20)->default('queued');

            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->text('error_message')->nullable();
            $table->json('raw_summary')->nullable();

            $table->timestamps();

            $table->index(['custom_keyword_search_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('custom_keyword_search_runs');
    }
};
