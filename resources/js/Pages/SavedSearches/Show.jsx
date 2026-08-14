import { useState } from 'react';
import { Head, router } from '@inertiajs/react';

import AppLayout from '../components/AppLayout.jsx';
import DetailScreen from './detail/DetailScreen.jsx';
import { savedSearch as api } from '../../landing/flow/api.js';

/**
 * The single detail view for every saved search — brand, competitor, and
 * product all render the same analytics tracker (the one design identity).
 */
export default function Show({ search: initial, isAuthenticated = false, billing }) {
    const [search, setSearch] = useState(initial);
    const [refreshing, setRefreshing] = useState(false);
    const [bookmarkingSearch, setBookmarkingSearch] = useState(false);

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

    return (
        <>
            <Head title={`${search.name} · Brand Beacon`} />

            {/* The tracker carries its own header, so the shell renders content only. */}
            <AppLayout width="max-w-[1240px]">
                <DetailScreen
                    search={search}
                    isAuthenticated={isAuthenticated}
                    billing={billing}
                    refreshing={refreshing}
                    bookmarkUpdating={bookmarkingSearch}
                    onRefresh={refresh}
                    onToggleBookmark={toggleBookmark}
                    onTogglePause={togglePause}
                    onDelete={remove}
                />
            </AppLayout>
        </>
    );
}
