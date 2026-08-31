# Library And Bookmarks

## Purpose

The library is the authenticated hub for saved searches, filtered search groups, bookmarked searches, bookmarked videos, and analysis history.

This feature mixes several user-facing concepts into one navigation surface, so it is important to understand which behaviors are shared and which are quota-controlled.

## Main entrypoints

- `GET /library`
- `GET /brands`
- `GET /products`
- `PATCH /api/v1/saved-searches/{id}/bookmark`
- `POST /api/v1/videos/{id}/bookmark`
- `DELETE /api/v1/videos/{id}/bookmark`

## Primary files

- `app/Http/Controllers/SavedSearchController.php`
- `app/Http/Controllers/VideoBookmarkController.php`
- `app/Services/Bookmarks/BookmarkService.php`
- `app/Services/Billing/BillingService.php`
- `app/Http/Resources/SavedSearchPresenter.php`

## Library structure

### `/library`

Default library behavior is the broad saved area:

- bookmarked searches
- bookmarked videos
- video analysis history

When no explicit search-type filter is present, `SavedSearchController::index()` treats the view as the general saved hub.

### `/brands`

Brand and competitor searches are grouped into the same hub.

### `/products`

Product searches are shown in their own hub.

## Search bookmarks

Saved-search bookmarking is implemented with `CustomKeywordSearch.is_watchlisted`.

Rules:

- Turning a search into a watchlisted item may be quota-controlled.
- `SavedSearchManager::setBookmarked()` calls `BillingService::ensureCanBookmarkSearch()` before enabling a new watchlist row.
- Usage is synchronized back into subscription metadata after changes.

## Video bookmarks

Video bookmarks are separate from search bookmarks and have their own limit accounting.

Do not merge search-bookmark and video-bookmark logic casually. They are intentionally reported and limited separately in subscription metadata.

## Analysis history

The library includes a flat history of video analyses for the signed-in user.

Behavior:

- history is ordered by latest `updated_at`
- only analyses with a visible `viralVideo` are included
- the response includes linked searches when that video is attached to searches
- free automatic analyses remain visible in the same history but keep `counts_toward_quota = false`

## Search hubs

`SavedSearchController::searchHub()` powers `/brands` and `/products`.

Each hub provides:

- search cards
- aggregate counts
- a "moving this week" set of top outliers
- tracking suggestions

Suggestions are built in tiers:

1. other users' searches that share creators with the current user's searches
2. popular searches across other users
3. AI-expanded adjacent ideas from the user's recent searches
4. curated fallback samples

## Important invariants

- Library bookmarks are not a separate search type.
- Competitor searches currently roll up into the brand group.
- The default library view is intentionally different from `/brands` and `/products`.
- Bookmark limits and usage must stay in sync with subscription metadata after changes.

