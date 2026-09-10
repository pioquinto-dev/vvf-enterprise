<?php

namespace App\Jobs;

use App\Http\Controllers\FreeSearchFunnelController;
use App\Models\User;
use App\Services\Billing\BillingService;
use App\Services\CustomKeywordSearch\SavedSearchManager;
use App\Support\AppEventLogger;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\Middleware\WithoutOverlapping;
use Illuminate\Validation\ValidationException;

/**
 * Compatibility shim for queued funnel jobs created before the sign-in flow
 * moved back to synchronous search creation.
 */
class StartFreeSearchFromFunnel implements ShouldQueue
{
    use Queueable;

    public int $tries = 2;

    /** @var array<int, int> */
    public array $backoff = [30];

    /** @param array<string, mixed> $pending */
    public function __construct(
        public readonly int $userId,
        public readonly array $pending,
    ) {}

    /**
     * @return array<int, object>
     */
    public function middleware(): array
    {
        return [new WithoutOverlapping('free-search-funnel:'.$this->userId)];
    }

    public function handle(BillingService $billing, SavedSearchManager $searches): void
    {
        $user = User::find($this->userId);

        if ($user === null || ! FreeSearchFunnelController::canStartFor($user)) {
            return;
        }

        try {
            $billing->ensureCanCreateSearch($user);

            $search = $searches->create(
                user: $user,
                guestToken: null,
                type: (string) ($this->pending['type'] ?? 'brand'),
                phrase: (string) ($this->pending['phrase'] ?? ''),
                keywords: (array) ($this->pending['keywords'] ?? []),
                name: (string) ($this->pending['phrase'] ?? ''),
                frequency: (string) ($this->pending['frequency'] ?? 'weekly'),
                sources: isset($this->pending['sources']) && is_array($this->pending['sources'])
                    ? $this->pending['sources']
                    : null,
            );

            AppEventLogger::result('free_search_funnel.search_queued', [
                'user_id' => $user->id,
                'search_id' => $search->id,
            ]);
        } catch (ValidationException $exception) {
            AppEventLogger::result('free_search_funnel.search_skipped', [
                'user_id' => $user->id,
                'reason' => collect($exception->errors())->flatten()->first(),
            ]);
        }
    }
}
