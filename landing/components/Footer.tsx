import Link from 'next/link';
import { Github, Twitter, MessageCircle, ArrowRight, Shield, Zap, DollarSign } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-dark-darker border-t border-dark-border">
      {/* Final CTA Section */}
      <div className="border-b border-dark-border bg-gradient-to-b from-dark to-dark-darker">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 border border-primary/30 mb-6">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm text-primary font-medium tracking-wide">LAST CHANCE TO SAVE</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
            Don't Leave Without Your
            <br />
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              $7,008 Savings
            </span>
          </h2>
          
          <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-8">
            1,247 teams deployed Amoeba this month. Join them and stop wasting money on SaaS subscriptions.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link href="https://github.com/quarkvibe/ameoba_v2.0">
              <button className="group px-8 py-4 bg-gradient-primary text-white font-bold rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center gap-2">
                🚀 Deploy Free in 5 Minutes
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <Link href="/pricing">
              <button className="px-8 py-4 border-2 border-primary/30 text-text-primary font-semibold rounded-xl hover:border-primary/50 transition-all">
                View All Plans
              </button>
            </Link>
          </div>
          
          {/* Trust Signals */}
          <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-text-muted">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span>100% open source (MIT)</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" />
              <span>14-day money-back guarantee</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Product */}
          <div>
            <h3 className="text-text-primary font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/#features" className="text-text-muted hover:text-text-primary transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-text-muted hover:text-text-primary transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/docs" className="text-text-muted hover:text-text-primary transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="https://github.com/yourusername/Ameoba" className="text-text-muted hover:text-text-primary transition-colors">
                  Changelog
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-text-primary font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/docs/getting-started" className="text-text-muted hover:text-text-primary transition-colors">
                  Getting Started
                </Link>
              </li>
              <li>
                <Link href="/docs/api-reference" className="text-text-muted hover:text-text-primary transition-colors">
                  API Reference
                </Link>
              </li>
              <li>
                <Link href="https://github.com/yourusername/Ameoba" className="text-text-muted hover:text-text-primary transition-colors">
                  GitHub
                </Link>
              </li>
              <li>
                <Link href="/docs/faq" className="text-text-muted hover:text-text-primary transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-text-primary font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-text-muted hover:text-text-primary transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-text-muted hover:text-text-primary transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="mailto:hello@ameoba.org" className="text-text-muted hover:text-text-primary transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-text-primary font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-text-muted hover:text-text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-text-muted hover:text-text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/refund" className="text-text-muted hover:text-text-primary transition-colors">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-dark-border flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🦕</span>
            <span className="text-text-primary font-semibold">AMOEBA</span>
            <span className="text-text-muted">© 2025</span>
          </div>

          <div className="text-center md:text-left">
            <p className="text-text-muted text-sm">
              Built with ❤️ by developers, for developers
            </p>
            <p className="text-text-muted text-xs mt-1">
              Trusted by 1,247+ teams • $7M+ saved collectively
            </p>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://twitter.com/ameobadev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-muted hover:text-text-primary transition-colors"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a
              href="https://github.com/yourusername/Ameoba"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-muted hover:text-text-primary transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="https://discord.gg/ameoba"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-muted hover:text-text-primary transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}




