<?php

use App\Models\Subscription;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Rebrand the paid plan slugs to match their display names:
 *   basic  -> growth   (basic-annual  -> growth-annual)
 *   premium -> scale   (premium-annual -> scale-annual)
 *
 * Renames the pricing_plans rows and repoints every stored copy of the slug
 * (subscription metadata + managed coupon programs) so nothing dangles.
 */
return new class extends Migration
{
    /** @var array<string, string> old slug => new slug */
    private const MAP = [
        'basic' => 'growth',
        'basic-annual' => 'growth-annual',
        'premium' => 'scale',
        'premium-annual' => 'scale-annual',
    ];

    public function up(): void
    {
        $this->rename(self::MAP);
    }

    public function down(): void
    {
        $this->rename(array_flip(self::MAP));
    }

    /**
     * @param  array<string, string>  $map  from slug => to slug
     */
    private function rename(array $map): void
    {
        foreach ($map as $from => $to) {
            DB::table('plans')->where('slug', $from)->update(['slug' => $to]);

            if (DB::getSchemaBuilder()->hasTable('managed_coupon_programs')) {
                DB::table('managed_coupon_programs')->where('plan_slug', $from)->update(['plan_slug' => $to]);
            }
        }

        // Subscription metadata stores a `plan_slug` fallback. Rewrite it in PHP
        // so the migration stays portable across sqlite / mysql / pgsql.
        Subscription::withTrashed()->chunkById(200, function ($subscriptions) use ($map): void {
            foreach ($subscriptions as $subscription) {
                $metadata = (array) $subscription->metadata;
                $slug = data_get($metadata, 'plan_slug');

                if (is_string($slug) && isset($map[$slug])) {
                    data_set($metadata, 'plan_slug', $map[$slug]);
                    $subscription->forceFill(['metadata' => $metadata])->saveQuietly();
                }
            }
        });
    }
};
