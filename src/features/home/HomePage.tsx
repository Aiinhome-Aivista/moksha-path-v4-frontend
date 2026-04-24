import LandingLayout from '@/components/layout/LandingLayout';
import HeroSection from './components/HeroSection';
import PilotStrip from './components/PilotStrip';
import PersonaExplorer from './components/PersonaExplorer';
import HowItWorksSection from './components/HowItWorksSection';
import ProofSection from './components/ProofSection';
import GuruBanner from './components/GuruBanner';
import TrustStrip from './components/TrustStrip';
import PricingSection from './components/PricingSection';
import FaqSection from './components/FaqSection';
import DiagnosticCta from './components/DiagnosticCta';
import FinalCta from './components/FinalCta';

const HomePage = () => {
  return (
    <LandingLayout>
      <HeroSection />
      <PilotStrip />
      <PersonaExplorer />
      <HowItWorksSection />
      <ProofSection />
      <GuruBanner />
      <TrustStrip />
      <PricingSection />
      <FaqSection />
      <DiagnosticCta />
      <FinalCta />
    </LandingLayout>
  );
};

export default HomePage;
