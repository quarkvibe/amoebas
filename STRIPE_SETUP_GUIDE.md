# 💳 Stripe Setup Guide - Amoeba v2.0

**Purpose**: Configure Stripe for subscription billing  
**Model**: Hybrid freemium (Free + Pro $29 + Business $99 + Enterprise)

---

## 🎯 OVERVIEW

**What You're Setting Up**:
- 4 subscription products (Pro monthly/yearly, Business monthly/yearly)
- Webhook endpoint for subscription events
- Customer portal for subscription management
- Payment links for quick checkout

---

## 📋 STEP-BY-STEP SETUP

### Step 1: Create Stripe Account

1. Go to https://stripe.com
2. Sign up for account
3. Complete verification (for live payments)
4. Get your API keys

---

### Step 2: Create Products in Stripe

Go to **Products** → **Add Product**

#### Product 1: Amoeba Pro (Monthly)
```
Name: Amoeba Pro
Description: Priority support, early access, private Discord channel

Pricing:
- Price: $29.00 USD
- Billing period: Monthly
- Type: Recurring

Metadata (optional):
- tier: pro
- features: support,early_access,discord

→ Save
→ Copy Price ID: price_xxxxxxxxxxxPRO_MONTHLY
```

#### Product 2: Amoeba Pro (Yearly)
```
Name: Amoeba Pro (Annual)
Description: Priority support, early access, private Discord - Save $58/year

Pricing:
- Price: $290.00 USD
- Billing period: Yearly
- Type: Recurring

Metadata:
- tier: pro
- period: yearly
- savings: 58

→ Save
→ Copy Price ID: price_xxxxxxxxxxxPRO_YEARLY
```

#### Product 3: Amoeba Business (Monthly)
```
Name: Amoeba Business
Description: White-label, SLA, multi-instance support, priority development

Pricing:
- Price: $99.00 USD
- Billing period: Monthly
- Type: Recurring

Metadata:
- tier: business
- features: white_label,sla,multi_instance

→ Save
→ Copy Price ID: price_xxxxxxxxxxxBUSINESS_MONTHLY
```

#### Product 4: Amoeba Business (Yearly)
```
Name: Amoeba Business (Annual)
Description: White-label, SLA, multi-instance - Save $198/year

Pricing:
- Price: $990.00 USD
- Billing period: Yearly
- Type: Recurring

Metadata:
- tier: business
- period: yearly
- savings: 198

→ Save
→ Copy Price ID: price_xxxxxxxxxxxBUSINESS_YEARLY
```

---

### Step 3: Configure Customer Portal

Go to **Settings** → **Billing** → **Customer portal**

**Enable**:
- ✅ Update payment method
- ✅ Update billing information
- ✅ View invoice history
- ✅ Cancel subscription
- ✅ Pause subscription (optional)
- ✅ Switch plans

**Customize**:
- Headline: "Manage your Amoeba subscription"
- Privacy policy URL: https://ameoba.org/privacy
- Terms of service URL: https://ameoba.org/terms

→ Save

---

### Step 4: Set Up Webhooks

Go to **Developers** → **Webhooks** → **Add endpoint**

**Endpoint URL**: 
```
Production: https://api.yourdomain.com/api/webhooks/stripe
Development: https://yourlocalhost.ngrok.io/api/webhooks/stripe
```

**Events to listen to**:
```
☑ checkout.session.completed
☑ customer.subscription.created
☑ customer.subscription.updated
☑ customer.subscription.deleted
☑ customer.subscription.trial_will_end
☑ invoice.payment_succeeded
☑ invoice.payment_failed
☑ invoice.payment_action_required
```

→ **Add endpoint**  
→ **Copy Signing Secret**: `whsec_xxxxxxxxxxxxxxxxxxxxxxxx`

---

### Step 5: Get API Keys

Go to **Developers** → **API keys**

**Test Mode** (for development):
```
Publishable key: pk_test_YOUR_KEY_HERE
Secret key: sk_test_YOUR_KEY_HERE
```

**Live Mode** (for production):
```
Publishable key: pk_live_YOUR_KEY_HERE
Secret key: sk_live_YOUR_KEY_HERE
```

---

## 🔑 ENVIRONMENT VARIABLES

### Main Platform (`/server/.env`)

