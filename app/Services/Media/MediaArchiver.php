<?php

namespace App\Services\Media;

use Illuminate\Contracts\Filesystem\Filesystem;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\Process\Process;

/**
 * Copies scraped media off the TikTok CDN and into object storage.
 *
 * The URLs Apify returns are signed and expire within days, so a stored row is
 * only as durable as the bytes behind it. This downloads each asset, uploads it
 * under a deterministic key, verifies the object actually exists, and hands
 * back the public URL to be written over the source column.
 *
 * Failure policy is deliberately asymmetric, because the two kinds of failure
 * mean opposite things:
 *
 *   - Our side broke (upload rejected, verification failed): keep the source
 *     URL. It may still be alive, and a repair pass can try again.
 *   - Their side is gone (403/404/410, expired signature): clear the field.
 *     The link is dead; keeping it only guarantees a broken image and an
 *     endless retry loop.
 *
 * Everything is reported rather than thrown, so one dead avatar never costs a
 * caller its cover.
 */
class MediaArchiver
{
    public const KIND_COVER = 'video_cover';
    public const KIND_THUMBNAIL = 'thumbnail';
    public const KIND_AVATAR = 'avatar';

    /** Statuses that mean the source is gone for good. */
    private const DEAD_STATUSES = [403, 404, 410];

    private const MIME_EXTENSIONS = [
        'image/jpeg' => 'jpg',
        'image/jpg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
        'image/gif' => 'gif',
        'image/avif' => 'avif',
        'image/heic' => 'heic',
        'image/heif' => 'heic',
        'video/mp4' => 'mp4',
        'video/quicktime' => 'mov',
    ];

    /** @var array<int, array<string, mixed>> */
    private array $failures = [];

    /**
     * Archive every asset on a video row.
     *
     * @param  array<string, mixed>  $attributes
     * @return array{attributes: array<string, mixed>, failures: array<int, array<string, mixed>>}
     */
    public function archiveWithReport(array $attributes): array
    {
        $this->failures = [];

        if (! $this->shouldArchive($attributes)) {
            return ['attributes' => $attributes, 'failures' => []];
        }

        $base = $this->pathPrefix($attributes);

        // Each field is its own attempt. A video whose avatar 404s should still
        // end up with an archived cover.
        foreach ([
            'cover' => self::KIND_COVER,
            'thumbnail_url' => self::KIND_THUMBNAIL,
            'avatar' => self::KIND_AVATAR,
        ] as $field => $kind) {
            $source = trim((string) ($attributes[$field] ?? ''));

            if ($source === '') {
                continue;
            }

            $attributes[$field] = $this->archiveAsset(
                sourceUrl: $source,
                pathBase: $base.'_'.$kind,
                kind: $kind,
                videoId: (string) $attributes['video_id'],
                triggerId: $attributes['apify_trigger_id'] ?? null,
            );
        }

        return ['attributes' => $attributes, 'failures' => $this->failures];
    }

    /**
     * @param  array<string, mixed>  $attributes
     * @return array<string, mixed>
     */
    public function archive(array $attributes): array
    {
        return $this->archiveWithReport($attributes)['attributes'];
    }

    /**
     * Archiving needs a switch, a stable ID and a timestamp — the last two are
     * what make the object key deterministic and therefore repairable.
     *
     * @param  array<string, mixed>  $attributes
     */
    public function shouldArchive(array $attributes): bool
    {
        if (! $this->enabled()) {
            return false;
        }

        if (trim((string) ($attributes['video_id'] ?? '')) === '') {
            return false;
        }

        return $this->timestamp($attributes) !== null;
    }

    public function enabled(): bool
    {
        return (bool) config('viral_videos.media.enabled', false);
    }

    public function disk(): Filesystem
    {
        return Storage::disk($this->diskName());
    }

    public function diskName(): string
    {
        return (string) config('viral_videos.media.disk', 's3');
    }

    public function prefix(): string
    {
        return trim((string) config('viral_videos.media.prefix', 'viral_videos'), '/');
    }

