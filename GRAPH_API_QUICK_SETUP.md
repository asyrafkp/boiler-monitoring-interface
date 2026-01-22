# Setup Microsoft Graph API for OneDrive Integration

## Quick Setup (Follow in Order)

### 1️⃣ Create Azure App Registration

Visit: https://portal.azure.com

1. Search "App registrations" → **New registration**
2. Name: `Boiler Monitoring GitHub Actions`
3. Account type: `Accounts in this organizational directory only`
4. Click **Register**

### 2️⃣ Configure Permissions

In your new app registration:

1. Go to **API permissions**
2. Click **Add a permission** → **Microsoft Graph**
3. Select **Delegated permissions**
4. Add these permissions:
   - `Files.Read.All`
   - `Sites.Read.All`
5. Click **Grant admin consent**

### 3️⃣ Create Client Secret

1. Go to **Certificates & secrets**
2. **New client secret** 
3. Expiration: **24 months**
4. **Copy the Value** (NOT the ID)

### 4️⃣ Gather Your Credentials

From the app registration **Overview** page:

```
✅ Tenant ID: Directory (tenant) ID
✅ Client ID: Application (client) ID
✅ Client Secret: From step 3 above
```

### 5️⃣ Add GitHub Secrets

Go to: **GitHub repo** → **Settings** → **Secrets and variables** → **Actions**

Create these 3 secrets:

| Secret Name | Value |
|---|---|
| `AZURE_TENANT_ID` | Your Tenant ID |
| `AZURE_CLIENT_ID` | Your Client ID |
| `AZURE_CLIENT_SECRET` | Your Client Secret |

**Optional** (if you want to keep share link as fallback):
- Keep `ONEDRIVE_LINK` if you still have it

### ✅ Done!

GitHub Actions will now use your Microsoft account to access OneDrive directly. No more expired share links!

## How It Works

1. **GitHub Actions** authenticates with Microsoft Graph API using your credentials
2. **Searches** for `boiler_data.xlsx` in your OneDrive root
3. **Downloads** the latest file automatically
4. **Parses** it and generates JSON files
5. **Commits** and pushes the data to GitHub

## Troubleshooting

### "Authentication failed"
- Check credentials are correct in GitHub secrets
- Verify they're in the right secret names

### "boiler_data.xlsx not found"
- Make sure the file is in your **OneDrive root folder**
- Not in subfolders

### Still seeing old data
- Wait for next scheduled run (hourly at :00 minute)
- Or manually trigger: **Actions** tab → **Sync OneDrive Excel** → **Run workflow**

## File Permissions

The app registration has **read-only** access to your files—it can only download, not modify or delete anything.
