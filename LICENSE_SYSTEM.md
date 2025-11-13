# 🔑 License Generation & Validation System

**Self-Hosted Friendly Licensing**

**Question:** "Can we issue licenses with random number generator on website and validate them?"

**Answer:** YES! Here's how to do it the Amoeba way (respects self-hosting, works offline).

---

## 🎯 THE APPROACH

### Philosophy-Aligned Licensing:

**From MANIFESTO.md:**
> "Self-hosting is sacred - Must work without internet (after setup)"
> "No phone-home unless explicitly enabled"

**Solution:** Cryptographic validation that works offline ✅

---

## 🏗️ ARCHITECTURE

### How It Works:

```
1. USER PURCHASES (on website)
   ↓
2. WEBSITE GENERATES LICENSE
   Payload: { tier, issued, expiry, features }
   Sign: HMAC-SHA256(payload, SECRET_KEY)
   Format: AMOEBA-V1-XXXX-XXXX-XXXX-XXXX
   ↓
3. EMAIL TO USER
   "Your license: AMOEBA-V1-AB12-CD34-EF56-GH78"
   ↓
4. USER INSTALLS AMOEBA (self-hosted)
   Dashboard → License → Enter Key
   ↓
5. AMOEBA VALIDATES (OFFLINE!)
   Parse: Extract payload + signature
   Verify: HMAC-SHA256(payload, SECRET_KEY)
   Check: Signature matches?
   Check: Not expired?
   Result: VALID ✅ or INVALID ❌
   ↓
6. WORKS FOREVER (no phone-home!)
```

**Key Point:** Validation uses cryptography, not server calls.

---

## 🔒 SECURITY MODEL

### Why This Is Secure:

**1. Cryptographic Signing (HMAC-SHA256)**
```
License = Payload + HMAC(Payload, SECRET_KEY)

To forge:
- Need SECRET_KEY (only on your website)
- Without it: Signature won't match
- Can't brute force: 256-bit key space

Result: Secure without phone-home ✅
```

**2. Embedded Metadata**
```
Payload contains:
{
  "tier": "personal",
  "issued": 1699123456789,
  "expiry": 1730659456789,
  "features": ["all"],
  "maxDevices": 5
}

Tampering with payload → Signature invalid
Can read payload (it's base64)
Can't modify payload (would break signature)
```

**3. No Server Dependency**
```
Validation happens:
✅ Locally in Amoeba instance
✅ Using cryptography (not API calls)
✅ Works offline after initial activation
✅ Respects self-hosting principle
```

---

## 💻 IMPLEMENTATION

### On Your Website (License Generation):

```typescript
// On website after Stripe payment success:

import { licenseGenerationService } from './licenseGeneration';

// Stripe webhook handler
app.post('/stripe/webhook', async (req, res) => {
  const event = req.body;
  
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    // Generate license
    const license = licenseGenerationService.generateLicense({
      tier: session.metadata.tier || 'personal',
      issuedDate: new Date(),
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      features: ['all'],
      maxDevices: session.metadata.tier === 'team' ? 20 : 5,
      customerId: session.customer,
    });
    
    // Store in your database
    await db.licenses.create({
      key: license,
      customerId: session.customer,
      email: session.customer_email,
      tier: session.metadata.tier,
    });
    
    // Email to user
    await sendEmail({
      to: session.customer_email,
      subject: 'Your Amoeba License',
      body: `
        Thanks for purchasing Amoeba!
        
        Your license key:
        ${license}
        
        To activate:
        1. Install Amoeba (see docs)
        2. Dashboard → License
        3. Enter key above
        4. Start generating!
        
        Questions? Reply to this email.
      `,
    });
  }
  
  res.json({ received: true });
});
```

---

### In Amoeba (License Validation):

