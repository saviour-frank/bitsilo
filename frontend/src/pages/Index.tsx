import { useEffect, forwardRef } from 'react';
import { useApp } from '@/contexts/AppContext';
import { TrustBar } from '@/components/shared/TrustBar';
import { HeroSection } from '@/components/landing/HeroSection';
import { StatsSection } from '@/components/landing/StatsSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { SecuritySection } from '@/components/landing/SecuritySection';
import { ChartSection } from '@/components/landing/ChartSection';
import { CtaSection } from '@/components/landing/CtaSection';

const LandingPage = forwardRef<HTMLDivElement>((_, ref) => {
  useEffect(() => { document.title = 'BitSilo — sBTC Micro-Yield Vault'; }, []);
  const { state } = useApp();
  const { vault, vaultLoading } = state;

  return (
    <div ref={ref} className="w-full">
      <HeroSection vault={vault} vaultLoading={vaultLoading} />
      <StatsSection vault={vault} vaultLoading={vaultLoading} />
      <HowItWorksSection />
      <FeaturesSection />
      <SecuritySection />
      <ChartSection />
      <CtaSection />
      <section className="bg-background px-4 py-10">
        <div className="mx-auto max-w-6xl">
          <TrustBar />
        </div>
      </section>
    </div>
  );
});
LandingPage.displayName = 'LandingPage';
export default LandingPage;
