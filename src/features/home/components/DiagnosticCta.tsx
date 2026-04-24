const DiagnosticCta = () => {
  return (
    <section id="diagnostic" className="diagnostic-cta">
      <div className="wrap">
        <div className="diagnostic-cta__inner">
          <div>
            <span className="eyebrow" style={{ color: 'var(--saffron)' }}>
              नि:शुल्क परीक्षण <span className="en">Free diagnostic</span>
            </span>
            <h2>Run a 20-minute diagnostic on your cohort.</h2>
            <p className="muted">
              Pick one Class 6–12 section. Send us 10–30 students. We'll run an adaptive
              assessment and send back a classroom-ready report identifying{' '}
              <strong>conceptual gaps</strong>, <strong>careless errors</strong>, and{' '}
              <strong>pacing issues</strong> — within 48 hours. No commitment.
            </p>
            <div className="cta-row">
              <a
                href="mailto:diagnostic@mokshpath.org?subject=Free%20diagnostic%20request"
                className="btn btn-primary"
              >
                Request the diagnostic →
              </a>
              <a href="#faq" className="btn btn-ghost">
                How it works
              </a>
            </div>
          </div>
          <div className="diagnostic-cta__card">
            <div className="dc-label">You receive</div>
            <ul>
              <li>✓ PDF report per student · 2-page</li>
              <li>✓ Class-level heatmap by topic</li>
              <li>✓ Auto-remediation suggestions</li>
              <li>✓ 30-minute review call with our academic team</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DiagnosticCta;
