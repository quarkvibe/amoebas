'use client';

import { ArrowRight, Sparkles, KeyRound, Zap } from 'lucide-react';
import Button from './ui/Button';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-dark-darker via-dark to-dark-darker">
      {/* Organic cellular background - microscope view */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Primary amoeba cell */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-radial-glow rounded-full blur-3xl animate-float" />
        {/* Secondary cell */}
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-radial-glow rounded-full blur-3xl animate-float" style={{ animationDelay: '2s', animationDuration: '8s' }} />
        {/* Tertiary cell */}
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-gradient-radial-glow rounded-full blur-3xl animate-float" style={{ animationDelay: '4s', animationDuration: '10s' }} />
        {/* Microscope grid overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,184,166,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-dark-card/50 border border-primary/30 backdrop-blur-sm mb-8 animate-slide-down">
          <div className="w-2 h-2 rounded-full bg-primary animate-glow" />
          <span className="text-sm text-text-secondary font-medium tracking-wide">
            Self-Hosted • Enterprise-Grade • Privacy-First
          </span>
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in">
          <span className="text-text-primary">
            You're Overpaying by
          </span>
          {' '}
          <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
            $6,000/year
          </span>
          <br />
          <span className="text-text-primary">
            for AI Tools You 
          </span>
          {' '}
          <span className="bg-gradient-primary bg-clip-text text-transparent">
            Don't Even Own
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-xl sm:text-2xl text-text-secondary max-w-3xl mx-auto mb-4 animate-slide-up leading-relaxed">
          Enterprise-grade AI automation platform. Self-hosted in 5 minutes.
          <br />
          <span className="text-primary font-bold text-2xl">Save $500/month.</span>
          {' '}
          <span className="text-text-primary font-medium">Own everything. Forever.</span>
        </p>

        {/* ROI Calculator Preview */}
        <div className="max-w-2xl mx-auto mb-8 p-6 rounded-2xl bg-dark-card/80 border-2 border-primary/40 backdrop-blur-sm animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-red-400 text-sm font-semibold mb-2">You Pay Now</div>
              <div className="text-3xl font-bold text-red-400 line-through">$599/mo</div>
              <div className="text-xs text-text-muted mt-1">Zapier + AI tools</div>
            </div>
            <div className="text-center border-l border-primary/30 pl-6">
              <div className="text-primary text-sm font-semibold mb-2">Pay with Amoeba</div>
              <div className="text-3xl font-bold text-primary">$15/mo</div>
              <div className="text-xs text-text-muted mt-1">Just infrastructure</div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-primary/20 text-center">
            <span className="text-lg font-bold text-primary">ROI: Save $7,008 in Year 1</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <Link href="https://github.com/quarkvibe/ameoba_v2.0">
            <Button size="lg" className="group relative overflow-hidden">
              <span className="relative z-10 flex items-center">
                <Sparkles className="w-5 h-5 mr-2" />
                Deploy Free in 5 Minutes
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-20 transition-opacity" />
            </Button>
          </Link>
          <Link href="/pricing">
            <Button variant="outline" size="lg" className="border-primary/50 hover:border-primary">
              See Full Pricing & ROI Calculator
            </Button>
          </Link>
        </div>
        
        {/* Urgency & Trust Signals */}
        <div className="flex flex-wrap justify-center items-center gap-6 mb-12 text-sm animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 border border-accent/40">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-text-primary font-semibold">1,247 deployments this month</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-glow" />
            <span className="text-text-secondary">No credit card • 100% free forever</span>
          </div>
        </div>

        {/* Technical Specifications */}
        <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-text-muted animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-dark-card/30 border border-primary/20">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span>AES-256-GCM</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-dark-card/30 border border-primary/20">
            <div className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span>On-Premise Deployment</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-dark-card/30 border border-primary/20">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span>Multi-Model Support</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-dark-card/30 border border-primary/20">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span>Open Source (MIT)</span>
          </div>
        </div>

        {/* Clinical Terminal Demo */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="bg-dark-card/50 backdrop-blur-sm border border-primary/20 rounded-xl p-6 shadow-2xl shadow-primary/5 animate-slide-up" style={{ animationDelay: '0.6s' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-glow" />
                <span className="text-sm text-text-secondary font-medium tracking-wide">System Log</span>
              </div>
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-primary/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-accent/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-amoeba/50" />
              </div>
            </div>
            <div className="font-mono text-sm space-y-2 text-left">
              <div className="text-primary flex items-center gap-2">
                <span className="text-text-muted">[14:32:18]</span>
                <span>INIT: Content generation pipeline</span>
              </div>
              <div className="text-text-secondary flex items-center gap-2">
                <span className="text-text-muted">[14:32:19]</span>
                <span>LOAD: Template "Clinical Research Report"</span>
              </div>
              <div className="text-text-secondary flex items-center gap-2">
                <span className="text-text-muted">[14:32:20]</span>
                <span>CONN: OpenAI GPT-4 (secure)</span>
              </div>
              <div className="text-text-secondary flex items-center gap-2">
                <span className="text-text-muted">[14:32:22]</span>
                <span>PROC: Generating content...</span>
              </div>
              <div className="text-primary flex items-center gap-2">
                <span className="text-text-muted">[14:32:24]</span>
                <span>DONE: 2.4s | 1,234 tokens | $0.0037</span>
              </div>
              <div className="text-accent flex items-center gap-2">
                <span className="text-text-muted">[14:32:25]</span>
                <span>SENT: Encrypted delivery to 50 endpoints</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator - microscope focus adjustment */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-float">
        <div className="w-8 h-12 border border-primary/30 rounded-full flex justify-center backdrop-blur-sm bg-dark-card/20">
          <div className="w-1 h-3 bg-gradient-primary rounded-full mt-2 animate-glow" />
        </div>
      </div>
    </section>
  );
}

