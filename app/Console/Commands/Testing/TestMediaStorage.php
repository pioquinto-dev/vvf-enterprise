<?php

namespace App\Console\Commands\Testing;

use App\Services\Media\MediaArchiver;
use Illuminate\Console\Command;

/**
 * The one-line smoke test. Can this app write a file to the media disk, yes or
 * no? Use it after a deploy or an env change; reach for the debug commands only
 * when this says no.
 */
class TestMediaStorage extends Command
{
    protected $signature = 'viral-videos:test-media-storage';

    protected $description = 'Write and delete one object on the media disk.';

    public function handle(MediaArchiver $archiver): int
    {
        $path = $archiver->prefix().'/_debug/smoke-'.now()->timestamp.'.txt';

        try {
            $written = $archiver->disk()->put($path, 'ok', ['visibility' => 'public', 'ContentType' => 'text/plain']);

            if ($written === false) {
                $this->error("Write to `{$archiver->diskName()}` was rejected.");

                return self::FAILURE;
            }

            $this->info("Wrote {$path} to `{$archiver->diskName()}`.");
            $this->line('URL: '.$archiver->disk()->url($path));

            $archiver->disk()->delete($path);

            return self::SUCCESS;
        } catch (\Throwable $e) {
            $this->error('Write failed: '.$e->getMessage());

            return self::FAILURE;
        }
    }
}
