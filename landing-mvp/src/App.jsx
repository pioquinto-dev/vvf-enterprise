import { useCallback, useEffect, useState } from 'react';

import { useTheme } from './components/useTheme.js';
import { useReveal } from './components/Reveal.jsx';
import SearchShell from './flow/SearchShell.jsx';
import KeywordsScreen from './flow/screens/KeywordsScreen.jsx';
import RunningScreen from './flow/screens/RunningScreen.jsx';
import ResultsScreen from './flow/screens/ResultsScreen.jsx';
import TrialScreen from './flow/screens/TrialScreen.jsx';

import Nav from './sections/Nav.jsx';
import Hero from './sections/Hero.jsx';
import BrandMarquee from './sections/BrandMarquee.jsx';
import Features from './sections/Features.jsx';
import HowItWorks from './sections/HowItWorks.jsx';
import Testimonials from './sections/Testimonials.jsx';
import Pricing from './sections/Pricing.jsx';
import Faq from './sections/Faq.jsx';
import FinalCta from './sections/FinalCta.jsx';
import Footer from './sections/Footer.jsx';

/**
 * The Laravel app gives each search step a real route. This standalone build has
 * no server, so it mirrors that with hash paths and full page swaps — same
 * screens, same chrome, no modal.
 */
const PATHS = {
  landing: '#/',
  keywords: '#/search',
  running: '#/search/running',
  results: '#/search/results',
  trial: '#/trial',
};

const VIEWS = Object.fromEntries(Object.entries(PATHS).map(([view, path]) => [path, view]));

const PILLS = {
  keywords: { text: '1 free search', tone: 'ok' },
  running: { text: 'Search running', tone: 'ok' },
  results: { text: 'Free result', tone: 'accent' },
  trial: { text: 'Trial', tone: 'accent' },
};

export default function App() {
  const { theme, toggle } = useTheme();
  const revealRoot = useReveal();
  const [view, setView] = useState(() => VIEWS[window.location.hash] || 'landing');
  const [search, setSearch] = useState({ type: 'brand', subject: '', keywords: [] });

  const go = useCallback((next, patch) => {
    if (patch) setSearch((prev) => ({ ...prev, ...patch }));
    setView(next);
    window.history.pushState({ view: next }, '', PATHS[next]);
    window.scrollTo({ top: 0 });
  }, []);

  useEffect(() => {
    const onPop = (e) => setView(e.state?.view || VIEWS[window.location.hash] || 'landing');
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const startSearch = (type, subject) => {
    if (!type) {
      document.getElementById('search-subject')?.focus();
      return;
    }
    go('keywords', { type, subject: String(subject || '').trim(), keywords: [] });
  };

  if (view !== 'landing') {
    const shell = {
      pill: PILLS[view],
      step: view,
      onNewSearch: () => go('landing'),
      onExit: () => go('landing'),
    };

    return (
      <SearchShell {...shell}>
        {view === 'keywords' && (
          <KeywordsScreen
            type={search.type}
            subject={search.subject}
            onBack={() => go('landing')}
            onRun={(keywords) => go('running', { keywords })}
          />
        )}

        {view === 'running' && (
          <RunningScreen onBack={() => go('keywords')} onContinue={() => go('results')} />
        )}

        {view === 'results' && (
          <ResultsScreen
            type={search.type}
            subject={search.subject}
            keywords={search.keywords}
            onStartTrial={() => go('trial')}
          />
        )}

        {view === 'trial' && (
          <TrialScreen
            backLabel={search.keywords.length ? 'Back to results' : 'Back to home'}
            onBack={() => go(search.keywords.length ? 'results' : 'landing')}
          />
        )}
      </SearchShell>
    );
  }

  return (
    <div ref={revealRoot} className="vvf-landing min-h-screen font-body">
      <Nav theme={theme} onToggleTheme={toggle} onStart={startSearch} />

      <main>
        <Hero onStart={startSearch} />
        <BrandMarquee />
        <Features />
        <HowItWorks onStart={startSearch} />
        <Testimonials />
        <Pricing onStart={startSearch} onTrial={() => go('trial')} />
        <Faq />
        <FinalCta onStart={startSearch} />
      </main>

      <Footer />
    </div>
  );
}
