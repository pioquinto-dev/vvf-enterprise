import { useState } from 'react';
import { Head, router } from '@inertiajs/react';

import SearchShell from '../../landing/flow/SearchShell.jsx';
import KeywordsScreen from '../../landing/flow/screens/KeywordsScreen.jsx';
import { createSavedSearch, trackSearch } from '../../landing/flow/api.js';

export default function Keywords({ phrase }) {
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const submit = async ({ keywords, frequency, name }) => {
        setSubmitting(true);
        setError(null);

        try {
            const created = await createSavedSearch({ phrase, name, keywords, frequency });

            // Remember it locally so the running screen can keep polling even
            // if the visitor navigates away and comes back.
            trackSearch({ id: created.id, name: created.name, url: created.url });

            router.visit(`/search/running?id=${created.id}`);
        } catch (e) {
            setError(e.message || 'Could not start the search. Try again.');
            setSubmitting(false);
        }
    };

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
                    phrase={phrase}
                    submitting={submitting}
                    error={error}
                    onBack={() => router.visit('/')}
                    onSubmit={submit}
                />
            </SearchShell>
        </>
    );
}
