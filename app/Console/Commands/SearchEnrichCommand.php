<?php

namespace App\Console\Commands;

use App\Jobs\EnrichSearchResults;
use App\Models\CustomKeywordSearch;
use Illuminate\Console\Command;

/**
 * Manually (re)run the AI enrichment pass for a saved search.
 *
 * The scrape and enrichment are decoupled on purpose — a failed enrichment
 * never marks a run as failed, but that also means a search can end up with
 * videos and no analysis if the AI call fails or the queue never runs it.
 * This command is the escape hatch.
 *
 * Usage:
 *   php artisan search:enrich {id}          # queue enrichment for search id
 *   php artisan search:enrich {id} --sync   # run it inline in this process
 *   php artisan search:enrich --missing     # queue enrichment for every
 *                                             search whose top video is
 *                                             missing why_broke_out
 */
class SearchEnrichCommand extends Command
{
    protected $signature = 'search:enrich
        {id? : The CustomKeywordSearch id (omit with --missing)}
        {--sync : Run inline instead of queuing}
        {--missing : Queue enrichment for every search with un-enriched videos}';

    protected $description = 'Re-run the AI enrichment pass for one saved search (or every search missing analysis).';

    public function handle(): int
    {
        if ($this->option('missing')) {
            return $this->enrichMissing();
        }

        $id = (int) $this->argument('id');
        if ($id <= 0) {
            $this->error('Pass a search id, or use --missing to sweep all un-enriched searches.');

            return self::FAILURE;
        }

        $search = CustomKeywordSearch::find($id);
        if (!$search) {
            $this->error("No CustomKeywordSearch with id {$id}.");

            return self::FAILURE;
        }

        $this->dispatchFor($search);

        return self::SUCCESS;
    }

    private function enrichMissing(): int
    {
        $ids = CustomKeywordSearch::query()
            ->whereHas('videos', fn ($q) => $q->whereHas('video', fn ($vq) => $vq->whereNull('content_why_broke_out')))
            ->pluck('id');

        if ($ids->isEmpty()) {
            $this->info('Nothing to enrich — every search already has analysis on its videos.');

            return self::SUCCESS;
        }

        foreach ($ids as $id) {
            $this->dispatchFor(CustomKeywordSearch::find($id));
        }

        $this->info("Dispatched enrichment for {$ids->count()} search(es).");

        return self::SUCCESS;
    }

    private function dispatchFor(CustomKeywordSearch $search): void
    {
        $label = "search #{$search->id} ({$search->name})";

        if ($this->option('sync')) {
            $this->line("Running enrichment inline for {$label}…");
            EnrichSearchResults::dispatchSync($search->id);
            $this->info("Enrichment complete for {$label}.");

            return;
        }

        EnrichSearchResults::dispatch($search->id)
            ->onQueue((string) config('custom_keyword_search.queue', 'default'));
        $this->info("Queued enrichment for {$label}.");
    }
}
