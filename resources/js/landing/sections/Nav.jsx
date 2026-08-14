import { useEffect, useState } from 'react';
import { Link } from '@inertiajs/react';

import { Logo, Google } from '../components/Icons.jsx';

export default function Nav() {
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
        <a href="#top" className="brand">
          <Logo className="h-8 w-8" />
          <span>Brand Beacon</span>
        </a>
        <div className="nav__end">
          <Link href="/login" className="nav__signin">
            Sign In
          </Link>
          <a href="/auth/google" className="btn btn--primary" style={{ height: 44, padding: '0 20px' }}>
            <span className="gicon gicon--sm">
              <Google />
            </span>
            Try for Free
          </a>
        </div>
      </div>
    </header>
  );
}
