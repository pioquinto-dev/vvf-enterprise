# Email trigger points

Every Brevo template the app sends, and what fires it. One row per key, so a
question like "why did this person get the day-14 winback" has one place to go.

Keep this in step with the code. The authority for each row is the file named in
it, not this table: if they disagree, the file is right and this needs editing.

- **The same thing without the code**, for a Product Owner or anyone outside
  engineering: `docs/email-lifecycle-handover.md`
- **Copy and layout** of the templates: `docs/emails/README.md`
- **When** the scheduled ones go out: the `send_*` columns on `email_templates`,
  editable in Admin -> Email Templates, seeded from `config/email_lifecycle.php`
- **Merge fields** each one receives: `config/brevo_notifications.php` ->
  `params`, checked by `php artisan emails:audit-params`

## About the env vars

`BREVO_TEMPLATE_ID_*` are legacy seeds, not the live values. The seeder reads one
onto a row the first time that row is created and never again; after that the
Brevo ID belongs to the `email_templates` row and is edited in the admin screen.
They are listed here only because they are what you will find in `.env`.

A key with no Brevo ID on its row does not send. Scheduled ones are skipped
without claiming a send slot, so the sequence resumes intact once the ID is
entered; triggered ones log a `no_brevo_template_id` suppression and carry on.
See `docs/brevo-email-notifications.md`.

## Event-driven

No send slot. These fire when the thing happens, because holding them until the
morning would make them worse emails.

| Key | Env var | Kind | Fired by | Exact condition |
| --- | --- | --- | --- | --- |
| `new_registration` | `BREVO_TEMPLATE_ID_NEW_REGISTRATION` | Transactional | `App\Jobs\SendRegistrationEmails`, dispatched from `RegisteredUserController::store()` and `GoogleAuthController` | Every new account, either sign-up path. Queued, so it lands within seconds rather than inside the request |
| `verify_email_manual_account` | `BREVO_TEMPLATE_ID_VERIFY_EMAIL_MANUAL_ACCOUNT` | Transactional | The same job, second call | Only when dispatched with `sendVerificationEmail: true`, which is the email and password path. Google sign-ups arrive verified and skip it |
| `search_done` | `BREVO_TEMPLATE_ID_SEARCH_DONE` | Transactional | `SearchRunProcessor`, after a run is marked `STATUS_DONE` | Only when `raw_summary.free_search` is true, and only while `BREVO_SEARCH_DONE_ENABLED` is on (off by default when `APP_ENV=local`). A paid search refreshing does not email |
| `subscription_started` | `BREVO_TEMPLATE_ID_SUBSCRIPTION_STARTED` | Transactional | `BillingService`, at checkout finalisation | Only when the previous subscription was not already `active`, `trialing` or `trial`, so an upgrade does not re-welcome someone. Subject and body branch on `isTrial` |
| `payment_failed_first` | `BREVO_TEMPLATE_ID_PAYMENT_FAILED_FIRST` | Transactional | `StripeWebhookProcessor`, on `invoice.payment_failed` | Stripe's `attempt_count` is 1. Claimed in the `email_sends` ledger under `subscription:{id}:attempt:{n}`, because Stripe redelivers events and this send does not go through the dispatcher that would otherwise dedupe it |
| `payment_failed_second` | `BREVO_TEMPLATE_ID_PAYMENT_FAILED_SECOND` | Transactional | The same webhook | `attempt_count` is 2. Attempts 3 and beyond send nothing: Stripe keeps retrying, but the next email someone should get is the one that says access is ending |
| `final_failed_payment` | `BREVO_TEMPLATE_ID_FINAL_FAILED_PAYMENT` | Transactional | `StripeWebhookProcessor`, on `customer.subscription.updated` or `.deleted` | The status moves to `unpaid` or `incomplete_expired`, or `past_due` becomes `canceled`. Not sent when the subscription was already in an ended state |
| `subscription_canceled` | `BREVO_TEMPLATE_ID_SUBSCRIPTION_CANCELED` | Transactional | The same webhook branch | Access ended, but not through payment failure. The two are mutually exclusive, so one cancellation never sends both |

## Scheduled

All of these come from `lifecycle:send-due-emails`, which runs hourly and sends
only what is due in the current hour plus the catch-up window. The flow decides
who is due; the row's `send_at` decides when the dispatcher may send to them.

