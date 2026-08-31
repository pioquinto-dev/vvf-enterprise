<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('viral_video_shared_transcripts', function (Blueprint $table): void {
            $table->ulid('id')->primary();
            $table->string('video_id')->nullable()->unique();
            $table->text('post_url')->nullable();
            $table->string('normalized_post_url')->nullable()->index();
            $table->text('transcript');
            $table->json('transcript_segments')->nullable();
            $table->json('analysis_result')->nullable();
            $table->timestamp('fetched_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('viral_video_shared_transcripts');
    }
};
