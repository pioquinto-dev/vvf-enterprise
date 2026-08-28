import { Head, Link } from '@inertiajs/react';

function formatDate(iso) {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
}

function formatPeriod(start, end) {
  const a = formatDate(start);
  const b = formatDate(end);
  if (a && b) return `${a} – ${b}`;
  return a || b || null;
}

const StatusPill = ({ status }) => {
  const paid = status === 'paid';
  return (
    <span className={`rcpt-status${paid ? ' is-paid' : ''}`}>
      {paid ? 'Paid' : status || 'Open'}
    </span>
  );
};

export default function Receipt({ receipt }) {
  const issued = formatDate(receipt?.date);
  const lines = Array.isArray(receipt?.lines) ? receipt.lines : [];

  return (
    <div className="bb">
      <Head title={`Receipt ${receipt?.number || ''} · Brand Beacon`} />

      <div className="rcpt">
        <div className="rcpt__bar">
          <Link href="/settings/subscription" className="rcpt__back">← Back to subscription</Link>
          <div className="rcpt__bar-actions">
            {receipt?.pdfUrl && (
              <a className="rcpt__btn" href={receipt.pdfUrl} target="_blank" rel="noreferrer">Stripe PDF</a>
            )}
            <button type="button" className="rcpt__btn rcpt__btn--primary" onClick={() => window.print()}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9V3h12v6M6 18H4v-6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6h-2M6 14h12v7H6z" />
              </svg>
              Print / Save PDF
            </button>
          </div>
        </div>

        <article className="rcpt__sheet">
          <header className="rcpt__head">
            <div className="rcpt__brand">
              <span className="rcpt__logo" aria-hidden>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 12a8 8 0 0 1 8-8M4 12a8 8 0 0 0 8 8M8 12a4 4 0 0 1 4-4" />
                  <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
                </svg>
              </span>
              <div>
                <div className="rcpt__brandname">Brand Beacon</div>
                <div className="rcpt__brandsub">TikTok viral intelligence for brands</div>
              </div>
            </div>
            <div className="rcpt__title">
              <div className="rcpt__title-lab">Receipt</div>
              {receipt?.number && <div className="rcpt__num">{receipt.number}</div>}
              <StatusPill status={receipt?.status} />
            </div>
          </header>

          <div className="rcpt__meta">
            <div>
              <div className="rcpt__meta-lab">Billed to</div>
              <div className="rcpt__meta-val">{receipt?.customerName || receipt?.customerEmail || '—'}</div>
              {receipt?.customerName && receipt?.customerEmail && (
                <div className="rcpt__meta-sub">{receipt.customerEmail}</div>
              )}
            </div>
            <div>
              <div className="rcpt__meta-lab">Date issued</div>
              <div className="rcpt__meta-val">{issued || '—'}</div>
            </div>
            {receipt?.card && (
              <div>
                <div className="rcpt__meta-lab">Paid with</div>
                <div className="rcpt__meta-val">{receipt.card.brand} ·· {receipt.card.last4}</div>
              </div>
            )}
          </div>

          <table className="rcpt__table">
            <thead>
              <tr>
                <th>Description</th>
                <th className="rcpt__r">Qty</th>
                <th className="rcpt__r">Amount</th>
              </tr>
            </thead>
            <tbody>
              {lines.length === 0 ? (
                <tr>
                  <td colSpan={3} className="rcpt__empty">No line items on this invoice.</td>
                </tr>
              ) : (
                lines.map((line, i) => {
                  const period = formatPeriod(line.periodStart, line.periodEnd);
                  return (
                    <tr key={i}>
                      <td>
                        <div className="rcpt__desc">{line.description}</div>
                        {period && <div className="rcpt__period">{period}</div>}
                      </td>
                      <td className="rcpt__r rcpt__num-cell">{line.quantity}</td>
                      <td className="rcpt__r rcpt__num-cell">{line.amount}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          <div className="rcpt__totals">
            <div className="rcpt__totrow">
              <span>Subtotal</span>
              <span className="rcpt__num-cell">{receipt?.subtotal}</span>
            </div>
            {receipt?.tax && (
              <div className="rcpt__totrow">
                <span>Tax</span>
                <span className="rcpt__num-cell">{receipt.tax}</span>
              </div>
            )}
            <div className="rcpt__totrow rcpt__totrow--grand">
              <span>Total paid</span>
              <span className="rcpt__num-cell">{receipt?.amountPaid || receipt?.total}</span>
            </div>
          </div>

          <footer className="rcpt__foot">
            <p>Thank you for using Brand Beacon.</p>
            <p className="rcpt__foot-sub">
              Payments are securely processed by Stripe. Questions about this receipt? Reply to your billing email and we’ll help.
            </p>
          </footer>
        </article>
      </div>
    </div>
  );
}
