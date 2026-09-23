# Lifecycle email: what the system sends, and when

A handover for the Product Owner. This describes the emails the platform sends
today, the conditions each one waits for, and the checks that run before any of
them goes out. No code in it.

The engineering reference is `docs/email-trigger-points.md`. If the two ever
disagree, that one is right and this one needs updating.

**In one line:** 25 emails across eight journeys, 21 of them from the agreed
handover board plus four operational ones the product cannot run without. Eight
fire the moment something happens; the other seventeen are found by an hourly
sweep and sent in their own time slot.

## The eight journeys

### 1. Signed up, has not searched yet

| When | Email | Sent only if |
| --- | --- | --- |
| About 3 hours after signup | Account is ready, one free search waiting | Always, both sign-up methods |
| Day 2 | A worked example of what a Breakout Score catches | They still have no searches of any kind |

If they run a search, journey 2 takes over and this one stops.

### 2. Free search, results ready

| When | Email | Sent only if |
| --- | --- | --- |
| Immediately | Results ready, with the three strongest breakouts | The search was a free search, not a paid refresh |
| Day 1 | A second look at the same results | They have not started a trial or subscribed |
| Day 3 | Last note, with the trial offer | Same |

Both follow-ups stop the moment someone converts. Continuing to sell to a
customer who has already bought is the fastest way to get marked as spam.

### 3. Inside the 8-day trial

| When | Email | Sent only if |
| --- | --- | --- |
| Day 0 | Welcome, plus three searches worth running today | The account was not already on a paid plan |
| Day 2 | How to read a Breakout Score | Trial still running |
| Day 5 | What video analysis gives you | Trial still running |
| Day 7 | One real breakout from their own searches | There is an actual breakout to show |

Day 7 sends nothing when the account has no breakout worth naming. A "look at
this breakout" email with no breakout in it is worse than silence, and it lands
the day before the trial ends, when credibility matters most.

Separately, 3 days and 1 day before the trial ends, one of two reminders goes
out depending on whether a card is on file. Someone never receives both.

### 4. Payment trouble

| When | Email | Sent only if |
| --- | --- | --- |
| First failed charge | The card did not go through, nothing has changed yet | Stripe reports attempt 1 |
| 2 days later | Still having trouble, names the date access pauses | Stripe reports attempt 2 |
| 5 days later | Last chance before the account pauses | Access actually ends |
| 7 days before the card expires | Heads-up, with the amount and next charge date | A card is on file with a readable expiry |

Attempts 3 and beyond send nothing. Stripe keeps retrying quietly; the next
thing the customer hears is the notice that access is ending.

If access ends for a reason other than payment failure, they get the
cancellation confirmation instead. Never both for the same cancellation.

### 5. Trial ended without buying

Day 1, day 7 and day 21 after access stopped. The day 7 email leads on the
number of breakouts they have missed since leaving, and is skipped entirely when
that number is zero. Day 21 sums up what the eight days actually produced and
says it is the last one.

Only for accounts that never paid. Anyone who has ever had a successful invoice
goes into journey 6 instead, and nobody is ever in both.

### 6. A paying subscription ended

Day 3, day 14 and day 45 after access stopped. Day 14 leads on missed breakouts
and how many of them named a competitor rather than them, and is skipped when
there is nothing to report. Day 45 says it is the last one.

### 7. Weekly digest

Every Monday morning, to people currently paying plus trial users on their last
refresh before the trial ends. Three sections: their own brand, the competitors
they watch, their products.

Skipped when nothing broke out that week. An empty digest is worse than no
digest.

Deliberately not sent to lapsed accounts. Their searches do keep refreshing,
which is what lets the winback emails honestly say "you missed these", but
sending them the digest would give away the thing the paywall is meant to sell.

### 8. Fortnightly pack

Every second Thursday, to active subscribers. One brand or product per pack,
with the three strongest breakouts on it from the last two weeks.

The fortnight is counted from a fixed anchor date, so the whole list gets it on
the same Thursday rather than each person drifting onto their own cycle.

### The four that are not on the board

Email verification, cancellation confirmation, and the two trial-ending
reminders. They are not part of the lifecycle story but the product cannot run
without them.

## What the system checks before sending anything

In this order. The first one that fails stops the email.

1. **Is this person due?** The journey rules above. This is the only step that
   looks at who they are and what they have done.
2. **Is it the right hour?** Every email has its own send slot, for example
   7:00am Monday for the weekly digest and 6:12am for payment notices. The
   sweep runs hourly and only sends what is due in the current hour, plus a
   grace window so a missed run does not lose a day of mail.
3. **Is the template ready?** An email whose Brevo template has not been linked
   yet, or that has been switched off or deleted, is passed over. Nothing is
   recorded, so the person keeps their place in the sequence and gets the email
   on the first run after it is linked.
4. **Has it already gone?** Every send is recorded against the person and the
   stage. The record is written before the send, not after, so a crash mid-send
   loses one email rather than sending it twice. A duplicate winback is worse
   than a missing one.
5. **Have they opted out?** Marketing emails are suppressed for anyone who
   unsubscribed. Transactional emails are not, which is why someone who
   unsubscribed from winback still gets told their card failed.

Marketing emails carry the unsubscribe footer. Transactional ones, meaning
billing, verification, results ready and the trial and plan notices, do not.

## What you can change without engineering

In the admin screen, under Email Templates, per email:

- **Subject line and preview text:** including the merge fields, for example the
  search term and the breakout count.
- **When it goes out:** the day offset, the time of day, the weekday and the
  fortnight interval for the recurring ones.
- **On or off:** switching one off stops it sending immediately.
- **Which Brevo template it uses:** the template ID.
- **Extra merge fields:** switched on from a library, sent at once, no deploy.

### What still needs engineering

- **The wording and layout inside the email:** the templates are built and
  pasted into Brevo from the repository, so a copy change is a small code
  change, not an admin edit.
- **Who qualifies:** the journey rules above, for example "day 7 only if there
  is a breakout to show".
- **A new email in a journey:** new template, new rule, new row.

## Current status

- **All 25 emails are built and wired.** Copy matches the final handover board
  for the 21 that came from it.
- **Brevo template IDs still need entering** for any email that has not been
  built in Brevo yet. Until an ID is entered, that email does not send and does
  not consume anyone's place in the sequence.
- **One image asset is outstanding.** The day-2 onboarding email refers to a
  specific example video, and the still for it has not been uploaded. Its copy
  quotes that video's numbers, so it has to be that video's still rather than
  any thumbnail.
- **Video stills come from TikTok's CDN** and expire on their own. A scheduled
  job refreshes them twice a day, and an email that catches a row mid-expiry
  leaves the picture out rather than showing a broken image.
- **Links to a video are permalinks**, the short tiktok.com address, not the
  internal media link. The internal one runs to hundreds of characters, expires
  within days, and would read as a wall of noise in the middle of a sentence.

## Previewing before launch

Engineering can send a filled-in preview of any email, or all of them, to a test
inbox, optionally using a real account's searches and breakouts as the content.
The preview reports which emails were skipped and why, and names any merge field
that came through empty, since a blank field looks identical to a broken one.

Worth doing for the whole set once the Brevo IDs are in, and again after any
subject or schedule change.

## Two things worth knowing

**Nobody gets the same email twice.** Timing changes, an admin edit mid-flight,
a duplicate webhook from Stripe, a sweep that runs more often than expected:
none of these produce a second copy, because the record of the send is what
decides, not the schedule.

**Nobody is in two winback journeys at once.** Whether an account ever paid is
what decides which sequence it enters, and an account that resubscribes drops
out of both.
