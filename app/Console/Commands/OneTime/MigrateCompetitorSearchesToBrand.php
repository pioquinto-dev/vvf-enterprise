<?php

namespace App\Console\Commands\OneTime;

use App\Models\CustomKeywordSearch;
use Illuminate\Console\Command;

class MigrateCompetitorSearchesToBrand extends Command
{
    protected $signature = 'searches:migrate-competitors-to-brand {--dry-run : Show how many rows would change without updating them}';

    protected $description = 'Reclassify legacy competitor searches as brand searches.';

    public function handle(): int
    {
        $query = CustomKeywordSearch::withTrashed()->where('search_type', CustomKeywordSearch::TYPE_COMPETITOR);
        $count = (clone $query)->count();

        if ($count === 0) {
            $this->info('No competitor searches found.');

            return self::SUCCESS;
        }

        if ($this->option('dry-run')) {
            $this->info("{$count} competitor searches would be updated to brand.");

            return self::SUCCESS;
        }

        $updated = $query->update([
            'search_type' => CustomKeywordSearch::TYPE_BRAND,
        ]);

        $this->info("Updated {$updated} competitor searches to brand.");

        return self::SUCCESS;
    }
}
