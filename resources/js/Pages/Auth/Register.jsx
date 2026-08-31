import { Head, Link, useForm } from '@inertiajs/react';

import { Logo, Google, Arrow } from '../../landing/components/Icons.jsx';

const FIELDS = [
  { key: 'name', label: 'Name', type: 'text', placeholder: 'Your name', autoComplete: 'name' },
  { key: 'email', label: 'Email', type: 'email', placeholder: 'you@brand.com', autoComplete: 'email' },
  { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••', autoComplete: 'new-password' },
  { key: 'password_confirmation', label: 'Confirm password', type: 'password', placeholder: '••••••••', autoComplete: 'new-password' },
];

export default function Register() {
  const form = useForm({ name: '', email: '', password: '', password_confirmation: '' });

  const submit = (event) => {
    event.preventDefault();
    form.post('/register');
  };

  return (
    <>
      <Head title="Create your account · Brand Beacon" />

      <div className="bb">
        <div className="auth">
          <div className="auth__c">
            <Link href="/" className="auth__k">
              <Logo className="h-[34px] w-[34px]" />
              <span>Brand Beacon</span>
            </Link>

            <div className="card">
              <form className="card__p" onSubmit={submit}>
                <h2 style={{ textAlign: 'center' }}>Create your account</h2>
                <p className="muted" style={{ textAlign: 'center', fontSize: '.86rem', marginTop: 6 }}>
                  Your first search is free — no credit card.
                </p>

                <a href="/auth/google" className="btn btn--k btn--w" style={{ marginTop: 24, height: 48 }}>
                  <span className="gic">
                    <Google />
                  </span>
                  Continue with Google
                </a>

                <div className="divid">or</div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {FIELDS.map((f) => (
                    <div key={f.key}>
                      <label className="lbl">{f.label}</label>
                      <input
                        className="fld"
                        type={f.type}
                        autoComplete={f.autoComplete}
                        placeholder={f.placeholder}
                        value={form.data[f.key]}
                        onChange={(e) => form.setData(f.key, e.target.value)}
                      />
                      {form.errors[f.key] && <p className="hint" style={{ color: 'var(--warn)' }}>{form.errors[f.key]}</p>}
                    </div>
                  ))}
                </div>

                <button type="submit" className="btn btn--y btn--w" style={{ marginTop: 20, height: 48 }} disabled={form.processing}>
                  {form.processing ? 'Creating…' : 'Create account'} <Arrow />
                </button>

                <p className="muted" style={{ textAlign: 'center', fontSize: '.83rem', marginTop: 18 }}>
                  Already have an account?{' '}
                  <Link href="/login" style={{ fontWeight: 700, color: 'var(--amber-ink)' }}>
                    Sign in
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
