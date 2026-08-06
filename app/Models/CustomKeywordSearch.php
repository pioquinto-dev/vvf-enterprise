<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class CustomKeywordSearch extends Model
{
    use SoftDeletes;

    public const STATUS_SCRAPING = 'scraping';
    public const STATUS_DONE = 'done';
    public const STATUS_PAUSED = 'paused';
    public const STATUS_FAILED = 'failed';

    public const FREQUENCY_WEEKLY = 'weekly';
    public const FREQUENCY_MONTHLY = 'monthly';
    public const TYPE_BRAND = 'brand';
    public const TYPE_COMPETITOR = 'competitor';
    public const TYPE_PRODUCT = 'product';

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'keywords' => 'array',
            'last_run_at' => 'datetime',
            'next_run_at' => 'datetime',
            'is_watchlisted' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function runs(): HasMany
    {
        return $this->hasMany(CustomKeywordSearchRun::class);
    }

    public function latestRun(): HasOne
    {
        return $this->hasOne(CustomKeywordSearchRun::class)->latestOfMany();
    }

    public function videos(): HasMany
    {
        return $this->hasMany(CustomKeywordSearchVideo::class);
    }

    /** Supporting keywords are everything except the phrase itself. */
    public function supportingKeywords(): array
    {
        return array_values(array_filter(
            $this->keywords ?? [],
            fn (string $keyword): bool => mb_strtolower($keyword) !== mb_strtolower($this->phrase)
        ));
    }

    public function hasActiveRun(): bool
    {
        return $this->runs()
            ->whereIn('status', [CustomKeywordSearchRun::STATUS_QUEUED, CustomKeywordSearchRun::STATUS_RUNNING])
            ->exists();
    }

    public static function allowedTypes(): array
    {
        return [
            self::TYPE_BRAND,
            self::TYPE_COMPETITOR,
            self::TYPE_PRODUCT,
        ];
    }

    /** Scope to whoever is asking — a signed-in user or a guest session token. */
    public function scopeOwnedBy(Builder $query, ?int $userId, ?string $guestToken): Builder
    {
        return $query->where(function (Builder $inner) use ($userId, $guestToken): void {
            if ($userId !== null) {
                $inner->orWhere('user_id', $userId);
            }

            if ($guestToken !== null) {
                $inner->orWhere(function (Builder $guest) use ($guestToken): void {
                    $guest->whereNull('user_id')->where('guest_token', $guestToken);
                });
            }

            if ($userId === null && $guestToken === null) {
                $inner->whereRaw('1 = 0');
            }
        });
    }

    public function url(): string
    {
        return '/saved-searches/'.$this->id;
    }
}
