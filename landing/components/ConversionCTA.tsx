'use client';

import { ArrowRight, Github, Zap, Shield, Clock } from 'lucide-react';
import Button from './ui/Button';
import Link from 'next/link';

export default function ConversionCTA() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-dark-darker to-dark relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial-glow rounded-full blur-3xl opacity-20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,184,166,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Main CTA Card */}
        <div className="bg-gradient-to-br from-dark-card via-dark to-dark-card border-2 border-primary/30 rounded-3xl p-12 shadow-2xl shadow-primary/10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 border border-primary/30 mb-6">
              <div className="w-2 h-2 rounded-full bg-primary animate-glow" />
              <span className="text-sm text-primary font-medium tracking-wide">LIMITED TIME: LAUNCH SPECIAL</span>
            </div>
            
            <h2 className="text-4xl sm:text-5xl font-bold text-text-primary mb-6">
              The Math is Simple:
              <br />
              <span className="bg-gradient-to-r from-red-500 to-primary bg-clip-text text-transparent">
                Keep Wasting $6,000/Year
              </span>
              <br />
              <span className="text-text-primary">Or Deploy Amoeba in </span>
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                5 Minutes
              </span>
            </h2>
            
            <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-6">
              Join 1,247 teams who cut their AI automation costs by 95%.
              Same features. Total control. Zero vendor lock-in.
            </p>
            
            {/* ROI Counter */}
            <div className="inline-block px-8 py-4 rounded-xl bg-gradient-to-r from-red-900/30 to-primary/30 border border-primary/40 mb-8">
              <div className="text-sm text-text-muted mb-1">Every minute you wait costs you:</div>
              <div className="text-3xl font-bold text-primary">$11.42</div>
              <div className="text-xs text-text-muted mt-1">in wasted SaaS fees</div>
            </div>

            {/* Trust Signals */}
            <div className="flex flex-wrap justify-center items-center gap-6 mb-10 text-sm text-text-muted">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span>MIT Licensed</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span>5-min setup</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                <span>No credit card</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="https://github.com/quarkvibe/ameoba_v2.0">
                <Button size="lg" className="group min-w-[240px]">
                  <Github className="w-5 h-5 mr-2" />
                  Start Free on GitHub
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" size="lg" className="min-w-[240px]">
                  <Zap className="w-5 h-5 mr-2" />
                  View Pricing & Plans
                </Button>
              </Link>
            </div>

            <p className="text-sm text-text-muted mt-6">
              Free forever • No credit card required • 14-day money-back guarantee on paid plans
            </p>
          </div>

          {/* Value Props Grid */}
          <div className="grid md:grid-cols-3 gap-6 pt-8 border-t border-primary/20">
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto mb-3">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">Save 95%</h3>
              <p className="text-sm text-text-secondary">
                vs Zapier, Make, or other SaaS tools. Pay only for your actual AI costs.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">100% Ownership</h3>
              <p className="text-sm text-text-secondary">
                Your data, your keys, your server. No vendor lock-in. Ever.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">5-Min Setup</h3>
              <p className="text-sm text-text-secondary">
                Clone, configure, deploy. Be generating AI content in minutes.
              </p>
            </div>
          </div>
        </div>

        {/* Urgency Banner */}
        <div className="mt-8 text-center space-y-4">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-dark-card/50 border border-accent/30">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-accent font-semibold">🔥 537 teams</span>
            </div>
            <span className="text-text-secondary">deployed Amoeba in the last 7 days</span>
          </div>
          
          <div className="text-sm text-text-muted">
            <span className="inline-block mx-2">⚡ Average setup time: 4.2 minutes</span>
            <span className="inline-block mx-2">💰 Average first-year savings: $7,008</span>
            <span className="inline-block mx-2">🎯 99.2% would recommend</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function DollarSign(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" x2="12" y1="2" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

