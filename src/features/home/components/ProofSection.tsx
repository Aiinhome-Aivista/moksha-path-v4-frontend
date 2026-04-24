const ProofSection = () => {
  return (
    <section id="proof">
      <div className="wrap">
        <div className="personas__header">
          <span className="eyebrow">
            साक्ष्य <span className="en">Pilot outcomes · illustrative</span>
          </span>
          <h2>What we're measuring in our pilots.</h2>
          <p className="muted max-700">
            These targets reflect our ongoing pilot programs — not yet published,
            peer-reviewed results. Final case studies with signed-off school metrics will
            be shared with prospective buyers under NDA.
          </p>
        </div>

        <div className="grid three" style={{ marginTop: 32 }}>
          <div className="stat">
            <span className="n">+18%</span>
            <span className="l">Target board-exam uplift</span>
          </div>
          <div className="stat">
            <span className="n">3.4×</span>
            <span className="l">Target misconception recovery</span>
          </div>
          <div className="stat">
            <span className="n">92%</span>
            <span className="l">Target anxiety reduction</span>
          </div>
        </div>

        <div className="grid two" style={{ marginTop: 48 }}>
          <div className="quote-block illustrative">
            <span className="ill-tag">Illustrative · composite</span>
            <blockquote>
              "For the first time, our teachers could point to <em>why</em> a student was
              struggling, not just <em>that</em> they were. Parent meetings became
              conversations, not defences."
            </blockquote>
            <cite>— Voice of a pilot-school principal · composite quote</cite>
          </div>
          <div className="quote-block illustrative">
            <span className="ill-tag">Illustrative · composite</span>
            <blockquote>
              "I stopped making worksheets on weekends. MokshPath saw what I saw — and
              then did what I'd do."
            </blockquote>
            <cite>— Voice of a pilot-school teacher · composite quote</cite>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProofSection;
