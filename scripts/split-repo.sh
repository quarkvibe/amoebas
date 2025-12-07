#!/bin/bash

###############################################################################
# Amoeba Repository Split Script
# 
# Purpose: Split current private repo into:
#   1. ameoba_client (PUBLIC) - Product only, for NPM
#   2. ameoba_v2.0 (PRIVATE) - Platform + business logic
#
# Usage: ./split-repo.sh
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
CURRENT_REPO="/Users/suncatsolutionsllc/ameoba_v2.0"
PUBLIC_REPO_NAME="ameoba_client"
PUBLIC_REPO_PATH="/tmp/${PUBLIC_REPO_NAME}"
GITHUB_ORG="quarkvibe"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         Amoeba Repository Split Script                    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

###############################################################################
# Step 1: Verify current repository
###############################################################################

echo -e "${YELLOW}[1/8] Verifying current repository...${NC}"

if [ ! -d "$CURRENT_REPO" ]; then
    echo -e "${RED}Error: Current repo not found at $CURRENT_REPO${NC}"
    exit 1
fi

cd "$CURRENT_REPO"

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo -e "${RED}Error: You have uncommitted changes. Please commit or stash them first.${NC}"
    git status
    exit 1
fi

echo -e "${GREEN}✓ Current repository verified${NC}"
echo ""

###############################################################################
# Step 2: Create clean copy for public repo
###############################################################################

echo -e "${YELLOW}[2/8] Creating clean copy for public repository...${NC}"

# Remove existing temp directory if it exists
if [ -d "$PUBLIC_REPO_PATH" ]; then
    echo -e "${YELLOW}Removing existing temp directory...${NC}"
    rm -rf "$PUBLIC_REPO_PATH"
fi

# Clone current repo to temp location
git clone "$CURRENT_REPO" "$PUBLIC_REPO_PATH"
cd "$PUBLIC_REPO_PATH"

echo -e "${GREEN}✓ Clean copy created at $PUBLIC_REPO_PATH${NC}"
echo ""

###############################################################################
# Step 3: Remove platform-specific files
###############################################################################

echo -e "${YELLOW}[3/8] Removing platform-specific files...${NC}"

# Remove platform directories
PLATFORM_DIRS=(
    "landing"
    "admin"
    "marketplace"
    "analytics"
    "platform"
    "scripts/deployment"
    "docs-internal"
    "attached_assets"
    "ephemeris_data"
)

for dir in "${PLATFORM_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo "  Removing: $dir/"
        rm -rf "$dir"
    fi
done

# Remove platform-specific files
PLATFORM_FILES=(
    ".env"
    ".env.production"
    ".env.staging"
    "docker-compose.prod.yml"
    "nginx.prod.conf"
    "Dockerfile.prod"
)

for file in "${PLATFORM_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  Removing: $file"
        rm -f "$file"
    fi
done

# Remove platform-specific pages from client
PLATFORM_PAGES=(
    "client/src/pages/pricing.tsx"
    "client/src/pages/contact-sales.tsx"
    "client/src/pages/admin-dashboard.tsx"
)

for page in "${PLATFORM_PAGES[@]}"; do
    if [ -f "$page" ]; then
        echo "  Removing: $page"
        rm -f "$page"
    fi
done

# Remove internal documentation
rm -f INTERNAL_*.md
rm -f SESSION_*.md
rm -f FINAL_SESSION_*.md
rm -f BUILD_STATUS.md
rm -f TYPESCRIPT_*.md
rm -f CRITICAL_REVIEW.md
rm -f HONEST_ASSESSMENT.md
rm -f MARKETING_*.md
rm -f HACKER_NEWS_POST.md
rm -f PRODUCT_HUNT_*.md
rm -f DEPLOYMENT_GUIDE*.md

echo -e "${GREEN}✓ Platform files removed${NC}"
echo ""

###############################################################################
# Step 4: Update package.json for public repo
###############################################################################

echo -e "${YELLOW}[4/8] Updating package.json...${NC}"

# Update repository URL in package.json
if [ -f "package.json" ]; then
    # Use sed to update repository URL
    sed -i '' 's|quarkvibe/ameoba_v2.0|quarkvibe/ameoba_client|g' package.json
    sed -i '' 's|"name": "amoeba-cli"|"name": "@quarkvibe/amoeba"|g' package.json
    echo -e "${GREEN}✓ package.json updated${NC}"
else
    echo -e "${RED}Warning: package.json not found${NC}"
fi

echo ""

###############################################################################
# Step 5: Update README for public repo
###############################################################################

echo -e "${YELLOW}[5/8] Creating public README...${NC}"

cat > README.md << 'EOF'
# 🦠 Amoeba - AI Content Platform

