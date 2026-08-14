import { Head, router } from '@inertiajs/react';

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
  /**
   * Called with a type + subject from the hero form. The secondary CTAs call it
   * with nothing, which just sends the visitor back to the hero input.
   */
  const startSearch = (type, subject) => {
    const phrase = String(subject || '').trim();
    if (!type || phrase === '') {
      document.getElementById('search-subject')?.focus();
      return;
    }
    router.get('/search', { type, q: phrase });
  };

  const startTrial = (plan) =>
    window.location.assign(`/login?redirect=trial_checkout&plan=${encodeURIComponent(plan?.slug ?? 'basic')}&trial=1`);

  return (
    <>
      <Head title="Brand Beacon — TikTok viral intelligence for brands" />

      <div className="bbh">
        <Nav />

        <main>
          <Hero onStart={startSearch} />
          <BrandMarquee />
          <Features />
          <HowItWorks onStart={startSearch} />
          <Testimonials />
          <Pricing onStart={startSearch} onTrial={startTrial} />
          <Faq />
          <FinalCta onStart={startSearch} />
        </main>

        <Footer />
      </div>
    </>
  );
}
