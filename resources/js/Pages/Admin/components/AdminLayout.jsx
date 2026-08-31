import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

import { Logo, Menu, Close, Chevron, Exit } from '../../../landing/components/Icons.jsx';

const NAV_GROUPS = [
    {
        label: null,
        items: [
            {
                key: 'dashboard',
                label: 'Dashboard',
                href: '/x/admin',
                description: 'Growth and usage',
                icon: 'DA',
            },
            {
                key: 'activity',
                label: 'Activity Log',
                href: '/x/admin/activity',
                description: 'User activity',
                icon: 'AL',
            },
        ],
    },
    {
        label: 'Needs Attention',
        items: [
            { key: 'subscription-past-due', label: 'Past Due Subs', href: '/x/admin/subscription?status=past_due', description: 'Payment follow-up', icon: 'PD' },
            { key: 'plans-archived', label: 'Archived Plans', href: '/x/admin/plans?status=archived', description: 'Legacy pricing', icon: 'AP' },
            { key: 'users-deleted', label: 'Deleted Users', href: '/x/admin/users?status=deleted', description: 'Restore review', icon: 'DU' },
            { key: 'videos-archived', label: 'Archived Videos', href: '/x/admin/viral-videos?status=archived', description: 'Content review', icon: 'AV' },
            { key: 'keywords-archived', label: 'Archived Keywords', href: '/x/admin/keyword-index?status=archived', description: 'Suggestion cleanup', icon: 'AK' },
        ],
    },
    {
        label: 'Content',
        items: [
            { key: 'viral-videos', label: 'Viral Videos', href: '/x/admin/viral-videos', description: 'Video library', icon: 'VI' },
            { key: 'searches', label: 'Searches', href: '/x/admin/searches', description: 'Search runs', icon: 'SE' },
            { key: 'keyword-index', label: 'Keyword Index', href: '/x/admin/keyword-index', description: 'Brands and products', icon: 'KI' },
            { key: 'inquiries', label: 'Inquiries', href: '/x/admin/inquiries', description: 'Contact inbox', icon: 'IN' },
            { key: 'plans', label: 'Plans', href: '/x/admin/plans', description: 'Pricing setup', icon: 'PL' },
        ],
    },
    {
        label: 'Subscription Management',
        items: [{ key: 'subscription', label: 'Subscription', href: '/x/admin/subscription', description: 'Billing control', icon: 'SU' }],
    },
    {
        label: 'Coupons',
        items: [
            { key: 'coupon-programs', label: 'Coupon Programs', href: '/x/admin/coupon-programs', description: 'Program config', icon: 'CP' },
            { key: 'coupon-whitelist', label: 'Coupon Whitelist', href: '/x/admin/coupon-whitelist', description: 'Allowed emails', icon: 'CW' },
            { key: 'coupon-usage', label: 'Coupon Usage', href: '/x/admin/coupon-usage', description: 'Redemptions', icon: 'CU' },
        ],
    },
    {
        label: 'User Management',
        items: [
            { key: 'users', label: 'Users', href: '/x/admin/users', description: 'Customer accounts', icon: 'US' },
            { key: 'admin-users', label: 'Admin Users', href: '/x/admin/users/admin-users', description: 'Staff access', icon: 'AD' },
        ],
    },
];

function defaultExpandedState(currentPath, section) {
    return NAV_GROUPS.reduce((state, group) => {
        if (!group.label) {
            return state;
        }

        state[group.label] = group.items.some((item) => section === item.key || currentPath === item.href);

        return state;
    }, {});
}