| Key | Env var | Kind | Flow | Trigger point |
| --- | --- | --- | --- | --- |
| `onboarding_no_search` | `BREVO_TEMPLATE_ID_ONBOARDING_NO_SEARCH` | Marketing | `OnboardingNoSearchFlow` | 2 days after `users.created_at`, and only if they have no searches of any kind. A search means they activated and the free-results flow takes over |
| `free_results_second_look` | `BREVO_TEMPLATE_ID_FREE_RESULTS_SECOND_LOOK` | Marketing | `FreeResultsFollowUpFlow` | 1 day after `last_run_at` on a done search, and the user has no `active`, `trialing`, `trial` or `past_due` subscription |
| `free_results_last_note` | `BREVO_TEMPLATE_ID_FREE_RESULTS_LAST_NOTE` | Marketing | The same flow | 3 days after, same conversion guard. Continuing to sell to someone who already bought is the fastest way to get marked as spam |
| `trial_breakout_score` | `BREVO_TEMPLATE_ID_TRIAL_BREAKOUT_SCORE` | Transactional | `TrialNudgeFlow` | Day 2 counted from `trial_started_at`, status still `trialing` or `trial` |
| `trial_day5_video_analysis` | `BREVO_TEMPLATE_ID_TRIAL_DAY5_VIDEO_ANALYSIS` | Transactional | The same flow | Day 5 |
| `trial_one_breakout` | `BREVO_TEMPLATE_ID_TRIAL_ONE_BREAKOUT` | Transactional | The same flow | Day 7, and only when there is a real breakout to show. A "look at this breakout" email with no breakout in it is worse than silence, the day before a trial ends |
| `trial_ending_cc` | `BREVO_TEMPLATE_ID_TRIAL_ENDING` | Transactional | `TrialEndingFlow` | 3 days and 1 day before `trial_ends_at`, when a card is on file |
| `trial_ending_no_cc` | `BREVO_TEMPLATE_ID_NO_CC_TRIAL_ENDING` | Transactional | The same flow | The same days, when the trial came from a managed coupon program with `collect_payment_method` false. The slot is claimed under the flow rather than the template, so a branch that flips between runs cannot send both |
| `card_expiring` | `BREVO_TEMPLATE_ID_CARD_EXPIRING` | Transactional | `CardExpiringFlow` | Exactly 7 days before the cached card lapses, which is the first of the month after `exp_month`. Reads `subscription.metadata.card` rather than calling Stripe, because a daily scan asking Stripe per subscriber would be thousands of calls to find a handful of cards. Keyed by the card's own expiry, so a replacement card earns a fresh warning and the same card is never warned about twice |
| `trial_winback_ended` | `BREVO_TEMPLATE_ID_TRIAL_WINBACK_ENDED` | Marketing | `WinbackFlow` | Day 1 after access stopped, for someone with no `invoice_paid` activity ever recorded |
| `trial_winback_missed` | `BREVO_TEMPLATE_ID_TRIAL_WINBACK_MISSED` | Marketing | The same flow | Day 7, and only when the missed-breakout count is above zero. The email is the number; without one there is nothing to send |
| `trial_winback_last_note` | `BREVO_TEMPLATE_ID_TRIAL_WINBACK_LAST_NOTE` | Marketing | The same flow | Day 21 |
| `churn_winback_ended` | `BREVO_TEMPLATE_ID_CHURN_WINBACK_ENDED` | Marketing | The same flow | Day 3 after access stopped, for someone who did pay at some point |
| `churn_winback_missed` | `BREVO_TEMPLATE_ID_CHURN_WINBACK_MISSED` | Marketing | The same flow | Day 14, same non-zero guard |
| `churn_winback_last_note` | `BREVO_TEMPLATE_ID_CHURN_WINBACK_LAST_NOTE` | Marketing | The same flow | Day 45 |
| `weekly_digest` | `BREVO_TEMPLATE_ID_WEEKLY_DIGEST` | Marketing | `WeeklyDigestFlow` | Mondays. Currently paying subscribers, plus trial users on their last refresh before the trial ends. Skipped when the week's breakout total is zero, because an empty digest is worse than no digest |
| `biweekly_pack` | `BREVO_TEMPLATE_ID_BIWEEKLY_PACK` | Marketing | `BiweeklyPackFlow` | Every second Thursday, counted in whole weeks from the anchor date so the whole list lands on the same fortnight. `active` only, and only when one of their searches produced breakouts in the 14-day window |

## Things that are easy to get wrong

**One flow, two templates.** The six winback emails and the two trial-ending
variants are the only places a flow picks its template at send time. They claim
their ledger slot under the flow, not the key, so a branch that depends on state
that can change between runs cannot send twice, once under each key.

**A lapsed account still has searches refreshing.** That is deliberate, and it is
what lets the winback emails say "you missed these" honestly. The paywall locks
the view, not the data. It is also why the weekly digest excludes lapsed
accounts: sending it would give away the thing the paywall is meant to sell.

**`SendTrialEndingEmails` is not scheduled.** It survives as a manual fallback
only. Running it alongside `lifecycle:send-due-emails` would double-send the
trial-ending reminders, because it predates the ledger and dedupes through
subscription metadata instead.

**The dispatcher claims before it sends.** If the process dies mid-send the slot
stays taken and the email is not repeated. The cost is a possible missed email
after a crash, which is the right trade here: a duplicate winback is worse than a
missing one.
