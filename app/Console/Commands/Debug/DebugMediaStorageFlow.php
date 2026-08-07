<?php

namespace App\Console\Commands\Debug;

use App\Services\Media\MediaArchiver;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

/**
 * Step three: the whole framework path, one stage at a time.
 *
 * write -> url -> exists -> read back -> public HTTP fetch.
 *
 * The last stage is the one that catches the failure nobody expects: a bucket
 * that accepts writes but is not publicly readable. Everything server-side
 * looks perfect and every image in the browser is still broken, because the
 * frontend uses these URLs directly.
 */
class DebugMediaStorageFlow extends Command
{
    protected $signature = 'viral-videos:debug-media-storage-flow {--keep : Leave the probe object in place}';

    protected $description = 'Exercise write, URL, exists, read-back and public fetch against the media disk.';

    public function handle(MediaArchiver $archiver): int
    {
        $path = $archiver->prefix().'/_debug/flow-'.now()->timestamp.'.txt';
        $body = 'media archive storage probe '.now()->toIso8601String();
        $disk = $archiver->disk();
        $failed = false;

        $this->line("Disk: {$archiver->diskName()}");
        $this->line("Path: {$path}");
        $this->newLine();

        try {
            $written = $disk->put($path, $body, ['visibility' => 'public', 'ContentType' => 'text/plain']);
            $this->report('put()', $written !== false, $written === false ? 'returned false' : 'ok');
            $failed = $failed || $written === false;
        } catch (\Throwable $e) {
            $this->report('put()', false, $e->getMessage());

            return self::FAILURE;
        }

        $url = null;

        try {
            $url = $disk->url($path);
            $this->report('url()', filled($url), $url ?: 'empty');
        } catch (\Throwable $e) {
            $this->report('url()', false, $e->getMessage());
            $failed = true;
        }

        try {
            $exists = $disk->exists($path);
            $this->report('exists()', $exists, $exists ? 'ok' : 'object not found after a successful write');
            $failed = $failed || ! $exists;
        } catch (\Throwable $e) {
            $this->report('exists()', false, $e->getMessage());
            $failed = true;
        }

        try {
            $read = $disk->get($path);
            $matches = $read === $body;
            $this->report('get()', $matches, $matches ? 'ok' : 'read back different bytes than were written');
            $failed = $failed || ! $matches;
        } catch (\Throwable $e) {
            $this->report('get()', false, $e->getMessage());
            $failed = true;
        }

        if (filled($url)) {
            try {
                $response = Http::timeout(20)->get($url);
                $ok = $response->successful();
                $this->report('public GET', $ok, $ok ? 'ok' : 'HTTP '.$response->status().' — the bucket is not publicly readable');
                $failed = $failed || ! $ok;
            } catch (\Throwable $e) {
                $this->report('public GET', false, $e->getMessage());
                $failed = true;
            }
        }

        if (! $this->option('keep')) {
            try {
                $disk->delete($path);
            } catch (\Throwable) {
                $this->warn('Could not clean up the probe object.');
            }
        }

        $this->newLine();

        if ($failed) {
            $this->error('The media storage flow has a broken stage. Fix the first failure above and re-run.');

            return self::FAILURE;
        }

        $this->info('Every stage passed. Archiving can be enabled.');

        return self::SUCCESS;
    }

    private function report(string $stage, bool $ok, string $detail): void
    {
        $this->line(sprintf('  %s %-12s %s', $ok ? '<info>PASS</info>' : '<error>FAIL</error>', $stage, $detail));
    }
}
