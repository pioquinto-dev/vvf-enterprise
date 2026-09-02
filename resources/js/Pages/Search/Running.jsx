import { router } from '@inertiajs/react';

import Seo from '../../components/Seo.jsx';
import RunningScreen from '../../landing/flow/screens/RunningScreen.jsx';
import Nav from '../../landing/sections/Nav.jsx';

export default function Running({ searchId }) {
    return (
        <>
            <Seo title="Search Running | Brand Beacon" description="Your Brand Beacon search is being prepared." noIndex />

            <div className="bbh">
                <Nav homeHref="/" />
                <main className="bb" style={{ minHeight: 'calc(100vh - 72px)', padding: '48px 20px', background: 'var(--paper)' }}>
                    <div style={{ maxWidth: 760, margin: '0 auto' }}>
                        <RunningScreen
                            searchId={searchId}
                            onBack={() => router.visit('/search')}
                            onDone={() => router.visit(`/results/${searchId}`)}
                            onAutoReturn={() => router.visit('/dashboard')}
                        />
                    </div>
                </main>
            </div>
        </>
    );
}
