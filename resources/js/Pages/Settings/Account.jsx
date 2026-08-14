import { useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';

import SettingsShell from './SettingsShell.jsx';

const NOTIFICATIONS = [
  { key: 'search_finished', title: 'Search finished', desc: 'Email me the moment a scrape is ready.', on: true },
  { key: 'virality_alerts', title: 'Virality alerts', desc: 'Ping me when a tracked video crosses my threshold.', on: true },
  { key: 'weekly_viral_digest', title: 'Weekly viral digest', desc: 'One email a week with what moved in my categories.', on: false },
];

export default function Account() {
  const { auth = {}, flash = {}, preferences = {}, accountDeletion = {} } = usePage().props;
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
