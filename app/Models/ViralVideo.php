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
     * The still to show for this video.
     *
     * `thumbnail_url` and `cover` are both TikTok CDN links, and both expire —
     * which is what `viral-videos:repair-tiktok-cdn-media` refreshes. Either can
     * be null on any given row, so anything rendering a still has to fall back
     * rather than read one column. Result cards and lifecycle emails go through
     * here so they cannot disagree about which one a row has.
     */
    public function previewImageUrl(): ?string
    {
        $url = $this->thumbnail_url ?: $this->cover;

        return is_string($url) && $url !== '' ? $url : null;
    }

    /**
     * The link to give someone who wants to watch this video.
     *
     * `video_url` is a signed CDN link to the mp4 itself. It is hundreds of
     * characters long, it expires within days, and pasted into an email it
     * reads as a wall of noise. `post_url` is the permalink, which is short and
     * does not expire, so anything sent outside the app links to that.
     *
     * Rows ingested before post_url was captured are rebuilt from the handle and
     * the video id, which is the same shape the mapper writes. When neither is
     * available this returns null, and the caller is expected to leave the link
     * out rather than fall back to the CDN URL.
     */
    public function permalinkUrl(): ?string
    {
        $postUrl = $this->post_url;

        if (is_string($postUrl) && $postUrl !== '') {
            return $postUrl;
        }

        $username = ltrim((string) $this->username, '@');
        $videoId = (string) $this->video_id;

        if ($username !== '' && $videoId !== '') {
            return "https://www.tiktok.com/@{$username}/video/{$videoId}";
        }

        return null;
    }

    /**
     * Shape used by the result cards. Kept here so the API and any future
     * export speak the same language.
     */
    public function toCardArray(): array
    {
        $platform = $this->playerPlatform();
        $videoId = $this->video_id;
        $embedUrl = $this->embed_url;
        $postUrl = $this->post_url;
        $videoUrl = $this->video_url;
        $thumbnailUrl = $this->previewImageUrl();
        $cover = $this->cover;
        $previewPlayable = $this->isDashboardPlayable($platform, $videoId, $embedUrl, $postUrl);

        return [
            'id' => $this->id,
            'video_id' => $videoId,
            'videoId' => $videoId,
            'title' => $this->title,
            'hashtags' => $this->hashtags ?? [],
            'handle' => $this->username ? '@'.ltrim($this->username, '@') : null,
            'username' => $this->username,
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
            'social_media_source' => $platform,
            'thumbnail_url' => $thumbnailUrl,
            'thumbnailUrl' => $thumbnailUrl,
            'cover' => $cover,
            'video_url' => $videoUrl,
            'videoUrl' => $videoUrl,
            'post_url' => $postUrl,
            'postUrl' => $postUrl,
            'embed_url' => $embedUrl,
            'embedUrl' => $embedUrl,
            'preview_playable' => $previewPlayable,
            'previewPlayable' => $previewPlayable,
            'player_kind' => $platform === 'tiktok' ? 'tiktok' : 'iframe',
            'player_url' => $this->playerUrl($platform, $videoId, $embedUrl),
            'song_id' => $this->song_id,
            'song_cover_url' => $this->song_cover_url,
            'uploaded_at' => $this->uploaded_at?->toIso8601String(),
            'virality_score' => (float) $this->virality_score,
        ];
    }

    private function playerPlatform(): ?string
    {
        if ($this->platform === 'tiktok') {
            return 'tiktok';
        }

        $haystacks = [
            (string) $this->embed_url,
            (string) $this->post_url,
            (string) $this->video_url,
        ];

        foreach ($haystacks as $value) {
            if (str_contains(mb_strtolower($value), 'tiktok.com')) {
                return 'tiktok';
            }
        }

        return $this->platform ?: null;
    }

    private function isDashboardPlayable(?string $platform, ?string $videoId, ?string $embedUrl, ?string $postUrl): bool
    {
        return $platform === 'tiktok'
            ? filled($embedUrl) || filled($videoId) || filled($postUrl)
            : filled($embedUrl) || filled($postUrl);
    }

    private function playerUrl(?string $platform, ?string $videoId, ?string $embedUrl): ?string
    {
        if ($platform === 'tiktok' && filled($videoId)) {
            return "https://www.tiktok.com/player/v1/{$videoId}?autoplay=0&controls=1&progress_bar=0&play_button=1&volume_control=1&fullscreen_button=0&timestamp=0&music_info=0&description=0&rel=0&native_context_menu=0&closed_caption=0&muted=0";
        }

        return $embedUrl ?: null;
    }
}
