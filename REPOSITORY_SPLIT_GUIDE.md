# Repository Split Guide

## 🎯 Overview

This guide walks you through splitting the current private `ameoba_v2.0` repository into two repositories:

1. **`ameoba_client`** (PUBLIC) - Product for customers, published to NPM
2. **`ameoba_v2.0`** (PRIVATE) - Platform infrastructure, business logic

---

## 📁 Repository Structure

### **Before Split (Current):**

```
ameoba_v2.0/ (PRIVATE)
├── client/              # Product UI
├── server/              # Product + Platform backend
├── cli/                 # Product CLI
├── shared/              # Product schemas
├── landing/             # Platform: Marketing site
├── admin/               # Platform: Control panel
├── marketplace/         # Platform: Marketplace
├── docs/                # Product docs
└── scripts/             # Platform: Deployment
```

### **After Split:**

```
ameoba_client/ (PUBLIC)
├── client/              # Product UI
├── server/              # Product backend only
├── cli/                 # Product CLI
├── shared/              # Product schemas
├── docs/                # User documentation
├── LICENSE              # Amoeba Community License
├── README.md            # Public README
└── package.json         # NPM package config

ameoba_v2.0/ (PRIVATE)
├── client-product/      # Submodule → ameoba_client
├── landing/             # Marketing site
├── admin/               # Control panel
├── marketplace/         # Marketplace
├── billing/             # Stripe integration
├── analytics/           # Business intelligence
├── scripts/             # Deployment scripts
└── .env                 # Platform secrets
```

---

## 🚀 Step-by-Step Instructions

### **Step 1: Run the Split Script**

```bash
# Make script executable
chmod +x scripts/split-repo.sh

# Run the script
./scripts/split-repo.sh
```

**What it does:**

- ✅ Creates clean copy of repo at `/tmp/ameoba_client`
- ✅ Removes platform files (landing, admin, marketplace)
- ✅ Removes internal documentation
- ✅ Updates package.json for public distribution
- ✅ Creates public-friendly README
- ✅ Commits changes

**Time:** ~2 minutes

---

### **Step 2: Review the Public Repo**

```bash
# Navigate to public repo
cd /tmp/ameoba_client

# Review what's included
ls -la

# Check for secrets
grep -r "sk_live" .
grep -r "API_KEY" .
grep -r "SECRET" .

# Test build
npm install
npm run build

# Test locally
npm pack
npm install -g ./quarkvibe-amoeba-*.tgz
amoeba --version
```

**What to verify:**

- ✅ No `.env` files
- ✅ No Stripe keys
- ✅ No internal docs
- ✅ No platform directories
- ✅ Build succeeds
- ✅ CLI works

---

### **Step 3: Create GitHub Repository**

1. **Go to GitHub:** <https://github.com/new>

2. **Repository settings:**
   - Owner: `quarkvibe`
   - Name: `ameoba_client`
   - Description: `AI content generation platform with multi-channel delivery, SMS control, and BYOK`
   - Visibility: **Public** ✅
   - Initialize: **NO** (we have existing code)

3. **Click "Create repository"**

---

### **Step 4: Push to GitHub**

```bash
# In the public repo directory
cd /tmp/ameoba_client

# Set remote to new public repo
git remote set-url origin https://github.com/quarkvibe/ameoba_client.git

# Push to GitHub
git push -u origin main

# Push tags (if any)
git push --tags
```

**Verify on GitHub:**

- Visit: <https://github.com/quarkvibe/ameoba_client>
- Check: Files are visible
- Check: LICENSE is displayed
- Check: README renders correctly

---

### **Step 5: Publish to NPM**

```bash
# Still in /tmp/ameoba_client

# Login to NPM (if not already)
npm login
# Username: quarkvibe (or your NPM username)
# Password: ***
# Email: ***

# Publish to NPM
npm publish --access public

# Verify publication
npm view @quarkvibe/amoeba
```

**Expected output:**

```
@quarkvibe/amoeba@1.0.0 | SEE LICENSE IN LICENSE | deps: 100+ | versions: 1
AI content generation platform with multi-channel delivery, SMS control, and BYOK
https://github.com/quarkvibe/ameoba_client

dist
.tarball: https://registry.npmjs.org/@quarkvibe/amoeba/-/amoeba-1.0.0.tgz
```

---

### **Step 6: Test NPM Installation**

```bash
# In a clean directory
cd /tmp/test-install

# Install from NPM
npm install -g @quarkvibe/amoeba

# Test CLI
amoeba --version
amoeba --help
amoeba init

# Verify it works
ls -la .amoeba/
```

**Expected:**

- ✅ Installs successfully
- ✅ CLI commands work
- ✅ `amoeba init` creates config
- ✅ Free tier is active

---

### **Step 7: Add Submodule to Private Repo**

```bash
# Go back to your private repo
cd /Users/suncatsolutionsllc/ameoba_v2.0

# Add public repo as submodule
git submodule add https://github.com/quarkvibe/ameoba_client.git client-product

# Initialize submodule
git submodule update --init --recursive

# Commit
git add .gitmodules client-product/
git commit -m "feat: add ameoba_client as submodule"
git push origin main
```

**Verify:**

```bash
# Check submodule status
git submodule status

# Should show:
# <commit-hash> client-product (heads/main)
```

---

### **Step 8: Update Private Repo Structure (Optional)**

If you want to reorganize your private repo:

```bash
cd /Users/suncatsolutionsllc/ameoba_v2.0

# Create platform directory
mkdir -p platform

# Move platform files
mv landing/ platform/
mv admin/ platform/
mv marketplace/ platform/

# Update build scripts to reference client-product/
# Update deployment scripts

# Commit
git add .
git commit -m "refactor: organize platform files"
git push origin main
```

