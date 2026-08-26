<?php

namespace Database\Seeders;

use App\Models\IndexedKeyword;
use App\Services\CustomKeywordSearch\KeywordNormalizer;
use App\Support\KeywordIndexDefaults;
use Illuminate\Database\Seeder;

class IndexedKeywordSeeder extends Seeder
{
    public function run(): void
    {
        $normalizer = app(KeywordNormalizer::class);

        foreach (KeywordIndexDefaults::records() as $record) {
            IndexedKeyword::query()->updateOrCreate(
                [
                    'normalized_label' => $normalizer->keyword((string) $record['label']),
                    'keyword_type' => $record['keyword_type'],
                ],
                [
                    'label' => $record['label'],
                    'sector' => $record['sector'],
                    'source' => $record['source'],
                    'deleted_at' => null,
                ],
            );
        }
    }
}
