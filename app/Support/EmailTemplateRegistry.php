<?php

namespace App\Support;

use App\Models\EmailTemplate;
use Illuminate\Support\Facades\Cache;
use Throwable;

/**
 * Reads a notification's definition from the email_templates table, falling
 * back to config/brevo_notifications.php.
 *
 * The fallback is not decoration: this is called from the registration path,
 * so an environment that has not run the migration yet, or a database blip,
 * must not stop mail going out.
 */
class EmailTemplateRegistry
{
    private const CACHE_KEY = 'email_templates.registry';

    private const CACHE_TTL = 300;

    /**
     * @return array<string, mixed>|null
     */
    public static function find(string $key): ?array
    {
        $row = self::all()[$key] ?? null;

        if ($row !== null) {
            return $row;
        }

        $definition = config("brevo_notifications.notifications.{$key}");

        return is_array($definition) ? [
            'key' => $key,
            'brevo_template_id' => $definition['template_id'] ?? null,
            'subject' => $definition['subject'] ?? null,
            'preview_text' => $definition['preview'] ?? null,
            'tags' => (array) ($definition['tags'] ?? []),
            'extra_fields' => [],
            'is_transactional' => $definition['transactional'] ?? true,
            'is_enabled' => true,
            // No row, so no stored schedule. schedule() falls back to config.
            'schedule' => null,
        ] : null;
    }

    /**
     * Templates the unsubscribe list applies to. Anything transactional —
     * billing, verification, search results — sends regardless of opt-out.
     */
    public static function isTransactional(string $key): bool
    {
        return (bool) (self::find($key)['is_transactional'] ?? true);
    }

    public static function isEnabled(string $key): bool
    {
        return (bool) (self::find($key)['is_enabled'] ?? true);
    }

    /**
     * The Brevo template ID mapped to this key, or null when nobody has
     * entered one yet.
     */
    public static function brevoTemplateId(string $key): ?int
    {
        $id = self::find($key)['brevo_template_id'] ?? null;

        return is_numeric($id) && (int) $id > 0 ? (int) $id : null;
    }

    /**
     * True when this template can actually be sent right now.
     *
     * A template with no Brevo ID has nothing to render, so the lifecycle
     * dispatcher skips it outright instead of claiming a send slot and failing
     * on the API call. That is what makes it safe to ship the flows before the
     * templates have been built in Brevo: nothing sends, nothing is logged as
     * an error, and no send slot is burned, so the first run after the IDs are
     * entered in Admin -> Email Templates picks the sequence up where it is.
     */
    public static function isSendable(string $key): bool
    {
        return self::isEnabled($key) && self::brevoTemplateId($key) !== null;
    }

    /**
     * When this email goes out.
     *
     * The template row owns this. config/email_lifecycle.php is the fallback
     * and the seed, the same arrangement subjects already have: an environment
     * that has not run the schedule migration, or a key with no row, keeps the
     * timings it was deployed with.
     *
     * @return array<string, mixed>
     */
    public static function schedule(string $key): array
    {
        $stored = self::find($key)['schedule'] ?? null;

        if (is_array($stored) && $stored !== []) {
            return $stored;
        }

        return (array) config("email_lifecycle.schedule.{$key}", []);
    }

    /**
     * True when the schedule in force came from the database rather than config.
     * The admin drawer says which, so nobody edits a slot that is not being read.
     */
    public static function scheduleIsStored(string $key): bool
    {
        $stored = self::find($key)['schedule'] ?? null;

        return is_array($stored) && $stored !== [];
    }

    public static function forget(): void
    {
        Cache::forget(self::CACHE_KEY);
    }

    /**
     * @return array<string, array<string, mixed>>
     */
    private static function all(): array
    {
        try {
            return Cache::remember(self::CACHE_KEY, self::CACHE_TTL, static fn (): array => EmailTemplate::withTrashed()
                ->get()
                ->keyBy('key')
                ->map(static fn (EmailTemplate $template): array => [
                    'key' => $template->key,
                    'brevo_template_id' => $template->brevo_template_id,
                    'subject' => $template->subject,
                    'preview_text' => $template->preview_text,
                    'tags' => $template->tags ?? [],
                    'extra_fields' => $template->extra_fields ?? [],
                    'is_transactional' => $template->is_transactional,
                    // A soft-deleted template is off, not absent. Reading it
                    // as absent would fall through to the config default below
                    // and keep sending the thing an admin just removed.
                    'is_enabled' => $template->is_enabled && $template->deleted_at === null,
                    // Null rather than an empty array when the admin has not
                    // set one, so schedule() can tell "no schedule here" from
                    // "a schedule that says nothing".
                    'schedule' => $template->hasOwnSchedule() ? $template->scheduleSpec() : null,
                ])
                ->all());
        } catch (Throwable) {
            // Table missing or database unreachable — the config fallback in
            // find() takes over rather than the send failing outright.
            return [];
        }
    }
}
