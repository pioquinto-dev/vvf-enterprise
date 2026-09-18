# -*- coding: utf-8 -*-
"""
Generates a Brevo-ready HTML file per lifecycle email.

Email clients are not browsers: Outlook ignores most modern CSS, Gmail strips
<style> in some contexts. So this uses the boring, reliable shape - nested
tables, inline styles, a 600px cap that collapses to fluid on phones, and a
<style> block only for progressive enhancement.
"""
import os, html

OUT = os.environ.get("OUT_DIR", "emails")

YELLOW, INK, MUTED, LINE, WASH, PAPER = "#FFC629", "#0B0B0B", "#57544D", "#E7E4DD", "#FFF8E6", "#FAF9F6"

def btn(label, url_param):
    # Bulletproof-ish button: a padded anchor inside its own table so Outlook
    # renders the fill rather than collapsing to bare text.
    return f"""
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:26px 0 0;">
                <tr><td align="center" bgcolor="{YELLOW}" style="border-radius:999px;">
                  <a href="{{{{ params.{url_param} }}}}" target="_blank"
                     style="display:inline-block;padding:15px 30px;font-family:Helvetica,Arial,sans-serif;font-size:16px;font-weight:bold;line-height:20px;color:#1A1400;text-decoration:none;border-radius:999px;">{html.escape(label)}</a>
                </td></tr>
              </table>"""

def para(text):
    return f"""
              <p style="margin:0 0 16px;font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:26px;color:{MUTED};">{text}</p>"""

def lead(text):
    return f"""
              <p style="margin:0 0 18px;font-family:Helvetica,Arial,sans-serif;font-size:18px;line-height:28px;color:{INK};font-weight:bold;">{text}</p>"""

def stat(value_param, label):
    return f"""
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 20px;">
                <tr><td style="padding:18px 20px;background:{WASH};border-radius:14px;">
                  <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:32px;line-height:36px;font-weight:bold;color:#6E4A00;">{{{{ params.{value_param} }}}}</p>
                  <p style="margin:4px 0 0;font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:20px;color:#5B4300;">{html.escape(label)}</p>
                </td></tr>
              </table>"""

def video(prefix, note="", score_param=None):
    # Thumbnail is width-capped and height:auto so it scales on a phone.
    score = score_param or (prefix + "Score")
    extra = f"""
                  <p style="margin:10px 0 0;font-family:Helvetica,Arial,sans-serif;font-size:13px;line-height:19px;color:#8A857C;">{html.escape(note)}</p>""" if note else ""
    return f"""
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 18px;border:1px solid {LINE};border-radius:14px;">
                <tr><td style="padding:16px;">
                  <img src="{{{{ params.{prefix}Thumbnail }}}}" alt="" width="180"
                       style="display:block;width:100%;max-width:180px;height:auto;border:0;border-radius:10px;margin:0 0 12px;">
                  <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:22px;font-weight:bold;color:{INK};">{{{{ params.{prefix}Handle }}}}</p>
                  <p style="margin:6px 0 0;font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:21px;color:{MUTED};">{{{{ params.{prefix}Caption }}}}</p>
                  <p style="margin:10px 0 0;font-family:Helvetica,Arial,sans-serif;font-size:13px;line-height:19px;color:#6E4A00;font-weight:bold;">{{{{ params.{prefix}Views }}}} views &middot; Breakout Score {{{{ params.{score} }}}}</p>{extra}
                </td></tr>
              </table>"""

