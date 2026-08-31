# Saved Searches

## Purpose

Saved searches are the core product workflow. A saved search represents a phrase-driven viral-video discovery loop that can be created once, refreshed repeatedly, scheduled weekly or monthly, and rendered across dashboard, library, and results views.

This feature is user-facing under the "watchlist" concept, but the backend still uses `saved-searches` and `CustomKeywordSearch`. Keep that distinction intact unless the product intentionally performs a full internal rename.

## Main entrypoints

### Public and app routes

- `GET /dashboard`
- `GET /library`
- `GET /brands`
- `GET /products`
- `GET /results/{search}`
- `GET /library/{id}`
- `GET /bookmark/{id}`
- `GET /bookmarks/{id}`

### API routes

- `POST /api/v1/saved-searches/expand`
- `GET /api/v1/saved-searches/notifications`
- `GET /api/v1/saved-searches/recent`
- `POST /api/v1/saved-searches`
- `GET /api/v1/saved-searches/{id}/json`
- `PATCH /api/v1/saved-searches/{id}/bookmark`
- `PATCH /api/v1/saved-searches/{id}/pause`
- `PATCH /api/v1/saved-searches/{id}/resume`
- `PATCH /api/v1/saved-searches/{id}/frequency`
- `POST /api/v1/saved-searches/{id}/refresh`
- `POST /api/v1/saved-searches/{id}/retry`
- `DELETE /api/v1/saved-searches/{id}`

## Primary files

- `app/Http/Controllers/SavedSearchController.php`
- `app/Services/CustomKeywordSearch/SavedSearchManager.php`
- `app/Services/CustomKeywordSearch/SearchRunProcessor.php`
- `app/Services/CustomKeywordSearch/KeywordNormalizer.php`
- `app/Services/CustomKeywordSearch/KeywordMatcher.php`
- `app/Services/CustomKeywordSearch/KeywordExpansionService.php`
- `app/Services/CustomKeywordSearch/OwnedSearchResolver.php`
- `app/Services/CustomKeywordSearch/LocalCorpusRecall.php`
- `app/Services/CustomKeywordSearch/SearchEnrichmentService.php`
- `app/Services/CustomKeywordSearch/SnapshotRecorder.php`

## Core data model

- `CustomKeywordSearch`
- `CustomKeywordSearchRun`
- `CustomKeywordSearchVideo`
- `CustomKeywordSearchSnapshot`
- `ViralVideo`
- `ApifyTrigger`

## Creation flow

1. The request arrives at `SavedSearchController::store()`.
2. Billing or guest quota validation runs before any scrape is started.
3. `SavedSearchManager::create()` normalizes the phrase and keywords.
4. The search dedupes on `keyword_signature`, not raw phrase text or display name.
5. If an owned search with the same normalized keyword set already exists, that row is reused.
6. A new run is queued through `RunCustomKeywordSearch`.
7. Credits are consumed only when a fresh scrape is actually about to start.

## Refresh and run processing flow

1. `SavedSearchManager::queueRun()` creates a `CustomKeywordSearchRun` row and sets the parent search to `scraping`.
2. `SearchRunProcessor::process()` creates an `ApifyTrigger`, starts the external scrape, and waits for completion.
3. Only the primary phrase is sent to Apify.
4. The full keyword set is applied locally through `KeywordMatcher`.
5. Apify matches and local-corpus matches are filtered through the same matcher gates.
6. Both pools are merged, with Apify rows winning collisions because their stats are fresher.
7. Results are ranked by strongest outlier signal and attached to the search.
8. Snapshots are recorded after persistence.
9. The top-ranked winner is analyzed automatically when applicable.
10. Search enrichment runs synchronously before the run is marked done.

## Matching and ranking rules

- An item must map into a usable normalized payload.
- An item must have usable media.
- An item must satisfy the minimum follower threshold.
- An item must pass the English-title confidence check unless region data justifies keeping it.
- Topic qualification can come from phrase match, handle rescue, or supporting-keyword rescue.
- Handle and supporting rescues receive a score haircut so direct phrase matches still win ties.
- Final ordering is by highest `virality_score`, then higher views, newer `uploaded_at`, then stable `video_id`.

## Search settings behavior

The editable settings after creation are intentionally narrow:

- `name`
- `frequency`
- `source_tiktok_handle`
- `source_website`

Keyword sets are fixed after creation. Do not add post-create keyword editing without reviewing dedupe, ranking, and refresh semantics together.

## Search status behavior

- `scraping` means a run is queued or running.
- `done` means the latest usable result set is ready.
- `paused` means future scheduling is disabled and active runs are marked failed as superseded.
- `failed` is only the terminal state for a search with no usable results.

Important nuance:

- A failed refresh does not blank out an already-usable search.
- If a search already has videos, a failed refresh leaves the search itself in `done` while the run is marked failed.

## Automatic winner analysis

Each completed run may trigger a free analysis on the rank-1 video for the search owner.

Rules:

- Automatic winner analyses must be stored with `counts_toward_quota = false`.
- They must never consume video-analysis quota.
- Existing completed analyses are reused.
- Manual analyses are never reclassified as free automatic analyses.
- The run is not marked complete until the winner analysis and synchronous enrichment are done.

## Scheduling behavior

- Supported frequencies are `weekly` and `monthly`.
- `SearchRunProcessor::nextRunAt()` calculates the next run using configured schedule time and timezone, then stores the result in UTC.
- Paused searches clear `next_run_at`.
- Resumed searches restore `next_run_at`.

## Important invariants

- Never send the full keyword set to Apify as a remote filter.
- Never infer duplicate searches from phrase text alone.
- Never consume a credit if an active identical run already exists and no new scrape starts.
- Never treat watchlists as a separate backend entity from saved searches.
- Never expose incomplete results before synchronous enrichment and winner-analysis completion.

## Common failure modes

- Missing Apify config causes the run to fail immediately.
- Failed initial runs can be retried through `retryInitial()` without charging again.
- Active-run collisions on manual refresh return `409`.
- Queue problems can leave enrichment missing, so `SavedSearchController::show()` backfills enrichment opportunistically on page load.

## Related commands

- `php artisan custom-keyword-search:dispatch-due`
- `php artisan custom-keyword-search:fail-stale-runs`

