<?php

namespace App\Http\Controllers\Admin;

use App\Http\Requests\Admin\SaveArticleRequest;
use App\Models\Article;
use App\Models\Category;
use App\Models\Tag;
use App\Services\Blogs\ArticleService;
use App\Services\Blogs\BlogMediaService;
use App\Support\BlogContent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class BlogController extends Controller
{
    public function __construct(private ArticleService $articles, private BlogMediaService $media) {}

    public function index(Request $request)
    {
        $filters = $request->validate([
            'search' => 'nullable|string|max:255', 'status' => 'nullable|in:draft,published',
            'category' => 'nullable|integer', 'tag' => 'nullable|integer',
            'featured' => 'nullable|in:featured,standard', 'per_page' => 'nullable|in:10,25,50', 'page' => 'nullable|integer|min:1',
        ]);
        $query = Article::with(['category', 'tags'])->latest('id');
        if ($search = trim($filters['search'] ?? '')) {
            $query->where(fn ($q) => $q->whereLike('title', "%$search%")->orWhereLike('slug', "%$search%")->orWhereLike('excerpt', "%$search%"));
        }
        if ($filters['status'] ?? null) {
            $query->where('status', $filters['status']);
        }
        if ($filters['category'] ?? null) {
            $query->where('category_id', $filters['category']);
        }
        if ($filters['tag'] ?? null) {
            $query->whereHas('tags', fn ($q) => $q->where('tags.id', $filters['tag']));
        }
        if ($filters['featured'] ?? null) {
            $query->where('is_featured', $filters['featured'] === 'featured');
        }

        return Inertia::render('Admin/Blogs/Articles', [
            'filters' => $filters, 'articles' => $query->paginate((int) ($filters['per_page'] ?? 10))->withQueryString(),
            'categories' => Category::orderBy('name')->get(), 'tags' => Tag::orderBy('name')->get(),
            'stats' => ['Published' => Article::published()->count(), 'Drafts' => Article::where('status', 'draft')->count(), 'Categories' => Category::count(), 'Featured' => Article::where('is_featured', true)->count()],
        ]);
    }

    public function create()
    {
        return $this->editor();
    }

    public function uploadImage(Request $request)
    {
        $request->validate(['image' => 'required|image|mimes:jpg,jpeg,png,webp,gif|max:5120']);
        $url = $this->media->storeEditorImage($request->file('image'));
        $this->audit($request, 'image.uploaded', ['url' => $url]);

        return response()->json(['url' => $url], 201);
    }

    public function edit(Article $article)
    {
        return $this->editor($article);
    }

    private function editor(?Article $article = null)
    {
        return Inertia::render('Admin/Blogs/Editor', [
            'article' => $article?->load('tags'),
            'publishedLocal' => $article?->published_at?->format('Y-m-d\TH:i'),
            'timezone' => config('app.timezone'),
            'heroUrl' => $this->media->url($article?->hero_image),
            'content' => BlogContent::normalize($article?->content_json),
            'categories' => Category::orderBy('name')->get(), 'tags' => Tag::orderBy('name')->get(),
        ]);
    }

    public function store(SaveArticleRequest $request)
    {
        return $this->persist($request, new Article);
    }

    public function update(SaveArticleRequest $request, Article $article)
    {
        return $this->persist($request, $article);
    }

    private function persist(SaveArticleRequest $request, Article $article)
    {
        $data = $request->validated();
        if ($request->hasFile('heroImageUpload')) {
            $data['hero_image'] = $this->media->store($request->file('heroImageUpload'));
        }
        $article = $this->articles->save($article, $data);
        $this->audit($request, 'article.saved', ['id' => $article->id, 'status' => $article->status]);

        return redirect()->route('admin.blogs.edit', $article)->with('status', $article->status === 'published' ? 'Article published.' : 'Draft saved.');
    }

    public function action(Request $request, Article $article, string $action)
    {
        abort_unless(in_array($action, ['publish', 'unpublish', 'duplicate', 'unfeature'], true), 404);
        if ($action === 'duplicate') {
            $copy = $this->articles->duplicate($article);
            $this->audit($request, 'article.duplicated', ['id' => $article->id, 'copy_id' => $copy->id]);

            return redirect()->route('admin.blogs.edit', $copy)->with('status', 'Article duplicated as a draft.');
        }
        if ($action === 'publish') {
            $article->update(['status' => 'published', 'published_at' => $article->published_at ?? now()]);
        }
        if ($action === 'unpublish') {
            $article->update(['status' => 'draft', 'published_at' => null]);
        }
        if ($action === 'unfeature') {
            $article->update(['is_featured' => false, 'featured_order' => null]);
        }
        $this->audit($request, 'article.'.$action, ['id' => $article->id]);

        return back()->with('status', 'Article updated.');
    }

    public function destroy(Request $request, Article $article)
    {
        $id = $article->id;
        $article->delete();
        $this->audit($request, 'article.deleted', ['id' => $id]);

        return back()->with('status', 'Article permanently deleted.');
    }

    public function bulk(Request $request)
    {
        $data = $request->validate(['action' => 'required|in:publish,draft,feature,delete', 'ids' => 'required|array|min:1|max:50', 'ids.*' => 'required|integer|distinct|exists:articles,id']);
        DB::transaction(function () use ($data) {
            $articles = Article::whereIn('id', $data['ids'])->orderBy('id')->lockForUpdate()->get();
            $order = (int) Article::where('is_featured', true)->max('featured_order');
            foreach ($articles as $article) {
                match ($data['action']) {
                    'publish' => $article->update(['status' => 'published', 'published_at' => now()]),
                    'draft' => $article->update(['status' => 'draft', 'published_at' => null]),
                    'feature' => $article->update(['is_featured' => true, 'featured_order' => $article->featured_order ?? ++$order]),
                    'delete' => $article->delete(),
                };
            }
        });
        $this->audit($request, 'article.bulk', $data);

        return back()->with('status', 'Selected articles updated.');
    }

    public function featured()
    {
        $articles = Article::published()->where('is_featured', true)->with('category')->orderBy('featured_order')->orderBy('id')->get();

        return Inertia::render('Admin/Blogs/Featured', ['articles' => $articles->map(fn ($a) => [...$a->toArray(), 'heroUrl' => $this->media->url($a->hero_image, 'medium')])]);
    }

    public function reorder(Request $request)
    {
        $data = $request->validate(['ordered_ids' => 'present|array|max:10000', 'ordered_ids.*' => 'integer|distinct']);
        DB::transaction(function () use ($data) {
            $current = Article::published()->where('is_featured', true)->orderBy('id')->lockForUpdate()->pluck('id')->all();
            $submitted = array_map('intval', $data['ordered_ids']);
            sort($current);
            $sorted = $submitted;
            sort($sorted);
            if ($current !== $sorted) {
                throw ValidationException::withMessages(['ordered_ids' => 'Featured articles changed. Reload this page before saving.']);
            }
            foreach ($submitted as $position => $id) {
                Article::whereKey($id)->update(['featured_order' => $position + 1]);
            }
        });
        $this->audit($request, 'article.reordered', $data);

        return back()->with('status', 'Featured order saved.');
    }

    public function taxonomy(string $kind)
    {
        $model = $this->taxonomyModel($kind);

        return Inertia::render('Admin/Blogs/Taxonomy', ['kind' => $kind, 'items' => $model::withCount('articles')->orderBy('name')->get()]);
    }

    public function saveTaxonomy(Request $request, string $kind, ?int $id = null)
    {
        $model = $this->taxonomyModel($kind);
        $item = $id ? $model::findOrFail($id) : new $model;
        if (is_string($request->input('slug'))) {
            $request->merge(['slug' => Str::slug($request->input('slug'))]);
        }
        $rules = ['name' => 'required|string|max:255', 'slug' => ['required', 'string', 'max:255', 'alpha_dash', Rule::unique($kind, 'slug')->ignore($item)]];
        if ($kind === 'categories') {
            $rules['color'] = ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'];
        }
        $item->fill($request->validate($rules))->save();
        $this->audit($request, $kind.'.saved', ['id' => $item->id]);

        return back()->with('status', 'Saved successfully.');
    }

    public function deleteTaxonomy(Request $request, string $kind, int $id)
    {
        $model = $this->taxonomyModel($kind);
        $model::findOrFail($id)->delete();
        $this->audit($request, $kind.'.deleted', ['id' => $id]);

        return back()->with('status', 'Deleted. Articles have been retained.');
    }

    private function taxonomyModel(string $kind): string
    {
        return match ($kind) {
            'categories' => Category::class, 'tags' => Tag::class, default => abort(404)
        };
    }

    private function audit(Request $request, string $action, array $context): void
    {
        // This host has no admin audit ledger; use its application logging facility.
        Log::info('Admin blog mutation', ['action' => $action, 'actor' => $request->session()->get('admin.user.email'), ...$context]);
    }
}