```bash
# Stripe Secret Keys (never expose these!)
STRIPE_SECRET_KEY=sk_live_YOUR_SECRET_KEY_HERE

# Stripe Webhook Secret (from Step 4)
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE

# Stripe Price IDs (from Step 2)
STRIPE_PRICE_PRO_MONTHLY=price_xxxxxxxxxxxPRO_MONTHLY
STRIPE_PRICE_PRO_YEARLY=price_xxxxxxxxxxxPRO_YEARLY
STRIPE_PRICE_BUSINESS_MONTHLY=price_xxxxxxxxxxxBUSINESS_MONTHLY
STRIPE_PRICE_BUSINESS_YEARLY=price_xxxxxxxxxxxBUSINESS_YEARLY

# Success/Cancel URLs
STRIPE_SUCCESS_URL=https://app.yourdomain.com/dashboard?subscribed=true
STRIPE_CANCEL_URL=https://ameoba.org/pricing
```

### Landing Page (`/landing/.env.local`)

```bash
# Stripe Publishable Key (safe to expose)
NEXT_PUBLIC_STRIPE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxxxxx

# API URL (main platform)
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

---

## 🔧 CODE IMPLEMENTATION

### 1. Update User Schema

**File**: `shared/schema.ts`

Add to `users` table:
```typescript
export const users = pgTable("users", {
  // ... existing fields ...
  
  // Subscription fields (add these)
  subscriptionTier: varchar("subscription_tier", { length: 50 }).default('free'), 
    // 'free', 'pro', 'business', 'enterprise'
  subscriptionStatus: varchar("subscription_status", { length: 50 }).default('active'),
    // 'active', 'canceled', 'past_due', 'trialing', 'paused'
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
  subscriptionStartDate: timestamp("subscription_start_date"),
  subscriptionEndDate: timestamp("subscription_end_date"),
  subscriptionCanceledAt: timestamp("subscription_canceled_at"),
});
```

### 2. Create Checkout Endpoint

**File**: `server/routes/payments.ts` (update existing)

Add endpoint:
```typescript
// Create subscription checkout session
router.post('/checkout/session', async (req, res) => {
  try {
    const { tier, billingPeriod } = req.body;
    const userId = req.user?.id || req.user?.claims?.sub;
    
    // Get price ID based on tier and period
    const priceIds = {
      pro: {
        monthly: process.env.STRIPE_PRICE_PRO_MONTHLY,
        yearly: process.env.STRIPE_PRICE_PRO_YEARLY,
      },
      business: {
        monthly: process.env.STRIPE_PRICE_BUSINESS_MONTHLY,
        yearly: process.env.STRIPE_PRICE_BUSINESS_YEARLY,
      },
    };
    
    const priceId = priceIds[tier]?.[billingPeriod];
    
    if (!priceId) {
      return res.status(400).json({ error: 'Invalid tier or billing period' });
    }
    
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.STRIPE_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: process.env.STRIPE_CANCEL_URL,
      client_reference_id: userId,
      customer_email: req.user?.email,
      metadata: {
        userId,
        tier,
        billingPeriod,
      },
    });
    
    res.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});
```

### 3. Handle Webhook Events

**File**: `server/routes/webhooks.ts` (update existing)

```typescript
router.post('/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  // Handle different event types
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      // Update user with subscription info
      await storage.updateUser(session.metadata.userId, {
        subscriptionTier: session.metadata.tier,
        subscriptionStatus: 'active',
        stripeCustomerId: session.customer,
        stripeSubscriptionId: session.subscription,
        subscriptionStartDate: new Date(),
      });
      break;
      
    case 'customer.subscription.updated':
      const subscription = event.data.object;
      // Update subscription status
      break;
      
    case 'customer.subscription.deleted':
      // Downgrade to free tier
      break;
      
    case 'invoice.payment_failed':
      // Mark as past_due
      break;
  }
  
  res.json({ received: true });
});
```

---

## 🧪 TESTING

### Test Mode Setup

1. Use test API keys (pk_test_... and sk_test_...)
2. Use test credit card: `4242 4242 4242 4242`
3. Any future date, any CVC
4. Test full flow: Subscribe → Webhook → User upgraded

### Test Checklist

- [ ] Subscription creation works
- [ ] Webhook receives events
- [ ] User tier updates correctly
- [ ] Customer portal works
- [ ] Cancellation works
- [ ] Yearly vs monthly pricing correct
- [ ] Metadata passed correctly

### Go Live Checklist

- [ ] Switch to live API keys
- [ ] Update webhook URL to production
- [ ] Test with real card (small amount)
- [ ] Verify webhook in production
- [ ] Monitor Stripe dashboard
- [ ] Set up alerts for failed payments

---

## 📊 STRIPE DASHBOARD SETUP

### Configure Settings

**Business Details**:
- Business name: QuarkVibe Inc.
- Support email: support@quarkvibe.com
- Statement descriptor: "AMOEBA"

**Branding**:
- Upload logo
- Brand color: #10B981 (emerald)
- Upload icon

**Emails**:
- Customize email templates
- Add branding
- Enable receipt emails
- Enable failed payment emails

**Tax**:
- Configure tax collection (if needed)
- Set up tax IDs

---

## 💰 PRICE IDS TO COPY

After creating products, you'll have these Price IDs:

```bash
# Pro Tier
STRIPE_PRICE_PRO_MONTHLY=price_1Xxxxx...ProMonthly
STRIPE_PRICE_PRO_YEARLY=price_1Xxxxx...ProYearly

