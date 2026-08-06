<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Custom Keyword Search
    |--------------------------------------------------------------------------
    |
    | A saved search takes one phrase, expands it into supporting keywords,
    | scrapes broadly on the phrase alone, then filters and ranks locally
    | against the full keyword set. Remote scrape is tuned for recall, the
    | local matcher for precision — keep that split when changing these.
    |
    */

    'limits' => [
        // Keywords stored per saved search (the phrase counts as one).
        'max_keywords' => 12,
        'max_phrase_length' => 120,
        'max_name_length' => 80,

        // Results attached to a saved search after ranking.
        'max_results' => (int) env('CUSTOM_KEYWORD_SEARCH_MAX_RESULTS', 100),

        // Saved searches a paying user may keep.
        'max_saved_paid' => (int) env('CUSTOM_KEYWORD_SEARCH_MAX_PAID', 100),

        // Saved searches a signed-out visitor may create per session.
        'max_saved_guest' => (int) env('CUSTOM_KEYWORD_SEARCH_MAX_GUEST', 1),
    ],

    'expansion' => [
        'model' => env('CUSTOM_KEYWORD_SEARCH_OPENAI_MODEL', 'gpt-4.1-mini'),
        'suggestions' => 6,
        'candidate_pool' => (int) env('CUSTOM_KEYWORD_SEARCH_EXPANSION_CANDIDATE_POOL', 12),
        'min_relevance' => (float) env('CUSTOM_KEYWORD_SEARCH_EXPANSION_MIN_RELEVANCE', 0.55),
        'cache_seconds' => (int) env('CUSTOM_KEYWORD_SEARCH_EXPANSION_CACHE_SECONDS', 86400),
        'timeout' => (int) env('CUSTOM_KEYWORD_SEARCH_EXPANSION_TIMEOUT', 20),
    ],

    'scrape' => [
        'task_id' => env('CUSTOM_KEYWORD_SEARCH_APIFY_TASK_ID'),
        'location' => env('CUSTOM_KEYWORD_SEARCH_LOCATION', 'US'),
        'date_range' => env('CUSTOM_KEYWORD_SEARCH_DATE_RANGE', 'ALL_TIME'),
        'sort_type' => env('CUSTOM_KEYWORD_SEARCH_SORT_TYPE', 'MOST_LIKED'),
        'max_items' => (int) env('CUSTOM_KEYWORD_SEARCH_MAX_ITEMS', 100),

        // Poll the Apify run until it reaches a terminal state.
        'poll_seconds' => (int) env('CUSTOM_KEYWORD_SEARCH_POLL_SECONDS', 10),
        'run_timeout_seconds' => (int) env('CUSTOM_KEYWORD_SEARCH_RUN_TIMEOUT_SECONDS', 900),

        // A run stuck in `running` past this is treated as stale.
        'stale_after_minutes' => (int) env('CUSTOM_KEYWORD_SEARCH_STALE_AFTER_MINUTES', 30),
    ],

    'matching' => [
        // Creator-quality floor. Items below this are dropped in prescreen.
        'min_followers' => (int) env('CUSTOM_KEYWORD_SEARCH_MIN_FOLLOWERS', 500),

        // Followers denominator floor, so tiny accounts cannot inflate score.
        'virality_follower_floor' => 1000,

        // Score weights, applied to per-follower rates.
        'weights' => [
            'views' => 1.0,
            'likes' => 3.0,
            'comments' => 8.0,
        ],

        // Each supporting keyword that matches adds this much to the score.
        'supporting_keyword_bonus' => 0.05,

        // Recency: full bonus today, decaying to zero across this window.
        'recency_bonus' => 0.25,
        'recency_window_days' => 90,
    ],

    'schedule' => [
        'time' => env('CUSTOM_KEYWORD_SEARCH_SCHEDULE_TIME', '19:00'),
        'timezone' => env('CUSTOM_KEYWORD_SEARCH_SCHEDULE_TIMEZONE', 'America/New_York'),

        // Saved searches dispatched per scheduler tick.
        'batch_size' => (int) env('CUSTOM_KEYWORD_SEARCH_SCHEDULE_BATCH', 25),
    ],

    'queue' => env('CUSTOM_KEYWORD_SEARCH_QUEUE', 'default'),

    'skip_media_archive' => filter_var(
        env('CUSTOM_KEYWORD_SEARCH_SKIP_MEDIA_ARCHIVE', true),
        FILTER_VALIDATE_BOOL
    ),

];
