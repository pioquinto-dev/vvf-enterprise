import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { pushAnalyticsEvents, trackPageView } from './lib/analytics.js';

function inferPageType(component) {
    if (!component) return 'unknown';
    if (component.startsWith('Auth/')) return 'auth';
    if (component.startsWith('Admin/')) return 'admin';
    if (component.startsWith('SavedSearches/')) return 'saved_search';
    if (component.startsWith('Settings/')) return 'settings';
    if (component.startsWith('Search/')) return 'search';
    if (component === 'Landing' || component === 'Trial' || component === 'ComingSoon') return 'marketing';

    return 'app';
}

function trackInertiaPage(page) {
    if (typeof window === 'undefined') return;

    const analytics = page?.props?.analytics ?? {};
    const auth = page?.props?.auth ?? {};

    pushAnalyticsEvents(analytics.events);
    trackPageView({
        url: window.location.href,
        title: document.title,
        pageType: inferPageType(page?.component),
        userState: auth.signedIn ? 'authenticated' : 'guest',
    });
}

createInertiaApp({
    resolve: async (name) => {
        const pages = import.meta.glob('./Pages/**/*.jsx');
        const page = pages[`./Pages/${name}.jsx`];

        if (!page) {
            throw new Error(`Unknown Inertia page: ${name}`);
        }

        const module = await page();

        return module.default;
    },
    setup({ el, App, props }) {
        router.on('success', (event) => {
            trackInertiaPage(event.detail.page);
        });

        createRoot(el).render(<App {...props} />);
        trackInertiaPage(props.initialPage);
    },
    progress: {
        color: '#f97316',
    },
});
