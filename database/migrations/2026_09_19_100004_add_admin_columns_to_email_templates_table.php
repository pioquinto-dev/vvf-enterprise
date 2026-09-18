<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Backfills the columns the admin screen needs onto an email_templates
     * table that was created before they existed.
     *
     * The create migration declares these too, so on a fresh install this runs
     * as a no-op. Every column is guarded by hasColumn rather than assumed,
     * because which of them a given environment is missing depends on when it
     * last migrated.
     */
    public function up(): void
    {
        Schema::table('email_templates', function (Blueprint $table): void {
            if (! Schema::hasColumn('email_templates', 'preview_text')) {
                $table->string('preview_text')->nullable()->after('subject');
            }

            if (! Schema::hasColumn('email_templates', 'extra_fields')) {
                $table->json('extra_fields')->nullable()->after('tags');
            }

            if (! Schema::hasColumn('email_templates', 'deleted_at')) {
                $table->softDeletes();
            }
        });

        $this->backfillPreviewText();
    }

    /**
     * Rows seeded before preview_text existed have none, and the seeder only
     * writes copy on insert — it will not touch a row an admin may have since
     * edited. So the defaults are applied once, here, and only where the value
     * is still empty.
     */
    private function backfillPreviewText(): void
    {
        foreach ((array) config('brevo_notifications.notifications', []) as $key => $definition) {
            $preview = $definition['preview'] ?? null;

            if (! is_string($preview) || $preview === '') {
                continue;
            }

            DB::table('email_templates')
                ->where('key', $key)
                ->whereNull('preview_text')
                ->update(['preview_text' => $preview]);
        }
    }

    public function down(): void
    {
        Schema::table('email_templates', function (Blueprint $table): void {
            foreach (['preview_text', 'extra_fields', 'deleted_at'] as $column) {
                if (Schema::hasColumn('email_templates', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
