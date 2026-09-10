<?php

namespace App\Services\CustomKeywordSearch;

use App\Http\Resources\SavedSearchPresenter;
use App\Models\CustomKeywordSearch;
use App\Models\CustomKeywordSearchVideo;
use App\Repositories\CustomKeywordSearch\FeedRepository;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/**
 * Shared body for the brand/product hubs: the tracked searches with their
 * headline stats, plus the single best breakout across them ("Moving this
 * week") and a tiered "Suggested to track" chip row.
 */
class SearchHubService
{
    private const SEARCH_SUGGESTION_TARGET = 5;

    public function __construct(
        private readonly OwnedSearchResolver $searches,
        private readonly FeedRepository $repository,
        private readonly KeywordExpansionService $expansion,
    ) {}

    /**
     * @param  array<int, string>  $types
     * @return array<string, mixed>
     */
    public function payload(Request $request, array $types): array
    {
        $searches = $this->searches->all($request, $types, false);
        $searches->loadCount([
            'videos',
            'videos as outlier_count' => fn ($query) => $query->where('is_new_breakout', true),
        ]);
        $searches->loadMax('videos', 'viral_score');
        $searches->load('latestSnapshot');

        $searchIds = $searches->pluck('id');

        // Pure video-stat aggregates that only move when a search run
        // completes (minutes-scale) — safe to cache briefly. Search status
        // (paused/bookmarked) and counts stay live above, so a pause/resume
        // toggle on this page always reflects immediately.
        $aggregateKey = 'search-hub:aggregates:'.md5($searchIds->sort()->implode(','));

        $aggregates = Cache::remember($aggregateKey, 60, fn (): array => [
            'averageViews' => $this->repository->averageViewsBySearchId($searchIds),
            'moving' => $this->movingThisWeek($searches),
        ]);

        $averageViewsBySearchId = collect($aggregates['averageViews']);

        $searches->each(function (CustomKeywordSearch $search) use ($averageViewsBySearchId): void {
            $search->average_video_views = $averageViewsBySearchId->get($search->id);
        });

        $cards = $searches
            ->map(fn (CustomKeywordSearch $search): array => SavedSearchPresenter::card($search))
            ->values()
            ->all();

        return [
            'searches' => $cards,
            'moving' => $aggregates['moving'],
            'suggestions' => $this->suggestions($searches, $types),
            // ?q= drops someone straight into the inline flow with the subject
            // filled in — this is where My Feed's search box hands off to.
            'prefillQuery' => trim((string) $request->query('q', '')),
        ];
    }

    /**
     * Top breakout videos across a set of searches, newest-scored first.
     *
     * @param  Collection<int, CustomKeywordSearch>  $searches
     * @return array<int, array<string, mixed>>
     */
    private function movingThisWeek(Collection $searches): array
    {
        if ($searches->isEmpty()) {
            return [];
        }

        $names = $searches->pluck('name', 'id');
        $urls = $searches->mapWithKeys(fn (CustomKeywordSearch $s): array => [$s->id => $s->url()]);

        return $this->repository->movingThisWeekRows($searches->pluck('id'), 3)
            ->map(function (CustomKeywordSearchVideo $row) use ($names, $urls): array {
                $card = $row->video?->toCardArray() ?? [];

                return [
                    'subject' => $names[$row->custom_keyword_search_id] ?? null,
                    'url' => $urls[$row->custom_keyword_search_id] ?? null,
                    'multiplier' => $row->viral_score > 0 ? round($row->viral_score).'x' : null,
                    'caption' => $card['title'] ?? null,
                    'handle' => $card['handle'] ?? null,
                    'views' => $card['views'] ?? null,
                    'thumbnail_url' => $card['thumbnail_url'] ?? null,
                ];
            })
            ->all();
    }

