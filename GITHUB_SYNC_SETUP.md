# GitHub Sync Setup Guide

This guide explains how to set up GitHub-based Excel file syncing for your Boiler Monitoring Interface.

## Why GitHub Sync?

✅ **Completely FREE** - No API keys or authentication needed
✅ **Automatic** - App checks GitHub regularly for updates
✅ **Simple** - Just commit Excel files to your repo
✅ **Auditable** - Full version history in Git

## Setup Steps

### 1. Create Data Folder in GitHub

1. Go to your GitHub repo: https://github.com/asyrafkp/boiler-monitoring-interface
2. Click **Add file** → **Create new file**
3. Type: `data/boiler_data.xlsx` in the filename field
4. This creates the `data/` folder

### 2. Upload Excel File

1. Go to the `data/` folder in GitHub
2. Click **Add file** → **Upload files**
3. Select your Excel file (`boiler_data.xlsx`)
4. The file must have:
   - **NGSTEAM RATIO** sheet with columns E-P
   - **WATER_STEAM RATIO** sheet with columns G, M, S
5. Click **Commit changes**

### 3. Sync in Your App

1. Log in as **admin** to the Boiler Monitoring Interface
2. Click the **⚙️** button (Admin Panel)
3. Scroll to **🔗 Sync from GitHub**
4. Click **📥 Sync from GitHub**
5. App fetches the latest file automatically
6. Data syncs to Supabase
7. Dashboard updates instantly

## How It Works

**Flow:**
```
You upload Excel to GitHub
        ↓
You click "Sync from GitHub"
        ↓
App fetches file from GitHub (raw content URL)
        ↓
App parses Excel data
        ↓
Data stored in Supabase
        ↓
Dashboard updates with latest data
```

## Updating Data

**To update boiler data:**

1. Download current `data/boiler_data.xlsx` from GitHub
2. Update values in Excel
3. Upload updated file to GitHub `data/` folder (overwrites old file)
4. In the app: Click "Sync from GitHub"
5. ✅ New data is live!

## File Path

The app expects: `data/boiler_data.xlsx` in the main branch

If you want a different path, contact the development team.

## Troubleshooting

**Error: "File not found"**
- Check that `data/boiler_data.xlsx` exists in your GitHub repo
- Make sure you're on the `main` branch

**Error: "Missing sheet"**
- Excel file must have both sheets:
  - NGSTEAM RATIO
  - WATER_STEAM RATIO
- Column positions must match

**Sync shows "failed"**
- Check the sync history table in Admin Panel
- Verify Excel file format
- Try uploading again

## Security Notes

✅ **Public Repository** - File is readable by anyone (no sensitive data)
✅ **No Credentials** - App doesn't need GitHub token
✅ **Read-Only** - App only reads, never writes to GitHub

## Advanced

### Using GitHub Token (Optional)

If you want to use a private repository or higher rate limits:

1. Create GitHub Personal Access Token
2. Set environment variable: `VITE_GITHUB_TOKEN`
3. Contact the dev team for implementation

### Automated Sync

The app can be configured to auto-sync on a schedule (e.g., every hour).
Contact the development team if you need this feature.

---

**Questions?** Check the GitHub repo or contact the development team.
