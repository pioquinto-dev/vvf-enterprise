<?php

namespace App\Services\CustomKeywordSearch;

use App\Models\CustomKeywordSearch;
use App\Models\ViralVideo;
use Illuminate\Support\Facades\Cache;

class FeedDiscoveryService
{
    public function payload(): array
    {
        return Cache::remember('feed-discovery:v1', 900, function (): array {
            $end = now();
            $start = $end->copy()->subDays(7);
            $previous = $start->copy()->subDays(7);
            $mostSearched = CustomKeywordSearch::query()
                ->whereBetween('created_at', [$start, $end])
                ->whereIn('search_type', ['brand', 'product'])
                ->selectRaw('search_type, LOWER(TRIM(phrase)) as phrase, COUNT(*) as count')
                ->groupBy('search_type')->groupByRaw('LOWER(TRIM(phrase))')
                ->orderByDesc('count')->orderBy('phrase')->get();
            $sounds = [];
            $tags = [[], []];
            foreach (ViralVideo::query()->visible()->whereBetween('created_at', [$previous, $end])->lazyById(500) as $video) {
                $period = $video->created_at->gte($start) ? 0 : 1;
                foreach (array_unique(array_filter(array_map(fn ($tag) => mb_strtolower(ltrim(trim((string) $tag), '#')), (array) $video->hashtags))) as $tag) {
                    $tags[$period][$tag] = ($tags[$period][$tag] ?? 0) + 1;
                }
                if ($period === 0 && ($label = $video->soundLabel())) {
                    $sounds[$label] = ($sounds[$label] ?? 0) + 1;
                }
            }
            $climbing = [];
            foreach ($tags[0] as $tag => $count) {
                $before = $tags[1][$tag] ?? 0;
                if ($count > $before) {
                    $climbing[] = ['tag' => $tag, 'count' => $count, 'growth' => $before === 0 ? null : round(100 * ($count - $before) / $before)];
                }
            }
            usort($climbing, fn ($a, $b) => ($b['growth'] ?? -1) <=> ($a['growth'] ?? -1) ?: $b['count'] <=> $a['count'] ?: strcmp($a['tag'], $b['tag']));
            arsort($sounds);

            return [
                'mostSearched' => collect(['brand', 'product'])->mapWithKeys(fn ($type) => [$type => $mostSearched->where('search_type', $type)->take(3)->map(fn ($row) => ['phrase' => $row->phrase, 'count' => (int) $row->count])->values()->all()])->all(),
                'climbingHashtags' => array_slice($climbing, 0, 5),
                'topSounds' => collect($sounds)->take(3)->map(fn ($count, $label) => ['label' => $label, 'count' => $count])->values()->all(),
            ];
        });
    }
}
