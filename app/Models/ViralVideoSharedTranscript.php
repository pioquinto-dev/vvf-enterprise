<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

class ViralVideoSharedTranscript extends Model
{
    use HasUlids;

    protected $fillable = [
        'video_id',
        'post_url',
        'normalized_post_url',
        'transcript',
        'transcript_segments',
        'analysis_result',
        'fetched_at',
    ];

    protected function casts(): array
    {
        return [
            'transcript_segments' => 'array',
            'analysis_result' => 'array',
            'fetched_at' => 'datetime',
        ];
    }
}
