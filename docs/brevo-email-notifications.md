## Brevo email notifications

This project now has a Brevo-ready notification pack for eight lifecycle and product emails:

- New registration
- New subscription paid or trial started
- Cancellation of plan
- Final failed payment downgrade
- Verify email for manual account creation
- Trial ending for Basic or Premium
- No-card managed trial ending soon
- Search done

### Files

- `config/brevo_notifications.php`
- `app/Support/BrevoTransactionalEmail.php`
- `app/Http/Controllers/Auth/EmailVerificationController.php`

### Brevo request shape

Brevo's transactional email API supports sending either inline `htmlContent` or a saved `templateId`, with dynamic values passed through `params`. Source: [Send a transactional email](https://developers.brevo.com/docs/send-a-transactional-email) and [SMTP email API reference](https://developers.brevo.com/reference/send-transac-email).

This pack now uses Brevo-hosted templates via `templateId`. The app only sends:

- `sender`
- `to`
- `subject`
- `templateId`
- `tags`
- `params`

Use `{{params.logoUrl}}` in your Brevo template for the logo image:

```html
<img src="{{params.logoUrl}}" alt="{{params.appName}}" width="40" height="40" style="display:block;width:40px;height:40px;">
```

Prefer PNG for email templates. SVG support is inconsistent across email renderers and previews.

### Test sends

Use the configured test inbox for safe template checks:

```bash
php artisan testing:send-brevo-email all
```

Send one notification type only:

```bash
php artisan testing:send-brevo-email new_registration
php artisan testing:send-brevo-email subscription_started
php artisan testing:send-brevo-email subscription_canceled
php artisan testing:send-brevo-email verify_email_manual_account
php artisan testing:send-brevo-email trial_ending
php artisan testing:send-brevo-email final_failed_payment
php artisan testing:send-brevo-email no_cc_trial_ending
php artisan testing:send-brevo-email search_done
```

Override the target inbox for one run:

```bash
php artisan testing:send-brevo-email all --email=you@example.com --name="Your Name"
```

### Env vars

Add these to your `.env`:

```dotenv
BREVO_SENDER_NAME="BrandBeacon"
BREVO_SENDER_EMAIL="hello@yourdomain.com"
BREVO_LOGO_URL="https://yourdomain.com/brand-beacon-logo.png"
BREVO_TEST_RECIPIENT_EMAIL="you@example.com"
BREVO_TEMPLATE_ID_NEW_REGISTRATION=
BREVO_TEMPLATE_ID_SUBSCRIPTION_STARTED=
BREVO_TEMPLATE_ID_SUBSCRIPTION_CANCELED=
BREVO_TEMPLATE_ID_VERIFY_EMAIL_MANUAL_ACCOUNT=
BREVO_TEMPLATE_ID_TRIAL_ENDING=
BREVO_TEMPLATE_ID_FINAL_FAILED_PAYMENT=
BREVO_TEMPLATE_ID_NO_CC_TRIAL_ENDING=
BREVO_TEMPLATE_ID_SEARCH_DONE=
BREVO_PROXY=
BREVO_SEARCH_DONE_ENABLED=false
```

### Trigger map

#### 1. New registration

Trigger this right after user creation in `App\Http\Controllers\Auth\RegisteredUserController::store()`.

```php
$payload = \App\Support\BrevoTransactionalEmail::newRegistration($user);
```

Template env:

```dotenv
BREVO_TEMPLATE_ID_NEW_REGISTRATION=123
```

Expected params:

```json
{
  "logoUrl": "https://your-app.test/brand-beacon-logo.png",
  "appName": "BrandBeacon",
  "firstName": "Jane",
  "fullName": "Jane Doe",
  "loginUrl": "https://your-app.test/login",
  "dashboardUrl": "https://your-app.test/dashboard",
  "plansUrl": "https://your-app.test/plans"
}
```

#### 2. New subscription paid or trial

Trigger this after checkout is finalized in `App\Services\Billing\BillingService::finalizeCheckout()` and again from `App\Services\Stripe\StripeWebhookProcessor` if you want Stripe-confirmed delivery only.

