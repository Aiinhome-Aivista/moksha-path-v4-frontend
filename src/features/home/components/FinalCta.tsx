const FinalCta = () => {
  return (
    <section className="final-cta">
      <img className="mandala" src="/assets/mandala.svg" alt="" aria-hidden="true" />
      <div className="wrap">
        <img src="/assets/Guru.jpeg" alt="" className="guru-stamp" aria-hidden="true" />
        <span className="eyebrow" style={{ color: 'var(--saffron-soft)' }}>
          मार्ग-दर्शन{' '}
          <span className="en" style={{ color: '#A7ADCB' }}>
            Guidance, begun
          </span>
        </span>
        <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', marginTop: 12 }}>
          The right path begins with the right question.
        </h2>
        <p>
          Book a 30-minute walkthrough with our academic team, tailored to your school or
          your child's board.
        </p>
        <div className="cta-row" style={{ justifyContent: 'center', display: 'flex' }}>
          <a href="#pricing" className="btn btn-primary">
            Request a school demo →
          </a>
          <a
            href="#"
            className="btn btn-ghost"
            style={{ color: 'var(--cream)', borderColor: 'var(--cream)' }}
          >
            Start free for families
          </a>
        </div>
      </div>
    </section>
  );
};

export default FinalCta;
