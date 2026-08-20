import { useEffect, useState } from 'react';
import { Link, router, useForm, usePage } from '@inertiajs/react';

import AppFooter from './AppFooter.jsx';
import { Logo, Menu, Close, Search, Library, Store, Exit, Spark, Arrow, Lock } from '../../landing/components/Icons.jsx';

/* Old AppLayout tones → Brand Beacon pill classes, so pages passing the
   original `pill={{ tone }}` API keep rendering a sensible chip. */
const PILL_CLASS = {
    ok: 'pill--ok',
    accent: 'pill--run',
    run: 'pill--run',
    off: 'pill--off',
    bad: 'pill--bad',
    warn: 'pill--bad',
};

/**
 * Primary sidebar navigation, mirroring the handoff mockup. Hrefs point at
 * routes that exist today; the dedicated Brand/Product search screens land in
 * a later batch and will repoint the last two entries.
 */
const NAV = [
    { label: 'Search', href: '/dashboard', icon: Spark, match: '/dashboard' },
    { label: 'Bookmarks', href: '/bookmarks', icon: Library, match: '/bookmarks' },
    { label: 'Brand searches', href: '/brands', icon: Store, match: '/brands' },
    { label: 'Product searches', href: '/products', icon: Search, match: '/products' },
];

function isActive(currentUrl, item) {
    const path = (currentUrl || '/').split('?')[0];
    if (item.exact) return currentUrl === item.exact;
    return path.startsWith(item.match);
}

function initials(name, email) {
    const source = (name || email || '?').trim();
    return source.slice(0, 1).toUpperCase();
}

/* ------------------------------------------------------------------ */

function Brand({ onNavigate }) {
    return (
        <Link href="/" onClick={onNavigate} className="side__brand">
            <Logo className="h-[30px] w-[30px]" />
            <span>Brand Beacon</span>
        </Link>
    );
}

function NavList({ currentUrl, onNavigate }) {
    return (
        <div className="side__nav">
            {NAV.map((item) => {
                const Icon = item.icon;

                if (item.locked) {
                    return (
                        <div key={item.label} className="nav__i is-lock" title="Locked for now">
                            <Icon />
                            {item.label}
                            <span className="lk">
                                <Lock className="h-[13px] w-[13px]" />
                            </span>
                        </div>
                    );
                }

                return (
                    <Link
                        key={item.label}
                        href={item.href}
                        onClick={onNavigate}
                        className={`nav__i${isActive(currentUrl, item) ? ' is-on' : ''}`}
                    >
                        <Icon />
                        {item.label}
                    </Link>
                );
            })}
        </div>
    );
}

function AffiliateCard() {
    return (
        <div className="aff" title="Affiliate program coming soon">
            <b>
                <Spark className="h-3.5 w-3.5" />
                Be an affiliate
            </b>
            <span>Soon</span>
        </div>
    );
}

function AccountBlock({ signedIn, name, email, onSignOut, signingOut, onNavigate }) {
    if (!signedIn) {
        return (
            <div className="acct" style={{ flexDirection: 'column' }}>
                <Link href="/login" onClick={onNavigate} className="btn btn--g btn--w">
                    Log in
                </Link>
                <Link href="/register" onClick={onNavigate} className="btn btn--y btn--w">
                    Sign up <Arrow />
                </Link>
            </div>
        );
    }

    return (
        <div className="acct">
            <Link href="/settings/account" onClick={onNavigate} className="acct__l">
                <span className="avat">{initials(name, email)}</span>
                <span style={{ minWidth: 0, display: 'block', overflow: 'hidden' }}>
                    <span className="acct__n">{name || 'Account'}</span>
                    {email && <span className="acct__e">{email}</span>}
                </span>
            </Link>
            <button className="acct__x" title="Sign out" aria-label="Sign out" onClick={onSignOut} disabled={signingOut}>
                <Exit className="h-4 w-4" />
            </button>
        </div>
    );
}

/* ------------------------------------------------------------------ */

