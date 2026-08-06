<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApifyTrigger extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'input' => 'array',
            'search_keywords' => 'array',
            'filter_summary' => 'array',
            'started_at' => 'datetime',
            'finished_at' => 'datetime',
            'compute_units' => 'decimal:6',
            'usage_total_usd' => 'decimal:4',
        ];
    }

    public function requestedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by_user_id');
    }
}