---

## 🔄 Ongoing Workflow

### **Working on Product (Public Repo):**

```bash
# Option 1: Work directly in public repo
cd ~/ameoba_client/
git pull origin main
# Make changes...
git commit -m "feat: new feature"
git push origin main
npm version patch
npm publish

# Option 2: Work in submodule
cd /Users/suncatsolutionsllc/ameoba_v2.0/client-product/
git checkout main
git pull origin main
# Make changes...
git commit -m "feat: new feature"
git push origin main
npm version patch
npm publish

# Update submodule reference in private repo
cd /Users/suncatsolutionsllc/ameoba_v2.0/
git add client-product/
git commit -m "chore: update client-product to v1.0.1"
git push origin main
```

### **Working on Platform (Private Repo):**

```bash
cd /Users/suncatsolutionsllc/ameoba_v2.0

# Work on landing page
cd platform/landing/
# Make changes...

# Work on admin panel
cd ../admin/
# Make changes...

# Commit and push
cd ../..
git add .
git commit -m "feat: new admin feature"
git push origin main
```

---

## 📋 What Goes Where

### **Public Repo (`ameoba_client`):**

✅ **Include:**

- Product source code (client, server, cli, shared)
- User documentation
- LICENSE (Amoeba Community License)
- README (user-facing)
- CHANGELOG
- package.json (for NPM)
- .env.example (template only)

❌ **Exclude:**

- Landing page
- Admin panel
- Marketplace
- Billing/Stripe integration
- Analytics
- Deployment scripts
- Internal documentation
- Actual .env files
- Platform-specific pages (pricing, contact-sales)

### **Private Repo (`ameoba_v2.0`):**

✅ **Include:**

- Everything from public repo (as submodule)
- Landing page
- Admin panel
- Marketplace
- Billing/Stripe integration
- Analytics
- Deployment scripts
- Internal documentation
- .env files (secrets)
- Platform-specific code

---

## 🔐 Security Checklist

Before pushing public repo, verify:

- [ ] No `.env` files
- [ ] No Stripe keys (`sk_live_`, `sk_test_`)
- [ ] No API keys
- [ ] No database credentials
- [ ] No AWS/GCP credentials
- [ ] No internal documentation
- [ ] No customer data
- [ ] No deployment secrets
- [ ] No admin panel code
- [ ] No billing code (except license validation)

**Search for secrets:**

```bash
cd /tmp/ameoba_client

# Search for common secret patterns
grep -r "sk_live" .
grep -r "sk_test" .
grep -r "API_KEY" .
grep -r "SECRET_KEY" .
grep -r "password" .
grep -r "DATABASE_URL" .
```

---

## 🐛 Troubleshooting

### **Issue: Script fails with "uncommitted changes"**

**Solution:**

```bash
cd /Users/suncatsolutionsllc/ameoba_v2.0
git status
git add .
git commit -m "chore: commit before split"
./scripts/split-repo.sh
```

### **Issue: NPM publish fails with "package already exists"**

**Solution:**

```bash
# Update package name in package.json
{
  "name": "@quarkvibe/amoeba"  // Use scoped package
}

# Or version bump
npm version patch
npm publish --access public
```

### **Issue: Submodule not updating**

**Solution:**

```bash
cd /Users/suncatsolutionsllc/ameoba_v2.0
git submodule update --remote client-product
git add client-product/
git commit -m "chore: update submodule"
```

### **Issue: Build fails in public repo**

**Solution:**

```bash
cd /tmp/ameoba_client

# Check for missing dependencies
npm install

# Check for platform-specific imports
grep -r "landing/" .
grep -r "admin/" .

# Remove platform imports from code
```

---

## 📊 Comparison

| Aspect | Before Split | After Split |
|--------|-------------|-------------|
| **Repositories** | 1 (private) | 2 (1 public, 1 private) |
| **NPM Package** | Can't publish | ✅ Published |
| **Code Visibility** | Hidden | Product visible, platform hidden |
| **Security** | All private | Secrets stay private |
| **Collaboration** | Limited | Open source contributions |
| **Discoverability** | Low | High (GitHub, NPM) |
| **Maintenance** | Simple | Submodule management |

---

## ✅ Success Criteria

You'll know the split is successful when:

- ✅ Public repo is on GitHub: `github.com/quarkvibe/ameoba_client`
- ✅ Package is on NPM: `npm install -g @quarkvibe/amoeba`
- ✅ Installation works: `amoeba --version`
- ✅ No secrets in public repo
- ✅ Private repo has submodule reference
- ✅ Both repos can be developed independently

---

## 🎯 Next Steps After Split

1. **Update Documentation:**
   - Update links in README
   - Update CONTRIBUTING.md
   - Update issue templates

2. **Configure GitHub:**
   - Add topics/tags
   - Set up branch protection
   - Configure GitHub Actions (CI/CD)

3. **Marketing:**
   - Tweet about launch
   - Post on Hacker News
   - Submit to Product Hunt
   - Update website

4. **Monitor:**
   - Watch NPM downloads
   - Monitor GitHub stars
   - Track issues/discussions

---

## 📞 Support

If you encounter issues:

1. **Check this guide** - Most issues are covered
2. **Review script output** - Error messages are helpful
3. **Check GitHub/NPM docs** - Official documentation
4. **Ask for help** - Create an issue or discussion

---

**Ready to split? Run the script!**

```bash
chmod +x scripts/split-repo.sh
./scripts/split-repo.sh
```

🚀 **Good luck!**
