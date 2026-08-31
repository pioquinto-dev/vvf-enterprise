<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PricingPlan extends Model
{
    use SoftDeletes;

    protected $table = 'plans';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'slug',
        'name',
        'stripe_product_id',
        'stripe_price_id',
        'price_cents',
        'currency',
        'interval',
        'interval_count',
        'is_active',
        'features',
        'metadata',
        'plan_type',
        'description',
        'amount',
        'annual_amount',
        'saved_amount',
        'unit_amount',
        'duration',
        'plan_environment',
        'archived_at',
    ];

    protected function casts(): array
    {
        return [
            'features' => 'array',
            'metadata' => 'array',
            'archived_at' => 'datetime',
            'is_active' => 'boolean',
            'price_cents' => 'integer',
            'interval_count' => 'integer',
            'amount' => 'decimal:2',
            'annual_amount' => 'decimal:2',
            'saved_amount' => 'decimal:2',
            'unit_amount' => 'integer',
        ];
    }

    /**
     * Archived plans stay attached to existing subscriptions but must not be
     * offered to new customers, so pricing surfaces read through this scope.
     */
    public function scopePurchasable(Builder $query): Builder
    {
        return $query->where('is_active', true)->whereNull('archived_at');
    }
}
