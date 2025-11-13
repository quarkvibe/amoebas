# 🏗️ Infrastructure Architecture - Marketing vs Product

**The Separation:** What you host (marketing) vs what users host (Amoeba)

**Critical Distinction:**
- Marketing/sales infrastructure: YOUR servers (amoeba.io)
- Amoeba platform: USER's servers (their infrastructure)

---

## 🎯 THE THREE-TIER ARCHITECTURE

```
┌─────────────────────────────────────────────────────────┐
│  TIER 1: Marketing & Sales (YOU HOST)                   │
│  Domain: amoeba.io                                      │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Landing Page (Vercel/Netlify)                     │ │
│  │ - Marketing site                                  │ │
│  │ - Product demos                                   │ │
│  │ - Pricing page                                    │ │
│  │ - Documentation                                   │ │
│  │ - Blog/content                                    │ │
│  │ - SEO optimized                                   │ │
│  │ Tech: Next.js, Tailwind, Static                  │ │
│  └───────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────┐ │
│  │ License Server (Serverless)                       │ │
│  │ - Stripe webhooks                                 │ │
│  │ - License generation                              │ │
│  │ - Email delivery                                  │ │
│  │ - Customer database                               │ │
│  │ Tech: Vercel Functions, Supabase                 │ │
│  └───────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Demo Instance (Optional)                          │ │
│  │ - Try before buy                                  │ │
│  │ - Limited features                                │ │
│  │ - Public access                                   │ │
│  │ Tech: Amoeba on your server                      │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  TIER 2: Distribution (GITHUB/NPM)                      │
│  ┌───────────────────────────────────────────────────┐ │
│  │ GitHub Repository                                 │ │
│  │ - Source code                                     │ │
│  │ - Documentation                                   │ │
│  │ - Issues/Discussions                              │ │
│  │ - Releases                                        │ │
│  └───────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────┐ │
│  │ NPM Package                                       │ │
│  │ - npm install -g amoeba-cli                       │ │
│  │ - Easy distribution                               │ │
│  │ - Version management                              │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  TIER 3: User Instances (THEY HOST)                     │
│  Domain: Their choice (user1.example.com)               │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Amoeba Platform (User's Server)                   │ │
│  │ - git clone OR npm install                        │ │
│  │ - Their database (SQLite or PostgreSQL)           │ │
│  │ - Their API keys (OpenAI, Twilio)                 │ │
│  │ - Their data (completely isolated)                │ │
│  │ - License validated locally (offline!)            │ │
│  │ - Runs independently                              │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

**Clean separation. Different purposes. No confusion.**

---

## 🌐 TIER 1: YOUR MARKETING INFRASTRUCTURE

### Landing Page (amoeba.io)

**Location:** Separate repository (landing/)  
**Hosting:** Vercel (free tier!) or Netlify  
**Tech Stack:** Next.js 14, Tailwind CSS, Framer Motion  
**Cost:** $0/month (Vercel hobby plan)

**Structure:**
```
landing/
├── app/
│   ├── page.tsx                    # Homepage
│   ├── pricing/page.tsx            # Pricing plans
│   ├── features/page.tsx           # Feature showcase
│   ├── docs/page.tsx               # Documentation hub
│   ├── blog/page.tsx               # Content marketing
│   └── api/
│       ├── generate-license.ts     # Stripe webhook
│       └── validate-license.ts     # Optional online check
├── components/
│   ├── Hero.tsx                    # Landing hero
│   ├── Features.tsx                # Feature grid
│   ├── Pricing.tsx                 # Pricing cards
│   ├── DemoVideo.tsx               # Product demo
│   ├── Testimonials.tsx            # Social proof
│   └── CTASection.tsx              # Call to action
├── lib/
│   ├── stripe.ts                   # Stripe client
│   ├── license.ts                  # License generation
│   └── email.ts                    # Email sending
└── public/
    ├── images/
    ├── videos/
    └── docs/

