const PilotStrip = () => {
  return (
    <section className="pilot-strip" aria-label="Currently in pilot">
      <div className="wrap">
        <div className="pilot-strip__inner">
          <div className="pilot-strip__label">
            <span className="pill-live">
              <span className="pl-dot" />
              In pilot
            </span>
            <span className="pilot-strip__text">
              Currently piloting with schools across <strong>CBSE</strong>,{' '}
              <strong>ICSE</strong>, and select state boards. Verified case studies
              publishing in Q3 2026.
            </span>
          </div>
          <div className="pilot-strip__boards" aria-hidden="true">
            <span className="pb">CBSE</span>
            <span className="pb">ICSE</span>
            <span className="pb">CAIE</span>
            <span className="pb">IB</span>
            <span className="pb">State boards</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PilotStrip;
