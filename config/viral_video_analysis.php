<?php

return [
    'queue' => env('VIRAL_VIDEO_ANALYSIS_QUEUE', 'video-analysis'),

    'apify' => [
        'task_id' => env('VIRAL_VIDEO_ANALYSIS_APIFY_TASK_ID', 'h6yX0DNISIOPpJwN5'),
        'actor_id' => env('VIRAL_VIDEO_ANALYSIS_APIFY_ACTOR_ID', env('APIFY_DEFAULT_ACTOR')),
        'refresh_after_hours' => (int) env('VIRAL_VIDEO_ANALYSIS_REFRESH_AFTER_HOURS', 24),
        'input' => [
            'customMapFunction' => '(object) => { return {...object} }',
            'dateRange' => 'YESTERDAY',
            'includeSearchKeywords' => false,
            'keywords' => [],
            'location' => 'US',
            'maxItems' => 1,
            'sortType' => 'RELEVANCE',
        ],
    ],

    // Dedicated actor that returns the spoken-word transcript for a single
    // post. Runs separately from the stats scrape above so the transcript no
    // longer depends on whatever subtitles the scraper happens to carry.
    'transcript' => [
        'actor_id' => env('VIRAL_VIDEO_ANALYSIS_TRANSCRIPT_ACTOR_ID', 'KPY6vqvcLx6P5Gy3U'),
        'use_whisper_fallback' => (bool) env('VIRAL_VIDEO_ANALYSIS_TRANSCRIPT_WHISPER_FALLBACK', false),
    ],

    'analysis' => [
        'model' => env('VIRAL_VIDEO_ANALYSIS_MODEL', 'gpt-4.1-mini'),
        'timeout' => (int) env('VIRAL_VIDEO_ANALYSIS_TIMEOUT', 60),
    ],

    'processing' => [
        'stale_after_minutes' => (int) env('VIRAL_VIDEO_ANALYSIS_STALE_AFTER_MINUTES', 20),
    ],

    // Exposes a "Regenerate" control on the analysis modal that forces a fresh
    // diagnostic + creative-strategy pass. Off by default so end users cannot
    // burn analysis credits re-running completed work.
    'allow_refresh' => (bool) env('VIRAL_VIDEO_ANALYSIS_REFRESH', false),
];
