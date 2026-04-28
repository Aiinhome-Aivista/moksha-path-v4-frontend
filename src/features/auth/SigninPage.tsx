import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '@/components/layout/AuthLayout';
import { authService } from '@/services/authService';
import type { ContactMethod } from '@/types';
import ContactMethodToggle from './components/ContactMethodToggle';
import GoogleSsoButton from './components/GoogleSsoButton';
import AuthAsideCard from './components/AuthAsideCard';

const SigninPage = () => {
  const [method, setMethod] = useState<ContactMethod>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await authService.sendOtp({
        method,
        email: method === 'email' ? email : undefined,
        phone: method === 'phone' ? phone : undefined,
      });
      // In a real app we'd navigate to an OTP-verify page; for now we pass state along.
      navigate('/verify', {
        state: {
          method,
          destination: method === 'email' ? email : phone,
        },
      });
    } catch {
      setError('Could not send the code. Please check your details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <main className="auth-main">
        <img
          className="auth-mandala"
          src="/assets/mandala.svg"
          alt=""
          aria-hidden="true"
        />

        <div className="auth-shell">
          <div className="auth-card">
            <div className="auth-card__eyebrow">
              <span className="accent-sanskrit">पुनरागमन</span>
              <span className="auth-eb-en">Welcome back</span>
            </div>
            <h1 className="auth-card__title">Continue your path.</h1>
            <p className="auth-card__lede">
              Enter the email or phone you signed up with. We'll send a one-time code —
              no password to remember.
            </p>

            <form className="auth-form" onSubmit={handleSubmit}>
              <ContactMethodToggle value={method} onChange={setMethod} />

              <label className={`auth-field${method === 'email' ? '' : ' is-hidden'}`}>
                <span className="auth-field__label">Email</span>
                <input
                  type="email"
                  className="auth-field__input"
                  placeholder="you@school.edu"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required={method === 'email'}
                />
              </label>

              <label className={`auth-field${method === 'phone' ? '' : ' is-hidden'}`}>
                <span className="auth-field__label">Phone</span>
                <div className="auth-field__phone">
                  <span className="auth-field__cc">+91</span>
                  <input
                    type="tel"
                    className="auth-field__input"
                    placeholder="98765 43210"
                    autoComplete="tel"
                    inputMode="numeric"
                    pattern="[0-9 ]*"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </label>

              {error && (
                <p style={{ color: 'var(--saffron)', fontSize: '0.9rem', margin: '6px 0 0' }}>
                  {error}
                </p>
              )}

              <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
                {submitting ? 'Sending…' : 'Send one-time code →'}
              </button>

              <div className="auth-divider">
                <span>or</span>
              </div>

              <GoogleSsoButton onError={setError} />

              <p className="auth-footnote">
                New here? <Link to="/register">Create an account</Link> · it takes 60
                seconds.
              </p>
            </form>
          </div>

          <AuthAsideCard />
        </div>
      </main>
    </AuthLayout>
  );
};

export default SigninPage;
