import { router } from '@inertiajs/react';

import ContactFormCard from '../components/ContactFormCard.jsx';
import Seo from '../components/Seo.jsx';
import { useTheme } from '../landing/components/useTheme.js';
import { useReveal } from '../landing/components/Reveal.jsx';
import Nav from '../landing/sections/Nav.jsx';
import Footer from '../landing/sections/Footer.jsx';

export default function LandingContact({ categories = [], defaults = {} }) {
    const { theme, toggle } = useTheme();
    const revealRoot = useReveal();

    const startSearch = (type, subject) => {
        const phrase = String(subject || '').trim();

        if (!type || phrase === '') {
            window.location.assign('/#search-subject');
            return;
        }

        router.get('/search', { type, q: phrase });
    };

    return (
        <>
            <Seo
                title="Contact Brand Beacon | TikTok Trend Intelligence"
                description="Contact the Brand Beacon team for product, account, billing, or partnership support."
            />

            <div ref={revealRoot} className="vvf-landing min-h-screen font-body">
                {/* Nav styles live under the landing (.bbh) design scope. */}
                <div className="bbh">
                    <Nav theme={theme} onToggleTheme={toggle} onStart={startSearch} />
                </div>

                <main className="relative overflow-hidden px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
                    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
                        <div className="bg-grid mask-radial-fade absolute inset-0" />
                        <div className="absolute top-[-8%] left-1/2 h-[340px] w-[760px] max-w-[140vw] -translate-x-1/2 rounded-full bg-accent/12 blur-[140px] dark:bg-accent/18" />
                    </div>

                    <div className="relative mx-auto max-w-5xl">
                        <ContactFormCard categories={categories} defaults={defaults} />
                    </div>
                </main>

                {/* Footer styles live under the landing (.bbh) design scope. */}
                <div className="bbh">
                    <Footer />
                </div>
            </div>
        </>
    );
}
