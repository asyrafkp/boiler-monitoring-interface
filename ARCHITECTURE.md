# Architecture & Deployment Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT LAYERS                        │
└─────────────────────────────────────────────────────────────┘

TIER 1: FRONTEND (React + TypeScript)
├── Components (UI)
│   ├── LoginPage (2-factor: Admin/User)
│   ├── BoilerCard (Live dashboard cards)
│   ├── StatusOverview (System KPIs)
│   └── AppHeader (User profile + controls)
├── State Management
│   ├── AuthContext (Session management)
│   └── React Hooks (Local state)
└── Services
    ├── graphApiService.ts (OAuth2 + Graph API)
    ├── oneDriveService_v2.ts (Excel parsing)
    └── Utils (formatting, helpers)

        ↓ DEPLOYED ON ↓

TIER 2: HOSTING (Vercel/Supabase/Netlify)
├── Build Pipeline
│   ├── Vite bundler (fast builds)
│   ├── TypeScript compiler
│   └── Output: /dist folder
├── CDN & Caching
│   ├── Global edge locations
│   ├── Automatic gzip compression
│   └── HTTP/2 support
└── Environment Variables
    ├── VITE_MS_GRAPH_TENANT_ID
    └── VITE_MS_GRAPH_CLIENT_ID

        ↓ INTEGRATES WITH ↓

TIER 3: EXTERNAL SERVICES
├── Microsoft Graph API
│   ├── OAuth 2.0 authentication
│   ├── OneDrive file access
│   └── Excel data parsing
├── Azure AD
│   ├── User authentication
│   ├── Token management
│   └── Consent flow
└── OneDrive (Your Data)
    ├── /Monthly Folders/
    │   ├── 01 JANUARY 2026/
    │   │   ├── NGSTEAM RATIO.xlsx
    │   │   └── WATER_STEAM RATIO.xlsx
    │   └── ...
    └── Row 506: Hourly data
```

---

## Deployment Options

### Option A: Vercel (Recommended) ⭐
**Best for:** React/Vite apps, simple setup, generous free tier

```
Your Code (GitHub)
       ↓
  Vercel CI/CD
       ↓
    Build (npm run build)
       ↓
   Deploy to Edge
       ↓
  Live at vercel.app
```

**Steps:**
1. Push to GitHub
2. Connect at vercel.com/new
3. Add env vars
4. Auto-deploy on push

**Features:**
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Preview deployments
- ✅ Free tier (unlimited deploys)
- ✅ 1-click rollback

**Pricing:**
- Free: Great for testing
- Pro: $20/month (optional)

---

### Option B: Supabase Deployments
**Best for:** Full-stack apps needing backend services

```
Your Code (GitHub)
       ↓
 Supabase Integrations
       ↓
    Build (npm run build)
       ↓
  Deploy to Supabase
       ↓
  Live with Backend DB
```

**Additional Features:**
- ✅ PostgreSQL database included
- ✅ Real-time subscriptions
- ✅ File storage
- ✅ Auth system
- ✅ Edge functions

**Future: Could replace localStorage auth with Supabase Auth**

---

### Option C: Docker + Self-Hosted
**Best for:** Full control, custom infrastructure

```
Dockerfile
    ↓
Build Docker Image
    ↓
Push to Registry
    ↓
Deploy on Server
    ↓
Your Domain
```

---

## Current Setup (Local)

```
Your Computer
    ↓
  npm run dev
    ↓
http://localhost:3000
    ↓
    ├─→ LOGIN
    │   ├─→ Admin (admin/admin123)
    │   └─→ User (user/user123)
    │
    ├─→ DASHBOARD
    │   ├─→ 3 Boiler Cards
    │   ├─→ Status Overview
    │   └─→ System Metrics
    │
    └─→ ONEDRIVE (Admin only)
        ├─→ OAuth Login
        ├─→ Fetch Excel Files
        └─→ Parse Row 506 Data
```

---

## Post-Deployment Setup

### 1. Azure OAuth Configuration

```
Production URL: https://boiler-monitoring.vercel.app

