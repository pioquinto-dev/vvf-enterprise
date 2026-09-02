<?php

return [
    'model' => env('SUPPORT_ASSISTANT_OPENAI_MODEL', 'gpt-4.1-mini'),
    'timeout' => (int) env('SUPPORT_ASSISTANT_TIMEOUT', 20),
    'session_attempts' => 2,
    'session_decay_seconds' => 60,
    'message_attempts' => 10,
    'message_decay_seconds' => 60,
];
