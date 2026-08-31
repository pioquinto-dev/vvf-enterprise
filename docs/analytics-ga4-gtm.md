# GA4 and GTM Analytics Setup

This app now emits structured marketing and product-usage events into `window.dataLayer` for Google Tag Manager (GTM). GTM should forward them into a GA4 property.

## Environment variables

Add these to the active environment:

```env
ANALYTICS_ENABLED=true
GTM_CONTAINER_ID=GTM-XXXXXXX
GA4_MEASUREMENT_ID=G-XXXXXXXXXX
ANALYTICS_DEBUG_MODE=false
```

Notes:

- `ANALYTICS_ENABLED` gates the GTM snippet and client event pushing.
- `GTM_CONTAINER_ID` is required for the container snippet.
- `GA4_MEASUREMENT_ID` is not required by the app runtime, but keep it in env so the deployment config documents which GA4 property the container should feed.
- `ANALYTICS_DEBUG_MODE` is reserved for future debugging flows and is exposed to the frontend already.

## What the app sends

Every Inertia page visit pushes:

- `page_view`
  - `page_location`
  - `page_title`
  - `page_type`
  - `user_state`

Server-confirmed or API-driven events currently emitted:

- `sign_up`
  - `method`
  - `user_id`
- `checkout_started`
  - `plan_slug`
  - `billing_cycle`
  - `with_trial`
  - `coupon_program`
- `trial_started`
  - `plan_slug`
  - `subscription_status`
  - optionally `billing_cycle`, `value`, `currency`, `trial_days` when checkout finalization creates it
- `subscription_started`
  - `plan_slug`
  - `billing_cycle`
  - `subscription_status`
  - `value`
  - `currency`
  - `trial_days`
- `subscription_reactivated`
  - `plan_slug`
  - `subscription_status`
  - `billing_cycle`
- `subscription_cancellation_requested`
  - `plan_slug`
- `subscription_cancellation_scheduled`
  - `plan_slug`
  - `cancel_at`
- `subscription_cancellation_reverted`
  - `plan_slug`
- `subscription_cancelled`
  - `plan_slug`
  - `subscription_status`
- `search_created`
  - `search_id`
  - `search_type`
  - `search_phrase`
  - `search_frequency`
  - `is_authenticated`
- `search_refresh_requested`
  - `search_id`
  - `search_type`
  - `search_phrase`
- `search_bookmarked`
  - `search_id`
  - `search_type`
  - `search_phrase`
- `search_unbookmarked`
  - `search_id`
  - `search_type`
  - `search_phrase`
- `video_bookmarked`
  - `video_id`
  - `bookmark_count`
- `video_unbookmarked`
  - `video_id`
  - `bookmark_count`
- `video_analysis_requested`
  - `video_id`
  - `video_platform_id`
  - `force_refresh`
  - `counts_toward_quota`

All events also include:

- `sent_at`

## GTM setup

1. Create or open the GTM web container for the site.
2. Add one GA4 Configuration tag.
3. In that tag, set the Measurement ID to the GA4 stream id (`G-XXXXXXXXXX`).
4. Enable the config tag on All Pages.
5. Create Data Layer Variables for the event parameters you want available in GTM reports or other tags.

Recommended Data Layer Variables:

- `page_type`
- `user_state`
- `method`
- `plan_slug`
- `billing_cycle`
- `subscription_status`
- `value`
- `currency`
- `trial_days`
- `search_id`
- `search_type`
- `search_phrase`
- `search_frequency`
- `video_id`
- `video_platform_id`
- `bookmark_count`
- `cancel_at`
- `is_authenticated`

Recommended Custom Event triggers:

- `sign_up`
- `checkout_started`
- `trial_started`
- `subscription_started`
- `subscription_reactivated`
- `subscription_cancellation_requested`
- `subscription_cancellation_scheduled`
- `subscription_cancellation_reverted`
- `subscription_cancelled`
- `search_created`
- `search_refresh_requested`
- `search_bookmarked`
- `video_bookmarked`
- `video_analysis_requested`

For each trigger above, create a GA4 Event tag:

- Event Name: use the exact same event name from `dataLayer`
- Configuration Tag: your GA4 Configuration tag
- Event Parameters: map the matching Data Layer Variables you care about

## GA4 setup

In GA4:

1. Create a Web Data Stream for the production domain.
2. Use its Measurement ID in the GTM GA4 Configuration tag.
3. In Admin > Events, verify incoming custom events after GTM publish.
4. Mark key conversions:
   - `sign_up`
   - `subscription_started`
   - `trial_started` if trials are a KPI
   - `subscription_cancelled` if you want churn events visible as key events
5. Register custom dimensions for parameters you want in reports.

Recommended event-scoped custom dimensions:

- `page_type`
- `user_state`
- `method`
- `plan_slug`
- `billing_cycle`
- `subscription_status`
- `search_type`
- `search_phrase`
- `search_frequency`
- `video_id`
- `video_platform_id`
- `counts_toward_quota`
- `is_authenticated`

Recommended custom metrics:

- `value`
- `bookmark_count`
- `trial_days`

## Verification checklist

1. Set `ANALYTICS_ENABLED=true` and `GTM_CONTAINER_ID`.
2. Deploy.
3. Open GTM Preview mode against the site.
4. Confirm `page_view` fires on both marketing and authenticated pages.
5. Trigger each core action and confirm the matching custom event appears in Preview.
6. In GA4 Realtime and DebugView, verify the same event names arrive with parameters.
7. Publish the GTM container only after Preview confirms the payload shape.

## Implementation notes

- GTM is loaded from the shared Blade shell, so it applies to marketing pages and the authenticated Inertia app.
- In-page API actions push analytics immediately from JSON responses.
- Stripe-authoritative lifecycle events are queued server-side and delivered on the user's next Inertia page load, so billing conversions stay aligned with finalized backend state.
