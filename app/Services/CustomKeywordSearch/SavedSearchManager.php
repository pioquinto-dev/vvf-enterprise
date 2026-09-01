<?php

namespace App\Services\CustomKeywordSearch;

use App\Jobs\RunCustomKeywordSearch;
use App\Models\CustomKeywordSearch;
use App\Models\CustomKeywordSearchRun;
use App\Models\User;
use App\Services\Admin\UserActivityService;
use App\Services\Billing\BillingService;
use App\Services\IndexedKeywordService;
use Closure;
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
        private readonly UserActivityService $activity,
        private readonly IndexedKeywordService $indexedKeywords,
    ) {}

    /**
     * @param  array<int, string>  $keywords
     * @param  ?Closure():void  $chargeGuest  Called instead of the credit
     *                                        deduction when there is no user,
     *                                        at exactly the points a real
     *                                        scrape is about to start.
     */
    public function create(
        ?User $user,
        ?string $guestToken,
        string $type,
        string $phrase,
        array $keywords,
        ?string $name,
        string $frequency,
        ?array $sources = null,
        ?Closure $chargeGuest = null,
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
        $sourceHandle = $this->normalizeSourceHandle($sources['tiktokHandle'] ?? null);
        $sourceWebsite = $this->normalizeSourceWebsite($sources['website'] ?? null);

        // Reuse a matching phrase from the account's full history, including
        // legacy search types, instead of creating a second tracking record.
        $existing = $this->findExistingByPhrase($userId, $guestToken, $phrase);

        if ($existing !== null) {
            return $this->refreshWithKeywords($existing, $user, $keywords, $chargeGuest);
        }

        $search = CustomKeywordSearch::create([
            'user_id' => $userId,
            'guest_token' => $userId === null ? $guestToken : null,
            'name' => $name,
            'phrase' => $phrase,
            'search_type' => $type,
            'source_tiktok_handle' => $sourceHandle,
            'source_website' => $sourceWebsite,
            'keywords' => $keywords,
            'keyword_signature' => $signature,
            'frequency' => $frequency,
            'status' => CustomKeywordSearch::STATUS_SCRAPING,
            'is_watchlisted' => false,
            'next_run_at' => $this->processor->nextRunAt($frequency),
        ]);

        if ($user !== null) {
            $this->billing->consumeSearchCredit($user);
        } elseif ($chargeGuest !== null) {
            $chargeGuest();
        }

        $this->queueRun($search, $user !== null);
        $this->recordSearch($user, $search);
        $this->indexedKeywords->learnFromSearch($type, $phrase, $keywords);

        return $search;
    }

    /**
     * Find a user's historical search for the same normalized primary phrase.
     */
    public function findExisting(?User $user, ?string $guestToken, string $phrase): ?CustomKeywordSearch
    {
        $phrase = $this->normalizer->keyword($phrase);
        if ($phrase === '') {
            return null;
        }

        return $this->findExistingByPhrase(
            $user?->id,
            $guestToken,
            $phrase,
        );
    }

    /**
     * @param  array<int, string>  $keywords
     * @return array<int, string>
     */
    public function mergedKeywords(CustomKeywordSearch $search, array $keywords): array
    {
        return $this->normalizer->keywordSet(
            $search->phrase,
            array_merge((array) $search->keywords, $keywords),
        );
    }

    /**
     * Merge selected terms into an existing search and start one paid manual refresh.
     *
     * @param  array<int, string>  $keywords
     * @param  ?Closure():void  $chargeGuest
     */
    public function refreshWithKeywords(CustomKeywordSearch $search, ?User $user, array $keywords, ?Closure $chargeGuest = null): CustomKeywordSearch
    {
        if ($search->trashed()) {
            $search->restore();
        }

        $mergedKeywords = $this->mergedKeywords($search, $keywords);
        $signature = $this->normalizer->signature($mergedKeywords);

        if ($search->keywords !== $mergedKeywords || $search->keyword_signature !== $signature) {
            $search->update([
                'keywords' => $mergedKeywords,
                'keyword_signature' => $signature,
            ]);
        }

        // An already-active run means no new scrape starts, so nothing is
        // charged — the user is just brought back to the search in flight.
        if (! $search->hasActiveRun()) {
            if ($user !== null) {
                $this->billing->consumeSearchCredit($user);
            } elseif ($chargeGuest !== null) {
                $chargeGuest();
            }

            $this->queueRun($search, $user !== null);
            $this->recordSearch($user, $search);
        }

        return $search->refresh();
    }

    private function normalizeSourceHandle(mixed $value): ?string
    {
        $handle = trim((string) ($value ?? ''));
        $handle = ltrim($handle, '@');

        return $handle === '' ? null : $handle;
    }

    private function findExistingByPhrase(?int $userId, ?string $guestToken, string $phrase): ?CustomKeywordSearch
    {
        return CustomKeywordSearch::withTrashed()
            ->ownedBy($userId, $guestToken)
            ->whereRaw('LOWER(phrase) = ?', [mb_strtolower($phrase)])
            ->latest('updated_at')
            ->first();
    }

    private function normalizeSourceWebsite(mixed $value): ?string
    {
        $website = trim((string) ($value ?? ''));
        $website = preg_replace('#^https?://#i', '', $website) ?? $website;
        $website = rtrim($website, '/');

        return $website === '' ? null : $website;
    }

    public function queueRun(CustomKeywordSearch $search, bool $reservedCredit = false): CustomKeywordSearchRun
    {
        $run = $search->runs()->create([
            'status' => CustomKeywordSearchRun::STATUS_QUEUED,
            'raw_summary' => $reservedCredit ? ['credit_reserved' => true] : null,
        ]);

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

    public function updateSettings(
        CustomKeywordSearch $search,
        ?string $name,
        ?string $frequency,
        ?string $sourceTikTokHandle = null,
        ?string $sourceWebsite = null,
    ): CustomKeywordSearch {
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

        if ($sourceTikTokHandle !== null) {
            $changes['source_tiktok_handle'] = $this->normalizeSourceHandle($sourceTikTokHandle);
        }

        if ($sourceWebsite !== null) {
            $changes['source_website'] = $this->normalizeSourceWebsite($sourceWebsite);
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

    public function setBookmarked(CustomKeywordSearch $search, bool $bookmarked): CustomKeywordSearch
    {
        if ($bookmarked && ! $search->is_watchlisted && $search->user !== null) {
            $this->billing->ensureCanBookmarkSearch($search->user);
        }

        $search->update(['is_watchlisted' => $bookmarked]);
        if ($bookmarked && $search->user !== null) {
            $this->activity->record($search->user, 'engagement', 'search_bookmarked', 'Bookmarked a search.', ['search_id' => $search->id]);
        }

        if ($search->user !== null) {
            $this->billing->syncSubscriptionUsage($search->user);
        }

        return $search->refresh();
    }

    private function recordSearch(?User $user, CustomKeywordSearch $search): void
    {
        if ($user !== null) {
            $this->activity->record($user, 'engagement', 'search_triggered', sprintf('Triggered a %s search with keyword %s.', $search->search_type, $search->phrase), ['search_id' => $search->id, 'type' => $search->search_type, 'keyword' => $search->phrase]);
        }
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
