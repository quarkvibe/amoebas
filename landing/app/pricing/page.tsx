'use client';

import { Check, Github, Zap, Building2, Phone } from 'lucide-react';
import Button from '@/components/ui/Button';
import Footer from '@/components/Footer';
import Link from 'next/link';

const pricingTiers = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    icon: Github,
    description: 'Full platform, self-hosted, all features included',
    cta: 'Start Free',
    ctaLink: 'https://github.com/quarkvibe/ameoba_v2.0',
    popular: false,
    features: [
      'Complete AI content generation',
      'Multi-channel delivery (email, SMS, voice, webhooks)',
      'Data source integration (RSS, APIs, web)',
      'Scheduled automation (cron jobs)',
      'Review workflow & quality pipeline',
      'SMS command interface',
      'BYOK (bring your own API keys)',
      'Self-hosted on your server',
      'CLI with 60+ commands',
      'Full dashboard UI',
      'Open source (MIT license)',
      'Commercial use allowed',
      'Community support (GitHub, Discord)',
      'No feature restrictions',
      'No usage limits',
    ],
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    icon: Zap,
    description: 'For teams who need support and early access',
    cta: 'Subscribe to Pro',
    ctaLink: '/subscribe?tier=pro',
    popular: true,
    yearlyPrice: '$290/year',
    yearlySavings: 'Save $58',
    features: [
      'Everything in Free, plus:',
      '✨ Priority email support (24-hour response)',
      '✨ Early access to new features (1 month ahead)',
      '✨ Private Discord server',
      '✨ Vote on roadmap & feature requests',
      '✨ Remove "Powered by Amoeba" footer',
      '✨ Monthly office hours with founders',
      '✨ Access to premium templates',
    ],
  },
  {
    name: 'Business',
    price: '$99',
    period: '/month',
    icon: Building2,
    description: 'For agencies and serious businesses',
    cta: 'Subscribe to Business',
    ctaLink: '/subscribe?tier=business',
    popular: false,
    yearlyPrice: '$990/year',
    yearlySavings: 'Save $198',
    features: [
      'Everything in Pro, plus:',
      '🏢 White-label ready (remove all Amoeba branding)',
      '🏢 SLA with 4-hour response time',
      '🏢 Multi-instance deployment support',
      '🏢 Priority bug fixes',
      '🏢 Quarterly strategy calls',
      '🏢 Custom feature prioritization',
      '🏢 Dedicated account manager',
      '🏢 Reseller/agency licensing',
    ],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    icon: Building2,
    description: 'For large organizations with special requirements',
    cta: 'Contact Sales',
    ctaLink: 'mailto:enterprise@quarkvibe.com',
    popular: false,
    features: [
      'Everything in Business, plus:',
      '🏆 Dedicated support engineer',
      '🏆 Custom feature development',
      '🏆 On-premise deployment assistance',
      '🏆 Training & onboarding for team',
      '🏆 Legal agreements (BAA, DPA, MSA)',
      '🏆 99.9% uptime SLA',
      '🏆 Security audits & compliance',
      '🏆 Priority everything',
    ],
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-dark-darker">
      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-gradient-to-b from-dark-darker to-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-dark-card/30 border border-primary/20 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-sm text-text-secondary font-medium tracking-wide">TRANSPARENT PRICING</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl font-bold text-text-primary mb-6">
            <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              Stop Wasting $599/Month
            </span>
            <br />
            Start Free. Scale Smart.
          </h1>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto mb-4">
            Full enterprise platform. 100% free forever. Pay only for premium support if you want it.
          </p>
          <div className="inline-block px-8 py-4 rounded-xl bg-gradient-to-r from-primary/20 to-accent/20 border-2 border-primary/40 mb-8">
            <p className="text-2xl font-bold text-primary">
              💰 Average Customer Saves $7,008 in Year 1
            </p>
          </div>
          
          <div className="flex items-center justify-center gap-4 text-sm text-text-secondary">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              <span>No vendor lock-in</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              <span>14-day money-back guarantee</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative rounded-2xl p-8 ${
                  tier.popular
                    ? 'bg-gradient-to-b from-primary/10 to-dark-card border-2 border-primary'
                    : 'bg-dark-card border border-border'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-dark-darker text-xs font-bold rounded-full">
                    MOST POPULAR
                  </div>
                )}
                
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg ${tier.popular ? 'bg-primary/20' : 'bg-primary/10'}`}>
                    <tier.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-text-primary">{tier.name}</h3>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-text-primary">{tier.price}</span>
                    {tier.period && <span className="text-text-secondary">{tier.period}</span>}
                  </div>
                  {tier.yearlyPrice && (
                    <div className="mt-2 text-sm text-primary">
                      {tier.yearlyPrice} • {tier.yearlySavings}
                    </div>
                  )}
                </div>
                
                <p className="text-sm text-text-secondary mb-6">
                  {tier.description}
                </p>
                
              <Link href={tier.ctaLink}>
                <Button
                  variant={tier.popular ? 'primary' : 'secondary'}
                  className="w-full mb-6"
                >
                  {tier.cta}
                </Button>
              </Link>
                
                <div className="space-y-3">
                  {tier.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2">
                      {feature.startsWith('✨') || feature.startsWith('🏢') || feature.startsWith('🏆') ? (
                        <>
                          <span className="text-base">{feature.slice(0, 2)}</span>
                          <span className="text-sm text-text-secondary flex-1">{feature.slice(3)}</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <span className="text-sm text-text-secondary">{feature}</span>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-dark">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-text-primary mb-12 text-center">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            <div className="bg-dark-card rounded-xl p-6 border border-border">
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Is the free tier really unlimited?
              </h3>
              <p className="text-text-secondary">
                Yes! The free tier includes all features with no restrictions. You self-host on your server and use your own API keys (BYOK), so there are no usage limits. The paid tiers are for support and services, not features.
              </p>
            </div>
            
            <div className="bg-dark-card rounded-xl p-6 border border-border">
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                What do I get with paid tiers?
              </h3>
              <p className="text-text-secondary">
                Paid tiers give you priority support, early access to new features, white-label options, and SLA guarantees. The platform features are the same - you're paying for support and services, not functionality.
              </p>
            </div>
            
            <div className="bg-dark-card rounded-xl p-6 border border-border">
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                What are the actual costs to run Amoeba?
              </h3>
              <p className="text-text-secondary">
                Since Amoeba uses BYOK (Bring Your Own Keys), you pay API providers directly: ~$0.001-0.01 per AI generation (OpenAI/Anthropic), ~$0.0075 per SMS (Twilio), ~$0.0001 per email (SendGrid). Plus your server costs (~$5-20/month for a basic VPS). Total: ~$20-50/month for typical usage.
              </p>
            </div>
            
            <div className="bg-dark-card rounded-xl p-6 border border-border">
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Can I cancel my subscription anytime?
              </h3>
              <p className="text-text-secondary">
                Yes! Cancel anytime, no questions asked. Your platform will continue working (it's self-hosted), you'll just lose access to priority support and premium features. We also offer a 14-day money-back guarantee.
              </p>
            </div>
            
            <div className="bg-dark-card rounded-xl p-6 border border-border">
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-text-secondary">
                We use Stripe for all payments. Accepted: all major credit cards, debit cards, and digital wallets (Apple Pay, Google Pay). For Enterprise plans, we can arrange invoicing.
              </p>
            </div>
            
            <div className="bg-dark-card rounded-xl p-6 border border-border">
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Do you offer refunds?
              </h3>
              <p className="text-text-secondary">
                Yes! We offer a 14-day money-back guarantee on all paid plans. If you're not satisfied within the first 14 days, we'll refund your subscription payment, no questions asked.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-text-primary mb-12 text-center">
            Compare All Features
          </h2>
          
          <div className="bg-dark-card rounded-xl border border-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-text-secondary font-medium">Feature</th>
                  <th className="text-center p-4 text-text-secondary font-medium">Free</th>
                  <th className="text-center p-4 text-primary font-medium">Pro</th>
                  <th className="text-center p-4 text-text-secondary font-medium">Business</th>
                  <th className="text-center p-4 text-text-secondary font-medium">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="p-4 text-text-primary">AI Content Generation</td>
                  <td className="text-center p-4"><Check className="w-5 h-5 text-primary mx-auto" /></td>
                  <td className="text-center p-4"><Check className="w-5 h-5 text-primary mx-auto" /></td>
                  <td className="text-center p-4"><Check className="w-5 h-5 text-primary mx-auto" /></td>
                  <td className="text-center p-4"><Check className="w-5 h-5 text-primary mx-auto" /></td>
                </tr>
                <tr>
                  <td className="p-4 text-text-primary">Multi-Channel Delivery</td>
                  <td className="text-center p-4"><Check className="w-5 h-5 text-primary mx-auto" /></td>
                  <td className="text-center p-4"><Check className="w-5 h-5 text-primary mx-auto" /></td>
                  <td className="text-center p-4"><Check className="w-5 h-5 text-primary mx-auto" /></td>
                  <td className="text-center p-4"><Check className="w-5 h-5 text-primary mx-auto" /></td>
                </tr>
                <tr>
                  <td className="p-4 text-text-primary">SMS Commands</td>
                  <td className="text-center p-4"><Check className="w-5 h-5 text-primary mx-auto" /></td>
                  <td className="text-center p-4"><Check className="w-5 h-5 text-primary mx-auto" /></td>
                  <td className="text-center p-4"><Check className="w-5 h-5 text-primary mx-auto" /></td>
                  <td className="text-center p-4"><Check className="w-5 h-5 text-primary mx-auto" /></td>
                </tr>
                <tr>
                  <td className="p-4 text-text-primary">Community Support</td>
                  <td className="text-center p-4"><Check className="w-5 h-5 text-primary mx-auto" /></td>
                  <td className="text-center p-4"><Check className="w-5 h-5 text-primary mx-auto" /></td>
                  <td className="text-center p-4"><Check className="w-5 h-5 text-primary mx-auto" /></td>
                  <td className="text-center p-4"><Check className="w-5 h-5 text-primary mx-auto" /></td>
                </tr>
                <tr className="bg-primary/5">
                  <td className="p-4 text-text-primary font-medium">Priority Email Support</td>
                  <td className="text-center p-4 text-text-secondary">—</td>
                  <td className="text-center p-4"><Check className="w-5 h-5 text-primary mx-auto" /></td>
                  <td className="text-center p-4"><Check className="w-5 h-5 text-primary mx-auto" /></td>
                  <td className="text-center p-4"><Check className="w-5 h-5 text-primary mx-auto" /></td>
                </tr>
                <tr className="bg-primary/5">
                  <td className="p-4 text-text-primary font-medium">Early Access to Features</td>
                  <td className="text-center p-4 text-text-secondary">—</td>
                  <td className="text-center p-4"><Check className="w-5 h-5 text-primary mx-auto" /></td>
                  <td className="text-center p-4"><Check className="w-5 h-5 text-primary mx-auto" /></td>
                  <td className="text-center p-4"><Check className="w-5 h-5 text-primary mx-auto" /></td>
                </tr>
                <tr className="bg-primary/5">
                  <td className="p-4 text-text-primary font-medium">Private Discord</td>
                  <td className="text-center p-4 text-text-secondary">—</td>
                  <td className="text-center p-4"><Check className="w-5 h-5 text-primary mx-auto" /></td>
                  <td className="text-center p-4"><Check className="w-5 h-5 text-primary mx-auto" /></td>
                  <td className="text-center p-4"><Check className="w-5 h-5 text-primary mx-auto" /></td>
                </tr>
                <tr>
                  <td className="p-4 text-text-primary font-medium">White-Label (Remove Branding)</td>
                  <td className="text-center p-4 text-text-secondary">—</td>
                  <td className="text-center p-4 text-text-secondary">—</td>
                  <td className="text-center p-4"><Check className="w-5 h-5 text-primary mx-auto" /></td>
                  <td className="text-center p-4"><Check className="w-5 h-5 text-primary mx-auto" /></td>
                </tr>
                <tr>
                  <td className="p-4 text-text-primary font-medium">SLA (4-hour response)</td>
                  <td className="text-center p-4 text-text-secondary">—</td>
                  <td className="text-center p-4 text-text-secondary">—</td>
                  <td className="text-center p-4"><Check className="w-5 h-5 text-primary mx-auto" /></td>
                  <td className="text-center p-4"><Check className="w-5 h-5 text-primary mx-auto" /></td>
                </tr>
                <tr>
                  <td className="p-4 text-text-primary font-medium">Dedicated Support Engineer</td>
                  <td className="text-center p-4 text-text-secondary">—</td>
                  <td className="text-center p-4 text-text-secondary">—</td>
                  <td className="text-center p-4 text-text-secondary">—</td>
                  <td className="text-center p-4"><Check className="w-5 h-5 text-primary mx-auto" /></td>
                </tr>
                <tr>
                  <td className="p-4 text-text-primary font-medium">Custom Development</td>
                  <td className="text-center p-4 text-text-secondary">—</td>
                  <td className="text-center p-4 text-text-secondary">—</td>
                  <td className="text-center p-4 text-text-secondary">—</td>
                  <td className="text-center p-4"><Check className="w-5 h-5 text-primary mx-auto" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Add-On Services */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-dark">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-text-primary mb-12 text-center">
            Professional Services
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-dark-card rounded-xl p-6 border border-border">
              <h3 className="text-xl font-bold text-text-primary mb-2">Setup Service</h3>
              <div className="text-3xl font-bold text-primary mb-4">$499</div>
              <p className="text-text-secondary mb-4">
                We set up Amoeba for you on your server, including database, SSL, and initial configuration.
              </p>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Server setup & configuration
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Database setup
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  SSL/domain configuration
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Initial template creation
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  1-hour training session
                </li>
              </ul>
            </div>
            
            <div className="bg-dark-card rounded-xl p-6 border border-border">
              <h3 className="text-xl font-bold text-text-primary mb-2">Custom Development</h3>
              <div className="text-3xl font-bold text-primary mb-4">$150<span className="text-lg">/hour</span></div>
              <p className="text-text-secondary mb-4">
                Need custom features, integrations, or modifications? We'll build it for you.
              </p>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Custom integrations
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Feature development
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Workflow automation
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  API connectors
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Priority delivery
                </li>
              </ul>
            </div>
            
            <div className="bg-dark-card rounded-xl p-6 border border-border">
              <h3 className="text-xl font-bold text-text-primary mb-2">Training & Consulting</h3>
              <div className="text-3xl font-bold text-primary mb-4">$1,000<span className="text-lg">/day</span></div>
              <p className="text-text-secondary mb-4">
                Full-day training for your team or consulting on architecture and best practices.
              </p>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Team training (up to 10 people)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Architecture review
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Workflow optimization
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Best practices guide
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Q&A session
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <Link href="mailto:sales@quarkvibe.com">
              <Button variant="secondary" size="large">
                <Phone className="w-4 h-4 mr-2" />
                Contact Sales for Custom Needs
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-dark-darker to-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl font-bold text-text-primary mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-text-secondary mb-8">
            Start with the free tier. Upgrade when you need support.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="https://github.com/quarkvibe/ameoba_v2.0">
              <Button variant="primary" size="large">
                <Github className="w-5 h-5 mr-2" />
                Start Free (GitHub)
              </Button>
            </Link>
            <Link href="/subscribe?tier=pro">
              <Button variant="secondary" size="large">
                <Zap className="w-5 h-5 mr-2" />
                Subscribe to Pro ($29/mo)
              </Button>
            </Link>
          </div>
          
          <p className="text-sm text-text-secondary mt-6">
            No credit card required for free tier • 14-day money-back guarantee on paid plans
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
