# 🚀 Amoeba v2.0 - Monetization Implementation Plan

**Model**: Hybrid Freemium  
**Target**: $50K Year 1, $200K Year 2  
**Status**: Implementation in progress

---

## 📋 IMPLEMENTATION CHECKLIST

### Phase 1: Stripe Setup
- [ ] Create Stripe products
- [ ] Create pricing tiers
- [ ] Set up subscription billing
- [ ] Configure webhooks
- [ ] Test checkout flow

### Phase 2: Landing Page Updates
- [ ] Update pricing page with new tiers
- [ ] Create feature comparison table
- [ ] Add subscription checkout flow
- [ ] Update copy to match new model
- [ ] Add FAQ section

### Phase 3: Main Platform Updates
- [ ] Add subscription check middleware
- [ ] Add tier-based feature gating
- [ ] Add "Upgrade" CTAs in dashboard
- [ ] Add subscription management UI
- [ ] Update user schema for subscriptions

### Phase 4: Documentation Updates
- [ ] Update README with new pricing
- [ ] Update all references to pricing
- [ ] Create setup guide for subscriptions
- [ ] Document Stripe integration

### Phase 5: Testing
- [ ] Test free tier flow
- [ ] Test paid tier upgrades
- [ ] Test subscription management
- [ ] Test Stripe webhooks
- [ ] End-to-end verification

---

## 💰 PRICING STRUCTURE (Final)

### Self-Hosted Tiers

**Free (Open Source)**
- Price: $0
- Features: Full platform, all features
- Support: Community (GitHub, Discord)
- Limitations: None
- License: MIT (can use commercially)

**Pro ($29/month)**
- Price: $29/month or $290/year (save $58)
- Features: Everything in Free +
  - Priority email support (24-hour response)
  - Early access to new features
  - Private Discord channel
  - Influence on roadmap
- Target: Solo developers, content teams

**Business ($99/month)**
- Price: $99/month or $990/year (save $198)
- Features: Everything in Pro +
  - White-label (remove Amoeba branding)
  - Multi-instance support
  - SLA (4-hour response time)
  - Priority bug fixes
  - Quarterly roadmap calls
- Target: Agencies, serious businesses

**Enterprise (Custom)**
- Price: $500-2000/month (negotiated)
- Features: Everything in Business +
  - Dedicated support engineer
  - Custom feature development
  - Training & onboarding
  - Legal agreements
  - Priority everything
- Target: Large enterprises, special needs

### Managed Hosting (Optional - Launch Later)

**Lite ($49/month)**
- We host, you use
- 10K generations/month
- Email support
- 99% uptime

**Standard ($129/month)**
- 50K generations/month
- Priority support
- 99.5% uptime

**Pro ($299/month)**
- Unlimited generations
- SLA support
- 99.9% uptime

---

## 🛍️ STRIPE PRODUCTS TO CREATE

### Product 1: Amoeba Pro (Monthly)
```
Product Name: Amoeba Pro (Monthly)
Description: Priority support, early access, private Discord
Price: $29 USD / month
Billing: Recurring monthly
Features:
- Priority email support
- Early access to features
- Private Discord access
- Roadmap influence
```

### Product 2: Amoeba Pro (Yearly)
```
Product Name: Amoeba Pro (Yearly)
Description: Priority support, early access, private Discord - Save $58/year
Price: $290 USD / year
Billing: Recurring yearly
Features: Same as monthly
```

### Product 3: Amoeba Business (Monthly)
```
Product Name: Amoeba Business (Monthly)
Description: White-label, SLA, multi-instance support
Price: $99 USD / month
Billing: Recurring monthly
Features:
- Everything in Pro
- White-label ready
- SLA (4-hour response)
- Multi-instance support
- Priority development
```

### Product 4: Amoeba Business (Yearly)
```
Product Name: Amoeba Business (Yearly)
Description: White-label, SLA, multi-instance - Save $198/year
Price: $990 USD / year
Billing: Recurring yearly
Features: Same as monthly
```

### Product 5: One-Time Setup Service
```
Product Name: Amoeba Setup Service
Description: We set up Amoeba for you (one-time service)
Price: $499 USD
Billing: One-time
Features:
- Server setup
- Database configuration
- SSL/domain setup
- Initial template creation
- 1-hour training session
```

---

## 🔑 STRIPE API KEYS NEEDED

### Development (Test Mode)
```
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...
```

### Production (Live Mode)
```
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_live_...
```

### Stripe Price IDs (Create in Stripe Dashboard)
After creating products, note these IDs:
```
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_PRO_YEARLY=price_...
STRIPE_PRICE_BUSINESS_MONTHLY=price_...
STRIPE_PRICE_BUSINESS_YEARLY=price_...
STRIPE_PRICE_SETUP_SERVICE=price_...
```

