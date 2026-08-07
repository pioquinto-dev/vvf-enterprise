import { Head } from '@inertiajs/react';

import SettingsShell from './SettingsShell.jsx';
import ThemeToggle from '../../landing/components/ThemeToggle.jsx';
import { useTheme } from '../../landing/components/useTheme.js';

export default function Appearance() {
  const { theme, toggle } = useTheme();

  return (
    <>
      <Head title="Appearance settings - Outlier Vault" />

      <SettingsShell section="appearance" eyebrow="Display" heading="Appearance">
        <div className="max-w-4xl">
          <div className="flex items-center justify-between gap-4 dark:border-white/[.08]">
            <div>
              <h2 className="font-display text-[18px] font-bold">Color theme</h2>
              <p className="mt-2 text-[13.5px] muted">Switch between light and dark mode.</p>
            </div>
            <ThemeToggle theme={theme} onToggle={toggle} />
          </div>
        </div>
      </SettingsShell>
    </>
  );
}
