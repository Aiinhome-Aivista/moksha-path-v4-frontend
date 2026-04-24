import { useEffect, useState } from 'react';
import type { Persona } from '@/types';

interface TabDef {
  key: Persona;
  name: string;
  sub: string;
}

const TABS: TabDef[] = [
  { key: 'student', name: 'Students', sub: "Aarav's view" },
  { key: 'parent', name: 'Parents', sub: "Priya's view" },
  { key: 'teacher', name: 'Teachers', sub: "Ms. Sharma's view" },
  { key: 'institution', name: 'Institutions', sub: "Principal's view" },
];

interface PanelContent {
  pill: string;
  title: string;
  mockAlt: string;
  mockSrc: string;
  narrative: React.ReactNode;
  features: Array<{ title: string; body: string }>;
}

const PANELS: Record<Persona, PanelContent> = {
  student: {
    pill: 'For the learner',
    title: "A guide he didn't have before.",
    mockSrc: '/assets/dash-student.svg',
    mockAlt:
      "Student dashboard mockup — today's plan, progress ring, AI āchārya, weekly badges",
    narrative: (
      <>
        At 5 pm, Aarav opens MokshPath. The plan is already there — 45 minutes, three
        tasks, no guesswork. His <em>āchārya</em> has bookmarked yesterday's doubt, ready
        to answer. Tomorrow morning, he'll know exactly where he stands.
      </>
    ),
    features: [
      {
        title: 'Daily Smart Plan',
        body: '45-minute achievable blocks, auto-built from your syllabus and pace.',
      },
      {
        title: 'AI Āchārya',
        body: '24/7 guide — instant answers, gentle nudges, priority focus when behind.',
      },
      {
        title: 'Vidya Kosh',
        body: 'Videos, notes, and practice, organized by subject, chapter, and difficulty.',
      },
      {
        title: 'Living Progress',
        body: 'Growth across topics — not just marks. See what you mastered this week.',
      },
    ],
  },
  parent: {
    pill: 'For the family',
    title: 'Visibility without anxiety.',
    mockSrc: '/assets/dash-parent.svg',
    mockAlt:
      'Parent dashboard mockup — weekly progress graph, on-track badge, early alert, conversation-starter',
    narrative: (
      <>
        Priya doesn't need to hunt for marks. Every Sunday, MokshPath tells her where
        Aarav shone, where he stumbled, and what's coming up — all in 30 seconds. And if
        something slips, she hears about it gently, before the next report card.
      </>
    ),
    features: [
      {
        title: 'Weekly Snapshot',
        body: "One dashboard. Everything you'd ask on parent-teacher night.",
      },
      {
        title: 'Early Alerts',
        body: 'Gentle signals when your child slips — before the term exam, not after.',
      },
      {
        title: 'Conversation-Starters',
        body: 'Topic-level insight so you can ask better questions, not push harder.',
      },
      {
        title: 'Trust & Privacy',
        body: "GDPR + COPPA compliant. Your child's data is anonymised end-to-end.",
      },
    ],
  },
  teacher: {
    pill: 'For the educator',
    title: 'The gap-finder you always needed.',
    mockSrc: '/assets/dash-teacher.svg',
    mockAlt:
      'Teacher dashboard mockup — class heatmap, error classification, auto-remediation action',
    narrative: (
      <>
        Ms. Sharma starts her day with a heatmap. Nine students are shaky on
        trigonometric identities — not because they can't, but because they're applying
        formulas mechanically. One click, and MokshPath prepares nine targeted
        micro-drills. She reclaims her prep hour.
      </>
    ),
    features: [
      {
        title: 'Hidden Gap Radar',
        body: 'Analytics separate conceptual errors from careless ones from pacing issues.',
      },
      {
        title: 'Auto-Remediation',
        body: "Generate targeted retests per student's exact error pattern — one click.",
      },
      {
        title: 'AI Teaching Hints',
        body: 'Guide the AI with your pedagogy. The engine asks questions the way you would.',
      },
      {
        title: 'Class Heatmap',
        body: 'See where the class is shaky on a topic — before you teach it.',
      },
    ],
  },
  institution: {
    pill: 'For the school',
    title: 'Academic rigor. Operational clarity.',
    mockSrc: '/assets/dash-institution.svg',
    mockAlt:
      'Institution dashboard mockup — KPI strip, standard-wise performance bars, board sync, regulatory export',
    narrative: (
      <>
        Principal Ranganathan asks a simple question every Monday:{' '}
        <em>are we improving?</em> MokshPath answers across 42 sections — cohort, subject,
        concept, teacher — and flags exactly where attention is needed. Regulatory
        reporting: one click, signed, exported.
      </>
    ),
    features: [
      {
        title: 'Standard-wise Oversight',
        body: 'Every grade, every section, every subject — in one consolidated view.',
      },
      {
        title: 'Board-Aligned, Always',
        body: 'CBSE, ICSE, IB, CAIE, and every Indian state board — syllabus-mapped.',
      },
      {
        title: "Bloom's-aligned Rigor",
        body: 'Assessments benchmarked to global academic standards — defensible, auditable.',
      },
      {
        title: 'Scale & Safety',
        body: '<1.5s at national-Olympiad scale. WCAG 2.1 AA. Unique question sequence per student.',
      },
    ],
  },
};