---

## 🎨 LANDING PAGE CHANGES

### Update: `/landing/app/pricing/page.tsx`

**New Structure**:
```tsx
Three cards side-by-side:

┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│     FREE     │  │     PRO      │  │   BUSINESS   │
│              │  │              │  │              │
│     $0       │  │  $29/month   │  │  $99/month   │
│              │  │              │  │              │
│ • Full       │  │ • Everything │  │ • Everything │
│   platform   │  │   in Free    │  │   in Pro     │
│ • Self-host  │  │ • Priority   │  │ • White-     │
│ • Community  │  │   support    │  │   label      │
│   support    │  │ • Early      │  │ • SLA        │
│              │  │   access     │  │ • Multi-     │
│              │  │ • Discord    │  │   instance   │
│              │  │              │  │              │
│ [Download]   │  │ [Subscribe]  │  │ [Subscribe]  │
└──────────────┘  └──────────────┘  └──────────────┘

Plus: "Enterprise - Custom pricing" link
```

### Update: `/landing/app/page.tsx` (Homepage)

**Hero Section**:
```
Headline: "AI Content Platform You Actually Own"
Subheadline: "Generate with AI, deliver anywhere, control from your phone. 
              Free to self-host, paid support available."
CTA: "Start Free" → GitHub
CTA: "See Pricing" → /pricing
```

**Pricing Teaser**:
```
"Start free. Upgrade when ready."

Free              Pro $29/mo       Business $99/mo
Self-host         + Support        + White-label
All features      + Early access   + SLA
```

---

## 🦠 MAIN PLATFORM CHANGES

### 1. Update User Schema (Add Subscription)

**File**: `shared/schema.ts`

Add to `users` table:
```typescript
subscriptionTier: varchar("subscription_tier").default('free'), 
  // 'free', 'pro', 'business', 'enterprise'
subscriptionStatus: varchar("subscription_status").default('active'),
  // 'active', 'canceled', 'past_due', 'trialing'
stripeCustomerId: varchar("stripe_customer_id"),
stripeSubscriptionId: varchar("stripe_subscription_id"),
subscriptionEndsAt: timestamp("subscription_ends_at"),
```

### 2. Add Subscription Middleware

**File**: `server/middleware/subscription.ts` (create new)

```typescript
export function requireTier(tier: 'pro' | 'business' | 'enterprise') {
  return async (req: any, res: any, next: any) => {
    const user = await storage.getUser(req.user.claims.sub);
    
    const tierLevels = { free: 0, pro: 1, business: 2, enterprise: 3 };
    const userLevel = tierLevels[user.subscriptionTier || 'free'];
    const requiredLevel = tierLevels[tier];
    
    if (userLevel < requiredLevel) {
      return res.status(403).json({
        error: 'Upgrade required',
        message: `This feature requires ${tier} tier or higher`,
        currentTier: user.subscriptionTier,
        requiredTier: tier,
        upgradeUrl: '/pricing'
      });
    }
    
    next();
  };
}
```

### 3. Add Feature Gates (Examples)

**White-label** (Business tier only):
```typescript
// In dashboard rendering
{user.subscriptionTier !== 'free' && (
  <div>Powered by Amoeba</div>
)}
```

**Priority Support** (Pro+ only):
```typescript
// In support widget
{user.subscriptionTier === 'free' ? (
  <p>Community support via GitHub</p>
) : (
  <Button>Contact Support</Button>
)}
```

### 4. Add Subscription Management UI

**New Component**: `client/src/components/dashboard/SubscriptionManager.tsx`

Features:
- Show current tier
- Show billing date
- Upgrade/downgrade buttons
- Cancel subscription
- View invoices
- Manage payment method

### 5. Update Dashboard with Upgrade CTAs

**Strategic Placements**:
- Sidebar: Tier badge with "Upgrade" link
- Settings: Billing section
- Feature limits: "Upgrade to Pro" inline messages
- Support: "Get priority support" banner

---

## 📝 LANGUAGE ALIGNMENT

### Update All Instances Of

**Old Language** → **New Language**

"$3.50 lifetime" → "Free to self-host, $29/month for support"
"One-time license" → "Free open source, optional subscriptions"
"Tree fiddy" → Remove entirely
"$29/month platform" → "$29/month Pro support"
"Self-host FREE" → "Free open source, self-hosted"

### Consistent Messaging

**Everywhere** (README, landing, docs, dashboard):

**Primary Message**:
> "Free to self-host. Upgrade for support and advanced features."

