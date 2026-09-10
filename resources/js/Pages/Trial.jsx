import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';

import AppLayout from './components/AppLayout.jsx';
import UpgradePromptModal from './components/UpgradePromptModal.jsx';
import Seo from '../components/Seo.jsx';
import TrialScreen from '../landing/flow/screens/TrialScreen.jsx';
import { billing as billingApi } from '../landing/flow/api.js';

export default function Trial() {
    const { billing = {} } = usePage().props;
    const [trialPromptOpen, setTrialPromptOpen] = useState(Boolean(billing.hasUsedTrial) && !billing.hasPaidPlan);
    const canOfferTrial = billing.trialEligible ?? true;

    return (
        <>
            <Seo title="Start Your 8-Day Trial | Brand Beacon" description="Start an 8-day Brand Beacon trial to track TikTok trends and brand mentions." noIndex />

            <AppLayout pill={{ text: 'Trial', tone: 'accent' }} width="max-w-4xl">
                {canOfferTrial ? (
                    <TrialScreen backLabel="Back to home" onBack={() => router.visit('/')} />
                ) : (
                    <>
                        <div className="surface p-8 text-center">
                            <h1 className="font-display text-[28px] font-bold tracking-[-.03em]">Trial unavailable</h1>
                            <p className="mt-3 text-[14px] muted">
                                This account already used its 8-day trial, so the next step is a paid upgrade.
                            </p>
                            <button onClick={() => router.visit('/plans')} className="btn-accent mx-auto mt-6 h-11 px-5 text-[13px]">
                                View plans
                            </button>
                        </div>

                        <UpgradePromptModal
                            open={trialPromptOpen}
                            eyebrow="Trial already used"
                            title="Your 8-day trial has already been used"
                            body="This account already finished its free trial, so the next step is a paid upgrade."
                            detail="Upgrade to Growth to turn scheduled tracking, bookmarks, and analysis back on."
                            primaryLabel="Upgrade to Growth"
                            onPrimary={() => billingApi.checkout('growth')}
                            secondaryLabel="Maybe later"
                            onSecondary={() => setTrialPromptOpen(false)}
                            onClose={() => setTrialPromptOpen(false)}
                        />
                    </>
                )}
            </AppLayout>
        </>
    );
}
