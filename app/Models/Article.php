<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Article extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['content_json' => 'array', 'hero_image' => 'array', 'is_featured' => 'boolean', 'published_at' => 'datetime'];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class)->orderBy('name');
    }

    public function scopePublished(Builder $query): Builder
    {
        // Publication dates are metadata, not a scheduled release mechanism.
        return $query->where('status', 'published');
    }
}
