# 🌐 Multi-Service Deployment Guide

**How to deploy Amoeba alongside existing services on the same server**

---

## 🎯 THE CHALLENGE

You want to run Amoeba on a server that already hosts:
- Your main website (example.com)
- API services (api.example.com)
- Admin panels
- Other applications

**How do they coexist?** This guide shows you how.

---

## 📊 DEPLOYMENT SCENARIOS

### Scenario A: Fresh Server (Simplest)

**You have:** Empty server, no other services

**Solution:** Direct access
```bash
# Amoeba runs on port 5000
# Access at: http://YOUR_SERVER_IP:5000

No nginx needed initially
No DNS needed initially
Just works! ✅
```

**Pros:** Simple, fast setup  
**Cons:** Not production-ready (no HTTPS, exposes port)

---

### Scenario B: Server with Existing Website

**You have:**
- Main website at example.com (runs on port 3000)
- Nginx routing port 80/443 → port 3000

**Solution:** Add subdomain with nginx
```bash
# Main site:    example.com → nginx → port 3000
# Amoeba:       amoeba.example.com → nginx → port 5000

Both services run happily ✅
```

**Steps:**
1. Configure DNS (amoeba.example.com → server IP)
2. Add nginx config for amoeba subdomain
3. Reload nginx
4. Access at https://amoeba.example.com

---

### Scenario C: Multiple Services on Server

**You have:**
- Main site: example.com → port 3000
- API: api.example.com → port 4000
- Admin: admin.example.com → port 8000
- Now adding: Amoeba

**Solution:** Another subdomain
```bash
# Nginx routes by subdomain:
example.com       → port 3000 (main site)
api.example.com   → port 4000 (API)
admin.example.com → port 8000 (admin)
amoeba.example.com → port 5000 (Amoeba) ← NEW
```

**All services independent, all accessible!** ✅

---

## 🔧 AMOEBA DEPLOYMENT WIZARD

### Built-In Deployment Detection

**Dashboard → Deployment** shows:

```
Deployment Health: 85/100 🟢

Current Configuration:
├─ Amoeba Port: 5000
├─ Port Available: ✅ Yes
├─ Public IP: 192.168.1.100
├─ Nginx: ✅ Installed & Running
├─ SSL: ❌ Not Configured
└─ Suggested Subdomain: amoeba.yourdomain.com

Detected Services:
├─ nginx (Port 80, 443)
├─ node (Port 3000) - Your main site
└─ postgres (Port 5432)

Recommendations:
1. Configure nginx reverse proxy ✅
2. Set up DNS for amoeba.yourdomain.com
3. Obtain SSL certificate with Let's Encrypt
```

**Amoeba tells you EXACTLY what to do!** 🎯

---

## 📝 STEP-BY-STEP INTEGRATION

### Step 1: Check Current Status

**Via Dashboard:**
```
Dashboard → Deployment
- View deployment health
- See conflicting services (if any)
- Get personalized recommendations
```

**Via CLI:**
```bash
amoeba deployment analyze
# Shows port conflicts, nginx status, recommendations
```

**Via SMS:**
```
Text: "deployment status"
Reply: "Port 5000 available. Nginx installed. Need DNS config."
```

---

### Step 2: Choose Your Port

**If port 5000 is free:** Keep it! ✅

**If port 5000 is in use:**
```bash
# Option A: Change Amoeba's port
Dashboard → Environment
Find: PORT
Change: 5001 (or any available)
Save
Restart Amoeba

# Option B: Stop conflicting service (if not needed)
sudo systemctl stop <service-name>
```

---

### Step 3: Configure Nginx (Recommended)

**Why nginx?**
- ✅ Route multiple apps on one server
- ✅ Handle SSL in one place
- ✅ Load balancing
- ✅ Caching
- ✅ Professional setup

**Get nginx config:**
```
Dashboard → Deployment → Nginx Setup
- Click "Copy" on generated config
- Paste into /etc/nginx/sites-available/amoeba
- Enable site
- Reload nginx
```

**Amoeba generates the EXACT config you need!** 🎯

---

### Step 4: Configure DNS

**In your domain registrar (GoDaddy, Namecheap, Cloudflare):**

```
Add A Record:
├─ Type: A
├─ Name: amoeba (becomes amoeba.yourdomain.com)
├─ Points to: YOUR_SERVER_IP (shown in dashboard)
├─ TTL: 3600
└─ Save
```

**Amoeba dashboard shows your server IP and exact DNS settings!**

**Wait:** 5-30 minutes for DNS propagation

**Test:**
```bash
# Check if DNS is working:
ping amoeba.yourdomain.com

# Should show your server IP
```

---

### Step 5: Get SSL Certificate

**Once DNS is configured:**

```bash
# Amoeba provides the exact command:
sudo certbot --nginx -d amoeba.yourdomain.com

# Certbot will:
✅ Verify domain ownership
✅ Obtain SSL certificate
✅ Update nginx config automatically
✅ Configure HTTPS redirect
✅ Set up auto-renewal

# Done! Access: https://amoeba.yourdomain.com
```

---

## 🎯 EXAMPLE: Adding Amoeba to Existing Infrastructure

### Starting Point:
```
Your Server:
├─ Main website: example.com (port 3000)
├─ API: api.example.com (port 4000)
├─ Database: PostgreSQL (port 5432)
└─ Nginx: Routing port 80/443 to services
```

### After Adding Amoeba:
```
Your Server:
├─ Main website: example.com → port 3000
├─ API: api.example.com → port 4000
├─ Amoeba: amoeba.example.com → port 5000 ← NEW!
├─ Database: PostgreSQL (port 5432) - shared!
└─ Nginx: Routes all subdomains
```