function NavItem({ item, active, onNavigate }) {
    return (
        <Link
            href={item.href}
            onClick={onNavigate}
            className={`group flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition ${
                active ? 'bg-[var(--wash)] text-[var(--ink)]' : 'text-[var(--muted)] hover:bg-white hover:text-[var(--ink)]'
            }`}
        >
            <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[10px] font-semibold tracking-[.06em] ${
                    active ? 'bg-[var(--yellow)] text-[#1a1400]' : 'bg-[var(--canvas)] text-[var(--faint)]'
                }`}
            >
                {item.icon}
            </span>
            <span className="min-w-0 truncate text-[13px] font-medium">{item.label}</span>
        </Link>
    );
}

function SidebarAccount({ adminUser, onSignOut }) {
    return (
        <div className="mt-4 shrink-0 border-t border-[var(--line)] pt-3">
            <button
                type="button"
                onClick={onSignOut}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[var(--muted)] transition hover:bg-white hover:text-[var(--ink)]"
            >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--canvas)]">
                    <Exit className="h-3.5 w-3.5 text-[var(--warn)]" />
                </span>
                <span className="min-w-0">
                    <span className="block text-[13px] font-medium">Log out</span>
                    <span className="block truncate text-[11px] text-[var(--faint)]">{adminUser?.email ?? 'Admin session'}</span>
                </span>
            </button>
        </div>
    );
}

function Sidebar({ currentPath, section, onNavigate, closable = false, adminUser, onSignOut }) {
    const [expandedGroups, setExpandedGroups] = useState(() => defaultExpandedState(currentPath, section));

    useEffect(() => {
        setExpandedGroups((current) => {
            const next = { ...current };

            NAV_GROUPS.forEach((group) => {
                if (!group.label) {
                    return;
                }

                const hasActiveItem = group.items.some((item) => section === item.key || currentPath === item.href);

                if (hasActiveItem) {
                    next[group.label] = true;
                } else if (!(group.label in next)) {
                    next[group.label] = false;
                }
            });

            return next;
        });
    }, [currentPath, section]);

    const toggleGroup = (label) => {
        setExpandedGroups((current) => ({
            ...current,
            [label]: !current[label],
        }));
    };

    return (
        <div className="flex h-full flex-col">
            <div className="flex items-start justify-between gap-3 px-1">
                <Link href="/x/admin" onClick={onNavigate} className="flex items-center gap-2.5">
                    <Logo className="h-8 w-8" />
                    <span className="leading-none">
                        <span className="block text-[13px] font-bold tracking-[.22em] text-[var(--ink)] uppercase">Admin</span>
                        <span className="mt-0.5 block text-[10px] text-[var(--faint)]">Operations cockpit</span>
                    </span>
                </Link>
                {closable ? (
                    <button
                        type="button"
                        aria-label="Close menu"
                        onClick={onNavigate}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--line)] text-[var(--faint)] transition hover:bg-white hover:text-[var(--ink)]"
                    >
                        <Close className="h-4 w-4" />
                    </button>
                ) : null}
            </div>

            <div className="mt-6 flex min-h-0 flex-1 flex-col">
                <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
                    {NAV_GROUPS.map((group) => (
                        <section key={group.label ?? 'top'} className="space-y-1">
                            {group.label ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => toggleGroup(group.label)}
                                        className="flex w-full items-center justify-between gap-3 px-2 text-left px-2.5 py-1 text-[10px] font-semibold tracking-[.14em] text-[var(--faint)] uppercase transition hover:text-[var(--ink)]"
                                        aria-expanded={expandedGroups[group.label] === true}
                                    >
                                        <span>{group.label}</span>
                                        <Chevron
                                            className={`h-3.5 w-3.5 transition ${expandedGroups[group.label] ? 'rotate-180 text-[var(--muted)]' : 'text-[var(--faint)]'}`}
                                        />
                                    </button>

                                    {expandedGroups[group.label] && (
                                        <div className="space-y-0.5">
                                            {group.items.map((item) => (
                                                <NavItem
                                                    key={item.key}
                                                    item={item}
                                                    active={section === item.key || currentPath === item.href}
                                                    onNavigate={onNavigate}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="space-y-0.5">
                                    {group.items.map((item) => (
                                        <NavItem
                                            key={item.key}
                                            item={item}
                                            active={section === item.key || currentPath === item.href}
                                            onNavigate={onNavigate}
                                        />
                                    ))}
                                </div>
                            )}
                        </section>
                    ))}
                </div>

                <SidebarAccount adminUser={adminUser} onSignOut={onSignOut} />
            </div>
        </div>
    );
}

export default function AdminLayout({ title, section, children, toolbar = null, actions = null, showHeader = true }) {
    const { props, url } = usePage();
    const logout = useForm({});
    const [drawerOpen, setDrawerOpen] = useState(false);
    const adminUser = props.admin?.user ?? props.adminUser ?? null;

    useEffect(() => {
        if (typeof document === 'undefined') {
            return undefined;
        }

        document.documentElement.classList.remove('dark');

        return undefined;
    }, []);

    useEffect(() => {
        if (typeof document === 'undefined') {
            return undefined;
        }

        document.body.style.overflow = drawerOpen ? 'hidden' : '';

        return () => {
            document.body.style.overflow = '';
        };
    }, [drawerOpen]);

    const currentPath = useMemo(() => (url || '').split('?')[0], [url]);

    const signOut = () => {
        setDrawerOpen(false);
        logout.post('/x/admin/logout');
    };

    const breadcrumbGroup = useMemo(
        () =>
            NAV_GROUPS.find((group) => group.items.some((item) => section === item.key || currentPath === item.href))
                ?.label ?? null,
        [currentPath, section],
    );

    return (
        <div className="admin-shell min-h-screen bg-[var(--canvas)] text-[var(--ink)]">
            <Head title={`${title} - Admin - Outlier Vault`} />

            <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,198,41,.22),_transparent_42%)]" />
            </div>

            <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] border-r border-[var(--line)] bg-[var(--paper)] px-3 py-4 backdrop-blur-xl lg:block">
                <Sidebar currentPath={currentPath} section={section} adminUser={adminUser} onSignOut={signOut} />
            </aside>

            <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[rgba(250,249,246,.92)] backdrop-blur-xl lg:hidden">
                <div className="flex items-center justify-between px-4 py-4">
                    <Link href="/x/admin" className="flex items-center gap-3">
                        <Logo className="h-9 w-9" />
                        <span>
                            <span className="block text-[14px] font-bold tracking-[.2em] uppercase">Admin</span>
                            <span className="block text-[10px] text-[var(--faint)]">Operations cockpit</span>
                        </span>
                    </Link>
                    <button
                        type="button"
                        onClick={() => setDrawerOpen((open) => !open)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--line)] bg-white text-[var(--ink)]"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                </div>
            </header>

            {drawerOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <button
                        type="button"
                        aria-label="Close menu"
                        onClick={() => setDrawerOpen(false)}
                        className="absolute inset-0 bg-[rgba(11,11,11,.38)] backdrop-blur-sm"
                    />
                    <div className="absolute top-0 left-0 h-full w-[min(290px,88vw)] border-r border-[var(--line)] bg-[var(--paper)] px-4 py-5">
                        <Sidebar
                            currentPath={currentPath}
                            section={section}
                            onNavigate={() => setDrawerOpen(false)}
                            closable
                            adminUser={adminUser}
                            onSignOut={signOut}
                        />
                    </div>
                </div>
            )}

            <div className="relative lg:pl-[248px]">
                <div className="sticky top-0 z-30 hidden h-11 items-center justify-between border-b border-[var(--line)] bg-[rgba(245,244,240,.88)] px-7 backdrop-blur-xl lg:flex">
                    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[12px] text-[var(--faint)]">
                        <Link href="/x/admin" className="transition hover:text-[var(--ink)]">
                            Admin
                        </Link>
                        {breadcrumbGroup && (
                            <>
                                <span className="text-[var(--line-2)]">/</span>
                                <span>{breadcrumbGroup}</span>
                            </>
                        )}
                        <span className="text-[var(--line-2)]">/</span>
                        <span className="font-medium text-[var(--ink)]">{title}</span>
                    </nav>
                    <span className="flex items-center gap-2 text-[11.5px] text-[var(--faint)]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--yellow)]" />
                        {adminUser?.email ?? 'Admin session'}
                    </span>
                </div>

                <main className="px-4 py-5 sm:px-6 lg:px-7 lg:py-6">
                    <div className="mx-auto max-w-7xl">
                        {showHeader && (
                            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-1 sm:px-0">
                                <h1 className="text-[20px] font-semibold tracking-[-.02em] text-[var(--ink)] sm:text-[22px]">
                                    {title}
                                </h1>
                                {actions}
                            </div>
                        )}

                        {toolbar && <div className="mb-3">{toolbar}</div>}

                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
