# Scheduled And Data Correction Commands

## Purpose

This document covers the operational Artisan commands that either run on a schedule or are used to repair, backfill, migrate, archive, or otherwise correct persisted data.

Use this as the quick reference before running anything that can change search, billing, media, analytics, or account state.

## Scheduled commands

These commands are currently wired in `routes/console.php`.

### `custom-keyword-search:dispatch-due`

Purpose:
Queue refresh runs for saved searches whose `next_run_at` is due.

Schedule:
- hourly
- `withoutOverlapping()`
- `runInBackground()`

Options:
- `--limit=` overrides the configured batch size

Important behavior:
- only searches in `done` or `failed` status are considered
- searches with an active queued or running run are skipped
- dispatch order follows earliest `next_run_at` first

Typical use:

```bash
php artisan custom-keyword-search:dispatch-due
php artisan custom-keyword-search:dispatch-due --limit=10
```

### `custom-keyword-search:fail-stale-runs`

Purpose:
Mark saved-search runs as failed when they have exceeded the configured stale threshold.

Schedule:
- every 15 minutes
- `withoutOverlapping()`

Important behavior:
- stale threshold comes from `custom_keyword_search.scrape.stale_after_minutes`
- searches with existing results stay usable and are returned to `done`
- searches with no results become `failed`

Typical use:

```bash
php artisan custom-keyword-search:fail-stale-runs
```

### `admin:capture-dashboard-snapshot`

Purpose:
Capture the daily admin snapshot for subscriptions, signups, and content counts.

Schedule:
- daily at `06:00`
- timezone `UTC`
- `withoutOverlapping()`
- `runInBackground()`

Important behavior:
- snapshot timing is pinned to UTC
- acquisition attribution is not driven by this snapshot

Typical use:

```bash
php artisan admin:capture-dashboard-snapshot
```

### `users:process-pending-account-deletions`

Purpose:
Soft delete users whose account-deletion grace period has expired.

Schedule:
- hourly
- `withoutOverlapping()`
- `runInBackground()`

Important behavior:
- users with active subscriptions are skipped
- skipped users have deletion request fields cleared
- successful deletions record an `account_deleted` activity event

Typical use:

```bash
php artisan users:process-pending-account-deletions
```

### `brevo:send-trial-ending-emails`

Purpose:
Send trial-ending reminder emails for trial subscriptions nearing expiration.

Schedule:
- daily at `09:00`
- `withoutOverlapping()`
- `runInBackground()`

Important behavior:
- current implementation sends only at 3 days remaining
- sent markers are stored in subscription metadata to avoid duplicates
- only `trialing` or `trial` subscriptions with `trial_ends_at` are considered

Typical use:

```bash
php artisan brevo:send-trial-ending-emails
```

### `viral-videos:repair-tiktok-cdn-media --limit=200 --chunk_by=25`

Purpose:
Repair canonical `viral_videos` rows that still point at TikTok CDN media instead of durable archived assets.

Schedule:
- daily at `10:30` America/New_York
- daily at `16:30` America/New_York
- `withoutOverlapping()`
- `runInBackground()`

Important behavior:
- the scheduled form dispatches repair work in bounded batches
- media archiving must be enabled or the command fails

## Data correction and repair commands

These commands mutate or rebuild persisted state. Prefer dry runs when available.

### `custom-keyword-search:repair-completed-analytics`

Purpose:
Rebuild snapshots for completed searches without triggering a fresh scrape.

Options:
- `--search_id=` repairs one `custom_keyword_searches.id`
- `--limit=0` limits how many searches are processed

Important behavior:
- only completed searches with videos are considered
- the command uses the latest completed run it can find
- searches with no usable completed run are skipped

Typical use:

```bash
php artisan custom-keyword-search:repair-completed-analytics
php artisan custom-keyword-search:repair-completed-analytics --search_id=123
php artisan custom-keyword-search:repair-completed-analytics --limit=50
```

### `billing:backfill-video-analysis-usage`

Purpose:
Backfill subscription `video_analysis.used` metadata from completed analyses.

Arguments and options:
- optional `user` argument accepts user id or email
- `--dry-run` previews changes without saving

Important behavior:
- operates on subscription metadata, not analysis rows
- skips users without a subscription
- useful after logic changes or data drift in usage counters

Typical use:

```bash
php artisan billing:backfill-video-analysis-usage --dry-run
php artisan billing:backfill-video-analysis-usage
php artisan billing:backfill-video-analysis-usage 42
php artisan billing:backfill-video-analysis-usage user@example.com
```

### `viral-videos:repair-tiktok-cdn-media`

Purpose:
Repair stale TikTok CDN media references by dispatching repair jobs or running inline.

Options:
- `--dry-run`
- `--limit=100`
- `--chunk_by=25`
- `--batch_count=`
- `--queue=`
- `--sync`

Important behavior:
- `--dry-run` shows scope without changing rows
- default mode dispatches jobs and records a batch key
- `--sync` processes records inline
- updates may include archived asset fields and refreshed engagement metrics

Typical use:

```bash
php artisan viral-videos:repair-tiktok-cdn-media --dry-run
php artisan viral-videos:repair-tiktok-cdn-media --limit=200 --chunk_by=25
php artisan viral-videos:repair-tiktok-cdn-media --limit=50 --sync
```

## Other one-time correction commands in the repo

These are present under `app/Console/Commands/OneTime` and should be treated as targeted operational tools:

- `users:backfill-preferences`
- `viral-videos:archive-media-from-trigger`
- `searches:migrate-competitor-to-brand`
- `dev:seed-product-searches`

Read the command class before running them in production-like environments, especially for migration or archival actions.

## Debug and diagnostic commands often used alongside corrections

These are not the scheduler itself, but they are useful before or after repair work:

- `billing:debug-video-analysis`
- `viral-videos:debug-media-config`
- `viral-videos:debug-media-s3-sdk`
- `viral-videos:debug-media-storage-flow`
- `viral-videos:test-media-storage`
- `search:enrich`

## Safety guidance

- Prefer a dry run first when the command supports it.
- Use scoped options like `--limit`, `--search_id`, or a specific user whenever possible.
- Do not run one-time migration or correction commands casually on production data.
- For search-related fixes, remember that a fresh scrape can consume credits, but snapshot and analytics rebuilds should not.
- For billing fixes, keep webhook-driven truth and subscription metadata synchronization aligned.
