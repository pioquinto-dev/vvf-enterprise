<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_activities', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable()->index();
            $table->string('user_name');
            $table->string('user_email');
            $table->string('category')->index();
            $table->string('event');
            $table->string('summary');
            $table->json('metadata')->nullable();
            $table->string('dedupe_key')->nullable()->unique();
            $table->timestamp('created_at')->useCurrent()->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_activities');
    }
};
