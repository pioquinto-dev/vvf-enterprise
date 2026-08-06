<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ViralVideo extends Model
{
    use HasUlids;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'hashtags' => 'array',
            'raw_payload' => 'array',
            'uploaded_at' => 'datetime',
            'followers' => 'integer',
            'views' => 'integer',
            'likes' => 'integer',
            'comments' => 'integer',
            'shares' => 'integer',
            'bookmarks' => 'integer',
            'virality_score' => 'float',
            'duration' => 'float',
        ];
    }

    public function apifyTrigger(): BelongsTo
    {
        return $this->belongsTo(ApifyTrigger::class);
    }

    /**
     * Shape used by the result cards. Kept here so the API and any future
     * export speak the same language.
     */
    public function toCardArray(): array
    {
        return [
            'id' => $this->id,
            'video_id' => $this->video_id,
            'title' => $this->title,
            'hashtags' => $this->hashtags ?? [],
            'handle' => $this->username ? '@'.ltrim($this->username, '@') : null,
            'creator_name' => $this->name,
            'avatar' => $this->avatar,
            'followers' => $this->followers,
            'views' => $this->views,
            'likes' => $this->likes,
            'comments' => $this->comments,
            'duration' => $this->duration,
            'thumbnail_url' => $this->thumbnail_url ?: $this->cover,
            'video_url' => $this->video_url,
            'post_url' => $this->post_url,
            'embed_url' => $this->embed_url,
            'uploaded_at' => $this->uploaded_at?->toIso8601String(),
            'virality_score' => (float) $this->virality_score,
        ];
    }
}
