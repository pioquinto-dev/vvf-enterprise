import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';

import SettingsShell from './SettingsShell.jsx';

const TOGGLES = [
  { key: 'disable_animations', title: 'Reduce motion', desc: 'Stop marquees and looping animations across the app.', on: false },
  { key: 'compact_rows', title: 'Compact rows', desc: 'Tighter spacing in Bookmarks and results lists.', on: false },
  { key: 'autoplay_previews', title: 'Autoplay previews', desc: 'Play video previews on hover in the results grid.', on: true },
];

export default function Appearance() {
  const { flash = {}, preferences = {} } = usePage().props;
  const initialAppearance = {
    ...Object.fromEntries(TOGGLES.map((toggle) => [toggle.key, toggle.on])),
    ...(preferences.appearance ?? {}),
  };
  const [prefs, setPrefs] = useState(() => initialAppearance);
  const [saving, setSaving] = useState(false);

  const togglePreference = (key) => {
    const next = !prefs[key];
    const nextAppearance = {
      ...prefs,
      [key]: next,
    };

    setPrefs(nextAppearance);
    setSaving(true);

    router.patch('/settings/appearance', {
      preferences: {
        appearance: nextAppearance,
      },
    }, {
      preserveScroll: true,
      preserveState: true,
      only: ['flash', 'preferences'],
      onFinish: () => setSaving(false),
    });
  };

  return (
    <>
      <Head title="Appearance · Brand Beacon" />

      <SettingsShell section="appearance">
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

        <div className="card">
          <div className="card__p">
            <h2>Appearance</h2>
            <p className="muted" style={{ fontSize: '.86rem', marginTop: 6 }}>
              Brand Beacon is light only — the dark theme was retired with the rebrand.
            </p>
            <div style={{ marginTop: 8 }}>
              {TOGGLES.map((toggle) => (
                <div className="rowf" key={toggle.key}>
                  <div>
                    <p className="rowf__t">{toggle.title}</p>
                    <p className="rowf__d">{toggle.desc}</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={prefs[toggle.key]}
                    aria-label={toggle.title}
                    className={`sw${prefs[toggle.key] ? ' on' : ''}`}
                    onClick={() => togglePreference(toggle.key)}
                    disabled={saving}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </SettingsShell>
    </>
  );
}
