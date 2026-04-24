interface FaqItem {
  q: string;
  a: string;
  open?: boolean;
}

const FAQS: FaqItem[] = [
  {
    q: 'How long does roll-out take?',
    a: 'Two to four weeks from signed agreement. Week 1: teacher onboarding. Week 2: student roster + diagnostic. Weeks 3–4: classroom integration, with live support from a dedicated success lead.',
    open: true,
  },
  {
    q: 'Do my teachers need training?',
    a: 'Yes, but light — a single 90-minute session covers 80% of daily usage. We provide role-specific playbooks, a resident success manager for the first term, and async office hours thereafter.',
  },
  {
    q: 'What about students without devices at home?',
    a: 'The student dashboard is mobile-first and works on any smartphone or shared device. Offline-friendly Vidya Kosh content (notes, practice) downloads in under 2 MB per chapter for low-bandwidth use.',
  },
  {
    q: 'Who owns the student data?',
    a: 'You do. Your school is the data controller. MokshPath is the processor, bound by DPA under Indian DPDP Act, GDPR, and COPPA. Student PII is anonymised for analytics. Full export on 30-day notice if you ever leave.',
  },
  {
    q: 'Will this integrate with our ERP or LMS?',
    a: 'Standard SSO (Google, Microsoft), CSV roster sync, and REST APIs are included on Gold and above. Deeper ERP integrations (e.g., Campus360, Fedena) handled as scoped engagements on Enterprise.',
  },
  {
    q: "How is this different from BYJU's or Khan Academy?",
    a: "Those are content-first. MokshPath is assessment-first, board-aligned, and school-operated. Teachers stay in the loop — the AI augments pedagogy instead of replacing it. And the entire system adapts to your school's academic calendar, not a generic syllabus.",
  },
  {
    q: 'What does it actually cost?',
    a: 'Silver pricing starts at a modest per-student monthly fee (published in sales conversations). Gold is volume-based with custom fine-tuning. Enterprise is contract-priced annually. We share a transparent quote within one working day of a demo.',
  },
  {
    q: 'Can we pilot before signing a contract?',
    a: "Yes — we run a complimentary 20-minute diagnostic for any Class 6–12 cohort. You'll receive a written report identifying conceptual, careless, and pacing gaps — classroom-ready — within 48 hours. No card, no commitment.",
  },
];

const FaqSection = () => {
  return (
    <section id="faq" className="faq">
      <div className="wrap">
        <div className="personas__header">
          <span className="eyebrow">
            प्रश्न-उत्तर <span className="en">Questions buyers ask</span>
          </span>
          <h2>Before you say "maybe" — here's what principals ask us.</h2>
        </div>
        <div className="faq-grid">
          {FAQS.map((f, i) => (
            <details key={i} className="faq-item" open={f.open}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
