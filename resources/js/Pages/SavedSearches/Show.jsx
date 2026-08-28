import { Component, useEffect, useState } from 'react';
import { Head, router } from '@inertiajs/react';

import AppLayout from '../components/AppLayout.jsx';
import DetailScreen from './detail/DetailScreen.jsx';
import { bookmarks, savedSearch as api, untrackSearch } from '../../landing/flow/api.js';

const ACTIVE_SEARCH_STATUSES = new Set(['pending', 'queued', 'running', 'scraping']);
const SEARCH_POLL_MS = 8000;

function UsageConfirmModal({ title, body, subject, confirmLabel, busy = false, onConfirm, onCancel }) {
    return (
        <div className="bb">
            <div className="bb-modal">
                <button className="bb-modal__bg" aria-label="Close" onClick={onCancel} />
                <div className="bb-modal__box">
                    <h2>{title}</h2>
                    <p className="sub">{body}</p>
                    {subject && <p style={{ marginTop: 16, fontWeight: 700, color: 'var(--ink)' }}>{subject}</p>}
                    <div className="actrow__r" style={{ marginTop: 24, justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn--g" onClick={onCancel} disabled={busy}>
                            Cancel
                        </button>
                        <button type="button" className="btn btn--y" onClick={onConfirm} disabled={busy}>
                            {busy ? 'Starting…' : confirmLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ProcessingOverlay({ search, failed = false, onGoDashboard }) {
    const title = failed ? 'Search needs attention' : 'Your search is still processing';
    const body = failed
        ? (search?.latest_run_error || 'We could not finish this search. You can head back to the dashboard and try again from there.')
        : 'We are still pulling videos, filtering matches, and preparing the result. This page will update automatically as soon as the run finishes.';

    return (
        <div className="bb">
            <div className="bb-modal">
                <div className="bb-modal__bg" aria-hidden="true" />
                <div className="bb-modal__box" style={{ maxWidth: 520 }}>
                    {!failed && (
                        <div
                            aria-hidden="true"
                            style={{
                                width: 52,
                                height: 52,
                                margin: '0 auto 18px',
                                borderRadius: '999px',
                                border: '4px solid #f3e5b7',
                                borderTopColor: '#d4a017',
                                animation: 'results-processing-spin 1s linear infinite',
                            }}
                        />
                    )}
                    <h2 style={{ textAlign: 'center' }}>{title}</h2>
                    <p className="sub" style={{ marginTop: 10, textAlign: 'center' }}>{body}</p>
                    {search?.name && (
                        <p style={{ marginTop: 18, fontWeight: 700, color: 'var(--ink)', textAlign: 'center' }}>
                            {search.name}
                        </p>
                    )}
                    <div style={{ marginTop: 18, display: 'flex', justifyContent: 'center' }}>
                        <span
                            className={`pill ${failed ? 'pill--bad' : 'pill--run'}`}
                            style={{ fontSize: '.82rem' }}
                        >
                            <i />
                            {failed ? 'Failed' : 'Processing'}
                        </span>
                    </div>
                    <div className="actrow__r" style={{ marginTop: 24, justifyContent: 'center' }}>
                        <button type="button" className="btn btn--g" onClick={onGoDashboard}>
                            Go to dashboard
                        </button>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes results-processing-spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

class DetailScreenBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { error: null };
    }

    static getDerivedStateFromError(error) {
        return { error };
    }

    componentDidCatch(error, info) {
        console.error('SavedSearch detail render failed', error, info);
    }

    render() {
        if (this.state.error) {
            return (
                <div className="tracker">
                    <div className="gate">
                        <h2>Results page failed to render</h2>
                        <p>
                            {this.state.error?.message || 'An unexpected error happened while rendering this search.'}
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * The single detail view for every saved search — brand and
 * product all render the same analytics tracker (the one design identity).
 */
export default function Show({ search: initial, isAuthenticated = false, billing }) {
    const [search, setSearch] = useState(initial);
    const [refreshing, setRefreshing] = useState(false);
    const [bookmarkingSearch, setBookmarkingSearch] = useState(false);
    const [bookmarkingVideoId, setBookmarkingVideoId] = useState(null);
    const [confirmRefresh, setConfirmRefresh] = useState(false);
    const [pollError, setPollError] = useState(false);

    const isSearchProcessing = ACTIVE_SEARCH_STATUSES.has(String(search?.status ?? '').toLowerCase());
    const hasProcessingFailure = String(search?.status ?? '').toLowerCase() === 'failed';

    const searchLimit = billing?.searchCreditsLimit ?? 0;
    const searchUsed = billing?.searchCreditsUsed ?? 0;
    const searchRemainingAfterUse = searchLimit === -1 ? 'unlimited' : Math.max(0, searchLimit - searchUsed - 1);

    const runRefresh = async () => {
        setRefreshing(true);

        try {
            await api.refresh(search.id);
            router.visit(`/search/running?id=${search.id}`);
        } catch {
            setRefreshing(false);
        }
    };

    const refresh = async () => {
        if (isAuthenticated && searchLimit !== 0) {
            setConfirmRefresh(true);
            return;
        }

        await runRefresh();
    };

    const remove = async () => {
        await api.destroy(search.id);
        untrackSearch(search.id);
        router.visit('/library');
    };

    const togglePause = async () => {
        const { search: updated } =
            search.status === 'paused' ? await api.resume(search.id) : await api.pause(search.id);

        setSearch((prev) => ({ ...prev, ...updated }));
    };

    const toggleBookmark = async () => {
        setBookmarkingSearch(true);

        try {
            const { search: updated } = await api.bookmark(search.id, !search.is_watchlisted);
            setSearch((prev) => ({ ...prev, ...updated }));
        } finally {
            setBookmarkingSearch(false);
        }
    };

    const patchSearch = (patch) => {
        setSearch((prev) => ({ ...prev, ...patch }));
    };

    const toggleVideoBookmark = async (video) => {
        if (!video?.id || bookmarkingVideoId !== null) return;

        setBookmarkingVideoId(video.id);

        try {
            const response = video.bookmarked
                ? await bookmarks.remove(video.id)
                : await bookmarks.save(video.id);

            setSearch((prev) => ({
                ...prev,
                results: (prev.results ?? []).map((result) => (
                    String(result.id) === String(video.id)
                        ? { ...result, bookmarked: Boolean(response.bookmarked) }
                        : result
                )),
            }));
        } finally {
            setBookmarkingVideoId(null);
        }
    };

    useEffect(() => {
        setSearch(initial);
    }, [initial]);

    useEffect(() => {
        if (!search?.id || !isSearchProcessing) return undefined;

        let cancelled = false;
        let timerId = null;

        const poll = async () => {
            try {
                const payload = await api.get(search.id);

                if (cancelled || !payload?.search) return;

                setPollError(false);
                setSearch((previous) => ({ ...previous, ...payload.search }));
            } catch {
                if (!cancelled) {
                    setPollError(true);
                }
            } finally {
                if (!cancelled) {
                    timerId = window.setTimeout(poll, SEARCH_POLL_MS);
                }
            }
        };

        poll();

        return () => {
            cancelled = true;
            if (timerId !== null) {
                window.clearTimeout(timerId);
            }
        };
    }, [isSearchProcessing, search?.id]);

    return (
        <>
            <Head title={`${search.name} · Brand Beacon`} />

            {/* The tracker carries its own header, so the shell renders content only. */}
            <AppLayout width="max-w-[1240px]">
                <DetailScreenBoundary>
                    <DetailScreen
                        search={search}
                        isAuthenticated={isAuthenticated}
                        billing={billing}
                        refreshing={refreshing}
                        bookmarkUpdating={bookmarkingSearch}
                        onRefresh={refresh}
                        onSearchUpdated={patchSearch}
                        onToggleBookmark={toggleBookmark}
                        onToggleVideoBookmark={toggleVideoBookmark}
                        bookmarkingVideoId={bookmarkingVideoId}
                        onTogglePause={togglePause}
                        onDelete={remove}
                    />
                </DetailScreenBoundary>
            </AppLayout>

            {confirmRefresh && (
                <UsageConfirmModal
                    title="Refresh this search?"
                    body={`This will use 1 search credit. You will have ${searchRemainingAfterUse} search credits remaining after the refresh starts. Search credits are not restored later, even if you pause or delete the search.`}
                    subject={search.name}
                    confirmLabel="Refresh search"
                    busy={refreshing}
                    onCancel={() => setConfirmRefresh(false)}
                    onConfirm={async () => {
                        setConfirmRefresh(false);
                        await runRefresh();
                    }}
                />
            )}

            {(isSearchProcessing || (hasProcessingFailure && pollError)) && (
                <ProcessingOverlay
                    search={search}
                    failed={hasProcessingFailure && pollError}
                    onGoDashboard={() => window.location.assign('/dashboard')}
                />
            )}
        </>
    );
}
