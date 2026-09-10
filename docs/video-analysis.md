# Video Analysis

## Purpose

Video analysis is the AI-assisted strategy layer for a viral video. It supports user-requested analyses, automatic winner analyses for saved searches, preparation caching, stale-run recovery, and quota accounting.

## Main entrypoints

- `GET /videos/{id}/analysis`
- `POST /api/v1/videos/{id}/analysis`
- `GET /api/v1/videos/{id}/analysis`

## Primary files

- `app/Http/Controllers/VideoAnalysisController.php`
- `app/Http/Controllers/VideoAnalysisPageController.php`
- `app/Services/ViralVideoAnalysis/VideoAnalysisManager.php`
- `app/Services/ViralVideoAnalysis/VideoPreparationProcessor.php`
- `app/Services/ViralVideoAnalysis/UserVideoAnalysisProcessor.php`
- `app/Services/ViralVideoAnalysis/CreativeStrategistGenerator.php`
- `app/Services/ViralVideoAnalysis/TranscriptFetcher.php`
- `app/Services/ViralVideoAnalysis/SharedTranscriptStore.php`

## Primary models

- `VideoAnalysis`
- `VideoPreparation`
- `ViralVideo`
- `ViralVideoSharedTranscript`

## User-requested analysis flow

1. The signed-in user calls `POST /api/v1/videos/{id}/analysis`.
2. `VideoAnalysisController::store()` ensures auth and loads a visible `ViralVideo`.
3. `VideoAnalysisManager::request()` routes into `queue(..., countsTowardQuota: true)`.
4. Billing entitlement checks run before a billable analysis starts.
5. A `VideoPreparation` row may be created or reused.
6. Preparation and analysis jobs are queued on the `viral_video_analysis` queue.
7. The client polls `GET /api/v1/videos/{id}/analysis` for status.

## Automatic winner analysis flow

Saved-search runs use `requestAutomaticWinnerAndWait()` for the rank-1 result.

Rules:

- automatic winner analyses are free benefits of a saved-search run
- they must be stored with `counts_toward_quota = false`
- they must not consume user quota
- completed analyses can be reused
- automatic runs do not overwrite successful manual analyses
- a failed automatic analysis may retry for free

## Preparation caching behavior

Preparation and generation are intentionally separated.

- If preparation is already complete and no force refresh is requested, the system can skip directly to `RunVideoAnalysis`.
- A forced refresh routes back through preparation because diagnostic inputs may need to be rebuilt.

## Refresh and reuse behavior

- If an analysis is already processing and is not stale, duplicate requests reuse it.
- If an analysis is complete and does not need strategist refresh, it is reused.
- If the strategist output is old enough to require regeneration, the analysis can re-enter processing.

## Stale analysis recovery

`VideoAnalysisManager` marks an analysis failed if it remains processing beyond the configured stale threshold.

Behavior:

- the analysis receives a user-safe stale error message
- matching in-flight `VideoPreparation` work is also marked failed when stale
- a later request can retry the work cleanly

## Quota accounting

Billable analyses are only counted when a completed analysis with `counts_toward_quota = true` is synced.

Important nuance:

- usage syncing happens after completion, not just at request time
- automatic winner analyses bypass quota entirely
- a free winner retry must stay free

## Important invariants

- Never turn an automatic winner analysis into a billable manual analysis by accident.
- Never consume quota for `counts_toward_quota = false`.
- Never expose analysis data for non-visible videos.
- Never bypass stale analysis cleanup when diagnosing stuck processing.

