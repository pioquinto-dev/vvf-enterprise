<?php

namespace App\Support;

use App\Models\CustomKeywordSearch;
use App\Models\CustomKeywordSearchVideo;
use App\Models\Subscription;
use App\Models\User;
use App\Models\ViralVideo;

/**
 * What a merge field can be resolved from.
 *
 * A source is either GIVEN — the sending code passed the exact object the email
 * is about — or LOOKED UP from the recipient on demand. That distinction is the
 * whole design:
 *
 *  - On a "your search finished" email, the search is given, so `searchLabel`
 *    is the search that just finished.
 *  - On a billing email there is no search in hand, so `searchLabel` falls back
 *    to the recipient's most recent one.
 *
 * Both are useful; they are just not the same thing, which is why the admin
 * screen labels them differently. Lookups are lazy and memoised, so ticking no
 * fields costs no queries, and ticking three costs at most three.
 */
class EmailContext
{
    private bool $subscriptionResolved = false;

    private bool $searchResolved = false;

    private bool $videoResolved = false;

    public function __construct(
        public readonly User $user,
        private ?Subscription $subscription = null,
        private ?CustomKeywordSearch $search = null,
        private ?ViralVideo $video = null,
    ) {
        // Anything handed in is authoritative and must never be re-queried.
        $this->subscriptionResolved = $subscription !== null;
        $this->searchResolved = $search !== null;
        $this->videoResolved = $video !== null;
    }

    public function sourceFor(string $source): mixed
    {
        return match ($source) {
            'user' => $this->user,
            'subscription' => $this->subscription(),
            'search' => $this->search(),
            'video' => $this->video(),
            default => null,
        };
    }

    /**
     * Sources the sending code passed directly, so a field reading one of these
     * describes what this email is actually about.
     *
     * @return array<int, string>
     */
    public function givenSources(): array
    {
        $given = ['user'];

        if ($this->subscriptionResolved && $this->subscription !== null) {
            $given[] = 'subscription';
        }

        if ($this->searchResolved && $this->search !== null) {
            $given[] = 'search';
        }

        if ($this->videoResolved && $this->video !== null) {
            $given[] = 'video';
        }

        return $given;
    }

    /**
     * The subscription that describes this account now: a live one if there is
     * one, otherwise the most recent, so a winback email can still say what
     * ended and when.
     */
    private function subscription(): ?Subscription
    {
        if ($this->subscriptionResolved) {
            return $this->subscription;
        }

        $this->subscriptionResolved = true;

        return $this->subscription = Subscription::query()
            ->with('plan')
            ->where('user_id', $this->user->id)
            ->orderByRaw("CASE WHEN status IN ('active','trialing','trial','past_due') THEN 0 ELSE 1 END")
            ->latest('created_at')
            ->first();
    }

    /** The recipient's most recently refreshed search. */
    private function search(): ?CustomKeywordSearch
    {
        if ($this->searchResolved) {
            return $this->search;
        }

        $this->searchResolved = true;

        return $this->search = CustomKeywordSearch::query()
            ->where('user_id', $this->user->id)
            ->orderByRaw('COALESCE(last_run_at, created_at) DESC')
            ->first();
    }

    /** Their strongest breakout, across everything they track. */
    private function video(): ?ViralVideo
    {
        if ($this->videoResolved) {
            return $this->video;
        }

        $this->videoResolved = true;

        $searchIds = CustomKeywordSearch::query()
            ->where('user_id', $this->user->id)
            ->pluck('id');

        if ($searchIds->isEmpty()) {
            return $this->video = null;
        }

        $row = CustomKeywordSearchVideo::query()
            ->whereIn('custom_keyword_search_id', $searchIds)
            ->where('is_new_breakout', true)
            ->whereHas('video', fn ($query) => $query->visible())
            ->with('video')
            ->orderByDesc('viral_score')
            ->orderBy('id')
            ->first();

        return $this->video = $row?->video;
    }
}
