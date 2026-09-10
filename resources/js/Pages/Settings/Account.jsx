import { useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';

import SettingsShell from './SettingsShell.jsx';

const NOTIFICATIONS = [
  { key: 'search_finished', title: 'Search finished', desc: 'Email me the moment a scrape is ready.', on: true },
  { key: 'virality_alerts', title: 'Virality alerts', desc: 'Ping me when a tracked video crosses my threshold.', on: true },
  { key: 'weekly_viral_digest', title: 'Weekly viral digest', desc: 'One email a week with what moved in my categories.', on: false },
];

export default function Account() {
  const { auth = {}, flash = {}, preferences = {}, accountDeletion = {}, passwordAccess = {} } = usePage().props;
  const initialNotifications = {
    ...Object.fromEntries(NOTIFICATIONS.map((n) => [n.key, n.on])),
    ...(preferences.notifications ?? {}),
  };
  const scheduledDeletionDate = accountDeletion.scheduledFor
    ? new Date(accountDeletion.scheduledFor).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    : null;
  const [prefs, setPrefs] = useState(() => initialNotifications);
  const form = useForm({ name: auth.user?.name ?? '' });
  const [savingPreferences, setSavingPreferences] = useState(false);
  const deletionForm = useForm({});
  const passwordForm = useForm({ current_password: '', password: '', password_confirmation: '' });

  const submit = (event) => {
    event.preventDefault();
    form.patch('/settings/account');
  };

  const togglePreference = (key) => {
    const next = !prefs[key];
    const nextNotifications = {
      ...prefs,
      [key]: next,
    };

    setPrefs(nextNotifications);
    setSavingPreferences(true);

    router.patch('/settings/account', {
      preferences: {
        notifications: nextNotifications,
      },
      name: form.data.name,
    }, {
      preserveScroll: true,
      preserveState: true,
      only: ['auth', 'flash', 'preferences', 'subscription', 'accountDeletion'],
      onFinish: () => setSavingPreferences(false),
    });
  };

  const requestDeletion = () => {
    if (!window.confirm('Schedule your account for deletion in 30 days? You can cancel the request any time before then.')) {
      return;
    }

    deletionForm.post('/settings/account/delete-request', {
      preserveScroll: true,
    });
  };

  const cancelDeletion = () => {
    deletionForm.delete('/settings/account/delete-request', {
      preserveScroll: true,
    });
  };

  const savePassword = (event) => {
    event.preventDefault();
    passwordForm.submit(passwordAccess.canAdd ? 'post' : 'patch', '/settings/account/password', {
      preserveScroll: true,
      onSuccess: () => passwordForm.reset(),
    });
  };

  return (
    <>
      <Head title="Account · Brand Beacon" />

      <SettingsShell section="account">
        {flash.status && (
          <div
            style={{
              marginBottom: 16,
              padding: '12px 16px',
              borderRadius: 'var(--r)',
              background: 'var(--ok-bg)',
              color: 'var(--ok)',
              fontWeight: 600,
              fontSize: '.85rem',
            }}
          >
            {flash.status}
          </div>
        )}

        <form className="card" onSubmit={submit}>
          <div className="card__p">
            <h2>Account</h2>
            <p className="muted" style={{ fontSize: '.86rem', marginTop: 6 }}>Your details and how we reach you.</p>

            <div style={{ marginTop: 22 }} className="grid2">
              <div>
                <label className="lbl">Name</label>
                <input
                  className="fld"
                  value={form.data.name}
                  onChange={(e) => form.setData('name', e.target.value)}
                />
                {form.errors.name && <p className="hint" style={{ color: 'var(--warn)' }}>{form.errors.name}</p>}
              </div>
              <div>
                <label className="lbl">Email</label>
                <input className="fld" value={auth.user?.email ?? ''} readOnly style={{ opacity: 0.7 }} />
              </div>
            </div>

            <div style={{ marginTop: 22 }}>
              <button type="submit" className="btn btn--y" disabled={form.processing}>
                {form.processing ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </div>
        </form>

        {(passwordAccess.canAdd || passwordAccess.enabled) && (
          <div className="card" style={{ marginTop: 16 }}>
            <div className="card__p">
              <h2>{passwordAccess.canAdd ? 'Set a manual password' : 'Update password'}</h2>
                <form onSubmit={savePassword}>
                  <p className="muted" style={{ fontSize: '.86rem', marginTop: 6 }}>
                    {passwordAccess.canAdd
                      ? `You sign in with Google. Set a manual password for ${auth.user?.email} before you can update it here.`
                      : 'Confirm your current password to save a new password.'}
                  </p>
                  {!passwordAccess.canAdd && (
                    <div style={{ marginTop: 18 }}>
                      <label className="lbl" htmlFor="current_password">Current password</label>
                      <input id="current_password" className="fld" type="password" autoComplete="current-password" required value={passwordForm.data.current_password} onChange={(event) => passwordForm.setData('current_password', event.target.value)} />
                      {passwordForm.errors.current_password && <p className="hint" style={{ color: 'var(--warn)' }}>{passwordForm.errors.current_password}</p>}
                    </div>
                  )}
                  <div className="grid2" style={{ marginTop: 18 }}>
                    <div>
                      <label className="lbl" htmlFor="new_password">New password</label>
                      <input id="new_password" className="fld" type="password" autoComplete="new-password" required value={passwordForm.data.password} onChange={(event) => passwordForm.setData('password', event.target.value)} />
                      {passwordForm.errors.password && <p className="hint" style={{ color: 'var(--warn)' }}>{passwordForm.errors.password}</p>}
                    </div>
                    <div>
                      <label className="lbl" htmlFor="password_confirmation">Confirm new password</label>
                      <input id="password_confirmation" className="fld" type="password" autoComplete="new-password" required value={passwordForm.data.password_confirmation} onChange={(event) => passwordForm.setData('password_confirmation', event.target.value)} />
                    </div>
                  </div>
                  <button type="submit" className="btn btn--y" style={{ marginTop: 18 }} disabled={passwordForm.processing}>
                    {passwordForm.processing ? 'Saving…' : passwordAccess.canAdd ? 'Set manual password' : 'Update password'}
                  </button>
                </form>
            </div>
          </div>
        )}

        <div className="card" style={{ marginTop: 16 }}>
          <div className="card__p">
            <h2>Notifications</h2>
            <div style={{ marginTop: 8 }}>
              {NOTIFICATIONS.map((n) => (
                <div className="rowf" key={n.key}>
                  <div>
                    <p className="rowf__t">{n.title}</p>
                    <p className="rowf__d">{n.desc}</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={prefs[n.key]}
                    aria-label={n.title}
                    className={`sw${prefs[n.key] ? ' on' : ''}`}
                    onClick={() => togglePreference(n.key)}
                    disabled={savingPreferences}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card" style={{ marginTop: 16, borderColor: '#F0D6C8' }}>
          <div className="card__p">
            <h2 style={{ color: 'var(--warn)' }}>Delete account</h2>
            <p className="muted" style={{ fontSize: '.86rem', marginTop: 6 }}>
              {accountDeletion.hasActiveSubscription
                ? 'Active subscriptions cannot be deleted yet. Cancel your subscription first, then come back here.'
                : accountDeletion.scheduledFor
                  ? `Your account is scheduled for deletion on ${scheduledDeletionDate}. You can still sign in and access your data until then.`
                  : 'This schedules your account for deletion in 30 days. Your searches, results, subscriptions, and account records stay intact during the grace period.'}
            </p>
            <div style={{ marginTop: 18 }}>
              {accountDeletion.scheduledFor ? (
                <button
                  type="button"
                  className="btn btn--g"
                  style={{ color: 'var(--warn)', borderColor: '#F0D6C8' }}
                  onClick={cancelDeletion}
                  disabled={deletionForm.processing}
                >
                  {deletionForm.processing ? 'Saving…' : 'Cancel account deletion'}
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn--g"
                  style={{ color: 'var(--warn)', borderColor: '#F0D6C8' }}
                  onClick={requestDeletion}
                  disabled={deletionForm.processing || accountDeletion.hasActiveSubscription}
                >
                  {deletionForm.processing ? 'Saving…' : 'Delete my account'}
                </button>
              )}
            </div>
          </div>
        </div>
      </SettingsShell>
    </>
  );
}
