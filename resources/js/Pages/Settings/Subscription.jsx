import { Head, Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';

import SettingsShell from './SettingsShell.jsx';

function formatDate(iso) {
  if (!iso) return null;

  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

function usageRatio(used, limit) {
  if (limit === -1 || limit === 0) {
    return 0;
  }

  return Math.min(100, Math.max(0, (used / limit) * 100));
}

function LimitCard({ title, blurb, remainingLabel, chip, ratio, tone = 'sky' }) {
  const tones = {
    sky: 'from-sky-500/10 to-cyan-500/10 border-sky-500/15',
    mint: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/15',
    rose: 'from-pink-500/10 to-rose-500/10 border-pink-500/15',
    violet: 'from-violet-500/10 to-fuchsia-500/10 border-violet-500/15',
  };

  return (
    <div className={`rounded-[26px] border bg-linear-to-br p-5 ${tones[tone] ?? tones.sky}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-[18px] font-bold">{title}</h3>
          <p className="mt-1 max-w-[230px] text-[12.5px] muted">{blurb}</p>
        </div>
        <div className="flex h-9 items-center rounded-full bg-white/80 px-3 text-[11px] font-semibold tracking-[.12em] text-ink uppercase dark:bg-white/[.08] dark:text-white">
          {chip}
        </div>
      </div>

      <p className="mt-5 text-[13px] font-semibold text-ink dark:text-white">{remainingLabel}</p>
      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-black/[.06] dark:bg-white/[.08]">
        <div className="h-full rounded-full bg-linear-to-r from-accent-glow to-accent" style={{ width: `${ratio}%` }} />
      </div>
    </div>
  );
}

export default function Subscription({ subscription }) {
  const [tab, setTab] = useState('plan');

  const limits = subscription?.limits ?? {};
  const bookmarkLimit = limits.bookmarkLimit ?? 0;
  const searchLimit = limits.searchCreditsLimit ?? 0;
  const bookmarksUsed = limits.bookmarksUsed ?? 0;
  const searchUsed = limits.searchCreditsUsed ?? 0;

  const planFeatures = useMemo(() => {
    return [
      bookmarkLimit === -1 ? 'Unlimited watchlist' : `${bookmarkLimit} watchlist slots`,
      `${searchLimit} searches`,
      subscription?.status === 'active' ? 'Active subscription' : 'Billing available',
    ];
  }, [bookmarkLimit, searchLimit, subscription?.status]);

  return (
    <>
      <Head title="Subscription settings - VVF" />

      <SettingsShell section="subscription" eyebrow="Plan" heading="Subscription">
        <div className="space-y-4">
          <div className="rounded-[26px] border border-black/[.06] p-1 dark:border-white/[.08]">
            <div className="grid grid-cols-2 gap-1">
              {[
                { key: 'plan', label: 'Plan' },
                { key: 'limits', label: 'Plan limits' },
              ].map((item) => {
                const active = tab === item.key;

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setTab(item.key)}
                    className={`rounded-[20px] px-4 py-3 text-[13px] font-semibold transition ${
                      active
                        ? 'bg-white shadow-[0_12px_30px_-20px_rgba(16,18,32,.35)] dark:bg-white/[.06]'
                        : 'muted'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {tab === 'plan' ? (
            <div className="overflow-hidden rounded-[28px] border border-black/[.06] bg-linear-to-br from-accent/5 via-white to-[#ff4f87]/[.04] dark:border-white/[.08] dark:from-accent/10 dark:via-canvas-dark dark:to-[#ff4f87]/[.07]">
              <div className="px-6 py-6">
                <p className="text-[11px] font-semibold tracking-[.18em] faint uppercase">Summary</p>
                <p className="mt-4 text-[11px] font-semibold tracking-[.18em] faint uppercase">Current plan</p>
                <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-display text-[34px] font-bold tracking-[-.03em]">{subscription?.planName ?? 'Free'}</h2>
                      <span className="rounded-full bg-emerald-500/12 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        {subscription?.status ?? 'free'}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {planFeatures.map((feature) => (
                        <span
                          key={feature}
                          className="rounded-full border border-black/[.06] bg-white/85 px-3 py-1.5 text-[12px] font-semibold dark:border-white/[.08] dark:bg-white/[.06]"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-display text-[40px] font-bold tracking-[-.04em]">
                      {subscription?.price ? `$${subscription.price}` : '$0.00'}
                    </p>
                    <p className="text-[13px] muted">/ {subscription?.interval ?? 'month'}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-black/[.06] px-6 py-4 dark:border-white/[.08]">
                <div className="flex flex-wrap gap-x-5 gap-y-2 text-[12px] muted">
                  <span>Started {formatDate(subscription?.startedAt) ?? 'Not started yet'}</span>
                  <span>Renews {formatDate(subscription?.renewsAt) ?? 'No renewal date'}</span>
                </div>
              </div>

              <div className="grid gap-3 border-t border-black/[.06] px-6 py-5 sm:grid-cols-2 dark:border-white/[.08]">
                <Link href="/plans" className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#12172a] px-5 text-[13px] font-semibold text-white transition hover:opacity-95 dark:bg-white dark:text-canvas-dark">
                  View plans
                </Link>
                <Link href="/plans" className="inline-flex h-12 items-center justify-center rounded-2xl border border-black/[.08] px-5 text-[13px] font-semibold transition hover:border-accent/35 hover:text-accent dark:border-white/[.12] dark:hover:text-accent-glow">
                  Manage billing
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              <LimitCard
                title="Search"
                blurb="Saved searches and search credits available on your current plan."
                remainingLabel={searchLimit === -1 ? 'Unlimited' : `${Math.max(0, searchLimit - searchUsed)} remaining`}
                chip={searchLimit === -1 ? 'Unlimited' : `${searchUsed} / ${searchLimit} used`}
                ratio={usageRatio(searchUsed, searchLimit)}
                tone="sky"
              />
              <LimitCard
                title="Watchlist"
                blurb="Watchlist capacity available on your current plan."
                remainingLabel={bookmarkLimit === -1 ? 'Unlimited' : `${Math.max(0, bookmarkLimit - bookmarksUsed)} remaining`}
                chip={bookmarkLimit === -1 ? 'Unlimited' : `${bookmarksUsed} / ${bookmarkLimit} used`}
                ratio={usageRatio(bookmarksUsed, bookmarkLimit)}
                tone="mint"
              />
            </div>
          )}
        </div>
      </SettingsShell>
    </>
  );
}
