import { useEffect, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';

import { Logo, Google } from '../components/Icons.jsx';

export default function Nav({ homeHref = '#top' }) {
  const { auth } = usePage().props;
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`nav${stuck ? ' is-stuck' : ''}`} id="nav">
      <div className="wrap nav__in">
        <a href={homeHref} className="brand" aria-label="Brand Beacon home">
          <Logo className="h-8 w-8" />
          <span>Brand Beacon</span>
        </a>
        <div className="nav__end">
          <Link href={auth?.signedIn ? '/home' : '/login'} className="nav__signin">
            {auth?.signedIn ? 'Dashboard' : 'Sign In'}
          </Link>
          <a href={auth?.signedIn ? '/settings/subscription' : '/auth/google'} className="btn btn--primary" style={{ height: 44, padding: '0 20px' }}>
            <span className="gicon gicon--sm">
              <Google />
            </span>
            {auth?.signedIn ? 'My Plan' : 'Try for Free'}
          </a>
        </div>
      </div>
    </header>
  );
}
