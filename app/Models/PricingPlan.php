<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PricingPlan extends Model
{
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
    ];

    protected function casts(): array
    {
        return [
            'features' => 'array',
            'metadata' => 'array',
            'is_active' => 'boolean',
            'price_cents' => 'integer',
            'interval_count' => 'integer',
            'amount' => 'decimal:2',
            'annual_amount' => 'decimal:2',
            'saved_amount' => 'decimal:2',
            'unit_amount' => 'integer',
        ];
    }
}
