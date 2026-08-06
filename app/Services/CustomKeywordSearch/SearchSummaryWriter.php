<?php

namespace App\Services\CustomKeywordSearch;

use App\Models\CustomKeywordSearch;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Writes the one-line read at the top of a tracker page.
 *
 * The model is handed figures that are already computed — it never does the
 * arithmetic itself. Asking a language model to work out "9 outliers, up 4"
 * from raw rows is how a dashboard starts quoting numbers that appear nowhere
 * else on the page.
 */
class SearchSummaryWriter
{
    public function generate(CustomKeywordSearch $search, array $facts): ?string
    {
        if (! $this->enabled()) {
            return null;
        }

        $summary = $this->request($search, $facts);

        if ($summary === null) {
            return null;
        }

        $search->forceFill([
            'ai_summary' => $summary,
            'ai_summary_generated_at' => now(),
        ])->save();

        return $summary;
    }

    public function enabled(): bool
    {
        return filter_var(config('custom_keyword_search.analysis.summary_enabled', true), FILTER_VALIDATE_BOOL)
            && ! blank(config('services.openai.api_key'));
    }

    /**
     * @param  array<string, mixed>  $facts
     */
    private function request(CustomKeywordSearch $search, array $facts): ?string
    {
        try {
            $response = Http::withToken((string) config('services.openai.api_key'))
                ->timeout((int) config('custom_keyword_search.analysis.timeout', 45))
                ->acceptJson()
                ->post(rtrim((string) config('services.openai.base_url'), '/').'/chat/completions', [
                    'model' => config('custom_keyword_search.analysis.model', 'gpt-4.1-mini'),
                    'temperature' => 0.4,
                    'messages' => [
                        [
                            'role' => 'system',
                            'content' => implode("\n", [
                                'You write a single-sentence read on a social media tracker dashboard.',
                                '',
                                'You are given figures that have already been computed. Use them exactly as given.',
                                'Never calculate, never round differently, never introduce a number you were not handed.',
                                '',
                                'Rules:',
                                '- Two sentences maximum, 45 words total maximum',
                                '- Plain lowercase prose, no markdown, no headings, no quotes around the whole line',
                                '- Lead with what changed or what stands out',
                                '- Name at most two specifics: a video subject, a format, a hashtag, or a sound',
                                '- If a figure is missing, write around it rather than guessing',
                                '- No hype words: avoid "explosive", "massive", "insane", "game-changing"',
                                '- Do not address the reader, do not give advice',
                            ]),
                        ],
                        [
                            'role' => 'user',
                            'content' => json_encode([
                                'tracker' => $search->name,
                                'type' => $search->search_type,
                                'figures' => $facts,
                            ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
                        ],
                    ],
                ]);

            if ($response->failed()) {
                Log::warning('Search summary request failed.', [
                    'search_id' => $search->id,
                    'status' => $response->status(),
                ]);

                return null;
            }

            $content = trim((string) data_get($response->json(), 'choices.0.message.content'));

            return $content === '' ? null : mb_substr($content, 0, 400);
        } catch (Throwable $e) {
            Log::warning('Search summary threw.', ['search_id' => $search->id, 'error' => $e->getMessage()]);

            return null;
        }
    }
}
