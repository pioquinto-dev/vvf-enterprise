import { useState } from 'react';
import { Head, router } from '@inertiajs/react';

import AppLayout from '../components/AppLayout.jsx';
import ResultsScreen from '../../landing/flow/screens/ResultsScreen.jsx';
import DetailScreen from './detail/DetailScreen.jsx';
import { savedSearch as api, untrackSearch } from '../../landing/flow/api.js';

/** Types that get the tracker detail layout. Product keeps the results view. */
const TRACKER_TYPES = ['brand', 'competitor'];

const PILL = {
    scraping: { text: 'Refreshing', tone: 'ok' },
    done: { text: 'Free result', tone: 'accent' },
    paused: { text: 'Paused', tone: 'ok' },
    failed: { text: 'Last run failed', tone: 'accent' },
};

export default function Show({ search: initial, isAuthenticated = false, billing }) {
    const [search, setSearch] = useState(initial);
    const [refreshing, setRefreshing] = useState(false);
    const [watchlistUpdating, setWatchlistUpdating] = useState(false);

    const refresh = async () => {
        setRefreshing(true);

        try {
            await api.refresh(search.id);
            router.visit(`/search/running?id=${search.id}`);
        } catch {
            setRefreshing(false);
        }
    };

    const remove = async () => {
        await api.destroy(search.id);
        untrackSearch(search.id);
        router.visit('/saved-searches');
    };

    const togglePause = async () => {
        const { search: updated } = search.status === 'paused'
            ? await api.resume(search.id)
            : await api.pause(search.id);

        setSearch((prev) => ({ ...prev, ...updated }));
    };

    const toggleWatchlist = async () => {
        setWatchlistUpdating(true);

        try {
            const { search: updated } = await api.watchlist(search.id, !search.is_watchlisted);
            setSearch((prev) => ({ ...prev, ...updated }));
        } finally {
            setWatchlistUpdating(false);
        }
    };

    const isTracker = TRACKER_TYPES.includes(search.search_type);

    return (
        <>
            <Head title={`${search.name} - Outlier Vault`} />

            {/* The tracker layout is the mockup's own 1240px wrap and carries its
                own head, so the shell's title/pill row is suppressed for it. */}
            <AppLayout
                pill={isTracker ? undefined : (PILL[search.status] ?? PILL.done)}
                step="results"
                width={isTracker ? 'max-w-[1240px]' : 'max-w-6xl'}
            >
                {isTracker ? (
                    <DetailScreen
                        search={search}
                        isAuthenticated={isAuthenticated}
                        billing={billing}
                        refreshing={refreshing}
                        watchlistUpdating={watchlistUpdating}
                        onRefresh={refresh}
                        onToggleWatchlist={toggleWatchlist}
                        onTogglePause={togglePause}
                        onDelete={remove}
                    />
                ) : (
                    <>
                        <ResultsScreen
                            search={search}
                            isAuthenticated={isAuthenticated}
                            billingState={billing}
                            refreshing={refreshing}
                            watchlistUpdating={watchlistUpdating}
                            onRefresh={refresh}
                            onStartTrial={() => router.visit('/trial')}
                            onToggleWatchlist={toggleWatchlist}
                        />

                        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-black/[.06] pt-6 dark:border-white/[.07]">
                            <p className="text-[12.5px] faint">
                                {search.status === 'paused'
                                    ? 'Paused — no refreshes will run.'
                                    : search.next_run_at
                                      ? `Next refresh ${new Date(search.next_run_at).toLocaleDateString()}`
                                      : 'No refresh scheduled.'}
                            </p>

                            <div className="flex flex-wrap gap-2">
                                <button onClick={togglePause} className="btn-ghost h-10 px-4 text-[13px]">
                                    {search.status === 'paused' ? 'Resume' : 'Pause'}
                                </button>
                                <button
                                    onClick={refresh}
                                    disabled={refreshing || search.status === 'scraping'}
                                    className="btn-ghost h-10 px-4 text-[13px]"
                                >
                                    Refresh now
                                </button>
                                <button
                                    onClick={remove}
                                    className="h-10 rounded-xl border border-hot/30 px-4 text-[13px] font-semibold text-hot transition hover:bg-hot/10"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </AppLayout>
        </>
    );
}