const PersonaExplorer = () => {
  const [active, setActive] = useState<Persona>('student');

  // Hash deep-linking: #tab-parent etc.
  useEffect(() => {
    const sync = () => {
      const m = (window.location.hash || '').match(/^#tab-(\w+)$/);
      if (m) {
        const key = m[1] as Persona;
        if (PANELS[key]) {
          setActive(key);
          document.getElementById('personas')?.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };
    window.addEventListener('hashchange', sync);
    sync();
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  return (
    <section id="personas" className="personas">
      <div className="wrap">
        <div className="personas__header">
          <span className="eyebrow">
            चतुर्-दृष्टि <span className="en">Four perspectives, one truth</span>
          </span>
          <h2>One platform. Four purposeful views.</h2>
          <p className="muted max-700">
            Tap a role to see the features, the flow, and the exact dashboard that role
            experiences — not a generic feature list.
          </p>
        </div>

        <div className="persona-explorer" role="tablist" aria-label="Personas">
          <div className="persona-tabs">
            {TABS.map((t) => (
              <button
                key={t.key}
                className={`persona-tab${active === t.key ? ' is-active' : ''}`}
                role="tab"
                aria-selected={active === t.key}
                aria-controls={`panel-${t.key}`}
                id={`tab-${t.key}`}
                onClick={() => setActive(t.key)}
                type="button"
              >
                <span className="ico">✦</span>
                <span className="name">{t.name}</span>
                <span className="sub">{t.sub}</span>
              </button>
            ))}
          </div>

          {TABS.map((t) => {
            const panel = PANELS[t.key];
            const isActive = active === t.key;
            return (
              <div
                key={t.key}
                className={`persona-panel${isActive ? ' is-active' : ''}`}
                id={`panel-${t.key}`}
                role="tabpanel"
                aria-labelledby={`tab-${t.key}`}
                hidden={!isActive}
              >
                <div className="persona-panel__mock">
                  <img src={panel.mockSrc} alt={panel.mockAlt} />
                </div>
                <div className="persona-panel__body">
                  <span className="pill">{panel.pill}</span>
                  <h3>{panel.title}</h3>
                  <p className="narrative">{panel.narrative}</p>
                  <ul className="feature-grid">
                    {panel.features.map((f) => (
                      <li key={f.title}>
                        <span className="fi">◆</span>
                        <h4>{f.title}</h4>
                        <p>{f.body}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PersonaExplorer;