**Secondary Message**:
> "Open source AI platform. Pay only if you need priority support, white-label, or SLA."

**CTA**:
- Free users: "Start Free" → GitHub repo
- Upgrade: "Upgrade to Pro" → Stripe checkout
- Enterprise: "Contact Sales" → Email form

---

## 🎯 STRIPE IMPLEMENTATION GUIDE

### Step 1: Create Products in Stripe Dashboard

1. Go to https://dashboard.stripe.com/products
2. Click "Add product"
3. Create each product (see products list above)
4. Copy Price IDs

### Step 2: Configure Webhooks

**Webhook URL**: `https://yourdomain.com/api/webhooks/stripe`

**Events to Listen**:
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

### Step 3: Environment Variables

**Add to `.env`**:
```bash
# Stripe (get from dashboard.stripe.com)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Product Price IDs (after creating products)
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_PRO_YEARLY=price_...
STRIPE_PRICE_BUSINESS_MONTHLY=price_...
STRIPE_PRICE_BUSINESS_YEARLY=price_...
```

**Add to landing/.env.local**:
```bash
NEXT_PUBLIC_STRIPE_KEY=pk_live_...
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### Step 4: Implement Checkout Flow

**Landing page** → Stripe checkout → **Webhook** → Update user tier → **Redirect** to dashboard

---

## 📊 FEATURE GATING STRATEGY

### Free Tier (No Restrictions)
✅ All features available
✅ Unlimited usage
✅ Commercial use allowed
✅ Community support only

**Philosophy**: Free tier is genuinely good to drive adoption

### Pro Tier ($29/month)
Same features as Free, PLUS:
- ✅ Priority email support (24-hour response)
- ✅ Early access to new features (1 month early)
- ✅ Private Discord server
- ✅ Vote on roadmap
- ✅ Remove "Powered by Amoeba" footer

### Business Tier ($99/month)
Everything in Pro, PLUS:
- ✅ White-label (full branding removal)
- ✅ SLA (4-hour response time)
- ✅ Multi-instance deployment support
- ✅ Priority bug fixes
- ✅ Quarterly strategy calls
- ✅ Custom subdomain on managed hosting (if using)

### Enterprise Tier (Custom)
Everything in Business, PLUS:
- ✅ Dedicated support engineer
- ✅ Custom feature development
- ✅ On-premise deployment assistance
- ✅ Training for team
- ✅ Legal agreements (BAA, DPA, etc.)
- ✅ 99.9% SLA

**Key Point**: Features aren't restricted, SUPPORT and SERVICES are what you pay for.

---

## 🎨 UPDATED MESSAGING

### Tagline
**Old**: "The world's first AI agent platform with SMS command interface"  
**New**: "AI content platform you actually own. Free to self-host."

### Value Propositions

**For Free Users**:
"Get started in 5 minutes. Generate AI content, deliver anywhere. Free forever, self-hosted."

**For Pro Users**:
"Need help? Upgrade to Pro for priority support, early access, and direct influence on development."

**For Business Users**:
"White-label ready. Remove our branding, get SLA, run multiple instances. Built for agencies."

**For Enterprise**:
"Custom everything. Dedicated support, custom features, legal agreements. Built for scale."

### Homepage Copy (Landing Page)

**Hero**:
```
AI Content Platform You Actually Own

Generate content with AI. Deliver via email, SMS, voice, webhooks. 
Control from your phone. Free to self-host, paid support available.

[Start Free] [See Pricing]
```

**Features Section**:
```
🤖 Generate with AI
Use your own OpenAI, Anthropic, or Ollama keys. No markup, you pay direct.

📱 Control From Your Phone
Text "generate newsletter" and it happens. Only platform with SMS commands.

🔐 You Own Everything
Self-hosted on your server. Your data, your keys, your control.

📊 Quality Pipeline
Review before delivery. Auto-approval rules. Never ship bad content.
```

**Pricing Section**:
```
Start Free. Upgrade When Ready.

Free - $0
✓ Full platform
✓ Self-hosted
✓ All features
✓ Community support
[Download]

Pro - $29/month
✓ Everything in Free
✓ Priority support
✓ Early access
✓ Private Discord
[Subscribe]

