# -*- coding: utf-8 -*-
"""
Generates a Brevo-ready HTML file per lifecycle email.

The copy, subject, order of blocks and footer line of every template here are
taken from the final handover board:

    https://atienzaveejay.github.io/brandbeacon-emails/final/

That board is the source of truth for wording. This file is the source of truth
for the HTML, because email clients are not browsers: Outlook ignores most
modern CSS and Gmail strips <style> in some contexts. So the handover's layout
is rebuilt with the boring, reliable shape - nested tables, inline styles, a
600px cap that collapses to fluid on phones, and a <style> block only for
progressive enhancement.

The handover's design rule is kept: an email is type. It may add a picture and
a button. Nothing else.

Merge-field names are the app's camelCase params (firstName, dashboardUrl),
not the board's snake_case mockup labels; the mapping is documented in
README.md next to this file.

    python3 docs/emails/generate.py          # writes ./emails
    OUT_DIR=docs/emails python3 docs/emails/generate.py
"""
import os, html

OUT = os.environ.get("OUT_DIR", "emails")

# Palette lifted from the handover board.
INK      = "#0B0B0B"
BODY     = "#1A1813"
AMBER    = "#FFC629"
MUTED    = "#5C5A54"
LINE     = "#EAE7E0"
PAPER    = "#F5F4F0"
MONO     = "#945E00"

FONT = "-apple-system,'Segoe UI',Helvetica,Arial,sans-serif"


def P(name):
    """A Brevo merge field."""
    return "{{ params." + name + " }}"


def IF(param, body):
    """Render `body` only when `param` came through with a value."""
    return "{% if params." + param + " %}" + body + "{% endif %}"


def IFELSE(condition, yes, no):
    return "{% if " + condition + " %}" + yes + "{% else %}" + no + "{% endif %}"


def TAG(name):
    """A merge field shown inline in body copy."""
    return f'<span style="font-family:ui-monospace,Menlo,Consolas,monospace;font-size:0.88em;color:{MONO};word-break:break-all;">' + P(name) + "</span>"


# ---------------------------------------------------------------------------
# blocks
# ---------------------------------------------------------------------------

def para(text):
    return f"""
              <p style="margin:0 0 14px;font-family:{FONT};font-size:16px;line-height:26px;color:{BODY};">{text}</p>"""


def sign(name="Ivan"):
    return f"""
              <p style="margin:18px 0 0;font-family:{FONT};font-size:16px;line-height:26px;color:{BODY};">{html.escape(name)}</p>"""


def ordered(items):
    lis = "".join(
        f"""
                  <li style="padding:4px 0;font-family:{FONT};font-size:16px;line-height:26px;color:{BODY};">{item}</li>"""
        for item in items
    )
    return f"""
              <ol style="margin:2px 0 14px;padding:0 0 0 22px;">{lis}
              </ol>"""


def figure(image_param, caption, static_url=None):
    """A wide 16:9 still with a caption under it.

    The image is guarded on its own param. Thumbnails are TikTok CDN links that
    expire between refreshes, so a row can legitimately arrive without one, and
    an <img> with an empty src renders as a broken-image icon - which reads as
    "this email is broken" rather than "this video has no still".
    """
    src = static_url or P(image_param)
    cap = f"""
                  <p style="margin:9px 0 0;font-family:{FONT};font-size:14px;line-height:21px;color:{MUTED};">{caption}</p>""" if caption else ""
    img = f"""
                  <img src="{src}" alt="" width="536" style="display:block;width:100%;max-width:536px;height:auto;border:0;border-radius:5px;background:#ECEAE4;">"""
    if static_url is None:
        img = IF(image_param, img)
    return f"""
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:4px 0 18px;">
                <tr><td>{img}{cap}
                </td></tr>
              </table>"""


