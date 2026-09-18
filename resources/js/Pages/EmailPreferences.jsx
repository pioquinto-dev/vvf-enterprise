import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

/**
 * The page an unsubscribe link lands on. Deliberately standalone: the reader
 * is not signed in and may never sign in again, so it carries no app chrome
 * and asks nothing of them beyond confirming what just happened.
 */
export default function EmailPreferences({ state = 'unsubscribed', email = '', token = '' }) {
    const [working, setWorking] = useState(false);
    const done = state === 'unsubscribed';

    const undo = () => {
        setWorking(true);
        router.post(`/email/unsubscribe/${token}/undo`, {}, {
            preserveScroll: true,
            onFinish: () => setWorking(false),
        });
    };

    return (
        <>
            <Head title={done ? 'Unsubscribed · Brand Beacon' : 'Resubscribed · Brand Beacon'} />
            <main className="ep">
                <style>{css}</style>
                <div className="ep__card">
                    <span className="ep__mark" aria-hidden>{done ? '✓' : '↩'}</span>
                    <h1>{done ? 'You have been unsubscribed' : 'You are subscribed again'}</h1>
                    <p>
                        {done
                            ? 'We will stop sending marketing and re-engagement emails to '
                            : 'Marketing and re-engagement emails will resume for '}
                        <b>{email}</b>.
                    </p>
                    <p className="ep__note">
                        {done
                            ? 'Account and billing emails still come through, since those cover payments, security and anything you asked us to run.'
                            : 'You can unsubscribe again from the link at the bottom of any of those emails.'}
                    </p>
                    <div className="ep__acts">
                        {done ? (
                            <button type="button" className="ep__btn" onClick={undo} disabled={working}>
                                {working ? 'Working…' : 'That was a mistake, resubscribe me'}
                            </button>
                        ) : (
                            <a className="ep__btn" href="/home">Back to Brand Beacon</a>
                        )}
                    </div>
                </div>
            </main>
        </>
    );
}

const css = `
.ep{min-height:100vh;display:grid;place-items:center;padding:24px;background:var(--paper,#FAF9F6);font-family:inherit}
.ep__card{width:100%;max-width:460px;padding:32px 28px;border:1px solid var(--line,#E7E4DD);border-radius:20px;background:#fff;text-align:center;box-shadow:0 18px 44px -34px rgba(20,15,0,.4)}
.ep__mark{display:grid;place-items:center;width:46px;height:46px;margin:0 auto 18px;border-radius:50%;background:var(--wash,#FFF8E6);color:var(--amber-ink,#8A5E00);font-size:20px;font-weight:700}
.ep h1{margin:0;font-size:1.22rem;font-weight:800;letter-spacing:-.03em;color:var(--ink,#0B0B0B)}
.ep p{margin:10px 0 0;font-size:.92rem;line-height:1.55;color:var(--muted,#57544D)}
.ep__note{font-size:.84rem;color:var(--faint,#74716A)}
.ep__acts{margin-top:22px}
.ep__btn{display:inline-flex;align-items:center;justify-content:center;height:42px;padding:0 20px;border:1px solid var(--line-2,#D9D6CF);border-radius:999px;background:#fff;font:inherit;font-size:.87rem;font-weight:700;color:var(--ink,#0B0B0B);text-decoration:none;cursor:pointer;transition:.16s}
.ep__btn:hover{border-color:var(--ink,#0B0B0B);background:var(--paper,#FAF9F6)}
.ep__btn:disabled{opacity:.6;cursor:not-allowed}
@media (max-width:480px){.ep__card{padding:26px 20px}}
`;
