<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * The one-line read at the top of the detail page. Regenerated after each
     * run and stored so the page never waits on OpenAI to render.
     */
    public function up(): void
    {
        Schema::table('custom_keyword_searches', function (Blueprint $table): void {
            $table->text('ai_summary')->nullable()->after('status');
            $table->timestamp('ai_summary_generated_at')->nullable()->after('ai_summary');
        });
    }

    public function down(): void
    {
        Schema::table('custom_keyword_searches', function (Blueprint $table): void {
            $table->dropColumn(['ai_summary', 'ai_summary_generated_at']);
        });
    }
};
