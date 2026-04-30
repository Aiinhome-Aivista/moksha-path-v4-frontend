import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import Brand from '@/components/common/Brand';

export type HeaderVariant = 'landing' | 'auth';

interface HeaderProps {
  variant?: HeaderVariant;
}

const Header = ({ variant = 'landing' }: HeaderProps) => {
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen((v) => !v);
  const close = useCallback(() => setOpen(false), []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) close();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, close]);

  /* Nav links — shared between desktop inline & mobile drawer */
  const navLinks =
    variant === 'landing' ? (
      <>
        <a href="#personas" onClick={close}>
          Who it's for
        </a>
        <a href="#how" onClick={close}>
          How it works
        </a>
        <a href="#proof" onClick={close}>
          Success stories
        </a>
        <a href="#pricing" onClick={close}>
          Pricing
        </a>
        <Link to="/signin" className="btn btn-ghost" onClick={close}>
          Sign in
        </Link>
        <Link to="/register" className="btn btn-primary cta" onClick={close}>
          Create account
        </Link>
      </>
    ) : (
      <>
        <Link to="/#personas" onClick={close}>Who it's for</Link>
        <Link to="/#faq" onClick={close}>FAQ</Link>
        <Link to="/#pricing" onClick={close}>Pricing</Link>
        <Link to="/signin" className="btn btn-ghost" onClick={close}>
          Sign in
        </Link>
        <Link to="/register" className="btn btn-primary cta" onClick={close}>
          Create account
        </Link>
      </>
    );

  return (
    <>
      <header className="site-header">
        <div className="wrap">
          <Brand />

          <button
            className="nav-toggle"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={toggle}
          >
            <span />
            <span />
            <span />
          </button>

          {/* Desktop inline nav — visible only above 1060px */}
          <nav className="nav nav-desktop" aria-label="Primary">
            {navLinks}
          </nav>
        </div>
      </header>

      {/* Mobile drawer + backdrop — portaled to body so they escape the sticky header stacking context */}
      {createPortal(
        <>
          <div
            className={`nav-backdrop${open ? ' visible' : ''}`}
            onClick={close}
            aria-hidden="true"
          />
          <nav
            className={`nav nav-mobile${open ? ' open' : ''}`}
            aria-label="Primary"
          >
            <button
              className="nav-mobile-close"
              aria-label="Close menu"
              onClick={close}
            >
              ×
            </button>
            {navLinks}
          </nav>
        </>,
        document.body
      )}
    </>
  );
};

export default Header;
