<?php

return [
    'sender' => [
        'name' => env('BREVO_SENDER_NAME', config('app.name', 'BrandBeacon')),
        'email' => env('BREVO_SENDER_EMAIL', config('mail.from.address', 'hello@example.com')),
    ],
    'logo_url' => env('BREVO_LOGO_URL', rtrim((string) config('app.url'), '/').'/brand-beacon-logo.png'),
    'search_done_enabled' => env('BREVO_SEARCH_DONE_ENABLED', env('APP_ENV', 'production') !== 'local'),

    'notifications' => [
        'new_registration' => [
            'subject' => 'Your account is ready. Let’s find your next winning creative.',
            'template_id' => env('BREVO_TEMPLATE_ID_NEW_REGISTRATION'),
            'tags' => ['registration', 'lifecycle'],
        ],
        'subscription_started' => [
            'subject' => 'Your plan is live. Here’s what you can do now.',
            'template_id' => env('BREVO_TEMPLATE_ID_SUBSCRIPTION_STARTED'),
            'tags' => ['subscription', 'billing'],
        ],
        'subscription_canceled' => [
            'subject' => 'Your plan has been canceled',
            'template_id' => env('BREVO_TEMPLATE_ID_SUBSCRIPTION_CANCELED'),
            'tags' => ['subscription', 'cancellation'],
        ],
        'verify_email_manual_account' => [
            'subject' => 'Verify your email to activate your account',
            'template_id' => env('BREVO_TEMPLATE_ID_VERIFY_EMAIL_MANUAL_ACCOUNT'),
            'tags' => ['verification', 'account'],
        ],
        'trial_ending' => [
            'subject' => 'Your trial is ending soon',
            'template_id' => env('BREVO_TEMPLATE_ID_TRIAL_ENDING'),
            'tags' => ['trial', 'billing'],
        ],
        'final_failed_payment' => [
            'subject' => 'Your paid access is ending due to a final payment failure',
            'template_id' => env('BREVO_TEMPLATE_ID_FINAL_FAILED_PAYMENT'),
            'tags' => ['billing', 'payment-failed', 'downgrade'],
        ],
        'no_cc_trial_ending' => [
            'subject' => 'Add your card to keep paid access after your trial',
            'template_id' => env('BREVO_TEMPLATE_ID_NO_CC_TRIAL_ENDING'),
            'tags' => ['trial', 'billing', 'payment-method'],
        ],
        'search_done' => [
            'subject' => 'Your search is ready',
            'template_id' => env('BREVO_TEMPLATE_ID_SEARCH_DONE'),
            'tags' => ['search', 'results'],
        ],
    ],
];
