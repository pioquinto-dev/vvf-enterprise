import { Head, router } from '@inertiajs/react';

import AppLayout from '../components/AppLayout.jsx';
import RunningScreen from '../../landing/flow/screens/RunningScreen.jsx';

export default function Running({ searchId }) {
    return (
        <>
            <Head title="Search running · Brand Beacon" />

            <AppLayout width="max-w-4xl">
                <RunningScreen
                    searchId={searchId}
                    onBack={() => router.visit('/bookmarks')}
                    onDone={() => router.visit(`/bookmarks/${searchId}`)}
                    onAutoReturn={() => router.visit('/dashboard')}
                />
            </AppLayout>
        </>
    );
}
