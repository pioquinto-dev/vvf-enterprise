<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomKeywordSearchSnapshot extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'captured_at' => 'datetime',
            'is_reconstructed' => 'boolean',
            'video_count' => 'integer',
            'total_views' => 'integer',
            'total_engagement' => 'integer',
            'avg_engagement_rate' => 'float',
            'median_views' => 'integer',
            'outlier_count' => 'integer',
            'top_multiple' => 'float',
            'hashtag_counts' => 'array',
            'sound_counts' => 'array',
        ];
    }

    public function search(): BelongsTo
    {
        return $this->belongsTo(CustomKeywordSearch::class, 'custom_keyword_search_id');
    }

    public function run(): BelongsTo
    {
        return $this->belongsTo(CustomKeywordSearchRun::class, 'custom_keyword_search_run_id');
    }
}
