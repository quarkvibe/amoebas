# Freemium Distribution Model - Implementation Summary

## 📦 Distribution Model

Amoeba uses a **freemium source-available model**:

- ✅ **Public source code** - Visible on GitHub & NPM (auditable, not fully open source)
- ✅ **Anyone can install** - `npm install -g amoeba-cli`
- ✅ **Free tier** - 10 generations/month, no license key required
- ✅ **Paid tiers** - License validation unlocks features
- ⚠️ **Custom license** - Amoeba Community License (not MIT/Apache)

**Important:** This is **source-available**, not open source. See [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

---

## 📦 Key Changes

### 1. **Package Configuration** (`package.json`)

- ✅ Changed `"private": true` → `"private": false"`
- ✅ Ready for NPM publishing
- ✅ Maintained MIT license for open source

### 2. **Feature Gate Service** (`server/services/featureGateService.ts`)

- ✅ Created comprehensive tier-based limits
- ✅ Enforces FREE, PRO, BUSINESS, ENTERPRISE tiers
- ✅ Checks permissions for:
  - Templates (FREE: 3, PRO+: unlimited)
  - Data sources (FREE: 2, PRO+: unlimited)
  - Generations per month (FREE: 10, PRO+: unlimited)
  - Delivery channels (FREE: email only, PRO+: all channels)
  - SMS commands (PRO+ only)
  - Webhooks (PRO+ only)
  - And more...

### 3. **Documentation**

- ✅ Created `NPM_PUBLISHING_GUIDE.md` - Complete publishing workflow
- ✅ Updated `README.md` - NPM installation as primary method
- ✅ Clear user journey from install → free tier → upgrade

---

## 🚀 Distribution Flow

```
User discovers Amoeba
    ↓
npm install -g amoeba-cli
    ↓
amoeba init
    ↓
FREE TIER activated (10 generations/month)
    ↓
User hits limit → Upgrade prompt
    ↓
User purchases on quarkvibe.com
    ↓
amoeba license activate <key>
    ↓
PRO/BUSINESS features unlocked ✨
```

---

## 📊 Tier Breakdown

### FREE (No License Required)

- ✅ 10 generations/month
- ✅ 3 templates
- ✅ 2 data sources
- ✅ 1 scheduled job
- ✅ Email delivery only
- ✅ OpenAI + Ollama
- ✅ CLI + API access
- ❌ No SMS commands
- ❌ No webhooks
- ❌ No social media

### PRO ($29/month)

- ✅ Unlimited everything
- ✅ All delivery channels
- ✅ SMS commands
- ✅ Webhooks (10 max)
- ✅ Social media
- ✅ Voice calls
- ✅ Priority support
- ❌ No white-label

### BUSINESS ($99/month)

- ✅ Everything in Pro
- ✅ Unlimited webhooks
- ✅ White-label
- ✅ Multi-instance
- ✅ Custom branding
- ✅ SLA

### ENTERPRISE (Custom)

- ✅ Everything in Business
- ✅ Dedicated support
- ✅ Custom development

---

## 🔐 How License Validation Works

### Your Backend (quarkvibe.com)

1. User purchases license via Stripe
2. License generated with signature
3. License stored in your database
4. License key sent to user

### User's Installation

1. User runs: `amoeba license activate <key>`
2. License validated against YOUR server
3. Signature verified (tamper-proof)
4. Features unlocked based on tier
5. Periodic validation (daily)

### Security

- ✅ Cryptographic signatures prevent tampering
- ✅ Device fingerprinting (1 license = 1 device)
- ✅ Server-side validation
- ✅ Grace period for offline usage (7 days)

---

## 📝 Next Steps to Publish

### 1. **Test Locally**

```bash
npm run build
npm pack
npm install -g ./amoeba-cli-1.0.0.tgz
amoeba --version
```

### 2. **Publish to NPM**

```bash
npm login
npm publish
```

### 3. **Verify**

```bash
npm view amoeba-cli
npm install -g amoeba-cli
```

### 4. **Update Website**

- Update landing page with NPM install instructions
- Add tier comparison table
- Link to GitHub repo

---

## 🎨 User Experience

### First-Time User

```bash
# Install
npm install -g amoeba-cli

# Initialize
amoeba init
# → Creates config, database
# → FREE tier active immediately

# Generate content
amoeba generate "blog post about AI"
# → Works! (1/10 generations used)

# After 10 generations
amoeba generate "another post"
# → ❌ "Monthly limit reached (10/10)"
# → 🚀 "Upgrade to Pro for unlimited generations!"
# → "Visit: https://quarkvibe.com/pricing"
```

### Paid User

```bash
# Purchase license on website
# Receive: AMEOBA-V1.eyJ0IjoiUFJPRkVTU0lPTkFMIn0=.abc123...

# Activate
amoeba license activate AMEOBA-V1.eyJ0IjoiUFJPRkVTU0lPTkFMIn0=.abc123...
# → ✅ "License activated! Pro features unlocked."

# Now unlimited
amoeba generate "unlimited content"
# → ✅ Works! No limits.

# Use Pro features
amoeba generate "post" --deliver sms,email,social
# → ✅ All channels available
```

---

## 🔄 Upgrade Prompts

Feature gates automatically show upgrade prompts:

```typescript
// When user hits limit
{
  allowed: false,
  reason: "Template limit reached (3). Upgrade to Pro for unlimited templates.",
  upgradeUrl: "https://quarkvibe.com/pricing"
}
```

Dashboard shows:

- Current tier badge
- Usage stats (7/10 generations this month)
- Progress bars
- "Upgrade" button when limits approached

---

## 📈 Business Model

### Revenue Streams

1. **Pro Subscriptions** - $29/month recurring
2. **Business Subscriptions** - $99/month recurring
3. **Enterprise Contracts** - Custom pricing

### Cost Structure

- **Infrastructure**: $0 (users self-host)
- **Support**: Tiered (community → priority → dedicated)
- **Development**: Open source contributions

### Growth Strategy

1. **Freemium Funnel**
   - Free tier attracts users
   - Usage limits drive upgrades
   - 10-20% conversion rate expected

2. **Open Source Marketing**
   - GitHub stars → visibility
   - NPM downloads → adoption
   - Community → evangelists

3. **Enterprise Sales**
   - Free/Pro users → Business leads
   - Custom features → Enterprise deals

---

## 🎯 Success Metrics

### Track These

- NPM downloads/week
- Active installations
- Free → Pro conversion rate
- Pro → Business conversion rate
- Churn rate
- Support ticket volume by tier

### Goals (Month 1)

- 1,000 NPM downloads
- 100 active free users
- 10 Pro subscribers
- 2 Business subscribers

---

## ⚠️ Important Notes

### What's Public

✅ All source code (MIT license)
✅ Database schema
✅ API interfaces
✅ Documentation

### What's Private

❌ Your `.env` files
❌ Your encryption keys
❌ Customer data
❌ License database

### What Users Can't Bypass

- License validation (server-side)
- Signature verification (cryptographic)
- Usage tracking (server-side)

### What Users CAN Do

- Fork the code
- Modify for personal use
- Remove license checks (but breaks updates)
- Self-host completely free (with limits)

**This is intentional!** The free tier is generous enough for personal use. Businesses will pay for:

- Support
- Updates
- Convenience
- Legal compliance

---

## 🚀 Ready to Launch

Everything is in place:

✅ Package configured for NPM
✅ Feature gates implemented
✅ Documentation complete
✅ License system working
✅ Tier limits defined
✅ Upgrade prompts ready

**Next command:**

```bash
npm publish
```

Then watch the users roll in! 🎉

---

## 📞 Support

For publishing help:

- See: `NPM_PUBLISHING_GUIDE.md`
- NPM docs: <https://docs.npmjs.com/>
- NPM support: <support@npmjs.com>

For feature gate questions:

- See: `server/services/featureGateService.ts`
- Adjust limits in `TIER_LIMITS` constant

---

**Made with ❤️ for sustainable open source** 🦠
