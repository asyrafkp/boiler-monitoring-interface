# Auto-Updating OneDrive Link Setup

## 🎯 Goal
Eliminate manual share link updates by using **delegated authentication** with a refresh token that automatically refreshes access.

## ✅ Benefits
- ✅ No more expired share links
- ✅ Automatic authentication renewal
- ✅ No manual GitHub secret updates needed
- ✅ Fully automated sync every hour

## 📋 One-Time Setup (5 minutes)

### Step 1: Update Azure App Permissions

1. Go to [Azure Portal](https://portal.azure.com)
2. Find your app registration: **Boiler Monitoring GitHub Actions**
3. Go to **API permissions**
4. Click **Add a permission** → **Microsoft Graph** → **Delegated permissions**
5. Add these permissions:
   - `Files.Read.All`
   - `Sites.Read.All`
   - `offline_access` ⭐ (crucial for refresh token)
6. Click **Grant admin consent**

### Step 2: Enable Public Client Flow

1. In your Azure app registration, go to **Authentication**
2. Scroll to **Advanced settings**
3. Set **Allow public client flows** to **Yes**
4. Click **Save**

### Step 3: Run Setup Script Locally

Open PowerShell in your project folder:

```powershell
cd "d:\Documents\Program created\Boiler Operation Monitoring Interface"
python .github/scripts/setup_delegated_auth.py
```

**What happens:**
1. Script will show you a URL and code
2. Open the URL in your browser
3. Enter the code
4. Sign in with your Microsoft account (the one with OneDrive)
5. Grant permissions
6. Script will display your refresh token

### Step 4: Add Refresh Token to GitHub Secrets

1. Copy the refresh token from the script output
2. Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions**
3. Create a NEW secret:
   - **Name:** `AZURE_REFRESH_TOKEN`
   - **Value:** (paste the refresh token)
4. Click **Add secret**

### Step 5: Test the Workflow

1. Go to **Actions** tab
2. Click **"Sync OneDrive Excel to GitHub (Hourly)"**
3. Click **"Run workflow"** → **Run workflow**
4. Wait 30-60 seconds
5. Check the logs - should see:
   ```
   ✅ Access token obtained via refresh token
   ✅ Found: REPORT DAILY BULAN 2026 - 01 JANUARI.xlsx
   ✅ File saved: data/boiler_data.xlsx
   🎉 SUCCESS: Automatic sync using delegated auth
   ```

## ✅ Done!

Your OneDrive sync will now run automatically every hour without any manual intervention. The refresh token:
- **Never expires** (as long as used within 90 days)
- **Automatically refreshes** access tokens
- **No share link needed**

## 🔧 Troubleshooting

### "Refresh token auth failed"
- Make sure `offline_access` permission is granted
- Re-run setup script to get a new refresh token

### "File not found"
- Check `ONEDRIVE_FILE_NAME` secret matches your exact filename
- Make sure file is in OneDrive root folder

### Still using share link?
- Confirm `AZURE_REFRESH_TOKEN` secret is set
- Check workflow logs to see which auth method was used

## 🔐 Security Notes

- Refresh token gives access to your OneDrive files
- Store it securely in GitHub secrets only
- Never commit it to Git
- It has same permissions as your Microsoft account
- You can revoke it anytime in Azure Portal

## 📊 How It Works

```
1. GitHub Actions runs hourly
2. Script uses refresh token to get fresh access token
3. Access token downloads latest Excel from OneDrive
4. Parses data and updates JSON files
5. Commits changes to GitHub
6. Your interface shows fresh data
```

No manual intervention needed! 🎉
