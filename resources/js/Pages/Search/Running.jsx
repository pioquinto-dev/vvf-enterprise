import { Head, router } from '@inertiajs/react';

import SearchShell from '../../landing/flow/SearchShell.jsx';
import RunningScreen from '../../landing/flow/screens/RunningScreen.jsx';
import { toQuery } from '../../landing/flow/searchQuery.js';

export default function Running({ type, subject, keywords }) {
    const query = toQuery({ type, subject, keywords });

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
                    onBack={() => router.get('/search', { type: query.type, q: query.q })}
                    onContinue={() => router.get('/search/results', query)}
                />
            </SearchShell>
        </>
    );
}
