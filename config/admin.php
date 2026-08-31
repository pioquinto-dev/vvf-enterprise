<?php

return [
    'session_key' => env('ADMIN_SESSION_KEY', 'admin.authenticated'),
    'root_name' => env('ADMIN_ROOT_NAME', 'Root Admin'),
    'root_email' => env('ADMIN_ROOT_EMAIL'),
    'root_password' => env('ADMIN_ROOT_PASSWORD'),
];
