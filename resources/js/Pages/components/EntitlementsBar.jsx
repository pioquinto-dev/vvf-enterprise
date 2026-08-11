import { Link, usePage } from '@inertiajs/react';

/**
 * Plan and allowance at a glance — one quiet line, not a dashboard.
 *
 * It answers "how much have I got left" in passing. Anything larger competes
 * with the search card, which is the only thing on this page that matters.
 */

function titleCase(slug) {
    return String(slug || 'free')
        .split(/[-_\s]+/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

const Dot = () => <span aria-hidden className="h-1 w-1 rounded-full bg-current opacity-25" />;

export default function EntitlementsBar() {
    const { auth = {}, billing = {} } = usePage().props;
    const signedIn = auth.signedIn ?? Boolean(auth.user);

    if (!signedIn) return null;

    const searchLimit = billing.searchCreditsLimit ?? 0;
    const searchLeft = billing.searchCreditsRemaining ?? 0;
    const searchUsed = billing.searchCreditsUsed ?? 0;
    const bookmarkLimit = billing.bookmarkLimit ?? 0;
    const bookmarksUsed = billing.bookmarksUsed ?? billing.bookmarkCount ?? 0;

    // Warn only when it is nearly gone — a quiet bar that cries wolf gets ignored.
    const searchesLow = searchLimit > 0 && searchLeft <= Math.max(1, Math.round(searchLimit * 0.1));

    return (
        <div className="mb-3 flex justify-end">
            <div className="inline-flex flex-wrap items-center gap-2.5 rounded-full border border-black/[.06] bg-white/55 px-3.5 py-1.5 text-[11.5px] muted backdrop-blur-sm dark:border-white/[.07] dark:bg-white/[.03]">
                <span className="font-semibold text-ink dark:text-white">{titleCase(billing.currentPlan)}</span>

                <Dot />

                <span className={searchesLow ? 'text-hot' : undefined}>
                    <b className="font-semibold text-ink dark:text-white">{searchUsed}</b>
                    {searchLimit > 0 && <span>/{searchLimit}</span>} searches
                </span>

                <Dot />

                <span>
                    <b className="font-semibold text-ink dark:text-white">{bookmarksUsed}</b>
                    {bookmarkLimit > 0 && <span>/{bookmarkLimit}</span>} bookmarks
                </span>

                {!billing.hasPaidPlan && (
                    <>
                        <Dot />
                        <Link
                            href="/plans"
                            className="font-semibold text-accent transition hover:underline dark:text-accent-glow"
                        >
                            Upgrade
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}
