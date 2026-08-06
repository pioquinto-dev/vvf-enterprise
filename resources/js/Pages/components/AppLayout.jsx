import { useEffect, useState } from 'react';
import { Link, router, useForm, usePage } from '@inertiajs/react';

import AppFooter from './AppFooter.jsx';
import ThemeToggle from '../../landing/components/ThemeToggle.jsx';
import { useTheme } from '../../landing/components/useTheme.js';
import {
    Logo,
    Menu,
    Close,
    Search,
    Library,
    Store,
    Target,
    User,
    Exit,
    Spark,
    Arrow,
    Lock,
} from '../../landing/components/Icons.jsx';

const TONES = {
    ok: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    accent: 'border-accent/25 bg-accent/10 text-accent dark:text-accent-glow',
};

const STEP_ORDER = ['keywords', 'running', 'results'];

/**
 * Primary sidebar navigation. Every entry points at a route that exists —
 * "Brand searches" and "Competitor searches" seed the search flow with the
 * matching `type`, which `routes/public.php` already accepts.
 */
const NAV = [
    { label: 'Watchlist', href: '/saved-searches', icon: Library, match: '/saved-searches', exact: '/saved-searches' },
    { label: 'Brand searches', href: '/saved-searches?type=brand', icon: Store, match: '/saved-searches', exact: '/saved-searches?type=brand' },
    { label: 'Competitor searches', href: '/saved-searches?type=competitor', icon: Target, match: '/saved-searches', exact: '/saved-searches?type=competitor' },
    { label: 'Product searches', href: '/saved-searches?type=product', icon: Search, match: '/saved-searches', exact: '/saved-searches?type=product', locked: true },
];

/* Mobile bottom bar — three destinations, mirroring the wireframe. */
const TABS = [
    { label: 'Watchlist', href: '/saved-searches', icon: Library, match: '/saved-searches' },
    { label: 'Search', href: '/search', icon: Search, match: '/search' },
    { label: 'Account', href: '/settings/account', icon: User, match: '/settings' },
];

function isActive(currentUrl, match) {
    const path = (currentUrl || '/').split('?')[0];
    return match === '/' ? path === '/' : path.startsWith(match);
}

/* ------------------------------------------------------------------ */

function SidebarSearch({ onSubmitted }) {
    const [phrase, setPhrase] = useState('');

    const submit = (event) => {
        event.preventDefault();
        const q = phrase.trim();
        if (!q) return;

        onSubmitted?.();
        router.visit(`/search?type=brand&q=${encodeURIComponent(q)}`);
    };

    return (
        <form onSubmit={submit} className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 faint" />
            <input
                value={phrase}
                onChange={(event) => setPhrase(event.target.value)}
                placeholder="Search a brand or topic"
                aria-label="Search a brand or topic"
                className="field h-11 pl-9 text-[13.5px]"
            />
        </form>
    );
}

function AffiliateCard() {
    return (
        <div
            title="Affiliate program coming soon"
            className="flex items-center justify-between gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/[.08] px-3 py-2.5"
        >
            <span className="flex items-center gap-2 text-[13px] font-semibold text-emerald-700 dark:text-emerald-400">
                <Spark className="h-3.5 w-3.5" />
                Be an affiliate
            </span>
            <span className="rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold tracking-[.08em] text-emerald-700 uppercase dark:text-emerald-400">
                Soon
            </span>
        </div>
    );
}

