<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'apify' => [
        'base_url' => env('APIFY_BASE_URL', 'https://api.apify.com/v2'),
        'proxy' => env('APIFY_PROXY'),
        'token' => env('APIFY_TOKEN'),
        'default_actor' => env('APIFY_DEFAULT_ACTOR'),
    ],

    'openai' => [
        'base_url' => env('OPENAI_BASE_URL', 'https://api.openai.com/v1'),
        'api_key' => env('OPENAI_API_KEY'),
    ],

    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'redirect' => env('GOOGLE_REDIRECT_URI'),
    ],

    'analytics' => [
        'enabled' => env('ANALYTICS_ENABLED', false),
        'gtm_container_id' => env('GTM_CONTAINER_ID'),
        'ga4_measurement_id' => env('GA4_MEASUREMENT_ID'),
        'debug_mode' => env('ANALYTICS_DEBUG_MODE', false),
    ],

    'stripe' => [
        'key' => env('STRIPE_KEY'),
        'secret' => env('STRIPE_SECRET'),
        'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),
    ],

    'brevo' => [
        'api_key' => env('BREVO_API_KEY'),
        'test_recipient_email' => env('BREVO_TEST_RECIPIENT_EMAIL'),
        'proxy' => env('BREVO_PROXY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

];
