<?php

namespace Tests\Unit;

use App\Services\ViralVideoAnalysis\SharedDiagnosticAnalyzer;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class SharedDiagnosticAnalyzerTest extends TestCase
{
    public function test_it_normalizes_richer_diagnostic_output(): void
    {
        config([
            'services.openai.api_key' => 'test-key',
            'services.openai.base_url' => 'https://openai.test/v1',
        ]);

        Http::fake([
            '*' => Http::response([
                'choices' => [[
                    'message' => [
                        'content' => json_encode([
                            'summary' => 'A sub-15-second GRWM built around a countable promise and a fast payoff.',
                            'evidence' => 'The opening line names three products, which creates an open loop viewers want resolved.',
                            'hook' => ['summary' => '"the only 3 products i use for that glazed donut skin"'],
                            'drivers' => [
                                [
                                    'driver' => 'Countable promise',
                                    'reason' => 'A specific number creates a finite commitment that feels easy to finish.',
                                    'impact' => '+34%',
                                    'proof' => 'The transcript starts by naming exactly three products.',
                                ],
                                [
                                    'driver' => 'Fast payoff',
                                    'reason' => 'Each product lands quickly, so the viewer keeps collecting answers.',
                                ],
                            ],
                            'hook_variations' => [
                                ['variation' => '3 products. that is the whole routine. watch.'],
                                ['variation' => 'the glazed donut look is literally these 3 things'],
                                ['variation' => 'i cut my routine down to these 3 products'],
                            ],
                            'extra_key' => 'ignored',
                        ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
                    ],
                ]],
            ]),
        ]);

        $result = app(SharedDiagnosticAnalyzer::class)->analyze(
            transcript: 'these are the only 3 products i use',
            transcriptSegments: [['start_ms' => 0, 'text' => 'these are the only 3 products i use']],
            videoContext: ['views' => 4200000, 'virality_score' => 18],
        );

        $this->assertNotNull($result);
        $this->assertSame(
            'A sub-15-second GRWM built around a countable promise and a fast payoff.',
            $result['why_it_went_viral']
        );
        $this->assertSame(
            '"the only 3 products i use for that glazed donut skin"',
            $result['hook_analysis']
        );
        $this->assertCount(2, $result['content_breakdown']);
        $this->assertSame('Countable promise', $result['content_breakdown'][0]['title']);
        $this->assertSame('+34%', $result['content_breakdown'][0]['uplift']);
        $this->assertCount(3, $result['hooks']);
    }
}
