# Agent Guide

Central reference for AI coding agents working in this repository, including ChatGPT, Claude, Codex, Cursor, and similar tools. This file is the source of truth for project-specific behavior, command discovery, domain rules, and high-risk logic. Keep this document current when the architecture or operational workflows change.

## Project overview

- App type: Laravel 13 + Inertia + React + Vite.
- Product: viral-video research and tracking platform centered on TikTok discovery, saved searches, watchlists, paid subscriptions, and AI-assisted analysis.
- Primary external systems: Apify, Stripe, Brevo, object storage, Google auth.
- Main product split:
  - Marketing + public search flow lives in `resources/js/landing` and `routes/public.php`.
  - Authenticated app experience lives in `resources/js/Pages` and `routes/frontend.php`.
  - JSON APIs live in `routes/v1.php`.
  - Admin lives in `routes/admin.php`.

## First things to read

When starting non-trivial work, review these first:

- `routes/public.php`
- `routes/frontend.php`
- `routes/v1.php`
- `app/Http/Controllers/SavedSearchController.php`
- `app/Services/CustomKeywordSearch/`
- `app/Services/Billing/`
- `app/Services/Stripe/`
- `app/Services/Utm/`
- `bootstrap/app.php`
- `database/migrations/`

## Local development commands

### Setup and app runtime

#### `composer setup`

First-time project bootstrap.

```bash
composer setup
```

What it does:

1. Installs PHP dependencies.
2. Creates `.env` from `.env.example` if needed.
3. Generates the app key.
4. Runs migrations.

#### `composer dev`

Primary local development entrypoint.

```bash
composer dev
```

What it does:

1. Starts the local app stack.
2. Opens an ngrok-backed HTTPS workflow for local callback compatibility.
3. Updates `APP_URL` in `.env`.
4. Builds frontend assets.
5. Restarts queue workers if already running.

Notes:

- Requires ngrok to be installed and authenticated.
- On Windows it also opens helper consoles for Stripe forwarding, queue/server logs, and formatted error tails.

### Testing and diagnostics

#### `php artisan test`

Run all automated tests.

```bash
php artisan test
```

Use focused runs while iterating:

```bash
php artisan test tests/Feature/AuthRegistrationBrevoTest.php
php artisan test tests/Unit/StripeWebhookProcessorBrevoTest.php
```

Important:

- Current test setup expects SQLite support. If tests fail with `could not find driver`, PHP is missing the SQLite driver.

#### `php artisan pail`

Tail Laravel logs during request debugging.

#### `php artisan route:list`

Inspect registered routes and middleware.

#### `php artisan schedule:list`

Inspect scheduler entries.

#### `php artisan queue:work`

Required for queued flows like saved-search refreshes, media archiving, and video-analysis jobs.

### Domain-specific Artisan commands

#### Saved search scheduling

- `php artisan custom-keyword-search:dispatch-due`
  - Queues refresh runs for searches whose `next_run_at` is due.
- `php artisan custom-keyword-search:fail-stale-runs`
  - Marks overlong running search jobs as failed.

#### Admin and snapshots

- `php artisan admin:capture-dashboard-snapshot`
  - Stores an admin snapshot for subscriptions, signups, and content counts.

#### Billing and subscription diagnostics

- `php artisan billing:backfill-video-analysis-usage`
  - Backfills video-analysis usage into subscription metadata.
- `php artisan billing:debug-video-analysis`
  - Prints subscription rows and analysis usage for a user.

#### Brevo

- `php artisan brevo:send-trial-ending-emails`
  - Sends trial-ending reminders.
- `php artisan testing:send-brevo-email`
  - Sends a transactional test email to the configured test inbox.

#### User maintenance

- `php artisan users:backfill-preferences`
  - Adds default preferences for legacy users.
- `php artisan users:process-pending-account-deletions`
  - Soft deletes accounts whose grace window has elapsed.

#### Dev/demo data

- `php artisan dev:seed-product-searches`
  - Seeds dummy product-search data for UI inspection.

#### Media storage diagnostics

- `php artisan viral-videos:debug-media-config`
  - Prints resolved media storage config.
