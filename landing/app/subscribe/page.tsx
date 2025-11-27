'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Check, ArrowRight, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Footer from '@/components/Footer';
import Link from 'next/link';

const tiers = {
  pro: {
    name: 'Pro',
    monthlyPrice: 29,
    yearlyPrice: 290,
    features: [
      'Priority email support (24-hour response)',
      'Early access to new features',
      'Private Discord server',
      'Vote on roadmap',
      'Remove "Powered by Amoeba" footer',
      'Monthly office hours',
      'Premium templates',
    ],
  },
  business: {
    name: 'Business',
    monthlyPrice: 99,
    yearlyPrice: 990,
    features: [
      'Everything in Pro, plus:',
      'White-label ready (full branding removal)',
      'SLA with 4-hour response',
      'Multi-instance deployment support',
      'Priority bug fixes',
      'Quarterly strategy calls',
      'Custom feature prioritization',
      'Reseller/agency licensing',
    ],
  },
};

export default function SubscribePage() {
  const searchParams = useSearchParams();
  const tierParam = searchParams?.get('tier') || 'pro';
  const tier = tiers[tierParam as keyof typeof tiers] || tiers.pro;
  
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [isLoading, setIsLoading] = useState(false);

  const price = billingPeriod === 'monthly' ? tier.monthlyPrice : tier.yearlyPrice;
  const savings = billingPeriod === 'yearly' ? tier.monthlyPrice * 12 - tier.yearlyPrice : 0;

  const handleCheckout = async () => {
    setIsLoading(true);
    
    try {
      // TODO: Call your API to create Stripe checkout session
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/checkout/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: tierParam,
          billingPeriod,
        }),
      });
      
      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-dark-darker">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/pricing" className="text-primary hover:text-primary/80 mb-4 inline-block">
            ← Back to pricing
          </Link>
          <h1 className="text-4xl font-bold text-text-primary mb-4">
            Subscribe to Amoeba {tier.name}
          </h1>
          <p className="text-xl text-text-secondary">
            Upgrade your Amoeba experience with priority support and advanced features
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: Summary */}
          <div className="bg-dark-card rounded-2xl p-8 border border-border h-fit">
            <h2 className="text-2xl font-bold text-text-primary mb-6">
              What You Get
            </h2>
            
            <div className="space-y-3 mb-8">
              {tier.features.map((feature, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-text-secondary">{feature}</span>
                </div>
              ))}
            </div>
            
            <div className="pt-6 border-t border-border">
              <p className="text-sm text-text-secondary">
                ✅ 14-day money-back guarantee<br />
                ✅ Cancel anytime<br />
                ✅ No long-term commitment<br />
                ✅ All platform features included
              </p>
            </div>
          </div>

          {/* Right: Checkout */}
          <div className="bg-dark-card rounded-2xl p-8 border border-primary/20">
            <h2 className="text-2xl font-bold text-text-primary mb-6">
              Choose Billing Period
            </h2>
            
            {/* Billing Toggle */}
            <div className="bg-dark-darker rounded-lg p-1 flex gap-1 mb-8">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`flex-1 py-3 px-4 rounded-md font-medium transition-all ${
                  billingPeriod === 'monthly'
                    ? 'bg-primary text-dark-darker'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`flex-1 py-3 px-4 rounded-md font-medium transition-all relative ${
                  billingPeriod === 'yearly'
                    ? 'bg-primary text-dark-darker'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Yearly
                {savings > 0 && (
                  <span className="absolute -top-2 -right-2 bg-accent text-xs px-2 py-0.5 rounded-full text-dark-darker font-bold">
                    Save ${savings}
                  </span>
                )}
              </button>
            </div>
            
            {/* Price Display */}
            <div className="bg-dark-darker rounded-xl p-6 mb-6">
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-text-secondary">Amoeba {tier.name}</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-text-primary">${price}</span>
                  <span className="text-text-secondary">/{billingPeriod === 'monthly' ? 'mo' : 'yr'}</span>
                </div>
              </div>
              {billingPeriod === 'yearly' && savings > 0 && (
                <div className="text-sm text-primary">
                  You save ${savings} compared to monthly billing
                </div>
              )}
            </div>
            
            {/* Checkout Button */}
            <Button
              variant="primary"
              className="w-full mb-4"
              size="large"
              onClick={handleCheckout}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Redirecting to Stripe...
                </>
              ) : (
                <>
                  Continue to Checkout
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
            
            <p className="text-xs text-text-secondary text-center">
              Secure payment via Stripe • Cancel anytime
            </p>
            
            {/* Trust Signals */}
            <div className="mt-8 pt-6 border-t border-border">
              <div className="space-y-3 text-sm text-text-secondary">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  <span>Instant access after payment</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  <span>14-day money-back guarantee</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  <span>Email receipt and invoice</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  <span>Manage subscription anytime</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Security Notice */}
        <div className="mt-12 text-center text-sm text-text-secondary">
          <p>🔒 Payments securely processed by Stripe</p>
          <p className="mt-2">Questions? Email <a href="mailto:support@quarkvibe.com" className="text-primary hover:text-primary/80">support@quarkvibe.com</a></p>
        </div>
      </div>

      <Footer />
    </main>
  );
}

