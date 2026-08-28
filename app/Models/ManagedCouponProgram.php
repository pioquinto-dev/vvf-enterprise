<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ManagedCouponProgram extends Model
{
    use SoftDeletes;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'max_redemptions' => 'integer',
            'whitelist_only' => 'boolean',
            'trial_only' => 'boolean',
            'collect_payment_method' => 'boolean',
            'block_trial_used' => 'boolean',
            'block_reverted_free' => 'boolean',
            'is_active' => 'boolean',
            'metadata' => 'array',
        ];
    }

    public function whitelistEntries(): HasMany
    {
        return $this->hasMany(ManagedCouponWhitelistEntry::class);
    }

    public function redemptions(): HasMany
    {
        return $this->hasMany(ManagedCouponRedemption::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true)->whereNull('deleted_at');
    }

    public function redeemedCount(): int
    {
        return $this->redemptions()->whereNotNull('redeemed_at')->count();
    }

    public function remainingSlots(): ?int
    {
        if ($this->max_redemptions === null) {
            return null;
        }

        return max(0, $this->max_redemptions - $this->redeemedCount());
    }
}