- `php artisan viral-videos:debug-media-s3-sdk`
  - Direct AWS SDK write test, bypassing Laravel storage.
- `php artisan viral-videos:debug-media-storage-flow`
  - Full write, exists, read-back, URL, and public-fetch check.
- `php artisan viral-videos:test-media-storage`
  - Simple smoke test for write/delete.
- `php artisan viral-videos:archive-media-from-trigger`
  - Queues media archiving for all videos under an Apify trigger.

### Migrations and reset commands

Use carefully:

- `php artisan migrate`
- `php artisan migrate:status`
- `php artisan migrate:rollback`
- `php artisan migrate:fresh`

Warnings:

- `migrate:fresh`, `db:wipe`, and broad reset commands are destructive.
- Do not run destructive commands unless the user explicitly wants a reset.

## Route map

### Public web routes

Defined in `routes/public.php`.

- `/`
  - Marketing landing page.
- `/search`
  - Standalone public free-search funnel. It collects the subject and refinements without creating a search; the Google callback creates the account-owned search after sign-in.
- `/search/running`
  - Public running-state view.
- `/trial`
  - Trial plan page, with middleware that remembers checkout intent.
- `/login`, `/register`
  - Guest auth.
- `/auth/google`, `/auth/google/callback`
  - Google auth.
- `/billing/checkout/{slug}`
  - Starts Stripe checkout.
- `/billing/success`
  - Post-checkout success landing.
- `/stripe/webhook`
  - Stripe webhook receiver.
- `/contact`
  - Inquiry form.
- `/coming-soon-interest`
  - Coming-soon lead capture.

### Authenticated app routes

Defined in `routes/frontend.php`.

- `/dashboard`
  - Main signed-in dashboard.
- `/bookmark`
  - Watchlist index.
- `/results/{search}`
  - Saved-search detail page.
- `/results/{search}/export/pdf`
  - Search export.
- `/brands`
  - Brand-oriented view over saved-search data.
- `/products`
  - Product-oriented view over saved-search data.
- `/settings/account`
  - Account settings and deletion flow.
- `/settings/appearance`
  - Appearance preferences.
- `/settings/subscription`
  - Subscription management view.
- `/plans`
  - Plan selection page for signed-in users.
- `/videos/{id}/analysis`
  - Video-analysis page.

### JSON API routes

Defined in `routes/v1.php`.

#### Saved-search APIs

- `POST /api/v1/saved-searches/expand`
- `GET /api/v1/saved-searches/notifications`
- `POST /api/v1/saved-searches`
- `GET /api/v1/saved-searches/{id}/json`
- `PATCH /api/v1/saved-searches/{id}/bookmark`
- `PATCH /api/v1/saved-searches/{id}/pause`
- `PATCH /api/v1/saved-searches/{id}/resume`
- `PATCH /api/v1/saved-searches/{id}/frequency`
- `POST /api/v1/saved-searches/{id}/refresh`
- `DELETE /api/v1/saved-searches/{id}`

#### Video APIs

- `POST /api/v1/videos/{id}/bookmark`
- `DELETE /api/v1/videos/{id}/bookmark`
- `POST /api/v1/videos/{id}/analysis`
- `GET /api/v1/videos/{id}/analysis`

### Admin routes

Defined in `routes/admin.php`, under `/x/admin`.

- `/x/admin/login`
- `/x/admin`
- `/x/admin/dashboard/refresh`
  - Refreshes the daily operations snapshot. Acquisition attribution is live and does not need a snapshot refresh.
- `/x/admin/activity`
  - Full user activity log with server-side date-range, category, event, and pagination controls.
- `/x/admin/records/{resource}/{id}`
- `/x/admin/viral-videos`
- `/x/admin/searches`
- `/x/admin/inquiries`
- `/x/admin/plans`
- `/x/admin/subscription`
- `/x/admin/users`
- `/x/admin/users/admin-users`

#### Admin impersonation

- `POST /x/admin/users/{user}/impersonate`
  - Starts an admin-initiated customer session for one hour.
- `POST /x/admin/impersonation/stop`
  - Ends the customer session and returns to the admin dashboard.

Important:

- The customer session is time-limited and enforced by `ExpireAdminImpersonation` on every web request.
- The env-backed admin session stays separate so an admin can return safely after the customer session ends.

