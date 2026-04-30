
const HeroSection = () => {
  return (
    <section className="hero-v2">
      <img className="mandala" src="/assets/mandala.svg" alt="" aria-hidden="true" />
      <div className="wrap">
        <div className="hero-v2__grid">
          <div className="hero-v2__copy">
            <span className="eyebrow">
              मार्ग-दर्शन <span className="en">Guided path to true learning</span>
            </span>
            <h1>
              Education is a <span className="em">team sport.</span>
            </h1>
            <p className="sub-head">
              Adaptive assessments, board-aligned learning plans, and role-specific
              dashboards — for <strong>CBSE, ICSE, CAIE, IB</strong>, and every Indian
              state board.
            </p>
            <p className="lede">
              MokshPath gives each player — students, parents, teachers, schools — the
              right view of the same journey. One adaptive engine. Four purposeful
              dashboards. Zero one-size-fits-all.
            </p>
            <div className="cta-row">
              <a href="#diagnostic" className="btn btn-primary">
                Run a free 20-minute diagnostic →
              </a>
              <a href="#pricing" className="btn btn-ghost">
                Book a school demo
              </a>
            </div>
            <div className="hero-trust-mini">
              <span className="htm-dot" />
              <span>No credit card · Results in 48 hours · GDPR + COPPA compliant</span>
            </div>
          </div>

          <div
            className="orbit-hero"
            aria-label="Four roles revolving around one learning core"
          >
            <div className="orbit-hero__glow" aria-hidden="true" />
            <div className="orbit-hero__path" aria-hidden="true" />

            <div className="orbit-hero__core">
              <div className="oh-core-disc">
                <div className="core-messages" aria-live="polite">
                  <span className="core-msg">
                    Every <em>gap</em>, seen.
                  </span>
                  <span className="core-msg">
                    Every <em>plan</em>, personal.
                  </span>
                  <span className="core-msg">
                    Every <em>misstep</em>, named.
                  </span>
                  <span className="core-msg">
                    Every <em>role</em>, ready.
                  </span>
                  <span className="core-msg">
                    Rigor, at <em>scale</em>.
                  </span>
                </div>
              </div>
              <div className="oh-core-label">
                <span className="accent-sanskrit">एक संकल्प</span>
                <span className="oh-core-en">One resolve · five objectives</span>
              </div>
            </div>

            <div className="orbit-hero__ring">
              <a href="/#tab-student" className="planet p1" aria-label="Students">
                <span className="planet-inner">
                  <span className="planet-ico" aria-hidden="true">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 8l9-4 9 4-9 4-9-4z" />
                      <path d="M7 10v5c0 1.5 2.5 3 5 3s5-1.5 5-3v-5" />
                    </svg>
                  </span>
                  <span className="planet-label">Students</span>
                </span>
              </a>
              <a href="/#tab-parent" className="planet p2" aria-label="Parents">
                <span className="planet-inner">
                  <span className="planet-ico" aria-hidden="true">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </span>
                  <span className="planet-label">Parents</span>
                </span>
              </a>
              <a href="/#tab-teacher" className="planet p3" aria-label="Teachers">
                <span className="planet-inner">
                  <span className="planet-ico" aria-hidden="true">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="4" width="18" height="13" rx="2" />
                      <path d="M8 21h8M12 17v4" />
                      <path d="M7 9h6M7 13h10" />
                    </svg>
                  </span>
                  <span className="planet-label">Teachers</span>
                </span>
              </a>
              <a href="/#tab-institution" className="planet p4" aria-label="Institutions">
                <span className="planet-inner">
                  <span className="planet-ico" aria-hidden="true">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 21h18M5 21V9l7-5 7 5v12" />
                      <path d="M9 21v-6h6v6" />
                    </svg>
                  </span>
                  <span className="planet-label">Institutions</span>
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
