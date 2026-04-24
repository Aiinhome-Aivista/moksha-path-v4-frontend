interface Tier {
  name: string;
  subtitle: string;
  price: string;
  priceSuffix: string;
  bullets: string[];
  cta: { label: string; variant: 'primary' | 'ghost' | 'dark' };
  featured?: boolean;
  ribbon?: string;
}

const TIERS: Tier[] = [
  {
    name: 'Silver',
    subtitle: 'Standard Board Prep',
    price: '₹—',
    priceSuffix: ' / student / month',
    bullets: [
      'General boards (CBSE, ICSE)',
      'All 4 role dashboards',
      'Standard reporting',
      'Email support',
    ],
    cta: { label: 'Talk to sales', variant: 'ghost' },
  },
  {
    name: 'Gold',
    subtitle: 'Custom School Needs',
    price: 'Custom',
    priceSuffix: ' · volume-based',
    bullets: [
      'Custom AI fine-tuning',
      "Learns your school's teaching style",
      'Deep pattern analytics',
      'Dedicated onboarding',
    ],
    cta: { label: 'Request a demo', variant: 'primary' },
    featured: true,
    ribbon: 'Most schools pick this',
  },
  {
    name: 'Enterprise',
    subtitle: 'Large School Networks',
    price: 'Contract',
    priceSuffix: ' · annual',
    bullets: [
      'Bespoke syllabus integration',
      'Full brand white-labelling',
      'Regulatory & board reporting',
      'SLA + on-site rollout',
    ],
    cta: { label: 'Contact enterprise', variant: 'dark' },
  },
];

const PricingSection = () => {
  return (
    <section id="pricing" className="sec-ivory">
      <div className="wrap">
        <div className="personas__header">
          <span className="eyebrow">
            सदस्यता <span className="en">Subscription</span>
          </span>
          <h2>Bring MokshPath to your school.</h2>
          <p className="muted max-700">
            Every tier includes the adaptive engine, all four role-dashboards,
            GDPR/COPPA-compliant storage, and the full Vidya Kosh. You pick the depth of
            customization.
          </p>
        </div>

        <div className="tiers">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`tier${tier.featured ? ' featured' : ''}`}
            >
              {tier.ribbon && <span className="ribbon">{tier.ribbon}</span>}
              <h3>{tier.name}</h3>
              <div className="muted">{tier.subtitle}</div>
              <div className="price">
                {tier.price}
                <small>{tier.priceSuffix}</small>
              </div>
              <ul>
                {tier.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
              <a href="#" className={`btn btn-${tier.cta.variant}`}>
                {tier.cta.label}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
