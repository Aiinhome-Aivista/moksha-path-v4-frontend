const AuthAsideCard = () => {
  return (
    <aside className="auth-aside">
      <div className="auth-aside__inner">
        <img
          src="/assets/hero.svg"
          alt=""
          className="auth-aside__logo"
          aria-hidden="true"
        />
        <blockquote className="auth-aside__quote">
          "A single stone, dropped in the right pond, changes the direction of every
          ripple."
        </blockquote>
        <div className="auth-aside__facts">
          <div>
            <span className="aaf-n">4</span>
            <span className="aaf-l">Dashboards</span>
          </div>
          <div>
            <span className="aaf-n">1</span>
            <span className="aaf-l">Adaptive engine</span>
          </div>
          <div>
            <span className="aaf-n">∞</span>
            <span className="aaf-l">Personal paths</span>
          </div>
        </div>
        <div className="auth-aside__trust">
          🔒 GDPR + COPPA compliant · WCAG 2.1 AA
        </div>
      </div>
    </aside>
  );
};

export default AuthAsideCard;
