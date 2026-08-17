<?php

namespace Tests\Unit;

use App\Services\ViralVideoAnalysis\CreativeStrategistGenerator;
use ReflectionMethod;
use Tests\TestCase;

class CreativeStrategistGeneratorTest extends TestCase
{
    public function test_it_normalizes_strategy_recommendations_and_blueprint(): void
    {
        $service = app(CreativeStrategistGenerator::class);
        $method = new ReflectionMethod($service, 'normalize');
        $method->setAccessible(true);

        $result = $method->invoke($service, [
            'creative_summary' => 'Adapt the countable promise, then compress the payoff.',
            'recommendations' => [
                [
                    'headline' => 'Lead with a countable promise.',
                    'description' => 'Pick your 3 hero SKUs and make the number the hook.',
                ],
                [
                    'headline' => 'Keep it under 15 seconds.',
                    'description' => 'One application beat per product, no intro or outro.',
                ],
            ],
            'blueprint' => [
                'opening' => 'HOOK (0-2s) - "i replaced my 12-step routine with 3 products."',
                'middle' => 'PROOF (2-10s) - apply each product on camera, one beat per product.',
                'close' => 'PAYOFF (10-14s) - final glaze close-up. "that is it. three."',
                'cta' => 'CAPTION CTA - "which one do you already own?"',
            ],
            'ctas' => [
                ['text' => 'which one do you already own?'],
                ['text' => 'want the 3-step version?'],
            ],
            'delivery_instructions' => [
                ['text' => 'Open on the claim before showing the first product.'],
                ['text' => 'Keep each product reveal to one beat.'],
                ['text' => 'End on the final result close-up.'],
            ],
        ]);

        $this->assertIsArray($result);
        $this->assertSame(
            'Adapt the countable promise, then compress the payoff.',
            $result['creative_strategy']['summary']
        );
        $this->assertCount(2, $result['creative_strategy']['recommendations']);
        $this->assertSame(
            'Lead with a countable promise.',
            $result['creative_strategy']['recommendations'][0]['title']
        );
        $this->assertSame(
            'HOOK (0-2s) - "i replaced my 12-step routine with 3 products."',
            $result['creative_strategy']['blueprint']['hook']
        );
        $this->assertCount(2, $result['ctas']);
        $this->assertCount(3, $result['delivery_instructions']);
    }
}