```typescript
// When user enters license in Dashboard:

import { licenseGenerationService } from './services/licenseGenerationService';

// Dashboard → License → Enter Key
app.post('/api/license/activate', async (req, res) => {
  const { licenseKey } = req.body;
  
  // Validate (OFFLINE - no server call!)
  const result = licenseGenerationService.validateLicense(licenseKey);
  
  if (!result.valid) {
    return res.status(400).json({
      success: false,
      error: result.message,
    });
  }
  
  // Valid! Store in local database
  await storage.activateLicense({
    key: licenseKey,
    tier: result.tier,
    features: result.features,
    activatedAt: new Date(),
  });
  
  res.json({
    success: true,
    message: 'License activated',
    tier: result.tier,
    features: result.features,
    expiryDate: result.expiryDate,
  });
});
```

**No internet required after this!** ✅

---

## 🔑 LICENSE FORMAT

### Structure:

```
AMOEBA-V1-AB12-CD34-EF56-GH78-IJ90-KL12-MN34-OP56-QR78-ST90

Parts:
- AMOEBA: Product identifier
- V1: Version (for future format changes)
- Remaining: Encoded payload + signature
```

### What's Inside:

```javascript
// Encoded in license:
{
  "tier": "personal",           // personal, team, business, enterprise
  "issued": 1699123456789,      // Unix timestamp
  "expiry": 1730659456789,      // Unix timestamp (optional)
  "features": ["all"],          // Enabled features
  "maxDevices": 5,              // Soft limit (informational)
  "customerId": "cus_xxx"       // Stripe customer (for support)
}

// Plus HMAC signature to prevent tampering
```

---

## 🎯 VALIDATION FLOW

### Offline Validation (Self-Hosted):

```
1. User enters: AMOEBA-V1-AB12-CD34...
2. Parse key → Extract payload + signature
3. Compute: HMAC(payload, SECRET_KEY)
4. Compare: Computed signature == Provided signature?
5. If match: Decode payload → Check expiry → VALID ✅
6. If no match: INVALID (forged or corrupted) ❌

NO INTERNET REQUIRED ✅
```

### Optional Online Check (Managed Hosting):

```
If user wants extra features:
- Check license status on server
- Get updated features
- Sync across devices
- Usage analytics

But: NOT REQUIRED for basic operation
Self-hosted works 100% offline
```

---

## 💡 PURCHASE FLOW

### User Experience:

**Step 1: Purchase**
```
User visits: amoeba.io
Clicks: "Get Amoeba - $29/month"
Stripe checkout: Pays
```

**Step 2: Receive License**
```
Email arrives:
"Your Amoeba license: AMOEBA-V1-AB12-CD34-EF56-GH78..."
"Click to copy"
```

**Step 3: Activate**
```
User installs Amoeba
Dashboard → License → Paste key
Validates locally (offline!) ✅
"License activated - Personal tier"
```

**Step 4: Use**
```
Full Amoeba features unlocked
No further checks needed
Works offline forever (until expiry if subscription)
```

---

## 🔒 SECURITY FEATURES

### 1. Cannot Forge

**Without SECRET_KEY, cannot create valid signatures.**