### UTM acquisition reporting

- `utm_page_visits` records one anonymous public visit per browser session from the feature's deployment onward. A tagged UTM source wins, an untagged external referrer uses its host, and only no-source/no-referrer traffic is reported as `direct`.
- Sign-ups and card-on-file trial starts use each user's signup attribution (`subscription_id = null`) so subscription-attribution copies are never counted twice.
- “Trial - no CC” is intentionally displayed as locked until the product supports that flow.
- The admin conversion funnel uses the same selected range: trialing is measured from trial starts, paid from trial completion or direct paid starts, and churn from cancellations.

### User activity reporting

- `user_activities` is an append-only activity ledger for sign ups, subscriptions, engagement, and account deletion events.
- The admin dashboard previews the five most recent records. `/x/admin/activity` provides the complete, paginated activity ledger. Activity starts collecting from deployment; it is not backfilled.

## Core domain concepts

### Saved search

The main product entity. A saved search represents a phrase-driven viral-video discovery workflow with refresh scheduling and local keyword filtering.

Primary models:

- `CustomKeywordSearch`
- `CustomKeywordSearchRun`
- `CustomKeywordSearchVideo`
- `CustomKeywordSearchSnapshot`

Core service pipeline:

- `KeywordNormalizer`
- `KeywordExpansionService`
- `KeywordMatcher`
- `TikTokItemMapper`
- `SearchRunProcessor`
- `SavedSearchManager`

### Watchlist

User-facing name for saved searches. Internal code still uses `saved-searches` and `SavedSearch`.

Rule:

- Do not rename internal routes/models to “watchlist” unless the project intentionally performs a full migration.

### Subscription

Represents a user’s paid plan and entitlements.

Primary models/services:

- `Subscription`
- `PricingPlan`
- `BillingService`
- `BillingEntitlementService`
- `StripeWebhookProcessor`

### Video analysis

AI-assisted analysis over saved/imported videos.

Primary models/services:

- `VideoAnalysis`
- `VideoPreparation`
- `UserVideoAnalysisProcessor`
- `VideoAnalysisManager`
- `CreativeStrategistGenerator`

### UTM attribution

Tracks marketing attribution from arrival through signup and paid conversion.

Primary pieces:

- `CaptureUtmParameters` middleware
- `UtmAttributionService`
- `UtmAttribution` model
- `utm_attributions` table

Behavior:

1. UTM params are captured from web requests and stored in session under `utm_params`.
2. Registration creates a signup attribution row with `subscription_id = null`.
3. Successful paid checkout creates a second attribution row with the Stripe subscription id in `subscription_id`.

## Important logic flows

### Saved-search creation and refresh flow

High-level flow:

1. User enters a phrase and optional keyword context.
2. `KeywordNormalizer` cleans and canonicalizes the keyword set.
3. Dedupe happens on `keyword_signature`, not phrase text or display name.
4. Apify is called with only the primary phrase.
5. Local keyword filtering and ranking happen after dataset retrieval.
6. Results persist into search, runs, videos, and snapshots.
7. Freshly scraped result assets are migrated to object storage before the run is marked done (when media archiving is enabled). Existing media repair remains asynchronous.
8. The rank-one video is automatically analyzed for free when it is new for the search run; the run stays active until that analysis completes. Unchanged winners reuse their prior analysis.
9. Search insight enrichment runs synchronously before the completed result is exposed.

Automatic winner-analysis rule:

- It is stored against the search owner with `counts_toward_quota = false` and must never increment video-analysis usage.
- A different winner on a future completed run gets its own free analysis. Existing manual analyses are reused and never reclassified as free.

Non-obvious rule:

- Never push the full keyword set into the remote scrape as a substitute for local filtering. That reduces recall and breaks the intended economics and quality balance.

### Search filtering standards

The search result set is not “whatever Apify returned.” Both scraped items and local recall candidates must survive the same matcher gates before they can appear in results.

Current standard:

1. Pull the full Apify dataset for the phrase.
2. Filter Apify items through the shared matcher rules.
3. Pull local corpus candidates from `viral_videos`.
4. Filter local candidates through the same matcher rules.
5. Combine both match sets, with Apify winning collisions because its stats are fresher.
6. Rank the combined winners by strongest outlier signal first.