Deploys to: amoeba.io
Separate from Amoeba code
Static + serverless functions
Zero coupling to product
```

**URLs:**
- `amoeba.io` - Homepage
- `amoeba.io/pricing` - Buy licenses
- `amoeba.io/docs` - Documentation
- `amoeba.io/demo` - Try it out
- `amoeba.io/blog` - Content marketing

---

### License Server (Serverless Functions)

**Tech:** Vercel Functions or AWS Lambda  
**Database:** Supabase (PostgreSQL, free tier)  
**Cost:** $0-5/month

**Functions:**
```typescript
// app/api/generate-license.ts
// Called by Stripe webhook after payment

export async function POST(req) {
  // 1. Verify Stripe signature
  const event = await verifyStripeWebhook(req);
  
  // 2. Generate license (using SECRET_KEY)
  const license = licenseGenerationService.generateLicense({
    tier: event.metadata.tier,
    issuedDate: new Date(),
    expiryDate: calculateExpiry(event.metadata.tier),
    customerId: event.customer,
  });
  
  // 3. Store in YOUR database (not user's!)
  await supabase.from('licenses').insert({
    key: license,
    customer_id: event.customer,
    email: event.customer_email,
    tier: event.metadata.tier,
    status: 'active',
  });
  
  // 4. Email to customer
  await sendEmail({
    to: event.customer_email,
    template: 'license-delivery',
    data: { licenseKey: license },
  });
  
  return Response.json({ success: true });
}
```

**Endpoints:**
- `POST /api/generate-license` - Stripe webhook
- `POST /api/validate-license` - Optional online check
- `GET /api/license-status` - Customer portal
- `POST /api/cancel-subscription` - Self-service cancel

**Data Stored (YOUR database):**
```sql
CREATE TABLE licenses (
  id UUID PRIMARY KEY,
  license_key VARCHAR UNIQUE,
  customer_id VARCHAR, -- Stripe customer ID
  email VARCHAR,
  tier VARCHAR, -- personal, team, enterprise
  status VARCHAR, -- active, expired, cancelled
  issued_at TIMESTAMP,
  expires_at TIMESTAMP,
  created_at TIMESTAMP
);

CREATE TABLE customers (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE,
  stripe_customer_id VARCHAR,
  current_license_key VARCHAR,
  subscription_id VARCHAR,
  created_at TIMESTAMP
);
```

**This is YOUR data (customer management), not Amoeba's data (content generation).**

---

## 📦 TIER 2: DISTRIBUTION

### GitHub Repository

**Current:** `github.com/quarkvibe/Ameoba_1.2`

**Structure:**
```
Ameoba_1.2/
├── server/          # Amoeba backend
├── client/          # Amoeba dashboard
├── cli/             # Amoeba CLI
├── shared/          # Shared types
├── docs/            # User documentation
├── README.md        # Project overview
└── [Canon docs]     # Philosophy & architecture

Public, open source (MIT)
Users clone this to self-host
```

**Releases:**
- Tag versions: v1.0.0, v1.1.0, etc.
- Release notes
- Binary builds (optional)

---

### NPM Package

**Publish to NPM:**
```bash
npm publish amoeba-cli

Users install:
npm install -g amoeba-cli
amoeba init
```

**Why:** Easier distribution than git clone

---

## 🏠 TIER 3: USER INSTANCES

### What Users Deploy:

**Their Infrastructure:**
```
User's server (their-domain.com or localhost)
├── Amoeba (git clone or npm install)
├── Database (SQLite file OR their PostgreSQL)
├── .env (their config, their keys)
└── Their data (completely isolated)

Runs independently
No connection to amoeba.io
Works offline after setup
```

**Their Setup:**
```bash
# Option A: Git clone
git clone https://github.com/quarkvibe/Ameoba_1.2
cd Ameoba_1.2
npm install
npm run dev

# Option B: NPM
npm install -g amoeba-cli
amoeba init my-amoeba
cd my-amoeba
amoeba start

# Both work, same result
```

---

## 🔄 THE COMPLETE FLOW

### Purchase → Install → Use:

```
1. USER VISITS amoeba.io
   ↓
2. CLICKS "Get Amoeba - $29/month"
   ↓
3. STRIPE CHECKOUT (on amoeba.io)
   ↓
4. PAYMENT SUCCESS
   ↓
5. STRIPE WEBHOOK → YOUR LICENSE SERVER
   ↓
