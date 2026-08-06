import { Head, router } from '@inertiajs/react';

import SearchShell from '../landing/flow/SearchShell.jsx';
import TrialScreen from '../landing/flow/screens/TrialScreen.jsx';

export default function Trial() {
    return (
        <>
            <Head title="Start your trial — VVF" />

            <SearchShell
                pill={{ text: 'Trial', tone: 'accent' }}
                onNewSearch={() => router.visit('/')}
                onExit={() => router.visit('/')}
            >
                <TrialScreen backLabel="Back to home" onBack={() => router.visit('/')} />
            </SearchShell>
        </>
    );
}
