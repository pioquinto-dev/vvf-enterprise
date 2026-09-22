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

### See also

- `docs/email-trigger-points.md` — every template and what fires it, one row per key
- `docs/emails/README.md` — the HTML templates, their copy and their merge fields

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
- Trial ending: handled by `TrialEndingFlow`, at the day thresholds in `config/email_lifecycle.php`
- No-card trial ending: use a separate template with a CTA to `/settings/subscription`
- Search done: gate behind `BREVO_SEARCH_DONE_ENABLED`, defaulting to off only when `APP_ENV=local`


## Lifecycle scheduling

The 21 emails on the [final handover board](https://atienzaveejay.github.io/brandbeacon-emails/final/)
are timed, not just triggered, and the timing lives in one file.

### Where it lives

**The schedule lives on the template row.** `email_templates` carries it per key:

| Column | Meaning |
| --- | --- |
| `send_trigger` | What the offset counts from: `signup`, `search_completed`, `trial_start`, `trial_end`, `payment_failed`, `card_expiry`, `access_ended`, `cancellation`, or `cadence` |
| `send_offset_days` | Days after the trigger. Negative counts backwards from a future date, so `-7` is a week before the card expires |
| `send_offset_hours` | Hours, for the one email measured that way (registration, about 3 hours after signup) |
| `send_at` | The wall-clock slot, `HH:MM`. Blank means no slot |
| `send_weekday` | Cadence emails only |
| `send_interval_weeks` | `1` or blank is weekly, `2` fortnightly |
| `send_anchor_date` | The fortnight the interval counts from, so the whole list lands on the same one |
| `send_immediate` | Event-driven mail that must not wait for a slot |
| `send_timezone` | Per-template override of the lifecycle timezone. Almost always blank |

All of it is editable in **Admin -> Email Templates**, in the same drawer as the subject and preview
text, which is the point: "move the winback to day 10" and "send the digest at 8" are editorial
changes and should not need a deploy. The drawer states the schedule in a sentence above the fields
and says whether the row or config is currently answering.

`config/email_lifecycle.php` is now the **seed and the fallback**, not the live values:

- **`schedule`** — the defaults from the handover board. The migration and the seeder copy these onto
  new rows; `LifecycleSchedule` only reads them when a row has nothing set, so an environment that
  has not run the schedule migration keeps the timings it shipped with. Changing an entry here
  changes what a fresh install starts with, not when an email goes out now.
- **`flows`** — the classes the dispatcher runs. Each implements `App\Services\Lifecycle\LifecycleFlow`
  and answers only "whose turn is it". Dedupe, suppression, the send window and logging belong to
  `LifecycleDispatcher`.
- **`timezone`** and **`catch_up_hours`** — whole-schedule settings, so they stay in config.
- **`dunning`** — `lock_after_days` and `retention_days`. All three dunning emails quote the same
  deadline and the same retention window, so the numbers live here rather than in three templates.

`App\Services\Lifecycle\LifecycleSchedule` is the only reader, and it goes through
`EmailTemplateRegistry`, so it inherits the same five-minute cache and the same database-unreachable
fallback the rest of the registry has. Flows call `offsetDays()` and `stages()` instead of holding
their own constants, and `describe()` renders the schedule as a sentence, so what an admin is told
and what runs cannot drift apart.

Editing a schedule clears the registry cache, so the next hourly run uses it.

### How a slot is evaluated

`lifecycle:send-due-emails` is scheduled **hourly**. For each candidate a flow offers, the dispatcher
checks `LifecycleSchedule::slotIsOpen()`:

- an `immediate` template, or one with no `at`, is always open;
- a cadence template must match its weekday, and for `interval_weeks > 1` the whole weeks since
  `anchor` must divide evenly, so "every two weeks" means the same fortnight for the whole list
  rather than drifting per recipient;
- otherwise the current time must be at or after the slot and within
  `LIFECYCLE_EMAIL_CATCH_UP_HOURS` (default 6) of it.

Slots are read in the row's `send_timezone`, or `LIFECYCLE_EMAIL_TIMEZONE` (default
`America/New_York`) when it is blank — not `app.timezone`, which is UTC here. Dates rendered into email copy use the same zone, so "we will try again on March 4"
matches the day it actually happens.

