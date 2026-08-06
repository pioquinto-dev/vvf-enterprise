<?php

namespace App\Services\Apify;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use RuntimeException;

/**
 * Thin wrapper over the Apify REST API — start a task run, poll it, read the
 * dataset. Deliberately dumb: no domain logic lives here.
 */
class ApifyClient
{
    public const TERMINAL_STATUSES = ['SUCCEEDED', 'FAILED', 'ABORTED', 'TIMED-OUT'];

    public function isConfigured(): bool
    {
        return filled(config('services.apify.token'));
    }

    /**
     * @param  array<string, mixed>  $input
     * @return array<string, mixed>
     */
    public function startTaskRun(string $taskId, array $input): array
    {
        $response = $this->request()->post("/v2/actor-tasks/{$taskId}/runs", $input);

        if ($response->failed()) {
            throw new RuntimeException(
                "Apify run could not be started (HTTP {$response->status()}): ".$response->body()
            );
        }

        return (array) $response->json('data', []);
    }

    /**
     * @return array<string, mixed>
     */
    public function getRun(string $runId): array
    {
        $response = $this->request()->get("/v2/actor-runs/{$runId}");

        if ($response->failed()) {
            throw new RuntimeException("Apify run {$runId} could not be read (HTTP {$response->status()}).");
        }

        return (array) $response->json('data', []);
    }

    public function abortRun(string $runId): void
    {
        $this->request()->post("/v2/actor-runs/{$runId}/abort");
    }

    /**
     * Polls until the run reaches a terminal state or the budget runs out.
     * Returns the final run payload either way — the caller decides what a
     * non-SUCCEEDED status means.
     *
     * @return array<string, mixed>
     */
    public function waitForRun(string $runId, ?int $timeoutSeconds = null, ?int $pollSeconds = null): array
    {
        $timeoutSeconds ??= (int) config('custom_keyword_search.scrape.run_timeout_seconds', 900);
        $pollSeconds = max(1, $pollSeconds ?? (int) config('custom_keyword_search.scrape.poll_seconds', 10));

        $deadline = time() + $timeoutSeconds;
        $run = $this->getRun($runId);

        while (! in_array((string) ($run['status'] ?? ''), self::TERMINAL_STATUSES, true)) {
            if (time() >= $deadline) {
                return $run + ['status' => 'TIMED-OUT', 'timed_out_locally' => true];
            }

            sleep($pollSeconds);
            $run = $this->getRun($runId);
        }

        return $run;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function getDatasetItems(string $datasetId, int $limit = 1000): array
    {
        $response = $this->request()->get("/v2/datasets/{$datasetId}/items", [
            'clean' => 'true',
            'format' => 'json',
            'limit' => $limit,
        ]);

        if ($response->failed()) {
            throw new RuntimeException("Apify dataset {$datasetId} could not be read (HTTP {$response->status()}).");
        }

        $items = $response->json();

        return is_array($items) ? $items : [];
    }

    private function request(): PendingRequest
    {
        $base = rtrim((string) config('services.apify.base_url', 'https://api.apify.com'), '/');

        // The configured base URL may or may not already include the version
        // segment; paths in this class always carry their own /v2 prefix.
        $base = preg_replace('#/v2$#', '', $base) ?? $base;

        return Http::withToken((string) config('services.apify.token'))
            ->baseUrl($base)
            ->acceptJson()
            ->timeout((int) env('HTTP_TIMEOUT', 120))
            ->retry((int) env('HTTP_RETRY_TIMES', 3), 500, throw: false);
    }
}
