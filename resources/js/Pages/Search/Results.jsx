import { Head, router } from '@inertiajs/react';

import SearchShell from '../../landing/flow/SearchShell.jsx';
import ResultsScreen from '../../landing/flow/screens/ResultsScreen.jsx';
import { toQuery } from '../../landing/flow/searchQuery.js';

export default function Results({ type, subject, keywords }) {
    const query = toQuery({ type, subject, keywords });

    return (
        <>
            <Head title="Recent viral videos — VVF" />

            <SearchShell
                pill={{ text: 'Free result', tone: 'accent' }}
                step="results"
                onNewSearch={() => router.visit('/')}
                onExit={() => router.visit('/')}
            >
                <ResultsScreen
                    type={type}
                    subject={subject}
                    keywords={keywords}
                    onStartTrial={() => router.get('/trial', query)}
                />
            </SearchShell>
        </>
    );
}
