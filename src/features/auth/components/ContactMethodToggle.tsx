import type { ContactMethod } from '@/types';

interface ContactMethodToggleProps {
  value: ContactMethod;
  onChange: (next: ContactMethod) => void;
}

const ContactMethodToggle = ({ value, onChange }: ContactMethodToggleProps) => {
  return (
    <div className="auth-toggle" role="tablist" aria-label="Contact method">
      <button
        type="button"
        className={`auth-toggle__btn${value === 'email' ? ' is-active' : ''}`}
        data-method="email"
        role="tab"
        aria-selected={value === 'email'}
        onClick={() => onChange('email')}
      >
        Email
      </button>
      <button
        type="button"
        className={`auth-toggle__btn${value === 'phone' ? ' is-active' : ''}`}
        data-method="phone"
        role="tab"
        aria-selected={value === 'phone'}
        onClick={() => onChange('phone')}
      >
        Phone
      </button>
    </div>
  );
};

export default ContactMethodToggle;
