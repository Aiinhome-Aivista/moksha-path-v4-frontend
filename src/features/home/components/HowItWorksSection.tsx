interface Pillar {
  num: string;
  title: string;
  body: string;
  tag: string;
}

const PILLARS: Pillar[] = [
  {
    num: '01',
    title: 'Adaptive Assessment',
    body:
      'Item Response Theory (IRT) — not just right-or-wrong. Each question adapts to the learner\'s actual ability, classifying every misstep as conceptual, careless, or pacing.',
    tag: 'Unique question sequence · Eliminates malpractice',
  },
  {
    num: '02',
    title: 'Board-aligned Plans',
    body:
      "Plans auto-map to your board's syllabus and your school's academic calendar — CBSE, ICSE, CAIE, IB, and every Indian state board.",
    tag: 'Daily · achievable · calendar-aware',
  },
  {
    num: '03',
    title: 'Vidya Kosh',
    body:
      'The knowledge treasury — videos, notes, structured practice, worked examples, organized by subject, chapter, and difficulty.',
    tag: 'Always one tap away · offline-friendly',
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how" className="sec-ivory">
      <div className="wrap">
        <div className="personas__header">
          <span className="eyebrow">
            त्रि-मार्ग <span className="en">The three pillars</span>
          </span>
          <h2>Under the hood: three quiet engines.</h2>
          <p className="muted max-700">
            Every view above — Aarav's, Priya's, Ms. Sharma's, the Principal's — is
            powered by the same three things.
          </p>
        </div>

        <div className="pillars">
          {PILLARS.map((p) => (
            <div key={p.num} className="pillar">
              <div className="pillar__num">{p.num}</div>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
              <div className="pillar__tag">{p.tag}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
