import { KeyboardEvent, useEffect, useRef, useState } from 'react';

interface StepVerifyProps {
  active: boolean;
  destination: string;
  onBack: () => void;
  onSubmit: (code: string) => void;
  onResend?: () => void;
  submitting?: boolean;
  error?: string | null;
}

const LENGTH = 6;

const StepVerify = ({
  active,
  destination,
  onBack,
  onSubmit,
  onResend,
  submitting,
  error,
}: StepVerifyProps) => {
  const [digits, setDigits] = useState<string[]>(Array(LENGTH).fill(''));
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  // Focus the first box when this step becomes active.
  useEffect(() => {
    if (active) refs.current[0]?.focus();
  }, [active]);

  const setAt = (i: number, value: string) => {
    setDigits((prev) => {
      const next = [...prev];
      next[i] = value;
      return next;
    });
  };

  const handleInput = (i: number, raw: string) => {
    const value = raw.replace(/\D/g, '').slice(0, 1);
    setAt(i, value);
    if (value && i < LENGTH - 1) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };

  const handleSubmit = () => {
    const code = digits.join('');
    if (code.length === LENGTH) onSubmit(code);
  };

  return (
    <section className={`w-step${active ? ' is-active' : ''}`} data-step="4">
      <div className="w-step__eyebrow">
        <span className="accent-sanskrit">स्वागतम्</span>
        <span className="wse-en">Welcome</span>
      </div>
      <h1 className="w-step__title">Verify and step onto your path.</h1>
      <p className="w-step__lede">
        We sent a 6-digit code to <strong>{destination || 'your email'}</strong>. Enter it
        here — you can change contact method if needed.
      </p>

      <div className="otp-boxes" role="group" aria-label="Enter 6-digit code">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => (refs.current[i] = el)}
            type="text"
            maxLength={1}
            inputMode="numeric"
            pattern="[0-9]"
            className="otp-box"
            value={d}
            onChange={(e) => handleInput(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
          />
        ))}
      </div>

      <div className="otp-resend">
        Didn't get it?{' '}
        <button type="button" className="link-btn" onClick={onResend}>
          Resend code
        </button>{' '}
        or{' '}
        <button type="button" className="link-btn" onClick={onBack}>
          change method
        </button>
        .
      </div>

      {error && (
        <p style={{ color: 'var(--saffron)', fontSize: '0.9rem', marginTop: 8 }}>
          {error}
        </p>
      )}

      <div className="w-step__actions">
        <button type="button" className="btn btn-ghost" onClick={onBack}>
          ← Back
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={submitting || digits.join('').length !== LENGTH}
        >
          {submitting ? 'Verifying…' : 'Begin my path →'}
        </button>
      </div>

      <div className="w-step__reassure">
        🔒 We never share your data. You can delete your account any time from settings.
      </div>
    </section>
  );
};

export default StepVerify;
