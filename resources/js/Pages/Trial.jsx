import { Head, router, usePage } from '@inertiajs/react';

import AppLayout from './components/AppLayout.jsx';
import TrialScreen from '../landing/flow/screens/TrialScreen.jsx';

export default function Trial() {
    const { billing = {} } = usePage().props;

    return (
        <>
            <Head title="Start your trial - Outlier Vault" />

            <AppLayout pill={{ text: 'Trial', tone: 'accent' }} width="max-w-4xl">
                {billing.trialEligible ?? true ? (
                    <TrialScreen backLabel="Back to home" onBack={() => router.visit('/')} />
                ) : (
                    <div className="surface p-8 text-center">
                        <h1 className="font-display text-[28px] font-bold tracking-[-.03em]">Trial unavailable</h1>
                        <p className="mt-3 text-[14px] muted">
                            This account is already on a paid plan without trial access, so trial offers are hidden.
                        </p>
                        <button onClick={() => router.visit('/plans')} className="btn-accent mx-auto mt-6 h-11 px-5 text-[13px]">
                            Back to plans
                        </button>
                    </div>
                )}
            </AppLayout>
        </>
    );
}
