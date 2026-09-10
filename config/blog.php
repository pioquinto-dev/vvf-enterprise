<?php

return [
    'disk' => env('BLOG_MEDIA_DISK', env('AWS_BUCKET') ? 's3' : 'public'),
    'prefix' => env('BLOG_MEDIA_PREFIX', 'blogs'),
    'author' => 'Brand Beacon Research Team',
];
