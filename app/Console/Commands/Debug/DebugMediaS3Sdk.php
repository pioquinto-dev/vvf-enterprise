<?php

namespace App\Console\Commands\Debug;

use Aws\S3\S3Client;
use Illuminate\Console\Command;

/**
 * Step two: does the provider accept a write at all?
 *
 * This deliberately bypasses Laravel's filesystem abstraction and talks to the
 * SDK directly. If this succeeds and the framework command fails, the problem
 * is in the disk config or Flysystem adapter. If this fails too, it is
 * credentials, region, endpoint or bucket policy — and the raw SDK error is far
 * more informative than the boolean `put()` returns.
 */
class DebugMediaS3Sdk extends Command
{
    protected $signature = 'viral-videos:debug-media-s3-sdk';

    protected $description = 'Write a test object using the AWS SDK directly, bypassing Laravel storage.';

    public function handle(): int
    {
        if (! class_exists(S3Client::class)) {
            $this->error('The AWS SDK is not installed. Run: composer require league/flysystem-aws-s3-v3');

            return self::FAILURE;
        }

        $disk = (string) config('viral_videos.media.disk', 's3');
        $config = (array) config("filesystems.disks.{$disk}");
        $bucket = (string) ($config['bucket'] ?? '');

        if ($bucket === '') {
            $this->error("Disk `{$disk}` has no bucket configured.");

            return self::FAILURE;
        }

        $key = trim((string) config('viral_videos.media.prefix'), '/').'/_debug/sdk-'.now()->timestamp.'.txt';

        try {
            $client = new S3Client(array_filter([
                'version' => 'latest',
                'region' => $config['region'] ?? null,
                'endpoint' => $config['endpoint'] ?? null,
                'use_path_style_endpoint' => (bool) ($config['use_path_style_endpoint'] ?? false),
                'credentials' => [
                    'key' => $config['key'] ?? null,
                    'secret' => $config['secret'] ?? null,
                ],
            ]));

            $result = $client->putObject([
                'Bucket' => $bucket,
                'Key' => $key,
                'Body' => 'media archive sdk probe',
                'ContentType' => 'text/plain',
            ]);

            $this->info('putObject succeeded.');
            $this->line('  bucket: '.$bucket);
            $this->line('  key:    '.$key);
            $this->line('  url:    '.($result['ObjectURL'] ?? '(none reported)'));

            return self::SUCCESS;
        } catch (\Throwable $e) {
            $this->error('putObject failed: '.$e->getMessage());

            return self::FAILURE;
        }
    }
}
