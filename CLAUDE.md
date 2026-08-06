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
- `SavedSearchController.php` is the whole custom keyword search API: expand, create, poll, detail, pause/resume, frequency, refresh, delete.

### Custom keyword search
The product's core loop. One phrase becomes a saved, self-refreshing list of viral videos.

- **The split that matters:** the Apify scrape is sent *only the primary phrase* (broad, cheap, high recall). The full keyword set is applied locally afterwards for precision. Sending every keyword as a remote filter is what starves these searches of results — do not "optimize" that away.
- `app/Services/CustomKeywordSearch/` holds the pipeline: `KeywordNormalizer` (trim/dedupe/cap/signature), `KeywordExpansionService` (OpenAI with a template fallback, cached), `TikTokItemMapper` (tolerant field mapping across Apify actor shapes), `KeywordMatcher` (prescreen + score + rank), `SearchRunProcessor` (one scrape attempt end to end), `SavedSearchManager` (create/dedupe/pause/resume/delete).
- `app/Services/Apify/ApifyClient.php` is a thin REST wrapper — start task run, poll, read dataset. No domain logic.
- Searches dedupe on `keyword_signature` (sorted, lowercased keywords), not name or phrase, so the same set in a different order reuses the existing search.
- Keywords are fixed after creation by design. Name and frequency stay editable.
- A failed refresh on a search that already has results leaves the search `done` and only the run `failed` — an established search should never look broken because one refresh died.
- Guests get a `guest_token` in session so the free search works before sign-in; `AppServiceProvider` claims those rows on the `Login` event.
- Scheduled: `custom-keyword-search:dispatch-due` (hourly) and `custom-keyword-search:fail-stale-runs` (every 15 min). Runs need a queue worker — `php artisan queue:work`.

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
- `app.css` contains shared Tailwind v4 styling. The `@theme` block holds the landing palette (`accent`, `hot`, `ink`, `canvas`), the display/body font tokens, the `max-w-page` container, and the marquee/fade keyframes. `@custom-variant dark (&:where(.dark, .dark *))` makes dark mode class-driven rather than OS-driven.
- Landing component classes (`btn-accent`, `btn-ghost`, `field`, `muted`, `faint`, `eyebrow`, `section-title`) live in `@layer components`. Tailwind v4 cannot `@apply` one component class inside another, so each is self-contained — do not refactor them to share a base class.
- `app.jsx` is the Inertia entry. Theme is applied pre-paint by an inline script in `resources/views/app.blade.php` reading `localStorage['vvf-theme']`.

### `resources/js/landing`
- Marketing landing page components, rendered by `resources/js/Pages/Landing.jsx` at route `/` (named `landing`).
- `data/dummy.js` holds every piece of copy, pricing tier, testimonial, FAQ, and fake video on the page. It is all placeholder data — replace these exports with real sources and the components need no changes.
- `flow/` is the custom search flow. Each step is a real page, not a modal: `SearchShell.jsx` is the shared page chrome, `screens/` holds the four step components, `searchQuery.js` builds and parses the query string that carries state between steps, `VideoCard.jsx` renders results. Step one lives inline in `sections/Hero.jsx`.
- Flow routes are `/search` (keywords), `/search/running`, `/search/results`, and `/trial`, all defined in `routes/web.php`. State travels in the query string — `type`, `q` (subject), and `kw` (pipe-separated keywords) — so results are shareable and the browser back button works. Nothing is stored server-side.
- The legacy Laravel/React starter page is still available at `/starter` (named `home`); `GoogleAuthController` redirects there after sign-in.
- `landing-mvp/` at the repo root is the original standalone Vite prototype this was ported from, kept for reference. `resources/js/landing` is the source of truth.

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
