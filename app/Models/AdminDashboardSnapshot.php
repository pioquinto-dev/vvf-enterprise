<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdminDashboardSnapshot extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'snapshot_date' => 'date',
            'captured_at' => 'datetime',
            'paid_subscriptions' => 'integer',
            'trialing_subscriptions' => 'integer',
            'signups' => 'integer',
            'viral_videos' => 'integer',
            'custom_keyword_searches' => 'integer',
        ];
    }
}
