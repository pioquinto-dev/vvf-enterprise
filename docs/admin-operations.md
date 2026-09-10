# Admin Operations

## Purpose

Admin operations cover the protected `/x/admin` experience for dashboard reporting, acquisition tracking, user activity review, content inspection, coupon monitoring, and admin impersonation.

## Main entrypoints

- `GET /x/admin/login`
- `GET /x/admin`
- `POST /x/admin/dashboard/refresh`
- `GET /x/admin/activity`
- `GET /x/admin/records/{resource}/{id}`
- `GET /x/admin/viral-videos`
- `GET /x/admin/searches`
- `GET /x/admin/inquiries`
- `GET /x/admin/plans`
- `GET /x/admin/subscription`
- `GET /x/admin/users`
- `GET /x/admin/users/admin-users`
- `POST /x/admin/users/{user}/impersonate`
- `POST /x/admin/impersonation/stop`

## Primary files

- `routes/admin.php`
- `app/Services/Admin/AdminDashboardService.php`
- `app/Services/Admin/DashboardSnapshotService.php`
- `app/Services/Admin/AcquisitionDashboardService.php`
- `app/Services/Admin/UserActivityService.php`
- `app/Services/Admin/AdminImpersonationService.php`
- `app/Http/Controllers/Admin/*`

## Dashboard behavior

`AdminDashboardService::dashboardPayload()` combines:

- section/navigation metadata
- snapshot-based operational stats
- trend data
- acquisition reporting
- recent user activity
- coupon program summaries and alerts

Important nuance:

- acquisition attribution is live and does not require dashboard snapshot refresh
- other operational cards are snapshot-backed

## Activity ledger

`user_activities` is an append-only log for:

- signups
- subscription lifecycle events
- engagement actions
- coupon usage
- account deletion

The dashboard shows a recent preview, while `/x/admin/activity` provides the full paginated ledger.

## Coupon monitoring

The admin dashboard includes:

- per-program redemption counts
- remaining slots when capped
- low-remaining alerts
- fully exhausted alerts
- recent redemption activity

## Impersonation

Admin impersonation allows an admin to enter a customer session temporarily.

Rules:

- customer impersonation is time-limited to one hour
- `ExpireAdminImpersonation` enforces that window on every web request
- the admin's own session remains separate so they can safely return

## Useful commands

- `php artisan admin:capture-dashboard-snapshot`

## Important invariants

- Never mix live attribution logic into snapshot-only assumptions.
- Never make impersonation permanent or share the admin session with the customer session.
- Never treat user activity as mutable audit state.
