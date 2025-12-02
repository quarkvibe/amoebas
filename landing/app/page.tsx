import Hero from '@/components/Hero';
import Features from '@/components/Features';
import SocialProof from '@/components/SocialProof';
import ROICalculator from '@/components/ROICalculator';
import ConversionCTA from '@/components/ConversionCTA';
import PricingPreview from '@/components/PricingPreview';
import Footer from '@/components/Footer';
import StickyHeader from '@/components/StickyHeader';
import ExitIntent from '@/components/ExitIntent';

export default function Home() {
  return (
    <>
      <StickyHeader />
      <ExitIntent />
      <main className="min-h-screen bg-dark-darker">
        <Hero />
        <Features />
        <SocialProof />
        <ROICalculator />
        <ConversionCTA />
        <PricingPreview />
        <Footer />
      </main>
    </>
  );
}