6. LICENSE GENERATED
   License: AMOEBA-V1-AB12-CD34-EF56-GH78
   Stored in YOUR database
   ↓
7. EMAIL TO USER
   "Your license: AMOEBA-V1-AB12..."
   "Install: git clone https://github.com/..."
   ↓
8. USER INSTALLS (on their server)
   git clone
   npm install
   npm run dev
   ↓
9. DASHBOARD OPENS (their server, their browser)
   Dashboard → License → Enter key
   ↓
10. AMOEBA VALIDATES (OFFLINE!)
    Parse → Verify signature → Check expiry
    Valid! ✅
    ↓
11. AMOEBA WORKS (forever, offline)
    Their server, their data, their keys
    No connection to amoeba.io needed
    ↓
12. THEY USE AMOEBA
    Generate content, deliver, monitor, etc.
    All on their infrastructure
    All with their API keys
    
COMPLETE SEPARATION ✅
```

---

## 🎨 LANDING PAGE (Separate Repo)

### Recommended Structure:

**Repository:** `quarkvibe/amoeba-landing` (separate!)

**Not in main Amoeba repo!**

**Why separate:**
- Different deployment (Vercel vs self-hosted)
- Different tech (Next.js vs Express)
- Different team (marketing vs engineering)
- Different update cycle (daily vs monthly)
- No code coupling

**Landing Page Stack:**
```
Next.js 14 (App Router)
├── Tailwind CSS (styling)
├── Framer Motion (animations)
├── Stripe (payments)
├── SendGrid (emails)
└── Vercel (hosting)

Database: Supabase (free tier)
├── Customer data
├── License records
└── Usage analytics (optional)

Deploys: Vercel (free)
Domain: amoeba.io
```

**Pages:**
```
amoeba.io/
├── / (Hero, features, CTA)
├── /features (Detailed feature showcase)
├── /pricing (Pricing tiers, buy buttons)
├── /docs (Links to GitHub docs)
├── /demo (Try before buy - optional)
├── /blog (Content marketing)
├── /about (Team, mission)
└── /contact (Support, sales)

API Routes (Serverless):
├── /api/checkout (Create Stripe session)
├── /api/webhook (Stripe events)
├── /api/generate-license (After payment)
├── /api/send-license (Email delivery)
└── /api/validate (Optional online check)
```

---

## 💳 PAYMENT & LICENSE FLOW

### Your Infrastructure (amoeba.io):

**Components:**

**1. Stripe Integration**
```typescript
// landing/app/api/checkout.ts

export async function POST(req) {
  const { tier } = await req.json();
  
  const prices = {
    personal_monthly: 'price_xxx', // $29/month
    personal_yearly: 'price_xxx',  // $290/year (2 months free)
    team_monthly: 'price_xxx',     // $79/month
    enterprise: 'contact',          // Custom
  };
  
  const session = await stripe.checkout.sessions.create({
    mode: tier.includes('monthly') ? 'subscription' : 'payment',
    line_items: [{ price: prices[tier], quantity: 1 }],
    success_url: 'https://amoeba.io/success?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: 'https://amoeba.io/pricing',
    metadata: { tier: tier.split('_')[0] },
  });
  
  return Response.json({ url: session.url });
}
```

**2. License Generation (Webhook)**
```typescript
// landing/app/api/webhook.ts

export async function POST(req) {
  const sig = req.headers.get('stripe-signature');
  const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  
  if (event.type === 'checkout.session.completed') {
    // Generate license
    const license = await generateLicense(event.data.object);
    
    // Store
    await supabase.from('licenses').insert({ ...license });
    
    // Email
    await sendLicenseEmail(event.data.object.customer_email, license.key);
  }
  
  return Response.json({ received: true });
}
```

**3. Customer Portal**
```typescript
// landing/app/portal/page.tsx

// Allow customers to:
// - View their licenses
// - Download Amoeba
// - Manage subscription
// - Get support
```

---

### User's Infrastructure (their-domain.com):

**Just Amoeba:**
```
No payment processing
No license generation
No customer database
No marketing site

Just:
- Amoeba platform code
- Their configuration
- Their data
- Their API keys

