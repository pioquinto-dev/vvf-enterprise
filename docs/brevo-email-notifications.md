## Brevo email notifications

This project now has a Brevo-ready notification pack for five lifecycle emails:

- New registration
- New subscription paid or trial started
- Cancellation of plan
- Verify email for manual account creation
- Trial ending for Basic or Premium

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
  "savedSearchesUrl": "https://your-app.test/bookmark",
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

Trigger this from a scheduled command when a `trialing` subscription on `basic` or `premium` is 3 days, 1 day, or 0 days from `current_period_ends_at`.

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
- Verify email: send only for manually created accounts
- Trial ending: send from a scheduler with your chosen day thresholds