    /**
     * The public URL root for the configured disk, used to recognise assets we
     * have already archived so a re-run is close to free.
     */
    public function storageBaseUrl(): ?string
    {
        try {
            $url = $this->disk()->url('');
        } catch (\Throwable) {
            return null;
        }

        $url = trim((string) $url);

        return $url === '' ? null : rtrim($url, '/');
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function failures(): array
    {
        return $this->failures;
    }

    /**
     * One asset, end to end.
     *
     * Returns the stored URL on success, the original URL when the failure was
     * ours, and an empty string when the source is confirmed dead.
     */
    public function archiveAsset(
        string $sourceUrl,
        string $pathBase,
        string $kind,
        string $videoId,
        ?int $triggerId = null,
        string $type = 'image',
    ): string {
        $sourceUrl = trim($sourceUrl);

        if ($sourceUrl === '') {
            return '';
        }

        if ($this->isAlreadyStored($sourceUrl)) {
            return $sourceUrl;
        }

        // A signature that has already lapsed will 403 every time. Spend no
        // network on it, and clear the field so the UI stops trying.
        if ($this->isExpiredSignedUrl($sourceUrl)) {
            $this->recordFailure($videoId, $triggerId, $kind, $sourceUrl, null, 'Signed source URL had already expired.');

            return '';
        }

        $temp = $this->tempPath();
        $converted = null;

        try {
            $result = $this->download($sourceUrl, $temp);

            if (! $result['ok']) {
                $this->recordFailure($videoId, $triggerId, $kind, $sourceUrl, null, $result['message']);

                if ($result['dead']) {
                    Log::info('Cleared a dead media source URL.', [
                        'video_id' => $videoId,
                        'kind' => $kind,
                        'status' => $result['status'],
                    ]);

                    return '';
                }

                // Might just be a bad minute on their edge. Keep the source so
                // a later pass can try again.
                return $sourceUrl;
            }

            [$extension, $mime] = $this->resolveExtension($result['content_type'], $sourceUrl, $type === 'video' ? 'mp4' : 'jpg');

            $upload = $this->prepareUploadSource($temp, $mime, $extension, $type);
            $converted = $upload['path'] !== $temp ? $upload['path'] : null;

            $path = $pathBase.'.'.$upload['extension'];

            $handle = @fopen($upload['path'], 'rb');

            if ($handle === false) {
                $this->recordFailure($videoId, $triggerId, $kind, $sourceUrl, $path, 'Could not open the downloaded file for upload.');

                return $sourceUrl;
            }

            try {
                $stored = $this->disk()->put($path, $handle, [
                    'visibility' => 'public',
                    'ContentType' => $upload['mime'],
                ]);
            } finally {
                if (is_resource($handle)) {
                    fclose($handle);
                }
            }

            if ($stored === false) {
                $this->recordFailure($videoId, $triggerId, $kind, $sourceUrl, $path, 'Object storage rejected the upload.');
                Log::warning('Media upload failed.', ['video_id' => $videoId, 'kind' => $kind, 'path' => $path]);

                return $sourceUrl;
            }

            // put() returning true is not proof the bytes are readable. A
            // misconfigured endpoint can accept a write that never lands.
            if (! $this->storedObjectExists($path)) {
                $this->recordFailure($videoId, $triggerId, $kind, $sourceUrl, $path, 'Upload reported success but the object does not exist.');
                Log::warning('Media upload could not be verified.', ['video_id' => $videoId, 'kind' => $kind, 'path' => $path]);

                return $sourceUrl;
            }

            return (string) $this->disk()->url($path);
        } catch (\Throwable $e) {
            $this->recordFailure($videoId, $triggerId, $kind, $sourceUrl, null, $e->getMessage());
            Log::warning('Media archive threw.', ['video_id' => $videoId, 'kind' => $kind, 'error' => $e->getMessage()]);

            return $sourceUrl;
        } finally {
            $this->cleanup($temp, $converted);
        }
    }

    /**
     * Content-Type first, then the URL's own extension, then the caller's
     * fallback. CDNs lie in both directions, so neither source is trusted alone.
     *
     * @return array{0: string, 1: string}  [extension, mime]
     */
    public function resolveExtension(?string $contentType, string $url, string $fallback): array
    {
        $mime = strtolower(trim(explode(';', (string) $contentType)[0]));

        if ($mime !== '' && isset(self::MIME_EXTENSIONS[$mime])) {
            return [self::MIME_EXTENSIONS[$mime], $mime];
        }

        $pathExtension = strtolower(pathinfo((string) parse_url($url, PHP_URL_PATH), PATHINFO_EXTENSION));

        if ($pathExtension !== '' && in_array($pathExtension, self::MIME_EXTENSIONS, true)) {
            return [$pathExtension, $this->mimeForExtension($pathExtension)];
        }

        return [$fallback, $this->mimeForExtension($fallback)];
    }

    /**
     * HEIC is an Apple container most browsers refuse to render, so it is
     * transcoded to JPEG before it ever reaches the bucket.
     *
     * @return array{path: string, extension: string, mime: string}
     */
    public function prepareUploadSource(string $tempPath, string $mime, string $extension, string $type): array
    {
        $isHeic = $type === 'image' && (in_array($extension, ['heic', 'heif'], true) || in_array($mime, ['image/heic', 'image/heif'], true));

        if (! $isHeic) {
            return ['path' => $tempPath, 'extension' => $extension, 'mime' => $mime];
        }

        $target = $tempPath.'.jpg';

        if ($this->convertToJpeg($tempPath, $target)) {
            return ['path' => $target, 'extension' => 'jpg', 'mime' => 'image/jpeg'];
        }

        // Better a stored HEIC than nothing — the repair pass looks for stored
        // .heic keys specifically and will reprocess them once a converter is
        // installed.
        Log::warning('HEIC conversion unavailable; uploading the original file.', [
            'path' => $tempPath,
            'hint' => 'Install the Imagick extension, ImageMagick, or ffmpeg on this host.',
        ]);

        return ['path' => $tempPath, 'extension' => $extension, 'mime' => $mime];
    }

    public function storedObjectExists(string $path): bool
    {
        try {
            return $this->disk()->exists($path);
        } catch (\Throwable $e) {
            Log::warning('Could not verify a stored object.', ['path' => $path, 'error' => $e->getMessage()]);

            return false;
        }
    }

    /**
     * Already ours, so leave it alone — unless it is a stored HEIC, which is
     * exactly what a conversion-repair pass needs to pick up again.
     */
    public function isAlreadyStored(string $url): bool
    {
        $base = $this->storageBaseUrl();

        if ($base === null || ! str_starts_with($url, $base)) {
            return false;
        }

        $extension = strtolower(pathinfo((string) parse_url($url, PHP_URL_PATH), PATHINFO_EXTENSION));

        return ! in_array($extension, ['heic', 'heif'], true);
    }

    /**
     * TikTok signs its CDN URLs with an `x-expires` unix timestamp. Reading it
     * costs nothing and saves three doomed requests per dead asset.
     */
    public function isExpiredSignedUrl(string $url): bool
    {
        $query = (string) parse_url($url, PHP_URL_QUERY);

        if ($query === '') {
            return false;
        }

        parse_str($query, $params);

        $expires = $params['x-expires'] ?? $params['x_expires'] ?? null;

        if (! is_numeric($expires)) {
            return false;
        }

        return (int) $expires <= now()->getTimestamp();
    }

    /**
     * Deterministic directory so every video's assets stay isolated together
     * and a repair run overwrites rather than duplicates.
     *
     * @param  array<string, mixed>  $attributes
     */
    public function pathPrefix(array $attributes): string
    {
        $trigger = $attributes['apify_trigger_id'] ?? null;
        $triggerPart = $trigger === null || $trigger === '' ? 'na' : $this->sanitize((string) $trigger);
        $folder = implode('_', [
            $triggerPart,
            $this->sanitize((string) $attributes['video_id']),
            (string) $this->timestamp($attributes),
        ]);

        return implode('/', [
            $this->prefix(),
            'tiktok',
            $folder,
            $folder,
        ]);
    }

    public function sanitize(string $value): string
    {
        return preg_replace('/[^A-Za-z0-9._-]/', '_', $value) ?: 'unknown';
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function recordFailure(
        string $videoId,
        ?int $triggerId,
        string $kind,
        string $sourceUrl,
        ?string $targetPath,
        string $message,
    ): void {
        $this->failures[] = [
            'video_id' => $videoId,
            'trigger_id' => $triggerId,
            'kind' => $kind,
            'source_url' => $sourceUrl,
            'target_path' => $targetPath,
            'message' => $message,
        ];
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function timestamp(array $attributes): ?int
    {
        $value = $attributes['created_at'] ?? null;

        if ($value === null || $value === '') {
            return null;
        }

        if (is_numeric($value)) {
            return (int) $value;
        }

        if ($value instanceof \DateTimeInterface) {
            return $value->getTimestamp();
        }

        try {
            return (int) \Carbon\CarbonImmutable::parse((string) $value)->getTimestamp();
        } catch (\Throwable) {
            return null;
        }
    }

    /**
     * @return array{ok: bool, dead: bool, status: ?int, content_type: ?string, message: string}
     */
    private function download(string $url, string $temp): array
    {
        $attempts = max(1, (int) config('viral_videos.media.download.attempts', 3));
        $timeout = (int) config('viral_videos.media.download.timeout', 120);
        $delay = max(0, (int) config('viral_videos.media.download.retry_delay_ms', 500));
        $headers = (array) config('viral_videos.media.download.headers', []);
        $last = 'Download failed.';

        for ($attempt = 1; $attempt <= $attempts; $attempt++) {
            // The sink is appended to, so a failed attempt must not leave its
            // error body in front of the next attempt's bytes.
            @file_put_contents($temp, '');

            try {
                $response = Http::withHeaders($headers)
                    ->timeout($timeout)
                    ->withOptions(['sink' => $temp])
                    ->get($url);

                $status = $response->status();

                if ($response->successful()) {
                    /*
                     * The sink keeps large files off the heap, but not every
                     * handler honours it — faked clients in particular hand
                     * back a body and write nothing. Fall back to the body
                     * rather than mistaking that for an empty asset.
                     */
                    if (! is_file($temp) || filesize($temp) === 0) {
                        @file_put_contents($temp, $response->body());
                    }

                    if (! is_file($temp) || filesize($temp) === 0) {
                        $last = 'Source returned an empty body.';

                        break;
                    }

                    return [
                        'ok' => true,
                        'dead' => false,
                        'status' => $status,
                        'content_type' => $response->header('Content-Type') ?: null,
                        'message' => '',
                    ];
                }

                if (in_array($status, self::DEAD_STATUSES, true)) {
                    return [
                        'ok' => false,
                        'dead' => true,
                        'status' => $status,
                        'content_type' => null,
                        'message' => "Source is gone (HTTP {$status}).",
                    ];
                }

                $last = "Source returned HTTP {$status}.";

                // Rate limiting and server errors are worth another try;
                // any other 4xx will answer the same way next time.
                if ($status !== 429 && $status < 500) {
                    break;
                }
            } catch (ConnectionException $e) {
                $last = 'Connection failed: '.$e->getMessage();
            }

            if ($attempt < $attempts && $delay > 0) {
                usleep($delay * 1000);
            }
        }

        return ['ok' => false, 'dead' => false, 'status' => null, 'content_type' => null, 'message' => $last];
    }

    /**
     * Imagick in-process, then the ImageMagick CLI, then ffmpeg. Hosts vary and
     * none of the three is guaranteed.
     */
    private function convertToJpeg(string $source, string $target): bool
    {
        if (class_exists(\Imagick::class)) {
            try {
                $image = new \Imagick($source);
                $image->setImageFormat('jpeg');
                $image->setImageCompressionQuality(90);
                $image->writeImage($target);
                $image->clear();

                if (is_file($target) && filesize($target) > 0) {
                    return true;
                }
            } catch (\Throwable $e) {
                Log::debug('Imagick HEIC conversion failed.', ['error' => $e->getMessage()]);
            }
        }

        $timeout = (int) config('viral_videos.media.converters.timeout', 60);

        $candidates = [
            [(string) config('viral_videos.media.converters.imagemagick_path', 'magick'), $source, $target],
            [(string) config('viral_videos.media.converters.ffmpeg_path', 'ffmpeg'), '-y', '-i', $source, $target],
        ];

        foreach ($candidates as $command) {
            try {
                $process = new Process($command);
                $process->setTimeout($timeout);
                $process->run();

                if ($process->isSuccessful() && is_file($target) && filesize($target) > 0) {
                    return true;
                }
            } catch (\Throwable $e) {
                Log::debug('CLI HEIC conversion failed.', ['binary' => $command[0], 'error' => $e->getMessage()]);
            }
        }

        return false;
    }

    /** Upload ContentType must be explicit; a wrong one makes S3 serve a download. */
    private function mimeForExtension(string $extension): string
    {
        return match ($extension) {
            'png' => 'image/png',
            'webp' => 'image/webp',
            'gif' => 'image/gif',
            'avif' => 'image/avif',
            'heic', 'heif' => 'image/heic',
            'mp4' => 'video/mp4',
            'mov' => 'video/quicktime',
            default => 'image/jpeg',
        };
    }

    private function tempPath(): string
    {
        return rtrim(sys_get_temp_dir(), '/\\').DIRECTORY_SEPARATOR.'vvf-media-'.Str::random(24);
    }

    private function cleanup(?string ...$paths): void
    {
        foreach ($paths as $path) {
            if ($path !== null && is_file($path)) {
                @unlink($path);
            }
        }
    }
}
