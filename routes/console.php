<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

/*
 * Saved search refreshes. The dispatcher runs hourly rather than once a day so
 * a search created at any hour refreshes near its own anniversary time; the
 * next_run_at check is what actually gates the work.
 */
Schedule::command('custom-keyword-search:dispatch-due')
    ->hourly()
    ->withoutOverlapping()
    ->runInBackground();

Schedule::command('custom-keyword-search:fail-stale-runs')
    ->everyFifteenMinutes()
    ->withoutOverlapping();

/*
 * Admin dashboard daily snapshot. Pinned to UTC so the series is one row per
 * UTC day regardless of the app timezone; the admin UI reads it back as-is.
 */
Schedule::command('admin:capture-dashboard-snapshot')
    ->dailyAt('06:00')
    ->timezone('UTC')
    ->withoutOverlapping()
    ->runInBackground();

Schedule::command('users:process-pending-account-deletions')
    ->hourly()
    ->withoutOverlapping()
    ->runInBackground();

Schedule::command('brevo:send-trial-ending-emails')
    ->dailyAt('09:00')
    ->withoutOverlapping()
    ->runInBackground();

Schedule::command('viral-videos:repair-tiktok-cdn-media --limit=200 --chunk_by=25')
    ->dailyAt('10:30')
    ->timezone('America/New_York')
    ->withoutOverlapping()
    ->runInBackground();

Schedule::command('viral-videos:repair-tiktok-cdn-media --limit=200 --chunk_by=25')
    ->dailyAt('16:30')
    ->timezone('America/New_York')
    ->withoutOverlapping()
    ->runInBackground();