Azure App Registration:
├── Client ID: [in .env]
├── Tenant ID: [in .env]
├── Redirect URIs:
│   ├── http://localhost:3000/callback (dev)
│   └── https://boiler-monitoring.vercel.app/callback (prod)
└── Permissions:
    ├── Files.Read
    ├── Sites.Read.All
    └── offline_access
```

### 2. Environment Setup

**Local Development (.env):**
```
VITE_MS_GRAPH_TENANT_ID=xxx
VITE_MS_GRAPH_CLIENT_ID=xxx
```

**Production (Vercel env vars):**
```
VITE_MS_GRAPH_TENANT_ID=xxx
VITE_MS_GRAPH_CLIENT_ID=xxx
```

### 3. Data Flow in Production

```
User Login (Vercel)
    ↓
AuthContext (localStorage)
    ↓ (if Admin)
OneDrive OAuth Flow
    ↓
Microsoft Graph API
    ↓
OneDrive (fetches Excel files)
    ↓
XLSX Parser (extracts row 506)
    ↓
Dashboard Display (real-time)
    ↓
Auto-refresh every hour
```

---

## Key Files & Their Roles

| File | Purpose | Deployed? |
|------|---------|-----------|
| `src/App.tsx` | Main component | ✅ Yes |
| `src/pages/LoginPage.tsx` | Authentication UI | ✅ Yes |
| `src/contexts/AuthContext.tsx` | Session management | ✅ Yes |
| `src/services/graphApiService.ts` | OAuth2 client | ✅ Yes |
| `src/services/oneDriveService_v2.ts` | Excel fetching | ✅ Yes |
| `src/components/*.tsx` | UI components | ✅ Yes |
| `.env` | Secrets (DO NOT DEPLOY) | ❌ No |
| `node_modules/` | Dependencies | ❌ No |
| `dist/` | Built app | ✅ Yes (auto) |

---

## Security Checklist

### Frontend Security
- ✅ No API keys hardcoded in code
- ✅ Environment variables used for secrets
- ✅ HTTPS enforced in production
- ✅ localStorage cleared on logout
- ✅ TypeScript for type safety

### Backend Security (Future)
- ⏳ Could add rate limiting
- ⏳ Could add request logging
- ⏳ Could add DDoS protection

### Data Security
- ✅ OneDrive handles encryption
- ✅ OAuth2 for secure auth
- ✅ CORS configured
- ✅ No sensitive data in localStorage

---

## Monitoring & Maintenance

### Before Production
```
Local Testing
    ↓
npm run build (verify)
    ↓
npm run dev (test build)
    ↓
Login test (admin + user)
    ↓
OneDrive auth test
    ↓
Ready to deploy
```

### After Deployment
```
Vercel Dashboard
    ├─ Monitor build logs
    ├─ Check error rates
    ├─ Track page performance
    └─ Review deployment history
```

---

## Scaling for the Future

### Stage 1: Current (Deployed)
- ✅ Frontend: React app on Vercel
- ✅ Auth: Local (localStorage)
- ✅ Data: OneDrive Excel files
- ✅ Users: 1-10 users

### Stage 2: Backend Integration
- ⏳ Add Supabase PostgreSQL
- ⏳ Replace localStorage auth with Supabase Auth
- ⏳ Store boiler data in database
- ⏳ Support 10-100 users

### Stage 3: Real-time Features
- ⏳ Supabase real-time subscriptions
- ⏳ Live alerts & notifications
- ⏳ Multi-user dashboard sync
- ⏳ Support 100+ users

### Stage 4: Enterprise
- ⏳ Custom domain
- ⏳ SSO integration
- ⏳ Advanced analytics
- ⏳ Uptime monitoring

---

## Quick Reference

### Deploy Updates
```bash
# Make changes locally
git add .
git commit -m "Update features"
git push origin main
# → Vercel auto-deploys (2-3 min)
```

### View Logs
```
Vercel Dashboard → Deployments → [Latest] → Logs
```

### Rollback
```bash
git revert HEAD
git push origin main
# → Vercel auto-deploys previous version
```

### Monitor Performance
```
Vercel Dashboard → Analytics
# Shows: Response times, traffic, errors
```

---

**Ready to Deploy? See QUICK_DEPLOY.md for 5-minute setup guide!**
