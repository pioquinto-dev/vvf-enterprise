import { router, usePage } from '@inertiajs/react';

import Seo from '../components/Seo.jsx';

import { FAQS } from '../landing/data/dummy.js';
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
  const { pricingPlans = [] } = usePage().props;
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

  const startTrial = (plan, cycle = 'monthly') =>
    window.location.assign(`/login?redirect=trial_checkout&plan=${encodeURIComponent(plan?.slug ?? 'growth')}&trial=1&cycle=${encodeURIComponent(cycle)}`);

  return (
    <>
      <Seo
        title="TikTok Trend Intelligence for Brands | Brand Beacon"
        description="Discover viral TikTok videos, track brand mentions, and spot breakout trends before they peak with Brand Beacon."
        schema={{
          organization: true,
          webSite: true,
          softwareApplication: {
            description: 'Brand Beacon helps teams discover viral TikTok videos, track brand mentions, and identify breakout trends.',
          },
          faqs: FAQS,
        }}
      />

      <div className="bbh">
        <Nav />

        <main>
          <Hero onStart={startSearch} />
          <BrandMarquee />
          <Features />
          <HowItWorks onStart={startSearch} />
          <Testimonials />
          <Pricing plans={pricingPlans} onStart={startSearch} onTrial={startTrial} />
          <Faq />
          <FinalCta onStart={startSearch} />
        </main>

        <Footer />
      </div>
    </>
  );
}
