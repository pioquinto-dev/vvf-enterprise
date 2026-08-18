import { Component, useState } from 'react';
import { Head, router } from '@inertiajs/react';

import AppLayout from '../components/AppLayout.jsx';
import DetailScreen from './detail/DetailScreen.jsx';
import { savedSearch as api } from '../../landing/flow/api.js';

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
 * The single detail view for every saved search — brand, competitor, and
 * product all render the same analytics tracker (the one design identity).
 */
export default function Show({ search: initial, isAuthenticated = false, billing }) {
    const [search, setSearch] = useState(initial);
    const [refreshing, setRefreshing] = useState(false);
    const [bookmarkingSearch, setBookmarkingSearch] = useState(false);
    const [confirmRefresh, setConfirmRefresh] = useState(false);

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
        router.visit('/bookmark');
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
        </>
    );
}
