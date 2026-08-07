import { Head, usePage } from '@inertiajs/react';

import AppLayout from './components/AppLayout.jsx';
import { useReveal } from '../landing/components/Reveal.jsx';
import Pricing from '../landing/sections/Pricing.jsx';
import { billing } from '../landing/flow/api.js';

export default function Plans() {
  const { auth = {} } = usePage().props;
  const revealRoot = useReveal();

  const startFree = () => {
    window.location.assign('/search?type=brand');
  };

  const startTrialCheckout = (plan) => {
    if (!auth.signedIn) {
      window.location.assign(`/login?redirect=trial_checkout&plan=${encodeURIComponent(plan?.slug ?? 'basic')}&trial=1`);
      return;
    }

    billing.trialCheckout(plan?.slug ?? 'basic');
  };

  return (
    <>
      <Head title="Plans - Outlier Vault" />

      <AppLayout width="max-w-7xl">
        <div ref={revealRoot}>
          <Pricing onStart={startFree} onTrial={startTrialCheckout} onTrialStart={startTrialCheckout} compact />
        </div>
      </AppLayout>
    </>
  );
}