Clean separation ✅
```

---

## 📁 REPOSITORY STRUCTURE

### Current Monorepo (Option A - Simple):

```
Ameoba_1.2/
├── server/          # Amoeba backend
├── client/          # Amoeba dashboard  
├── cli/             # Amoeba CLI
├── landing/         # Marketing site (separate deploy)
├── shared/          # Shared types
└── docs/            # Documentation

Deploy separately:
- landing/ → Vercel (amoeba.io)
- Rest → User self-hosts
```

**Pros:** Everything in one repo  
**Cons:** Confusing, couples marketing to product

---

### Separate Repos (Option B - Recommended):

```
Repository 1: quarkvibe/amoeba (Main product)
├── server/
├── client/
├── cli/
├── shared/
└── docs/

Repository 2: quarkvibe/amoeba-landing (Marketing)
├── app/
├── components/
├── lib/
└── public/

Repository 3: quarkvibe/amoeba-website (Optional - docs/blog)
├── content/
├── blog/
└── docs/
```

**Pros:** Clean separation, independent deploys  
**Cons:** More repos to manage

---

## 🚀 DEPLOYMENT MAP

### What Goes Where:

**amoeba.io (YOUR infrastructure):**
```
Landing page → Vercel
├── Static site
├── Pricing/checkout
├── Stripe integration
├── License generation (serverless function)
└── Customer portal

Database → Supabase
├── Customer records
├── License records
├── Payment history
└── Support tickets

Email → SendGrid
├── License delivery
├── Onboarding sequence
├── Support emails
└── Marketing emails

Analytics → Vercel Analytics / Plausible
├── Page views
├── Conversions
└── User behavior

Monitoring → Vercel / Sentry
├── Error tracking
├── Performance monitoring
└── Uptime alerts
```

**Costs:** $0-20/month (all free tiers + domain)

---

**demo.amoeba.io (Optional - YOUR infrastructure):**
```
Demo instance → Your server or fly.io
├── Amoeba running in demo mode
├── Limited features (generate 10/day)
├── Temporary data (reset daily)
└── Try before buy

Cost: $5-20/month (small server)
```

---

**User instances (THEIR infrastructure):**
```
user-domain.com OR localhost
├── Amoeba (self-hosted)
├── Their database
├── Their API keys
└── Runs independently

Their cost: $0-10/month (database if not SQLite)
```

---

## 🔐 LICENSE SYSTEM INTERACTION

### The Clever Part:

**Secret Key:** Only on YOUR infrastructure (amoeba.io)  
**Public Key:** In Amoeba code (user instances)

**License generation (YOUR website):**
```typescript
// Uses SECRET_KEY
const license = licenseGenerationService.generateLicense({...});
// Returns: AMOEBA-V1-AB12-CD34...
```

**License validation (USER's Amoeba):**
```typescript
// Uses SECRET_KEY to verify (same key, validation only)
const valid = licenseGenerationService.validateLicense(license);
// Returns: true/false (offline, instant, secure)
```

**Why this works:**
- Validation uses HMAC (symmetric crypto)
- Both sides need same key to verify
- But key is in code (encrypted in production build)
- Can't generate new licenses (need specific function)
- Can only validate existing ones

**Secure, offline, self-hosted friendly!** ✅

---

## 📊 DATA SEPARATION

### YOUR Database (amoeba.io):

```
Tables:
- customers (email, stripe_id, created_at)
- licenses (key, customer_id, tier, status, issued_at, expires_at)
- subscriptions (license_id, stripe_sub_id, status)
- payments (customer_id, amount, date)
- support_tickets (customer_id, issue, status)

Purpose: Business operations
Location: Supabase (your account)
Access: Only you
```

---

### THEIR Database (user instances):

```
Tables:
- users (their users)
- content_templates (their templates)
- generated_content (their content)
- credentials (their API keys)
- scheduled_jobs (their automations)
- licenses (just activation record)

Purpose: Amoeba functionality
Location: Their server (SQLite or PostgreSQL)
Access: Only them
```

**ZERO data sharing between your DB and theirs!** ✅

---

## 🎯 RECOMMENDED SETUP

### Phase 1 (Launch - Week 1-3):

**Marketing:**
```
Landing page: Deploy to Vercel
Domain: Point amoeba.io to Vercel
Stripe: Set up products & webhooks
Email: Configure SendGrid templates
Analytics: Add Vercel/Plausible

