<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GuestSearchGrant extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'claimed_at' => 'datetime',
            'last_search_at' => 'datetime',
        ];
    }

    public function claimedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'claimed_by_user_id');
    }

    /**
     * A grant that has been folded into an account is spent for good — the
     * visitor's allowance now lives on the user record.
     */
    public function isClaimed(): bool
    {
        return $this->claimed_by_user_id !== null;
    }
}
