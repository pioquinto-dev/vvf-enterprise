# Brand Beacon lifecycle email templates

24 Brevo templates, one HTML file each. Regenerate them with `python3 docs/emails/generate.py`.

Each file is a self-contained, mobile-friendly HTML email: table layout, inline styles, a 600px
shell that goes fluid under 620px, 16px body text and full-width buttons on a phone.

## Setting one up

1. Create the template in Brevo and paste the matching `.html` file in as the HTML source.
2. Ignore Brevo's own subject field. The app sends `subject` on every call, which overrides it. Subjects live in `config/brevo_notifications.php` and support `{{param}}` placeholders.
3. Copy the numeric ID from the Brevo edit URL (`.../templates/email/edit/16` gives `16`).
4. Enter it in Admin -> Email Templates against the matching key and enable the row.

Every template also receives `logoUrl`, `appName` and `unsubscribeUrl`.
Marketing templates carry the unsubscribe footer and are suppressed for recipients who opted out.
Transactional templates always send, which is why billing and verification are marked that way.

| Key | Name | Kind | Subject | Params |
| --- | --- | --- | --- | --- |
| `new_registration` | Account created | Transactional | Your account is ready. Let’s find your next winning creative. | `dashboardUrl`, `firstName`, `fullName`, `loginUrl`, `plansUrl` |
| `verify_email_manual_account` | Verify email address | Transactional | Verify your email to activate your account | `expiresInDays`, `firstName`, `fullName`, `supportEmail`, `verifyUrl` |
| `onboarding_no_search` | Signed up, no search yet | Marketing | Your free search is still waiting | `dashboardUrl`, `firstName`, `fullName`, `searchUrl` |
| `search_done` | Search results ready | Transactional | {{searchTerm}}: {{breakoutCount}} viral breakouts found | `breakoutCount`, `dashboardUrl`, `firstName`, `fullName`, `latestRunAt`, `resultsCount`, `resultsUrl`, `searchName`, `searchPhrase`, `searchTerm`, `searchType` |
| `free_results_second_look` | Free results, second look | Marketing | {{searchTerm}}, a second look | `breakoutCount`, `firstName`, `fullName`, `plansUrl`, `resultsUrl`, `searchTerm`, `trialUrl` |
| `free_results_last_note` | Free results, last note | Marketing | Following up on your free search | `breakoutCount`, `firstName`, `fullName`, `plansUrl`, `resultsUrl`, `searchTerm`, `trialUrl` |
| `subscription_started` | Subscription started | Transactional | Your plan is live. Here’s what you can do now. | `accessEndsAt`, `dashboardUrl`, `firstName`, `fullName`, `isTrial`, `planName`, `planSlug`, `renewalLabel`, `savedSearchesUrl`, `searchBookmarkLimit`, `searchLimit`, `settingsUrl`, `videoAnalysisLimit`, `videoBookmarkLimit` |
| `trial_breakout_score` | Trial day 2: Breakout Score | Transactional | How to use Breakout Score on your trial | `dashboardUrl`, `firstName`, `fullName`, `libraryUrl`, `planName` |
| `trial_one_breakout` | Trial day 7: one breakout | Transactional | One breakout from {{searchTerm}} | `breakoutScore`, `dashboardUrl`, `firstName`, `fullName`, `resultsUrl`, `searchTerm`, `videoCaption`, `videoHandle`, `videoThumbnail`, `videoViews` |
| `trial_ending_cc` | Trial ending (card on file) | Transactional | Your trial is ending soon | `dashboardUrl`, `daysRemaining`, `firstName`, `fullName`, `planName`, `plansUrl`, `settingsUrl`, `trialEndsAt` |
| `trial_ending_no_cc` | Trial ending (no card on file) | Transactional | Add your card to keep paid access after your trial | `dashboardUrl`, `daysRemaining`, `firstName`, `fullName`, `planName`, `plansUrl`, `settingsUrl`, `trialEndsAt` |
| `payment_failed_first` | Card declined (1st attempt) | Transactional | Your card did not go through | `attempt`, `billingUrl`, `dashboardUrl`, `firstName`, `fullName`, `nextAttemptAt`, `planName`, `supportEmail` |
| `payment_failed_second` | Card declined (2nd attempt) | Transactional | Still having trouble with your card | `attempt`, `billingUrl`, `dashboardUrl`, `firstName`, `fullName`, `nextAttemptAt`, `planName`, `supportEmail` |
| `final_failed_payment` | Final payment failure | Transactional | Your paid access is ending due to a final payment failure | `accessEndedAt`, `contactUrl`, `dashboardUrl`, `firstName`, `fullName`, `planName`, `plansUrl`, `settingsUrl`, `supportEmail` |
| `card_expiring` | Card expiring soon | Transactional | The card on file expires on {{cardExpiryDate}} | `billingUrl`, `cardBrand`, `cardExpiryDate`, `cardLast4`, `firstName`, `fullName`, `planName`, `supportEmail` |
| `subscription_canceled` | Subscription canceled | Transactional | Your plan has been canceled | `accessEndsAt`, `dashboardUrl`, `firstName`, `fullName`, `planName`, `plansUrl`, `supportEmail` |
| `trial_winback_ended` | Trial ended (day 1) | Marketing | Your 8-day trial ended | `contactUrl`, `dashboardUrl`, `endedOn`, `firstName`, `fullName`, `libraryUrl`, `missedCount`, `planName`, `plansUrl` |
| `trial_winback_missed` | Trial winback, missed breakouts (day 7) | Marketing | {{missedCount}} breakouts since you left | `contactUrl`, `dashboardUrl`, `endedOn`, `firstName`, `fullName`, `libraryUrl`, `missedCount`, `planName`, `plansUrl` |
| `trial_winback_last_note` | Trial winback, last note (day 21) | Marketing | Last note about your trial | `contactUrl`, `dashboardUrl`, `endedOn`, `firstName`, `fullName`, `libraryUrl`, `missedCount`, `planName`, `plansUrl` |
| `churn_winback_ended` | Subscription ended (day 3) | Marketing | Your Brand Beacon subscription ended | `contactUrl`, `dashboardUrl`, `endedOn`, `firstName`, `fullName`, `libraryUrl`, `missedCount`, `planName`, `plansUrl` |
| `churn_winback_missed` | Churn winback, missed breakouts (day 14) | Marketing | {{missedCount}} breakouts since you cancelled | `contactUrl`, `dashboardUrl`, `endedOn`, `firstName`, `fullName`, `libraryUrl`, `missedCount`, `planName`, `plansUrl` |
| `churn_winback_last_note` | Churn winback, last note (day 45) | Marketing | Last note since you cancelled | `contactUrl`, `dashboardUrl`, `endedOn`, `firstName`, `fullName`, `libraryUrl`, `missedCount`, `planName`, `plansUrl` |
| `weekly_digest` | Weekly digest | Marketing | {{searchTerm}}, week of {{weekOf}}: {{breakoutCount}} viral breakouts | `brandBreakouts`, `breakoutCount`, `dashboardUrl`, `firstName`, `fullName`, `libraryUrl`, `planName`, `productBreakouts`, `searchTerm`, `weekOf` |
| `biweekly_pack` | Bi-weekly pack | Marketing | {{breakoutCount}} breakouts worth a look | `breakoutCount`, `dashboardUrl`, `firstName`, `fullName`, `libraryUrl`, `pick1Caption`, `pick1Handle`, `pick1Score`, `pick1Subject`, `pick1Thumbnail`, `pick1Views`, `pick2Caption`, `pick2Handle`, `pick2Score`, `pick2Subject`, `pick2Thumbnail`, `pick2Views`, `pick3Caption`, `pick3Handle`, `pick3Score`, `pick3Subject`, `pick3Thumbnail`, `pick3Views`, `planName`, `since`, `topSubject` |
