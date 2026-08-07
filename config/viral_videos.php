<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Media durability
    |--------------------------------------------------------------------------
    |
    | Apify hands back TikTok CDN URLs that are signed and short-lived. A card
    | rendered a week after its scrape points at a dead link, which is why the
    | grid is full of gradient placeholders.
    |
    | The fix is two-stage: the import writes the source URLs as it always has,
    | then a background pass downloads each asset, uploads it to object storage,
    | verifies it landed, and rewrites the column to the durable URL. Nothing is
    | uploaded inline during a scrape — a slow bucket must never slow a run.
    |
    */

    'media' => [

        /*
         * Off by default. A misconfigured bucket would otherwise turn every
         * import into a queue full of failing jobs. Flip this only once the
         * debug commands confirm writes and public reads both work.
         */
        'enabled' => filter_var(env('VIRAL_VIDEOS_MEDIA_ARCHIVE_ENABLED', false), FILTER_VALIDATE_BOOL),

        'disk' => env('VIRAL_VIDEOS_MEDIA_DISK', 's3'),

        // Key prefix inside the bucket. No leading or trailing slash.
        'prefix' => trim((string) env('VIRAL_VIDEOS_MEDIA_PREFIX', 'viral_videos'), '/'),

        'queue' => env('VIRAL_VIDEOS_MEDIA_QUEUE', 'default'),

        // Videos archived per batch job when catching up.
        'batch_size' => (int) env('VIRAL_VIDEOS_MEDIA_BATCH_SIZE', 50),

        'download' => [
            // Generous: these are CDN images behind an occasionally slow edge.
            'timeout' => (int) env('VIRAL_VIDEOS_MEDIA_TIMEOUT', 120),

            // Attempts per asset. Only 429, 5xx and network errors are retried;
            // a 403/404/410 is a dead link and retrying it just burns the queue.
            'attempts' => (int) env('VIRAL_VIDEOS_MEDIA_ATTEMPTS', 3),
            'retry_delay_ms' => (int) env('VIRAL_VIDEOS_MEDIA_RETRY_DELAY_MS', 500),

            /*
             * TikTok's CDN serves 403 to clients that look like scripts. These
             * are the headers a browser would send when loading the cover off a
             * TikTok page.
             */
            'headers' => [
                'User-Agent' => env(
                    'VIRAL_VIDEOS_MEDIA_USER_AGENT',
                    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36'
                ),
                'Referer' => 'https://www.tiktok.com/',
                'Accept' => 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
            ],
        ],

        /*
         * HEIC/HEIF covers are unusable in most browsers, so they are converted
         * to JPEG before upload. Tried in order; whichever is installed wins.
         */
        'converters' => [
            'imagemagick_path' => env('IMAGEMAGICK_PATH', 'magick'),
            'ffmpeg_path' => env('FFMPEG_PATH', 'ffmpeg'),
            'timeout' => (int) env('VIRAL_VIDEOS_MEDIA_CONVERT_TIMEOUT', 60),
        ],
    ],

];
