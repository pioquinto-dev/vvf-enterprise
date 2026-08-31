# UTM Attribution

## Purpose

UTM attribution tracks acquisition source from public landing through signup and then through paid conversion, while avoiding double counting between signup and subscription events.

## Main touchpoints

- public web requests with UTM params
- user registration
- checkout finalization
- admin acquisition reporting

## Primary files

- `app/Services/Utm/UtmAttributionService.php`
- `app/Http/Middleware/CaptureUtmParameters.php`
- `app/Services/Utm/UtmPageVisitService.php`
- `app/Services/Admin/AcquisitionDashboardService.php`
- `database/migrations/2026_08_17_120000_create_utm_attributions_table.php`
- `database/migrations/2026_08_21_120000_create_utm_page_visits_table.php`

## Data model

There are two related but distinct tracking layers:

- `utm_page_visits` for anonymous public-session visit capture
- `utm_attributions` for user-linked attribution rows

## Signup attribution flow

1. UTM params are captured from public requests into session.
2. A referrer-derived fallback source can also be stored.
3. On registration, `UtmAttributionService::createSignupAttribution()` creates a user-linked row with `subscription_id = null`.

Source resolution rules:

- an explicit `utm_source` wins
- `organic` is treated like no explicit paid source
- if no usable `utm_source` exists, referrer source can be used
- if neither exists, no attribution row is created

## Subscription attribution flow

1. Checkout finalization receives the Stripe subscription id.
2. `createSubscriptionAttribution()` copies the latest signup attribution for the user.
3. The subscription row uses the Stripe subscription id so conversion reporting can distinguish paid conversion from signup attribution.

This prevents signup attribution rows from being counted twice as both signup and paid conversion.

## Reporting rules

- One anonymous public visit is recorded per browser session.
- Tagged UTM source wins over external referrer.
- Untagged external referrer uses its host.
- Only no-source and no-referrer traffic is reported as `direct`.

## Important invariants

- Never overwrite subscription attribution by mutating the signup row in place.
- Never count `subscription_id = null` rows as paid conversions.
- Never treat missing UTM params as `direct` if a usable referrer source exists.

