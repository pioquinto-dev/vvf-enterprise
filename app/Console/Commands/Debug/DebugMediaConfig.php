<?php

namespace App\Console\Commands\Debug;

use App\Services\Media\MediaArchiver;
use Illuminate\Console\Command;

/**
 * Step one of the media troubleshooting ladder: what did config actually
 * resolve to at runtime?
 *
 * Most "S3 is broken" reports are really "the env var is not where you think it
 * is" — a cached config, a missing value, a prefix with a stray slash. This
 * prints the resolved values and reports presence of secrets without ever
 * printing them.
 */
class DebugMediaConfig extends Command
{
    protected $signature = 'viral-videos:debug-media-config';

    protected $description = 'Print the resolved media storage configuration.';

    public function handle(MediaArchiver $archiver): int
    {
        $disk = $archiver->diskName();

        $this->info('Media archive configuration');

        $this->table(['Setting', 'Value'], [
            ['archive enabled', $archiver->enabled() ? 'yes' : 'no (VIRAL_VIDEOS_MEDIA_ARCHIVE_ENABLED)'],
            ['pipeline dispatch', config('custom_keyword_search.skip_media_archive') ? 'skipped (CUSTOM_KEYWORD_SEARCH_SKIP_MEDIA_ARCHIVE)' : 'active'],
            ['disk', $disk],
            ['prefix', $archiver->prefix()],
            ['queue', config('viral_videos.media.queue')],
            ['driver', config("filesystems.disks.{$disk}.driver") ?? '(disk not defined)'],
            ['bucket', config("filesystems.disks.{$disk}.bucket") ?: '(empty)'],
            ['region', config("filesystems.disks.{$disk}.region") ?: '(empty)'],
            ['endpoint', config("filesystems.disks.{$disk}.endpoint") ?: '(empty)'],
            ['url', config("filesystems.disks.{$disk}.url") ?: '(empty)'],
            ['path style', config("filesystems.disks.{$disk}.use_path_style_endpoint") ? 'true' : 'false'],
            ['resolved public base', $archiver->storageBaseUrl() ?? '(could not build a URL)'],
        ]);

        $this->newLine();
        $this->info('Credentials (presence only)');

        $this->table(['Env var', 'Set'], collect([
            'AWS_ACCESS_KEY_ID',
            'AWS_SECRET_ACCESS_KEY',
            'AWS_DEFAULT_REGION',
            'AWS_BUCKET',
            'AWS_URL',
            'AWS_ENDPOINT',
        ])->map(fn (string $key): array => [$key, filled(env($key)) ? 'yes' : 'NO'])->all());

        if (blank(config("filesystems.disks.{$disk}.url"))) {
            $this->warn('No disk `url` is set. Public URLs will be guessed from the endpoint and may not match what the browser can reach.');
        }

        return self::SUCCESS;
    }
}
