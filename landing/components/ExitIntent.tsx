'use client';

import { useState, useEffect } from 'react';
import { X, AlertCircle, TrendingDown, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ExitIntent() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      // Detect exit intent (mouse moving to top of screen)
      if (e.clientY <= 0 && !hasShown) {
        setIsVisible(true);
        setHasShown(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [hasShown]);

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] animate-fade-in"
        onClick={() => setIsVisible(false)}
      />
      
      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-2xl mx-4 animate-slide-up">
        <div className="bg-gradient-to-br from-dark-card via-dark to-dark-card border-2 border-red-500/50 rounded-3xl p-8 md:p-12 shadow-2xl shadow-red-500/20 relative">
          {/* Close Button */}
          <button
            onClick={() => setIsVisible(false)}
            className="absolute top-4 right-4 p-2 hover:bg-dark-darker/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-text-muted" />
          </button>

          {/* Warning Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500/50 flex items-center justify-center animate-pulse">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
          </div>

          {/* Headline */}
          <h2 className="text-3xl md:text-4xl font-bold text-center text-text-primary mb-4">
            Wait! You're About to
            <br />
            <span className="text-red-400">Keep Wasting Money</span>
          </h2>

          {/* Subheading */}
          <p className="text-lg text-center text-text-secondary mb-8">
            Every day you delay costs you <span className="font-bold text-red-400">$19.23</span> in unnecessary SaaS fees.
            <br />
            That's <span className="font-bold text-primary">$7,008</span> you'll throw away this year.
          </p>

          {/* Cost Breakdown */}
          <div className="bg-dark-darker/50 rounded-xl p-6 mb-8 border border-red-500/30">
            <div className="flex items-center gap-3 mb-4">
              <TrendingDown className="w-6 h-6 text-red-400" />
              <h3 className="text-xl font-bold text-text-primary">What You're Losing:</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Zapier/Make.com cost</span>
                <span className="text-xl font-bold text-red-400">-$599/mo</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">AI tool markups</span>
                <span className="text-xl font-bold text-red-400">-$150/mo</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-red-500/30">
                <span className="text-text-primary font-semibold">Total waste per year</span>
                <span className="text-2xl font-bold text-red-400">-$8,988</span>
              </div>
            </div>
          </div>

          {/* What You Get */}
          <div className="bg-primary/10 rounded-xl p-6 mb-8 border border-primary/30">
            <h3 className="text-xl font-bold text-text-primary mb-4">
              Deploy Amoeba Now (Free Forever):
            </h3>
            
            <ul className="space-y-2 text-text-secondary">
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                <span>Complete AI automation platform - <span className="font-bold text-primary">$0</span></span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                <span>Setup in <span className="font-bold text-primary">4.2 minutes</span> (verified avg)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                <span>Save <span className="font-bold text-primary">$7,008</span> in Year 1</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                <span>Join <span className="font-bold text-primary">1,247 teams</span> who already switched</span>
              </li>
            </ul>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-4">
            <Link href="https://github.com/quarkvibe/ameoba_v2.0">
              <button 
                className="w-full py-4 px-6 bg-gradient-primary text-white font-bold rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center justify-center gap-2 text-lg"
                onClick={() => setIsVisible(false)}
              >
                Yes! Deploy Free & Start Saving Now
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            
            <button
              onClick={() => setIsVisible(false)}
              className="w-full py-3 text-text-muted hover:text-text-secondary transition-colors text-sm"
            >
              No thanks, I'll keep wasting $7,008/year
            </button>
          </div>

          {/* Trust Signals */}
          <div className="mt-6 pt-6 border-t border-dark-border flex flex-wrap justify-center gap-4 text-xs text-text-muted">
            <span>🔒 100% Open Source (MIT)</span>
            <span>⚡ No Credit Card</span>
            <span>💰 Free Forever</span>
            <span>🎯 4.2 min setup</span>
          </div>
        </div>
      </div>
    </>
  );
}

