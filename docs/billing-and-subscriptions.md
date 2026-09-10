# Billing And Subscriptions

## Purpose

Billing manages plan checkout, trials, Stripe customer state, subscription lifecycle, quota and entitlement enforcement, billing portal access, invoice history, receipts, payment-method updates, and cancellation/reactivation.

Stripe webhooks are the authoritative source for durable subscription lifecycle changes.

## Main entrypoints

- `GET /billing/checkout/{slug}`
- `GET /billing/success`
- `POST /stripe/webhook`
- `GET /settings/subscription`
- `POST /settings/subscription/payment-method/setup`
- `PATCH /settings/subscription/payment-method`
- `POST /settings/subscription/cancel`
- `POST /settings/subscription/reactivate`
- `GET /settings/subscription/receipt/{invoice}`
- `GET /settings/subscription/portal`
- `GET /plans`

## Primary files

- `app/Http/Controllers/BillingController.php`
- `app/Http/Controllers/SettingsController.php`
- `app/Services/Billing/BillingService.php`
- `app/Services/Billing/BillingEntitlementService.php`
- `app/Services/Stripe/StripeWebhookProcessor.php`
- `app/Services/Stripe/StripeClient.php`
- `app/Models/PricingPlan.php`
- `app/Models/Subscription.php`

## Plan and checkout behavior

- Checkout is allowed only for approved plan slugs.
- Trial eligibility is enforced server-side.
- The current trial length is 8 days.
- Stripe checkout metadata carries plan slug, user id, trial days, and billing cycle.
- Managed coupon programs can also inject server-side discount metadata.

If an unauthenticated visitor attempts checkout, the flow redirects through `/trial` so auth can complete before Stripe checkout starts.

## Finalization behavior

`BillingService::finalizeCheckout()` is used after a completed Stripe session.

It is responsible for:

- validating Stripe checkout completion
- resolving the local plan
- ensuring Stripe customer data is stored on the user
- creating or updating the local `Subscription`
- initializing subscription metadata and quota windows
- copying signup attribution into subscription attribution
- recording subscription activity
- triggering the subscription-started email when appropriate

## Webhook authority

`StripeWebhookProcessor` handles:

- `checkout.session.completed`
- `invoice.paid`
- `invoice.payment_failed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

Important rules:

- Do not rely only on `/billing/success` for durable subscription state.
- Subscription cancellation and renewal state propagate from webhooks.
- Trial completion, past-due recovery, cancel-at-period-end, and revert-to-free logic all live in webhook handling.

## Subscription metadata model

Subscription metadata stores:

- plan slug and UI settings
- search credit usage and limits
- video bookmark usage and limits
- search bookmark usage and limits
- video analysis usage and limits
- billing-cycle-specific window information
- cancellation scheduling state

Annual billing still tracks a shorter search-credit window inside the annual subscription period.

## Entitlements

`BillingService` delegates quota and feature checks to `BillingEntitlementService`.

Core entitlement checks include:

- search creation and refresh
- saved-search bookmarks
- video bookmarks
- video analysis
- trial eligibility

## Customer self-service

Settings and portal flows support:

- viewing current subscription state
- seeing payment-method summary
- viewing invoice history
- opening a branded receipt page
- updating default payment method
- scheduling cancellation
- reactivating auto-renew
- launching the Stripe billing portal

## Important invariants

- Never assume redirect success means the subscription is finalized.
- Never move durable lifecycle logic from webhook handling into frontend-only flows.
- Never skip entitlement checks before cost-bearing actions.
- Never merge search, bookmark, and analysis quotas into one undifferentiated counter.
- Never forget annual-cycle window handling when modifying search credit resets.

## Useful commands

- `php artisan billing:backfill-video-analysis-usage`
- `php artisan billing:debug-video-analysis`

