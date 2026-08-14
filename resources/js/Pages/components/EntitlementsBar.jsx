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

export default function EntitlementsBar() {
    const { auth = {}, billing = {} } = usePage().props;
    const signedIn = auth.signedIn ?? Boolean(auth.user);

    if (!signedIn) return null;

    const searchLimit = billing.searchCreditsLimit ?? 0;
    const searchLeft = billing.searchCreditsRemaining ?? 0;
    const searchUsed = billing.searchCreditsUsed ?? 0;
    const bookmarkLimit = billing.searchBookmarkLimit ?? billing.bookmarkLimit ?? 0;
    const bookmarksUsed = billing.searchBookmarkCount ?? billing.bookmarksUsed ?? billing.bookmarkCount ?? 0;

    // Warn only when it is nearly gone — a quiet bar that cries wolf gets ignored.
    const searchesLow = searchLimit > 0 && searchLeft <= Math.max(1, Math.round(searchLimit * 0.1));

    return (
        <div className="ent">
            <b>{titleCase(billing.currentPlan)}</b>
            <i />
            <span className={searchesLow ? 'low' : undefined}>
                <b>{searchUsed}</b>
                {searchLimit > 0 && `/${searchLimit}`} searches
            </span>
            <i />
            <span>
                <b>{bookmarksUsed}</b>
                {bookmarkLimit > 0 && `/${bookmarkLimit}`} search bookmarks
            </span>
            {!billing.hasPaidPlan && (
                <>
                    <i />
                    <Link href="/plans">Upgrade</Link>
                </>
            )}
        </div>
    );
}
