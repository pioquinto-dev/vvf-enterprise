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
      <Head title="Account settings - VVF" />

      <SettingsShell section="account" eyebrow="Identity" heading="Account Information">
        <div className="max-w-3xl">
          <h2 className="font-display text-[18px] font-bold">Account Information</h2>
          <p className="mt-2 text-[13.5px] muted">
            Update your display name. Your email address is locked after account creation.
          </p>

          {flash.status && (
            <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
              {flash.status}
            </div>
          )}

          <form onSubmit={submit} className="mt-6 space-y-5">
            <div>
              <label className="mb-2 block text-[12px] font-semibold text-ink dark:text-white">Name</label>
              <input
                value={form.data.name}
                onChange={(event) => form.setData('name', event.target.value)}
                className="field h-12 text-sm"
              />
              {form.errors.name && <p className="mt-2 text-[12px] text-hot">{form.errors.name}</p>}
            </div>

            <div>
              <label className="mb-2 block text-[12px] font-semibold text-ink dark:text-white">Email</label>
              <input
                value={auth.user?.email ?? ''}
                readOnly
                className="field h-12 cursor-not-allowed bg-black/[.03] text-sm opacity-75 dark:bg-white/[.05]"
              />
              <p className="mt-2 text-[12px] faint">Contact support if you need help updating your email address.</p>
            </div>

            <button type="submit" disabled={form.processing} className="btn-accent h-11 px-6 text-[12px] tracking-[.14em] uppercase">
              {form.processing ? 'Saving...' : 'Save'}
            </button>
          </form>
        </div>
      </SettingsShell>
    </>
  );
}
