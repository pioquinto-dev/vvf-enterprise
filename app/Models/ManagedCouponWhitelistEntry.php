<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ManagedCouponWhitelistEntry extends Model
{
    protected $guarded = [];

    public function program(): BelongsTo
    {
        return $this->belongsTo(ManagedCouponProgram::class, 'managed_coupon_program_id');
    }

    public static function normalizeEmail(?string $email): string
    {
        return strtolower(trim((string) $email));
    }
}