def page(key, title, blocks, unsub):
    body = "".join(blocks)
    # Marketing mail carries the unsubscribe link; transactional does not.
    foot_unsub = f"""
                  <p style="margin:10px 0 0;font-family:Helvetica,Arial,sans-serif;font-size:12px;line-height:18px;color:#8A857C;">
                    Don't want these emails?
                    <a href="{{{{ params.unsubscribeUrl }}}}" style="color:#8A857C;text-decoration:underline;">Unsubscribe</a>.
                  </p>""" if unsub else ""
    return f"""<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light">
<title>{html.escape(title)}</title>
<!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
<style>
  /* Progressive enhancement only - the inline styles above carry the layout. */
  body {{ margin:0; padding:0; width:100% !important; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }}
  table {{ border-collapse:collapse !important; }}
  img {{ -ms-interpolation-mode:bicubic; }}
  a {{ text-decoration:none; }}
  @media only screen and (max-width:620px) {{
    .bb-wrap {{ width:100% !important; }}
    .bb-pad {{ padding-left:20px !important; padding-right:20px !important; }}
    .bb-h1 {{ font-size:23px !important; line-height:31px !important; }}
    .bb-btn a {{ display:block !important; width:100% !important; box-sizing:border-box; text-align:center; }}
  }}
</style>
</head>
<body style="margin:0;padding:0;background:{PAPER};">
  <!-- Inbox preview line. Editable per template in Admin -> Email Templates;
       the trailing entities stop clients pulling body copy in after it. -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;opacity:0;">{{{{ params.previewText }}}}</div>
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;opacity:0;">&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;</div>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:{PAPER};">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table role="presentation" class="bb-wrap" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;max-width:600px;background:#ffffff;border:1px solid {LINE};border-radius:18px;">
          <tr>
            <td class="bb-pad" style="padding:28px 32px 0;">
              <img src="{{{{ params.logoUrl }}}}" alt="{{{{ params.appName }}}}" width="132" style="display:block;width:132px;max-width:60%;height:auto;border:0;margin:0 0 24px;">
            </td>
          </tr>
          <tr>
            <td class="bb-pad bb-btn" style="padding:0 32px 30px;">{body}
            </td>
          </tr>
          <tr>
            <td class="bb-pad" style="padding:20px 32px 26px;border-top:1px solid {LINE};">
              <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:12px;line-height:18px;color:#8A857C;">
                Sent by {{{{ params.appName }}}}.
              </p>{foot_unsub}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""

H1 = lambda t: f"""
              <h1 class="bb-h1" style="margin:0 0 18px;font-family:Helvetica,Arial,sans-serif;font-size:26px;line-height:34px;font-weight:bold;color:{INK};letter-spacing:-0.5px;">{t}</h1>"""

P = "{{ params."
EMAILS = {}

def E(key, title, marketing, blocks):
    EMAILS[key] = (title, marketing, blocks)

# ---- onboarding -------------------------------------------------------------
E("new_registration", "Your Brand Beacon account", False, [
  H1("Your account is ready, {{ params.firstName }}"),
  para("You have one free search. Pick a brand or a product and Brand Beacon finds the videos that broke out for it, ranked by Breakout Score."),
  para("Breakout Score compares a video against what its own creator normally gets. A clip pulling 4.6M views from an account that usually gets 10k is telling you something the raw view count is not."),
  btn("Run your free search", "dashboardUrl"),
])
E("verify_email_manual_account", "Verify your email", False, [
  H1("Confirm your email address"),
  para("Tap below to activate your account. The link works for {{ params.expiresInDays }} days."),
  btn("Verify my email", "verifyUrl"),
  para("If you did not create this account you can ignore this email, or reply to {{ params.supportEmail }}."),
])
E("onboarding_no_search", "Your free search is waiting", True, [
  H1("4.6M views from an account that usually gets 10k"),
  para("That is the kind of thing a Breakout Score surfaces. Not the biggest video, the one that outperformed what its creator normally does."),
  para("Small accounts hitting numbers far above their usual range are the clearest signal there is that a format, hook or angle is transferable. Your free search is still unused."),
  btn("Run your free search", "searchUrl"),
])

# ---- free results -----------------------------------------------------------
E("search_done", "Your results are ready", False, [
  H1("{{ params.searchTerm }}: {{ params.breakoutCount }} breakouts found"),
  para("Your search finished {{ params.latestRunAt }}. The results are ranked by Breakout Score, so the top of the list is where the outperformance is, not just the view count."),
  stat("breakoutCount", "breakout videos found"),
  btn("Open your results", "resultsUrl"),
])
E("free_results_second_look", "A second look", True, [
  H1("{{ params.searchTerm }}, a second look"),
  para("One video tells you what worked once. Three or four tell you what keeps working."),
  para("Go back through your top results and look for what repeats: the first two seconds, where the product appears, whether anyone is talking. That repetition is the part you can act on."),
  stat("breakoutCount", "breakouts in this search"),
  btn("Open your results", "resultsUrl"),
  para("Tracking more than one brand or product is what a trial is for."),
])
E("free_results_last_note", "Following up", True, [
  H1("Following up on your free search"),
  para("Your results for {{ params.searchTerm }} stay where they are. Nothing expires and nothing is deleted."),
  para("What a free search cannot do is keep going. Brand Beacon refreshes tracked searches on a schedule and tells you what broke out since last time, which is where it stops being a one-off lookup."),
  btn("Try Brand Beacon for 8 days", "trialUrl"),
])

# ---- trial ------------------------------------------------------------------
E("subscription_started", "Your plan is live", False, [
  H1("You're on {{ params.planName }}"),
  para("{{ params.renewalLabel }} {{ params.accessEndsAt }}."),
  para("Worth doing in the first sitting: track the brand you work on, one competitor, and one product category. The contrast between the three is where the useful patterns show up."),
  btn("Start here", "dashboardUrl"),
])
E("trial_breakout_score", "Using Breakout Score", False, [
  H1("How to read a Breakout Score"),
  para("The score compares a video to the creator's own baseline. A 12x from a small account often matters more than a million views from an account that always gets a million."),
  para("Sort by Breakout Score rather than views, then read the top five as a set. You are looking for the thing they share, not the thing that makes each one unusual."),
  btn("Open your workspace", "dashboardUrl"),
])
E("trial_one_breakout", "One breakout worth your time", False, [
  H1("One breakout from {{ params.searchTerm }}"),
  para("This is the strongest thing your searches surfaced this week."),
  video("video", score_param="breakoutScore"),
  para("Your trial has a few days left. If this is the kind of thing you want arriving every week, that is what the weekly digest does."),
  btn("Open your workspace", "dashboardUrl"),
])
E("trial_ending_cc", "Your trial ends soon", False, [
  H1("{{ params.daysRemaining }} days left on your trial"),
  para("Your trial of {{ params.planName }} ends {{ params.trialEndsAt }}, and your plan continues from there with no action needed."),
  para("If you have not used video analysis yet, it is the part most people miss: hook, format, angle, pacing and the call to action, broken out per video."),
  btn("Continue here", "dashboardUrl"),
])
E("trial_ending_no_cc", "Add a card to keep access", False, [
  H1("{{ params.daysRemaining }} days left, and no card on file"),
  para("Your trial of {{ params.planName }} ends {{ params.trialEndsAt }}. Without a card, access stops that day and your tracked searches stop refreshing."),
  para("Your saved work stays where it is either way."),
  btn("Add a card", "settingsUrl"),
])

# ---- billing ----------------------------------------------------------------
E("payment_failed_first", "Your card did not go through", False, [
  H1("Your card did not go through"),
  para("The charge for {{ params.planName }} was declined. This is usually a bank block or an expired card rather than anything to do with your account."),
  para("Nothing has changed yet. We try again {{ params.nextAttemptAt }}."),
  btn("Update your card", "billingUrl"),
])
E("payment_failed_second", "Still having trouble", False, [
  H1("Still having trouble with your card"),
  para("The second attempt on your {{ params.planName }} charge was declined too."),
  para("If this one is not resolved, your account pauses and your tracked searches stop refreshing. Your saved searches and results are kept."),
  btn("Update your card", "billingUrl"),
])
E("final_failed_payment", "Your account has paused", False, [
  H1("Last chance before your account pauses"),
  para("We could not take payment for {{ params.planName }}, and paid access ended {{ params.accessEndedAt }}."),
  para("Everything you saved is still here. Updating your card restores access to the same workspace."),
  btn("Update your card", "settingsUrl"),
  para("If something else is going on, reply to {{ params.supportEmail }} and we will sort it out."),
])
E("card_expiring", "Your card expires soon", False, [
  H1("The card on file expires {{ params.cardExpiryDate }}"),
  para("Your {{ params.cardBrand }} ending {{ params.cardLast4 }} expires soon. After that the next charge for {{ params.planName }} will fail and your account will pause."),
  para("Updating it now takes about a minute and avoids the whole sequence."),
  btn("Update your card", "billingUrl"),
])
E("subscription_canceled", "Your plan is cancelled", False, [
  H1("Your {{ params.planName }} plan is cancelled"),
  para("Access continues until {{ params.accessEndsAt }}. Nothing is deleted when it ends."),
  btn("Back to your workspace", "dashboardUrl"),
  para("If you cancelled because something was not working, reply to {{ params.supportEmail }}. We read every one."),
])

# ---- winback ----------------------------------------------------------------
E("trial_winback_ended", "Your trial ended", True, [
  H1("Your 8-day trial ended"),
  para("Your account is paused as of {{ params.endedOn }}. Your searches, saved videos and analyses are all still there."),
  para("If you decided against it, a one-line reply telling us why is genuinely useful and we do read them."),
  btn("Subscribe", "plansUrl"),
])
E("trial_winback_missed", "Breakouts since you left", True, [
  H1("{{ params.missedCount }} breakouts since you left"),
  para("Your searches have kept running since {{ params.endedOn }}. This is what they found while your account was paused."),
  stat("missedCount", "breakouts you have not seen"),
  para("They are waiting in the same workspace you left."),
  btn("Subscribe", "plansUrl"),
])
E("trial_winback_last_note", "Last note", True, [
  H1("Last note about your trial"),
  para("This is the last email we will send about it."),
  para("Your workspace stays as you left it, and subscribing picks up from exactly there. If the timing was simply wrong, come back whenever it is not."),
  btn("Subscribe", "plansUrl"),
])
E("churn_winback_ended", "Your subscription ended", True, [
  H1("Your Brand Beacon subscription ended"),
  para("Access to {{ params.planName }} stopped on {{ params.endedOn }}. Your searches, saved videos and analyses are kept."),
  para("If there was a specific reason, reply and tell us. It is the most useful thing we get."),
  btn("Subscribe", "plansUrl"),
])
E("churn_winback_missed", "Breakouts since you cancelled", True, [
  H1("{{ params.missedCount }} breakouts since you cancelled"),
  para("Your tracked searches have kept refreshing since {{ params.endedOn }}. This is what came through while you were away."),
  stat("missedCount", "breakouts you have not seen"),
  btn("Subscribe", "plansUrl"),
])
E("churn_winback_last_note", "Last note", True, [
  H1("Last note since you cancelled"),
  para("We will stop emailing you about this after today."),
  para("Your workspace is intact and subscribing restores it as it was. No setup to redo."),
  btn("Subscribe", "plansUrl"),
])

# ---- ongoing ----------------------------------------------------------------
E("weekly_digest", "Your week", True, [
  H1("{{ params.searchTerm }}, week of {{ params.weekOf }}"),
  para("Here is what broke out across your tracked searches this week."),
  stat("breakoutCount", "breakouts this week"),
  para("<strong style=\"color:#0B0B0B;\">{{ params.brandBreakouts }}</strong> from brand searches &middot; <strong style=\"color:#0B0B0B;\">{{ params.productBreakouts }}</strong> from product searches"),
  btn("Open the full week", "libraryUrl"),
])
E("biweekly_pack", "The pack", True, [
  H1("{{ params.breakoutCount }} breakouts worth a look"),
  para("The strongest things your searches surfaced since {{ params.since }}, led by {{ params.topSubject }}."),
  video("pick1"),
  video("pick2"),
  video("pick3"),
  para("Read them as a set. What repeats across all three is the part worth copying."),
  btn("Open the full list", "libraryUrl"),
])

if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    for key, (title, marketing, blocks) in EMAILS.items():
        with open(os.path.join(OUT, key + ".html"), "w", encoding="utf-8") as fh:
            fh.write(page(key, title, blocks, marketing))
    print("generated %d templates" % len(EMAILS))