# Business Tier
STRIPE_PRICE_BUSINESS_MONTHLY=price_1Xxxxx...BusinessMonthly
STRIPE_PRICE_BUSINESS_YEARLY=price_1Xxxxx...BusinessYearly
```

**Add these to your .env files!**

---

## 🔗 USEFUL STRIPE LINKS

- **Dashboard**: https://dashboard.stripe.com
- **Products**: https://dashboard.stripe.com/products
- **Webhooks**: https://dashboard.stripe.com/webhooks
- **API Keys**: https://dashboard.stripe.com/apikeys
- **Customer Portal**: https://dashboard.stripe.com/settings/billing/portal
- **Test Cards**: https://stripe.com/docs/testing

---

## ✅ VERIFICATION

After setup, verify:

1. **Products created**: 4 products visible in Stripe dashboard
2. **Webhooks configured**: Endpoint shows "Enabled"
3. **API keys copied**: In .env files (test AND live)
4. **Price IDs copied**: In .env files
5. **Customer portal**: Enabled and customized
6. **Test checkout**: Works end-to-end

---

## 🆘 TROUBLESHOOTING

**Webhook not receiving events**:
- Check endpoint URL is correct
- Check webhook secret matches .env
- Check endpoint is publicly accessible
- Test with Stripe CLI: `stripe listen --forward-to localhost:5000/api/webhooks/stripe`

**Checkout not working**:
- Check publishable key is correct
- Check price IDs are correct
- Check success/cancel URLs are valid
- View logs in Stripe dashboard

**Subscription not updating user**:
- Check webhook received event
- Check metadata.userId is correct
- Check database connection
- View server logs

---

## 📝 QUICK REFERENCE

### All Environment Variables Needed

```bash
# === MAIN PLATFORM (.env) ===

# Stripe Secret (NEVER expose!)
STRIPE_SECRET_KEY=sk_live_YOUR_SECRET_KEY_HERE

# Webhook Secret
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE

# Price IDs
STRIPE_PRICE_PRO_MONTHLY=price_YOUR_PRICE_ID_HERE
STRIPE_PRICE_PRO_YEARLY=price_xxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_PRICE_BUSINESS_MONTHLY=price_xxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_PRICE_BUSINESS_YEARLY=price_xxxxxxxxxxxxxxxxxxxxxxxx

# URLs
STRIPE_SUCCESS_URL=https://app.yourdomain.com/dashboard?subscribed=true
STRIPE_CANCEL_URL=https://ameoba.org/pricing

# === LANDING PAGE (landing/.env.local) ===

# Stripe Publishable (safe to expose)
NEXT_PUBLIC_STRIPE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxxxxx

# API URL
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

---

## 🎯 STRIPE PRODUCTS SUMMARY

| Product | Price | Period | Price ID Variable |
|---------|-------|--------|-------------------|
| Amoeba Pro | $29 | Monthly | STRIPE_PRICE_PRO_MONTHLY |
| Amoeba Pro | $290 | Yearly | STRIPE_PRICE_PRO_YEARLY |
| Amoeba Business | $99 | Monthly | STRIPE_PRICE_BUSINESS_MONTHLY |
| Amoeba Business | $990 | Yearly | STRIPE_PRICE_BUSINESS_YEARLY |

**Enterprise**: Handled via manual invoicing (no Stripe checkout)

---

## ✅ SETUP COMPLETE WHEN...

- [x] 4 products created in Stripe
- [x] All price IDs copied to .env
- [x] Webhook endpoint configured
- [x] Webhook secret copied to .env
- [x] API keys (test & live) copied to .env
- [x] Customer portal configured
- [x] Test purchase completed successfully
- [x] Webhook events received and processed
- [x] User tier updated in database

**Ready to accept payments!** 💰

---

**Need Help?** Email support@quarkvibe.com

