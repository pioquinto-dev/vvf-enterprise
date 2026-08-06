/** 4_200_000 → "4.2M". Keeps one decimal only when it adds information. */
export function compactNumber(value) {
  const n = Number(value) || 0;

  if (n >= 1_000_000_000) return trim(n / 1_000_000_000) + 'B';
  if (n >= 1_000_000) return trim(n / 1_000_000) + 'M';
  if (n >= 1_000) return trim(n / 1_000) + 'K';

  return String(Math.round(n));
}

function trim(value) {
  return value >= 100 ? String(Math.round(value)) : String(Math.round(value * 10) / 10).replace(/\.0$/, '');
}

/** 14.2 → "0:14" */
export function duration(seconds) {
  const total = Math.max(0, Math.round(Number(seconds) || 0));
  const mins = Math.floor(total / 60);
  return `${mins}:${String(total % 60).padStart(2, '0')}`;
}

/** ISO date → "6 days ago" */
export function relativeTime(iso) {
  if (!iso) return '';

  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';

  const seconds = Math.max(0, (Date.now() - then) / 1000);
  const units = [
    ['year', 31_536_000],
    ['month', 2_592_000],
    ['week', 604_800],
    ['day', 86_400],
    ['hour', 3_600],
    ['minute', 60],
  ];

  for (const [unit, size] of units) {
    const amount = Math.floor(seconds / size);
    if (amount >= 1) return `${amount} ${unit}${amount === 1 ? '' : 's'} ago`;
  }

  return 'just now';
}

/**
 * Score is engagement per follower — shown as a multiplier so a card can say
 * "18x" the way the old mock did, without inventing a number.
 */
export function multiplier(score) {
  const n = Number(score) || 0;
  if (n <= 0) return null;
  return `${n >= 10 ? Math.round(n) : Math.round(n * 10) / 10}x`;
}

const GRADIENTS = [
  'from-[#3a2b6b] to-[#8b3df0]',
  'from-[#0f3d5c] to-[#2aa7c4]',
  'from-[#5c1030] to-[#ff3d71]',
  'from-[#173a2a] to-[#3fbf7a]',
  'from-[#4a3410] to-[#e0a83a]',
  'from-[#2b1b52] to-[#5b34f5]',
  'from-[#123a4a] to-[#37c8a0]',
  'from-[#4a1240] to-[#d13fb0]',
];

/** Stable per-video gradient, used behind thumbnails that fail to load. */
export function gradientFor(key) {
  const str = String(key ?? '');
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  return GRADIENTS[hash % GRADIENTS.length];
}