/**
 * Brand Beacon app shell: a fixed 252px sidebar on desktop, a top bar + slide
 * drawer on small screens, and a shared footer under the content.
 *
 * Props are unchanged from the previous shell so every screen keeps working:
 *   pill     — { text, tone } status chip shown beside the title
 *   step     — accepted for backwards-compat; the wizard now draws its own
 *              stepper inside its card, so this is a no-op here
 *   title    — page heading
 *   subtitle — one line of context under the title
 *   actions  — right side of the header row (entitlements bar or buttons)
 *   toolbar  — full-width row under the header (search / filters / sort)
 *   width    — Tailwind max-width class for the content column
 */
export default function AppLayout({ pill, step, title, subtitle, actions, toolbar, width = 'max-w-6xl', children }) {
    const { props, url: currentUrl } = usePage();
    const { auth = {} } = props;
    const logout = useForm({});
    const [drawerOpen, setDrawerOpen] = useState(false);

    const signedIn = auth.signedIn ?? Boolean(auth.user);
    const impersonation = auth.impersonation;

    const signOut = () => {
        setDrawerOpen(false);
        logout.post('/logout');
    };

    const closeDrawer = () => setDrawerOpen(false);

    /* Lock body scroll while the mobile drawer is open. */
    useEffect(() => {
        if (typeof document === 'undefined') return undefined;
        document.body.style.overflow = drawerOpen ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [drawerOpen]);

    const account = (
        <AccountBlock
            signedIn={signedIn}
            name={auth.user?.name}
            email={auth.user?.email}
            onSignOut={signOut}
            signingOut={logout.processing}
        />
    );

    const header = (title || pill || actions || subtitle) && (
        <div className="top">
            <div>
                <h1>
                    {title}
                    {pill && <span className={`pill ${PILL_CLASS[pill.tone] ?? PILL_CLASS.accent}`}><i />{pill.text}</span>}
                </h1>
                {subtitle && <p>{subtitle}</p>}
            </div>
            {actions && <div className="top__actions">{actions}</div>}
        </div>
    );

    return (
        <div className="bb">
            {/* mobile top bar */}
            <header className="bb-top">
                <Brand />
                <button
                    className="bb-burger"
                    aria-label="Open menu"
                    aria-expanded={drawerOpen}
                    onClick={() => setDrawerOpen(true)}
                >
                    <Menu />
                </button>
            </header>

            {/* mobile drawer */}
            <div className={`bb-drawer${drawerOpen ? ' is-open' : ''}`}>
                <button className="bb-drawer__bg" aria-label="Close menu" onClick={closeDrawer} />
                <div className="bb-drawer__panel">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Brand onNavigate={closeDrawer} />
                        <button className="bb-burger" aria-label="Close menu" onClick={closeDrawer}>
                            <Close />
                        </button>
                    </div>
                    <NavList currentUrl={currentUrl} onNavigate={closeDrawer} />
                    <div className="side__sp" />
                    <AffiliateCard />
                    <AccountBlock
                        signedIn={signedIn}
                        name={auth.user?.name}
                        email={auth.user?.email}
                        onSignOut={signOut}
                        signingOut={logout.processing}
                        onNavigate={closeDrawer}
                    />
                </div>
            </div>

            <div className="app">
                {/* desktop sidebar */}
                <aside className="side">
                    <Brand />
                    <NavList currentUrl={currentUrl} />
                    <div className="side__sp" />
                    <AffiliateCard />
                    {account}
                </aside>

                <main className="main">
                    <div className="bb-content">
                        <div className={`mx-auto w-full ${width}`}>
                            {impersonation && (
                                <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--yellow)] bg-[var(--wash)] px-4 py-3 text-[12.5px] text-[var(--amber-ink)]">
                                    <span>
                                        You are logged in as {auth.user?.email}. This admin session ends at{' '}
                                        {new Date(impersonation.expires_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}.
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => router.post('/x/admin/impersonation/stop')}
                                        className="rounded-md border border-[var(--yellow)] bg-white px-3 py-1.5 text-[12px] font-semibold text-[var(--amber-ink)] transition hover:bg-[var(--yellow)] hover:text-[#1a1400]"
                                    >
                                        Return to admin
                                    </button>
                                </div>
                            )}
                            {header}
                            {toolbar && <div>{toolbar}</div>}
                            {children}
                        </div>
                    </div>
                    <AppFooter width={width} />
                </main>
            </div>
        </div>
    );
}
