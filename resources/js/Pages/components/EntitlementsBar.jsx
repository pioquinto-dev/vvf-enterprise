import { Link, usePage } from '@inertiajs/react';

/**
 * Plan and allowance at a glance — the handoff mockup's `.ent` pill, wired to
 * real billing props. One quiet line, not a dashboard.
 */

function titleCase(slug) {
    return String(slug || 'free')
        .split(/[-_\s]+/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

export default function EntitlementsBar({ variant = 'default' }) {
    const { auth = {}, billing = {} } = usePage().props;
    const signedIn = auth.signedIn ?? Boolean(auth.user);

    if (!signedIn) return null;

    const searchLimit = billing.searchCreditsLimit ?? 0;
    const searchLeft = billing.searchCreditsRemaining ?? 0;
    const searchUsed = billing.searchCreditsUsed ?? 0;
    // Warn only when it is nearly gone — a quiet bar that cries wolf gets ignored.
    const searchesLow = searchLimit > 0 && searchLeft <= Math.max(1, Math.round(searchLimit * 0.1));

    if (variant === 'drawer') {
        return (
            <Link href="/settings/subscription" className="ent ent--drawer" aria-label="Open subscription settings">
                <span className="ent__line">
                    <b>{titleCase(billing.currentPlan)}</b>
                    <i />
                    <span className={searchesLow ? 'low' : undefined}>
                        <b>{searchUsed}</b>
                        {searchLimit > 0 && `/${searchLimit}`} searches
                    </span>
                    <i />
                    <span className="ent__cta">View Full Credits</span>
                </span>
            </Link>
        );
    }

    return (
        <Link href="/settings/subscription" className="ent" aria-label="Open subscription settings">
            <b>{titleCase(billing.currentPlan)}</b>
            <i />
            <span className={searchesLow ? 'low' : undefined}>
                <b>{searchUsed}</b>
                {searchLimit > 0 && `/${searchLimit}`} searches
            </span>
            {!billing.hasPaidPlan && (
                <>
                    <i />
                    <span style={{ textDecoration: 'underline' }}>Upgrade</span>
                </>
            )}
        </Link>
    );
}