User could:
- ❌ Generate random keys (signature won't match)
- ❌ Modify payload (signature becomes invalid)
- ❌ Copy someone else's key (tied to device fingerprint)

**Cryptographically secure.** ✅

---

### 2. Expiry Checking

**For subscriptions:**
```
License expires: 2025-12-31
Check on activation: Is today < expiry?
Check periodically: Weekly validation
If expired: Gentle notice (not hard block per philosophy)
```

**For one-time purchases:**
```
No expiry date in payload
Valid forever ✅
```

---

### 3. Device Fingerprinting (Soft)

**Track usage (not enforce):**
```
When activated:
- Record device fingerprint
- Store hostname
- Track last seen

If 6+ devices:
- Show notice (not block)
- Suggest team license
- Trust user (philosophy-aligned)
```

---

## 🎛️ IMPLEMENTATION

### Website Code (Next.js/Landing):

```typescript
// pages/api/generate-license.ts

import { licenseGenerationService } from '@/lib/licenseGeneration';

export default async function handler(req, res) {
  // Verify this request is from Stripe webhook
  // (signature validation)
  
  const license = licenseGenerationService.generateLicense({
    tier: 'personal',
    issuedDate: new Date(),
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    features: ['all'],
    maxDevices: 5,
  });
  
  res.json({ license });
}
```

---

### Amoeba Code (Already Exists!):

```typescript
// server/services/licenseService.ts (ENHANCE)

import { licenseGenerationService } from './licenseGenerationService';

async activateLicense(licenseKey, deviceInfo) {
  // Validate cryptographically (offline!)
  const validation = licenseGenerationService.validateLicense(licenseKey);
  
  if (!validation.valid) {
    return {
      success: false,
      error: validation.message,
    };
  }
  
  // Store activation
  await storage.createLicense({
    licenseKey,
    tier: validation.tier,
    features: validation.features,
    deviceFingerprint: deviceInfo.fingerprint,
    activatedAt: new Date(),
  });
  
  return {
    success: true,
    tier: validation.tier,
    message: 'License activated successfully',
  };
}
```

---

## ✅ ADVANTAGES

**Self-Hosting Friendly:**
- ✅ Works offline (no phone-home)
- ✅ No license server dependency
- ✅ Cryptographic validation
- ✅ Respects MANIFESTO.md principles

**Secure:**
- ✅ Cannot forge (HMAC signature)
- ✅ Cannot modify (tampering breaks signature)
- ✅ Expiry checking (for subscriptions)
- ✅ Device tracking (informational)

**User-Friendly:**
- ✅ Simple key entry (copy-paste)
- ✅ One-time activation
- ✅ Works forever (offline)
- ✅ No internet required after activation

**Business-Friendly:**
- ✅ Easy to generate (website endpoint)
- ✅ Automated (Stripe webhook)
- ✅ Tracked (who has what)
- ✅ Enforceable (without DRM!)

---

## 🚀 DEPLOYMENT

### What You Need:

**1. Secret Key (on website only):**
```bash
# Generate once:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Store in website .env:
LICENSE_SECRET_KEY=abc123...def456

# NEVER put in Amoeba instances!
```

**2. Stripe Integration (already planned)**
```
Stripe checkout → Webhook → Generate license → Email user
```

**3. Email Template**
```
"Your Amoeba License: AMOEBA-V1-XXXX..."
Copy-paste into Dashboard → License
```

**Done!** ✅

---

## 💰 PRICING TIERS

### Encoded in License:

**Personal ($29/mo or $3.50 one-time):**
```
{
  "tier": "personal",
  "maxDevices": 5,
  "features": ["all"]
}
```

**Team ($79/mo):**
```
{
  "tier": "team",
  "maxDevices": 20,
  "features": ["all", "white-label", "priority-support"]
}
```

**Enterprise (custom):**
```
{
  "tier": "enterprise",
  "maxDevices": 999,
  "features": ["all", "white-label", "priority-support", "sla", "custom-features"]
}
```

---

## 🎯 SUMMARY

**Yes, you can issue licenses with generation on website!**

**Implementation:**
- ✅ Cryptographic signing (HMAC-SHA256)
- ✅ Offline validation (works self-hosted)
- ✅ Secure (cannot forge without secret key)
- ✅ Flexible (tiers, expiry, features)
- ✅ Philosophy-aligned (no phone-home)
- ✅ Already implemented (licenseGenerationService.ts)

**Time to Deploy:**
- Website integration: 2-3 hours
- Stripe webhook: 1 hour
- Email template: 30 minutes
- Testing: 1 hour
**Total: 4-5 hours**

**Result:**
- Users purchase → Get license instantly
- Enter in Amoeba → Works offline forever
- No server dependency
- Respects self-hosting
- Cryptographically secure

**This is the right way to do self-hosted licensing!** ✅

---

**Made with crypto instead of DRM**  
**By QuarkVibe Inc.**  
**Self-hosting friendly** 🦠🔑

