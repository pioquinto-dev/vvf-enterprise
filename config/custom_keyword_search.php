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

        /*
        | Rescue tiers. The phrase gate alone starves narrow searches — a
        | brand's own posts often caption with emoji, and topical videos often
        | use variants rather than the exact phrase. These recover both classes
        | with weaker-but-real evidence; rescued items take a score haircut so
        | they rank below phrase matches, never among them.
        */

        // Match the compacted phrase inside the creator's handle/display name.
        'handle_match_enabled' => filter_var(env('CUSTOM_KEYWORD_SEARCH_HANDLE_MATCH', true), FILTER_VALIDATE_BOOL),

        // Compacted phrases shorter than this never handle-match, so a
        // two-letter brand cannot claim half of TikTok.
        'handle_match_min_length' => (int) env('CUSTOM_KEYWORD_SEARCH_HANDLE_MATCH_MIN_LENGTH', 4),

        // Distinct supporting keywords required to rescue a phrase miss.
        // One is coincidence; several is the topic.
        'supporting_rescue_min' => (int) env('CUSTOM_KEYWORD_SEARCH_SUPPORTING_RESCUE_MIN', 2),

        // Score multiplier applied to rescued items.
        'rescue_score_multiplier' => (float) env('CUSTOM_KEYWORD_SEARCH_RESCUE_SCORE_MULTIPLIER', 0.65),

        // Max already-imported videos pooled into a run from the local corpus
        // before prescreen. 0 disables local recall entirely.
        'local_pool_limit' => (int) env('CUSTOM_KEYWORD_SEARCH_LOCAL_POOL_LIMIT', 400),

        // Recency: full bonus today, decaying to zero across this window.
        'recency_bonus' => 0.25,
        'recency_window_days' => 90,
    ],

    'analysis' => [
        // Creative classification (format / hook / angle) on the top results.
        'enabled' => filter_var(env('CUSTOM_KEYWORD_SEARCH_ANALYSIS_ENABLED', true), FILTER_VALIDATE_BOOL),

        // The one-line read at the top of a tracker page.
        'summary_enabled' => filter_var(env('CUSTOM_KEYWORD_SEARCH_SUMMARY_ENABLED', true), FILTER_VALIDATE_BOOL),

        'model' => env('CUSTOM_KEYWORD_SEARCH_ANALYSIS_MODEL', 'gpt-4.1-mini'),
        'timeout' => (int) env('CUSTOM_KEYWORD_SEARCH_ANALYSIS_TIMEOUT', 45),

        // How long the "which account is the brand" decision is memoised.
        // The detail page resolves the account on every render, so without a
        // cache this is a paid call per page view. The key includes the
        // candidate handles, so a run that surfaces new accounts re-asks
        // regardless of this TTL.
        'account_cache_seconds' => (int) env('CUSTOM_KEYWORD_SEARCH_ACCOUNT_CACHE_SECONDS', 604800),

        // Videos classified per run. The detail page only surfaces these fields
        // on the winner, so raising this buys labels nobody reads — it exists
        // for when the grid starts showing them too.
        'top_videos' => (int) env('CUSTOM_KEYWORD_SEARCH_ANALYSIS_TOP_VIDEOS', 10),
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
