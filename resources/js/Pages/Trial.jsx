import { Head, router } from '@inertiajs/react';

import AppLayout from './components/AppLayout.jsx';
import TrialScreen from '../landing/flow/screens/TrialScreen.jsx';

export default function Trial() {
    return (
        <>
            <Head title="Start your trial — VVF" />

            <AppLayout pill={{ text: 'Trial', tone: 'accent' }} width="max-w-4xl">
                <TrialScreen backLabel="Back to home" onBack={() => router.visit('/')} />
            </AppLayout>
        </>
    );
}
