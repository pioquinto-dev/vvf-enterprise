# Brand Beacon lifecycle email templates

25 Brevo templates, one HTML file each. Regenerate them with `python3 docs/emails/generate.py`.

The copy, subject, block order and footer line of the first 21 come from the final handover board:

  https://atienzaveejay.github.io/brandbeacon-emails/final/

That board is the source of truth for wording; `generate.py` is the source of truth for the HTML.
If the two disagree, the board wins and `generate.py` gets edited. The board's design rule is kept:
an email is type, it may add a picture and a button, nothing else.

Each file is a self-contained, mobile-friendly HTML email: table layout, inline styles, a 600px
shell that goes fluid under 620px, 16px body text and full-width buttons on a phone. A masthead
carries the wordmark and the email's one-word purpose; billing emails use the ink button, everything
else uses amber.

## Merge-field names

The board's mockups label fields in snake_case (`{{first_name}}`, `{{app_url}}`). The app sends
camelCase params, so the templates use those. The mapping for the ones that are not a straight
rename:

| Board | Template param |
| --- | --- |
| `{{app_url}}` | `dashboardUrl` |
| `{{update_card_url}}` | `billingUrl` |
| `{{purchase_url}}` | `plansUrl` |
| `{{videos_found}}` | `resultsCount` |
| `{{breakout_title_1}}` and friends | `breakout1Title`, `breakout1Handle`, `breakout1Views`, `breakout1Score`, `breakout1Thumbnail` |
| `{{own_title_1}}` / `{{comp_title_1}}` / `{{prod_title_1}}` | `own1Title` / `comp1Title` / `prod1Title` (plus `…Handle`, `…Brand`, `…Name`, `…Views`, `…Score`, `…Thumbnail`) |
| `{{breakout_url}}` | `breakoutUrl`, or `videoUrl` on the day-7 trial email |
| `{{lock_date}}`, `{{retention_days}}` | `lockDate`, `retentionDays` (from `config/email_lifecycle.php` -> `dunning`) |

Ranked sets are flattened rather than looped, because Brevo addresses params by name. Rows past the
first are wrapped in `{% if params.breakout2Title %}`, so a search with one breakout renders one row.

## Setting one up

1. Create the template in Brevo and paste the matching `.html` file in as the HTML source.
2. Ignore Brevo's own subject field. The app sends `subject` on every call, which overrides it.
   Subjects live in `config/brevo_notifications.php` and support `{{param}}` placeholders.
3. Copy the numeric ID from the Brevo edit URL (`.../templates/email/edit/16` gives `16`).
4. Enter it in Admin -> Email Templates against the matching key and enable the row.

Until step 4 is done for a template, nothing using it sends. The lifecycle dispatcher skips it
without claiming a send slot and names it in the command output, so the sequence picks up from where
it is the first time it runs after the ID is entered. Triggered emails (registration, results ready,
the Stripe dunning webhook) log a `no_brevo_template_id` suppression and carry on.

Every template also receives `logoUrl`, `appName`, `previewText` and `unsubscribeUrl`.
Marketing templates carry the unsubscribe footer and are suppressed for recipients who opted out.
Transactional templates always send, which is why billing and verification are marked that way.

The sender name and address come from `BREVO_SENDER_NAME` and `BREVO_SENDER_EMAIL`; the board mocks
them as `Ivan <ivan@brandbeacon.io>`. The still in 1b is `BREVO_EXAMPLE_IMAGE_URL` and has to stay
the video the copy's numbers describe.

## The 21 on the board

