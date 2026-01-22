# One-Click OneDrive Link Refresh - Admin Panel Setup

## ✅ What You Get

A button in your Admin Panel that:
- ✅ Authenticates you with Microsoft (popup)
- ✅ Gets a fresh OneDrive share link
- ✅ Auto-updates GitHub secret `ONEDRIVE_LINK`
- ✅ Takes 10 seconds total

**No more manual secret updates!**

## 📋 One-Time Setup (5 minutes)

### Step 1: Update Azure App (Add Redirect URI)

1. Go to [Azure Portal](https://portal.azure.com)
2. Find your app: **Boiler Monitoring GitHub Actions**
3. Go to **Authentication** → **Add a platform** → **Single-page application**
4. Add redirect URI: `https://your-domain.com/auth-callback.html`
   - For local testing: `http://localhost:5173/auth-callback.html`
5. Enable **Access tokens** and **ID tokens**
6. Click **Save**

### Step 2: Create GitHub Personal Access Token

1. Go to [GitHub Settings → Tokens](https://github.com/settings/tokens)
2. Click **Generate new token** → **Generate new token (classic)**
3. Name: `OneDrive Link Auto-Updater`
4. Select scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `admin:repo_hook` (Full control of repository hooks)
5. Click **Generate token**
6. **Copy the token** (you won't see it again!)

### Step 3: Configure in Admin Panel

1. Open your app → **Admin Panel** → **🔗 OneDrive** tab
2. Fill in the configuration:

   **Azure Configuration:**
   - Client ID: (from Azure app Overview page)
   - Tenant ID: (from Azure app Overview page)

   **GitHub Configuration:**
   - Repository Owner: `your-username`
   - Repository Name: `boiler-monitoring-interface`
   - Personal Access Token: (paste the token from Step 2)

   **OneDrive File:**
   - Excel Filename: `REPORT DAILY BULAN 2026 - 01 JANUARI.xlsx`
   - Note: File can be in any folder (searches entire OneDrive)

3. Click **💾 Save Configuration**

## 🎯 Usage

When your share link expires:

1. Go to **Admin Panel** → **🔗 OneDrive** tab
2. Click **🔄 Refresh OneDrive Link**
3. Microsoft login popup appears → Sign in
4. ✅ Done! GitHub secret updated automatically

Next hourly sync will use the fresh link!

## 🔧 How It Works

```
User clicks button
  ↓
Microsoft auth popup (10 sec)
  ↓
Gets access token
  ↓
Calls Graph API to create share link
  ↓
Updates GitHub secret via API
  ↓
Success! ✅
```

## ⚠️ Important Notes

### Security
- GitHub token stored in **browser localStorage** (encrypted in transit)
- Only stored on your device
- Never committed to Git
- Can be cleared anytime

### Permissions
- GitHub token needs `repo` scope to update secrets
- Azure app needs `Files.Read.All` to access OneDrive

### Troubleshooting

**"Popup blocked"**
- Allow popups for your domain
- Try again

**"Authentication failed"**
- Check Azure redirect URI matches exactly
- Ensure app has correct permissions

**"Failed to update GitHub secret"**
- Verify GitHub token has correct scopes
- Check repository owner/name are correct

**"File not found"**
- Ensure filename matches exactly (case-sensitive)
- Check for extra spaces in filename
- Script searches entire OneDrive, not just root

## 🎉 Benefits Over Manual Method

| Manual | Auto-Refresh |
|--------|-------------|
| Open OneDrive | Click button |
| Copy link | Sign in popup |
| Go to GitHub | Done! ✅ |
| Find secret |  |
| Edit secret |  |
| Paste link |  |
| Save |  |
| **~2 minutes** | **~10 seconds** |

12x faster! 🚀
