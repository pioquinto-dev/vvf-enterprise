# Brevo Email HTML Templates

These templates are designed for Brevo-hosted transactional templates and use the same `params` keys as the app payload builders.

Use them as starting points and keep the variable names exactly aligned with `App\Support\BrevoTransactionalEmail`.

## Final failed payment downgrade

```html
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0;padding:24px 0;background-color:#f4efe8;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td align="center">
      <table role="presentation" width="640" cellspacing="0" cellpadding="0" style="width:640px;max-width:640px;background:#fffdf8;border-radius:24px;overflow:hidden;border-collapse:collapse;">
        <tr>
          <td style="padding:40px;background:linear-gradient(135deg,#12263a 0%,#1d4e89 100%);color:#ffffff;">
            <h1 style="margin:0 0 16px;font-size:34px;line-height:1.15;">
              <img src="{{params.logoUrl}}" alt="{{params.appName}}" width="27" height="27" style="display:inline-block;vertical-align:bottom;margin-right:8px;width:27px;height:27px;">
            </h1>
            <h1 style="margin:16px 0 12px;font-size:34px;line-height:1.15;">Your paid access has ended</h1>
            <p style="margin:0;font-size:16px;line-height:1.7;max-width:480px;">Hi {{params.firstName}}, we couldn't recover payment for your {{params.planName}} plan, so your account has been moved off paid access as of {{params.accessEndedAt}}.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px 12px;">
            <p style="margin:0 0 18px;font-size:16px;line-height:1.7;">If you'd like to restore paid access or sort out a plan transition, you can update billing details in your subscription settings or contact us and we'll help directly.</p>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
              <tr>
                <td style="padding:0 0 12px;font-size:15px;line-height:1.7;">• Restore paid access by updating your billing details</td>
              </tr>
              <tr>
                <td style="padding:0 0 12px;font-size:15px;line-height:1.7;">• Review your current subscription settings and plan options</td>
              </tr>
              <tr>
                <td style="padding:0 0 12px;font-size:15px;line-height:1.7;">• Reach out directly if you want help with the transition</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px 8px;">
            <a href="{{params.settingsUrl}}" style="display:inline-block;background:#ff6b35;color:#ffffff;text-decoration:none;font-weight:bold;padding:16px 28px;border-radius:999px;">Open subscription settings</a>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 40px 40px;">
            <p style="margin:0;font-size:14px;line-height:1.7;color:#475569;">Need help? Contact us here: <a href="{{params.contactUrl}}" style="color:#1d4e89;">{{params.contactUrl}}</a> or email {{params.supportEmail}}.</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
```

## No-card managed trial ending soon

```html
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0;padding:24px 0;background-color:#f4efe8;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td align="center">
      <table role="presentation" width="640" cellspacing="0" cellpadding="0" style="width:640px;max-width:640px;background:#fffdf8;border-radius:24px;overflow:hidden;border-collapse:collapse;">
        <tr>
          <td style="padding:40px;background:linear-gradient(135deg,#12263a 0%,#1d4e89 100%);color:#ffffff;">
            <h1 style="margin:0 0 16px;font-size:34px;line-height:1.15;">
              <img src="{{params.logoUrl}}" alt="{{params.appName}}" width="27" height="27" style="display:inline-block;vertical-align:bottom;margin-right:8px;width:27px;height:27px;">
            </h1>
            <h1 style="margin:16px 0 12px;font-size:34px;line-height:1.15;">Add a card to keep paid access</h1>
            <p style="margin:0;font-size:16px;line-height:1.7;max-width:480px;">Hi {{params.firstName}}, your {{params.planName}} trial ends in {{params.daysRemaining}} days on {{params.trialEndsAt}}. Add your card details now so your paid access can continue without interruption.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px 12px;">
            <p style="margin:0 0 18px;font-size:16px;line-height:1.7;">Open your subscription settings, add a payment method, and your account will be ready to continue once the trial ends.</p>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
              <tr>
                <td style="padding:0 0 12px;font-size:15px;line-height:1.7;">• Review when your trial ends and how many days remain</td>
              </tr>
              <tr>
                <td style="padding:0 0 12px;font-size:15px;line-height:1.7;">• Add your card details before access is interrupted</td>
              </tr>
              <tr>
                <td style="padding:0 0 12px;font-size:15px;line-height:1.7;">• Head back to your dashboard once billing is set</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px 8px;">
            <a href="{{params.settingsUrl}}" style="display:inline-block;background:#ff6b35;color:#ffffff;text-decoration:none;font-weight:bold;padding:16px 28px;border-radius:999px;">Add card details</a>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 40px 40px;">
            <p style="margin:0;font-size:14px;line-height:1.7;color:#475569;">Want to review your account first? Open your dashboard here: <a href="{{params.dashboardUrl}}" style="color:#1d4e89;">{{params.dashboardUrl}}</a></p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
```

## Search done

```html
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0;padding:24px 0;background-color:#f4efe8;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td align="center">
      <table role="presentation" width="640" cellspacing="0" cellpadding="0" style="width:640px;max-width:640px;background:#fffdf8;border-radius:24px;overflow:hidden;border-collapse:collapse;">
        <tr>
          <td style="padding:40px;background:linear-gradient(135deg,#12263a 0%,#1d4e89 100%);color:#ffffff;">
            <h1 style="margin:0 0 16px;font-size:34px;line-height:1.15;">
              <img src="{{params.logoUrl}}" alt="{{params.appName}}" width="27" height="27" style="display:inline-block;vertical-align:bottom;margin-right:8px;width:27px;height:27px;">
            </h1>
            <h1 style="margin:16px 0 12px;font-size:34px;line-height:1.15;">Your search results are ready</h1>
            <p style="margin:0;font-size:16px;line-height:1.7;max-width:480px;">Hi {{params.firstName}}, your {{params.searchType}} search for <strong>{{params.searchName}}</strong> has finished processing. We found {{params.resultsCount}} videos ready for review.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px 12px;">
            <p style="margin:0 0 18px;font-size:16px;line-height:1.7;">Open the results page to review standout videos, creative patterns, and the top outlier from this run.</p>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
              <tr>
                <td style="padding:0 0 12px;font-size:15px;line-height:1.7;">• Review the strongest videos from this completed run</td>
              </tr>
              <tr>
                <td style="padding:0 0 12px;font-size:15px;line-height:1.7;">• Look for recurring creative patterns in the results</td>
              </tr>
              <tr>
                <td style="padding:0 0 12px;font-size:15px;line-height:1.7;">• Jump back to your dashboard to keep tracking momentum</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px 8px;">
            <a href="{{params.resultsUrl}}" style="display:inline-block;background:#ff6b35;color:#ffffff;text-decoration:none;font-weight:bold;padding:16px 28px;border-radius:999px;">View results</a>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 40px 40px;">
            <p style="margin:0;font-size:14px;line-height:1.7;color:#475569;">Completed {{params.latestRunAt}}. You can also open your dashboard here: <a href="{{params.dashboardUrl}}" style="color:#1d4e89;">{{params.dashboardUrl}}</a></p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
```
