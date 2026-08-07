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

  const startPaid = (plan) => {
    if (!auth.signedIn) {
      window.location.assign('/auth/google');
      return;
    }

    billing.checkout(plan?.slug ?? 'basic');
  };

  const startTrial = () => {
    if (!auth.signedIn) {
      window.location.assign('/auth/google');
      return;
    }

    billing.trialCheckout('basic');
  };

  return (
    <>
      <Head title="Plans - VVF" />

      <AppLayout width="max-w-7xl">
        <div ref={revealRoot}>
          <Pricing onStart={startFree} onTrial={startPaid} onTrialStart={startTrial} compact />
        </div>
      </AppLayout>
    </>
  );
}
