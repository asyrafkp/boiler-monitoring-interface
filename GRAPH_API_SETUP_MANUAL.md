# Microsoft Graph API Setup for OneDrive Integration

## Step 1: Create Azure App Registration

1. Go to [Azure Portal](https://portal.azure.com)
2. Search for "App registrations" → Click **New registration**
3. Fill in details:
   - **Name**: `Boiler Monitoring GitHub Actions`
   - **Supported account types**: `Accounts in this organizational directory only`
   - Click **Register**

## Step 2: Configure App Permissions

1. In your app registration, go to **API permissions**
2. Click **Add a permission**
3. Select **Microsoft Graph**
4. Choose **Delegated permissions**
5. Search and add:
   - `Files.Read.All` (Read files in OneDrive)
   - `Sites.Read.All` (Read SharePoint sites)
6. Click **Grant admin consent** (if you're the admin)

## Step 3: Create Client Secret

1. Go to **Certificates & secrets**
2. Click **New client secret**
3. Set expiration: **24 months** (longer-lasting)
4. Copy the **Value** (not the ID) - you'll need this

## Step 4: Collect Your Credentials

You'll need these for GitHub secrets:

- **Tenant ID**: Go to **Overview** tab, copy `Directory (tenant) ID`
- **Client ID**: From **Overview** tab, copy `Application (client) ID`
- **Client Secret**: From Step 3 above
- **OneDrive File ID**: Get from your OneDrive file's URL or use the folder structure

## Step 5: Get Your OneDrive File ID

### Option A: From OneDrive URL
1. Open your `boiler_data.xlsx` in OneDrive
2. Look at the URL: `https://...&id=XXXX_XXXX`
3. The `id` parameter is your **File ID**

### Option B: List files via Graph API
Your admin can use this to find the exact file ID

## Step 6: Add to GitHub Secrets

1. Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Add these secrets:
   - `AZURE_TENANT_ID`: Your Tenant ID
   - `AZURE_CLIENT_ID`: Your Client ID  
   - `AZURE_CLIENT_SECRET`: Your Client Secret
   - `ONEDRIVE_FILE_ID`: Your file ID (or keep using the share link for now)

## Next Steps

Once you provide these credentials, I'll update the GitHub Actions workflow to use Microsoft Graph API instead of share links.
