import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

import SettingsShell from './SettingsShell.jsx';
import { billing } from '../../landing/flow/api.js';

function formatDate(iso) {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function ratio(used, limit) {
  if (!limit || limit < 0) return 0;
  return Math.min(100, Math.max(0, (used / limit) * 100));
}

const METER_ICONS = {
  search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
  ),
  analysis: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 5h18v14H3z" /><path d="m10 9 5 3-5 3z" /></svg>
  ),
  videoBookmark: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><path d="M6 3h12v18l-6-4.5L6 21z" /></svg>
  ),
  searchBookmark: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /><path d="M9 13V9l3.5 2z" fill="currentColor" stroke="none" /></svg>
  ),
};

function UsageMeter({ icon, label, used, limit, note }) {
  const unlimited = limit === -1;
  const pct = unlimited ? 0 : ratio(used, limit);

  return (
    <div className="subx-meter">
      <div className="subx-meter__top">
        <span className="subx-meter__ic">{icon}</span>
        <span className="subx-meter__label">{label}</span>
      </div>
      <div className="subx-meter__val">
        <span className="subx-meter__used num">{used}</span>
        {unlimited
          ? <span className="subx-meter__inf">· Unlimited</span>
          : <span className="subx-meter__lim num">/ {limit || 0}</span>}
      </div>
      {unlimited
        ? <div className="subx-track subx-track--dash subx-track--good" />
        : <div className="subx-track"><i style={{ width: `${pct}%` }} /></div>}
      {note && <div className="subx-meter__note">{note}</div>}
    </div>
  );
}

function formatPaymentMethod(method) {
  if (!method?.last4) return 'No card on file yet';

  const expiry = method.expMonth && method.expYear
    ? ` · expires ${String(method.expMonth).padStart(2, '0')}/${String(method.expYear).slice(-2)}`
    : '';

  return `${method.brand || 'Card'} ending in ${method.last4}${expiry}`;
}

let stripeJsPromise = null;

function loadStripeJs() {
  if (typeof window === 'undefined') return Promise.reject(new Error('Stripe.js requires a browser.'));
  if (window.Stripe) return Promise.resolve(window.Stripe);
  if (stripeJsPromise) return stripeJsPromise;

  stripeJsPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-stripe-js="true"]');

    if (existing) {
      existing.addEventListener('load', () => resolve(window.Stripe));
      existing.addEventListener('error', () => reject(new Error('Could not load Stripe.js.')));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.async = true;
    script.dataset.stripeJs = 'true';
    script.onload = () => resolve(window.Stripe);
    script.onerror = () => reject(new Error('Could not load Stripe.js.'));
    document.head.appendChild(script);
  });

  return stripeJsPromise;
}

