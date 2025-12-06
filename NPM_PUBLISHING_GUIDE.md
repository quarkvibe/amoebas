# NPM Publishing Guide for Amoeba

## 📦 Distribution Model

Amoeba uses a **freemium open-source model**:

- ✅ **Public NPM package** - Anyone can install
- ✅ **Open source code** - MIT licensed, auditable
- ✅ **Free tier** - Limited features, no license required
- ✅ **Paid tiers** - License validation unlocks features

---

## 🎯 How It Works

### User Journey

```
1. User discovers Amoeba (GitHub, NPM, landing page)
   ↓
2. User installs: npm install -g amoeba-cli
   ↓
3. User runs: amoeba init
   ↓
4. FREE TIER activated automatically (10 generations/month)
   ↓
5. User hits limit → Upgrade prompt shown
   ↓
6. User purchases license on quarkvibe.com
   ↓
7. User enters license key: amoeba license activate <key>
   ↓
8. PRO/BUSINESS features unlocked ✨
```

### Distribution Architecture

```
┌─────────────────────────────────────────────────────────┐
│              NPM REGISTRY (Public)                      │
│                                                         │
│  npm install -g amoeba-cli                             │
│  → Downloads complete Amoeba package                   │
│  → Installs on user's machine                          │
│  → FREE tier active by default                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│         USER'S MACHINE (Self-hosted)                    │
│                                                         │
│  • Dashboard, API, CLI all installed                   │
│  • Feature gates enforce tier limits                   │
│  • License validation (if paid tier)                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│      YOUR SERVER (quarkvibe.com)                        │
│                                                         │
│  • Landing page / pricing                              │
│  • Stripe payment processing                           │
│  • License generation & validation                     │
│  • Usage analytics (optional)                          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 Pre-Publishing Checklist

### 1. **Version Management**

```bash
# Update version in package.json
npm version patch   # 1.0.0 → 1.0.1
npm version minor   # 1.0.0 → 1.1.0
npm version major   # 1.0.0 → 2.0.0
```

### 2. **Build the Package**

```bash
# Clean previous builds
rm -rf dist/

# Build all components
npm run build

# Verify build output
ls -la dist/
```

### 3. **Test Locally**

```bash
# Create a test installation
npm pack

# This creates: amoeba-cli-1.0.0.tgz

# Test in another directory
cd /tmp
npm install -g /path/to/amoeba-cli-1.0.0.tgz

# Test CLI
amoeba --version
amoeba --help

# Cleanup
npm uninstall -g amoeba-cli
```

### 4. **Update Documentation**

- [ ] README.md has correct installation instructions
- [ ] CHANGELOG.md updated with new version
- [ ] All links point to correct URLs
- [ ] Examples are up-to-date

### 5. **Security Check**

```bash
# Check for security vulnerabilities
npm audit

# Fix if needed
npm audit fix
```

---

## 🚀 Publishing to NPM

### First-Time Setup

```bash
# 1. Create NPM account (if you don't have one)
# Visit: https://www.npmjs.com/signup

# 2. Login to NPM
npm login
# Enter: username, password, email

# 3. Verify login
npm whoami
# Should show: quarkvibe (or your username)

# 4. Check package name availability
npm search amoeba-cli
# If taken, update package.json name
```

### Publishing

```bash
# 1. Ensure you're on main branch
git checkout main
git pull origin main

# 2. Build the package
npm run build

# 3. Test the package
npm pack
# Test the .tgz file locally

# 4. Publish to NPM
npm publish

# For scoped packages (if needed):
npm publish --access public
```

### Post-Publishing

```bash
# 1. Verify package is live
npm view amoeba-cli

# 2. Test installation
npm install -g amoeba-cli

# 3. Create GitHub release
git tag v1.0.0
git push origin v1.0.0

# 4. Update website
# Update landing page with new version number
```

---

## 🔄 Update Workflow

### For Bug Fixes (Patch)

```bash
# 1. Fix the bug
# 2. Test thoroughly
npm run check

# 3. Update version
npm version patch

# 4. Build and publish
npm run build
npm publish

# 5. Push to GitHub
git push origin main --tags
```

### For New Features (Minor)

```bash
# 1. Develop feature
# 2. Update CHANGELOG.md
# 3. Update version
npm version minor