    /**
     * "Suggested to track" — a tiered, mostly real signal:
     *   1. other users' searches (of this kind) that share the most creators
     *      with the ones this user already tracks;
     *   2. otherwise the most-tracked searches across other users;
     *   3. otherwise AI-expanded adjacent ideas from the user's own recent
     *      searches;
     *   4. otherwise a small curated set of subjects trending in the US.
     * Tiers 1–2 come from real data; tier 4 is an explicit sample fallback for
     * a fresh install with nothing to learn from yet.
     *
     * @param  Collection<int, CustomKeywordSearch>  $searches
     * @param  array<int, string>  $types
     * @return array<int, array<string, mixed>>
     */
    private function suggestions(Collection $searches, array $types): array
    {
        $userId = $searches->first()?->user_id;
        $trackedPhrases = $searches
            ->flatMap(fn (CustomKeywordSearch $s): array => [
                $this->normalizeSuggestionName((string) $s->phrase),
                $this->normalizeSuggestionName((string) $s->name),
            ])
            ->filter()
            ->unique()
            ->values()
            ->all();

        $out = [];
        $seen = [];

        $target = self::SEARCH_SUGGESTION_TARGET;

        $add = function (?string $name, string $why) use (&$out, &$seen, $trackedPhrases, $target): void {
            $name = trim((string) $name);
            $key = $this->normalizeSuggestionName($name);
            $coveredByTrackedPhrase = collect($trackedPhrases)->contains(function (string $tracked) use ($key): bool {
                return $tracked === $key
                    || str_contains($tracked, $key)
                    || str_contains($key, $tracked);
            });

            if ($name === '' || $key === '' || count($out) >= $target || isset($seen[$key]) || $coveredByTrackedPhrase) {
                return;
            }
            $seen[$key] = true;
            $out[] = ['name' => $name, 'why' => $why];
        };

        // Tier 1 — other users' searches that share creators with this user's.
        if ($userId !== null && ! $searches->isEmpty()) {
            $creators = DB::table('custom_keyword_search_videos as csv')
                ->join('viral_videos as v', 'v.id', '=', 'csv.viral_video_id')
                ->whereIn('csv.custom_keyword_search_id', $searches->pluck('id'))
                ->whereNull('v.archived_at')
                ->whereNotNull('v.username')
                ->pluck('v.username')
                ->map(fn ($u) => mb_strtolower((string) $u))
                ->unique()
                ->values()
                ->all();

            if ($creators !== []) {
                $shared = DB::table('custom_keyword_search_videos as csv')
                    ->join('viral_videos as v', 'v.id', '=', 'csv.viral_video_id')
                    ->join('custom_keyword_searches as s', 's.id', '=', 'csv.custom_keyword_search_id')
                    ->whereIn('s.search_type', $types)
                    ->where('s.user_id', '!=', $userId)
                    ->whereNull('s.deleted_at')
                    ->whereNull('v.archived_at')
                    ->whereIn(DB::raw('LOWER(v.username)'), $creators)
                    ->groupBy('s.phrase')
                    ->select('s.phrase', DB::raw('COUNT(DISTINCT LOWER(v.username)) as overlap'))
                    ->orderByDesc('overlap')
                    ->limit(8)
                    ->get();

                foreach ($shared as $row) {
                    $add($row->phrase, 'Shares '.$row->overlap.' creator'.($row->overlap == 1 ? '' : 's').' with your searches');
                }
            }
        }

        // Tier 2 — the most-tracked searches across other users.
        if (count($out) < $target && $userId !== null) {
            $popular = DB::table('custom_keyword_searches')
                ->whereIn('search_type', $types)
                ->where('user_id', '!=', $userId)
                ->whereNull('deleted_at')
                ->groupBy('phrase')
                ->select('phrase', DB::raw('COUNT(*) as c'))
                ->orderByDesc('c')
                ->limit(12)
                ->get();

            foreach ($popular as $row) {
                $add($row->phrase, $row->c > 1 ? 'Tracked by '.$row->c.' others' : 'Popular right now');
            }
        }

        // Tier 3 — AI expands the user's recent searches into adjacent but
        // not-yet-tracked ideas so the chip row stays useful and full.
        if (count($out) < $target) {
            $expandedBySearch = $searches
                ->take(5)
                ->map(fn (CustomKeywordSearch $search): array => array_values((array) ($this->expansion->expand((string) $search->phrase, allowAi: false, type: (string) $search->search_type)['keywords'] ?? [])))
                ->filter(fn (array $keywords): bool => $keywords !== [])
                ->values();

            $round = 0;

            while (count($out) < $target && $expandedBySearch->isNotEmpty()) {
                $addedThisRound = false;

                foreach ($expandedBySearch as $keywords) {
                    if (! array_key_exists($round, $keywords)) {
                        continue;
                    }

                    $before = count($out);
                    $add($keywords[$round], 'Suggested from your recent searches');
                    $addedThisRound = $addedThisRound || count($out) > $before;

                    if (count($out) >= $target) {
                        break;
                    }
                }

                if (! $addedThisRound) {
                    break;
                }

                $round++;
            }
        }

        // Tier 4 — curated fallback when there is still nothing else to show.
        if (count($out) < $target) {
            $samples = $types === [CustomKeywordSearch::TYPE_PRODUCT]
                ? ['sol de janeiro', 'laneige lip mask', 'stanley cup', 'brow gel', 'neck cream']
                : ['rhode', 'olipop', 'gymshark', 'rare beauty', 'summer fridays'];

            foreach ($samples as $name) {
                $add($name, 'Trending in the US');
            }
        }

        return $out;
    }

    private function normalizeSuggestionName(string $value): string
    {
        $value = mb_strtolower(trim($value));
        $value = preg_replace('/[^\pL\pN]+/u', ' ', $value) ?? $value;

        return preg_replace('/\s+/u', ' ', trim($value)) ?? trim($value);
    }
}
