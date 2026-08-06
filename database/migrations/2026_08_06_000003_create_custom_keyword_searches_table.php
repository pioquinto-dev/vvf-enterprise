<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('custom_keyword_searches', function (Blueprint $table): void {
            $table->id();

            // Nullable so a visitor can run their free search before signing in;
            // the session token lets us claim it for them afterwards.
            $table->foreignId('user_id')->nullable()->constrained('users')->cascadeOnDelete();
            $table->string('guest_token', 64)->nullable()->index();

            $table->string('name');
            $table->string('phrase');
            $table->json('keywords');

            // sorted+lowercased keyword join — how duplicates are detected.
            $table->string('keyword_signature', 191)->index();

            $table->string('frequency', 20)->default('weekly');
            $table->string('status', 20)->default('scraping');

            $table->timestamp('last_run_at')->nullable();
            $table->timestamp('next_run_at')->nullable()->index();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('custom_keyword_searches');
    }
};
