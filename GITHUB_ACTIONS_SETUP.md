# GitHub Actions Auto-Sync Setup Guide

## Overview
This guide sets up automatic hourly sync from OneDrive Excel to your Supabase database via GitHub Actions.

**What happens:**
- ⏰ Every hour, GitHub Actions runs
- 📥 Downloads latest Excel from your OneDrive link
- 📊 Parses boiler data
- 💾 Stores in Supabase
- 📈 Dashboard auto-updates

---

## Setup Steps

### Step 1: Get Your Supabase Keys

1. Go to [Supabase Dashboard](https://supabase.com)
2. Select your project
3. Click **Settings** (gear icon) → **API**
4. Copy these two values:
   - **Project URL** (e.g., `https://jcqtprgemoqifpdtsitw.supabase.co`)
   - **Service role secret** (scroll down, labeled "Service role secret")
   
⚠️ **IMPORTANT:** Use **Service Role Secret**, NOT the anon key
- Service role has full access (needed for GitHub Actions)
- Anon key respects RLS policies (won't work for automated writes)

---

### Step 2: Add GitHub Secrets

1. Go to your GitHub repo
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"** and add these 3 secrets:

#### Secret 1: `ONEDRIVE_LINK`
- **Value:** Your OneDrive Excel file share link
- **Get it:** OneDrive → Right-click Excel file → Share → Copy link
- **Example:** `https://1drv.ms/x/c/B6A282DAF4E2A35F/...`

#### Secret 2: `SUPABASE_URL`
- **Value:** Your Supabase Project URL (from Step 1)
- **Example:** `https://jcqtprgemoqifpdtsitw.supabase.co`

#### Secret 3: `SUPABASE_SERVICE_ROLE_KEY`
- **Value:** Your Supabase Service Role Secret (from Step 1)
- **Example:** `eyJhbGc...` (long string)

---

### Step 3: Disable RLS on boiler_readings Table

RLS (Row Level Security) prevents automated inserts. We bypass this with the service role key, but the table must allow it.

1. Go to Supabase Dashboard → **SQL Editor**
2. Paste and execute:

```sql
ALTER TABLE boiler_readings DISABLE ROW LEVEL SECURITY;
```

3. Done! ✅

---

### Step 4: Test the Workflow

1. Go to GitHub → **Actions** tab
2. Select **"Sync OneDrive Excel to GitHub (Hourly)"**
3. Click **"Run workflow"**
4. Wait 30-60 seconds for completion
5. Check **workflow logs** for success message

**Expected output:**
```
✅ Data successfully stored in Supabase
📅 Timestamp: 2026-01-21T12:34:56.789Z
```

---

## Automatic Scheduling

Once setup is complete:
- ✅ Runs **every hour at minute 0**
- ✅ Downloads from OneDrive
- ✅ Syncs to Supabase
- ✅ Dashboard updates automatically
- ✅ No manual intervention needed

---

## Troubleshooting

### ❌ "Secret not found" or "Missing environment variables"
**Fix:** Verify all 3 secrets are added correctly in GitHub Settings

### ❌ "Failed to download from OneDrive (403/404)"
**Causes:**
1. OneDrive link is incorrect
2. File is not publicly shared
3. Link format is wrong

**Fix:**
- Get fresh link from OneDrive
- Ensure file is shared (right-click → Share)
- Test link in browser first

### ❌ "Could not find required sheets"
**Fix:** Excel file must have:
- Sheet named **"NGSTEAM RATIO"** (or containing "ngsteam")
- Sheet named **"WATER_STEAM RATIO"** (or containing "water")

### ❌ "RLS policy violation"
**Fix:** Run this in Supabase SQL Editor:
```sql
ALTER TABLE boiler_readings DISABLE ROW LEVEL SECURITY;
```

### ✅ Workflow succeeded but dashboard shows old data
- Hard refresh browser (Ctrl+Shift+R)
- Wait 30 seconds for Netlify cache to clear
- Reload page

---

## Manual Trigger

Need to sync outside the hourly schedule?

1. Go to GitHub → **Actions**
2. Select **"Sync OneDrive Excel to GitHub (Hourly)"**
3. Click **"Run workflow"** button
4. Syncs immediately ✅

---

## Security Notes

- 🔒 **Service Role Secret** is highly privileged - keep it secret!
- 🔒 Only stored in GitHub encrypted secrets (not visible in logs)
- 🔒 Suggested to rotate regularly (Supabase settings)
- ✅ Fine to use this for data syncing from OneDrive

---

## Support

**Workflow not running?**
- Check Actions tab for disabled workflows
- Verify secrets are set
- Check workflow file syntax in `.github/workflows/sync-onedrive.yml`

**Data not appearing in Supabase?**
- Check workflow logs for errors
- Verify Excel has correct sheet names
- Ensure RLS is disabled on boiler_readings table

**Questions?**
- Check workflow logs: GitHub → Actions → Latest run → Expand steps
- Review this guide step by step
