import { Head, router } from '@inertiajs/react';

import SearchShell from '../landing/flow/SearchShell.jsx';
import TrialScreen from '../landing/flow/screens/TrialScreen.jsx';
import { toQuery } from '../landing/flow/searchQuery.js';

export default function Trial({ type, subject, keywords, fromResults }) {
    const query = toQuery({ type, subject, keywords });

    return (
        <>
            <Head title="Start your trial — VVF" />

            <SearchShell
                pill={{ text: 'Trial', tone: 'accent' }}
                onNewSearch={() => router.visit('/')}
                onExit={() => router.visit('/')}
            >
                <TrialScreen
                    backLabel={fromResults ? 'Back to results' : 'Back to home'}
                    onBack={() => (fromResults ? router.get('/search/results', query) : router.visit('/'))}
                />
            </SearchShell>
        </>
    );
}