```php
$payload = \App\Support\BrevoTransactionalEmail::subscriptionStarted($user, $subscription);
```

Template env:

```dotenv
BREVO_TEMPLATE_ID_SUBSCRIPTION_STARTED=124
```

Expected params:

```json
{
  "logoUrl": "https://your-app.test/brand-beacon-logo.png",
  "appName": "BrandBeacon",
  "firstName": "Jane",
  "fullName": "Jane Doe",
  "planName": "Basic",
  "planSlug": "basic",
  "isTrial": "yes",
  "accessEndsAt": "August 24, 2026",
  "renewalLabel": "Trial ends",
  "searchLimit": 20,
  "videoBookmarkLimit": 25,
  "searchBookmarkLimit": 15,
  "videoAnalysisLimit": 5,
  "dashboardUrl": "https://your-app.test/dashboard",
  "savedSearchesUrl": "https://your-app.test/library",
  "settingsUrl": "https://your-app.test/settings/subscription"
}
```

#### 3. Cancellation of plan

Trigger this when a subscription status changes to `canceled`, `unpaid`, or `incomplete_expired` inside `App\Services\Stripe\StripeWebhookProcessor::handleSubscriptionEvent()`.

```php
$payload = \App\Support\BrevoTransactionalEmail::subscriptionCanceled($user, $subscription);
```

Template env:

```dotenv
BREVO_TEMPLATE_ID_SUBSCRIPTION_CANCELED=125
```

Expected params:

```json
{
  "logoUrl": "https://your-app.test/brand-beacon-logo.png",
  "appName": "BrandBeacon",
  "firstName": "Jane",
  "fullName": "Jane Doe",
  "planName": "Premium",
  "accessEndsAt": "September 17, 2026",
  "dashboardUrl": "https://your-app.test/dashboard",
  "plansUrl": "https://your-app.test/plans",
  "supportEmail": "support@yourdomain.com"
}
```

#### 4. Verify email for manual account creation

Trigger this anywhere an admin or ops flow creates an account manually.

```php
$payload = \App\Support\BrevoTransactionalEmail::verifyEmail($user);
```

Template env:

```dotenv
BREVO_TEMPLATE_ID_VERIFY_EMAIL_MANUAL_ACCOUNT=126
```

The verification route is:

```text
GET /verify-email/{id}/{hash}
```

It is protected by a signed URL and expires after 7 days.

Expected params:

```json
{
  "logoUrl": "https://your-app.test/brand-beacon-logo.png",
  "appName": "BrandBeacon",
  "firstName": "Jane",
  "fullName": "Jane Doe",
  "verifyUrl": "https://your-app.test/verify-email/123/...",
  "supportEmail": "support@yourdomain.com",
  "expiresInDays": 7
}
```

#### 5. Trial ending for Basic or Premium

Trigger this from a scheduled command when a normal card-collecting trial has 3 days or 1 day remaining.

```php
$payload = \App\Support\BrevoTransactionalEmail::trialEnding($user, $subscription, $daysRemaining);
```

Template env:

```dotenv
BREVO_TEMPLATE_ID_TRIAL_ENDING=127
```

Expected params:

```json
{
  "logoUrl": "https://your-app.test/brand-beacon-logo.png",
  "appName": "BrandBeacon",
  "firstName": "Jane",
  "fullName": "Jane Doe",
  "planName": "Premium",
  "daysRemaining": 3,
  "trialEndsAt": "August 20, 2026",
  "dashboardUrl": "https://your-app.test/dashboard",
  "settingsUrl": "https://your-app.test/settings/subscription",
  "plansUrl": "https://your-app.test/plans"
}
```

#### 6. Final failed payment downgrade

Trigger this when a Stripe subscription is being moved to `free` because payment finally failed and access is ending now.

```php
$payload = \App\Support\BrevoTransactionalEmail::finalFailedPayment($user, $subscription);
```

Template env:

