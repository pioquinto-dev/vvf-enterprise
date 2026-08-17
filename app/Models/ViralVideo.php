<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ViralVideo extends Model
{
    use HasUlids, SoftDeletes;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'hashtags' => 'array',
            'raw_payload' => 'array',
            'uploaded_at' => 'datetime',
            'archived_at' => 'datetime',
            'analyzed_at' => 'datetime',
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

    /**
     * Archived videos stay fully queryable for admins but must never reach a
     * customer-facing surface. Every public read path applies this scope.
     */
    public function scopeVisible(Builder $query): Builder
    {
        return $query->whereNull('archived_at');
    }

    public function apifyTrigger(): BelongsTo
    {
        return $this->belongsTo(ApifyTrigger::class);
    }

    public function preparations(): HasMany
    {
        return $this->hasMany(VideoPreparation::class);
    }

    public function analyses(): HasMany
    {
        return $this->hasMany(VideoAnalysis::class);
    }

    /**
     * Interactions over views, as a percentage. Returns null rather than 0 when
     * there are no views, so the UI can show a dash instead of a fake "0%".
     */
    public function engagementRate(): ?float
    {
        if ($this->views <= 0) {
            return null;
        }

        $interactions = $this->likes + $this->comments + $this->shares + $this->bookmarks;

        return round(($interactions / $this->views) * 100, 2);
    }

    /**
     * One display string for the sounds panel. Sounds are grouped on this, so
     * the same track credited slightly differently still collapses to one row.
     */
    public function soundLabel(): ?string
    {
        $song = trim((string) $this->song);
        $artist = trim((string) $this->artist);

        if ($song === '') {
            return $artist !== '' ? $artist : null;
        }

        return $artist !== '' ? "{$song} · {$artist}" : $song;
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
            'shares' => $this->shares,
            'saves' => $this->bookmarks,
            'engagement_rate' => $this->engagementRate(),
            'song' => $this->song,
            'artist' => $this->artist,
            'sound_label' => $this->soundLabel(),
            'content_format' => $this->content_format,
            'content_hook' => $this->content_hook,
            'content_angle' => $this->content_angle,
            'duration' => $this->duration,
            'thumbnail_url' => $this->thumbnail_url ?: $this->cover,
            'video_url' => $this->video_url,
            'post_url' => $this->post_url,
            'embed_url' => $this->embed_url,
            'song_id' => $this->song_id,
            'song_cover_url' => $this->song_cover_url,
            'uploaded_at' => $this->uploaded_at?->toIso8601String(),
            'virality_score' => (float) $this->virality_score,
        ];
    }
}
