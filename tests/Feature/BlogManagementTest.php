<?php

namespace Tests\Feature;

use App\Models\Article;
use App\Models\Category;
use App\Models\Tag;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class BlogManagementTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): static
    {
        return $this->withSession([config('admin.session_key') => true, 'admin.user' => ['email' => 'editor@example.com']]);
    }

    private function payload(array $overrides = []): array
    {
        return array_replace([
            'title' => 'Breakout ideas', 'slug' => 'breakout-ideas', 'excerpt' => 'Research notes.',
            'status' => 'draft', 'published_at' => null, 'is_featured' => false,
            'category_id' => null, 'tag_ids' => [], 'layout' => 'standard',
            'blocks' => [['type' => 'paragraph', 'text' => 'Creator research']],
        ], $overrides);
    }

    private function article(array $overrides = []): Article
    {
        return Article::create(array_replace(['title' => 'Research', 'slug' => 'research', 'status' => 'published', 'published_at' => now(), 'content_json' => ['blocks' => [['type' => 'paragraph', 'text' => 'Ideas']]]], $overrides));
    }

    public function test_guest_cannot_read_admin_pages_or_mutate_blog_data(): void
    {
        $article = $this->article();
        foreach (['', '/create', '/categories', '/tags', '/featured', '/'.$article->id.'/edit'] as $path) {
            $this->get('/x/admin/blogs'.$path)->assertRedirect(route('admin.login'));
        }
        $this->post('/x/admin/blogs', $this->payload())->assertRedirect(route('admin.login'));
        $this->put('/x/admin/blogs/'.$article->id, $this->payload())->assertRedirect(route('admin.login'));
        $this->delete('/x/admin/blogs/'.$article->id)->assertRedirect(route('admin.login'));
        $this->post('/x/admin/blogs/bulk', ['action' => 'delete', 'ids' => [$article->id]])->assertRedirect(route('admin.login'));
        $this->post('/x/admin/blogs/categories', ['name' => 'X', 'slug' => 'x'])->assertRedirect(route('admin.login'));
        $this->assertDatabaseHas('articles', ['id' => $article->id]);
    }

    public function test_save_tag_sync_publication_duplicate_and_taxonomy_deletion(): void
    {
        $category = Category::create(['name' => 'Strategy', 'slug' => 'strategy']);
        $tag = Tag::create(['name' => 'Video', 'slug' => 'video']);
        $this->admin()->post('/x/admin/blogs', $this->payload(['slug' => 'Breakout Ideas', 'category_id' => $category->id, 'tag_ids' => [$tag->id], 'is_featured' => true, 'published_at' => now()->toDateTimeString()]))->assertSessionHasNoErrors();
        $article = Article::firstOrFail();
        $this->assertSame('breakout-ideas', $article->slug);
        $this->assertNull($article->published_at);
        $this->assertSame([$tag->id], $article->tags->modelKeys());
        $this->admin()->post('/x/admin/blogs/'.$article->id.'/publish')->assertRedirect();
        $this->assertSame('published', $article->fresh()->status);
        $this->admin()->post('/x/admin/blogs/'.$article->id.'/duplicate')->assertRedirect();
        $copy = Article::latest('id')->first();
        $this->assertSame('draft', $copy->status);
        $this->assertFalse($copy->is_featured);
        $this->assertNull($copy->published_at);
        $this->assertSame([$tag->id], $copy->tags->modelKeys());
        $this->admin()->put('/x/admin/blogs/'.$article->id, $this->payload(['tag_ids' => []]))->assertSessionHasNoErrors();
        $this->assertCount(0, $article->fresh()->tags);
        $this->admin()->delete('/x/admin/blogs/categories/'.$category->id)->assertRedirect();
        $this->assertNull($copy->fresh()->category_id);
        $this->admin()->delete('/x/admin/blogs/tags/'.$tag->id)->assertRedirect();
        $this->assertCount(0, $copy->fresh()->tags);
    }

    public function test_invalid_metadata_urls_blocks_and_bulk_actions_are_rejected(): void
    {
        $this->article(['slug' => 'breakout-ideas']);
        $this->admin()->post('/x/admin/blogs', $this->payload(['slug' => 'Breakout Ideas']))->assertSessionHasErrors('slug');
        $this->admin()->post('/x/admin/blogs', $this->payload(['slug' => 'new', 'category_id' => 999]))->assertSessionHasErrors('category_id');
        foreach ([['type' => 'unknown'], ['type' => 'paragraph', 'text' => ['bad']], ['type' => 'link', 'label' => 'Bad', 'url' => 'javascript:alert(1)'], ['type' => 'embed', 'url' => 'https://evil.example/embed'], ['type' => 'list', 'items' => 'bad']] as $block) {
            $this->admin()->post('/x/admin/blogs', $this->payload(['slug' => 'new', 'blocks' => [$block]]))->assertSessionHasErrors();
        }
        $this->admin()->post('/x/admin/blogs/bulk', ['action' => 'oops', 'ids' => [1]])->assertSessionHasErrors('action');
        $this->assertDatabaseCount('articles', 1);
    }

    public function test_all_block_types_round_trip_and_render_with_unique_anchors(): void
    {
        $blocks = [
            ['type' => 'paragraph', 'text' => '<script>alert(1)</script>'],
            ['type' => 'heading', 'level' => 2, 'text' => 'Intro'],
            ['type' => 'heading', 'level' => 3, 'text' => 'Intro'],
            ['type' => 'heading', 'level' => 2, 'text' => 'Intro 2'],
            ['type' => 'list', 'style' => 'ordered', 'items' => ['One', 'Two']],
            ['type' => 'quote', 'text' => 'Quote', 'attribution' => 'Team'],
            ['type' => 'callout', 'tone' => 'tip', 'title' => 'Tip', 'text' => 'Try it'],
            ['type' => 'link', 'label' => 'Read', 'url' => 'https://example.com'],
            ['type' => 'image', 'src' => 'https://example.com/image.jpg', 'alt' => 'Image'],
            ['type' => 'embed', 'url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
            ['type' => 'cta', 'title' => 'Next', 'button_label' => 'Go', 'button_url' => '/dashboard'],
            ['type' => 'divider'],
        ];
        $this->admin()->post('/x/admin/blogs', $this->payload(['status' => 'published', 'blocks' => $blocks]))->assertSessionHasNoErrors();
        $this->get('/blog/breakout-ideas')->assertOk()->assertHeader('Cache-Control', 'no-store, private')->assertInertia(fn (Assert $page) => $page->component('Blog/Show')->has('blocks', 12)->where('tocItems.0.id', 'intro')->where('tocItems.1.id', 'intro-2')->where('tocItems.2.id', 'intro-2-2')->where('blocks.9.url', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'));
    }

    public function test_public_queries_exclude_drafts_and_highlight_and_combine_filters(): void
    {
        $category = Category::create(['name' => 'Strategy', 'slug' => 'strategy']);
        $hero = $this->article(['category_id' => $category->id, 'is_featured' => true, 'featured_order' => 1, 'published_at' => now()->addMonth()]);
        $this->article(['slug' => 'draft', 'status' => 'draft']);
        $this->article(['slug' => 'standard', 'title' => 'Other']);
        $this->get('/blog')->assertOk()->assertInertia(fn (Assert $page) => $page->component('Blog/Index')->where('featuredArticle.id', $hero->id)->where('articles.total', 1));
        $this->get('/blog?search=research&category=strategy')->assertOk()->assertInertia(fn (Assert $page) => $page->where('featuredArticle', null)->where('articles.total', 1)->where('seo.noIndex', true));
        $this->get('/blog?category=missing')->assertOk()->assertInertia(fn (Assert $page) => $page->where('articles.total', 0));
        $this->get('/blog/draft')->assertNotFound();
        $this->get('/blog/missing')->assertNotFound();
        $this->get('/sitemap.xml')->assertSee('/blog/research')->assertDontSee('/blog/draft');
        $this->admin()->post('/x/admin/blogs/'.$hero->id.'/unpublish')->assertRedirect();
        $this->get('/blog/research')->assertNotFound();
    }

    public function test_featured_order_requires_complete_current_set_and_bulk_updates_are_validated(): void
    {
        $first = $this->article(['is_featured' => true, 'featured_order' => 1]);
        $second = $this->article(['slug' => 'second', 'is_featured' => true, 'featured_order' => 2]);
        $this->admin()->put('/x/admin/blogs/featured', ['ordered_ids' => [$first->id]])->assertSessionHasErrors('ordered_ids');
        $this->admin()->put('/x/admin/blogs/featured', ['ordered_ids' => [$second->id, $first->id]])->assertSessionHasNoErrors();
        $this->assertSame(1, $second->fresh()->featured_order);
        $this->admin()->post('/x/admin/blogs/'.$second->id.'/unfeature')->assertRedirect();
        $this->admin()->get('/x/admin/blogs/featured')->assertInertia(fn (Assert $p) => $p->has('articles', 1)->where('articles.0.id', $first->id));
        $this->admin()->post('/x/admin/blogs/bulk', ['action' => 'draft', 'ids' => [$first->id, $second->id]])->assertSessionHasNoErrors();
        $this->assertSame(0, Article::published()->count());
        $this->assertNull($first->fresh()->published_at);
    }

    public function test_hero_replacement_does_not_delete_media_shared_with_duplicate(): void
    {
        Storage::fake('public');
        config(['blog.disk' => 'public']);
        $file = fn () => UploadedFile::fake()->createWithContent('hero.png', base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl6koAAAAAASUVORK5CYII='));
        $this->admin()->post('/x/admin/blogs', $this->payload(['heroImageUpload' => $file()]))->assertSessionHasNoErrors();
        $article = Article::first();
        $old = $article->hero_image['original'];
        $this->admin()->post('/x/admin/blogs/'.$article->id.'/duplicate');
        $copy = Article::latest('id')->first();
        $this->admin()->post('/x/admin/blogs/'.$article->id, $this->payload(['_method' => 'put', 'heroImageUpload' => $file()]))->assertSessionHasNoErrors();
        $this->assertSame($old, $copy->hero_image['original']);
        $this->assertNotSame($old, $article->fresh()->hero_image['original']);
        Storage::disk('public')->assertExists($old);
    }

    public function test_admin_pages_and_filters_use_blog_components(): void
    {
        $article = $this->article();
        foreach (['' => 'Articles', '/create' => 'Editor', '/'.$article->id.'/edit' => 'Editor', '/categories' => 'Taxonomy', '/tags' => 'Taxonomy', '/featured' => 'Featured'] as $path => $page) {
            $this->admin()->get('/x/admin/blogs'.$path)->assertOk()->assertInertia(fn (Assert $p) => $p->component('Admin/Blogs/'.$page));
        }
        $this->admin()->get('/x/admin/blogs?status=draft&per_page=25')->assertInertia(fn (Assert $p) => $p->where('articles.total', 0)->where('articles.per_page', 25)->where('stats.Published', 1));
    }
}
