<?php

use Database\Seeders\EmailTemplateSeeder;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Registry of every lifecycle email. Template IDs used to live in
     * config/brevo_notifications.php behind one env var each, which does not
     * scale to the 22-email lifecycle: adding a flow meant adding env vars on
     * every environment with no way to see what was configured. This table is
     * the source of truth instead, managed from the admin dashboard.
     *
     * `config/brevo_notifications.php` stays as the seed and the fallback, so
     * an environment that has not run the backfill keeps sending.
     */
    public function up(): void
    {
        Schema::create('email_templates', function (Blueprint $table): void {
            // The notification key the code sends by ("new_registration").
            $table->string('key', 64)->primary();

            $table->string('label');
            $table->unsignedInteger('brevo_template_id')->nullable();
            $table->string('subject');
            // The inbox preview line that sits next to the subject. Stored
            // per template so it is editable without a deploy, same as the
            // subject; both support {{param}} placeholders.
            $table->string('preview_text')->nullable();
            $table->json('tags')->nullable();
            // Merge fields an admin switched on from the library in
            // config/email_fields.php, on top of the ones the code always
            // sends. Lets a template gain a field without a deploy.
            $table->json('extra_fields')->nullable();

            // Transactional mail ignores the unsubscribe suppression list:
            // a billing failure or verification link has to arrive even for
            // someone who opted out of marketing.
            $table->boolean('is_transactional')->default(true);
            $table->boolean('is_enabled')->default(true);

            $table->text('description')->nullable();
            $table->timestamps();
            // Templates are only ever soft deleted. A key may still be
            // referenced by a flow in code, and a hard delete would take the
            // send configuration with it while leaving the code sending.
            $table->softDeletes();
        });

        // One source of truth for the row contents.
        (new EmailTemplateSeeder)->run();
    }

    public function down(): void
    {
        Schema::dropIfExists('email_templates');
    }
};
