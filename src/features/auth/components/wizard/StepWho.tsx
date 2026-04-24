import { Link } from 'react-router-dom';
import type { Persona } from '@/types';

interface StepWhoProps {
  active: boolean;
  persona: Persona | null;
  onPersonaChange: (p: Persona) => void;
  onContinue: () => void;
}

interface PersonaDef {
  key: Persona;
  name: string;
  sub: string;
  icon: JSX.Element;
}

const PERSONAS: PersonaDef[] = [
  {
    key: 'student',
    name: 'Student',
    sub: "I'm learning — in Class 6 to 12",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 8l9-4 9 4-9 4-9-4z" />
        <path d="M7 10v5c0 1.5 2.5 3 5 3s5-1.5 5-3v-5" />
      </svg>
    ),
  },
  {
    key: 'parent',
    name: 'Parent',
    sub: 'Supporting a learner at home',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  {
    key: 'teacher',
    name: 'Teacher',
    sub: 'Teaching a class, running diagnostics',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="13" rx="2" />
        <path d="M8 21h8M12 17v4" />
        <path d="M7 9h6M7 13h10" />
      </svg>
    ),
  },
  {
    key: 'institution',
    name: 'Institution',
    sub: 'School, chain, or academic body',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18M5 21V9l7-5 7 5v12" />
        <path d="M9 21v-6h6v6" />
      </svg>
    ),
  },
];

const StepWho = ({ active, persona, onPersonaChange, onContinue }: StepWhoProps) => {
  return (
    <section className={`w-step${active ? ' is-active' : ''}`} data-step="1">
      <div className="w-step__eyebrow">
        <span className="accent-sanskrit">नमस्ते</span>
        <span className="wse-en">Let's begin</span>
      </div>
      <h1 className="w-step__title">Who walks this path with us?</h1>
      <p className="w-step__lede">
        Pick the role that describes you best today. You can always invite others later.
      </p>

      <div className="persona-cards" role="radiogroup" aria-label="Select your role">
        {PERSONAS.map((p) => (
          <button
            key={p.key}
            type="button"
            className={`persona-card${persona === p.key ? ' is-selected' : ''}`}
            data-persona={p.key}
            role="radio"
            aria-checked={persona === p.key}
            onClick={() => onPersonaChange(p.key)}
          >
            <span className="pc-ico">{p.icon}</span>
            <span className="pc-name">{p.name}</span>
            <span className="pc-sub">{p.sub}</span>
          </button>
        ))}
      </div>

      <div className="w-step__actions">
        <Link to="/signin" className="w-link">
          Already have an account? Sign in
        </Link>
        <button
          type="button"
          className="btn btn-primary"
          disabled={!persona}
          onClick={onContinue}
        >
          Continue →
        </button>
      </div>
    </section>
  );
};

export default StepWho;
