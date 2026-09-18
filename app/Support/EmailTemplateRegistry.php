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
                ])
                ->all());
        } catch (Throwable) {
            // Table missing or database unreachable — the config fallback in
            // find() takes over rather than the send failing outright.
            return [];
        }
    }
}
