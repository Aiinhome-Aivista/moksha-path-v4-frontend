import { useState } from 'react';
import { Link } from 'react-router-dom';
import Brand from '@/components/common/Brand';

export type HeaderVariant = 'landing' | 'auth';

interface HeaderProps {
  variant?: HeaderVariant;
}

const Header = ({ variant = 'landing' }: HeaderProps) => {
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen((v) => !v);

  return (
    <header className="site-header">
      <div className="wrap">
        <Brand />

        <button
          className="nav-toggle"
          aria-label="Open menu"
          aria-expanded={open}
          onClick={toggle}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`nav${open ? ' open' : ''}`} aria-label="Primary">
          {variant === 'landing' ? (
            <>
              <a href="#personas" onClick={() => setOpen(false)}>
                Who it's for
              </a>
              <a href="#how" onClick={() => setOpen(false)}>
                How it works
              </a>
              <a href="#proof" onClick={() => setOpen(false)}>
                Success stories
              </a>
              <a href="#pricing" onClick={() => setOpen(false)}>
                Pricing
              </a>
              <Link to="/signin" className="btn btn-ghost">
                Sign in
              </Link>
              <Link to="/register" className="btn btn-primary cta">
                Create account
              </Link>
            </>
          ) : (
            <>
              <Link to="/#personas">Who it's for</Link>
              <Link to="/#faq">FAQ</Link>
              <Link to="/#pricing">Pricing</Link>
              <Link to="/signin" className="btn btn-ghost">
                Sign in
              </Link>
              <Link to="/register" className="btn btn-primary cta">
                Create account
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
