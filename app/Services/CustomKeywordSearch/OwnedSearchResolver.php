<?php

namespace App\Services\CustomKeywordSearch;

use App\Models\CustomKeywordSearch;
use App\Support\GuestIdentity;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class OwnedSearchResolver
{
    public function resolve(Request $request, int $id): CustomKeywordSearch
    {
        $search = $this->baseQuery($request)
            ->with('latestRun')
            ->find($id);

        if ($search === null) {
            throw new NotFoundHttpException('Saved search not found.');
        }

        return $search;
    }

    /**
     * @param  array<int, int>  $ids
     * @return Collection<int, CustomKeywordSearch>
     */
    public function findMany(Request $request, array $ids): Collection
    {
        return $this->baseQuery($request)
            ->whereIn('id', $ids)
            ->with('latestRun')
            ->withCount('videos')
            ->get();
    }

    /**
     * @return Collection<int, CustomKeywordSearch>
     */
    public function all(Request $request, string|array|null $type = null, bool $watchlistedOnly = true): Collection
    {
        $query = $this->baseQuery($request);

        if ($watchlistedOnly) {
            $query->where('is_watchlisted', true);
        }

        if (is_array($type) && $type !== []) {
            $query->whereIn('search_type', $type);
        } elseif ($type !== null) {
            $query->where('search_type', $type);
        }

        return $query
            ->with('latestRun')
            ->withCount('videos')
            ->latest()
            ->get();
    }

    private function baseQuery(Request $request)
    {
        return CustomKeywordSearch::query()
            ->ownedBy($request->user()?->id, GuestIdentity::token($request));
    }
}
