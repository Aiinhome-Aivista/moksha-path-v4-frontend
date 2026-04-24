import { useState } from 'react';
import type { ContactMethod, RegisterPayload } from '@/types';
import ContactMethodToggle from '../ContactMethodToggle';
import GoogleSsoButton from '../GoogleSsoButton';

interface StepContactProps {
  active: boolean;
  method: ContactMethod;
  onMethodChange: (m: ContactMethod) => void;
  formData: Partial<RegisterPayload>;
  onChange: (patch: Partial<RegisterPayload>) => void;
  onBack: () => void;
  onContinue: () => void;
}

const StepContact = ({
  active,
  method,
  onMethodChange,
  formData,
  onChange,
  onBack,
  onContinue,
}: StepContactProps) => {
  const [agreed, setAgreed] = useState(false);

  return (
    <section className={`w-step${active ? ' is-active' : ''}`} data-step="3">
      <div className="w-step__eyebrow">
        <span className="accent-sanskrit">संपर्क</span>
        <span className="wse-en">Contact</span>
      </div>
      <h1 className="w-step__title">How should we reach you?</h1>
      <p className="w-step__lede">
        We'll send a one-time code to verify it's really you. No passwords, no spam.
      </p>

      <GoogleSsoButton />

      <div className="auth-divider">
        <span>or use email / phone</span>
      </div>

      <ContactMethodToggle value={method} onChange={onMethodChange} />

      <label className={`auth-field${method === 'email' ? '' : ' is-hidden'}`}>
        <span className="auth-field__label">Email address</span>
        <input
          type="email"
          className="auth-field__input"
          placeholder="you@school.edu"
          autoComplete="email"
          value={formData.email ?? ''}
          onChange={(e) => onChange({ email: e.target.value })}
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
            inputMode="numeric"
            value={formData.phone ?? ''}
            onChange={(e) => onChange({ phone: e.target.value })}
          />
        </div>
      </label>

      <label className="auth-checkbox">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          required
        />
        <span>
          I agree to the <a href="#">terms</a> and <a href="#">data policy</a>. Student
          data stays anonymised.
        </span>
      </label>

      <div className="w-step__actions">
        <button type="button" className="btn btn-ghost" onClick={onBack}>
          ← Back
        </button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={!agreed}
          onClick={onContinue}
        >
          Send code →
        </button>
      </div>
    </section>
  );
};

export default StepContact;
