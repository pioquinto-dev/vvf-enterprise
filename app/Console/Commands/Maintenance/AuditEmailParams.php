<?php

namespace App\Console\Commands\Maintenance;

use Illuminate\Console\Command;

/**
 * Checks that the `params` declared for each notification in
 * config/brevo_notifications.php still match what BrevoTransactionalEmail
 * actually sends.
 *
 * The declaration exists so the admin screen can show an admin which merge
 * fields a template receives. A declaration that drifts from the code is worse
 * than none: it tells someone a field is available, they put it in the Brevo
 * template, and it renders as a blank space in a live email.
 */
class AuditEmailParams extends Command
{
    protected $signature = 'emails:audit-params';

    protected $description = 'Verify declared email merge fields match what the code sends.';

    /**
     * Params built by a helper rather than written out as literals.
     *
     * Brevo addresses params by name rather than iterating, so a ranked set has
     * to go out as breakout1Title, breakout2Title and so on. Those are
     * generated in a loop, which this command's parser cannot see, so they are
     * declared here instead. Adding a slot means adding it here too — that is
     * the point: the declaration is what the admin screen shows an admin, and a
     * field that is listed but never sent renders as a blank space in a live
     * email.
     *
     * @var array<string, array<int, string>>
     */
    private const COMPUTED = [
        'search_done' => [
            'breakout1Title', 'breakout1Handle', 'breakout1Views', 'breakout1Score', 'breakout1Thumbnail',
            'breakout2Title', 'breakout2Handle', 'breakout2Views', 'breakout2Score', 'breakout2Thumbnail',
            'breakout3Title', 'breakout3Handle', 'breakout3Views', 'breakout3Score', 'breakout3Thumbnail',
        ],
        'weekly_digest' => [
            'own1Title', 'own1Handle', 'own1Views', 'own1Score', 'own1Thumbnail',
            'comp1Title', 'comp1Brand', 'comp1Views', 'comp1Score', 'comp1Thumbnail',
            'prod1Title', 'prod1Name', 'prod1Views', 'prod1Score', 'prod1Thumbnail',
        ],
    ];

    public function handle(): int
    {
        $source = file_get_contents(app_path('Support/BrevoTransactionalEmail.php'));

        if ($source === false) {
            $this->error('Could not read BrevoTransactionalEmail.');

            return self::FAILURE;
        }

        $actual = $this->parseSentParams($source);

        foreach (self::COMPUTED as $key => $params) {
            $actual[$key] = array_values(array_unique(array_merge($actual[$key] ?? [], $params)));
        }

        $problems = 0;

        foreach ((array) config('brevo_notifications.notifications', []) as $key => $definition) {
            $declared = collect((array) ($definition['params'] ?? []))->sort()->values();
            $sends = collect($actual[$key] ?? [])->sort()->values();

            if ($sends->isEmpty()) {
                $this->warn("  {$key}: could not find a payload() call for this key");
                $problems++;

                continue;
            }

            $missing = $sends->diff($declared);
            $extra = $declared->diff($sends);

            if ($missing->isNotEmpty() || $extra->isNotEmpty()) {
                $problems++;
                $this->warn("  {$key}:");

                if ($missing->isNotEmpty()) {
                    $this->line('    sent but not declared: '.$missing->implode(', '));
                }

                if ($extra->isNotEmpty()) {
                    $this->line('    declared but never sent: '.$extra->implode(', '));
                }
            }
        }

        if ($problems === 0) {
            $this->info('Email merge fields: every declaration matches the code.');

            return self::SUCCESS;
        }

        $this->error(sprintf('%d template(s) have a stale merge-field declaration.', $problems));

        return self::FAILURE;
    }

    /**
     * @return array<string, array<int, string>>
     */
    private function parseSentParams(string $source): array
    {
        $sent = [];

        // Two shapes: a plain array of literals, or array_merge() of a literal
        // array and a computed one (see COMPUTED above). Both end the literal
        // array on a line indented by eight spaces.
        preg_match_all(
            '/payload\(\s*(.+?),\s*\$user,\s*(?:array_merge\(\s*)?\[(.*?)\n        \][,)]/s',
            $source,
            $matches,
            PREG_SET_ORDER,
        );

        foreach ($matches as $match) {
            $keyExpression = trim($match[1]);
            preg_match_all('/^\s{12}\'([A-Za-z0-9_]+)\'\s*=>/m', $match[2], $paramMatches);
            $params = $paramMatches[1];

            // A literal key, or a ternary that picks between two literal keys.
            preg_match_all("/'([a-z0-9_]+)'/", $keyExpression, $keyMatches);

            foreach ($keyMatches[1] as $key) {
                if (! array_key_exists($key, (array) config('brevo_notifications.notifications', []))) {
                    continue;
                }

                $sent[$key] = array_values(array_unique(array_merge($sent[$key] ?? [], $params)));
            }

            // winback() sends six templates through one $templateKey variable.
            if ($keyExpression === '$templateKey') {
                foreach (array_keys((array) config('brevo_notifications.notifications', [])) as $key) {
                    if (str_contains((string) $key, '_winback_')) {
                        $sent[$key] = array_values(array_unique(array_merge($sent[$key] ?? [], $params)));
                    }
                }
            }
        }

        return $sent;
    }
}
