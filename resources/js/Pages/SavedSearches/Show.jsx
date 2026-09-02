import { Component, useEffect, useRef, useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';

import AppLayout from '../components/AppLayout.jsx';
import DetailScreen from './detail/DetailScreen.jsx';
import { bookmarks, savedSearch as api, untrackSearch } from '../../landing/flow/api.js';

const ACTIVE_SEARCH_STATUSES = new Set(['pending', 'queued', 'running', 'scraping']);
const SEARCH_POLL_MS = 8000;

const SparkIcon = (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" width="14" height="14">
        <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z" />
    </svg>
);
const ArrowIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" width="14" height="14">
        <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
);

/**
 * Loading header that sits on top of the analytics page while a report is
 * still building. Once the run finishes it collapses to a slim
 * "Report complete" line for a moment before the caller drops it entirely.
 * Ported from the free-search-flow mockup's pending head.
 */
function BuildingHeader({ search, done = false }) {
    const subject = search?.name || search?.phrase || 'your search';
    const scanned = Number(search?.scanned_count ?? 0);

    return (
        <div className={`bb-pend${done ? ' is-done' : ''}`}>
            <div className="bb-pend__body">
                <div className="bb-pend__t">
                    <h2>Building your report for “{subject}”</h2>
                    <span className="pill pill--run bb-pend__pill">
                        <span className="bb-pend__spin" aria-hidden="true" />
                        Scanning TikTok
                    </span>
                    <span className="bb-pend__eta">usually ready within 20 minutes</span>
                </div>
                <div className="bb-pend__cta">
                    <a href="/dashboard" className="btn btn--y btn--sm">
                        {SparkIcon} Browse the search dashboard {ArrowIcon}
                    </a>
                    <p>
                        No need to wait here — we’ll email you the moment the full ranking is in.
                        Early results fill in below as they land.
                    </p>
                </div>
            </div>
            <div className="bb-pend__slim">
                <span className="pill pill--ok"><i />Report complete</span>
                <span>
                    {scanned > 0 ? <><b>{scanned.toLocaleString()}</b> videos scanned · </> : null}
                    your ranking is ready.
                </span>
            </div>
        </div>
    );
}

function BuildingPopup({ subject, onDashboard, onClose }) {
    return (
        <div className="bb">
            <div className="bb-modal">
                <button className="bb-modal__bg" aria-label="Close" onClick={onClose} />
                <div className="bb-modal__box bb-buildpop" role="dialog" aria-modal="true" aria-labelledby="bb-buildpop-title">
                    <span className="bb-buildpop__i" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
                        </svg>
                    </span>
                    <h2 id="bb-buildpop-title">Your report is still building</h2>
                    <p className="sub">
                        We’re scanning TikTok for <b>{subject}</b> and filling this page in as results land.
                        Check back in a few minutes — or browse the search dashboard while you wait.
                        We’ll email you the moment it’s complete.
                    </p>
                    <div className="bb-buildpop__actions">
                        <button type="button" className="btn btn--y btn--w" onClick={onDashboard}>
                            Browse the search dashboard
                        </button>
                        <button type="button" className="btn btn--g btn--w" onClick={onClose}>
                            Stay on this page
                        </button>
                    </div>
                    <p className="bb-buildpop__fine">Early results are already visible below.</p>
                </div>
            </div>
        </div>
    );
}

