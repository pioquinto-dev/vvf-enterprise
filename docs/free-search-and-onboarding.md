# Free Search And Onboarding

## Purpose

This feature covers the guest free-search funnel, login and registration handoff, Google auth continuation, and the rules that prevent the free-search allowance from being reset by session churn.

The main product promise is that a signed-out visitor can prepare one search, authenticate, and keep that search after sign-in without creating a quota loophole.

## Main entrypoints

- `GET /search`
- `POST /search/pending`
- `GET /search/running`
- `GET /login`
- `POST /login`
- `GET /register`
- `POST /register`
- `GET /auth/google`
- `GET /auth/google/callback`
- `GET /trial`

## Primary files

- `app/Http/Controllers/FreeSearchFunnelController.php`
- `app/Services/CustomKeywordSearch/GuestSearchQuota.php`
- `app/Services/Auth/PostAuthenticationRedirector.php`
- `app/Http/Controllers/Auth/RegisteredUserController.php`
- `app/Http/Controllers/Auth/AuthenticatedSessionController.php`
- `app/Http/Controllers/Auth/GoogleAuthController.php`
- `app/Support/GuestIdentity.php`
- `app/Support/TrialCheckoutIntent.php`

## Guest search flow

1. A guest configures a search on `/search`.
2. `POST /search/pending` stores validated search intent in session through `FreeSearchFunnelController`.
3. Authentication happens after the guest finishes the public funnel.
4. The real saved search is created after sign-in, not during the public form step.
5. Guest-owned searches can also exist directly under a `guest_token` when a server-side creation path is used.

## Quota model

Guest quota is enforced by `GuestSearchQuota`.

Important rules:

- The free-search allowance is keyed by `GuestIdentity::fingerprint`, not by session only.
- `guest_token` is an ownership handle, not the quota key.
- A claimed grant stays spent even if the browser logs out later.
- Validation failures must not consume quota.
- Consumption happens only after the search record exists and a real scrape is about to start.

## Anti-abuse behavior

The quota system exists specifically to prevent a guest from:

- creating repeated free scrapes without an account
- logging in and out to reset eligibility
- laundering guest searches into an account without paying the intended cost

`GuestSearchQuota::grantForWriting()` uses row locking and a unique fingerprint to prevent two simultaneous tabs from both getting a free run.

## Guest-to-user claiming

When a guest authenticates, two things matter:

- the free-search allowance can be claimed for the account
- any guest-owned searches should be attached to the user

`SavedSearchManager::claimGuestSearches()` moves guest searches onto the user so the just-created search does not disappear after sign-in.

## Trial checkout intent

The `/trial` route works with `remember.trial.checkout` middleware and `TrialCheckoutIntent` support so a guest can:

1. choose a plan before authenticating
2. log in or register
3. resume the intended checkout automatically

Do not break this continuation path when modifying auth redirects or guest middleware.

## Product-specific behavior

- Product searches do not keep `sources` from the public pending payload because they do not map to one canonical brand account.
- The public running page polls notification data for pending search progress.

## Important invariants

- Never enforce guest quota with session state alone.
- Never infer unused guest quota from raw search counts.
- Never spend the allowance before the create path is valid.
- Never drop the pending search payload during auth continuation unless the user explicitly abandons it.

