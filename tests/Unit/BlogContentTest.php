<?php

namespace Tests\Unit;

use App\Support\BlogContent;
use PHPUnit\Framework\TestCase;

class BlogContentTest extends TestCase
{
    public function test_normalization_handles_legacy_and_malformed_content(): void
    {
        $doc = BlogContent::normalize(['type' => 'doc', 'content' => [['type' => 'heading', 'attrs' => ['level' => 9], 'content' => [['type' => 'text', 'text' => 'Hello']]], ['type' => 'bulletList', 'content' => [['type' => 'listItem', 'content' => [['type' => 'paragraph', 'content' => [['type' => 'text', 'text' => 'Item']]]]]]]]]);
        $this->assertSame(3, $doc['blocks'][0]['level']);
        $this->assertSame(['Item'], $doc['blocks'][1]['items']);
        $this->assertSame(1, BlogContent::readingTime($doc, null));
        $this->assertCount(1, BlogContent::normalize(null)['blocks']);
        $this->assertSame([], BlogContent::normalize(['blocks' => [['type' => 'unknown'], 'bad']])['blocks']);
    }

    public function test_urls_reject_script_protocol_relative_and_unapproved_embeds(): void
    {
        foreach (['javascript:alert(1)', '//evil.example', '/\\evil.example', "https://example.com/\nfoo", 'data:text/html,test'] as $url) {
            $this->assertFalse(BlogContent::safeUrl($url, true));
        }
        $this->assertTrue(BlogContent::safeUrl('/dashboard', true));
        $this->assertSame('https://player.vimeo.com/video/123', BlogContent::embedUrl('https://vimeo.com/123'));
        $this->assertNull(BlogContent::embedUrl('https://youtube.com.evil.example/embed/dQw4w9WgXcQ'));
    }
}