### Nginx Configuration:
```nginx
# /etc/nginx/sites-available/main-site
server {
    listen 80;
    server_name example.com;
    location / {
        proxy_pass http://localhost:3000;
    }
}

# /etc/nginx/sites-available/api
server {
    listen 80;
    server_name api.example.com;
    location / {
        proxy_pass http://localhost:4000;
    }
}

# /etc/nginx/sites-available/amoeba (NEW!)
server {
    listen 80;
    server_name amoeba.example.com;
    location / {
        proxy_pass http://localhost:5000;
        # WebSocket support for terminal
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
    }
}
```

**All three services run independently!** ✅

---

## 🔍 CONFLICT DETECTION

### Amoeba Automatically Detects:

**Port Conflicts:**
```
❌ Port 5000 in use by: node (PID 1234)
→ Recommendation: Change PORT to 5001 in Environment settings
```

**Missing Nginx:**
```
⚠️ Nginx not installed
→ Recommendation: Install nginx for production deployment
→ Command: sudo apt install nginx
```

**DNS Not Configured:**
```
⚠️ amoeba.yourdomain.com doesn't resolve to this server
→ Your Server IP: 192.168.1.100
→ DNS points to: Not configured
→ Action: Add A record in your domain registrar
```

**No SSL:**
```
⚠️ No SSL certificates found
→ Recommendation: Get free certificate with certbot
→ Command: sudo certbot --nginx -d amoeba.yourdomain.com
```

**Amoeba tells you EXACTLY what's wrong and how to fix it!** 🎯

---

## 💡 PRODUCTION-READY SETUP

### Recommended Configuration:

```
Domain Setup:
├─ yourdomain.com → Main website
├─ api.yourdomain.com → API services
├─ amoeba.yourdomain.com → Amoeba platform ← ADD THIS
└─ All with SSL (Let's Encrypt)

Server Configuration:
├─ Nginx → Reverse proxy for all
├─ Port 80/443 → Nginx (public)
├─ Ports 3000, 4000, 5000 → Apps (internal only)
└─ Firewall → Only 80, 443, 22 open

Security:
├─ SSL certificates (Let's Encrypt)
├─ Firewall (ufw or iptables)
├─ Internal ports not exposed
└─ Amoeba credentials encrypted
```

**Professional, secure, scalable!** ✅

---

## 🎯 QUICK REFERENCE

### Common Commands:

**Check port availability:**
```bash
lsof -i :5000  # See what's using port 5000
```

**Test nginx config:**
```bash
sudo nginx -t  # Validates configuration
```

**Reload nginx (after config changes):**
```bash
sudo systemctl reload nginx
```

**Check DNS:**
```bash
dig amoeba.yourdomain.com  # Shows DNS resolution
nslookup amoeba.yourdomain.com  # Alternative
```

**Test SSL:**
```bash
curl -I https://amoeba.yourdomain.com
# Should show: HTTP/2 200
```

---

## ✅ VERIFICATION CHECKLIST

After deployment:

- [ ] Amoeba starts without errors
- [ ] Port is available (no conflicts)
- [ ] Nginx is installed and running
- [ ] DNS resolves to correct IP (test: ping subdomain)
- [ ] HTTP access works (test: curl http://subdomain)
- [ ] SSL certificate obtained
- [ ] HTTPS access works (test: curl https://subdomain)
- [ ] WebSocket terminal works (Dashboard → Overview → Terminal)
- [ ] All features accessible via subdomain

---

## 🚨 TROUBLESHOOTING

### Issue: "Port Already in Use"
```
Error: EADDRINUSE: address already in use :::5000

Solutions:
1. Change PORT in Dashboard → Environment → PORT=5001
2. Or stop conflicting service: lsof -i :5000 (get PID), kill <PID>
3. Or use nginx reverse proxy (recommended)
```

### Issue: "DNS Not Resolving"
```
$ ping amoeba.yourdomain.com
ping: cannot resolve amoeba.yourdomain.com

Solutions:
1. Wait 30 minutes (DNS propagation)
2. Check DNS settings in registrar
3. Verify A record: dig amoeba.yourdomain.com
4. Clear local DNS cache: sudo systemd-resolve --flush-caches
```

### Issue: "SSL Certificate Failed"
```
Error: Challenge failed for domain amoeba.yourdomain.com

Solutions:
1. Ensure DNS is configured AND propagated (wait 30 min)
2. Ensure port 80 is open: sudo ufw allow 80
3. Ensure nginx is running: sudo systemctl status nginx
4. Check domain resolves: dig amoeba.yourdomain.com
```

---

## 🎯 DASHBOARD FEATURE

**Amoeba's Deployment Guide (Dashboard → Deployment):**

**Shows:**
- ✅ Current port and availability
- ✅ Detected conflicting services
- ✅ Nginx installation status
- ✅ SSL certificate status
- ✅ Public IP address
- ✅ Suggested subdomain
- ✅ Exact DNS configuration needed
- ✅ Generated nginx config (copy-paste ready!)
- ✅ Step-by-step instructions
- ✅ Health score (0-100)

**This is UNIQUE - no other platform has this!** 🏆

---

## 🚀 SUMMARY

**Amoeba seamlessly integrates with existing infrastructure:**
- ✅ Detects port conflicts
- ✅ Detects other services
- ✅ Suggests DNS configuration
- ✅ Generates nginx config
- ✅ Validates setup
- ✅ Provides step-by-step guidance

**All from the dashboard!** No guesswork, no trial-and-error.

**Access via:**
- Dashboard → Deployment (visual guide)
- CLI: `amoeba deployment analyze`
- SMS: Text "deployment status"

---

**Made with ❤️ by QuarkVibe Inc.**

