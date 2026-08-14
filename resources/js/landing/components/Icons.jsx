export const Logo = ({ className = 'h-7 w-7' }) => (
  <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
    <rect width="32" height="32" rx="10" fill="#FFC629" />
    <circle cx="16" cy="16" r="3.1" fill="#1A1400" />
    <path
      d="M21 11.6a6.2 6.2 0 0 1 0 8.8M11 11.6a6.2 6.2 0 0 0 0 8.8"
      stroke="#1A1400"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path
      d="M25.2 7.6a11.9 11.9 0 0 1 0 16.8M6.8 7.6a11.9 11.9 0 0 0 0 16.8"
      stroke="#1A1400"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
);

export const Mascot = ({ className = 'h-14 w-14' }) => (
  <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
    <rect x="10" y="14" width="44" height="38" rx="12" fill="#5b34f5" />
    <rect x="16" y="20" width="32" height="20" rx="8" fill="#fff" />
    <circle cx="26" cy="30" r="5" fill="#16171d" />
    <circle cx="27.6" cy="28.4" r="1.5" fill="#fff" />
    <circle cx="40" cy="30" r="3.4" fill="#16171d" />
    <path d="M24 46 q8 5 16 0" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" fill="none" />
    <line x1="32" y1="14" x2="32" y2="7" stroke="#5b34f5" strokeWidth="2.4" strokeLinecap="round" />
    <circle cx="32" cy="5" r="3" fill="#ff3d71" />
  </svg>
);

