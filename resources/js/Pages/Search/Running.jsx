import { Head, router } from '@inertiajs/react';

import AppLayout from '../components/AppLayout.jsx';
import RunningScreen from '../../landing/flow/screens/RunningScreen.jsx';

export default function Running({ searchId }) {
    return (
        <>
            <Head title="Search running — VVF" />

            <AppLayout pill={{ text: 'Search running', tone: 'ok' }} step="running" width="max-w-4xl">
                <RunningScreen
                    searchId={searchId}
                    onBack={() => router.visit('/saved-searches')}
                    onDone={() => router.visit(`/saved-searches/${searchId}`)}
                />
            </AppLayout>
        </>
    );
}