function PaymentMethodModal({ open, busy, saving, error, onClose, onSubmit }) {
  if (!open) return null;

  return (
    <div className="bb">
      <div className="bb-modal">
        <button className="bb-modal__bg" aria-label="Close" onClick={busy || saving ? undefined : onClose} />
        <div className="bb-modal__box">
          <h2>Update payment method</h2>
          <p className="sub">
            Your card details are collected securely by Stripe. We only store the payment method summary in Brand Beacon.
          </p>

          <div
            id="stripe-card-element"
            style={{
              marginTop: 18,
              padding: '14px 16px',
              borderRadius: 14,
              border: '1px solid var(--line)',
              background: 'var(--paper)',
              minHeight: 52,
            }}
          />

          {error && (
            <p className="hint" style={{ marginTop: 10, color: 'var(--warn)' }}>
              {error}
            </p>
          )}

          <div className="actrow__r" style={{ marginTop: 22, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn--g" onClick={onClose} disabled={busy || saving}>
              Cancel
            </button>
            <button type="button" className="btn btn--y" onClick={onSubmit} disabled={busy || saving}>
              {saving ? 'Saving…' : busy ? 'Loading…' : 'Save card'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CancelConfirmModal({ open, busy, error, planName, periodEnd, onConfirm, onClose }) {
  if (!open) return null;

  return (
    <div className="bb">
      <div className="bb-modal">
        <button className="bb-modal__bg" aria-label="Close" onClick={busy ? undefined : onClose} />
        <div className="bb-modal__box" role="dialog" aria-modal="true" aria-label="Cancel subscription">
          <div className="subx-cancel__icon" aria-hidden>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 9v4M12 17h.01" />
              <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
            </svg>
          </div>
          <h2>Cancel your {planName} plan?</h2>
          <p className="sub">
            Your subscription will not renew. You’ll keep full access
            {periodEnd ? <> until <b style={{ color: 'var(--ink)' }}>{periodEnd}</b></> : ' until the end of your current billing period'}
            , then move to the free plan. You can resubscribe anytime.
          </p>

          {error && (
            <p className="subx-error" role="alert" style={{ color: 'var(--bad, #d64545)', marginTop: 14 }}>
              {error}
            </p>
          )}

          <div className="actrow__r" style={{ marginTop: 22, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn--g" onClick={onClose} disabled={busy}>
              Keep subscription
            </button>
            <button type="button" className="btn btn--bad" onClick={onConfirm} disabled={busy}>
              {busy ? 'Cancelling…' : 'Cancel subscription'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Subscription({ subscription, stripePublishableKey = null }) {
  const { flash = {} } = usePage().props;
  const limits = subscription?.limits ?? {};
  const searchLimit = limits.searchCreditsLimit ?? 0;
  const searchUsed = limits.searchCreditsUsed ?? 0;
  const videoBookmarkLimit = limits.videoBookmarkLimit ?? 0;
  const videoBookmarkUsed = limits.videoBookmarkUsed ?? 0;
  const searchBookmarkLimit = limits.searchBookmarkLimit ?? 0;
  const searchBookmarkUsed = limits.searchBookmarkUsed ?? 0;
  const videoAnalysisLimit = limits.videoAnalysisLimit ?? 0;
  const videoAnalysisUsed = limits.videoAnalysisUsed ?? 0;

  const planName = subscription?.planName ?? 'Free';
  const status = subscription?.status ?? 'free';
  const active = status === 'active';
  const price = subscription?.price ?? 0;
  const interval = subscription?.interval ?? 'month';
  const billingCycle = subscription?.billingCycle ?? 'monthly';
  const isTrialing = status === 'trialing' || status === 'trial';
  const cancelAtPeriodEnd = Boolean(subscription?.cancelAtPeriodEnd);
  const cancelsAt = formatDate(subscription?.cancelsAt);
  const trialEnds = formatDate(subscription?.trialEndsAt);
  const renews = formatDate(subscription?.renewsAt);
  const invoices = subscription?.invoices ?? [];
  const [statusMessage, setStatusMessage] = useState(flash.status ?? null);

  const [paymentMethod, setPaymentMethod] = useState(subscription?.paymentMethod ?? null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSaving, setPaymentSaving] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [cancelBusy, setCancelBusy] = useState(false);
  const [cancelError, setCancelError] = useState(null);
  const [reactivateBusy, setReactivateBusy] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [elementsState, setElementsState] = useState(null);

  const searchesLeft = searchLimit > 0 ? Math.max(0, searchLimit - searchUsed) : 0;
  const videoBookmarksUnlimited = videoBookmarkLimit === -1;
  const searchBookmarksUnlimited = searchBookmarkLimit === -1;
  const analysisUnlimited = videoAnalysisLimit === -1;

  const openPaymentMethodModal = async () => {
    if (!stripePublishableKey) {
      setPaymentError('Stripe is not configured yet.');
      setPaymentModalOpen(true);
      return;
    }

    setPaymentModalOpen(true);
    setPaymentLoading(true);
    setPaymentError(null);

    try {
      const StripeConstructor = await loadStripeJs();
      const stripe = StripeConstructor(stripePublishableKey);
      const payload = await billing.createPaymentMethodSetup();

      if (!payload?.clientSecret) {
        throw new Error('Could not start the card update flow.');
      }

      const elements = stripe.elements({ clientSecret: payload.clientSecret });
      const card = elements.create('payment');
      card.mount('#stripe-card-element');

      setElementsState({ stripe, elements, card });
    } catch (error) {
      setPaymentError(error?.message || 'Could not open the card form.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const closePaymentMethodModal = () => {
    if (paymentLoading || paymentSaving) return;

    try {
      elementsState?.card?.destroy?.();
    } catch {
      /* no-op */
    }

    setElementsState(null);
    setPaymentModalOpen(false);
    setPaymentError(null);
  };

  const savePaymentMethod = async () => {
    if (!elementsState?.stripe || !elementsState?.elements) return;

    setPaymentSaving(true);
    setPaymentError(null);

    try {
      const result = await elementsState.stripe.confirmSetup({
        elements: elementsState.elements,
        redirect: 'if_required',
      });

      if (result.error) {
        throw new Error(result.error.message || 'Could not save this card.');
      }

      const paymentMethodId = result.setupIntent?.payment_method;

      if (!paymentMethodId) {
        throw new Error('Stripe did not return a payment method.');
      }

      const response = await billing.updatePaymentMethod(paymentMethodId);
      setPaymentMethod(response?.paymentMethod ?? null);
      setStatusMessage(response?.message || 'Payment method updated.');
      closePaymentMethodModal();
      router.reload({ only: ['subscription'] });
    } catch (error) {
      setPaymentError(error?.message || 'Could not save this card.');
    } finally {
      setPaymentSaving(false);
    }
  };

  const cancelSubscription = async () => {
    setCancelBusy(true);
    setCancelError(null);
    try {
      const response = await billing.cancelSubscription();
      setStatusMessage(response?.message || 'Subscription cancellation scheduled.');
      setCancelModalOpen(false);
      router.reload({ only: ['subscription'] });
    } catch (error) {
      // Surface the failure instead of swallowing it — otherwise the button
      // just resets and it looks like nothing happened.
      setCancelError(error?.message || 'We could not cancel your subscription. Please try again.');
    } finally {
      setCancelBusy(false);
    }
  };

  const reactivateSubscription = async () => {
    setReactivateBusy(true);
    try {
      const response = await billing.reactivateSubscription();
      setStatusMessage(response?.message || 'Subscription reactivated.');
      router.reload({ only: ['subscription'] });
    } finally {
      setReactivateBusy(false);
    }
  };

  return (
    <>
      <Head title="Subscription · Brand Beacon" />

      <SettingsShell section="subscription">
        {statusMessage && (
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card__p">
              <p style={{ fontWeight: 700, color: 'var(--ok)' }}>{statusMessage}</p>
            </div>
          </div>
        )}

        <div className="card subx">
          <div className="subx-plan">
            <div className="subx-plan__id">
              <div className="subx-plan__name-row">
                <span className="subx-plan__name">{planName}</span>
                <span className={`pill ${cancelAtPeriodEnd ? 'pill--warn' : isTrialing ? 'pill--run' : active ? 'pill--ok' : 'pill--off'}`}>
                  <i />
                  {cancelAtPeriodEnd ? 'Scheduled to cancel' : isTrialing ? 'Trialing' : active ? 'Active' : status}
                </span>
              </div>
              <p className="subx-plan__price">
                {price > 0 ? <><b>${price}</b> / {interval}</> : <b>Free plan</b>}
                {cancelAtPeriodEnd && cancelsAt
                  ? <> · Access ends <b>{cancelsAt}</b></>
                  : isTrialing && trialEnds
                    ? <> · Trial ends <b>{trialEnds}</b></>
                    : renews
                      ? <> · Renews <b>{renews}</b></>
                      : ''}
              </p>
            </div>
            <Link href="/plans" className="btn btn--y">
              {active ? 'Change plan' : 'Upgrade'}
            </Link>
          </div>

          {cancelAtPeriodEnd && (
            <div className="subx-notice" role="status" aria-live="polite">
              <div className="subx-notice__icon" aria-hidden>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 8v4" />
                  <path d="M12 16h.01" />
                  <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
                </svg>
              </div>
              <div className="subx-notice__copy">
                <p className="subx-notice__eyebrow">Cancellation scheduled</p>
                <p className="subx-notice__title">
                  Your plan stays active{cancelsAt ? <> until <b>{cancelsAt}</b></> : ''}.
                </p>
                <p className="subx-notice__text">
                  Renewal has been turned off, so the subscription will end automatically at the close of this billing period.
                </p>
                <div className="subx-notice__actions">
                  <button
                    type="button"
                    className="btn btn--y btn--sm"
                    onClick={reactivateSubscription}
                    disabled={reactivateBusy}
                  >
                    {reactivateBusy ? 'Reactivating…' : 'Reactivate subscription'}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="subx-usage-hd">
            <h3>Usage this cycle</h3>
            {(isTrialing && trialEnds) ? <span>Trial ends {trialEnds}</span> : renews ? <span>Resets {renews}</span> : null}
          </div>
          <div className="subx-usage">
            <UsageMeter
              icon={METER_ICONS.search}
              label="Searches"
              used={searchUsed}
              limit={searchLimit}
              note={searchLimit > 0 ? `${searchesLeft} left this cycle` : null}
            />
            <UsageMeter
              icon={METER_ICONS.analysis}
              label="Video analysis"
              used={videoAnalysisUsed}
              limit={videoAnalysisLimit}
              note={analysisUnlimited ? 'No cap on your plan' : `${Math.max(0, videoAnalysisLimit - videoAnalysisUsed)} left this cycle`}
            />
            <UsageMeter
              icon={METER_ICONS.videoBookmark}
              label="Video bookmarks"
              used={videoBookmarkUsed}
              limit={videoBookmarkLimit}
              note={videoBookmarksUnlimited ? 'No cap on your plan' : `${Math.max(0, videoBookmarkLimit - videoBookmarkUsed)} left`}
            />
            <UsageMeter
              icon={METER_ICONS.searchBookmark}
              label="Search bookmarks"
              used={searchBookmarkUsed}
              limit={searchBookmarkLimit}
              note={searchBookmarksUnlimited ? 'No cap on your plan' : `${Math.max(0, searchBookmarkLimit - searchBookmarkUsed)} left`}
            />
          </div>

          <hr className="subx-divider" />

          {paymentMethod ? (
            <div className="subx-pm">
              <span className="subx-pm__brand">{(paymentMethod.brand || 'Card').toUpperCase()}</span>
              <div className="subx-pm__copy">
                <div className="subx-pm__line num">{formatPaymentMethod(paymentMethod)}</div>
                <div className="subx-pm__sub">Update your card details</div>
              </div>
              <button type="button" className="btn btn--g btn--sm" onClick={openPaymentMethodModal}>Update card</button>
            </div>
          ) : (
            <div className="subx-pm subx-pm--empty">
              <span className="subx-pm__add" aria-hidden>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2.5" y="5" width="19" height="14" rx="2.5" /><path d="M2.5 9.5h19M12 13.5v4M10 15.5h4" /></svg>
              </span>
              <div className="subx-pm__copy">
                <div className="subx-pm__line">No card on file</div>
                <div className="subx-pm__sub subx-pm__sub--warn">
                  Add a card{isTrialing && trialEnds ? ` before your trial ends ${trialEnds}` : ''} to keep access.
                </div>
              </div>
              <button type="button" className="btn btn--y btn--sm" onClick={openPaymentMethodModal}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                Add card
              </button>
            </div>
          )}

          {(active || isTrialing) && !cancelAtPeriodEnd && (
            <div className="subx-foot">
              <span className="subx-foot__q"><b>Need to cancel?</b> Keep access through the end of your billing period.</span>
              <button type="button" className="subx-cancel-link" onClick={() => setCancelModalOpen(true)}>
                Cancel subscription
              </button>
            </div>
          )}
        </div>

        {invoices.length > 0 && (
          <div className="card subx" style={{ marginTop: 16 }} id="billing-history">
            <div className="card__p">
              <div>
                <h2>Payment history</h2>
                <p className="muted" style={{ fontSize: '.84rem', marginTop: 6 }}>
                  Your recent Stripe invoices and receipts.
                </p>
              </div>
              <div className="subx-inv">
                {invoices.map((inv, i) => (
                  <div className="subx-inv__row" key={inv.id || i}>
                    <span className="subx-inv__date num">{formatDate(inv.date) ?? inv.date}</span>
                    <span className="subx-inv__meta">
                      {planName} · {billingCycle === 'annual' ? 'annual' : 'monthly'}
                      <span className={`subx-inv__tag${inv.status === 'paid' ? ' is-paid' : ''}`}>{inv.status}</span>
                    </span>
                    <b className="subx-inv__amt num">{inv.amount}</b>
                    {inv.id && (
                      <a
                        href={`/settings/subscription/receipt/${encodeURIComponent(inv.id)}`}
                        className="btn btn--g btn--sm"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Receipt
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </SettingsShell>

      <PaymentMethodModal
        open={paymentModalOpen}
        busy={paymentLoading}
        saving={paymentSaving}
        error={paymentError}
        onClose={closePaymentMethodModal}
        onSubmit={savePaymentMethod}
      />

      <CancelConfirmModal
        open={cancelModalOpen}
        busy={cancelBusy}
        error={cancelError}
        planName={planName}
        periodEnd={renews || trialEnds}
        onConfirm={cancelSubscription}
        onClose={() => {
          if (cancelBusy) return;
          setCancelError(null);
          setCancelModalOpen(false);
        }}
      />
    </>
  );
}