# 4. Build and publish
npm run build
npm publish

# 5. Push to GitHub
git push origin main --tags

# 6. Announce on landing page
```

### For Breaking Changes (Major)

```bash
# 1. Develop changes
# 2. Update migration guide
# 3. Update version
npm version major

# 4. Build and publish
npm run build
npm publish

# 5. Push to GitHub
git push origin main --tags

# 6. Email existing users
# 7. Update documentation
```

---

## 📊 What Gets Published

Based on `.npmignore`, the package includes:

✅ **Included:**

- `dist/` - Built JavaScript
- `bin/` - CLI executable
- `cli/` - CLI source
- `shared/` - Shared schemas
- `README.md`
- `LICENSE`
- `CHANGELOG.md`
- `package.json`
- `tsconfig.json`

❌ **Excluded:**

- `node_modules/`
- `server/` (except public assets)
- `client/src/` (source, not built)
- `.env` files
- Test files
- Documentation
- Development configs

---

## 🔐 Security Considerations

### What's Public

✅ **Safe to publish:**

- All source code (it's open source!)
- Database schema
- API interfaces
- CLI commands
- Documentation

❌ **Never publish:**

- `.env` files (already in .npmignore)
- API keys or secrets
- Database files
- User data
- Private keys

### License Validation

The license validation happens **server-side** on your infrastructure:

```typescript
// In the published package:
// server/services/licenseService.ts

// License validation calls YOUR server
// Users can't bypass this without modifying code
// If they modify, signature validation fails
```

---

## 📈 Monitoring

### NPM Stats

```bash
# View download stats
npm view amoeba-cli

# Check latest version
npm show amoeba-cli version

# See all versions
npm show amoeba-cli versions
```

### Analytics

Track on your server:

- License activations
- Feature usage
- Version distribution
- Upgrade conversions

---

## 🐛 Troubleshooting

### "Package name already taken"

```bash
# Option 1: Use scoped package
# Update package.json:
{
  "name": "@quarkvibe/amoeba-cli"
}

# Publish:
npm publish --access public

# Users install:
npm install -g @quarkvibe/amoeba-cli
```

### "Permission denied"

```bash
# Ensure you're logged in
npm whoami

# Re-login if needed
npm logout
npm login
```

### "Version already published"

```bash
# Bump version
npm version patch

# Then publish
npm publish
```

### "Build failed"

```bash
# Clean and rebuild
rm -rf dist/
npm run build

# Check for TypeScript errors
npm run check
```

---

## 🎯 Best Practices

### 1. **Semantic Versioning**

- **Patch** (1.0.x): Bug fixes
- **Minor** (1.x.0): New features, backward compatible
- **Major** (x.0.0): Breaking changes

### 2. **Changelog**

Always update `CHANGELOG.md`:

```markdown
## [1.1.0] - 2025-12-06

### Added
- Feature gate service for tier limits
- SMS command support for Pro tier

### Fixed
- License validation bug

### Changed
- Improved error messages
```

### 3. **Testing**

Before every publish:

```bash
# 1. TypeScript check
npm run check

# 2. Build
npm run build

# 3. Local test
npm pack
npm install -g ./amoeba-cli-1.0.0.tgz

# 4. Smoke test
amoeba --version
amoeba init --help

# 5. Cleanup
npm uninstall -g amoeba-cli
```

### 4. **Communication**

After publishing:

- Update landing page
- Tweet about new version
- Email Pro/Business users
- Post in Discord/community

---

## 🚀 Quick Reference

```bash
# Complete publish workflow
git checkout main
git pull origin main
npm run check                    # TypeScript check
npm run build                    # Build package
npm version patch                # Bump version
npm publish                      # Publish to NPM
git push origin main --tags      # Push to GitHub

# Test installation
npm install -g amoeba-cli
amoeba --version
```

---

## 📞 Support

If you encounter issues:

1. Check NPM status: <https://status.npmjs.org/>
2. Review NPM docs: <https://docs.npmjs.com/>
3. Contact NPM support: <support@npmjs.com>

---

**Ready to publish? Run the quick reference commands above!** 🚀
