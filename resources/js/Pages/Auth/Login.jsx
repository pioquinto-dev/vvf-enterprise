import { Head, Link, useForm, usePage } from '@inertiajs/react';

import { Logo, Google, Arrow } from '../../landing/components/Icons.jsx';

export default function Login() {
  const { flash = {} } = usePage().props;
  const form = useForm({ email: '', password: '', remember: true });

  const submit = (event) => {
    event.preventDefault();
    form.post('/login');
  };

  return (
    <>
      <Head title="Sign in · Brand Beacon" />

      <div className="bb">
        <div className="auth">
          <div className="auth__c">
            <Link href="/" className="auth__k">
              <Logo className="h-[34px] w-[34px]" />
              <span>Brand Beacon</span>
            </Link>

            <div className="card">
              <form className="card__p" onSubmit={submit}>
                <h2 style={{ textAlign: 'center' }}>Welcome back</h2>
                <p className="muted" style={{ textAlign: 'center', fontSize: '.86rem', marginTop: 6 }}>
                  Sign in to pick up your saved searches.
                </p>

                {flash.status && (
                  <div
                    style={{
                      marginTop: 18,
                      padding: '12px 16px',
                      borderRadius: 'var(--r)',
                      background: 'var(--ok-bg)',
                      color: 'var(--ok)',
                      fontWeight: 600,
                      fontSize: '.85rem',
                    }}
                  >
                    {flash.status}
                  </div>
                )}

                <a href="/auth/google" className="btn btn--k btn--w" style={{ marginTop: 24, height: 48 }}>
                  <span className="gic">
                    <Google />
                  </span>
                  Continue with Google
                </a>

                <div className="divid">or</div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label className="lbl">Email</label>
                    <input
                      className="fld"
                      type="email"
                      autoComplete="email"
                      placeholder="you@brand.com"
                      value={form.data.email}
                      onChange={(e) => form.setData('email', e.target.value)}
                    />
                    {form.errors.email && <p className="hint" style={{ color: 'var(--warn)' }}>{form.errors.email}</p>}
                  </div>
                  <div>
                    <label className="lbl">Password</label>
                    <input
                      className="fld"
                      type="password"
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={form.data.password}
                      onChange={(e) => form.setData('password', e.target.value)}
                    />
                    {form.errors.password && (
                      <p className="hint" style={{ color: 'var(--warn)' }}>{form.errors.password}</p>
                    )}
                  </div>
                </div>

                <button type="submit" className="btn btn--y btn--w" style={{ marginTop: 20, height: 48 }} disabled={form.processing}>
                  {form.processing ? 'Signing in…' : 'Sign in'} <Arrow />
                </button>

                <p className="muted" style={{ textAlign: 'center', fontSize: '.83rem', marginTop: 18 }}>
                  No account?{' '}
                  <Link href="/register" style={{ fontWeight: 700, color: 'var(--amber-ink)' }}>
                    Create one free
                  </Link>
                </p>
              </form>
            </div>

            <p className="faint" style={{ textAlign: 'center', fontSize: '.78rem', marginTop: 18 }}>
              1 free search · no credit card
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