```dotenv
BREVO_TEMPLATE_ID_FINAL_FAILED_PAYMENT=128
```

Expected params:

```json
{
  "logoUrl": "https://your-app.test/brand-beacon-logo.png",
  "appName": "BrandBeacon",
  "firstName": "Jane",
  "fullName": "Jane Doe",
  "planName": "Premium",
  "accessEndedAt": "September 1, 2026",
  "dashboardUrl": "https://your-app.test/dashboard",
  "settingsUrl": "https://your-app.test/settings/subscription",
  "contactUrl": "https://your-app.test/contact",
  "plansUrl": "https://your-app.test/plans",
  "supportEmail": "support@yourdomain.com"
}
```

#### 7. No-card managed trial ending soon

Trigger this from the scheduled trial-ending command for managed coupon-program trials that were started without collecting a payment method, such as `/vip-subscription` or `/internal-subscription`, when they have 3 days or 1 day remaining.

```php
$payload = \App\Support\BrevoTransactionalEmail::noCardTrialEnding($user, $subscription, $daysRemaining);
```

Template env:

```dotenv
BREVO_TEMPLATE_ID_NO_CC_TRIAL_ENDING=129
```

Expected params:

```json
{
  "logoUrl": "https://your-app.test/brand-beacon-logo.png",
  "appName": "BrandBeacon",
  "firstName": "Jane",
  "fullName": "Jane Doe",
  "planName": "Basic",
  "daysRemaining": 3,
  "trialEndsAt": "September 4, 2026",
  "dashboardUrl": "https://your-app.test/dashboard",
  "settingsUrl": "https://your-app.test/settings/subscription",
  "plansUrl": "https://your-app.test/plans"
}
```

#### 8. Search done

Trigger this after a saved search finishes processing and its results page is ready.

```php
$payload = \App\Support\BrevoTransactionalEmail::searchDone($user, $search);
```

Template env:

```dotenv
BREVO_TEMPLATE_ID_SEARCH_DONE=130
BREVO_SEARCH_DONE_ENABLED=true
```

Expected params:

```json
{
  "logoUrl": "https://your-app.test/brand-beacon-logo.png",
  "appName": "BrandBeacon",
  "firstName": "Jane",
  "fullName": "Jane Doe",
  "searchName": "Rhode",
  "searchPhrase": "rhode",
  "searchType": "brand",
  "resultsCount": 14,
  "resultsUrl": "https://your-app.test/results/abcd1234efgh",
  "dashboardUrl": "https://your-app.test/dashboard",
  "latestRunAt": "September 1, 2026 2:30 PM"
}
```

### Example Brevo API call

```bash
curl --request POST \
  --url https://api.brevo.com/v3/smtp/email \
  --header 'accept: application/json' \
  --header 'api-key: YOUR_BREVO_API_KEY' \
  --header 'content-type: application/json' \
  --data '{
    "sender": {
      "name": "BrandBeacon",
      "email": "hello@yourdomain.com"
    },
    "to": [
      {
        "email": "jane@example.com",
        "name": "Jane Doe"
      }
    ],
    "subject": "Your account is ready. Let'\''s find your next winning creative.",
    "templateId": 123,
    "params": {
      "logoUrl": "https://your-app.test/brand-beacon-logo.png",
      "appName": "BrandBeacon",
      "firstName": "Jane"
    },
    "tags": ["registration", "lifecycle"]
  }'
```

### Recommended wiring

- Registration: send once after `RegisteredUserController::store()`
- Subscription started: send once after checkout finalization or only from Stripe webhook, not both
- Cancellation: send only when previous status was not canceled
- Final failed payment: send instead of the generic cancellation email when access is ending because Stripe payment recovery failed
- Verify email: send only for manually created accounts
- Trial ending: send from a scheduler with your chosen day thresholds
- No-card trial ending: use a separate template with a CTA to `/settings/subscription`
- Search done: gate behind `BREVO_SEARCH_DONE_ENABLED`, defaulting to off only when `APP_ENV=local`