Filtering gates:

- Item must map into a usable normalized payload.
- Item must have usable media.
- Item must satisfy the minimum follower threshold from config.
- Item must pass the English-title confidence check, unless explicit region data justifies keeping it.
- Item must match the topic through at least one main match tier:
  - `phrase`: phrase appears in caption or hashtags.
  - `handle`: compacted phrase appears in creator handle or display name.
  - `supporting`: enough supporting keywords matched to qualify as a rescue.

Ranking rules:

- Primary order is highest `virality_score`.
- Ties break on higher `views`, then newer `uploaded_at`, then stable `video_id`.
- Handle/supporting rescues get a score haircut so they sort below equally strong direct phrase matches.

Local recall rules:

- Local recall is intentionally broad and cheap at the SQL layer.
- It only selects likely candidates from the canonical `viral_videos` table.
- Precision still comes from the same matcher, not from the SQL prefilter.

### Free-search quota flow

High-level flow:

1. Guest creates a free search using a `guest_token` stored in session.
2. Permanent allowance is enforced through `guest_search_grants`, keyed from `GuestIdentity::fingerprint`.
3. On login, claimed guest searches are attached to the user.
4. The user’s permanent free-search usage is represented by `users.free_search_used_at`.

Non-obvious rules:

- `guest_token` is an ownership handle, not a quota key.
- Session resets must never restore free-search eligibility.
- Do not infer “free search unused” from row counts because soft deletion makes that unsafe.

### Billing and checkout flow

High-level flow:

1. User chooses a plan.
2. `BillingController` / `BillingService` creates a Stripe checkout session.
3. Stripe success lands on `/billing/success`.
4. Webhook processing finalizes state in the database.
5. `BillingService::finalizeCheckout()` upserts the local subscription, updates user entitlements, and triggers subscription-started email behavior.
6. UTM attribution is copied from signup attribution to a subscription attribution row.

Important:

- Webhook processing is authoritative for subscription lifecycle changes.
- Do not rely only on the redirect/success page for durable subscription state.

### Trial checkout intent flow

High-level flow:

1. Guest visits `/trial?redirect=trial_checkout&plan=...`.
2. `RememberTrialCheckoutIntent` stores plan/trial intent in session.
3. After login or registration, the app resumes checkout automatically.

Important:

- Preserve this flow when editing auth redirects or guest middleware.

### Stripe webhook flow

Handled in `app/Services/Stripe/StripeWebhookProcessor.php`.

Events handled:

