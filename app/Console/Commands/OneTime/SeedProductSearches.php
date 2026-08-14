<?php

namespace App\Console\Commands\OneTime;

use App\Models\CustomKeywordSearch;
use App\Models\CustomKeywordSearchVideo;
use App\Models\User;
use App\Models\ViralVideo;
use Illuminate\Console\Command;

/**
 * Dev-only: seed a handful of product searches (with attached videos) for one
 * user so the Product searches screen has something to render. Re-runnable —
 * it force-deletes any previously seeded product searches of the same names
 * first, so it never piles up duplicates.
 *
 *   php artisan dev:seed-product-searches --email=free1@example.com
 */
class SeedProductSearches extends Command
{
    protected $signature = 'dev:seed-product-searches {--email=free1@example.com : User to seed for}';

    protected $description = 'Seed dummy product searches (with videos) for a user so the UI has data';

    /** @var array<int, array{name:string, keywords:array<int,string>, status:string, frequency:string, videos:int}> */
    private array $seed = [
        ['name' => 'lip oil', 'keywords' => ['review', 'how to use', 'before after', 'dupe', 'results', 'viral'], 'status' => 'done', 'frequency' => 'weekly', 'videos' => 14],
        ['name' => 'neck cream', 'keywords' => ['neck cream review', 'anti aging', 'tech neck', 'before after', 'results'], 'status' => 'done', 'frequency' => 'monthly', 'videos' => 11],
        ['name' => 'brow gel', 'keywords' => ['brow gel', 'laminated brows', 'soap brows', 'tutorial', 'dupe'], 'status' => 'scraping', 'frequency' => 'weekly', 'videos' => 9],
        ['name' => 'hair oil', 'keywords' => ['hair oil', 'scalp care', 'hair growth', 'before after', 'routine'], 'status' => 'done', 'frequency' => 'weekly', 'videos' => 13],
        ['name' => 'lash serum', 'keywords' => ['lash serum', 'before after', 'results', 'review', 'viral'], 'status' => 'paused', 'frequency' => 'monthly', 'videos' => 6],
    ];

    public function handle(): int
    {
        $email = (string) $this->option('email');
        $user = User::query()->where('email', $email)->first();

        if ($user === null) {
            $this->error("No user with email {$email}. Available:");
            User::query()->orderBy('id')->pluck('email')->each(fn ($e) => $this->line("  - {$e}"));

            return self::FAILURE;
        }

        $names = array_column($this->seed, 'name');

        // Clean any prior run for these names so re-running stays idempotent.
        CustomKeywordSearch::withTrashed()
            ->where('user_id', $user->id)
            ->where('search_type', CustomKeywordSearch::TYPE_PRODUCT)
            ->whereIn('name', $names)
            ->get()
            ->each->forceDelete();

        $pool = ViralVideo::query()->visible()->inRandomOrder()->limit(80)->get();

        if ($pool->isEmpty()) {
            $this->warn('No visible viral videos found — searches will be created without videos.');
        }

        foreach ($this->seed as $row) {
            $search = CustomKeywordSearch::create([
                'user_id' => $user->id,
                'name' => $row['name'],
                'phrase' => $row['name'],
                'search_type' => CustomKeywordSearch::TYPE_PRODUCT,
                'keywords' => $row['keywords'],
                'keyword_signature' => collect($row['keywords'])->map(fn ($k) => strtolower($k))->sort()->implode(','),
                'frequency' => $row['frequency'],
                'status' => $row['status'],
                'is_watchlisted' => true,
                'last_run_at' => now()->subDays(random_int(0, 6)),
                'next_run_at' => now()->addDays($row['frequency'] === 'weekly' ? 7 : 30),
            ]);

            $videos = $pool->shuffle()->take($row['videos']);

            $ranked = $videos
                ->map(fn (ViralVideo $video): array => [
                    'id' => $video->id,
                    'score' => round(random_int(300, 2600) / 100, 2), // 3.00x – 26.00x
                ])
                ->sortByDesc('score')
                ->values();

            $rank = 1;
            foreach ($ranked as $item) {
                CustomKeywordSearchVideo::create([
                    'custom_keyword_search_id' => $search->id,
                    'viral_video_id' => $item['id'],
                    'source' => 'external_scrape',
                    'viral_score' => $item['score'],
                    'rank' => $rank++,
                    'is_new_breakout' => $item['score'] >= 10,
                ]);
            }

            $this->info("Seeded '{$row['name']}' ({$ranked->count()} videos) for {$user->email}");
        }

        $this->newLine();
        $this->info('Done. Open /products to see them.');

        return self::SUCCESS;
    }
}
