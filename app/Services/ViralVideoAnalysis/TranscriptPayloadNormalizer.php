<?php

namespace App\Services\ViralVideoAnalysis;

use Illuminate\Support\Arr;

class TranscriptPayloadNormalizer
{
    /**
     * @param  array<string, mixed>  $payload
     * @return array{transcript:?string, transcript_segments:?array}
     */
    public function extract(array $payload): array
    {
        $segments = $this->segmentsFromPayload($payload);
        $transcript = $this->transcriptFromPayload($payload, $segments);

        return [
            'transcript' => $transcript,
            'transcript_segments' => $segments,
        ];
    }

    /**
     * @param  array<string, mixed>  $payload
     * @param  array<int, array<string, mixed>>|null  $segments
     */
    private function transcriptFromPayload(array $payload, ?array $segments): ?string
    {
        if ($segments !== null && $segments !== []) {
            $text = collect($segments)
                ->pluck('text')
                ->filter(fn ($value) => is_string($value) && trim($value) !== '')
                ->map(fn (string $value) => trim($value))
                ->implode("\n");

            if ($text !== '') {
                return $text;
            }
        }

        foreach ([
            'transcript',
            'video_transcript',
            'subtitleText',
            'subtitles.text',
            'captions.text',
            'desc',
            'description',
            'title',
            'text',
        ] as $path) {
            $value = Arr::get($payload, $path);

            if (is_string($value) && trim($value) !== '') {
                return trim(preg_replace("/\r\n?/", "\n", $value) ?? $value);
            }
        }

        return null;
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<int, array<string, mixed>>|null
     */
    private function segmentsFromPayload(array $payload): ?array
    {
        foreach (['transcriptSegments', 'transcript_segments', 'segments', 'subtitles.list', 'captions.list', 'subtitles'] as $path) {
            $candidate = Arr::get($payload, $path);

            if (! is_array($candidate)) {
                continue;
            }

            // First pass: collect raw boundaries + text.
            $raw = [];

            foreach ($candidate as $entry) {
                if (! is_array($entry)) {
                    continue;
                }

                $text = $entry['text'] ?? $entry['content'] ?? $entry['caption'] ?? null;

                if (! is_string($text) || trim($text) === '') {
                    continue;
                }

                $start = $entry['start_ms'] ?? $entry['startMs'] ?? $entry['start'] ?? $entry['from'] ?? null;
                $end = $entry['end_ms'] ?? $entry['endMs'] ?? $entry['end'] ?? $entry['to'] ?? null;

                $raw[] = [
                    'start' => is_numeric($start) ? (float) $start : null,
                    'end' => is_numeric($end) ? (float) $end : null,
                    'text' => trim($text),
                ];
            }

            if ($raw === []) {
                continue;
            }

            // Decide the unit once for the whole collection: any fractional
            // boundary means the actor emitted seconds (e.g. 1.26), so scale the
            // entire set to milliseconds. Otherwise the values are already ms.
            $scale = $this->collectionInSeconds($raw) ? 1000 : 1;

            return array_map(fn (array $row): array => [
                'start_ms' => $row['start'] === null ? null : (int) round($row['start'] * $scale),
                'end_ms' => $row['end'] === null ? null : (int) round($row['end'] * $scale),
                'text' => $row['text'],
            ], $raw);
        }

        return null;
    }

    /**
     * @param  array<int, array{start:?float, end:?float, text:string}>  $raw
     */
    private function collectionInSeconds(array $raw): bool
    {
        foreach ($raw as $row) {
            foreach ([$row['start'], $row['end']] as $value) {
                if ($value !== null && $value !== floor($value)) {
                    return true;
                }
            }
        }

        return false;
    }
}
