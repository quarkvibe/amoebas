'use client';

import { useState, useEffect } from 'react';
import { ArrowRight, X } from 'lucide-react';
import Link from 'next/link';

export default function StickyHeader() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky header after scrolling 800px
      setIsVisible(window.scrollY > 800);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isDismissed || !isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 animate-slide-down">
      <div className="bg-gradient-to-r from-dark-card via-dark to-dark-card border-b-2 border-primary/30 backdrop-blur-lg shadow-2xl shadow-primary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Message */}
            <div className="flex items-center gap-4 flex-1">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/20 border border-accent/40">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span className="text-xs font-semibold text-accent">LIMITED TIME</span>
              </div>
              <p className="text-sm md:text-base text-text-primary font-medium">
                <span className="hidden sm:inline">💰 </span>
                <span className="font-bold text-primary">Save $7,008/year</span>
                <span className="hidden md:inline"> by switching from SaaS to Amoeba</span>
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3">
              <Link href="https://github.com/quarkvibe/ameoba_v2.0">
                <button className="group px-4 md:px-6 py-2 bg-gradient-primary text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-primary/30 transition-all text-sm md:text-base flex items-center gap-2">
                  <span className="hidden sm:inline">Deploy Free</span>
                  <span className="sm:hidden">Get Started</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              
              <button
                onClick={() => setIsDismissed(true)}
                className="p-2 hover:bg-dark-darker/50 rounded-lg transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4 text-text-muted" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Urgency ticker */}
      <div className="bg-primary/10 border-b border-primary/20 overflow-hidden">
        <div className="animate-scroll whitespace-nowrap py-1">
          <span className="inline-block text-xs text-primary font-medium px-8">
            🔥 Sarah C. just saved $9,864/year
          </span>
          <span className="inline-block text-xs text-primary font-medium px-8">
            ⚡ 1,247 deployments this month
          </span>
          <span className="inline-block text-xs text-primary font-medium px-8">
            💰 Average ROI: 96.7% cost reduction
          </span>
          <span className="inline-block text-xs text-primary font-medium px-8">
            🚀 Setup time: 4.2 minutes average
          </span>
          <span className="inline-block text-xs text-primary font-medium px-8">
            🔥 Sarah C. just saved $9,864/year
          </span>
          <span className="inline-block text-xs text-primary font-medium px-8">
            ⚡ 1,247 deployments this month
          </span>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
      `}</style>
    </div>
  );
}

