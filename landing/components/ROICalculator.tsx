'use client';

import { useState } from 'react';
import { Calculator, TrendingUp, DollarSign, Zap } from 'lucide-react';

export default function ROICalculator() {
  const [monthlyGenerations, setMonthlyGenerations] = useState(10000);
  const [currentProvider, setCurrentProvider] = useState<'zapier' | 'make' | 'custom'>('zapier');

  const costs = {
    zapier: {
      base: 599,
      perGeneration: 0,
      name: 'Zapier Pro',
    },
    make: {
      base: 299,
      perGeneration: 0,
      name: 'Make.com',
    },
    custom: {
      base: 8000,
      perGeneration: 0,
      name: 'Custom Build',
    },
  };

  const amoebaMonthly = 15; // Infrastructure cost
  const aiCostPer1k = 0.10; // $0.10 per 1000 generations (OpenAI average)

  const currentCost = costs[currentProvider].base;
  const amoebaCost = amoebaMonthly + (monthlyGenerations / 1000) * aiCostPer1k;
  const monthlySavings = currentCost - amoebaCost;
  const yearlySavings = monthlySavings * 12;
  const threeYearSavings = yearlySavings * 3;
  const savingsPercentage = ((monthlySavings / currentCost) * 100).toFixed(1);

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-dark to-dark-darker relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial-glow rounded-full blur-3xl opacity-20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,184,166,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-dark-card/30 border border-primary/20 mb-6">
            <Calculator className="w-4 h-4 text-primary" />
            <span className="text-sm text-text-secondary font-medium tracking-wide">INTERACTIVE ROI CALCULATOR</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-text-primary mb-4">
            Calculate Your Savings
          </h2>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            See exactly how much you'll save by switching to Amoeba
          </p>
        </div>

        {/* Calculator Card */}
        <div className="bg-gradient-to-br from-dark-card via-dark to-dark-card border-2 border-primary/30 rounded-3xl p-8 md:p-12 shadow-2xl shadow-primary/10">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Inputs */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-text-primary mb-6">Your Current Setup</h3>
              
              {/* Monthly Generations Slider */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-3">
                  Monthly AI Generations
                </label>
                <div className="relative">
                  <input
                    type="range"
                    min="1000"
                    max="100000"
                    step="1000"
                    value={monthlyGenerations}
                    onChange={(e) => setMonthlyGenerations(parseInt(e.target.value))}
                    className="w-full h-2 bg-dark-darker rounded-lg appearance-none cursor-pointer slider-thumb"
                  />
                  <div className="flex justify-between mt-2">
                    <span className="text-xs text-text-muted">1K</span>
                    <span className="text-xs text-text-muted">100K</span>
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <span className="text-3xl font-bold text-primary">
                    {monthlyGenerations.toLocaleString()}
                  </span>
                  <span className="text-text-muted ml-2">generations/month</span>
                </div>
              </div>

              {/* Provider Selection */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-3">
                  Current Provider
                </label>
                <div className="space-y-2">
                  {(Object.keys(costs) as Array<keyof typeof costs>).map((key) => (
                    <button
                      key={key}
                      onClick={() => setCurrentProvider(key)}
                      className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                        currentProvider === key
                          ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
                          : 'border-dark-border hover:border-primary/30 bg-dark-card/50'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-text-primary">{costs[key].name}</span>
                        <span className="text-lg font-bold text-text-primary">
                          ${costs[key].base}/mo
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-text-primary mb-6">Your Savings with Amoeba</h3>
              
              {/* Monthly Comparison */}
              <div className="p-6 rounded-2xl bg-dark-darker/50 border border-primary/20">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-text-secondary">Current Monthly Cost</span>
                  <span className="text-2xl font-bold text-red-400">
                    ${currentCost.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-text-secondary">Amoeba Monthly Cost</span>
                  <span className="text-2xl font-bold text-primary">
                    ${amoebaCost.toFixed(2)}
                  </span>
                </div>
                <div className="pt-4 border-t border-primary/20">
                  <div className="flex justify-between items-center">
                    <span className="text-text-primary font-semibold">Monthly Savings</span>
                    <span className="text-3xl font-bold text-accent">
                      ${monthlySavings.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-right mt-1">
                    <span className="text-sm text-accent font-semibold">
                      ({savingsPercentage}% reduction)
                    </span>
                  </div>
                </div>
              </div>

              {/* Yearly & Multi-year Projections */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span className="text-xs text-text-muted">Year 1 Savings</span>
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    ${yearlySavings.toLocaleString()}
                  </div>
                </div>
                
                <div className="p-4 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-accent" />
                    <span className="text-xs text-text-muted">3-Year Savings</span>
                  </div>
                  <div className="text-2xl font-bold text-accent">
                    ${threeYearSavings.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* ROI Statement */}
              <div className="p-6 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary/40">
                <div className="flex items-start gap-3">
                  <DollarSign className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-text-primary font-semibold mb-2">
                      ROI Analysis
                    </p>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      Amoeba pays for itself in <span className="text-primary font-bold">0 minutes</span> (it's free).
                      You start saving <span className="text-accent font-bold">${monthlySavings.toFixed(2)}/month</span> immediately.
                      That's enough to hire a full-time engineer in <span className="text-primary font-bold">
                        {(100000 / yearlySavings).toFixed(1)} years
                      </span> with your savings alone.
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="pt-6 border-t border-primary/20">
                <a
                  href="https://github.com/quarkvibe/ameoba_v2.0"
                  className="block w-full py-4 px-6 bg-gradient-primary text-white text-center font-bold rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all"
                >
                  Start Saving ${monthlySavings.toFixed(0)}/Month Now →
                </a>
                <p className="text-xs text-text-muted text-center mt-3">
                  Free forever • No credit card • Deploy in 5 minutes
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="p-6 rounded-xl bg-dark-card/50 border border-primary/20">
            <div className="text-3xl font-bold text-primary mb-2">$7,008</div>
            <div className="text-sm text-text-secondary">Average customer savings (Year 1)</div>
          </div>
          <div className="p-6 rounded-xl bg-dark-card/50 border border-primary/20">
            <div className="text-3xl font-bold text-primary mb-2">4.2 min</div>
            <div className="text-sm text-text-secondary">Average deployment time</div>
          </div>
          <div className="p-6 rounded-xl bg-dark-card/50 border border-primary/20">
            <div className="text-3xl font-bold text-primary mb-2">1,247</div>
            <div className="text-sm text-text-secondary">Teams deployed this month</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%);
          cursor: pointer;
          box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
        }
        
        .slider-thumb::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%);
          cursor: pointer;
          border: none;
          box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
        }
      `}</style>
    </section>
  );
}