def row(index, title_param, meta_html, thumb_param, first=False):
    """One ranked video: square thumbnail left, title and meta right.

    Stacked rather than side by side, because a 160px thumbnail plus two lines
    of title does not survive a 320px-wide inbox in a float layout.
    """
    border = "" if first else f"border-top:1px solid {LINE};"
    pad = "padding:4px 0 14px;" if first else "padding:15px 0 14px;"
    # The thumbnail cell is dropped entirely when the row has no still, rather
    # than left as an empty 132px column or an <img> with nothing in its src.
    thumb = IF(thumb_param, f"""
                        <td width="132" valign="top" style="width:132px;padding-right:16px;">
                          <img src="{P(thumb_param)}" alt="" width="132" style="display:block;width:132px;max-width:132px;height:auto;border:0;border-radius:5px;background:#ECEAE4;">
                        </td>""")
    return f"""
                  <tr><td style="{pad}{border}">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>{thumb}
                        <td valign="top">
                          <p style="margin:0;font-family:{FONT};font-size:16px;line-height:22px;font-weight:bold;color:{INK};">{index} {P(title_param)}</p>
                          <p style="margin:5px 0 0;font-family:{FONT};font-size:14px;line-height:21px;color:{MUTED};word-break:break-word;">{meta_html}</p>
                        </td>
                      </tr>
                    </table>
                  </td></tr>"""


def rows(*row_html):
    return f"""
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:6px 0 14px;">{''.join(row_html)}
              </table>"""


def subhead(text):
    return f"""
              <p style="margin:18px 0 0;font-family:{FONT};font-size:16px;line-height:26px;font-weight:bold;color:{INK};">{html.escape(text)}</p>"""


def btn(label, url_param, ink=False, show_url=False):
    """Bulletproof-ish button: a padded anchor in its own table so Outlook
    renders the fill instead of collapsing to bare text."""
    bg = INK if ink else AMBER
    fg = "#FFFFFF" if ink else INK
    url_line = f"""
              <p class="bb-url" style="margin:8px 0 0;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:13px;line-height:20px;color:{MUTED};word-break:break-all;">{P(url_param)}</p>""" if show_url else ""
    return f"""
              <table role="presentation" class="bb-btn" cellpadding="0" cellspacing="0" border="0" style="margin:22px 0 0;">
                <tr><td bgcolor="{bg}" style="border-radius:6px;">
                  <a href="{P(url_param)}" target="_blank"
                     style="display:inline-block;padding:13px 22px;font-family:{FONT};font-size:16px;font-weight:bold;line-height:20px;color:{fg};text-decoration:none;border-radius:6px;">{html.escape(label)}</a>
                </td></tr>
              </table>{url_line}"""


# ---------------------------------------------------------------------------
# shell
# ---------------------------------------------------------------------------

