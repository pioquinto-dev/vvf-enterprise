# AI Agent Guide

## Local development commands

### `composer setup` — first-time clone setup
Run once after cloning the repo. Installs PHP dependencies, creates `.env` from `.env.example` if it doesn't exist, generates the app key, and runs all migrations.

```bash
composer setup
```

Fill in any required values in `.env` (database credentials, `APIFY_TOKEN`, Stripe keys, etc.) before starting the server.

### `composer dev` — start the full dev environment
Starts all local processes needed for day-to-day development. Requires **ngrok** to be installed and authenticated (`ngrok config add-authtoken <token>`).

```bash
composer dev
```

What it does:
1. Launches an ngrok HTTPS tunnel on port 8000 and reads the public URL from the ngrok local API.
2. Writes that URL into `APP_URL` in `.env` and clears the config cache.
3. Prints the browser URL — copy it and open it directly.
4. Runs `npm run build` to compile frontend assets.
5. Signals any previously running queue workers to restart via `php artisan queue:restart`.

All processes are colour-coded. Ctrl-C stops everything. The script lives in `bin/dev.js`.

**Prerequisites:** Node/npm (for `concurrently`), ngrok CLI. Works natively on Windows, macOS, and Linux — no Git Bash or WSL required.

This project is a Laravel 13 app for collecting, browsing, and exporting viral TikTok research data imported from Apify.

Operational updates to keep in mind:
- The admin dashboard now includes a live Infrastructure Cost Tracker for `APIFY`, `Scrape Creators`, and `Laravel Cloud`.
- Manual provider budget/spend overrides are stored in `admin_manual_budget_overrides` and can override the live display when newer than the latest automated run.
- TikTok Shop scheduled automation uses `viral-videos:prepare-tiktok-shop-import-roster`, `viral-videos:run-tiktok-shop-import-schedule`, and the nightly `scrape-creators:backfill-trigger-costs --mark-complete` recovery pass.
- Apify cost recovery also has a scheduled `apify:backfill-trigger-costs --mark-complete` pass.

## Directory map

### `app/Console/Commands`
- Home for Artisan command classes.
- Commands are organized by purpose:
  - `Scheduled/` for recurring scheduler-driven commands.
  - `OneTime/` for manual backfills, cleanup, and repair operations.
  - `Debug/` for diagnostics and storage probes.
  - `Testing/` for manual smoke-test commands.

### `app/Http/Controllers`
- Web request entrypoints.

### `app/Repositories`
- Repository layer for application data access.

### `app/Services/Apify`
- Integration layer for Apify.

### `app/Services/Creator/Dashboard`
- Server-side dashboard pipeline classes.

### `app/Services/Media`
- Media durability layer for copying Apify-hosted assets into object storage.

### `app/Http/Middleware`
- `CaptureUtmParameters.php` reads UTM query params from every web request and stores them in the session under `utm_params`. Runs on the web middleware group. Only overwrites the session when new UTM params are present on the current request.
- `EnsurePaidFeaturesAccess.php` gates routes behind an active paid subscription.
- `RememberTrialCheckoutIntent.php` detects the `?redirect=trial_checkout` query param on guest hits to the trial route and stores a pending billing intent in the session so the checkout can resume after login or registration.

### `app/Services/Stripe`
- `StripeWebhookProcessor.php` handles all incoming Stripe events: `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`, and `customer.subscription.*`. On successful checkout it also creates a `utm_attributions` row (subscription row, `subscription_id` filled) copied from the user's signup attribution.
- `StripeClient.php` wraps raw Stripe API calls (checkout sessions, billing portal, subscription retrieval).

### `app/Models`
- Eloquent models for persisted data.

### `resources/views`
- Blade UI templates.

### `resources/css` and `resources/js`
- Frontend entry files compiled by Vite.
- `app.css` contains shared Tailwind-driven styling and theme rules.
- `app.js` is intentionally light; theme toggling currently runs from the Blade layouts.

### `config`
- Central configuration.
- `services.php` is the main integration registry:
  - `apify` stores task IDs, run IDs, polling, schedule, and task-category mappings.
  - `viral_videos` stores media/archive disks, queue names, Instagram cache TTL, analysis model/queue settings, transcript/comments actor IDs, analysis freshness windows, and ffmpeg path.
  - `cache_ttl` stores plan/dashboard/admin cache TTLs, including `analysis_history_count_seconds` (env `ANALYSIS_HISTORY_COUNT_CACHE_TTL_SECONDS`, default 60).
- `features.php` currently exposes `bypass_paid_features`, `faq_chat`, and `show_onboarding`.
- `rate_limits.php` defines named throttles for playback, analysis requests, creative actions, analysis polling, exports, onboarding, FAQ chat, billing, bookmarks, and suggestions.

### `database`
- Migrations, seeders, and factories.
- Check migrations first before changing persisted fields used by imports or the dashboard.

### `tests`
- Feature coverage for authentication and profile flows.
- Add dashboard or import tests here when changing query logic, gating, or import behavior.

## Environment variables to know

- `APP_URL`
- `DB_*`
- `USE_TIKTOK_SCRAPING_SERVICE`
- `USE_SHORT_FORM_SCRAPING_SERVICE`
- `HTTP_TIMEOUT`
- `HTTP_RETRY_TIMES`
- `APIFY_TOKEN`
- `APIFY_TASK_IDS`
- `APIFY_TIMEOUT`
- `APIFY_POLL_SECONDS`
- `APIFY_RUN_TIMEOUT_SECONDS`
- `VIRAL_VIDEO_SCHEDULE_TIME`
- `VIRAL_VIDEO_SCHEDULE_TIMEZONE`
- `VIRAL_VIDEOS_MEDIA_DISK`
- `VIRAL_VIDEOS_ANALYSIS_DISK`
- `VIRAL_VIDEOS_MEDIA_PREFIX`
- `VIRAL_VIDEOS_PREPARATION_QUEUE`
- `VIRAL_VIDEOS_ANALYSIS_REFRESH_MAX_AGE_SECONDS`
- `BYPASS_PAID_FEATURES`

## Sensitive files

Agents should treat the following as protected unless the user explicitly requests changes:

- `.env`
- `.env.testing`
- `.env.example`
- any file containing secrets, credentials, API tokens, or machine-local configuration
