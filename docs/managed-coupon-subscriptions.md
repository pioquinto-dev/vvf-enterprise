# Managed Coupon Subscriptions

## Purpose

Managed coupon subscriptions are controlled subscription offers that users enter through dedicated links such as `/internal-subscription`, `/vip-subscription`, or `/subscription/{programPath}`.

These offers are not user-entered coupon-code flows. The program is resolved server-side from the request path.

## Main entrypoints

- `GET /internal-subscription`
- `GET /vip-subscription`
- `GET /subscription/{programPath}`

## Primary files

- `app/Http/Controllers/CouponSubscriptionController.php`
- `app/Services/Billing/CouponAccessService.php`
- `app/Services/Billing/CouponEligibility.php`
- `app/Services/Billing/BillingService.php`
- `app/Models/ManagedCouponProgram.php`
- `app/Models/ManagedCouponWhitelistEntry.php`
- `app/Models/ManagedCouponRedemption.php`

## Flow

1. A user lands on a managed coupon path.
2. `CouponSubscriptionController::enter()` resolves the matching `ManagedCouponProgram` from the path.
3. Unauthenticated visitors store coupon checkout intent and are redirected into login.
4. Signed-in users are checked through `CouponAccessService::evaluate()`.
5. If eligible, checkout is started through the standard `BillingService::checkout()` path with program context attached.

## Supported program behavior

Programs can control:

- target plan slug
- billing cycle
- whether the program is trial-only
- whether a payment method must be collected
- Stripe coupon or promotion code payload
- optional redemption caps

For no-card trial programs, checkout can use `payment_method_collection = if_required` and Stripe trial end behavior that cancels if no payment method is added.

## Eligibility behavior

Blocked users are redirected with a structured `coupon_access_prompt` payload instead of a generic error.

Activity is also recorded for:

- blocked coupon attempts
- coupon checkout initiated
- coupon redeemed

## Redemption behavior

Coupon redemption is finalized during billing finalization, not only at entry time.

Important rules:

- slot consumption must happen safely when checkout actually finalizes
- if a slot is lost between entry and finalization, the system records that failure condition
- coupon usage tracking belongs to the managed program, not just the Stripe discount object

## Admin visibility

Admin dashboard coupon widgets summarize:

- program usage
- remaining slots
- low/full alerts
- recent redemptions

See `AdminDashboardService::couponPayload()` for the current dashboard data contract.

## Important invariants

- Never let users manually type or override the managed program code in this flow.
- Never treat managed coupon links as plain public coupons.
- Never finalize redemption purely from redirect completion without the billing finalization path.

