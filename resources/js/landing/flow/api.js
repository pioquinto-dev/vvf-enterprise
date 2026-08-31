/**
 * Small fetch wrapper for the saved-search endpoints. Inertia handles page
 * navigation; these calls are the in-page ones that should not re-render the
 * whole document.
 */
function csrfToken() {
  return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
}

const API_V1 = '/api/v1';

async function request(url, { method = 'GET', body, signal } = {}) {
  const response = await fetch(url, {
    method,
    credentials: 'same-origin',
    signal,
    headers: {
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(method === 'GET' ? {} : { 'X-CSRF-TOKEN': csrfToken() }),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(payload?.message || `Request failed (${response.status})`);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

export function expandKeywords(phrase, { signal, fresh = false, type = 'brand' } = {}) {
  return fetch(`${API_V1}/saved-searches/expand`, {
    method: 'POST',
    credentials: 'same-origin',
    signal,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'X-CSRF-TOKEN': csrfToken(),
    },
    body: JSON.stringify({ phrase, type, ...(fresh ? { fresh: true } : {}) }),
  }).then(async (response) => {
    const payload = await response.json().catch(() => null);
    if (!response.ok) throw new Error(payload?.message || 'Could not suggest keywords.');
    return payload;
  });
}

export function fetchKeywordSuggestions(type, q, { signal } = {}) {
  const params = new URLSearchParams();
  params.set('type', type);
  if (q) params.set('q', q);

  return request(`${API_V1}/keyword-index/suggestions?${params.toString()}`, { signal });
}

export function createSavedSearch({ type, phrase, name, keywords, frequency, sources }) {
  // `sources` (brand/competitor TikTok handle + website) rides along optionally;
  // the backend uses it to sharpen matching where it can, and ignores it otherwise.
  return request(`${API_V1}/saved-searches`, {
    method: 'POST',
    body: { type, phrase, name, keywords, frequency, ...(sources ? { sources } : {}) },
  });
}

export function fetchNotifications(ids) {
  const query = ids.map((id) => `ids[]=${encodeURIComponent(id)}`).join('&');
  return request(`${API_V1}/saved-searches/notifications?${query}`);
}

export function fetchRecentSearches() {
  return request(`${API_V1}/saved-searches/recent`);
}

export function fetchBookmarkedVideos() {
  return request(`${API_V1}/saved-searches/bookmarked-videos`);
}

export function fetchAnalysisHistory() {
  return request(`${API_V1}/saved-searches/analysis-history`);
}

export const savedSearch = {
  get: (id) => request(`${API_V1}/saved-searches/${id}/json`),
  bookmark: (id, bookmarked) =>
    request(`${API_V1}/saved-searches/${id}/bookmark`, { method: 'PATCH', body: { bookmarked } }),
  pause: (id) => request(`${API_V1}/saved-searches/${id}/pause`, { method: 'PATCH' }),
  resume: (id) => request(`${API_V1}/saved-searches/${id}/resume`, { method: 'PATCH' }),
  update: (id, body) => request(`${API_V1}/saved-searches/${id}/frequency`, { method: 'PATCH', body }),
  refresh: (id) => request(`${API_V1}/saved-searches/${id}/refresh`, { method: 'POST' }),
  retry: (id) => request(`${API_V1}/saved-searches/${id}/retry`, { method: 'POST' }),
  destroy: (id) => request(`${API_V1}/saved-searches/${id}`, { method: 'DELETE' }),
};

export const billing = {
  checkout: (slug, cycle = 'monthly') => {
    const params = new URLSearchParams();
    if (cycle === 'annual') params.set('cycle', 'annual');
    const suffix = params.toString() ? `?${params.toString()}` : '';
    window.location.assign(`/billing/checkout/${encodeURIComponent(slug)}${suffix}`);
  },
  trialCheckout: (slug, cycle = 'monthly') => {
    const params = new URLSearchParams({ trial: '1' });
    if (cycle === 'annual') params.set('cycle', 'annual');
    window.location.assign(`/billing/checkout/${encodeURIComponent(slug)}?${params.toString()}`);
  },
  createPaymentMethodSetup: () => request('/settings/subscription/payment-method/setup', { method: 'POST' }),
  updatePaymentMethod: (paymentMethodId) => request('/settings/subscription/payment-method', {
    method: 'PATCH',
    body: { payment_method_id: paymentMethodId },
  }),
  cancelSubscription: () => request('/settings/subscription/cancel', { method: 'POST' }),
  reactivateSubscription: () => request('/settings/subscription/reactivate', { method: 'POST' }),
};

export const bookmarks = {
  save: (id) => request(`${API_V1}/videos/${id}/bookmark`, { method: 'POST' }),
  remove: (id) => request(`${API_V1}/videos/${id}/bookmark`, { method: 'DELETE' }),
};

export const videoAnalysis = {
  request: (id, body = {}) => request(`${API_V1}/videos/${id}/analysis`, { method: 'POST', body }),
  get: (id) => request(`${API_V1}/videos/${id}/analysis`),
};

/* ---------------- tracked video analyses (session storage) ---------------- */

const TRACKED_ANALYSES_KEY = 'vvf-tracked-video-analyses';

export function readTrackedVideoAnalyses() {
  try {
    const raw = window.sessionStorage.getItem(TRACKED_ANALYSES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeTrackedVideoAnalyses(entries) {
  try {
    window.sessionStorage.setItem(TRACKED_ANALYSES_KEY, JSON.stringify(entries.slice(0, 25)));
  } catch {
    /* storage disabled — tracking is a nicety, not a requirement */
  }
}

export function trackVideoAnalysis(entry) {
  const existing = readTrackedVideoAnalyses().filter((item) => String(item.videoId) !== String(entry.videoId));
  writeTrackedVideoAnalyses([{ ...entry }, ...existing]);
}

export function updateTrackedVideoAnalysis(videoId, patch) {
  writeTrackedVideoAnalyses(
    readTrackedVideoAnalyses().map((item) => (String(item.videoId) === String(videoId) ? { ...item, ...patch } : item))
  );
}

export function untrackVideoAnalysis(videoId) {
  writeTrackedVideoAnalyses(readTrackedVideoAnalyses().filter((item) => String(item.videoId) !== String(videoId)));
}

/* ---------------- tracked searches (session storage) ---------------- */

const TRACKED_KEY = 'vvf-tracked-searches';

export function readTracked() {
  try {
    const raw = window.sessionStorage.getItem(TRACKED_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeTracked(entries) {
  try {
    window.sessionStorage.setItem(TRACKED_KEY, JSON.stringify(entries.slice(0, 10)));
  } catch {
    /* storage disabled — tracking is a nicety, not a requirement */
  }
}

export function trackSearch(entry) {
  const existing = readTracked().filter((t) => String(t.id) !== String(entry.id));
  writeTracked([{ runningPromptShown: false, completedPromptShown: false, ...entry }, ...existing]);
}

export function updateTracked(id, patch) {
  writeTracked(readTracked().map((t) => (String(t.id) === String(id) ? { ...t, ...patch } : t)));
}

export function untrackSearch(id) {
  writeTracked(readTracked().filter((t) => String(t.id) !== String(id)));
}
