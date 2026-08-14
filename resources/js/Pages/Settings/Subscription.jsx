import { Head, Link } from '@inertiajs/react';

import SettingsShell from './SettingsShell.jsx';

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

export default function Subscription({ subscription }) {
  const limits = subscription?.limits ?? {};
  const searchLimit = limits.searchCreditsLimit ?? 0;
  const searchUsed = limits.searchCreditsUsed ?? 0;
  const bookmarkLimit = limits.bookmarkLimit ?? 0;
  const bookmarksUsed = limits.bookmarksUsed ?? 0;

  const planName = subscription?.planName ?? 'Free';
  const status = subscription?.status ?? 'free';
  const active = status === 'active';
  const price = subscription?.price ?? 0;
  const interval = subscription?.interval ?? 'month';
  const renews = formatDate(subscription?.renewsAt);
  const invoices = subscription?.invoices ?? [];

  const searchesLeft = searchLimit > 0 ? Math.max(0, searchLimit - searchUsed) : 0;
  const bookmarksUnlimited = bookmarkLimit === -1;

  return (
    <>
      <Head title="Subscription · Brand Beacon" />

      <SettingsShell section="subscription">
        <div className="card">
          <div className="card__p">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap' }}>
              <div>
                <h2>{planName}</h2>
                <p className="muted" style={{ fontSize: '.86rem', marginTop: 6 }}>
                  {price > 0 ? `$${price}/${interval}` : 'Free plan'}
                  {renews ? ` · renews ${renews}` : ''}
                </p>
              </div>
              <span className={`pill ${active ? 'pill--ok' : 'pill--off'}`}>
                <i />
                {active ? 'Active' : status}
              </span>
            </div>

            <div style={{ marginTop: 26, display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.84rem', marginBottom: 8 }}>
                  <span className="muted">Searches used</span>
                  <span style={{ fontWeight: 700, color: 'var(--ink)' }}>
                    {searchUsed} / {searchLimit || 0}
                  </span>
                </div>
                <div className="meter">
                  <span style={{ width: `${ratio(searchUsed, searchLimit)}%` }} />
                </div>
                {searchLimit > 0 && (
                  <p className="hint">
                    {searchesLeft} search{searchesLeft === 1 ? '' : 'es'} left this cycle
                    {renews ? `. Resets ${renews}.` : '.'}
                  </p>
                )}
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.84rem', marginBottom: 8 }}>
                  <span className="muted">Bookmarks used</span>
                  <span style={{ fontWeight: 700, color: 'var(--ink)' }}>
                    {bookmarksUsed} {bookmarksUnlimited ? '' : `/ ${bookmarkLimit || 0}`}
                  </span>
                </div>
                <div className="meter">
                  <span style={{ width: bookmarksUnlimited ? '100%' : `${ratio(bookmarksUsed, bookmarkLimit)}%` }} />
                </div>
              </div>
            </div>

            <div style={{ marginTop: 26, display: 'flex', gap: 9, flexWrap: 'wrap' }}>
              <Link href="/plans" className="btn btn--y">
                {active ? 'Change plan' : 'Upgrade'}
              </Link>
              <Link href="/plans" className="btn btn--g">
                Manage billing
              </Link>
            </div>
          </div>
        </div>

        {invoices.length > 0 && (
          <div className="card" style={{ marginTop: 16 }}>
            <div className="card__p">
              <h2>Invoices</h2>
              <div style={{ marginTop: 8 }}>
                {invoices.map((inv, i) => (
                  <div className="rowf" key={i}>
                    <div>
                      <p className="rowf__t">{formatDate(inv.date) ?? inv.date}</p>
                      <p className="rowf__d">{planName} · {interval}ly</p>
                    </div>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <b style={{ fontSize: '.88rem', color: 'var(--ink)' }}>{inv.amount}</b>
                      {inv.url && (
                        <a href={inv.url} className="btn btn--g btn--sm">
                          Receipt
                        </a>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </SettingsShell>
    </>
  );
}
