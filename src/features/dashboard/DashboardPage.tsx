import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import AuthFooter from '@/components/layout/AuthFooter';
import { useAuth } from '@/hooks/useAuth';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="auth-body">
      <Header variant="auth" />
      <main className="auth-main">
        <div className="auth-shell" style={{ gridTemplateColumns: '1fr' }}>
          <div className="auth-card">
            <div className="auth-card__eyebrow">
              <span className="accent-sanskrit">स्वागतम्</span>
              <span className="auth-eb-en">Welcome</span>
            </div>
            <h1 className="auth-card__title">
              Hello{user?.name ? `, ${user.name}` : ''}.
            </h1>
            <p className="auth-card__lede">
              You're signed in as a <strong>{user?.persona ?? 'user'}</strong>. Your
              personalised dashboard — today's plan, progress, and your āchārya — is
              coming to this space.
            </p>

            <div className="cta-row" style={{ marginTop: 24 }}>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={handleLogout}
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </main>
      <AuthFooter />
    </div>
  );
};

export default DashboardPage;
