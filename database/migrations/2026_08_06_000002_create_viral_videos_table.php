<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Canonical imported video. Saved searches attach to these rows rather than
     * storing their own copies, so the same video surfacing in two searches is
     * imported once and refreshed in place.
     */
    public function up(): void
    {
        Schema::create('viral_videos', function (Blueprint $table): void {
            $table->ulid('id')->primary();

            $table->string('video_id')->unique();
            $table->string('platform', 32)->default('tiktok')->index();

            $table->text('title')->nullable();
            $table->json('hashtags')->nullable();

            $table->string('username')->nullable();
            $table->string('name')->nullable();
            $table->text('avatar')->nullable();
            $table->unsignedBigInteger('followers')->default(0);

            $table->unsignedBigInteger('views')->default(0);
            $table->unsignedBigInteger('likes')->default(0);
            $table->unsignedBigInteger('comments')->default(0);
            $table->unsignedBigInteger('shares')->default(0);
            $table->unsignedBigInteger('bookmarks')->default(0);

            $table->decimal('virality_score', 16, 6)->default(0);
            $table->decimal('duration', 10, 3)->default(0);

            $table->text('cover')->nullable();
            $table->text('thumbnail_url')->nullable();
            $table->text('video_url')->nullable();
            $table->text('post_url')->nullable();
            $table->text('embed_url')->nullable();

            $table->string('song')->nullable();
            $table->string('artist')->nullable();

            $table->string('video_status', 32)->default('visible')->index();
            $table->string('scrape_source', 32)->nullable()->index();
            $table->string('title_language_bucket', 32)->nullable();

            $table->timestamp('uploaded_at')->nullable();
            $table->json('raw_payload')->nullable();

            $table->foreignId('apify_trigger_id')->nullable()->constrained('apify_triggers')->nullOnDelete();

            $table->timestamps();

            $table->index(['virality_score', 'uploaded_at']);
            $table->index(['video_status', 'virality_score']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('viral_videos');
    }
};