const buildingCss = `
.bb-pend{border:1px solid var(--line);border-radius:var(--r-xl);background:var(--white);padding:22px 24px;margin-bottom:22px;box-shadow:0 1px 2px rgba(20,15,0,.04)}
.bb-pend__t{display:flex;align-items:center;gap:11px;flex-wrap:wrap}
.bb-pend__t h2{font-size:1.06rem;margin:0;letter-spacing:-.01em}
.bb-pend__pill{display:inline-flex;align-items:center;gap:7px}
.bb-pend__spin{width:11px;height:11px;border-radius:50%;border:2px solid currentColor;border-top-color:transparent;animation:bb-pend-spin .8s linear infinite;flex:none;opacity:.85}
@keyframes bb-pend-spin{to{transform:rotate(360deg)}}
.bb-pend__eta{margin-left:auto;font-size:.8rem;color:var(--faint);opacity:.7;font-variant-numeric:tabular-nums}
.bb-pend__cta{display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-top:16px;padding-top:16px;border-top:1px solid var(--line)}
.bb-pend__cta .btn{display:inline-flex;align-items:center;gap:7px;white-space:nowrap}
.bb-pend__cta p{margin:0;font-size:.84rem;color:var(--faint);opacity:.85;max-width:44ch;line-height:1.5}
.bb-pend.is-done{padding:12px 20px;display:flex;align-items:center;gap:11px;flex-wrap:wrap;background:var(--ok-bg);border-color:#cde7d9;box-shadow:none;animation:bb-pend-fold .3s var(--ease)}
@keyframes bb-pend-fold{from{opacity:.4;transform:translateY(-4px)}to{opacity:1;transform:none}}
.bb-pend.is-done .bb-pend__body{display:none}
.bb-pend__slim{display:none;align-items:center;gap:11px;flex-wrap:wrap;font-size:.85rem;color:var(--muted)}
.bb-pend.is-done .bb-pend__slim{display:flex}
.bb-pend__slim b{color:var(--ink);font-weight:700}
.bb-partial{display:flex;align-items:center;gap:10px;padding:11px 15px;border:1px dashed var(--line-2);border-radius:var(--r);background:var(--paper);font-size:.83rem;color:var(--muted);margin-bottom:18px}
.bb-partial svg{width:15px;height:15px;color:var(--amber-ink);flex:none}
.bb-buildpop{max-width:420px;text-align:center}
.bb-buildpop__i{width:52px;height:52px;margin:0 auto 16px;border-radius:50%;background:var(--wash);display:grid;place-items:center;color:var(--amber-ink);position:relative}
.bb-buildpop__i::after{content:'';position:absolute;inset:-5px;border-radius:50%;border:2px solid var(--yellow);border-top-color:transparent;animation:bb-pend-spin 1.1s linear infinite}
.bb-buildpop__i svg{width:22px;height:22px}
.bb-buildpop .sub{margin:9px 0 0}
.bb-buildpop__actions{display:flex;flex-direction:column;gap:9px;margin-top:20px}
.bb-buildpop__fine{font-size:.78rem;color:var(--faint);opacity:.7;margin-top:12px}
`;

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
    const page = usePage();
    const freeSearchNew = Boolean(page?.props?.flash?.freeSearchNew);

    const [search, setSearch] = useState(initial);
    const [refreshing, setRefreshing] = useState(false);
    const [bookmarkingSearch, setBookmarkingSearch] = useState(false);
    const [bookmarkingVideoId, setBookmarkingVideoId] = useState(null);
    const [confirmRefresh, setConfirmRefresh] = useState(false);
    const [pollError, setPollError] = useState(false);
    const [buildingPopupOpen, setBuildingPopupOpen] = useState(false);
    const [justCompleted, setJustCompleted] = useState(false);

    const isSearchProcessing = ACTIVE_SEARCH_STATUSES.has(String(search?.status ?? '').toLowerCase());
    const hasProcessingFailure = String(search?.status ?? '').toLowerCase() === 'failed';
    const wasProcessingRef = useRef(isSearchProcessing);
    const subjectLabel = search?.name || search?.phrase || 'your search';

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

    // Greet a fresh free-search arrival with the "still building" popup once,
    // just after the page settles. Only fires when the report is genuinely
    // still processing so a fast run that already finished skips it.
    useEffect(() => {
        if (!freeSearchNew || !isSearchProcessing) return undefined;

        const timer = window.setTimeout(() => setBuildingPopupOpen(true), 500);

        return () => window.clearTimeout(timer);
        // Mount-only: read the initial flash/status, ignore later polls.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // When polling flips the run from processing → done, briefly hold the
    // collapsed "Report complete" line before the header drops away.
    useEffect(() => {
        if (wasProcessingRef.current && !isSearchProcessing && !hasProcessingFailure) {
            setJustCompleted(true);
            setBuildingPopupOpen(false);
            const timer = window.setTimeout(() => setJustCompleted(false), 6000);
            wasProcessingRef.current = isSearchProcessing;

            return () => window.clearTimeout(timer);
        }

        wasProcessingRef.current = isSearchProcessing;

        return undefined;
    }, [isSearchProcessing, hasProcessingFailure]);

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
                {(isSearchProcessing || justCompleted) && (
                    <>
                        <style>{buildingCss}</style>
                        <BuildingHeader search={search} done={!isSearchProcessing && justCompleted} />
                        {isSearchProcessing && (
                            <div className="bb-partial">
                                {SparkIcon}
                                <span>Early results — ranking and outlier scores keep updating until the scan finishes.</span>
                            </div>
                        )}
                    </>
                )}
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

            {buildingPopupOpen && (
                <>
                    <style>{buildingCss}</style>
                    <BuildingPopup
                        subject={subjectLabel}
                        onDashboard={() => window.location.assign('/dashboard')}
                        onClose={() => setBuildingPopupOpen(false)}
                    />
                </>
            )}

            {/* A failed run still blocks with the recovery overlay; the building
                state now shows inline via BuildingHeader instead. */}
            {hasProcessingFailure && pollError && (
                <ProcessingOverlay
                    search={search}
                    failed
                    onGoDashboard={() => window.location.assign('/dashboard')}
                />
            )}
        </>
    );
}
