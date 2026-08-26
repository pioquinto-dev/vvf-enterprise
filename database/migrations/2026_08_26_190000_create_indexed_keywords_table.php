<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('indexed_keywords', function (Blueprint $table): void {
            $table->id();
            $table->string('label');
            $table->string('normalized_label', 191)->index();
            $table->string('keyword_type', 20)->index();
            $table->string('sector', 120)->nullable()->index();
            $table->string('source', 40)->default('seed')->index();
            $table->unsignedInteger('usage_count')->default(0);
            $table->timestamp('last_seen_at')->nullable()->index();
            $table->timestamp('archived_at')->nullable()->index();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['normalized_label', 'keyword_type'], 'indexed_keywords_unique_term_type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('indexed_keywords');
    }
};
