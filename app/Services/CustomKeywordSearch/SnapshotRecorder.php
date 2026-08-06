<?php

namespace App\Services\CustomKeywordSearch;

use App\Http\Resources\SavedSearchPresenter;
use App\Models\CustomKeywordSearch;
use App\Models\CustomKeywordSearchRun;
use App\Models\CustomKeywordSearchSnapshot;

/**
 * Writes the measurement that every trend line on the detail page reads back.
 *
 * Called once at the end of a successful run. Nothing else should write
 * recorded snapshots — a second writer would put two points at the same instant
 * and double-count the week.
 */
class SnapshotRecorder
{
    public function __construct(private readonly SearchMetrics $metrics) {}

    public function record(CustomKeywordSearch $search, ?CustomKeywordSearchRun $run = null): ?CustomKeywordSearchSnapshot
    {
        $results = SavedSearchPresenter::resultRows($search);

        if ($results === []) {
            return null;
        }

        $metrics = $this->metrics->for($results);
        $tallies = $this->metrics->tallies($results);

        return CustomKeywordSearchSnapshot::create($metrics + [
            'custom_keyword_search_id' => $search->id,
            'custom_keyword_search_run_id' => $run?->id,
            'captured_at' => now(),
            'is_reconstructed' => false,
            'hashtag_counts' => $tallies['hashtags'],
            'sound_counts' => $tallies['sounds'],
        ]);
    }
}
