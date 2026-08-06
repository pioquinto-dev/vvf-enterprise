import { Head, router } from '@inertiajs/react';

import { useTheme } from '../landing/components/useTheme.js';
import { useReveal } from '../landing/components/Reveal.jsx';

import Nav from '../landing/sections/Nav.jsx';
import Hero from '../landing/sections/Hero.jsx';
import BrandMarquee from '../landing/sections/BrandMarquee.jsx';
import Features from '../landing/sections/Features.jsx';
import HowItWorks from '../landing/sections/HowItWorks.jsx';
import Testimonials from '../landing/sections/Testimonials.jsx';
import Pricing from '../landing/sections/Pricing.jsx';
import Faq from '../landing/sections/Faq.jsx';
import FinalCta from '../landing/sections/FinalCta.jsx';
import Footer from '../landing/sections/Footer.jsx';

export default function Landing() {
    const { theme, toggle } = useTheme();
    const revealRoot = useReveal();

    /**
     * Called with a type + subject from the hero form, and with nothing from the
     * secondary CTAs — those just send the visitor back to the hero input.
     */
    const startSearch = (type, subject) => {
        if (!type) {
            document.getElementById('search-subject')?.focus();
            return;
        }

        router.get('/search', { type, q: String(subject || '').trim() });
    };

    return (
        <>
            <Head title="VVF — TikTok viral intelligence for brands" />

            <div ref={revealRoot} className="vvf-landing min-h-screen font-body">
                <Nav theme={theme} onToggleTheme={toggle} onStart={startSearch} />

                <main>
                    <Hero onStart={startSearch} />
                    <BrandMarquee />
                    <Features />
                    <HowItWorks onStart={startSearch} />
                    <Testimonials />
                    <Pricing onStart={startSearch} onTrial={() => router.visit('/trial')} />
                    <Faq />
                    <FinalCta onStart={startSearch} />
                </main>

                <Footer />
            </div>
        </>
    );
}
