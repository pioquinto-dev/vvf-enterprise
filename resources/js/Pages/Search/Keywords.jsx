import { Head, router } from '@inertiajs/react';

import SearchShell from '../../landing/flow/SearchShell.jsx';
import KeywordsScreen from '../../landing/flow/screens/KeywordsScreen.jsx';
import { toQuery } from '../../landing/flow/searchQuery.js';

export default function Keywords({ type, subject }) {
    return (
        <>
            <Head title="Add keywords — VVF" />

            <SearchShell
                pill={{ text: '1 free search', tone: 'ok' }}
                step="keywords"
                onNewSearch={() => router.visit('/')}
                onExit={() => router.visit('/')}
            >
                <KeywordsScreen
                    type={type}
                    subject={subject}
                    onBack={() => router.visit('/')}
                    onRun={(keywords) => router.get('/search/running', toQuery({ type, subject, keywords }))}
                />
            </SearchShell>
        </>
    );
}
