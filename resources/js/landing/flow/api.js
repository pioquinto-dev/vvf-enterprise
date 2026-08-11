/**
 * Small fetch wrapper for the saved-search endpoints. Inertia handles page
 * navigation; these calls are the in-page ones that should not re-render the
 * whole document.
 */
function csrfToken() {
  return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
}

const API_V1 = '/api/v1';

async function request(url, { method = 'GET', body } = {}) {
  const response = await fetch(url, {
    method,
    credentials: 'same-origin',
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

export function expandKeywords(phrase, { signal } = {}) {
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
    body: JSON.stringify({ phrase }),
  }).then(async (response) => {
    const payload = await response.json().catch(() => null);
    if (!response.ok) throw new Error(payload?.message || 'Could not suggest keywords.');
    return payload;
  });
}

export function createSavedSearch({ type, phrase, name, keywords, frequency }) {
  return request(`${API_V1}/saved-searches`, {
    method: 'POST',
    body: { type, phrase, name, keywords, frequency },
  });
}

export function fetchNotifications(ids) {
  const query = ids.map((id) => `ids[]=${encodeURIComponent(id)}`).join('&');
  return request(`${API_V1}/saved-searches/notifications?${query}`);
}

export const savedSearch = {
  get: (id) => request(`${API_V1}/saved-searches/${id}/json`),
  bookmark: (id, bookmarked) =>
    request(`${API_V1}/saved-searches/${id}/bookmark`, { method: 'PATCH', body: { bookmarked } }),
  pause: (id) => request(`${API_V1}/saved-searches/${id}/pause`, { method: 'PATCH' }),
  resume: (id) => request(`${API_V1}/saved-searches/${id}/resume`, { method: 'PATCH' }),
  update: (id, body) => request(`${API_V1}/saved-searches/${id}/frequency`, { method: 'PATCH', body }),
  refresh: (id) => request(`${API_V1}/saved-searches/${id}/refresh`, { method: 'POST' }),
  destroy: (id) => request(`${API_V1}/saved-searches/${id}`, { method: 'DELETE' }),
};

export const billing = {
  checkout: (slug) => {
    window.location.assign(`/billing/checkout/${encodeURIComponent(slug)}`);
  },
  trialCheckout: (slug) => {
    window.location.assign(`/billing/checkout/${encodeURIComponent(slug)}?trial=1`);
  },
};

export const bookmarks = {
  save: (id) => request(`${API_V1}/videos/${id}/bookmark`, { method: 'POST' }),
  remove: (id) => request(`${API_V1}/videos/${id}/bookmark`, { method: 'DELETE' }),
};

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
