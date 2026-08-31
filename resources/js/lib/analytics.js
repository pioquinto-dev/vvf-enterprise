function canTrack() {
  return typeof window !== 'undefined' && Array.isArray(window.dataLayer);
}

function normalizeEvent(entry) {
  if (!entry || typeof entry !== 'object') return null;
  if (!entry.event || typeof entry.event !== 'string') return null;

  return {
    event: entry.event,
    ...(entry.parameters && typeof entry.parameters === 'object' ? entry.parameters : {}),
  };
}

export function pushAnalyticsEvent(entry) {
  const normalized = normalizeEvent(entry);

  if (!normalized || !canTrack()) return;

  window.dataLayer.push(normalized);
}

export function pushAnalyticsEvents(entries) {
  if (!Array.isArray(entries)) return;

  entries.forEach(pushAnalyticsEvent);
}

export function trackPageView({ url, title, pageType, userState }) {
  pushAnalyticsEvent({
    event: 'page_view',
    parameters: {
      page_location: url,
      page_title: title,
      page_type: pageType,
      user_state: userState,
    },
  });
}

