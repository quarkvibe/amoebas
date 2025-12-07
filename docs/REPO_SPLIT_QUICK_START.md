# 🚀 Repository Split - Quick Reference

## One Command to Split

```bash
./scripts/split-repo.sh
```

Then follow the on-screen instructions.

---

## What Happens

1. ✅ Creates `/tmp/ameoba_client` (public repo)
2. ✅ Removes platform files (landing, admin, marketplace)
3. ✅ Updates configs for public distribution
4. ✅ Ready to push to GitHub & NPM

---

## After Running Script

### 1. Create GitHub Repo

- Go to: <https://github.com/new>
- Name: `ameoba_client`
- Visibility: **Public**

### 2. Push to GitHub

```bash
cd /tmp/ameoba_client
git remote set-url origin https://github.com/quarkvibe/ameoba_client.git
git push -u origin main
```

### 3. Publish to NPM

```bash
npm login
npm publish --access public
```

### 4. Test Installation

```bash
npm install -g @quarkvibe/amoeba
amoeba --version
```

---

## Repository Structure After Split

```
PUBLIC: ameoba_client
├── client/     # Product UI
├── server/     # Product API
├── cli/        # CLI tools
└── shared/     # Schemas

PRIVATE: ameoba_v2.0
├── client-product/  # Submodule → ameoba_client
├── landing/         # Marketing
├── admin/           # Control panel
└── marketplace/     # Marketplace
```

---

## Security Check

Before pushing public repo:

```bash
cd /tmp/ameoba_client
grep -r "sk_live" .    # No Stripe keys
grep -r "API_KEY" .    # No API keys
grep -r "SECRET" .     # No secrets
ls -la .env*           # No .env files
```

---

## Need Help?

See: [REPOSITORY_SPLIT_GUIDE.md](REPOSITORY_SPLIT_GUIDE.md)

---

**Time to complete:** ~10 minutes

**Ready? Run the script!** 🚀
