'use client';

import { Bot, Lock, Zap, Mail, Webhook, Calendar, Brain, Gauge, Globe, DollarSign } from 'lucide-react';

const features = [
  {
    icon: Bot,
    title: 'Any AI Provider (BYOK)',
    description: 'OpenAI, Anthropic, Cohere, local Ollama. Switch providers in seconds. No markup fees. Direct API pricing only.',
    value: 'Save 80% on AI costs',
  },
  {
    icon: Lock,
    title: '100% Data Ownership',
    description: 'Your server. Your database. Your keys. AES-256-GCM encryption. HIPAA, SOC2, GDPR ready out of the box.',
    value: 'Zero compliance risk',
  },
  {
    icon: DollarSign,
    title: 'Cost Transparency',
    description: 'Real-time cost tracking. See exactly what each generation costs. No hidden fees. No surprise bills.',
    value: 'Control every penny',
  },
  {
    icon: Mail,
    title: 'Multi-Channel Delivery',
    description: 'Email (SendGrid, AWS SES), SMS (Twilio), Voice, Webhooks. All included. All free. Configure in minutes.',
    value: 'No per-message fees',
  },
  {
    icon: Webhook,
    title: 'API-First Architecture',
    description: 'RESTful API. Webhook integrations. Connect to any system. Build custom workflows.',
    value: 'Infinite flexibility',
  },
  {
    icon: Calendar,
    title: 'Smart Automation',
    description: 'Cron scheduling. Trigger via SMS. Webhook triggers. API calls. Set it and forget it.',
    value: 'Zero manual work',
  },
  {
    icon: Brain,
    title: 'SMS Command Center',
    description: 'Control everything via text message. Trigger generation. Check status. Review content. From anywhere.',
    value: 'Run from your phone',
  },
  {
    icon: Gauge,
    title: 'Real-Time Analytics',
    description: 'Live dashboards. Token usage. Cost tracking. Performance metrics. API health. Everything visible.',
    value: 'Total visibility',
  },
  {
    icon: Globe,
    title: 'Air-Gapped Option',
    description: 'Run Ollama locally. Zero external API calls. Perfect for sensitive data. Compliant with strictest security.',
    value: '$0 per generation',
  },
];

export default function Features() {
  return (
    <section className="py-24 bg-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-dark-card/30 border border-primary/20 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-glow" />
            <span className="text-sm text-text-secondary font-medium tracking-wide">EVERYTHING YOU NEED</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-text-primary mb-4">
            Enterprise Features.
            <br />
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Zero Enterprise Pricing.
            </span>
          </h2>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto">
            Stop paying for "pro" and "enterprise" tiers. Get everything included, free forever.
            <br />
            <span className="text-primary font-bold">100% of features. $0 forever. No catch.</span>
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group p-6 rounded-xl bg-dark-card/50 backdrop-blur-sm border border-primary/20 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 relative overflow-hidden"
              >
                {/* Value Badge */}
                <div className="absolute top-3 right-3">
                  <span className="inline-block px-2 py-1 rounded-md bg-accent/20 text-accent text-xs font-bold">
                    {feature.value}
                  </span>
                </div>
                
                <div className="w-12 h-12 rounded-xl bg-gradient-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:scale-105 group-hover:border-primary/40 transition-all">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2 tracking-wide">
                  {feature.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

