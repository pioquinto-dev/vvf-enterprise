<?php

namespace App\Services\Blogs;

use App\Models\Article;
use App\Support\BlogContent;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ArticleService
{
    public function save(Article $article, array $data): Article
    {
        return DB::transaction(function () use ($article, $data) {
            $tags = $data['tag_ids'];
            $data['content_json'] = BlogContent::normalize(['layout' => $data['layout'], 'blocks' => $data['blocks']]);
            unset($data['tag_ids'], $data['layout'], $data['blocks'], $data['heroImageUpload']);
            $data['published_at'] = $data['status'] === 'published' ? ($data['published_at'] ?? now()) : null;
            $article->fill($data);
            $article->featured_order = $article->is_featured ? ($article->featured_order ?? Article::where('is_featured', true)->max('featured_order') + 1) : null;
            $article->save();
            $article->tags()->sync($tags);

            return $article->fresh(['category', 'tags']);
        });
    }

    public function duplicate(Article $article): Article
    {
        return DB::transaction(function () use ($article) {
            $copy = $article->replicate();
            $copy->title = Str::limit($article->title, 248, '').' (Copy)';
            $copy->slug = Str::limit(Str::slug($article->title), 220, '').'-copy-'.Str::lower(Str::random(16));
            $copy->status = 'draft';
            $copy->is_featured = false;
            $copy->published_at = null;
            $copy->featured_order = null;
            $copy->save();
            $copy->tags()->sync($article->tags()->pluck('tags.id'));

            return $copy;
        });
    }
}
