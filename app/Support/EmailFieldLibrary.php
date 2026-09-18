<?php

namespace App\Support;

use Throwable;

/**
 * Resolves admin-selected merge fields from config/email_fields.php.
 *
 * A resolver reaches into a model, so it can throw on odd data. One bad field
 * must not stop a billing email going out, so failures are skipped rather than
 * raised.
 */
class EmailFieldLibrary
{
    /**
     * @return array<string, array<string, mixed>>
     */
    public static function all(): array
    {
        return (array) config('email_fields.fields', []);
    }

    public static function find(string $key): ?array
    {
        return self::all()[$key] ?? null;
    }

    /**
     * Turn the field keys an admin picked into merge params.
     *
     * @param  array<int, string>  $keys
     * @return array<string, string>
     */
    public static function resolve(array $keys, EmailContext $context): array
    {
        $params = [];

        foreach ($keys as $key) {
            $field = self::find((string) $key);

            if ($field === null) {
                continue;
            }

            $subject = $context->sourceFor((string) ($field['source'] ?? ''));

            // The field's source is not in scope for this email. Leaving it out
            // is better than an empty string, which would render as a gap the
            // reader can see.
            if ($subject === null) {
                continue;
            }

            try {
                $value = ($field['get'])($subject);
            } catch (Throwable) {
                continue;
            }

            if (is_scalar($value)) {
                $params[(string) $field['param']] = (string) $value;
            }
        }

        return $params;
    }

    /**
     * The library as the admin screen shows it, grouped, with a note on whether
     * each field can resolve for this particular template.
     *
     * @param  array<int, string>  $availableSources
     * @return array<int, array<string, mixed>>
     */
    public static function catalogue(array $availableSources = []): array
    {
        $rows = [];

        foreach (self::all() as $key => $field) {
            $source = (string) ($field['source'] ?? '');

            $rows[] = [
                'key' => $key,
                'label' => (string) ($field['label'] ?? $key),
                'group' => (string) ($field['group'] ?? 'Other'),
                'param' => (string) ($field['param'] ?? $key),
                'source' => $source,
                'sample' => (string) ($field['sample'] ?? ''),
                'available' => $availableSources === [] || in_array($source, $availableSources, true),
            ];
        }

        usort($rows, fn (array $a, array $b): int => [$a['group'], $a['label']] <=> [$b['group'], $b['label']]);

        return $rows;
    }
}
