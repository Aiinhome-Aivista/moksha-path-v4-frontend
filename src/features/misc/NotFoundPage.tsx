import { Link } from 'react-router-dom';
import LandingLayout from '@/components/layout/LandingLayout';

const NotFoundPage = () => {
  return (
    <LandingLayout>
      <section style={{ padding: '120px 0', textAlign: 'center' }}>
        <div className="wrap">
          <span className="eyebrow">
            पृष्ठ न मिलम् <span className="en">Page not found</span>
          </span>
          <h1 style={{ marginTop: 12 }}>This path doesn't exist.</h1>
          <p className="muted" style={{ maxWidth: 520, margin: '0 auto 24px' }}>
            The page you were looking for has moved, or never existed. Let's get you back
            on a guided path.
          </p>
          <div className="cta-row" style={{ justifyContent: 'center', display: 'flex' }}>
            <Link to="/" className="btn btn-primary">
              Go home →
            </Link>
            <Link to="/signin" className="btn btn-ghost">
              Sign in
            </Link>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
};

export default NotFoundPage;