[![npm version](https://badge.fury.io/js/%40quarkvibe%2Famoeba.svg)](https://www.npmjs.com/package/@quarkvibe/amoeba)
[![License](https://img.shields.io/badge/License-Amoeba%20Community-blue.svg)](LICENSE)

**AI content generation platform with multi-channel delivery, SMS control, and BYOK.**

Generate content with AI, deliver via email/SMS/voice/webhooks, control from your phone. Self-hosted with complete cost control.

> **Note:** Amoeba is **source-available** (not open source). Free tier available. Paid features require a license key. See [LICENSE](LICENSE) and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

---

## 🚀 Quick Start

### Install via NPM

```bash
# Install globally
npm install -g @quarkvibe/amoeba

# Initialize Amoeba
amoeba init

# Start the server
amoeba start
```

Visit **http://localhost:5000**

**That's it!** Free tier active immediately. Add your OpenAI key and start generating.

### Install from Source

```bash
git clone https://github.com/quarkvibe/ameoba_client.git
cd ameoba_client
npm install
npm run dev
```

---

## 💰 Pricing

### FREE (No License Required)
- ✅ 10 AI generations per month
- ✅ 3 content templates
- ✅ 2 data sources
- ✅ Email delivery only
- ✅ Community support

### PRO ($29/month)
- ✅ Unlimited generations
- ✅ All delivery channels (SMS, voice, social media)
- ✅ SMS commands
- ✅ Webhooks
- ✅ Priority support

### BUSINESS ($99/month)
- ✅ Everything in Pro
- ✅ White-label
- ✅ Multi-instance
- ✅ SLA

### ENTERPRISE (Custom)
- ✅ Everything in Business
- ✅ Dedicated support
- ✅ Custom development

[View Full Pricing →](https://quarkvibe.com/pricing)

---

## 📚 Documentation

- [Quick Start Guide](docs/QUICK_START.md)
- [CLI Commands](docs/guides/CLI_COMMANDS.md)
- [Architecture](ARCHITECTURE.md)
- [Licensing FAQ](LICENSING_FAQ.md)
- [Contributing](CONTRIBUTING.md)

---

## 🤝 Support

- **Documentation**: [/docs](/docs)
- **Issues**: [GitHub Issues](https://github.com/quarkvibe/ameoba_client/issues)
- **Discussions**: [GitHub Discussions](https://github.com/quarkvibe/ameoba_client/discussions)
- **Email**: support@quarkvibe.com
- **Website**: https://quarkvibe.com

---

## 📜 License

Amoeba Community License v1.0 - see [LICENSE](LICENSE) for details.

**Source-available, not open source.** Free tier available. Paid features require license key.

---

**Made with ❤️ by QuarkVibe Inc.**
EOF

echo -e "${GREEN}✓ README.md updated for public repo${NC}"
echo ""

###############################################################################
# Step 6: Update .gitignore
###############################################################################

echo -e "${YELLOW}[6/8] Updating .gitignore...${NC}"

cat >> .gitignore << 'EOF'

# Platform-specific (should not exist in public repo)
landing/
admin/
marketplace/
analytics/
platform/
docs-internal/

# Deployment
scripts/deployment/
*.prod.yml
nginx.prod.conf
Dockerfile.prod

# Internal docs
INTERNAL_*.md
SESSION_*.md
DEPLOYMENT_GUIDE*.md
EOF

echo -e "${GREEN}✓ .gitignore updated${NC}"
echo ""

###############################################################################
# Step 7: Commit changes
###############################################################################

echo -e "${YELLOW}[7/8] Committing changes...${NC}"

git add -A
git commit -m "refactor: create public client repository

- Removed platform-specific files (landing, admin, marketplace)
- Removed internal documentation
- Updated package.json for public distribution
- Updated README for end users
- Prepared for NPM publishing as @quarkvibe/amoeba

This is the public, source-available version of Amoeba.
Platform infrastructure remains in private ameoba_v2.0 repo."

echo -e "${GREEN}✓ Changes committed${NC}"
echo ""

###############################################################################
# Step 8: Summary and next steps
###############################################################################

echo -e "${YELLOW}[8/8] Summary${NC}"
echo ""
echo -e "${GREEN}✓ Public repository prepared at: $PUBLIC_REPO_PATH${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo ""
echo "1. Create public GitHub repository:"
echo "   ${YELLOW}https://github.com/new${NC}"
echo "   Name: ${GREEN}ameoba_client${NC}"
echo "   Visibility: ${GREEN}Public${NC}"
echo ""
echo "2. Push to GitHub:"
echo "   ${YELLOW}cd $PUBLIC_REPO_PATH${NC}"
echo "   ${YELLOW}git remote set-url origin https://github.com/$GITHUB_ORG/ameoba_client.git${NC}"
echo "   ${YELLOW}git push -u origin main${NC}"
echo ""
echo "3. Publish to NPM:"
echo "   ${YELLOW}cd $PUBLIC_REPO_PATH${NC}"
echo "   ${YELLOW}npm login${NC}"
echo "   ${YELLOW}npm publish --access public${NC}"
echo ""
echo "4. Add as submodule to private repo:"
echo "   ${YELLOW}cd $CURRENT_REPO${NC}"
echo "   ${YELLOW}git submodule add https://github.com/$GITHUB_ORG/ameoba_client.git client-product${NC}"
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    IMPORTANT NOTES                         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}• Review the files in $PUBLIC_REPO_PATH before pushing${NC}"
echo -e "${YELLOW}• Make sure no secrets or private data are included${NC}"
echo -e "${YELLOW}• Test the build: npm run build${NC}"
echo -e "${YELLOW}• Test locally: npm pack && npm install -g ./quarkvibe-amoeba-*.tgz${NC}"
echo ""
echo -e "${GREEN}Repository split complete! 🎉${NC}"
echo ""
