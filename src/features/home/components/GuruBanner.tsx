const GuruBanner = () => {
  return (
    <section className="sec-indigo guru-banner">
      <div className="wrap">
        <div className="guru-hero">
          <div className="guru-hero__img">
            <img src="/assets/Guru.jpeg" alt="MokshPath guru — AI mentor mascot in meditation" />
          </div>
          <div className="guru-hero__copy">
            <span className="eyebrow" style={{ color: 'var(--saffron-soft)' }}>
              गुरुः शिष्याय{' '}
              <span className="en" style={{ color: '#A7ADCB' }}>
                Guru to student, quietly
              </span>
            </span>
            <h2>A guru, inside every screen.</h2>
            <p>
              The <em>āchārya</em> inside MokshPath is patient, personal, and present —
              across every role's dashboard. The same mentor that guides Aarav through
              trigonometry is the one that helps Ms. Sharma diagnose her class and the
              Principal report on a cohort.
            </p>
            <a href="#pricing" className="btn btn-primary" style={{ marginTop: 8 }}>
              Bring the āchārya to your school →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GuruBanner;
