<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('video_preparations', function (Blueprint $table): void {
            $table->ulid('id')->primary();
            $table->foreignUlid('viral_video_id')->nullable()->constrained('viral_videos')->nullOnDelete();
            $table->string('video_id')->unique();
            $table->string('status')->default('idle');
            $table->string('prepared_media_path')->nullable();
            $table->json('frame_paths')->nullable();
            $table->json('shared_artifacts')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamp('prepared_at')->nullable();
            $table->timestamp('locked_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('video_preparations');
    }
};
