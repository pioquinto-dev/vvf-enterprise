<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Moves the lifecycle send schedule out of config and onto the template row.
     *
     * It started in config/email_lifecycle.php, which made every change to when
     * an email goes out a deploy. The schedule is editorial, not structural —
     * "move the winback to day 10", "send the digest at 8 rather than 7" — so it
     * belongs where the subject line and the preview text already live, in front
     * of the person who owns the copy.
     *
     * Config stays as the fallback and as the seed for these columns, exactly
     * like brevo_notifications.php does for subjects. A row with nothing set
     * here still resolves to the config entry, so an environment that has not
     * migrated keeps its current timings.
     */
    public function up(): void
    {
        Schema::table('email_templates', function (Blueprint $table): void {
            if (! Schema::hasColumn('email_templates', 'send_trigger')) {
                // What the offset counts from. Stored rather than derived
                // because it is also what the admin screen reads back to say
                // "3 days after the trial ending" instead of "-3".
                $table->string('send_trigger', 40)->nullable()->after('is_enabled');
            }

            if (! Schema::hasColumn('email_templates', 'send_offset_days')) {
                // Negative counts backwards from a future date: a card expiring,
                // a trial ending.
                $table->smallInteger('send_offset_days')->nullable()->after('send_trigger');
            }

            if (! Schema::hasColumn('email_templates', 'send_offset_hours')) {
                $table->smallInteger('send_offset_hours')->nullable()->after('send_offset_days');
            }

            if (! Schema::hasColumn('email_templates', 'send_at')) {
                // "HH:MM" rather than a time column: it is a wall-clock slot in
                // send_timezone, not an instant, and a time column invites the
                // database to attach a date and a zone to it.
                $table->string('send_at', 5)->nullable()->after('send_offset_hours');
            }

            if (! Schema::hasColumn('email_templates', 'send_weekday')) {
                $table->string('send_weekday', 12)->nullable()->after('send_at');
            }

            if (! Schema::hasColumn('email_templates', 'send_interval_weeks')) {
                $table->unsignedSmallInteger('send_interval_weeks')->nullable()->after('send_weekday');
            }

            if (! Schema::hasColumn('email_templates', 'send_anchor_date')) {
                // The fortnight "every 2 weeks" counts from, so the whole list
                // lands on the same one instead of drifting per recipient.
                $table->date('send_anchor_date')->nullable()->after('send_interval_weeks');
            }

            if (! Schema::hasColumn('email_templates', 'send_immediate')) {
                // Event-driven mail that must not wait for a slot. A
                // results-ready email held until 7am is a worse email.
                $table->boolean('send_immediate')->default(false)->after('send_anchor_date');
            }

            if (! Schema::hasColumn('email_templates', 'send_timezone')) {
                // Per-template override of email_lifecycle.timezone. Almost
                // always null; here because a billing email for one region
                // should not force the whole schedule onto that clock.
                $table->string('send_timezone', 64)->nullable()->after('send_immediate');
            }
        });

        $this->backfillFromConfig();
    }

    /**
     * Seeds the columns from config/email_lifecycle.php, once.
     *
     * Guarded on every schedule column still being empty rather than on the
     * table being fresh: a re-run, or a second environment migrating later,
     * must not overwrite a slot an admin has since moved.
     */
    private function backfillFromConfig(): void
    {
        foreach ((array) config('email_lifecycle.schedule', []) as $key => $spec) {
            if (! is_array($spec)) {
                continue;
            }

            $anchor = $spec['anchor'] ?? null;

            DB::table('email_templates')
                ->where('key', $key)
                ->whereNull('send_trigger')
                ->whereNull('send_at')
                ->whereNull('send_offset_days')
                ->update([
                    'send_trigger' => isset($spec['trigger']) ? (string) $spec['trigger'] : null,
                    'send_offset_days' => isset($spec['offset_days']) ? (int) $spec['offset_days'] : null,
                    'send_offset_hours' => isset($spec['offset_hours']) ? (int) $spec['offset_hours'] : null,
                    'send_at' => isset($spec['at']) ? (string) $spec['at'] : null,
                    'send_weekday' => isset($spec['weekday']) ? (string) $spec['weekday'] : null,
                    'send_interval_weeks' => isset($spec['interval_weeks']) ? (int) $spec['interval_weeks'] : null,
                    'send_anchor_date' => is_string($anchor) && $anchor !== '' ? $anchor : null,
                    'send_immediate' => (bool) ($spec['immediate'] ?? false),
                ]);
        }
    }

    public function down(): void
    {
        Schema::table('email_templates', function (Blueprint $table): void {
            foreach ([
                'send_trigger', 'send_offset_days', 'send_offset_hours', 'send_at',
                'send_weekday', 'send_interval_weeks', 'send_anchor_date',
                'send_immediate', 'send_timezone',
            ] as $column) {
                if (Schema::hasColumn('email_templates', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