export const Sun = ({ className = 'h-4 w-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.8" />
    <path
      d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

export const Moon = ({ className = 'h-4 w-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M20 14.4A8.4 8.4 0 0 1 9.6 4a8.4 8.4 0 1 0 10.4 10.4Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  </svg>
);

export const Check = ({ className = 'h-3 w-3' }) => (
  <svg viewBox="0 0 12 12" fill="none" className={className} aria-hidden="true">
    <path d="M2 6.5 L5 9 L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Arrow = ({ className = 'h-3.5 w-3.5' }) => (
  <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
    <path d="M3 8h9M8.5 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Trend = ({ className = 'h-3 w-3' }) => (
  <svg viewBox="0 0 12 12" fill="none" className={className} aria-hidden="true">
    <path d="M2 9 L5 5 L7.5 7 L10.5 2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7.6 2.5h3v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Heart = ({ className = 'h-3.5 w-3.5' }) => (
  <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
    <path
      d="M8 13.5S2 10 2 6.2A3.2 3.2 0 0 1 8 4.6a3.2 3.2 0 0 1 6 1.6C14 10 8 13.5 8 13.5Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

export const Comment = ({ className = 'h-3.5 w-3.5' }) => (
  <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
    <path
      d="M13.5 9.5a2 2 0 0 1-2 2H6l-3 2.5v-2.5H4.5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2Z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
  </svg>
);

export const Share = ({ className = 'h-3.5 w-3.5' }) => (
  <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
    <circle cx="12" cy="3.5" r="2" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="4" cy="8" r="2" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="12" cy="12.5" r="2" stroke="currentColor" strokeWidth="1.4" />
    <path d="M10.2 4.6 L5.8 7 M5.8 9 L10.2 11.4" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);

export const Bookmark = ({ className = 'h-3.5 w-3.5', filled = false }) => (
  <svg viewBox="0 0 16 16" fill={filled ? 'currentColor' : 'none'} className={className} aria-hidden="true">
    <path
      d="M4 2.5h8a1 1 0 0 1 1 1v10l-5-2.8L3 13.5v-10a1 1 0 0 1 1-1Z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
  </svg>
);

export const Play = ({ className = 'h-3.5 w-3.5' }) => (
  <svg viewBox="0 0 16 16" fill="currentColor" className={className} aria-hidden="true">
    <path d="M5 3.2 12.5 8 5 12.8Z" />
  </svg>
);

export const Chevron = ({ className = 'h-4 w-4' }) => (
  <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Globe = ({ className = 'h-4 w-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.7" />
    <path d="M4.6 9h14.8M4.6 15h14.8M12 3.8c2.6 2.2 4.1 5 4.1 8.2S14.6 18 12 20.2M12 3.8C9.4 6 7.9 8.8 7.9 12S9.4 18 12 20.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const Menu = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
  </svg>
);

export const Close = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
  </svg>
);

export const Plus = ({ className = 'h-4 w-4' }) => (
  <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
    <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
  </svg>
);

/* ---- App shell / sidebar icons ---- */

export const Search = ({ className = 'h-4 w-4' }) => (
  <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
    <circle cx="7" cy="7" r="4.4" stroke="currentColor" strokeWidth="1.5" />
    <path d="M10.3 10.3 13.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const Library = ({ className = 'h-4 w-4' }) => (
  <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
    <rect x="2.2" y="2.5" width="4" height="11" rx="1.3" stroke="currentColor" strokeWidth="1.4" />
    <rect x="7.6" y="2.5" width="3.2" height="11" rx="1.3" stroke="currentColor" strokeWidth="1.4" />
    <path d="M12.3 3.6 14.3 12.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

export const Store = ({ className = 'h-4 w-4' }) => (
  <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
    <path d="M2.6 6.2 3.6 2.8h8.8l1 3.4a2 2 0 0 1-3.8.9 2 2 0 0 1-3.6 0 2 2 0 0 1-3.4-.9Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    <path d="M3.4 8.2v4.4a.8.8 0 0 0 .8.8h7.6a.8.8 0 0 0 .8-.8V8.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

export const Target = ({ className = 'h-4 w-4' }) => (
  <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
    <circle cx="8" cy="8" r="5.6" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="8" cy="8" r="2.6" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="8" cy="8" r=".9" fill="currentColor" />
  </svg>
);

export const User = ({ className = 'h-4 w-4' }) => (
  <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
    <circle cx="8" cy="5.6" r="2.7" stroke="currentColor" strokeWidth="1.4" />
    <path d="M2.9 13.4a5.1 5.1 0 0 1 10.2 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

export const Exit = ({ className = 'h-4 w-4' }) => (
  <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
    <path d="M6.4 2.6H3.6a1 1 0 0 0-1 1v8.8a1 1 0 0 0 1 1h2.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M10 5.2 12.8 8l-2.8 2.8M12.4 8H6.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Spark = ({ className = 'h-4 w-4' }) => (
  <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
    <path d="M8 1.8 9.5 6.1 13.8 7.6 9.5 9.1 8 13.4 6.5 9.1 2.2 7.6 6.5 6.1Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
  </svg>
);

export const Google = ({ className = 'h-4 w-4' }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      fill="#4285F4"
      d="M23 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.16a5.27 5.27 0 0 1-2.29 3.46v2.87h3.7C21.73 18.8 23 15.8 23 12.27Z"
    />
    <path
      fill="#34A853"
      d="M12 23.5c3.1 0 5.7-1.03 7.6-2.79l-3.71-2.87c-1.03.69-2.35 1.1-3.89 1.1-2.99 0-5.52-2.02-6.43-4.73H1.74v2.96A11.5 11.5 0 0 0 12 23.5Z"
    />
    <path fill="#FBBC05" d="M5.57 14.21a6.9 6.9 0 0 1 0-4.42V6.83H1.74a11.5 11.5 0 0 0 0 10.34l3.83-2.96Z" />
    <path
      fill="#EA4335"
      d="M12 5.06c1.69 0 3.2.58 4.4 1.72l3.28-3.28C17.7 1.63 15.1.5 12 .5A11.5 11.5 0 0 0 1.74 6.83l3.83 2.96C6.48 7.08 9.01 5.06 12 5.06Z"
    />
  </svg>
);

export const Lock = ({ className = 'h-4 w-4' }) => (
  <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
    <rect x="3" y="7" width="10" height="6.5" rx="1.6" stroke="currentColor" strokeWidth="1.4" />
    <path d="M5.2 7V5.8a2.8 2.8 0 1 1 5.6 0V7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

export const Refresh = ({ className = 'h-4 w-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M21 12a9 9 0 1 1-2.6-6.4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M21 3v6h-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Dots = ({ className = 'h-4 w-4' }) => (
  <svg viewBox="0 0 16 16" fill="currentColor" className={className} aria-hidden="true">
    <circle cx="3" cy="8" r="1.2" />
    <circle cx="8" cy="8" r="1.2" />
    <circle cx="13" cy="8" r="1.2" />
  </svg>
);
