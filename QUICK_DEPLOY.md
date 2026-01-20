# Quick Deploy to Supabase/Vercel

## 5-Minute Deployment Guide

### Step 1: Push to GitHub (2 min)

```bash
# In your project directory
git init
git add .
git commit -m "Boiler monitoring app"
git remote add origin https://github.com/YOUR_USERNAME/boiler-monitoring.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy on Vercel (2 min)

**Why Vercel?** It's optimized for React/Vite and integrates perfectly with Supabase.

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Paste your GitHub repo URL: `https://github.com/YOUR_USERNAME/boiler-monitoring.git`
4. Click "Import"

**Configure Build Settings:**
- Framework: **Vite**
- Build Command: `npm run build` (auto-detected)
- Output Directory: `dist` (auto-detected)

**Add Environment Variables:**
- Click "Environment Variables"
- Add `VITE_MS_GRAPH_TENANT_ID=your_value`
- Add `VITE_MS_GRAPH_CLIENT_ID=your_value`
- Click "Deploy"

⏳ Wait 2-3 minutes for deployment...

### Step 3: Update Azure OAuth Redirect (1 min)

1. Go to Azure Portal → App Registrations
2. Find your app registration
3. Go to **Authentication** → **Redirect URIs**
4. Add: `https://your-vercel-domain.vercel.app/callback`
   - (Vercel gives you a domain like `boiler-monitoring-abc123.vercel.app`)

### Done! 🎉

Your app is now live at your Vercel domain!

---

## Using with Supabase Backend (Optional)

Supabase is great for:
- User authentication (replaces localStorage)
- Real-time data sync
- File storage
- Edge functions

**To add Supabase later:**

```bash
npm install @supabase/supabase-js
```

Then create `.env.local`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

See `SUPABASE_DEPLOYMENT.md` for full integration guide.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Build fails | Check env vars are set in Vercel dashboard |
| Can't login | Ensure Azure OAuth redirect URI includes Vercel domain |
| OneDrive not working | Verify VITE_MS_GRAPH_* env vars are correct |
| Page loads blank | Check browser console (F12) for errors |

---

## Get Your Deployed URL

After deployment, Vercel gives you a URL like:
- `https://boiler-monitoring-abc123.vercel.app`

Share this with your team!

---

## Custom Domain (Optional)

1. In Vercel dashboard, go to **Settings** → **Domains**
2. Add your custom domain (e.g., `boiler.company.com`)
3. Update DNS records with your provider
4. Wait 24-48 hours for DNS propagation

Then update Azure redirect URI to your custom domain.
