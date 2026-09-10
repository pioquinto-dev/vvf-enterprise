<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Append-only log of high-priority production errors (third-party
     * connection failures, core-feature exceptions) surfaced on the admin
     * dashboard. Populated by App\Support\AppEventLogger::error(), which is
     * already the app-wide call site for this class of failure.
     */
    public function up(): void
    {
        Schema::create('critical_error_logs', function (Blueprint $table): void {
            $table->id();
            $table->string('event');
            $table->text('message');
            $table->string('exception_class')->nullable();
            $table->string('file')->nullable();
            $table->unsignedInteger('line')->nullable();
            $table->json('context')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamp('created_at')->nullable();

            $table->index(['created_at']);
            $table->index(['event']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('critical_error_logs');
    }
};
