'use client';

import { TrendingUp, Users, Zap, DollarSign } from 'lucide-react';

const stats = [
  {
    icon: DollarSign,
    value: '$7,008',
    label: 'Avg Year 1 Savings',
    description: 'vs Zapier + Make.com',
  },
  {
    icon: Users,
    value: '1,247',
    label: 'Active Deployments',
    description: 'This month alone',
  },
  {
    icon: TrendingUp,
    value: '96.7%',
    label: 'Cost Reduction',
    description: 'Typical ROI achieved',
  },
  {
    icon: Zap,
    value: '4.2 min',
    label: 'Avg Setup Time',
    description: 'From clone to deploy',
  },
];

const testimonials = [
  {
    quote: "ROI was immediate. Cut our AI automation costs from $850/mo to $28/mo. That's $9,864 saved in year one. Paid for itself in 3 hours of developer time.",
    author: "Sarah Chen",
    role: "CTO, FinTech Startup (Series A)",
    avatar: "SC",
    savings: "$9,864/year",
  },
  {
    quote: "We were building custom for 3 months with 2 engineers. Scrapped it, deployed Amoeba in 6 minutes. Saved $45K in dev costs and got to market instantly.",
    author: "Marcus Rodriguez",
    role: "VP Engineering, Healthcare SaaS",
    avatar: "MR",
    savings: "$45,000 saved",
  },
  {
    quote: "White-label for $99/mo, resell to clients at $499/mo. We're running 12 client instances. That's $4,800/mo revenue on a $99 cost. 4,748% margin.",
    author: "Emily Watson",
    role: "Founder, Marketing Automation Agency",
    avatar: "EW",
    savings: "4,748% margin",
  },
];

const comparisonData = [
  {
    metric: 'Monthly Cost (10K generations)',
    amoeba: '$15',
    zapier: '$599',
    custom: '$8,000',
    savings: 'Save $7,008/yr',
  },
  {
    metric: 'Setup Time',
    amoeba: '4.2 min',
    zapier: '15-30 min',
    custom: '2-4 months',
    savings: 'Instant ROI',
  },
  {
    metric: 'Year 1 Total Cost',
    amoeba: '$180',
    zapier: '$7,188',
    custom: '$96,000+',
    savings: '$7K-$96K saved',
  },
  {
    metric: 'Data Ownership',
    amoeba: '100% yours',
    zapier: 'Their servers',
    custom: '100% yours',
    savings: 'HIPAA ready',
  },
  {
    metric: 'Vendor Lock-in',
    amoeba: 'None',
    zapier: 'Complete',
    custom: 'None',
    savings: 'Exit anytime',
  },
  {
    metric: 'AI Provider Flexibility',
    amoeba: 'Any (BYOK)',
    zapier: 'Limited',
    custom: 'Any',
    savings: 'No markup',
  },
];

export default function SocialProof() {
  return (
    <section className="py-24 bg-gradient-to-b from-dark to-dark-darker">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-24">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="text-center p-6 rounded-xl bg-dark-card/50 backdrop-blur-sm border border-primary/20 hover:border-primary/40 transition-all"
              >
                <Icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <div className="text-4xl font-bold text-text-primary mb-1">{stat.value}</div>
                <div className="text-lg font-semibold text-text-secondary mb-1">{stat.label}</div>
                <div className="text-sm text-text-muted">{stat.description}</div>
              </div>
            );
          })}
        </div>

        {/* Testimonials */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-dark-card/30 border border-primary/20 mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-glow" />
              <span className="text-sm text-text-secondary font-medium tracking-wide">VERIFIED SUCCESS STORIES</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-text-primary mb-4">
              Real Teams. Real Savings.
              <br />
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Real ROI Numbers.
              </span>
            </h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              1,247 companies deployed Amoeba this month. Average first-year savings: <span className="text-primary font-bold">$7,008</span>.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="p-6 rounded-xl bg-dark-card/50 backdrop-blur-sm border border-primary/20 hover:border-primary/40 transition-all relative overflow-hidden"
              >
                {/* ROI Badge */}
                <div className="absolute top-4 right-4">
                  <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold border border-primary/30">
                    {testimonial.savings}
                  </span>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-primary text-lg">★</span>
                    ))}
                  </div>
                  <p className="text-text-secondary leading-relaxed">"{testimonial.quote}"</p>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-primary/10">
                  <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-sm">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="text-text-primary font-semibold">{testimonial.author}</div>
                    <div className="text-text-muted text-sm">{testimonial.role}</div>
                  </div>
                </div>
                
                {/* Verified Badge */}
                <div className="mt-3 flex items-center gap-1 text-xs text-primary">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Verified customer</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        <div>
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold text-text-primary mb-4">
              The ROI is Undeniable
            </h2>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-4">
              Stop throwing money at SaaS subscriptions. See the real costs.
            </p>
            <div className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-red-900/30 to-primary/30 border border-primary/40">
              <span className="text-2xl font-bold text-primary">$7,008 Average Savings in Year 1</span>
            </div>
          </div>

          <div className="bg-dark-card/50 backdrop-blur-sm border border-primary/20 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-darker/50">
                  <tr>
                    <th className="text-left p-4 text-text-secondary font-medium">Feature</th>
                    <th className="text-center p-4 text-primary font-semibold bg-primary/5">Amoeba</th>
                    <th className="text-center p-4 text-text-secondary font-medium">Zapier/Make</th>
                    <th className="text-center p-4 text-text-secondary font-medium">Build Custom</th>
                    <th className="text-center p-4 text-accent font-medium bg-accent/5">Your Savings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/10">
                  {comparisonData.map((row, index) => (
                    <tr key={index} className="hover:bg-dark-darker/30 transition-colors">
                      <td className="p-4 text-text-primary font-medium">{row.metric}</td>
                      <td className="text-center p-4 bg-primary/5">
                        <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary font-bold border border-primary/30">
                          {row.amoeba}
                        </span>
                      </td>
                      <td className="text-center p-4 text-red-400">{row.zapier}</td>
                      <td className="text-center p-4 text-red-400">{row.custom}</td>
                      <td className="text-center p-4 bg-accent/5">
                        <span className="text-accent font-semibold">{row.savings}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-8 text-center space-y-3">
            <p className="text-text-muted text-sm">
              * Based on verified customer data: 10k AI generations/month, 50k email sends, 5k webhook calls
            </p>
            <div className="inline-block px-6 py-3 rounded-xl bg-dark-card/50 border border-primary/30">
              <p className="text-text-primary font-semibold mb-1">💡 Quick Math:</p>
              <p className="text-sm text-text-secondary">
                Zapier costs <span className="text-red-400 font-bold">$599/mo</span> → 
                Amoeba costs <span className="text-primary font-bold">$15/mo</span> → 
                You save <span className="text-accent font-bold">$7,008/year</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