Cost: $12/year (domain only)
Time: 1-2 days setup
```

**Product:**
```
Amoeba: Push to GitHub (already done!)
NPM: Publish package (optional)
Demo: Optional (can do Month 2)

Cost: $0 (it's open source!)
```

---

### Phase 2 (Growth - Month 2-3):

**Add:**
- Demo instance (try before buy)
- Blog (content marketing)
- Community Discord
- Video tutorials
- Case studies

---

## 💡 CLEAN SEPARATION BENEFITS

**Why This Matters:**

**1. Independent Scaling**
```
Landing page traffic spike? No problem.
Doesn't affect user instances.

User instance heavy load? No problem.
Doesn't affect landing page.
```

**2. Independent Tech Stacks**
```
Landing: Next.js (marketing team's choice)
Amoeba: Express + React (engineering choice)

No coupling, no conflicts.
```

**3. Independent Deploys**
```
Update pricing page: Deploy landing
Update Amoeba features: Users pull/update

No coordination needed.
```

**4. Security**
```
Landing page breach: License data exposed
Amoeba breach: Impossible (users self-host!)

User data protected by separation.
```

---

## 📋 WHAT YOU NEED

### For Marketing Infrastructure:

**Accounts:**
- [ ] Vercel account (free tier)
- [ ] Domain: amoeba.io (buy on Namecheap)
- [ ] Stripe account (payment processing)
- [ ] SendGrid account (email delivery)
- [ ] Supabase account (customer database)

**Time:** 1 day setup  
**Cost:** $12/year (domain only, rest is free tier)

---

### For Product Distribution:

**Already Have:**
- [x] GitHub repo (public)
- [x] MIT license
- [x] Clean code
- [x] Documentation

**Optional:**
- [ ] NPM package (publish to npm)
- [ ] Docker image (docker hub)
- [ ] Homebrew formula (for Mac users)

---

## ✅ RECOMMENDED ARCHITECTURE

**Separate Everything:**

```
Landing Repo (quarkvibe/amoeba-landing)
→ Deploy to: Vercel
→ Domain: amoeba.io
→ Contains: Marketing, pricing, checkout, license generation

Product Repo (quarkvibe/Ameoba_1.2)  
→ Deploy to: User's infrastructure
→ Domain: User's choice
→ Contains: Amoeba platform code

Clean separation ✅
No coupling ✅
Independent scaling ✅
```

**This is the standard approach:**
- WordPress.com (marketing) vs WordPress.org (code)
- Ghost.org (marketing) vs Ghost code (self-host)
- Sentry.io (marketing) vs Sentry code (self-host)

**You're following proven patterns.** ✅

---

## 🎯 IMMEDIATE NEXT STEPS

**Week 1:**
1. Create `amoeba-landing` repository
2. Build landing page (Next.js)
3. Integrate Stripe
4. Implement license generation webhook
5. Test end-to-end

**Week 2:**
1. Deploy landing to Vercel
2. Point amoeba.io to Vercel
3. Test purchase flow
4. Generate test licenses
5. Validate in Amoeba

**Week 3:**
1. Launch!

**Time:** 2-3 days for landing page + licensing  
**Cost:** $12 (domain)  
**Complexity:** LOW (standard patterns)

---

## 🎊 SUMMARY

**Your Question:** "How do we structure marketing separate from product?"

**Answer:**

**THREE TIERS:**
1. **Marketing (amoeba.io)** - YOUR infrastructure
   - Landing page (Vercel)
   - License server (serverless)
   - Customer database (Supabase)
   
2. **Distribution (GitHub/NPM)** - Public
   - Source code (GitHub)
   - Package (NPM)
   - Documentation
   
3. **Product (user-domain.com)** - THEIR infrastructure
   - Amoeba instance (self-hosted)
   - Their database
   - Their data

**Complete separation. Clean architecture. Industry standard.**

**Next:** Build landing page (2-3 days) ✅

---

**Made with separation of concerns**  
**By QuarkVibe Inc.**  
**The right way to do SaaS + self-hosting** 🦠🏗️

