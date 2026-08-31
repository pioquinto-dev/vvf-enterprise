import { Head } from '@inertiajs/react';

import AppLayout from '../components/AppLayout.jsx';
import SearchWizard from '../components/SearchWizard.jsx';

/**
 * /search is the same wizard the dashboard hosts — it exists so a link with
 * `?q=` can drop someone straight onto the keyword step, and so the sidebar
 * search box has somewhere to point. Steps themselves never change the URL.
 */
export default function Keywords({ phrase = '', type = 'brand' }) {
    return (
        <>
            <Head title={phrase ? 'Add keywords · Brand Beacon' : 'Search · Brand Beacon'} />

            <AppLayout width="max-w-4xl">
                <SearchWizard initialType={type} initialQuery={phrase} />
            </AppLayout>
        </>
    );
}