function NavList({ currentUrl, onNavigate, className = '' }) {
    return (
        <nav className={`space-y-1 ${className}`.trim()}>
            {NAV.map((item) => {
                const Icon = item.icon;
                const active = item.exact ? currentUrl === item.exact : isActive(currentUrl, item.match);

                if (item.locked) {
                    return (
                        <div
                            key={item.label}
                            aria-disabled="true"
                            title="Locked for now"
                            className="flex cursor-not-allowed items-center justify-between gap-2.5 rounded-xl px-3 py-2.5 text-[13.5px] font-semibold text-ink/40 dark:text-white/35"
                        >
                            <span className="flex items-center gap-2.5">
                                <Icon className="h-4 w-4 shrink-0" />
                                {item.label}
                            </span>
                            <Lock className="h-3.5 w-3.5 shrink-0" />
                        </div>
                    );
                }

                return (
                    <Link
                        key={item.label}
                        href={item.href}
                        onClick={onNavigate}
                        className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13.5px] font-semibold transition ${
                            active
                                ? 'bg-accent/10 text-accent dark:bg-accent/15 dark:text-accent-glow'
                                : 'muted hover:bg-black/[.04] hover:text-ink dark:hover:bg-white/[.06] dark:hover:text-white'
                        }`}
                    >
                        <Icon className="h-4 w-4 shrink-0" />
                        {item.label}
                    </Link>
                );
            })}
        </nav>
    );
}

/**
 * Account block pinned to the bottom of the sidebar and the mobile drawer.
 * Signed-out visitors get log in / sign up in the same slot.
 */
function AccountBlock({ signedIn, email, onSignOut, signingOut, onNavigate }) {
    if (!signedIn) {
        return (
            <div className="space-y-2">
                <Link href="/login" onClick={onNavigate} className="btn-ghost h-10 w-full justify-center text-[13px]">
                    Log in
                </Link>
                <Link href="/register" onClick={onNavigate} className="btn-accent h-10 w-full justify-center text-[13px]">
                    Sign up <Arrow />
                </Link>
            </div>
        );
    }

    return (
        <div className="flex items-stretch gap-2">
            <Link
                href="/settings/account"
                onClick={onNavigate}
                className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl border border-black/[.07] bg-black/[.02] px-3 py-2.5 transition hover:border-accent/30 dark:border-white/[.09] dark:bg-white/[.04]"
            >
                <User className="h-4 w-4 shrink-0 faint" />
                <span className="min-w-0">
                    <span className="block text-[13px] font-semibold">Account</span>
                    {email && <span className="block truncate text-[11px] faint">{email}</span>}
                </span>
            </Link>

            <button
                onClick={onSignOut}
                disabled={signingOut}
                title="Log out"
                aria-label="Log out"
                className="flex w-11 shrink-0 items-center justify-center rounded-xl border border-black/[.07] transition hover:border-hot/40 hover:text-hot disabled:opacity-40 dark:border-white/[.09]"
            >
                <Exit className="h-4 w-4" />
            </button>
        </div>
    );
}

/* ------------------------------------------------------------------ */

/**
 * The app shell: a persistent sidebar on desktop, a top bar plus slide-in
 * drawer and bottom tab bar on mobile, and a shared footer under the content.
 *
 * Props mirror the old SearchShell so flow screens drop in unchanged:
 *   pill     — small status chip shown next to the title
 *   step     — 'keywords' | 'running' | 'results', draws the progress rail
 *   width    — optional max-width for the content column
 *   actions  — right side of the title row. Keep this to one or two buttons;
 *              anything denser belongs in `toolbar` or it wraps into a column.
 *   subtitle — one line of context under the title
 *   toolbar  — full-width row under the header for search, filters, and sort
 */
export default function AppLayout({
    pill,
    step,
    title,
    subtitle,
    actions,
    toolbar,
    width = 'max-w-6xl',
    children,
}) {
    const { props, url: currentUrl } = usePage();
    const { auth = {} } = props;
    const { theme, toggle } = useTheme();
    const logout = useForm({});
    const [drawerOpen, setDrawerOpen] = useState(false);

    const signedIn = auth.signedIn ?? Boolean(auth.user);
    const stepIndex = STEP_ORDER.indexOf(step);

    const signOut = () => {
        setDrawerOpen(false);
        logout.post('/logout');
    };

    /* Lock body scroll while the mobile drawer is open. */
    useEffect(() => {
        if (typeof document === 'undefined') return undefined;
        document.body.style.overflow = drawerOpen ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [drawerOpen]);

    const closeDrawer = () => setDrawerOpen(false);

    const brand = (
        <Link href="/" onClick={closeDrawer} className="flex items-center gap-2.5">
            <Logo className="h-8 w-8" />
            <span className="leading-none">
                <span className="block font-display text-[19px] font-bold tracking-[-.03em]">vvf</span>
                <span className="mt-1 block text-[9px] font-semibold tracking-[.16em] faint uppercase">
                    Find viral videos daily
                </span>
            </span>
        </Link>
    );

    return (
        <div className="vvf-landing relative isolate min-h-screen font-body">
            <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
                <div className="bg-grid mask-radial-fade absolute inset-0" />
                <div className="absolute top-[-20%] left-1/2 h-[420px] w-[760px] max-w-[140vw] -translate-x-1/2 rounded-full bg-accent/15 blur-[140px] dark:bg-accent/20" />
            </div>

            {/* ---------- desktop sidebar ---------- */}
            <aside className="fixed inset-y-0 left-0 z-40 hidden w-[268px] flex-col border-r border-black/[.06] bg-canvas/80 px-4 py-5 backdrop-blur-xl lg:flex dark:border-white/[.08] dark:bg-canvas-dark/80">
                <div className="px-1">{brand}</div>

                <div className="mt-6">
                    <SidebarSearch />
                </div>

                <NavList currentUrl={currentUrl} className="mt-5" />

                <div className="flex-1" />

                <div className="space-y-3 border-t border-black/[.06] pt-4 dark:border-white/[.08]">
                    <AffiliateCard />
                    <AccountBlock
                        signedIn={signedIn}
                        email={auth.user?.email}
                        onSignOut={signOut}
                        signingOut={logout.processing}
                    />
                    <div className="flex items-center justify-between px-1">
                        <span className="text-[11.5px] faint">Appearance</span>
                        <ThemeToggle theme={theme} onToggle={toggle} />
                    </div>
                </div>
            </aside>

            {/* ---------- mobile top bar ---------- */}
            <header className="sticky top-0 z-40 border-b border-black/[.06] bg-canvas/80 backdrop-blur-xl lg:hidden dark:border-white/[.08] dark:bg-canvas-dark/80">
                <div className="flex h-[62px] items-center justify-between px-4">
                    {brand}
                    <button
                        onClick={() => setDrawerOpen((open) => !open)}
                        aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={drawerOpen}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-black/[.09] transition hover:border-accent/40 dark:border-white/[.12]"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                </div>

                {stepIndex >= 0 && (
                    <div className="h-[2px] w-full bg-black/[.05] dark:bg-white/[.06]">
                        <div
                            className="h-full bg-linear-to-r from-accent-glow to-accent transition-all duration-700 ease-out"
                            style={{ width: `${((stepIndex + 1) / STEP_ORDER.length) * 100}%` }}
                        />
                    </div>
                )}
            </header>

            {/* ---------- mobile drawer ---------- */}
            {drawerOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <button
                        aria-label="Close menu"
                        onClick={closeDrawer}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />

                    <div className="animate-fade-up absolute top-0 right-0 flex h-full w-[85%] max-w-[320px] flex-col border-l border-black/[.06] bg-canvas px-4 py-5 dark:border-white/[.08] dark:bg-canvas-dark">
                        <div className="flex items-center justify-between">
                            <span className="font-display text-[15px] font-bold">Menu</span>
                            <button
                                onClick={closeDrawer}
                                aria-label="Close menu"
                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-black/[.09] dark:border-white/[.12]"
                            >
                                <Close className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="mt-5">
                            <SidebarSearch onSubmitted={closeDrawer} />
                        </div>

                        <NavList currentUrl={currentUrl} onNavigate={closeDrawer} className="mt-4" />

                        <div className="flex-1" />

                        <div className="space-y-3 border-t border-black/[.06] pt-4 dark:border-white/[.08]">
                            <AffiliateCard />
                            <div className="flex items-center justify-between px-1">
                                <span className="text-[12px] faint">Appearance</span>
                                <ThemeToggle theme={theme} onToggle={toggle} />
                            </div>
                            <AccountBlock
                                signedIn={signedIn}
                                email={auth.user?.email}
                                onSignOut={signOut}
                                signingOut={logout.processing}
                                onNavigate={closeDrawer}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* ---------- content column ---------- */}
            <div className="flex min-h-screen flex-col lg:pl-[268px]">
                {stepIndex >= 0 && (
                    <div className="hidden h-[2px] w-full bg-black/[.05] lg:block dark:bg-white/[.06]">
                        <div
                            className="h-full bg-linear-to-r from-accent-glow to-accent transition-all duration-700 ease-out"
                            style={{ width: `${((stepIndex + 1) / STEP_ORDER.length) * 100}%` }}
                        />
                    </div>
                )}

                <main className="flex-1 px-4 pt-6 pb-28 sm:px-6 lg:px-8 lg:pt-8 lg:pb-10">
                    <div className={`mx-auto w-full ${width}`}>
                        {(title || pill || actions || subtitle) && (
                            <div className="mb-5">
                                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
                                    <div className="flex items-center gap-2.5">
                                        {title && (
                                            <h1 className="font-display text-[22px] font-bold tracking-[-.025em] sm:text-[26px]">
                                                {title}
                                            </h1>
                                        )}
                                        {pill && (
                                            <span
                                                className={`rounded-full border px-2.5 py-1 text-[11.5px] font-semibold ${TONES[pill.tone] ?? TONES.accent}`}
                                            >
                                                {pill.text}
                                            </span>
                                        )}
                                    </div>
                                    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
                                </div>

                                {subtitle && <p className="mt-2 max-w-2xl text-[13.5px] muted">{subtitle}</p>}
                            </div>
                        )}

                        {toolbar && <div className="mb-6">{toolbar}</div>}

                        {children}
                    </div>
                </main>

                <AppFooter className="hidden lg:block" />
            </div>

            {/* ---------- mobile bottom tabs ---------- */}
            <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-black/[.06] bg-canvas/90 backdrop-blur-xl lg:hidden dark:border-white/[.08] dark:bg-canvas-dark/90">
                <div className="grid grid-cols-3">
                    {TABS.map((tab) => {
                        const Icon = tab.icon;
                        const active = isActive(currentUrl, tab.match);

                        return (
                            <Link
                                key={tab.label}
                                href={tab.href}
                                className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold transition ${
                                    active ? 'text-accent dark:text-accent-glow' : 'faint'
                                }`}
                            >
                                <Icon className="h-[18px] w-[18px]" />
                                {tab.label}
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}
