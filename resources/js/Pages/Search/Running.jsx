import { Head, router } from '@inertiajs/react';

import AppLayout from '../components/AppLayout.jsx';
import RunningScreen from '../../landing/flow/screens/RunningScreen.jsx';

export default function Running({ searchId }) {
    return (
        <>
            <Head title="Search running - Outlier Vault" />

            <AppLayout pill={{ text: 'Search running', tone: 'ok' }} step="running" width="max-w-4xl">
                <RunningScreen
                    searchId={searchId}
                    onBack={() => router.visit('/bookmark')}
                    onDone={() => router.visit(`/bookmark/${searchId}`)}
                />
            </AppLayout>
        </>
    );
}
