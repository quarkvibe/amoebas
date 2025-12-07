# Amoeba Licensing FAQ

## 📋 Quick Summary

**Amoeba uses a custom "source-available" license, NOT open source (MIT/Apache).**

- ✅ Source code is **visible** (you can read and audit it)
- ✅ Free tier available (10 generations/month, no license key needed)
- ⚠️ Paid features require a **license key** with server-side validation
- ❌ You **cannot** remove license validation
- ❌ You **cannot** use MIT/Apache/GPL

---

## ❓ Common Questions

### **Q: Why not use MIT or Apache license?**

**A:** MIT/Apache are **permissive open source** licenses that allow anyone to:

- Use the code commercially without paying
- Remove license validation
- Resell as their own product
- Fork and compete with you

**Your business model requires:**

- Server-side license validation
- Paid tiers for commercial use
- Protection against unauthorized use

**Therefore, you need a "source-available" license** like the Amoeba Community License.

---

### **Q: Can I still publish to NPM with a custom license?**

**A:** **YES!** NPM allows custom licenses. You just need to:

```json
{
  "license": "SEE LICENSE IN LICENSE"
}
```

NPM will display your custom license file. Examples:

- **Elastic License 2.0** (Elasticsearch)
- **Server Side Public License** (MongoDB)
- **Business Source License** (MariaDB, CockroachDB)
- **Fair Source License** (Sourcegraph)

---

### **Q: Is this "open source"?**

**A:** **No, it's "source-available"** (also called "fair code" or "ethical source").

**Differences:**

| Feature | Open Source (MIT) | Source-Available (Amoeba) |
|---------|------------------|---------------------------|
| View source code | ✅ Yes | ✅ Yes |
| Modify for personal use | ✅ Yes | ✅ Yes |
| Use commercially (free) | ✅ Yes | ⚠️ Limited (Free tier) |
| Remove license checks | ✅ Yes | ❌ No |
| Resell as SaaS | ✅ Yes | ❌ Requires license |
| Fork and compete | ✅ Yes | ❌ Prohibited |

---

### **Q: What can users do for FREE?**

**A:** Free tier (no license key required):

- ✅ 10 AI generations per month
- ✅ 3 content templates
- ✅ 2 data sources
- ✅ Email delivery only
- ✅ Personal use
- ✅ Development/testing
- ✅ Non-profit organizations
- ✅ Small businesses (<$1M revenue)

---

### **Q: What requires a PAID license?**

**A:** Paid features (license key required):

- Unlimited generations
- Unlimited templates/data sources
- All delivery channels (SMS, voice, social media)
- SMS commands
- Webhooks
- White-label
- Multi-instance
- Priority/dedicated support

**Also required for:**

- Enterprises ($1M+ revenue) using in production
- Commercial SaaS offerings
- Reselling Amoeba as a service

---

### **Q: How is the license enforced?**

**A:** Server-side validation:

1. **License key validation**
   - Cryptographically signed keys
   - Validated against YOUR server (quarkvibe.com)
   - Daily validation with 7-day grace period

2. **Feature gates**
   - `featureGateService.ts` checks tier limits
   - Blocks actions when limits reached
   - Shows upgrade prompts

3. **Anti-tampering**
   - Signature verification prevents forged keys
   - Removing validation breaks updates
   - License terms prohibit circumvention

---

### **Q: Can users bypass the license validation?**

**A:** Technically yes, but:

