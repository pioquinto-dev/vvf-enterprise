import { Head, router } from '@inertiajs/react';

import SearchShell from '../../landing/flow/SearchShell.jsx';
import RunningScreen from '../../landing/flow/screens/RunningScreen.jsx';

export default function Running({ searchId }) {
    return (
        <>
            <Head title="Search running — VVF" />

            <SearchShell
                pill={{ text: 'Search running', tone: 'ok' }}
                step="running"
                onNewSearch={() => router.visit('/')}
                onExit={() => router.visit('/')}
            >
                <RunningScreen
                    searchId={searchId}
                    onBack={() => router.visit('/')}
                    onDone={() => router.visit(`/saved-searches/${searchId}`)}
                />
            </SearchShell>
        </>
    );
}