Business - $99/month
✓ Everything in Pro
✓ White-label
✓ SLA (4-hour)
✓ Multi-instance
[Subscribe]
```

---

## 🔧 TECHNICAL IMPLEMENTATION

### Files to Create/Update

**New Files**:
1. `server/middleware/subscription.ts` - Tier checking
2. `server/routes/billing.ts` - Subscription management
3. `client/src/components/dashboard/SubscriptionManager.tsx` - UI
4. `client/src/components/dashboard/UpgradeCTA.tsx` - Upgrade prompts
5. `landing/app/subscribe/page.tsx` - Subscription checkout

**Update Files**:
1. `shared/schema.ts` - Add subscription fields to users
2. `landing/app/pricing/page.tsx` - New pricing tiers
3. `landing/app/page.tsx` - Updated hero/messaging
4. `landing/components/PricingPreview.tsx` - New preview
5. `README.md` - Updated pricing section
6. `server/routes/payments.ts` - Add subscription endpoints
7. `client/src/pages/dashboard.tsx` - Add subscription UI

### Database Migration

```sql
-- Add to users table
ALTER TABLE users ADD COLUMN subscription_tier VARCHAR(50) DEFAULT 'free';
ALTER TABLE users ADD COLUMN subscription_status VARCHAR(50) DEFAULT 'active';
ALTER TABLE users ADD COLUMN stripe_customer_id VARCHAR(255);
ALTER TABLE users ADD COLUMN stripe_subscription_id VARCHAR(255);
ALTER TABLE users ADD COLUMN subscription_ends_at TIMESTAMP;
```

---

## 📋 STRIPE PRODUCTS SETUP CHECKLIST

### In Stripe Dashboard (dashboard.stripe.com)

**Step 1: Create Products**
```
Products → Add Product

Product 1:
Name: Amoeba Pro (Monthly)
Description: Priority support, early access, private Discord
Price: $29 USD
Billing: Monthly
Type: Recurring
→ Save → Copy Price ID: price_xxxPRO_MONTHLY

Product 2:
Name: Amoeba Pro (Annual)
Description: Same as monthly - Save $58/year
Price: $290 USD
Billing: Yearly
Type: Recurring
→ Save → Copy Price ID: price_xxxPRO_YEARLY

Product 3:
Name: Amoeba Business (Monthly)
Description: White-label, SLA, multi-instance
Price: $99 USD
Billing: Monthly
Type: Recurring
→ Save → Copy Price ID: price_xxxBUSINESS_MONTHLY

Product 4:
Name: Amoeba Business (Annual)
Description: Same as monthly - Save $198/year
Price: $990 USD
Billing: Yearly
Type: Recurring
→ Save → Copy Price ID: price_xxxBUSINESS_YEARLY
```

**Step 2: Configure Webhooks**
```
Developers → Webhooks → Add endpoint

Endpoint URL: https://yourdomain.com/api/webhooks/stripe

Events to listen:
☑ customer.subscription.created
☑ customer.subscription.updated
☑ customer.subscription.deleted
☑ customer.subscription.trial_will_end
☑ invoice.payment_succeeded
☑ invoice.payment_failed
☑ checkout.session.completed

→ Save → Copy Signing Secret: whsec_...
```

**Step 3: Get API Keys**
```
Developers → API keys

Publishable key: pk_live_...
Secret key: sk_live_...
```

---

## 🎯 IMPLEMENTATION ORDER

### Week 1: Stripe + Schema
1. Set up Stripe products
2. Get all API keys
3. Update database schema
4. Test Stripe checkout locally

### Week 2: Landing Page
1. Update pricing page
2. Add new checkout flow
3. Update homepage copy
4. Add FAQ section
5. Deploy to Vercel

### Week 3: Main Platform
1. Add subscription middleware
2. Add subscription management UI
3. Add upgrade CTAs
4. Update user settings
5. Test full flow

### Week 4: Documentation
1. Update README
2. Update all docs
3. Create billing guide
4. Update CHANGELOG
5. Ready to launch!

---

## ✅ SUCCESS METRICS

### Month 1 Goals
- 100 GitHub stars
- 500 free users
- 5 Pro subscribers ($145/mo)
- 1 Business subscriber ($99/mo)
- **Revenue**: ~$250/month

### Month 3 Goals
- 500 GitHub stars
- 2,000 free users
- 50 Pro subscribers ($1,450/mo)
- 5 Business subscribers ($495/mo)
- **Revenue**: ~$2,000/month

### Month 6 Goals
- 1,000 GitHub stars
- 5,000 free users
- 150 Pro subscribers ($4,350/mo)
- 15 Business subscribers ($1,485/mo)
- **Revenue**: ~$6,000/month

### Year 1 Goal
- **$50K annual revenue**
- 200+ paying customers
- Sustainable business

---

## 🚀 READY TO IMPLEMENT?

**Status**: Plan complete, ready to execute

**Next Steps**:
1. Create Stripe products
2. Update landing page pricing
3. Update main platform for subscriptions
4. Align all messaging
5. Test everything
6. Launch!

Want me to start implementing?

