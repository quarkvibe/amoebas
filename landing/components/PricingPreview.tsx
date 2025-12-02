'use client';

import { Check, ArrowRight } from 'lucide-react';
import Button from './ui/Button';
import Link from 'next/link';

export default function PricingPreview() {
  return (
    <section className="py-24 bg-gradient-to-b from-dark to-dark-darker">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-dark-card/30 border border-primary/20 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-glow" />
            <span className="text-sm text-text-secondary font-medium tracking-wide">PRICING THAT MAKES SENSE</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-text-primary mb-4">
            Start Free. Scale Smart.
            <br />
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Pay $0 or Choose Your Support Level
            </span>
          </h2>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto mb-2">
            Every feature is free forever. Paid tiers unlock priority support, white-label, and SLA.
          </p>
          <p className="text-lg text-primary font-bold mb-4">
            📊 ROI Calculator: Free tier saves you $7,008/year vs SaaS alternatives
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-text-muted">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              <span>All features included in free tier</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              <span>No usage limits ever</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              <span>14-day money-back guarantee</span>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Free Tier */}
          <div className="relative group">
            {/* Popular Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
              <span className="inline-block px-4 py-1 rounded-full bg-gradient-primary text-white text-sm font-semibold shadow-lg shadow-primary/30">
                🔥 Most Popular - 89% Choose This
              </span>
            </div>

            <div className="p-8 rounded-2xl bg-dark-card border-2 border-primary shadow-xl shadow-primary/20 h-full flex flex-col">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-text-primary mb-2">Free Forever</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-primary">$0</span>
                  <span className="text-text-muted">no catch</span>
                </div>
                <div className="mt-3 px-3 py-2 rounded-lg bg-primary/10 border border-primary/30">
                  <p className="text-sm text-primary font-bold">
                    💰 Saves $7,008/year vs Zapier
                  </p>
                </div>
                <p className="text-text-secondary mt-2 text-sm">100% features • Self-hosted • Zero limits</p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {[
                  'Complete AI platform',
                  'Multi-model AI support',
                  'Unlimited generations',
                  'Multi-channel delivery',
                  'SMS command interface',
                  'Cron scheduling',
                  'Review workflows',
                  'Community support',
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-text-secondary">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href="https://github.com/quarkvibe/ameoba_v2.0" className="block">
                <Button className="w-full group" size="lg">
                  Start Free on GitHub
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Pro Tier */}
          <div className="p-8 rounded-2xl bg-dark-card border border-dark-border hover:border-primary/30 transition-colors h-full flex flex-col relative overflow-hidden">
            {/* Best Value Badge */}
            <div className="absolute top-4 right-4">
              <span className="inline-block px-2 py-1 rounded-md bg-accent/20 text-accent text-xs font-bold">
                BEST VALUE
              </span>
            </div>
            
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-text-primary mb-2">Pro Support</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-text-primary">$29</span>
                <span className="text-text-muted">/month</span>
              </div>
              <div className="mt-2 text-sm">
                <span className="text-text-muted line-through">$49/mo</span>
                <span className="ml-2 text-accent font-semibold">Launch pricing</span>
              </div>
              <p className="text-text-secondary mt-2">24hr response • Early access • Private Discord</p>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {[
                'Everything in Free',
                '24-hour email support',
                'Early access to features',
                'Private Discord',
                'Vote on roadmap',
                'Premium templates',
                'Remove branding',
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-text-secondary">{feature}</span>
                </li>
              ))}
            </ul>

            <Link href="/pricing" className="block">
              <Button variant="outline" className="w-full" size="lg">
                View Pro Details
              </Button>
            </Link>
          </div>

          {/* Business Tier */}
          <div className="p-8 rounded-2xl bg-dark-card border border-dark-border hover:border-primary/30 transition-colors h-full flex flex-col relative overflow-hidden">
            {/* Revenue Badge */}
            <div className="absolute top-4 right-4">
              <span className="inline-block px-2 py-1 rounded-md bg-primary/20 text-primary text-xs font-bold">
                FOR AGENCIES
              </span>
            </div>
            
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-text-primary mb-2">Business</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-text-primary">$99</span>
                <span className="text-text-muted">/month</span>
              </div>
              <div className="mt-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-xs text-primary font-semibold">
                  💼 Resell to clients at $299-999/mo
                </p>
              </div>
              <p className="text-text-secondary mt-2 text-sm">White-label • 4hr SLA • Account manager</p>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {[
                'Everything in Pro',
                '4-hour SLA',
                'White-label ready',
                'Multi-instance support',
                'Priority bug fixes',
                'Custom features',
                'Account manager',
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-text-secondary">{feature}</span>
                </li>
              ))}
            </ul>

            <Link href="/pricing" className="block">
              <Button variant="outline" className="w-full" size="lg">
                View All Plans
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