❌ **It's prohibited** by the license (Section 4.2)
❌ **It breaks updates** (they'd have to maintain their own fork)
❌ **It's detectable** (telemetry can track unlicensed usage)
❌ **It's legally risky** (license termination + potential lawsuit)

**Most importantly:** The free tier is generous enough that honest users won't bother bypassing it. Dishonest users wouldn't pay anyway.

---

### **Q: What about competitors forking Amoeba?**

**A:** The license **prohibits** competitive forks:

**Section 6.3: Derivative Works**
> "You may create derivative works provided that they do not compete directly with Amoeba."

**Section 5.3: Hosted Services**
> "You may offer hosted services using the Software provided that you do not compete directly with QuarkVibe Inc.'s hosted offering."

If someone forks and competes:

- They violate the license
- You can send cease & desist
- You can pursue legal action
- They lose credibility (license violation)

---

### **Q: Can users contribute to Amoeba?**

**A:** **YES!** Contributions are encouraged:

✅ Submit pull requests on GitHub
✅ Report bugs and issues
✅ Suggest features
✅ Improve documentation

**By contributing:**

- You grant QuarkVibe Inc. a license to use your contribution
- You're credited in CONTRIBUTORS.md
- You help the community
- You build your reputation

---

### **Q: What about GitHub stars and discoverability?**

**A:** Source-available projects can still get stars!

**Examples:**

- **Elasticsearch** (ELv2): 70k+ stars
- **MongoDB** (SSPL): 26k+ stars
- **GitLab** (MIT Core + Proprietary): 24k+ stars
- **Sentry** (BSL): 39k+ stars

**Key:** Be transparent about licensing. Users appreciate:

- Visible source code (auditable)
- Generous free tier
- Clear pricing
- Fair terms

---

### **Q: Will NPM reject my package?**

**A:** **No.** NPM allows custom licenses as long as you:

✅ Include a LICENSE file
✅ Specify `"license": "SEE LICENSE IN LICENSE"` in package.json
✅ Don't violate NPM's terms of service

**NPM's policy:**
> "You can use any license you want, including proprietary licenses."

---

### **Q: What if someone violates the license?**

**A:** Enforcement options:

1. **Automated detection**
   - Telemetry tracks unlicensed usage
   - Server-side validation logs violations

2. **Friendly contact**
   - Email: "We noticed you're using Amoeba without a license..."
   - Offer to help them get compliant
   - Most people will pay or stop using

3. **Cease & desist**
   - Formal legal notice
   - Demand they stop or purchase license
   - Usually resolves the issue

4. **Legal action** (last resort)
   - Copyright infringement
   - Breach of license terms
   - Seek damages + injunction

**Reality:** Most violations are accidental. A friendly email usually resolves it.

---

### **Q: Should I worry about "open source purists"?**

**A:** **No.** Here's why:

1. **You're not claiming to be open source**
   - You're "source-available"
   - You're transparent about licensing
   - You're not misleading anyone

2. **Many successful companies do this**
   - Elastic, MongoDB, GitLab, Sentry, etc.
   - They're thriving despite criticism

3. **Your target market doesn't care**
   - Businesses want features + support
   - They're happy to pay for value
   - They prefer source-available over closed source

4. **Free tier satisfies hobbyists**
   - 10 generations/month is generous
   - Personal use is free
   - Non-profits are free

**Bottom line:** Build a great product. Price it fairly. Be transparent. Ignore the noise.

---

## 🎯 Licensing Strategy Summary

### **Your Model: "Freemium Source-Available"**

```
Source Code: Public (GitHub, NPM)
    ↓
Free Tier: Generous (10 gen/month, personal use)
    ↓
Paid Tiers: License key required
    ↓
Enforcement: Server-side validation
    ↓
Protection: Custom license (Amoeba Community License)
```

### **Why This Works:**

✅ **Discoverability** - Public code on GitHub/NPM
✅ **Trust** - Users can audit the code
✅ **Adoption** - Free tier drives usage
✅ **Revenue** - Paid tiers unlock features
✅ **Protection** - License prevents abuse
✅ **Enforcement** - Server-side validation

---

## 📚 Similar Licenses (For Reference)

### **Elastic License 2.0 (ELv2)**

- Used by: Elasticsearch, Kibana
- Allows: Use, modify, redistribute
- Prohibits: Offering as managed service, removing license

### **Server Side Public License (SSPL)**

- Used by: MongoDB
- Allows: Use, modify
- Requires: Open source your entire stack if offering as service

### **Business Source License (BSL)**

- Used by: MariaDB, CockroachDB
- Allows: Use with limitations
- Converts to: Open source after X years

### **Fair Source License**

- Used by: Sourcegraph
- Allows: Free for <N users
- Requires: License for commercial use

**Your Amoeba Community License is most similar to Fair Source + ELv2.**

---

## ✅ Final Checklist

Before publishing to NPM:

- [x] LICENSE file in repository
- [x] `package.json` has `"license": "SEE LICENSE IN LICENSE"`
- [x] README mentions licensing clearly
- [x] Pricing page explains tiers
- [x] License validation implemented
- [x] Feature gates enforced
- [x] Terms of service on website
- [ ] Consult lawyer (optional but recommended)

---

## 📞 Questions?

**For licensing questions:**

- Email: <licensing@quarkvibe.com>
- Review: LICENSE file in repository
- Compare: Similar licenses (ELv2, SSPL, BSL)

**For legal advice:**

- Consult an attorney specializing in software licensing
- Consider: [OSS Capital](https://oss.capital/), [Heather Meeker](https://heathermeeker.com/)

---

**Remember:** Your licensing model is **common, legal, and ethical**. Don't let "open source purists" discourage you. Build great software, price it fairly, and protect your business.

🦠 **Amoeba: Source-Available, Fair-Priced, Community-Driven**
