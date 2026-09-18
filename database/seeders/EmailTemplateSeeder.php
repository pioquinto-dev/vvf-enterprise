<?php

namespace Database\Seeders;

use App\Models\EmailTemplate;
use App\Support\EmailTemplateRegistry;
use Illuminate\Database\Seeder;

/**
 * Registers every lifecycle email in the email_templates table.
 *
 * Safe to run repeatedly, and that is the point: Brevo template IDs are typed
 * in by hand in the admin screen, one at a time, as each template is built.
 * A seeder that overwrote them would undo that work on the next deploy.
 *
 * The rule: on a row that already exists, this only refreshes what is not
 * editable in the admin screen — the tags and the transactional flag, which
 * decide whether the unsubscribe list applies and must stay in step with the
 * code. Everything an admin can type (Brevo ID, subject, preview text, label,
 * enabled) is left exactly as they left it.
 *
 *     php artisan db:seed --class=EmailTemplateSeeder
 */
class EmailTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $definitions = (array) config('brevo_notifications.notifications', []);

        $created = 0;
        $updated = 0;

        foreach ($definitions as $key => $definition) {
            // withTrashed: a soft-deleted template still occupies its key, and
            // re-creating it would both fail on the primary key and quietly
            // undo the admin's removal.
            $existing = EmailTemplate::withTrashed()->find($key);

            // Code-owned: these decide behaviour, not wording, so they are
            // kept in step on every run.
            $behaviour = [
                'tags' => array_values((array) ($definition['tags'] ?? [])),
                // Anything not explicitly marked marketing stays transactional,
                // so a new template can never silently become suppressible.
                'is_transactional' => (bool) ($definition['transactional'] ?? true),
            ];

            // Admin-owned: seeded once, then never touched again.
            $copy = [
                'label' => (string) ($definition['label'] ?? str($key)->replace('_', ' ')->title()->value()),
                'subject' => (string) ($definition['subject'] ?? 'BrandBeacon update'),
                'preview_text' => $definition['preview'] ?? null,
            ];

            if ($existing !== null) {
                $existing->forceFill($behaviour)->save();
                $updated++;

                continue;
            }

            $configuredId = $definition['template_id'] ?? null;

            EmailTemplate::query()->create($behaviour + $copy + [
                'key' => $key,
                // Only ever taken on first insert, from the legacy env var if
                // one is still set. After that the admin screen owns it.
                'brevo_template_id' => is_numeric($configuredId) && (int) $configuredId > 0
                    ? (int) $configuredId
                    : null,
                // A template with no Brevo ID cannot send, so it starts off.
                // Entering the ID in the admin screen is what turns it on.
                'is_enabled' => is_numeric($configuredId) && (int) $configuredId > 0,
                'description' => null,
            ]);

            $created++;
        }

        EmailTemplateRegistry::forget();

        $unmapped = EmailTemplate::query()->whereNull('brevo_template_id')->orderBy('key')->pluck('key');

        $this->command?->info(sprintf(
            'Email templates: %d created, %d left as edited, %d still need a Brevo ID.',
            $created,
            $updated,
            $unmapped->count(),
        ));

        if ($unmapped->isNotEmpty() && $this->command !== null) {
            $this->command->line('  Awaiting a Brevo ID (Admin -> Email Templates):');

            foreach ($unmapped as $key) {
                $this->command->line('    - '.$key);
            }
        }
    }
}
