# Supabase Deployment Guide

This guide walks you through deploying the Boiler Operation Monitoring Interface to Supabase.

## Prerequisites
- GitHub account (required for Supabase integration)
- Supabase account (free at supabase.com)
- Node.js and npm installed locally

## Step 1: Prepare Your Project for GitHub

```bash
# Initialize git repo if not already done
git init
git add .
git commit -m "Initial commit: Boiler monitoring app with auth"
```

Create a `.gitignore` file (if you don't have one):
```
node_modules/
dist/
.env
.env.local
.DS_Store
```

## Step 2: Push to GitHub

1. Go to https://github.com/new and create a new repository
2. Name it: `boiler-monitoring-interface`
3. Copy the commands shown and run them:

```bash
git remote add origin https://github.com/YOUR_USERNAME/boiler-monitoring-interface.git
git branch -M main
git push -u origin main
```

## Step 3: Create Supabase Project

1. Go to https://supabase.com and sign up/login
2. Click "New Project"
3. Fill in details:
   - Project name: `boiler-monitoring`
   - Database password: Create a strong password
   - Region: Select closest to you
4. Wait for project creation (5-10 minutes)

## Step 4: Deploy Frontend to Supabase

### Option A: Using Supabase Deployments (Recommended)

1. In Supabase dashboard, go to **Integrations** → **GitHub**
2. Authorize GitHub connection
3. Select your repository
4. Configure build settings:
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
   - **Install command:** `npm install`

5. Add environment variables in Supabase:
```
VITE_MS_GRAPH_TENANT_ID=your_tenant_id
VITE_MS_GRAPH_CLIENT_ID=your_client_id
```

6. Click "Deploy" and wait for build to complete

### Option B: Using Vercel (Alternative - Often Easier)

1. Go to https://vercel.com/import
2. Import your GitHub repository
3. Set Build settings:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add environment variables
5. Deploy

## Step 5: Update OneDrive Configuration

After deployment, update your OAuth redirect URI:

1. Go to Azure Portal → Your App Registration
2. Update **Redirect URIs** to include your deployed URL:
   - Add: `https://your-domain.vercel.app/callback` (if using Vercel)
   - OR: `https://your-domain.supabase.co/callback` (if using Supabase)

## Step 6: Environment Variables

Create a `.env.production` file locally (don't commit):
```
VITE_MS_GRAPH_TENANT_ID=your_tenant_id
VITE_MS_GRAPH_CLIENT_ID=your_client_id
```

## Step 7: Optional - Use Supabase for Authentication

To replace localStorage auth with Supabase Auth:

1. Install Supabase client:
```bash
npm install @supabase/supabase-js
```

2. Create `.env.local`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

3. Create `src/services/supabaseClient.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
```

4. Update `AuthContext.tsx` to use Supabase Auth instead of localStorage

## Troubleshooting

**Build fails:**
- Check console for errors
- Ensure all environment variables are set
- Verify `vite.config.ts` is correct

**Can't fetch OneDrive data:**
- Verify OAuth redirect URI is correct
- Check Azure app permissions
- Ensure environment variables are loaded

**Logo/assets not loading:**
- Check build output directory is `dist`
- Verify asset paths in public folder

## Production Checklist

- ✅ Environment variables configured
- ✅ Build completes successfully
- ✅ Deployed URL accessible
- ✅ OAuth redirect URI updated
- ✅ Login functionality works
- ✅ OneDrive integration working
- ✅ Performance optimized

## Custom Domain (Optional)

Both Supabase and Vercel support custom domains:

1. Update DNS records with provider
2. Add custom domain in platform settings
3. Wait for DNS propagation (24-48 hours)

## Next Steps

1. Test app at deployed URL
2. Verify authentication works
3. Test OneDrive data fetching
4. Share deployed link with team
