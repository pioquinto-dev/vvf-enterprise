import { Sun, Moon } from './Icons.jsx';

export default function ThemeToggle({ theme, onToggle, className = '' }) {
  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      className={`relative inline-flex h-9 w-[62px] shrink-0 items-center rounded-full border
        border-black/10 bg-black/[.04] p-1 transition-colors
        dark:border-white/15 dark:bg-white/[.06] ${className}`}
    >
      <span
        className={`absolute h-7 w-7 rounded-full bg-white shadow-sm transition-transform duration-300
          dark:bg-accent ${isDark ? 'translate-x-[26px]' : 'translate-x-0'}`}
      />
      <span className="relative z-10 flex w-full items-center justify-between px-[7px]">
        <Sun className={`h-3.5 w-3.5 transition-colors ${isDark ? 'text-white/40' : 'text-amber-500'}`} />
        <Moon className={`h-3.5 w-3.5 transition-colors ${isDark ? 'text-white' : 'text-ink/35'}`} />
      </span>
    </button>
  );
}
