<?php

namespace App\Services\ViralVideoAnalysis;

use App\Models\ViralVideoSharedTranscript;
use Illuminate\Support\Str;

class SharedTranscriptStore
{
    public function find(?string $videoId = null, ?string $postUrl = null): ?ViralVideoSharedTranscript
    {
        $videoId = $this->nullableString($videoId);
        $postUrl = $this->nullableString($postUrl);
        $normalizedPostUrl = $this->normalizePostUrl($postUrl);

        if ($videoId !== null) {
            $record = ViralVideoSharedTranscript::query()
                ->where('video_id', $videoId)
                ->first();

            if ($record !== null) {
                return $record;
            }
        }

        if ($postUrl !== null) {
            $record = ViralVideoSharedTranscript::query()
                ->where('post_url', $postUrl)
                ->latest('updated_at')
                ->first();

            if ($record !== null) {
                return $record;
            }
        }

        if ($normalizedPostUrl !== null) {
            return ViralVideoSharedTranscript::query()
                ->where('normalized_post_url', $normalizedPostUrl)
                ->latest('updated_at')
                ->first();
        }

        return null;
    }

    /**
     * @param  array<int, array<string, mixed>>|null  $transcriptSegments
     * @param  array<string, mixed>|null  $analysisResult
     */
    public function upsertTranscript(
        ?string $videoId,
        ?string $postUrl,
        string $transcript,
        ?array $transcriptSegments = null,
        ?\DateTimeInterface $fetchedAt = null,
        ?array $analysisResult = null,
    ): ViralVideoSharedTranscript {
        $videoId = $this->nullableString($videoId);
        $postUrl = $this->nullableString($postUrl);
        $normalizedPostUrl = $this->normalizePostUrl($postUrl);

        $record = $this->find($videoId, $postUrl) ?? new ViralVideoSharedTranscript();

        $record->fill([
            'video_id' => $videoId ?? $record->video_id,
            'post_url' => $postUrl ?? $record->post_url,
            'normalized_post_url' => $normalizedPostUrl ?? $record->normalized_post_url,
            'transcript' => $this->normalizeTranscript($transcript),
            'transcript_segments' => $transcriptSegments,
            'fetched_at' => $fetchedAt,
            'analysis_result' => $analysisResult ?? $record->analysis_result,
        ]);

        $record->save();

        return $record->refresh();
    }

    /**
     * @param  array<string, mixed>  $analysisResult
     */
    public function storeAnalysisResult(ViralVideoSharedTranscript $record, array $analysisResult): ViralVideoSharedTranscript
    {
        $record->forceFill([
            'analysis_result' => $analysisResult,
        ])->save();

        return $record->refresh();
    }

    public function normalizePostUrl(?string $postUrl): ?string
    {
        $postUrl = $this->nullableString($postUrl);

        if ($postUrl === null) {
            return null;
        }

        $parts = parse_url($postUrl);

        if (! is_array($parts) || blank($parts['host'] ?? null) || blank($parts['path'] ?? null)) {
            return Str::lower(rtrim($postUrl, '/'));
        }

        $host = Str::lower((string) $parts['host']);
        $host = preg_replace('/^www\./', '', $host) ?? $host;
        $path = rtrim((string) $parts['path'], '/');

        return "https://{$host}{$path}";
    }

    private function normalizeTranscript(string $transcript): string
    {
        return trim(preg_replace("/\r\n?/", "\n", $transcript) ?? $transcript);
    }

    private function nullableString(?string $value): ?string
    {
        $value = trim((string) $value);

        return $value === '' ? null : $value;
    }
}
