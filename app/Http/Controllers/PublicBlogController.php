<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\Category;
use App\Services\Blogs\BlogMediaService;
use App\Support\BlogContent;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PublicBlogController extends Controller
{
    public function __construct(private BlogMediaService $media) {}

    public function index(Request $request)
    {
        $filters = $request->validate(['search' => 'nullable|string|max:255', 'category' => 'nullable|string|max:255', 'page' => 'nullable|integer|min:1']);
        $search = trim($filters['search'] ?? '');
        $category = $filters['category'] ?? '';
        $query = Article::published()->with(['category', 'tags']);
        if ($category !== '') {
            $query->whereHas('category', fn ($q) => $q->where('slug', $category));
        }
        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->whereLike('title', "%$search%")
                    ->orWhereLike('excerpt', "%$search%")
                    ->orWhereRaw('LOWER(CAST(content_json AS TEXT)) LIKE ?', ['%'.mb_strtolower($search).'%'])
                    ->orWhereHas('category', fn ($q) => $q->whereLike('name', "%$search%"))
                    ->orWhereHas('tags', fn ($q) => $q->whereLike('name', "%$search%"));
            });
        }
        $query->orderByDesc('is_featured')->orderBy('featured_order')->orderByDesc('published_at')->orderByDesc('id');
        $featured = $search === '' && $category === '' ? (clone $query)->where('is_featured', true)->first() : null;
        if ($featured) {
            $query->whereKeyNot($featured->id);
        }
        $canonical = route('blog.index', array_filter(['category' => $category, 'search' => $search, 'page' => (int) $request->query('page', 1) > 1 ? $request->query('page') : null]));

        return Inertia::render('Blog/Index', [
            'search' => $search, 'selectedCategory' => $category,
            'categories' => Category::whereHas('articles', fn ($q) => $q->published())->withCount(['articles' => fn ($q) => $q->published()])->orderBy('name')->get(),
            'featuredArticle' => $featured ? $this->card($featured) : null,
            'articles' => $query->paginate(9)->withQueryString()->through(fn ($a) => $this->card($a)),
            'seo' => ['title' => 'Creator Intelligence | Brand Beacon Blog', 'description' => 'Research, strategies and practical ideas for your next breakout video.', 'canonical' => $canonical, 'noIndex' => $search !== '' || $category !== ''],
            'jsonLd' => ['@context' => 'https://schema.org', '@type' => 'Blog', 'name' => 'Brand Beacon Blog', 'url' => route('blog.index')],
        ])->toResponse($request)->header('Cache-Control', 'private, no-store');
    }

    public function show(Request $request, string $slug)
    {
        $article = Article::published()->with(['category', 'tags'])->where('slug', $slug)->firstOrFail();
        $document = BlogContent::normalize($article->content_json);
        $blocks = BlogContent::withAnchors($document['blocks']);
        $related = Article::published()->with(['category', 'tags'])->whereKeyNot($article->id)
            ->when($article->category_id, fn ($q) => $q->where('category_id', $article->category_id))
            ->orderByDesc('published_at')->orderByDesc('id')->limit(3)->get();
        $card = $this->card($article);
        $description = $article->excerpt ?: 'Creator research and practical insights from Brand Beacon.';

        return Inertia::render('Blog/Show', [
            'article' => [...$card, 'tags' => $article->tags->map->only(['name']), 'publishedLabel' => $article->published_at?->format('M j, Y H:i').' '.config('app.timezone')],
            'blocks' => $blocks,
            'tocItems' => collect($blocks)->filter(fn ($b) => isset($b['anchor']))->map(fn ($b) => ['id' => $b['anchor'], 'label' => $b['text'], 'level' => $b['level']])->values(),
            'relatedArticles' => $related->map(fn ($a) => $this->card($a)),
            'seo' => ['title' => $article->title.' | Brand Beacon Blog', 'description' => $description, 'canonical' => $card['url'], 'image' => $card['heroLarge'], 'type' => 'article', 'published' => $article->published_at?->toIso8601String(), 'modified' => $article->updated_at?->toIso8601String()],
            'jsonLd' => ['@context' => 'https://schema.org', '@type' => 'Article', 'headline' => $article->title, 'description' => $description, 'url' => $card['url'], 'mainEntityOfPage' => $card['url'], 'image' => $card['heroLarge'] ?: asset('brand-beacon-logo.svg'), 'datePublished' => $article->published_at?->toIso8601String(), 'dateModified' => $article->updated_at?->toIso8601String(), 'author' => ['@type' => 'Organization', 'name' => config('blog.author')], 'publisher' => ['@type' => 'Organization', 'name' => 'Brand Beacon', 'logo' => ['@type' => 'ImageObject', 'url' => asset('brand-beacon-logo.svg')]]],
        ])->toResponse($request)->header('Cache-Control', 'private, no-store');
    }

    private function card(Article $article): array
    {
        $document = BlogContent::normalize($article->content_json);

        return [
            'id' => $article->id, 'title' => $article->title, 'excerpt' => $article->excerpt,
            'url' => route('blog.show', $article->slug), 'publishedDate' => $article->published_at?->format('M j, Y'),
            'category' => $article->category?->only(['name', 'slug', 'color']), 'tags' => $article->tags->take(2)->map->only(['name']),
            'heroMedium' => $this->media->url($article->hero_image, 'medium'), 'heroLarge' => $this->media->url($article->hero_image),
            'readMinutes' => BlogContent::readingTime($document, $article->excerpt), 'blockCount' => count($document['blocks']), 'author' => config('blog.author'),
        ];
    }
}
