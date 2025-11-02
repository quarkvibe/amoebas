# 🚀 Amoeba: Quick Start Guide
**Get from 0 to Running in 30 Minutes**

---

## 📋 Prerequisites

- ✅ Node.js 18+ installed
- ✅ npm 9+ installed
- ✅ Git installed
- ⚠️ PostgreSQL database (we'll set this up)

---

## ⚡ 30-Minute Setup

### Step 1: Environment Variables (5 minutes)

```bash
# 1. Copy example env file
cp .env.example .env

# 2. Generate encryption key
node -e "console.log('ENCRYPTION_KEY=' + require('crypto').randomBytes(32).toString('hex'))" >> .env

# 3. Generate session secret
node -e "console.log('SESSION_SECRET=' + require('crypto').randomBytes(32).toString('hex'))" >> .env
```

### Step 2: Database Setup (10 minutes)

**Option A: Neon.tech (Recommended - Free Forever)**

```bash
# 1. Go to https://neon.tech
# 2. Sign up (free)
# 3. Create new project: "amoeba-dev"
# 4. Copy connection string
# 5. Add to .env:
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/amoeba?sslmode=require"
```

**Option B: Local PostgreSQL**

```bash
# macOS
brew install postgresql@16
brew services start postgresql@16
createdb amoeba_dev

# Add to .env:
DATABASE_URL="postgresql://localhost/amoeba_dev"

# Linux (Ubuntu/Debian)
sudo apt install postgresql
sudo systemctl start postgresql
sudo -u postgres createdb amoeba_dev

# Add to .env:
DATABASE_URL="postgresql://localhost/amoeba_dev"
```

### Step 3: Install & Build (10 minutes)

```bash
# Install dependencies
npm install

# Push database schema
npm run db:push

# Build application
npm run build
```

### Step 4: Run (5 minutes)

```bash
# Development mode (with hot reload)
npm run dev

# Open browser
# http://localhost:5000
```

---

## 🎯 First Steps in the App

### 1. Create Account
- Open http://localhost:5000
- Click "Sign Up"
- Enter email and password
- You're in!

### 2. Add AI Credential (BYOK - Bring Your Own Key)

**For OpenAI:**
```bash
# Go to: Dashboard → Settings → AI Credentials
# Click: "Add AI Credential"
# Provider: OpenAI
# Name: "My OpenAI"
# API Key: sk-proj-... (get from platform.openai.com/api-keys)
# Set as default: ✓
# Save
```

**For Ollama (Local - FREE!):**
```bash
# Install Ollama first
# macOS/Linux: https://ollama.ai
brew install ollama
ollama serve

# Pull a model
ollama pull llama2

# In Amoeba dashboard:
# Go to: Dashboard → Ollama Setup
# Click: "Pull Model" → llama2
# Wait for download
# Click: "Test Model"
```

### 3. Create Your First Template

```bash
# Go to: Dashboard → Content → Templates
# Click: "Create Template"

Name: Daily Blog Post
Description: Generates blog posts about AI

AI Prompt:
"""
Write a 300-word blog post about {{topic}}.

Include:
- Catchy headline
- 3 key points
- Call to action

Tone: {{tone}}
"""

Variables:
- topic (required)
- tone (required)

Settings:
- Model: gpt-4o-mini (or llama2 if using Ollama)
- Max Tokens: 500
- Temperature: 0.7

# Save
```

### 4. Generate Content

```bash
# Go to: Dashboard → Content → Generate
# Select template: "Daily Blog Post"
# Fill variables:
  topic: "The Future of AI Agents"
  tone: "enthusiastic and informative"
# Click: "Generate"
# Wait 3-10 seconds
# View result!
```

### 5. Set Up Email Delivery (Optional)

**For SendGrid:**
```bash
# Go to: Dashboard → Settings → Email Credentials
# Click: "Add Email Credential"
# Provider: SendGrid
# API Key: SG.xxx (get from sendgrid.com)
# From Email: your@email.com
# From Name: Your Name
# Set as default: ✓
# Save

# Now go to: Dashboard → Output Channels
# Click: "Create Channel"
# Type: Email
# Name: "My Email List"
# Recipients: your@email.com, friend@email.com
# Subject: "Daily AI Blog Post"
# Save

# Next generation will be delivered via email!
```

### 6. Schedule Recurring Job

```bash
# Go to: Dashboard → Schedules
# Click: "Create Schedule"

Name: Daily Blog Post
Template: Daily Blog Post
Cron Expression: 0 9 * * * (every day at 9 AM)
Variables:
  topic: "Latest AI news"
  tone: "professional"
Enabled: ✓

# Save
# Job will run automatically every day at 9 AM!
```

---

## 🛠️ Common Issues & Solutions

### Issue: "Database connection failed"

```bash
# Check DATABASE_URL in .env
# Ensure Neon.tech database is running
# Test connection:
psql $DATABASE_URL -c "SELECT 1"
```

### Issue: "ENCRYPTION_KEY not set"

```bash
# Generate and add to .env:
node -e "console.log('ENCRYPTION_KEY=' + require('crypto').randomBytes(32).toString('hex'))" >> .env

# Restart server
```

### Issue: "OpenAI API error: 401"

```bash
# Invalid API key
# Go to: https://platform.openai.com/api-keys
# Generate new key
# Update in: Dashboard → Settings → AI Credentials
```

### Issue: "Ollama not found"

```bash
# Install Ollama:
brew install ollama  # macOS
# or download from https://ollama.ai

# Start Ollama server:
ollama serve

# Pull a model:
ollama pull llama2

# Test in Amoeba dashboard: Ollama Setup
```

### Issue: "Port 5000 already in use"

```bash
# Change port in .env:
PORT=3000

# Restart server
npm run dev
```

---

## 📚 Next Steps

### Beginner
- ✅ Create 3-5 templates
- ✅ Generate content with different AI models
- ✅ Set up email delivery
- ✅ Explore the terminal (Dashboard → Overview → Terminal)
- ✅ Try CLI commands: `npm run cli -- status`

### Intermediate
- ✅ Set up data sources (RSS feeds, APIs)
- ✅ Create complex templates with multiple variables
- ✅ Schedule recurring jobs
- ✅ Monitor real-time activity feed
- ✅ Try different AI providers (OpenAI, Anthropic, Ollama)

### Advanced
- ✅ Build custom integrations (webhooks)
- ✅ Use API directly (programmatic access)
- ✅ Deploy to production (AWS/Vercel)
- ✅ Set up license activation
- ✅ Contribute to open source

---

## 🎓 Learning Resources

### Documentation
- `README.md` - Project overview
- `ARCHITECTURE.md` - Cellular design philosophy
- `DEPLOYMENT_GUIDE.md` - Production deployment
- `CLI_COMMANDS.md` - CLI reference
- `COMPREHENSIVE_ANALYSIS_AND_IMPROVEMENT_PLAN.md` - Full analysis

### Video Tutorials (Coming Soon)
- Getting Started (5 min)
- Creating Templates (10 min)
- Setting Up Ollama (5 min)
- Scheduling Jobs (8 min)
- Email Integration (10 min)

### Community
- GitHub Discussions: (coming soon)
- Discord: (coming soon)
- Twitter: @AmoebaAI (coming soon)

---

## 💡 Pro Tips

### Tip 1: Use Ollama for Free AI
```bash
# No API costs!
ollama pull llama2        # 7B parameters, fast
ollama pull llama2:13b    # 13B parameters, better quality
ollama pull codellama     # Code generation
ollama pull mistral       # Great all-rounder
```

### Tip 2: Variable Substitution
```bash
# In templates, use {{variable_name}}
# Example:
"Write a {{length}} blog post about {{topic}} in a {{tone}} tone"

# Variables can be:
- Text: topic, tone, style
- Numbers: length, word_count
- JSON: data (for complex inputs)
```

### Tip 3: Terminal Commands
```bash
# In dashboard terminal, try:
status          # System health
templates       # List templates
generate <id>   # Generate content
jobs            # Scheduled jobs
db              # Database info
help            # All commands
```

### Tip 4: API Usage
```bash
# Generate content programmatically:
curl -X POST http://localhost:5000/api/content/generate \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=..." \
  -d '{
    "templateId": "template-id",
    "variables": {
      "topic": "AI agents",
      "tone": "professional"
    }
  }'
```

### Tip 5: Backup Your Templates
```bash
# Export templates as JSON:
# Dashboard → Templates → Select template → Export
# Saved as: template-name.json

# Import later:
# Dashboard → Templates → Import → Select file
```

---

## 🚀 You're Ready!

**Congratulations!** You've set up Amoeba and generated your first AI content.

**Next steps:**
1. Explore different AI models
2. Create complex templates
3. Set up automated workflows
4. Share your templates with the community

**Questions?**
- Check `COMPREHENSIVE_ANALYSIS_AND_IMPROVEMENT_PLAN.md`
- Review `README.md`
- Open GitHub issue (coming soon)

**Happy creating!** 🦠

---

**Made with ❤️ by the Amoeba community**