A candidate outside its window is **deferred**: no ledger row is written, so a later run the same day
still sends it. The `email_sends` unique index is what guarantees one email per recipient per stage
however often the command fires, which is what makes running it hourly, or by hand, safe.

### Before the Brevo IDs exist

A template with no `brevo_template_id` in `email_templates` cannot render, so nothing using it sends:

- **Lifecycle flows** — the dispatcher checks `EmailTemplateRegistry::isSendable()` before claiming a
  slot and skips the candidate outright. Nothing is claimed and nothing is logged as an error, so the
  first run after the ID is entered picks the sequence up where it is. The command names the held-back
  templates in its output, and the dispatcher logs them once per run as
  `lifecycle.send.unmapped_templates`.
- **Triggered sends** (registration, results ready, the Stripe dunning webhook) — treated as a
  deliberate non-send by `BrevoLifecycleEmailService`, logged as a suppression with
  `reason: no_brevo_template_id`. They run inside web requests, so an unbuilt template must not turn
  a user-facing action into a 500.

Enter the IDs in Admin -> Email Templates. `php artisan db:seed --class=EmailTemplateSeeder` creates
any missing rows, seeds their schedule from config, and lists the keys still waiting for a Brevo ID
and the ones with no send slot. It never overwrites an ID, a subject or a schedule an admin has set:
a seeder that reasserted the config timings would undo every deliberate change to when an email goes
out.

### Checking the merge fields

`php artisan emails:audit-params` compares the `params` each template declares in
`config/brevo_notifications.php` against what `BrevoTransactionalEmail` actually sends. Params built
in a loop rather than written out as literals — the ranked `breakout1Title` sets, the weekly digest's
three sections — are declared in that command's `COMPUTED` map. Adding a slot means adding it there
too, because the declaration is what the admin drawer shows, and a field that is listed but never
sent renders as a blank space in a live email.


## Previewing a template

```
php artisan testing:send-brevo-email                      # every template, sample data
php artisan testing:send-brevo-email weekly_digest        # one template
php artisan testing:send-brevo-email all --user-id=412    # real account's data, sent to the test inbox
php artisan testing:send-brevo-email all --dry-run        # build and report, send nothing
```

Recipient is `BREVO_TEST_RECIPIENT_EMAIL` unless `--email=` says otherwise. This never touches the
`email_sends` ledger, so previewing does not consume anyone's real send slot.

### What it skips, and why

A template is skipped, with the reason printed, when its row is soft-deleted, has no Brevo template
ID, or is disabled. Those need different fixes, so they are reported separately rather than as one
"cannot send". Pass `--include-unsendable` to attempt them anyway and see the failure.

### `--user-id`

Reads that account's subscription, its search with the most breakouts, and the real videos under it,
and puts them in an email addressed to the test recipient. It borrows the data; it does not email the
account. Anything the account does not have — no subscription, no cached card, no searches, no
visible breakouts — falls back to a sample value, and the command says which substitutions it made.
A count that comes back zero also falls back, because zero in a preview reads as a bug rather than as
a fact.

### Completeness

`App\Support\EmailSampleData` holds one branch per template key and is checked against the registry,
so a new template with no preview branch is reported rather than silently skipped. After each send the
command names any declared merge field that went out empty. That is the point of the command: a blank
field renders as a gap that looks exactly like a broken tag, so a preview that does not tell you which
fields were blank is a preview you cannot trust.

One branch it cannot reach: `subscription_started` previews the trial wording, since it is built from
a trialing subscription. The paid variant of that template renders from the same file with `isTrial`
set to `no`.
