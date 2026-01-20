# Deploying to Supabase/Vercel - Complete Guide

## TL;DR - Deploy in 5 Minutes

```bash
# 1. Push code to GitHub
git init && git add . && git commit -m "App ready"
git remote add origin https://github.com/YOUR_USERNAME/boiler-monitoring.git
git push -u origin main

# 2. Go to vercel.com/new → Import repo
# 3. Add env vars (see below)
# 4. Click Deploy
# 5. Done! Get URL like https://boiler-monitoring-xxx.vercel.app
```

---

## Why Supabase + Vercel?

| Feature | Vercel | Supabase |
|---------|--------|----------|
| **Hosting** | ✅ Perfect for React | ⏳ Can host, but limited |
| **Database** | ❌ No | ✅ PostgreSQL included |
| **Auth** | ❌ No | ✅ Great auth system |
| **Free Tier** | ✅ Generous | ✅ Good |
| **Setup Time** | ⚡ 2 min | ⏱️ 10 min |
| **Recommended** | ⭐⭐⭐ | ⭐⭐ |

**Best Setup:** **Vercel for frontend** + **Supabase backend (optional future)**

---

## Option 1: Deploy on Vercel (Recommended)

### Prerequisites
1. GitHub account (free at github.com)
2. Vercel account (free at vercel.com)
3. Your GitHub repo created and pushed

### Step-by-Step

#### 1. Create GitHub Repository

```bash
cd "d:\Documents\Program created\Boiler Operation Monitoring Interface"
git init
git config user.name "Your Name"
git config user.email "your.email@example.com"
git add .
git commit -m "Boiler monitoring interface - ready for deployment"
```

Then on GitHub.com:
1. Click "New Repository"
2. Name: `boiler-monitoring-interface`
3. Copy the commands:
```bash
git remote add origin https://github.com/YOUR_USERNAME/boiler-monitoring-interface.git
git branch -M main
git push -u origin main
```

#### 2. Deploy on Vercel

1. Go to **https://vercel.com/new**
2. Click "Continue with GitHub"
3. Authorize GitHub access
4. Find and select your `boiler-monitoring-interface` repo
5. Click "Import"

**Configure Project:**
- Framework: **Vite** (auto-detected)
- Build Command: `npm run build` (auto-detected)
- Output Directory: `dist` (auto-detected)
- Install Command: `npm install` (auto-detected)

**Add Environment Variables:**
Click "Environment Variables" and add:
```
VITE_MS_GRAPH_TENANT_ID = your_tenant_id_value
VITE_MS_GRAPH_CLIENT_ID = your_client_id_value
```

(Get these from Azure Portal → App Registrations → Your App)

**Deploy:**
- Click "Deploy" button
- Wait 2-3 minutes for build to complete
- ✅ Get your live URL!

#### 3. Update Azure Redirect URI

1. Go to **https://portal.azure.com**
2. Find your App Registration
3. Click "Authentication" in left menu
4. In "Redirect URIs" section, add:
   ```
   https://your-vercel-domain.vercel.app/callback
   ```
   (Replace with your actual Vercel domain from step 2)
5. Click "Save"

#### 4. Test Production App

1. Open your Vercel URL in browser
2. Test login:
   - Admin: `admin` / `admin123`
   - User: `user` / `user123`
3. Admin: Test "Sign in with OneDrive" button
4. Verify dashboard loads and displays mock data

✅ **You're live!**

---

## Option 2: Deploy on Supabase

Supabase offers similar deployment but is more suited for full-stack apps.

### Prerequisites
1. Supabase account (free at supabase.com)
2. GitHub repository ready

### Steps

1. Go to **https://app.supabase.com**
2. Click "Deployments" (if available) or "Integrations"
3. Connect GitHub repository
4. Configure:
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add env vars (same as Vercel)
6. Deploy

**Same redirect URI update needed in Azure.**

---

## Option 3: Custom Domain (All Platforms)

### For Vercel:

1. In Vercel dashboard, go to **Settings** → **Domains**
2. Click "Add"
3. Enter your domain (e.g., `boiler.company.com`)
4. Follow DNS setup instructions
5. Wait 24-48 hours for DNS propagation
6. Update Azure redirect URI to custom domain

---

## After Deployment Checklist

```
☐ App loads at production URL
☐ Can login with admin account
☐ Can login with user account
☐ Admin can see OneDrive button
☐ User sees "View Only Mode"
☐ Logout works
☐ No console errors (F12)
☐ Images/logos load correctly
☐ Azure redirect URI updated
```

---

## Updating Your App

Once deployed, any push to GitHub auto-triggers a new deploy:

```bash
# Make changes locally
nano src/App.tsx  # or use VS Code

# Commit and push
git add .
git commit -m "Update feature"
git push origin main

# 🚀 Vercel auto-deploys (2-3 min)
# View build progress in Vercel dashboard
```

---

## Monitoring & Logs

### View Deployment Logs

**Vercel:**
1. Dashboard → Deployments → [Latest build]
2. Click "Logs" to see build output
3. Look for `✓ built in Xs` for success

**Check Errors:**
- Production URL → Open in browser
- Press F12 for DevTools
- Check "Console" tab for errors

### Monitor Performance

**Vercel Analytics:**
1. Dashboard → Analytics
2. Shows:
   - Response times
   - Traffic patterns
   - Error rates
   - Geographic distribution

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **Build fails** | Check Vercel logs. Usually missing env vars. |
| **Can't login to OneDrive** | Verify Azure redirect URI includes Vercel domain. |
| **OneDrive button missing (admin)** | Check `VITE_MS_GRAPH_TENANT_ID` env var is set. |
| **Images don't load** | Check public folder is deployed. Verify asset paths. |
| **App loads blank** | Open F12 console → check for errors. |

### Debug OneDrive Auth

If "Sign in with OneDrive" doesn't work:

1. **Check env vars in Vercel:**
   - Dashboard → Settings → Environment Variables
   - Verify `VITE_MS_GRAPH_TENANT_ID` and `VITE_MS_GRAPH_CLIENT_ID` are set

2. **Check Azure redirect URI:**
   - Portal → App Registrations → Authentication
   - Redirect URI should be: `https://your-vercel-app.vercel.app/callback`

3. **Check browser console:**
   - Press F12 → Console tab
   - Look for error messages
   - Screenshot and share for debugging

---

## Future: Add Supabase Backend

When ready for backend services:

```bash
npm install @supabase/supabase-js
```

Then update `.env`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

This enables:
- Real database for user management
- Real-time data sync across devices
- File storage
- Edge functions

See `SUPABASE_DEPLOYMENT.md` for full guide.

---

## Support Resources

- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Azure Portal:** https://portal.azure.com
- **GitHub:** https://github.com
- **Vite Docs:** https://vitejs.dev

---

## Quick Links After Deployment

Once live, save these:

- **Production App:** https://your-vercel-domain.vercel.app
- **Vercel Dashboard:** https://vercel.com/dashboard
- **GitHub Repo:** https://github.com/YOUR_USERNAME/boiler-monitoring-interface
- **Azure App Registration:** https://portal.azure.com (search "app registrations")

---

**Ready? Start with Step 1: Create GitHub Repository above!**

Questions? See `QUICK_DEPLOY.md` or check `ARCHITECTURE.md` for deeper details.
