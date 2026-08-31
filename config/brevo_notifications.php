<?php

return [
    'sender' => [
        'name' => env('BREVO_SENDER_NAME', config('app.name', 'BrandBeacon')),
        'email' => env('BREVO_SENDER_EMAIL', config('mail.from.address', 'hello@example.com')),
    ],
    'logo_url' => env('BREVO_LOGO_URL', rtrim((string) config('app.url'), '/').'/brand-beacon-logo.png'),

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
    ],
];
