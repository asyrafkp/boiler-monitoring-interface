# OneDrive to GitHub Automated Sync Setup

This guide explains how to set up automated syncing of your OneDrive Excel files to GitHub, which then syncs to your Boiler Monitoring Interface.

## Architecture

```
OneDrive (Original File)
    ↓
GitHub Actions (Daily Auto-Sync)
    ↓
GitHub Repository (data/boiler_data.xlsx)
    ↓
Boiler Monitoring Interface
    ↓
Supabase Database
```

## Benefits

✅ OneDrive is your source of truth
✅ GitHub has version history & backups
✅ Automatic daily sync (no manual steps)
✅ App always has latest data
✅ Can manually trigger sync anytime

## Setup Steps

### Step 1: Add GitHub Secret

GitHub Actions needs your OneDrive link to access the file.

1. Go to: https://github.com/asyrafkp/boiler-monitoring-interface/settings/secrets/actions
2. Click **New repository secret**
3. Name: `ONEDRIVE_LINK`
4. Value: Paste your OneDrive folder link (provided to setup)
5. Click **Add secret**

### Step 2: Verify Workflow

1. Go to **Actions** tab in your GitHub repo
2. Look for **"Sync OneDrive Excel to GitHub"** workflow
3. You should see it's scheduled to run daily at 1 AM UTC

### Step 3: Test the Workflow

**Option A: Manual Trigger**
1. Go to **Actions** → **Sync OneDrive Excel to GitHub**
2. Click **Run workflow**
3. Watch the logs to verify it downloads successfully

**Option B: Wait for Schedule**
- Workflow runs automatically daily at 1 AM UTC
- Check the workflow runs in the Actions tab

### Step 4: Verify File in GitHub

1. Go to your GitHub repo
2. Look for `data/boiler_data.xlsx`
3. If present, ✅ sync is working!

## How Sync Works

**Daily Workflow:**
```
1. GitHub Actions runs (1 AM UTC daily)
2. Downloads latest Excel from OneDrive
3. Stores as data/boiler_data.xlsx
4. Commits to GitHub main branch
5. Your app reads from GitHub
```

**In Your App:**
```
1. Admin clicks "Sync from GitHub"
2. App fetches from GitHub
3. Data syncs to Supabase
4. Dashboard updates automatically
```

## Adjusting Sync Schedule

To change sync time (default: 1 AM UTC):

1. Go to `.github/workflows/sync-onedrive.yml`
2. Find the `cron` line (around line 8)
3. Modify the cron expression:
   - `0 1 * * *` = 1 AM UTC daily
   - `0 9 * * *` = 9 AM UTC daily
   - `0 */4 * * *` = Every 4 hours
   - [Cron cheat sheet](https://crontab.guru/)
4. Commit and push

## Monitoring

**View sync status:**
1. Go to GitHub repo → **Actions** tab
2. Click on **"Sync OneDrive Excel to GitHub"**
3. See all sync runs (success/failure)
4. Click run to see detailed logs

**Troubleshooting:**
- ✅ Green checkmark = Sync successful
- ❌ Red X = Sync failed (check logs for details)

## Manual Upload Alternative

If automated sync doesn't work:

1. Download latest Excel from OneDrive
2. Go to GitHub repo
3. Navigate to `data/` folder
4. Click **Add file** → **Upload files**
5. Select your Excel file
6. Commit changes
7. In your app: Click "Sync from GitHub"

## File Expectations

The Excel file must have:
- **Sheet 1:** NGSTEAM RATIO
  - Columns E-P: B1, B2, B3 steam data
- **Sheet 2:** WATER_STEAM RATIO
  - Columns G, M, S: B1, B2, B3 water data

## Limitations & Notes

⚠️ **OneDrive Share Link Limits:**
- Direct API access to share links is limited
- If automated download fails, fall back to manual upload
- For production, consider Microsoft Graph API integration

✅ **Recommended Approach:**
- Use automated workflow for convenience
- Have manual upload as backup
- Check status weekly in GitHub Actions

## Security

🔒 **Your OneDrive Link:**
- Stored as GitHub Secret (encrypted)
- Only accessible to GitHub Actions
- Never exposed in logs or code
- Can be rotated anytime

🔒 **No Sensitive Data:**
- Only stores operational data
- No credentials or secrets in files
- Can be public or private repo

## Support

For issues:
1. Check GitHub Actions logs
2. Verify OneDrive link is correct
3. Try manual upload as fallback
4. Contact development team if stuck

---

**Next Steps:**
1. Add GitHub Secret (ONEDRIVE_LINK)
2. Trigger workflow manually to test
3. In the app: Admin → ⚙️ → Sync from GitHub
4. Verify data appears in Supabase
