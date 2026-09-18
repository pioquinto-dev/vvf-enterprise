<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Append-only record of every lifecycle email sent, and the reason it was
     * allowed to send once.
     *
     * Delayed emails ("day 3 after the search finished") are found by a daily
     * scan, so without a durable record the same scan re-sends on every run.
     * Dedupe used to live in subscriptions.metadata, which only works for mail
     * attached to a subscription — the onboarding and free-search flows have
     * no subscription to hang it on.
     *
     * The unique key is (flow_key, dedupe_key), NOT the template. A flow that
     * picks between templates at send time — trial_ending_cc vs
     * trial_ending_no_cc — must claim one slot for both, or the same reminder
     * goes out twice as the branch flips between runs. dedupe_key names the
     * thing the email is about ("subscription:91:d3"), so one send per subject
     * per flow is enforced by the database rather than by a read-then-write
     * race in the scheduler.
     *
     * template_key records which variant actually went out, and is filled in
     * after the send rather than at claim time.
     */
    public function up(): void
    {
        Schema::create('email_sends', function (Blueprint $table): void {
            $table->id();

            $table->string('flow_key', 64);
            $table->string('dedupe_key', 191);
            $table->string('template_key', 64)->nullable();

            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('email');

            $table->unsignedInteger('brevo_template_id')->nullable();
            $table->string('message_id')->nullable();

            // 'sent' | 'failed' | 'suppressed' — a suppressed row still claims
            // the dedupe key, so an opted-out user is not retried daily.
            $table->string('status', 20)->default('sent');
            $table->text('error')->nullable();

            $table->json('context')->nullable();
            $table->timestamps();

            $table->unique(['flow_key', 'dedupe_key']);
            $table->index(['user_id', 'flow_key']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('email_sends');
    }
};
