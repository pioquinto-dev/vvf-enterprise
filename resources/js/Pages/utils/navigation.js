export function withReturnTo(url, from) {
  const target = String(url || '').trim();
  const origin = String(from || '').trim();

  if (!target || !origin) return target;

  const glue = target.includes('?') ? '&' : '?';
  return `${target}${glue}from=${encodeURIComponent(origin)}`;
}

export function getSafeReturnTo(value) {
  const target = String(value || '').trim();

  if (!target.startsWith('/')) return null;
  if (target.startsWith('//')) return null;

  return target;
}

export function canUseHistoryBack(referrer, currentPath) {
  if (typeof window === 'undefined') return false;
  if (window.history.length <= 1) return false;

  const source = String(referrer || '').trim();
  if (!source) return false;

  try {
    const referrerUrl = new URL(source, window.location.origin);

    if (referrerUrl.origin !== window.location.origin) return false;

    const referrerPath = `${referrerUrl.pathname}${referrerUrl.search}`;
    return referrerPath !== String(currentPath || '').trim();
  } catch {
    return false;
  }
}
