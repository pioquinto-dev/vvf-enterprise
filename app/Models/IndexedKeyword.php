<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class IndexedKeyword extends Model
{
    use SoftDeletes;

    public const TYPE_BRAND = 'brand';
    public const TYPE_PRODUCT = 'product';

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'last_seen_at' => 'datetime',
            'archived_at' => 'datetime',
        ];
    }

    public static function allowedTypes(): array
    {
        return [self::TYPE_BRAND, self::TYPE_PRODUCT];
    }

    public function scopeLive(Builder $query): Builder
    {
        return $query
            ->whereNull('deleted_at')
            ->whereNull('archived_at');
    }
}
