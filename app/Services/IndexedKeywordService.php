<?php

namespace App\Services;

use App\Models\CustomKeywordSearch;
use App\Models\IndexedKeyword;
use App\Services\CustomKeywordSearch\KeywordNormalizer;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class IndexedKeywordService
{
    public function __construct(
        private readonly KeywordNormalizer $normalizer,
    ) {}

    /**
     * @return array<int, array<string, mixed>>
     */
    public function suggest(string $type, string $query, int $limit = 10, ?int $userId = null): array
    {
        $type = $this->normalizeType($type);
        $query = $this->normalizer->keyword($query);

        if ($query === '') {
            return $this->trendingSuggestions($type, $limit, $userId);
        }

        $startsWith = IndexedKeyword::query()
            ->live()
            ->where('keyword_type', $type)
            ->where('normalized_label', 'like', $query.'%')
            ->orderByDesc('usage_count')
            ->orderBy('label')
            ->limit($limit)
            ->get();

        $remaining = max(0, $limit - $startsWith->count());

        $contains = $remaining > 0
            ? IndexedKeyword::query()
                ->live()
                ->where('keyword_type', $type)
                ->where('normalized_label', 'like', '%'.$query.'%')
                ->whereNotIn('id', $startsWith->pluck('id'))
                ->orderByDesc('usage_count')
                ->orderBy('label')
                ->limit($remaining)
                ->get()
            : collect();

        return $startsWith
            ->concat($contains)
            ->map(fn (IndexedKeyword $keyword): array => $this->mapSuggestion($keyword))
            ->values()
            ->all();
    }

    /**
     * @return array<int, string>
     */
    public function relatedTerms(string $type, string $phrase, int $limit = 6): array
    {
        $type = $this->normalizeType($type);
        $phrase = $this->normalizer->keyword($phrase);

        if ($phrase === '') {
            return [];
        }

        $tokens = array_values(array_filter(explode(' ', $phrase)));

        if ($tokens === []) {
            return [];
        }

        $query = IndexedKeyword::query()
            ->live()
            ->where('keyword_type', $type)
            ->where('normalized_label', '!=', $phrase);

        $query->where(function ($builder) use ($tokens): void {
            foreach ($tokens as $token) {
                $builder->orWhere('normalized_label', 'like', '%'.$token.'%');
            }
        });

        return $query
            ->orderByDesc('usage_count')
            ->orderBy('label')
            ->limit($limit * 3)
            ->get()
            ->map(fn (IndexedKeyword $keyword): string => $keyword->label)
            ->unique(fn (string $label): string => mb_strtolower($label))
            ->take($limit)
            ->values()
            ->all();
    }

    /**
     * @param  array<int, string>  $keywords
     */
    public function learnFromSearch(string $type, string $phrase, array $keywords): void
    {
        $this->touchTerm($type, $phrase, 'search');
    }

    public function touchTerm(string $type, string $label, string $source = 'manual'): IndexedKeyword
    {
        $type = $this->normalizeType($type);
        $label = trim(preg_replace('/\s+/', ' ', $label) ?? $label);
        $normalized = $this->normalizer->keyword($label);

        $record = IndexedKeyword::query()
            ->withTrashed()
            ->firstOrNew([
                'normalized_label' => $normalized,
                'keyword_type' => $type,
            ]);

        $record->label = $label;
        $record->source = $record->exists ? $record->source : $source;
        $record->deleted_at = null;
        $record->last_seen_at = now();
        $record->usage_count = (int) $record->usage_count + 1;
        $record->save();

        return $record;
    }

    private function normalizeType(string $type): string
    {
        return in_array($type, IndexedKeyword::allowedTypes(), true) ? $type : IndexedKeyword::TYPE_BRAND;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function trendingSuggestions(string $type, int $limit, ?int $userId = null): array
    {
        $excludedLabels = $this->searchedLabels($type, $userId);
        $personalized = $this->personalizedSuggestions($type, $limit, $userId, $excludedLabels);

        if ($personalized->count() >= $limit) {
            return $personalized->take($limit)->values()->all();
        }

        $trending = $this->trendingSearches($type, $limit, $personalized, $excludedLabels);

        if ($trending->count() >= $limit) {
            return $trending->values()->all();
        }

        $existingLabels = $trending
            ->pluck('label')
            ->filter()
            ->map(fn (string $label): string => $this->normalizer->keyword($label))
            ->merge($excludedLabels)
            ->unique()
            ->all();

        $fallback = IndexedKeyword::query()
            ->live()
            ->where('keyword_type', $type)
            ->when($existingLabels !== [], fn ($query) => $query->whereNotIn('normalized_label', $existingLabels))
            ->orderByDesc('usage_count')
            ->orderByDesc('last_seen_at')
            ->orderBy('label')
            ->limit(max(0, $limit - $trending->count()))
            ->get()
            ->map(fn (IndexedKeyword $keyword): array => $this->mapSuggestion($keyword));

        return $trending
            ->concat($fallback)
            ->take($limit)
            ->values()
            ->all();
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    private function personalizedSuggestions(string $type, int $limit, ?int $userId = null, array $excludedLabels = []): Collection
    {
        if ($userId === null) {
            return collect();
        }

        $searchTypes = $type === IndexedKeyword::TYPE_BRAND
            ? [CustomKeywordSearch::TYPE_BRAND, CustomKeywordSearch::TYPE_COMPETITOR]
            : [CustomKeywordSearch::TYPE_PRODUCT];

        $searches = CustomKeywordSearch::query()
            ->where('user_id', $userId)
            ->whereIn('search_type', $searchTypes)
            ->orderByDesc('last_run_at')
            ->orderByDesc('created_at')
            ->limit(12)
            ->get(['id', 'phrase', 'keywords', 'search_type', 'created_at', 'last_run_at']);

        if ($searches->isEmpty()) {
            return collect();
        }

        $keywordsByLabel = IndexedKeyword::query()
            ->live()
            ->where('keyword_type', $type)
            ->get()
            ->keyBy('normalized_label');

        $suggestions = collect();

        foreach ($searches as $search) {
            foreach ($this->relatedTerms($type, (string) $search->phrase, 2) as $index => $related) {
                $normalized = $this->normalizer->keyword($related);

                if ($normalized === '' || in_array($normalized, $excludedLabels, true)) {
                    continue;
                }

                $suggestions->push([
                    'id' => sprintf('personal-related-%s-%d-%d', $search->id, $index, crc32($normalized)),
                    'label' => $related,
                    'type' => $type,
                    'sector' => $keywordsByLabel->get($normalized)?->sector,
                    'usageCount' => 0,
                ]);
            }
        }

        return $suggestions
            ->unique(fn (array $suggestion): string => $this->normalizer->keyword((string) ($suggestion['label'] ?? '')))
            ->take($limit)
            ->values();
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    private function trendingSearches(string $type, int $limit, ?Collection $seeded = null, array $excludedLabels = []): Collection
    {
        $searchTypes = $type === IndexedKeyword::TYPE_BRAND
            ? [CustomKeywordSearch::TYPE_BRAND, CustomKeywordSearch::TYPE_COMPETITOR]
            : [CustomKeywordSearch::TYPE_PRODUCT];

        $keywordsByLabel = IndexedKeyword::query()
            ->live()
            ->where('keyword_type', $type)
            ->get()
            ->keyBy('normalized_label');

        $existingLabels = ($seeded ?? collect())
            ->pluck('label')
            ->filter()
            ->map(fn (string $label): string => $this->normalizer->keyword($label))
            ->merge($excludedLabels)
            ->unique()
            ->all();

        $trending = CustomKeywordSearch::query()
            ->selectRaw('MIN(id) as id, phrase, LOWER(phrase) as normalized_phrase, COUNT(*) as usage_count, MAX(created_at) as latest_at')
            ->whereIn('search_type', $searchTypes)
            ->whereNotNull('phrase')
            ->where('phrase', '!=', '')
            ->when($existingLabels !== [], fn ($query) => $query->whereNotIn(DB::raw('LOWER(phrase)'), $existingLabels))
            ->groupBy('phrase', DB::raw('LOWER(phrase)'))
            ->orderByDesc('usage_count')
            ->orderByDesc('latest_at')
            ->limit($limit)
            ->get()
            ->map(function (CustomKeywordSearch $search) use ($keywordsByLabel, $type): array {
                $normalized = $this->normalizer->keyword($search->phrase);
                /** @var IndexedKeyword|null $keyword */
                $keyword = $keywordsByLabel->get($normalized);

                return [
                    'id' => 'trending-'.$search->id,
                    'label' => $search->phrase,
                    'type' => $type,
                    'sector' => $keyword?->sector,
                    'usageCount' => (int) $search->usage_count,
                ];
            });

        return ($seeded ?? collect())
            ->concat($trending)
            ->take($limit)
            ->values();
    }

    /**
     * @return array<int, string>
     */
    private function searchedLabels(string $type, ?int $userId = null): array
    {
        if ($userId === null) {
            return [];
        }

        $searchTypes = $type === IndexedKeyword::TYPE_BRAND
            ? [CustomKeywordSearch::TYPE_BRAND, CustomKeywordSearch::TYPE_COMPETITOR]
            : [CustomKeywordSearch::TYPE_PRODUCT];

        return CustomKeywordSearch::query()
            ->where('user_id', $userId)
            ->whereIn('search_type', $searchTypes)
            ->pluck('phrase')
            ->map(fn (?string $phrase): string => $this->normalizer->keyword((string) $phrase))
            ->filter()
            ->unique()
            ->values()
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    private function mapSuggestion(IndexedKeyword $keyword): array
    {
        return [
            'id' => $keyword->id,
            'label' => $keyword->label,
            'type' => $keyword->keyword_type,
            'sector' => $keyword->sector,
            'usageCount' => $keyword->usage_count,
        ];
    }
}