def page(title, label, blocks, footer_line, unsub):
    body = "".join(blocks)
    foot_unsub = f"""
              <p style="margin:8px 0 0;font-family:{FONT};font-size:12px;line-height:18px;color:{MUTED};">
                <a href="{P('unsubscribeUrl')}" style="color:{MUTED};text-decoration:underline;">Unsubscribe</a> from emails like this one.
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
  /* Progressive enhancement only - the inline styles carry the layout. */
  body {{ margin:0; padding:0; width:100% !important; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }}
  table {{ border-collapse:collapse !important; }}
  img {{ -ms-interpolation-mode:bicubic; }}
  a {{ text-decoration:none; }}
  @media only screen and (max-width:620px) {{
    .bb-wrap {{ width:100% !important; }}
    .bb-pad {{ padding-left:20px !important; padding-right:20px !important; }}
    .bb-btn a {{ display:block !important; width:100% !important; box-sizing:border-box; text-align:center; }}
  }}
</style>
</head>
<body style="margin:0;padding:0;background:{PAPER};">
  <!-- Inbox preview line. Editable per template in Admin -> Email Templates. -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;opacity:0;">{P('previewText')}</div>
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;opacity:0;">&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;</div>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:{PAPER};">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table role="presentation" class="bb-wrap" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;max-width:600px;background:#FFFFFF;border:1px solid {LINE};border-radius:10px;">
          <!-- Masthead: wordmark and the one-word purpose of this email. -->
          <tr>
            <td class="bb-pad" style="padding:17px 32px 15px;border-bottom:1px solid {LINE};">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-family:{FONT};font-size:15px;font-weight:bold;letter-spacing:-0.4px;color:{INK};padding-right:10px;">{P('appName')}</td>
                  <td style="font-family:{FONT};font-size:11px;font-weight:bold;letter-spacing:1.1px;text-transform:uppercase;color:{MUTED};">{html.escape(label)}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td class="bb-pad" style="padding:18px 32px 26px;">{body}
            </td>
          </tr>
          <tr>
            <td class="bb-pad" style="padding:16px 32px 20px;border-top:1px solid {LINE};">
              <p style="margin:0;font-family:{FONT};font-size:12px;line-height:18px;color:{MUTED};">{footer_line}</p>{foot_unsub}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""


EMAILS = {}


def E(key, title, label, footer, marketing, blocks):
    EMAILS[key] = (title, label, footer, marketing, blocks)


HI = lambda: para("Hi " + TAG("firstName") + ",")


# ---------------------------------------------------------------------------
# 1. Free, never searched
# ---------------------------------------------------------------------------

# 1a - about three hours after signup.
E("new_registration", "Your BrandBeacon account", "Your account",
  "Sent because you created a BrandBeacon account.", False, [
  HI(),
  para("Thanks for signing up for BrandBeacon."),
  para("You still have one free search. Enter a brand or product and it returns TikTok videos that outperformed that creator&rsquo;s usual numbers (Breakout Score)."),
  para("You can run it here: " + TAG("dashboardUrl")),
  btn("Run it here", "dashboardUrl"),
  sign(),
])

# 1b - day 2, skipped if they searched.
E("onboarding_no_search", "4.6M views from an account that usually gets 10k", "An example",
  "Sent because your free search is still unused.", True, [
  HI(),
  para("One example, in case it makes this clearer."),
  figure("exampleImageUrl", "The video in this example"),
  para("A beauty video did about 4.6 million views. The creator who posted it usually sits around ten thousand. That is roughly 460 times their own normal."),
  para("A big account doing a million views tells you nothing, because it always does a million. A small account doing a million tells you the hook, the format or the angle carried it. That is the part you can brief to your own creators."),
  btn("Run your free search", "searchUrl", show_url=True),
  sign(),
])


# ---------------------------------------------------------------------------
# 2. Free, results ready
# ---------------------------------------------------------------------------

# 2a - immediately on completion.
E("search_done", "Your results are ready", "Your results",
  "You ran one free search at brandbeacon.io.", False, [
  HI(),
  para("You searched " + TAG("searchTerm") + ". We found " + TAG("resultsCount")
       + " videos, and " + TAG("breakoutCount")
       + " of them were viral breakouts, meaning they beat the average of the account that posted them."),
  para("The ones that broke out hardest:"),
  rows(
    row("01", "breakout1Title", TAG("breakout1Handle") + " &middot; " + TAG("breakout1Views") + " views &middot; " + TAG("breakout1Score") + "x", "breakout1Thumbnail", first=True),
    IF("breakout2Title", row("02", "breakout2Title", TAG("breakout2Handle") + " &middot; " + TAG("breakout2Views") + " views &middot; " + TAG("breakout2Score") + "x", "breakout2Thumbnail")),
    IF("breakout3Title", row("03", "breakout3Title", TAG("breakout3Handle") + " &middot; " + TAG("breakout3Views") + " views &middot; " + TAG("breakout3Score") + "x", "breakout3Thumbnail")),
  ),
  para("Start at the top. A high Breakout Score means the video did far more than that account normally manages, so whatever is in it, the opening line, the format or the angle, is doing the work. That is what transfers to your own creators."),
  btn("Open your results", "resultsUrl", show_url=True),
  para("We&rsquo;re a small team building BrandBeacon with brand and social teams like yours. If this was useful, or if something felt off, just reply and tell me."),
  sign(),
])

# 2b - day 1 after results.
E("free_results_second_look", "A second look", "A second look",
  "Sent one day after your results were ready.", True, [
  HI(),
  para("I went back through your " + TAG("searchTerm") + " results."),
  para("The useful thing is usually not any single video. It is that the top few by Breakout Score tend to share something: the same opening line, the same format, or the same angle. Once you have seen it twice it stops being luck and starts being something you can brief."),
  para("Open the top few and look for what they have in common."),
  btn("Open your results", "resultsUrl", show_url=True),
  para("If one search was worth it, eight days gets you the rest: " + TAG("trialUrl")),
  sign(),
])

# 2c - day 3 after results.
E("free_results_last_note", "Following up on your free search", "Last note",
  "Last email in this sequence.", True, [
  HI(),
  para("Last note from me on this."),
  para("You used your one free BrandBeacon search on " + TAG("searchTerm") + ". Those results are still here: " + TAG("resultsUrl")),
  para("If you want to search more brands, competitors, or products, you can try BrandBeacon for 8 days here: " + TAG("trialUrl")),
  btn("Try BrandBeacon for 8 days", "trialUrl"),
  para("If now is not the right time, no problem. Your free results stay available."),
  sign(),
])


# ---------------------------------------------------------------------------
# 3. The 8-day trial
# ---------------------------------------------------------------------------

# 3a - day 0. Also covers a straight paid start, hence the branch.
E("subscription_started", "Your plan is live", "Your trial",
  IFELSE('params.isTrial == "yes"', "Sent during your 8-day trial.", "Sent because your plan is active."),
  False, [
  HI(),
  IFELSE('params.isTrial == "yes"',
         para("Welcome. You're on day 1 of your 8-day BrandBeacon trial."),
         para("Welcome. You're on " + TAG("planName") + ", and it is live now.")),
  para("You can run more searches and you have unlocked video analysis: what&rsquo;s working, what&rsquo;s not, and some tips for you."),
  para("Three searches worth running today:"),
  ordered([
    "Your own brand: what is already out there about you",
    "Competitor brands: see what formats are working for your competitors and improve",
    "Your products: what creators are saying about your product across brands",
  ]),
  para("Start here: " + TAG("dashboardUrl")),
  btn("Start here", "dashboardUrl"),
  sign(),
])

# 3b - day 2.
E("trial_breakout_score", "How to use Breakout Score on your trial", "Your trial",
  "Sent during your 8-day trial.", False, [
  HI(),
  para("Quick tip while your 8-day trial is open."),
  para("Most TikTok accounts get about the same views on most posts. Sometimes one post gets way more than that account&rsquo;s usual. BrandBeacon scores that jump. We call it Breakout Score."),
  para("Start with the highest Breakout Score. Those videos show you what worked: the first line, the style, or the idea."),
  para("Your workspace: " + TAG("dashboardUrl")),
  btn("Open your workspace", "dashboardUrl"),
  sign(),
])

# 3c - day 5.
E("trial_day5_video_analysis", "A few days left on your 8-day trial", "Your trial",
  "Sent during your 8-day trial.", False, [
  HI(),
  para("Your 8-day trial ends in a few days."),
  para("If you have not tried video analysis yet, here is what to do. Open your search results, click the video with the highest Breakout Score, then start video analysis."),
  para("You get a plain breakdown of that one video:"),
  ordered([
    "Why it worked",
    "What could be improved",
    "What you should do next",
    "The hook (how it starts, why it stops the scroll, and a few rewrites you can copy)",
    "The transcript",
  ]),
  para("Continue here: " + TAG("dashboardUrl")),
  btn("Continue here", "dashboardUrl"),
  sign(),
])

# 3d - day 7.
E("trial_one_breakout", "One breakout from your results", "Your trial",
  "Sent during your 8-day trial.", False, [
  HI(),
  para("Quick one from your " + TAG("searchTerm") + " results."),
  figure("videoThumbnail", TAG("videoCaption")),
  para(TAG("videoCaption") + " hit about " + TAG("breakoutScore")
       + "x what that creator usually does: " + TAG("videoUrl")),
  para("Worth a look before your 8-day trial ends. Your workspace: " + TAG("dashboardUrl")),
  btn("Open your workspace", "dashboardUrl"),
  sign(),
])


# ---------------------------------------------------------------------------
# 4. Dunning and the card
# ---------------------------------------------------------------------------

# 4a - first failure. Ink button, not amber: this is billing, not marketing.
E("payment_failed_first", "Your card did not go through", "Billing",
  "Sent to the billing contact on your BrandBeacon account.", False, [
  HI(),
  para("Quick billing note."),
  para("We tried to charge the card ending in " + TAG("cardLast4") + " for " + TAG("amount")
       + " and the payment did not go through. Nothing on your BrandBeacon account has changed."),
  btn("Update your card", "billingUrl", ink=True, show_url=True),
  para("We will try again on " + TAG("nextAttemptAt") + "."),
  sign(),
])

# 4b - second failure.
E("payment_failed_second", "Still having trouble with your card", "Billing",
  "Sent to the billing contact on your BrandBeacon account.", False, [
  HI(),
  para("We tried the card ending in " + TAG("cardLast4") + " again and it still did not go through."),
  para("If it is not sorted by " + TAG("lockDate")
       + ", your BrandBeacon account pauses. Your searches stop refreshing and the weekly breakout email stops with them."),
  btn("Update your card", "billingUrl", ink=True, show_url=True),
  sign(),
])

# 4c - final notice.
E("final_failed_payment", "Last chance before your account pauses", "Billing",
  "Sent to the billing contact on your BrandBeacon account.", False, [
  HI(),
  para("Last note on this."),
  para("If we cannot charge the card ending in " + TAG("cardLast4") + " by " + TAG("lockDate")
       + ", your BrandBeacon account pauses."),
  para("Your saved searches and results stay on file for " + TAG("retentionDays")
       + " days after that. A working card inside that window turns everything back on where you left it, so nothing is lost unless you leave it."),
  btn("Update your card", "billingUrl", ink=True, show_url=True),
  sign(),
])

# 4z - seven days before the card on file expires.
E("card_expiring", "The card on file expires soon", "Billing",
  "Sent to the billing contact on your BrandBeacon account.", False, [
  HI(),
  para("Quick billing note."),
  para("The card ending in " + TAG("cardLast4") + " expires on " + TAG("cardExpiryDate")
       + ", and your next charge is " + TAG("amount") + " on " + TAG("nextChargeDate")
       + ". It will not go through unless the card is updated before then."),
  btn("Update your card", "billingUrl", ink=True, show_url=True),
  sign(),
])


# ---------------------------------------------------------------------------
# 5. Trial expired without a purchase
# ---------------------------------------------------------------------------

# 5a - day 1.
E("trial_winback_ended", "Your 8-day trial ended", "Trial ended",
  "Sent because your trial ended without a subscription.", True, [
  HI(),
  para("Your BrandBeacon trial ended yesterday."),
  para("New searches and video analysis are paused. Everything you already ran is still in your account and stays there whether you come back or not."),
  btn("Subscribe", "plansUrl", show_url=True),
  para("We&rsquo;re a small team and still shaping this. If you have a minute, reply and tell me what would have made BrandBeacon worth keeping."),
  sign(),
])

# 5b - day 7.
E("trial_winback_missed", "Breakouts since you left", "Since you left",
  "Sent because your trial ended without a subscription.", True, [
  HI(),
  para("Quick update."),
  para("Since your trial ended we have seen about " + TAG("missedCount")
       + " new breakout videos on " + TAG("searchTerm")
       + ". Posts that did far more than the accounts behind them normally do."),
  para("You can see that they exist. You cannot open them, and nobody on your side is watching "
       + TAG("searchTerm") + " at the moment, so none of it is reaching you."),
  btn("Subscribe", "plansUrl", show_url=True),
  sign(),
])

# 5c - day 21.
E("trial_winback_last_note", "Last note about your trial", "Last note",
  "Last email in this sequence.", True, [
  HI(),
  para("Last email from me about the trial."),
  para("Here is what your eight days actually turned up: " + TAG("trialSearches") + " searches, "
       + TAG("trialVideos") + " videos, " + TAG("trialBreakouts") + " viral breakouts."),
  IF("breakoutThumbnail", figure("breakoutThumbnail", TAG("breakoutTitle") + " &middot; " + TAG("breakoutScore") + "x")),
  IF("breakoutTitle", para("The strongest was " + TAG("breakoutTitle") + ", at about " + TAG("breakoutScore")
                           + "x what that creator usually does: " + TAG("breakoutUrl"))),
  para("All of it is still in your account."),
  btn("Subscribe", "plansUrl", show_url=True),
  para("If not, no problem. I will stop nudging about the trial after this."),
  sign(),
])


# ---------------------------------------------------------------------------
# 6. A paying subscription ended
# ---------------------------------------------------------------------------

# 6a - day 3.
E("churn_winback_ended", "Your BrandBeacon subscription ended", "Subscription ended",
  "Sent because your subscription ended.", True, [
  HI(),
  para("Your subscription ended a few days ago."),
  para("New searches and video analysis are paused. Everything you saved is still in your account if you want to look back."),
  btn("Subscribe", "plansUrl", show_url=True),
  para("We&rsquo;re a small team and still shaping this. If you have a minute, reply and tell me what would have made BrandBeacon worth keeping."),
  sign(),
])

# 6b - day 14.
E("churn_winback_missed", "Breakouts since you cancelled", "Since you cancelled",
  "Sent because your subscription ended.", True, [
  HI(),
  para("Quick update."),
  para("Since you cancelled we have seen about " + TAG("missedCount") + " new breakout videos on "
       + TAG("searchTerm") + ", and " + TAG("competitorBreakouts")
       + " of them named a competitor rather than you."),
  para("Your category did not pause when you did."),
  btn("Subscribe", "plansUrl", show_url=True),
  sign(),
])

# 6c - day 45.
E("churn_winback_last_note", "Last note since you cancelled", "Last note",
  "Last email in this sequence.", True, [
  HI(),
  para("Last email from me about coming back."),
  IF("breakoutThumbnail", figure("breakoutThumbnail", TAG("breakoutTitle") + " &middot; " + TAG("breakoutScore") + "x")),
  para("One of the stronger recent finds on " + TAG("searchTerm") + " was " + TAG("breakoutTitle")
       + ", at about " + TAG("breakoutScore") + "x what that creator usually does: " + TAG("breakoutUrl")),
  btn("Subscribe", "plansUrl", show_url=True),
  para("If not, no problem. I will stop nudging after this."),
  sign(),
])


# ---------------------------------------------------------------------------
# 7 and 8. Ongoing
# ---------------------------------------------------------------------------

# 7a - every Monday.
E("weekly_digest", "Your week", "Your week",
  "Sent every week for everything you&rsquo;re watching. You do not have to log in to read it.", True, [
  HI(),
  para(TAG("breakoutCount") + " viral breakouts on " + TAG("searchTerm") + " this week, out of "
       + TAG("resultsCount") + " videos, from " + TAG("newCreators") + " creators we had not seen before."),
  IF("own1Title", subhead("Your brand") + rows(
    row("01", "own1Title", TAG("own1Handle") + " &middot; " + TAG("own1Views") + " &middot; " + TAG("own1Score") + "x", "own1Thumbnail", first=True),
  )),
  IF("comp1Title", subhead("Competitors you watch") + rows(
    row("01", "comp1Title", TAG("comp1Brand") + " &middot; " + TAG("comp1Views") + " &middot; " + TAG("comp1Score") + "x", "comp1Thumbnail", first=True),
  )),
  IF("prod1Title", subhead("Your products") + rows(
    row("01", "prod1Title", TAG("prod1Name") + " &middot; " + TAG("prod1Views") + " &middot; " + TAG("prod1Score") + "x", "prod1Thumbnail", first=True),
  )),
  btn("Open the full week", "resultsUrl", show_url=True),
  sign(),
])

# 8a - every second Thursday.
E("biweekly_pack", "The pack", "The pack",
  "Sent every two weeks to everyone on the BrandBeacon list.", True, [
  HI(),
  para("Every two weeks I pick one brand or product and pull the breakout videos on it. This time: " + TAG("searchTerm") + "."),
  para(TAG("breakoutCount") + " videos did far more than the accounts behind them normally do. Three to start with:"),
  rows(
    row("01", "pick1Caption", TAG("pick1Handle") + " &middot; " + TAG("pick1Views") + " views &middot; " + TAG("pick1Score") + "x", "pick1Thumbnail", first=True),
    IF("pick2Caption", row("02", "pick2Caption", TAG("pick2Handle") + " &middot; " + TAG("pick2Views") + " views &middot; " + TAG("pick2Score") + "x", "pick2Thumbnail")),
    IF("pick3Caption", row("03", "pick3Caption", TAG("pick3Handle") + " &middot; " + TAG("pick3Views") + " views &middot; " + TAG("pick3Score") + "x", "pick3Thumbnail")),
  ),
  IF("takeaway", para("What they have in common: " + TAG("takeaway"))),
  btn("Open the full list", "resultsUrl", show_url=True),
  para("Not on BrandBeacon yet? " + TAG("plansUrl")),
  sign(),
])


# ---------------------------------------------------------------------------
# Beyond the handover board. These four are not on it, and are kept because
# the app cannot run without them: verification, the cancel confirmation, and
# the two trial-ending notices that depend on whether a card is on file.
# ---------------------------------------------------------------------------

E("verify_email_manual_account", "Verify your email address", "Verify email",
  "Sent because an account was created with this email address.", False, [
  HI(),
  para("Confirm this email address to activate your BrandBeacon account."),
  para("The link works for " + TAG("expiresInDays") + " days: " + TAG("verifyUrl")),
  btn("Verify my email", "verifyUrl"),
  para("If you did not create this account you can ignore this email, or reply to " + TAG("supportEmail") + "."),
  sign(),
])

E("subscription_canceled", "Your plan has been canceled", "Subscription",
  "Sent because your plan was canceled.", False, [
  HI(),
  para("Your " + TAG("planName") + " plan is canceled."),
  para("Access continues until " + TAG("accessEndsAt") + ". Nothing is deleted when it ends, and your searches and saved videos stay in your account."),
  btn("Back to your workspace", "dashboardUrl"),
  para("If you canceled because something was not working, reply to " + TAG("supportEmail") + ". We read every one."),
  sign(),
])

E("trial_ending_cc", "Your trial is ending soon", "Your trial",
  "Sent because your trial ends soon.", False, [
  HI(),
  para("Your 8-day trial of " + TAG("planName") + " ends on " + TAG("trialEndsAt") + ", in "
      + TAG("daysRemaining") + " days."),
  para("Your card is on file, so your plan continues from there and nothing stops. If you would rather it did not, you can cancel in settings: " + TAG("settingsUrl")),
  btn("Open your workspace", "dashboardUrl"),
  sign(),
])

E("trial_ending_no_cc", "Add your card to keep paid access after your trial", "Your trial",
  "Sent because your trial ends soon and there is no card on file.", False, [
  HI(),
  para("Your 8-day trial of " + TAG("planName") + " ends on " + TAG("trialEndsAt") + ", in "
      + TAG("daysRemaining") + " days."),
  para("There is no card on file, so access stops that day. New searches and video analysis pause, and your tracked searches stop refreshing. Everything you already ran stays in your account."),
  btn("Add your card", "settingsUrl", show_url=True),
  sign(),
])


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)

    for key, (title, label, footer, marketing, blocks) in EMAILS.items():
        with open(os.path.join(OUT, key + ".html"), "w", encoding="utf-8") as fh:
            fh.write(page(title, label, blocks, footer, marketing))

    print("generated %d templates in %s" % (len(EMAILS), OUT))
