<?php

return [
    'bypass_paid_features' => (bool) env('BYPASS_PAID_FEATURES', false),
    'faq_chat' => (bool) env('FEATURE_FAQ_CHAT', false),
    'show_onboarding' => (bool) env('FEATURE_SHOW_ONBOARDING', false),
];
