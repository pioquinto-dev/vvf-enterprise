<?php

namespace Tests\Unit;

use App\Services\CustomKeywordSearch\KeywordNormalizer;
use Tests\TestCase;

class KeywordNormalizerTest extends TestCase
{
    private KeywordNormalizer $normalizer;

    protected function setUp(): void
    {
        parent::setUp();
        $this->normalizer = new KeywordNormalizer;
    }

    public function test_it_trims_and_collapses_whitespace(): void
    {
        $this->assertSame('side hustle ideas', $this->normalizer->keyword("  side   hustle \n ideas  "));
    }

    public function test_the_phrase_always_leads_the_keyword_set(): void
    {
        $set = $this->normalizer->keywordSet('korean skincare', ['glass skin', 'kbeauty']);

        $this->assertSame('korean skincare', $set[0]);
        $this->assertCount(3, $set);
    }

    public function test_it_dedupes_case_insensitively(): void
    {
        $set = $this->normalizer->keywordSet('Side Hustle', ['side hustle', 'SIDE HUSTLE', 'make money']);

        $this->assertSame(['Side Hustle', 'make money'], $set);
    }

    public function test_it_caps_the_keyword_count(): void
    {
        $keywords = array_map(fn (int $i): string => "keyword {$i}", range(1, 30));

        $this->assertCount(12, $this->normalizer->keywordSet('phrase', $keywords));
    }

    public function test_signature_ignores_ordering(): void
    {
        $a = $this->normalizer->signature(['side hustle', 'make money online']);
        $b = $this->normalizer->signature(['Make Money Online', 'Side Hustle']);

        $this->assertSame($a, $b);
    }

    public function test_signature_differs_for_different_keyword_sets(): void
    {
        $a = $this->normalizer->signature(['side hustle', 'make money online']);
        $b = $this->normalizer->signature(['side hustle', 'passive income']);

        $this->assertNotSame($a, $b);
    }

    public function test_name_falls_back_to_the_phrase_and_is_capped(): void
    {
        $this->assertSame('korean skincare', $this->normalizer->name(null, 'korean skincare'));
        $this->assertSame(80, mb_strlen($this->normalizer->name(str_repeat('a', 200), 'fallback')));
    }

    public function test_comparable_and_compact_forms(): void
    {
        $this->assertSame('korean skincare', $this->normalizer->comparable('#Korean-Skincare!!'));
        $this->assertSame('koreanskincare', $this->normalizer->compact('Korean Skincare'));
    }
}