| # | Key | Kind | Goes out | Subject | Params |
| --- | --- | --- | --- | --- | --- |
| 1a | `new_registration` | Transactional | About 3 hours after signup | Your BrandBeacon account | `dashboardUrl`, `firstName`, `fullName`, `loginUrl`, `plansUrl` |
| 1b | `onboarding_no_search` | Marketing | Day 2 after signup, 08:05 (skipped once they search) | 4.6M views from an account that usually gets 10k | `dashboardUrl`, `exampleImageUrl`, `firstName`, `fullName`, `searchUrl` |
| 2a | `search_done` | Transactional | Immediately on search completion | {{searchTerm}}: {{breakoutCount}} viral breakouts found | `breakout1Handle`, `breakout1Score`, `breakout1Thumbnail`, `breakout1Title`, `breakout1Views`, `breakout2Handle`, `breakout2Score`, `breakout2Thumbnail`, `breakout2Title`, `breakout2Views`, `breakout3Handle`, `breakout3Score`, `breakout3Thumbnail`, `breakout3Title`, `breakout3Views`, `breakoutCount`, `dashboardUrl`, `firstName`, `fullName`, `latestRunAt`, `resultsCount`, `resultsUrl`, `searchName`, `searchPhrase`, `searchTerm`, `searchType` |
| 2b | `free_results_second_look` | Marketing | Day 1 after results, 09:12 | {{searchTerm}}, a second look | `breakoutCount`, `firstName`, `fullName`, `plansUrl`, `resultsUrl`, `searchTerm`, `trialUrl` |
| 2c | `free_results_last_note` | Marketing | Day 3 after results, 09:30 | Following up on your free search | `breakoutCount`, `firstName`, `fullName`, `plansUrl`, `resultsUrl`, `searchTerm`, `trialUrl` |
| 3a | `subscription_started` | Transactional | Immediately on trial or plan start | {{startHeadline}} | `accessEndsAt`, `dashboardUrl`, `firstName`, `fullName`, `isTrial`, `planName`, `planSlug`, `renewalLabel`, `savedSearchesUrl`, `searchBookmarkLimit`, `searchLimit`, `settingsUrl`, `startHeadline`, `videoAnalysisLimit`, `videoBookmarkLimit` |
| 3b | `trial_breakout_score` | Transactional | Trial day 2, 07:40 | How to use Breakout Score on your trial | `dashboardUrl`, `firstName`, `fullName`, `libraryUrl`, `planName` |
| 3c | `trial_day5_video_analysis` | Transactional | Trial day 5, 07:40 | A few days left on your 8-day trial | `dashboardUrl`, `firstName`, `fullName`, `libraryUrl`, `planName` |
| 3d | `trial_one_breakout` | Transactional | Trial day 7, 09:00 | One breakout from {{searchTerm}} | `breakoutScore`, `dashboardUrl`, `firstName`, `fullName`, `resultsUrl`, `searchTerm`, `videoCaption`, `videoHandle`, `videoThumbnail`, `videoUrl`, `videoViews` |
| 4a | `payment_failed_first` | Transactional | First failed payment, immediately | Your card did not go through | `amount`, `attempt`, `billingUrl`, `cardLast4`, `dashboardUrl`, `firstName`, `fullName`, `lockDate`, `nextAttemptAt`, `planName`, `supportEmail` |
| 4b | `payment_failed_second` | Transactional | 2 days after the first failure, 06:12 | Still having trouble with your card | `amount`, `attempt`, `billingUrl`, `cardLast4`, `dashboardUrl`, `firstName`, `fullName`, `lockDate`, `nextAttemptAt`, `planName`, `supportEmail` |
| 4c | `final_failed_payment` | Transactional | 5 days after the first failure, 06:12 | Last chance before your account pauses | `accessEndedAt`, `billingUrl`, `cardLast4`, `contactUrl`, `dashboardUrl`, `firstName`, `fullName`, `lockDate`, `planName`, `plansUrl`, `retentionDays`, `settingsUrl`, `supportEmail` |
| 4z | `card_expiring` | Transactional | 7 days before the card expires, 06:00 | The card on file expires on {{cardExpiryDate}} | `amount`, `billingUrl`, `cardBrand`, `cardExpiryDate`, `cardLast4`, `firstName`, `fullName`, `nextChargeDate`, `planName`, `supportEmail` |
| 5a | `trial_winback_ended` | Marketing | Day 1 after the trial ended, 09:00 | Your 8-day trial ended | `breakoutScore`, `breakoutThumbnail`, `breakoutTitle`, `breakoutUrl`, `competitorBreakouts`, `contactUrl`, `dashboardUrl`, `endedOn`, `firstName`, `fullName`, `libraryUrl`, `missedCount`, `planName`, `plansUrl`, `searchTerm`, `trialBreakouts`, `trialSearches`, `trialVideos` |
| 5b | `trial_winback_missed` | Marketing | Day 7 after the trial ended, 08:30 | {{missedCount}} breakouts since you left | `breakoutScore`, `breakoutThumbnail`, `breakoutTitle`, `breakoutUrl`, `competitorBreakouts`, `contactUrl`, `dashboardUrl`, `endedOn`, `firstName`, `fullName`, `libraryUrl`, `missedCount`, `planName`, `plansUrl`, `searchTerm`, `trialBreakouts`, `trialSearches`, `trialVideos` |
| 5c | `trial_winback_last_note` | Marketing | Day 21 after the trial ended, 09:00 | Last note about your trial | `breakoutScore`, `breakoutThumbnail`, `breakoutTitle`, `breakoutUrl`, `competitorBreakouts`, `contactUrl`, `dashboardUrl`, `endedOn`, `firstName`, `fullName`, `libraryUrl`, `missedCount`, `planName`, `plansUrl`, `searchTerm`, `trialBreakouts`, `trialSearches`, `trialVideos` |
| 6a | `churn_winback_ended` | Marketing | Day 3 after cancellation, 09:00 | Your Brand Beacon subscription ended | `breakoutScore`, `breakoutThumbnail`, `breakoutTitle`, `breakoutUrl`, `competitorBreakouts`, `contactUrl`, `dashboardUrl`, `endedOn`, `firstName`, `fullName`, `libraryUrl`, `missedCount`, `planName`, `plansUrl`, `searchTerm`, `trialBreakouts`, `trialSearches`, `trialVideos` |
| 6b | `churn_winback_missed` | Marketing | Day 14 after cancellation, 08:30 | {{missedCount}} breakouts since you cancelled | `breakoutScore`, `breakoutThumbnail`, `breakoutTitle`, `breakoutUrl`, `competitorBreakouts`, `contactUrl`, `dashboardUrl`, `endedOn`, `firstName`, `fullName`, `libraryUrl`, `missedCount`, `planName`, `plansUrl`, `searchTerm`, `trialBreakouts`, `trialSearches`, `trialVideos` |
| 6c | `churn_winback_last_note` | Marketing | Day 45 after cancellation, 09:00 | Last note since you cancelled | `breakoutScore`, `breakoutThumbnail`, `breakoutTitle`, `breakoutUrl`, `competitorBreakouts`, `contactUrl`, `dashboardUrl`, `endedOn`, `firstName`, `fullName`, `libraryUrl`, `missedCount`, `planName`, `plansUrl`, `searchTerm`, `trialBreakouts`, `trialSearches`, `trialVideos` |
| 7a | `weekly_digest` | Marketing | Every Monday, 07:00 | {{searchTerm}}, week of {{weekOf}}: {{breakoutCount}} viral breakouts | `breakoutCount`, `comp1Brand`, `comp1Score`, `comp1Thumbnail`, `comp1Title`, `comp1Views`, `dashboardUrl`, `firstName`, `fullName`, `libraryUrl`, `newCreators`, `own1Handle`, `own1Score`, `own1Thumbnail`, `own1Title`, `own1Views`, `planName`, `prod1Name`, `prod1Score`, `prod1Thumbnail`, `prod1Title`, `prod1Views`, `resultsCount`, `resultsUrl`, `searchTerm`, `weekOf` |
| 8a | `biweekly_pack` | Marketing | Every 2 weeks on Thursday, 08:00 | {{searchTerm}}: {{breakoutCount}} breakouts worth a look | `breakoutCount`, `dashboardUrl`, `firstName`, `fullName`, `libraryUrl`, `pick1Caption`, `pick1Handle`, `pick1Score`, `pick1Subject`, `pick1Thumbnail`, `pick1Views`, `pick2Caption`, `pick2Handle`, `pick2Score`, `pick2Subject`, `pick2Thumbnail`, `pick2Views`, `pick3Caption`, `pick3Handle`, `pick3Score`, `pick3Subject`, `pick3Thumbnail`, `pick3Views`, `planName`, `plansUrl`, `resultsUrl`, `searchTerm`, `takeaway` |