- `checkout.session.completed`
- `invoice.paid`
- `invoice.payment_failed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

Important:

- Subscription cancellations and plan state changes propagate from webhook events.
- Renewal detection is based on period-end movement.
- Usage counters and user plan state are synchronized during relevant subscription updates.

### Media archiving flow

High-level flow:

1. Fresh saved-search imports synchronously download and re-upload assets to the configured storage disk before the run becomes ready.
2. Other imports and repair passes use queued archival.
3. The model is updated only after upload verification passes.

Important rules:

- Uploading may block a saved-search worker, but must never block the import request path.
- A provider-side dead asset should be cleared instead of retried forever.
- A local upload failure should keep the original source URL for later retry.

### Video analysis flow

High-level flow:

1. User requests analysis on a video.
2. Billing entitlement checks run.
3. Video preparation/transcript collection happens as needed.
4. Analysis job executes and persists the result.
5. Usage counts are updated on the subscription metadata path.

## Directory guide

### `app/Console/Commands`

- Scheduled jobs, debug tasks, one-time repairs, and testing helpers.

### `app/Http/Controllers`

- Web/API entrypoints.
- `SavedSearchController` is the center of the search lifecycle.

### `app/Http/Middleware`

- Request-level routing, auth intent, paid gating, and UTM capture behavior.

### `app/Models`

- Persistent entities. Check casts and relationships before changing fields.

### `app/Repositories/Admin`

- Admin-table and drawer data shaping.

### `app/Services/CustomKeywordSearch`

- Core search creation, refresh, filtering, matching, and persistence.

### `app/Services/Billing`

- Plan purchase, entitlements, usage accounting, and checkout finalization.

### `app/Services/Stripe`

- Stripe API wrapper and webhook domain logic.

### `app/Services/Brevo`

- Transactional and lifecycle email integration.

### `app/Services/Utm`

- Attribution capture and persistence.

### `app/Services/Media`

- Asset durability and storage migration away from expiring source URLs.

### `resources/js/Pages`

- Signed-in app pages.

### `resources/js/landing`

- Marketing site and public search funnel.

### `resources/views`

- Blade entry templates and exports.

### `database/migrations`

- Source of truth for persisted schema shape.
- Always inspect existing migrations before changing model attributes or assumptions.

### `tests/Feature` and `tests/Unit`

- Feature tests cover full workflows.
- Unit tests pin tricky service logic and regressions.

## Frontend architecture notes

- Inertia entrypoint is `resources/js/app.jsx`.
- Shared shell for signed-in pages is `resources/js/Pages/components/AppLayout.jsx`.
- Dark mode is class-driven, not OS-driven.
- Search flow state is query-string based so back/forward navigation and sharing work.
- Landing placeholders live in `resources/js/landing/data/dummy.js`.

Important:

- `AppLayout` replaced the old `SearchShell`. Do not revive deleted shell abstractions.
- “Brand searches” and “Competitor searches” are seeds into `/search`, not independent route trees.

## Environment variables to know

- `APP_URL`
- `DB_*`
- `APIFY_TOKEN`
- `APIFY_TASK_IDS`
- `APIFY_TIMEOUT`
- `APIFY_POLL_SECONDS`
- `APIFY_RUN_TIMEOUT_SECONDS`
- `HTTP_TIMEOUT`
- `HTTP_RETRY_TIMES`
- `USE_TIKTOK_SCRAPING_SERVICE`
- `USE_SHORT_FORM_SCRAPING_SERVICE`
- `VIRAL_VIDEO_SCHEDULE_TIME`
- `VIRAL_VIDEO_SCHEDULE_TIMEZONE`
- `VIRAL_VIDEOS_MEDIA_ARCHIVE_ENABLED`
- `VIRAL_VIDEOS_MEDIA_DISK`
- `VIRAL_VIDEOS_ANALYSIS_DISK`
- `VIRAL_VIDEOS_MEDIA_PREFIX`
- `VIRAL_VIDEOS_PREPARATION_QUEUE`
- `VIRAL_VIDEOS_ANALYSIS_REFRESH_MAX_AGE_SECONDS`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_DEFAULT_REGION`
- `AWS_BUCKET`
- `AWS_URL`
- `AWS_ENDPOINT`
- `AWS_USE_PATH_STYLE_ENDPOINT`
- `BYPASS_PAID_FEATURES`

## Sensitive files and safety rules

Treat these as protected unless the user explicitly asks to change them:

- `.env`
- `.env.testing`
- `.env.example`
- any file containing secrets, tokens, credentials, or machine-local configuration

Safety rules:

- Prefer additive migrations over editing old migrations unless the repo clearly permits it.
- Do not run destructive DB resets casually.
- Do not break webhook-driven billing state by moving logic only into controllers or frontend redirects.
- Do not change quota rules without reviewing guest and paid entitlement paths together.
- Do not rename user-facing copy and internal route/model names interchangeably without checking existing conventions.

## Common agent mistakes to avoid

- Treating watchlists and saved searches as separate backend features.
- Enforcing the free-search quota with session state.
- Sending all keywords to Apify instead of only the primary phrase.
- Assuming Stripe redirect success equals finalized local subscription state.
- Updating expired CDN asset URLs inline during import instead of using the queued archival path.
- Refactoring Tailwind component classes into shared `@apply` chains that Tailwind v4 will not support cleanly.
- Missing UTM persistence during both signup and subscription conversion.

## Documentation maintenance checklist

Update this guide when any of the following change:

- Routes or middleware behavior.
- Billing lifecycle or Stripe event handling.
- Search creation or refresh rules.
- Queue/job architecture.
- Admin navigation or resources.
- New domain-specific Artisan commands.
- Schema changes that alter business concepts.
