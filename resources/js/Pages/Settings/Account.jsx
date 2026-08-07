import { Head, useForm, usePage } from '@inertiajs/react';

import SettingsShell from './SettingsShell.jsx';

export default function Account() {
  const { auth = {}, flash = {} } = usePage().props;
  const form = useForm({
    name: auth.user?.name ?? '',
  });

  const submit = (event) => {
    event.preventDefault();
    form.patch('/settings/account');
  };

  return (
    <>
      <Head title="Account settings - Outlier Vault" />

      <SettingsShell section="account" eyebrow="Profile" heading="Account">
        <div className="max-w-3xl space-y-6">
          {flash.status && (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
              {flash.status}
            </div>
          )}

          <div className="surface p-5">
            <div className="mb-5">
              <h2 className="font-display text-[18px] font-bold">Profile details</h2>
              <p className="mt-2 text-[13.5px] muted">Update the name shown across your account.</p>
            </div>

            <form onSubmit={submit} className="space-y-5">
              <div>
                <label htmlFor="account-name" className="mb-2 block text-[12px] font-semibold tracking-[.08em] faint uppercase">
                  Name
                </label>
                <input
                  id="account-name"
                  type="text"
                  value={form.data.name}
                  onChange={(event) => form.setData('name', event.target.value)}
                  className="field h-12"
                />
                {form.errors.name && <p className="mt-2 text-sm text-hot">{form.errors.name}</p>}
              </div>

              <div>
                <label htmlFor="account-email" className="mb-2 block text-[12px] font-semibold tracking-[.08em] faint uppercase">
                  Email
                </label>
                <input
                  id="account-email"
                  type="email"
                  value={auth.user?.email ?? ''}
                  readOnly
                  className="field h-12 cursor-not-allowed opacity-70"
                />
                <p className="mt-2 text-[12.5px] muted">Email changes are not available yet.</p>
              </div>

              <button type="submit" disabled={form.processing} className="btn-accent h-11 px-5 text-[13px]">
                {form.processing ? 'Saving...' : 'Save changes'}
              </button>
            </form>
          </div>
        </div>
      </SettingsShell>
    </>
  );
}
