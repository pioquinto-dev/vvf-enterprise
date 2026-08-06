<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('video_bookmarks', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignUlid('viral_video_id')->constrained('viral_videos')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['user_id', 'viral_video_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('video_bookmarks');
    }
};