## Four that are not on the board

Kept because the app cannot run without them. Their copy is written in the same voice but is not
taken from the board, so it is not held to it.

| Key | Kind | Goes out | Subject | Params |
| --- | --- | --- | --- | --- |
| `verify_email_manual_account` | Transactional | Immediately on signup | Verify your email to activate your account | `expiresInDays`, `firstName`, `fullName`, `supportEmail`, `verifyUrl` |
| `subscription_canceled` | Transactional | Immediately on cancellation | Your plan has been canceled | `accessEndsAt`, `dashboardUrl`, `firstName`, `fullName`, `planName`, `plansUrl`, `supportEmail` |
| `trial_ending_cc` | Transactional | 3 days before the trial ends, 07:40 | Your trial is ending soon | `dashboardUrl`, `daysRemaining`, `firstName`, `fullName`, `planName`, `plansUrl`, `settingsUrl`, `trialEndsAt` |
| `trial_ending_no_cc` | Transactional | 3 days before the trial ends, 07:40 | Add your card to keep paid access after your trial | `dashboardUrl`, `daysRemaining`, `firstName`, `fullName`, `planName`, `plansUrl`, `settingsUrl`, `trialEndsAt` |

## What fires each one

`docs/email-trigger-points.md` lists every key against the code that sends it and
the condition it sends under.

## Where the schedule lives

On the template row, in `email_templates`, editable in Admin -> Email Templates: `send_trigger`,
`send_offset_days`, `send_at`, `send_weekday`, `send_interval_weeks`, `send_anchor_date`,
`send_immediate` and an optional `send_timezone`. The "Goes out" column in the table above is what
those rows are seeded with, not a hard-coded fact, so check the admin screen for what is live.

`config/email_lifecycle.php` -> `schedule` holds the same values as the seed and the fallback. A row
with nothing set falls back to it, which is what keeps an un-migrated environment working. Slots are
read in the row's timezone, or `LIFECYCLE_EMAIL_TIMEZONE` (default `America/New_York`).

`lifecycle:send-due-emails` runs hourly and sends only what is due in the current hour, plus
`LIFECYCLE_EMAIL_CATCH_UP_HOURS` (default 6) so a skipped run does not drop a day of mail. The
`email_sends` ledger is what keeps one email per recipient per stage however often the command runs.
