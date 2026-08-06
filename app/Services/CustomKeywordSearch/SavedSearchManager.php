<?php

namespace App\Services\CustomKeywordSearch;

use App\Models\User;
use App\Services\Billing\BillingService;
use App\Jobs\RunCustomKeywordSearch;
use App\Models\CustomKeywordSearch;
use App\Models\CustomKeywordSearchRun;
use Illuminate\Validation\ValidationException;

/**
 * Create, dedupe and queue saved searches. Everything that mutates a saved
 * search's lifecycle goes through here so status transitions stay in one file.
 */
class SavedSearchManager
{
    public function __construct(
        private readonly KeywordNormalizer $normalizer,
        private readonly SearchRunProcessor $processor,
        private readonly BillingService $billing,
    ) {}

    /**
     * @param  array<int, string>  $keywords
     */
    public function create(
        ?User $user,
        ?string $guestToken,
        string $type,
        string $phrase,
        array $keywords,
        ?string $name,
        string $frequency,
    ): CustomKeywordSearch {
        $type = in_array($type, CustomKeywordSearch::allowedTypes(), true)
            ? $type
            : CustomKeywordSearch::TYPE_BRAND;

        $userId = $user?->id;
        $phrase = $this->normalizer->keyword($phrase);
        $keywords = $this->normalizer->keywordSet($phrase, $keywords);

        if ($phrase === '' || $keywords === []) {
            throw ValidationException::withMessages([
                'phrase' => 'Enter something to search for.',
            ]);
        }

        $frequency = in_array($frequency, [CustomKeywordSearch::FREQUENCY_WEEKLY, CustomKeywordSearch::FREQUENCY_MONTHLY], true)
            ? $frequency
            : CustomKeywordSearch::FREQUENCY_WEEKLY;

        $name = $this->normalizer->name($name, $phrase);
        $signature = $this->normalizer->signature($keywords);

        // Same keywords in any order means the same saved search. Reuse it
        // instead of cluttering the list with near-duplicates.
        $existing = CustomKeywordSearch::query()
            ->ownedBy($userId, $guestToken)
            ->where('search_type', $type)
            ->where('keyword_signature', $signature)
            ->first();

        if ($existing !== null) {
            $existing->update(['name' => $name, 'frequency' => $frequency]);

            if (! $existing->hasActiveRun()) {
                $this->queueRun($existing);
            }

            return $existing->refresh();
        }

        $search = CustomKeywordSearch::create([
            'user_id' => $userId,
            'guest_token' => $userId === null ? $guestToken : null,
            'name' => $name,
            'phrase' => $phrase,
            'search_type' => $type,
            'keywords' => $keywords,
            'keyword_signature' => $signature,
            'frequency' => $frequency,
            'status' => CustomKeywordSearch::STATUS_SCRAPING,
            'is_watchlisted' => false,
            'next_run_at' => $this->processor->nextRunAt($frequency),
        ]);

        if ($user !== null) {
            $this->billing->consumeSearchCredit($user);
        }

        $this->queueRun($search);

        return $search;
    }

    public function queueRun(CustomKeywordSearch $search): CustomKeywordSearchRun
    {
        $run = $search->runs()->create(['status' => CustomKeywordSearchRun::STATUS_QUEUED]);

        $search->update(['status' => CustomKeywordSearch::STATUS_SCRAPING]);

        RunCustomKeywordSearch::dispatch($run->id)
            ->onQueue((string) config('custom_keyword_search.queue', 'default'));

        return $run;
    }

    public function pause(CustomKeywordSearch $search): CustomKeywordSearch
    {
        $search->runs()
            ->whereIn('status', [CustomKeywordSearchRun::STATUS_QUEUED, CustomKeywordSearchRun::STATUS_RUNNING])
            ->update([
                'status' => CustomKeywordSearchRun::STATUS_FAILED,
                'error_message' => 'Superseded — search was paused.',
                'completed_at' => now(),
                'updated_at' => now(),
            ]);

        $search->update([
            'status' => CustomKeywordSearch::STATUS_PAUSED,
            'next_run_at' => null,
        ]);

        return $search->refresh();
    }

    public function resume(CustomKeywordSearch $search): CustomKeywordSearch
    {
        $search->update([
            'status' => CustomKeywordSearch::STATUS_DONE,
            'next_run_at' => $this->processor->nextRunAt($search->frequency),
        ]);

        return $search->refresh();
    }

    public function updateSettings(CustomKeywordSearch $search, ?string $name, ?string $frequency): CustomKeywordSearch
    {
        $changes = [];

        if ($name !== null) {
            $changes['name'] = $this->normalizer->name($name, $search->phrase);
        }

        if ($frequency !== null && in_array($frequency, [CustomKeywordSearch::FREQUENCY_WEEKLY, CustomKeywordSearch::FREQUENCY_MONTHLY], true)) {
            $changes['frequency'] = $frequency;

            if ($search->status !== CustomKeywordSearch::STATUS_PAUSED) {
                $changes['next_run_at'] = $this->processor->nextRunAt($frequency);
            }
        }

        if ($changes !== []) {
            $search->update($changes);
        }

        return $search->refresh();
    }

    public function delete(CustomKeywordSearch $search): void
    {
        $search->runs()
            ->whereIn('status', [CustomKeywordSearchRun::STATUS_QUEUED, CustomKeywordSearchRun::STATUS_RUNNING])
            ->update([
                'status' => CustomKeywordSearchRun::STATUS_FAILED,
                'error_message' => 'Superseded — search was deleted.',
                'completed_at' => now(),
                'updated_at' => now(),
            ]);

        $search->delete();
    }

    public function setWatchlist(CustomKeywordSearch $search, bool $watchlisted): CustomKeywordSearch
    {
        $search->update(['is_watchlisted' => $watchlisted]);

        return $search->refresh();
    }

    /**
     * Hands guest searches to a user once they sign in, so the free search they
     * just ran does not disappear behind the login.
     */
    public function claimGuestSearches(int $userId, ?string $guestToken): int
    {
        if ($guestToken === null) {
            return 0;
        }

        return CustomKeywordSearch::query()
            ->whereNull('user_id')
            ->where('guest_token', $guestToken)
            ->update(['user_id' => $userId, 'guest_token' => null, 'updated_at' => now()]);
    }
}
