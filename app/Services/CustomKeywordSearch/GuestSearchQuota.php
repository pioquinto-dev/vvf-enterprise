<?php

namespace App\Services\CustomKeywordSearch;

use App\Models\GuestSearchGrant;
use App\Models\User;
use App\Support\GuestIdentity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * The free search a signed-out visitor gets, enforced server-side.
 *
 * Previously nothing checked this at all: the controller only consulted
 * billing when a user was present, so a guest could start unlimited Apify
 * scrapes, and the login/logout cycle laundered each one into the account for
 * free. The allowance now lives in a row keyed on a request fingerprint that
 * survives logout, and it is marked spent the moment it is claimed.
 */
class GuestSearchQuota
{
    public function limit(): int
    {
        return max(0, (int) config('custom_keyword_search.limits.max_saved_guest', 1));
    }

    public function remaining(Request $request): int
    {
        $grant = $this->grant($request);

        if ($grant === null) {
            return $this->limit();
        }

        // Once folded into an account the allowance is gone for good, whatever
        // the counter says — this is what closes the logout-and-search-again loop.
        if ($grant->isClaimed()) {
            return 0;
        }

        return max(0, $this->limit() - (int) $grant->searches_used);
    }

    public function ensureCanCreateSearch(Request $request): void
    {
        if ($this->remaining($request) > 0) {
            return;
        }

        throw ValidationException::withMessages([
            'billing' => 'You have already used your free search. Create an account to keep searching.',
        ]);
    }

    /**
     * Spend one. Called after the search record exists so a validation failure
     * never burns the allowance.
     */
    public function consume(Request $request): void
    {
        $grant = $this->grantForWriting($request);

        $grant->forceFill([
            'searches_used' => (int) $grant->searches_used + 1,
            'last_search_at' => now(),
        ])->save();
    }

    /**
     * Bind the visitor's allowance to the account they just signed into, so it
     * cannot be spent a second time from the same browser.
     */
    public function claimFor(Request $request, User $user): void
    {
        $grant = $this->grant($request);

        if ($grant === null || $grant->isClaimed()) {
            return;
        }

        $grant->forceFill([
            'claimed_by_user_id' => $user->getKey(),
            'claimed_at' => now(),
        ])->save();
    }

    public function grant(Request $request): ?GuestSearchGrant
    {
        return GuestSearchGrant::query()
            ->where('fingerprint', GuestIdentity::fingerprint($request))
            ->first();
    }

    private function grantForWriting(Request $request): GuestSearchGrant
    {
        $fingerprint = GuestIdentity::fingerprint($request);

        // Two tabs firing at once must not both see zero used. The unique index
        // on fingerprint makes the race a duplicate-key error rather than a
        // second free search, so retry the read when that happens.
        try {
            return DB::transaction(fn (): GuestSearchGrant => GuestSearchGrant::query()
                ->lockForUpdate()
                ->firstOrCreate(['fingerprint' => $fingerprint], ['searches_used' => 0]));
        } catch (\Illuminate\Database\UniqueConstraintViolationException) {
            return GuestSearchGrant::query()->where('fingerprint', $fingerprint)->firstOrFail();
        }
    }
}
