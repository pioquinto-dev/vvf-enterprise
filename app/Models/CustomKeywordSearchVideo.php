<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomKeywordSearchVideo extends Model
{
    public const SOURCE_EXTERNAL_SCRAPE = 'external_scrape';
    public const SOURCE_LOCAL_MATCH = 'local_match';

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'viral_score' => 'float',
            'rank' => 'integer',
            'is_new_breakout' => 'boolean',
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

    public function video(): BelongsTo
    {
        return $this->belongsTo(ViralVideo::class, 'viral_video_id');
    }
}
