<?php

namespace Tests\Feature;

use App\Models\PricingPlan;
use App\Support\PricingPlanTable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PlanSlugRebrandTest extends TestCase
{
    use RefreshDatabase;

    public function test_seeded_plans_use_the_rebranded_slugs(): void
    {
        PricingPlanTable::seedDefaults();

        $slugs = PricingPlan::query()->pluck('slug')->all();

        $this->assertContains('growth', $slugs);
        $this->assertContains('growth-annual', $slugs);
        $this->assertContains('scale', $slugs);
        $this->assertContains('scale-annual', $slugs);

        $this->assertNotContains('basic', $slugs);
        $this->assertNotContains('basic-annual', $slugs);
        $this->assertNotContains('premium', $slugs);
        $this->assertNotContains('premium-annual', $slugs);
    }

    public function test_growth_and_scale_keep_their_display_names(): void
    {
        PricingPlanTable::seedDefaults();

        $this->assertSame('Growth', PricingPlan::query()->where('slug', 'growth')->value('name'));
        $this->assertSame('Scale', PricingPlan::query()->where('slug', 'scale')->value('name'));
    }
}
