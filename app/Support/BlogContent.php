<?php

namespace App\Support;

use Illuminate\Support\Str;

class BlogContent
{
    public const FIELDS = [
        'paragraph' => ['text'], 'heading' => ['text'], 'list' => [],
        'quote' => ['text', 'attribution'], 'callout' => ['title', 'text'],
        'link' => ['label', 'url', 'text'], 'image' => ['src', 'alt', 'caption'],
        'embed' => ['url', 'caption'], 'cta' => ['eyebrow', 'title', 'text', 'button_label', 'button_url'],
        'divider' => [],
    ];

    public static function safeUrl(string $url, bool $relative = false): bool
    {
        if (preg_match('/[\x00-\x20\\\\]/', $url)) {
            return false;
        }
        if ($relative && str_starts_with($url, '/') && ! str_starts_with($url, '//')) {
            return true;
        }

        return filter_var($url, FILTER_VALIDATE_URL) && in_array(strtolower(parse_url($url, PHP_URL_SCHEME) ?? ''), ['http', 'https'], true);
    }

    public static function embedUrl(string $url): ?string
    {
        if (! self::safeUrl($url) || parse_url($url, PHP_URL_SCHEME) !== 'https') {
            return null;
        }
        $host = strtolower(parse_url($url, PHP_URL_HOST) ?? '');
        $path = parse_url($url, PHP_URL_PATH) ?? '';
        parse_str(parse_url($url, PHP_URL_QUERY) ?? '', $query);
        $id = null;
        if ($host === 'youtu.be') {
            $id = trim($path, '/');
        } elseif (in_array($host, ['youtube.com', 'www.youtube.com', 'www.youtube-nocookie.com'], true)) {
            $id = $query['v'] ?? (preg_match('~^/(?:embed|shorts)/([\w-]+)$~', $path, $m) ? $m[1] : null);
        }
        if (is_string($id) && preg_match('/^[\w-]{11}$/', $id)) {
            return 'https://www.youtube-nocookie.com/embed/'.$id;
        }
        if (in_array($host, ['vimeo.com', 'www.vimeo.com', 'player.vimeo.com'], true) && preg_match('~^/(?:video/)?(\d+)$~', $path, $m)) {
            return 'https://player.vimeo.com/video/'.$m[1];
        }

        return null;
    }

    public static function normalize(mixed $document): array
    {
        if (! is_array($document)) {
            $document = ['blocks' => [['type' => 'paragraph', 'text' => '']]];
        }
        if (($document['type'] ?? null) === 'doc') {
            $document = ['blocks' => self::legacy($document['content'] ?? [])];
        }
        $blocks = [];
        foreach (is_array($document['blocks'] ?? null) ? $document['blocks'] : [] as $block) {
            if (! is_array($block) || ! is_string($block['type'] ?? null) || ! array_key_exists($block['type'], self::FIELDS)) {
                continue;
            }
            $type = $block['type'];
            $out = ['type' => $type];
            foreach (self::FIELDS[$type] as $field) {
                $out[$field] = is_string($block[$field] ?? null) ? trim($block[$field]) : '';
            }
            if ($type === 'heading') {
                $out['level'] = max(1, min(3, (int) ($block['level'] ?? 2)));
            }
            if ($type === 'list') {
                $out['style'] = ($block['style'] ?? '') === 'ordered' ? 'ordered' : 'bullet';
                $out['items'] = array_values(array_filter(array_map(fn ($v) => is_string($v) ? trim($v) : '', is_array($block['items'] ?? null) ? $block['items'] : []), fn ($v) => $v !== ''));
            }
            if ($type === 'callout') {
                $out['tone'] = in_array($block['tone'] ?? '', ['info', 'tip', 'warning'], true) ? $block['tone'] : 'info';
            }
            foreach (['url', 'src', 'button_url'] as $field) {
                if (isset($out[$field]) && ! self::safeUrl($out[$field], $field !== 'url' || $type !== 'embed')) {
                    $out[$field] = '';
                }
            }
            if ($type === 'embed') {
                $out['url'] = self::embedUrl($out['url']) ?? '';
            }
            $blocks[] = $out;
        }

        return ['version' => 1, 'layout' => in_array($document['layout'] ?? '', ['standard', 'guide', 'analysis'], true) ? $document['layout'] : 'standard', 'blocks' => $blocks];
    }

    private static function legacy(array $nodes): array
    {
        $out = [];
        foreach ($nodes as $node) {
            if (! is_array($node)) {
                continue;
            }
            $type = $node['type'] ?? '';
            $text = self::legacyText($node);
            $attrs = $node['attrs'] ?? [];
            $block = match ($type) {
                'paragraph', 'heading' => ['type' => $type, 'text' => $text, 'level' => $attrs['level'] ?? 2],
                'bulletList', 'orderedList' => ['type' => 'list', 'style' => $type === 'orderedList' ? 'ordered' : 'bullet', 'items' => array_map(self::legacyText(...), $node['content'] ?? [])],
                'blockquote' => ['type' => 'quote', 'text' => $text],
                'horizontalRule' => ['type' => 'divider'],
                'image' => ['type' => 'image', 'src' => $attrs['src'] ?? '', 'alt' => $attrs['alt'] ?? ''],
                'youtube' => ['type' => 'embed', 'url' => $attrs['src'] ?? ''],
                'callout' => ['type' => 'callout', 'text' => $text, 'title' => $attrs['title'] ?? '', 'tone' => $attrs['tone'] ?? 'info'],
                default => null,
            };
            if ($block) {
                $out[] = $block;
            }
        }

        return $out ?: [['type' => 'paragraph', 'text' => '']];
    }

    private static function legacyText(array $node): string
    {
        return trim(($node['text'] ?? '').' '.implode(' ', array_map(self::legacyText(...), $node['content'] ?? [])));
    }

    public static function readingTime(array $document, ?string $excerpt): int
    {
        $text = $excerpt ?? '';
        foreach ($document['blocks'] as $block) {
            foreach (['text', 'title', 'caption', 'eyebrow', 'button_label', 'attribution'] as $field) {
                $text .= ' '.($block[$field] ?? '');
            }
            $text .= ' '.implode(' ', $block['items'] ?? []);
        }

        return max(1, (int) ceil(count(preg_split('/\s+/u', trim(strip_tags($text)), -1, PREG_SPLIT_NO_EMPTY)) / 220));
    }

    public static function withAnchors(array $blocks): array
    {
        $used = [];
        foreach ($blocks as &$block) {
            if ($block['type'] !== 'heading' || $block['text'] === '') {
                continue;
            }
            $base = Str::slug($block['text']) ?: 'section';
            $id = $base;
            for ($i = 2; isset($used[$id]); $i++) {
                $id = $base.'-'.$i;
            }
            $used[$id] = true;
            $block['anchor'] = $id;
        }

        return $blocks;
    }
}
