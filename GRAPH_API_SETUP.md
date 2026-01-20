# Microsoft Graph API Setup Guide

## Overview

This guide explains how to set up Microsoft Graph API authentication to access Excel files from OneDrive programmatically. This enables the Boiler Operation Monitoring Interface to automatically fetch real data from your OneDrive folder.

## Architecture

```
┌─────────────────────────────────────────┐
│   Boiler Monitoring Interface (React)   │
│   - Calls Graph API via graphApiService │
│   - Handles OAuth2 authentication flow  │
│   - Downloads Excel files from OneDrive │
└────────────┬────────────────────────────┘
             │ HTTPS
             ↓
┌─────────────────────────────────────────┐
│   Microsoft Graph API (v1.0)            │
│   - /me/drive/root/children             │
│   - /me/drive/items/{fileId}            │
│   - Download URL generation             │
└────────────┬────────────────────────────┘
             │ HTTPS
             ↓
┌─────────────────────────────────────────┐
│   Microsoft Azure Active Directory      │
│   - OAuth 2.0 token generation          │
│   - Tenant verification                 │
└────────────┬────────────────────────────┘
             │
             ↓
         OneDrive
```

## Step 1: Register Application in Azure

### 1a. Create Azure Account
1. Go to [Azure Portal](https://portal.azure.com)
2. Sign in with your Microsoft account (same account owning the OneDrive folder)
3. Create a free subscription if you don't have one

### 1b. Register New Application
1. Navigate to **Azure Active Directory** → **App registrations**
2. Click **New registration**
3. Fill in the form:
   - **Name:** `Boiler Monitoring Interface`
   - **Supported account types:** `Accounts in this organizational directory only`
   - **Redirect URI:** 
     - **Platform:** Web
     - **URI:** `http://localhost:5173/callback` (for development)
4. Click **Register**

### 1c. Note Your Credentials
After registration, you'll see the Overview page. **Copy and save these values:**

```
Tenant ID (Directory ID):     [xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx]
Application ID (Client ID):   [xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx]
```

### 1d. Create Client Secret
1. Go to **Certificates & secrets**
2. Click **New client secret**
3. Set expiration to **24 months** (or your preference)
4. Click **Add**
5. **Copy the secret value immediately** (it won't be visible again)

```
Client Secret Value:          [xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx]
```

## Step 2: Configure Application Permissions

### 2a. Add Microsoft Graph API Permissions
1. Go to **API permissions**
2. Click **Add a permission**
3. Select **Microsoft Graph**
4. Choose **Delegated permissions**
5. Search for and select:
   - `Files.Read`
   - `Sites.Read.All`
   - `User.Read`
   - `offline_access` (for refresh tokens)
6. Click **Add permissions**

### 2b. Grant Admin Consent (if needed)
If your organization requires admin consent:
1. Click **Grant admin consent for [Organization]**
2. Confirm the action

## Step 3: Create Environment Configuration File

Create a `.env` file in the project root directory:

```bash
# File: .env

# Microsoft Graph API Configuration
VITE_MS_GRAPH_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
VITE_MS_GRAPH_TENANT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
VITE_MS_GRAPH_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Application URLs
VITE_APP_REDIRECT_URI=http://localhost:5173/callback
```

**IMPORTANT:** Add `.env` to `.gitignore` to prevent committing secrets:

```bash
echo ".env" >> .gitignore
```

## Step 4: Load Environment Variables in Vite

Update `vite.config.ts` to ensure environment variables are loaded:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_MS_GRAPH_CLIENT_ID': JSON.stringify(process.env.VITE_MS_GRAPH_CLIENT_ID),
    'import.meta.env.VITE_MS_GRAPH_TENANT_ID': JSON.stringify(process.env.VITE_MS_GRAPH_TENANT_ID),
  }
})
```

## Step 5: Update OneDrive Service to Use Graph API

The `graphApiService.ts` is now available. To integrate it with the boiler data fetching:

```typescript
// In src/App.tsx or oneDriveService.ts

import { graphApiService } from './services/graphApiService'
import { parseExcelFile } from './services/oneDriveService'

async function fetchBoilerDataFromOneDrive(monthFolderName: string) {
  try {
    // Check authentication
    if (!graphApiService.isAuthenticated()) {
      throw new Error('Please authenticate with OneDrive first')
    }

    // Find the month folder (e.g., "01 JANUARY 2026")
    const monthFolderId = await graphApiService.findFolder(monthFolderName)
    if (!monthFolderId) {
      throw new Error(`Folder '${monthFolderName}' not found`)
    }

    // Find Excel files
    const ngSteamFileId = await graphApiService.findFile(monthFolderId, 'NGSTEAM RATIO.xlsx')
    const waterSteamFileId = await graphApiService.findFile(monthFolderId, 'WATER_STEAM RATIO.xlsx')

    if (!ngSteamFileId || !waterSteamFileId) {
      throw new Error('Excel files not found in OneDrive folder')
    }

    // Download files
    const ngSteamUrl = await graphApiService.getFileDownloadUrl(ngSteamFileId)
    const waterSteamUrl = await graphApiService.getFileDownloadUrl(waterSteamFileId)

    const ngSteamBuffer = await graphApiService.downloadFile(ngSteamUrl)
    const waterSteamBuffer = await graphApiService.downloadFile(waterSteamUrl)

    // Parse Excel data
    const boilerData = parseExcelFile({
      ngSteam: new Uint8Array(ngSteamBuffer),
      waterSteam: new Uint8Array(waterSteamBuffer)
    })

    return boilerData
  } catch (error) {
    console.error('Error fetching boiler data:', error)
    throw error
  }
}
```

## Step 6: Create Authentication Callback Handler

Create `src/pages/Callback.tsx` to handle OAuth redirect:

```typescript
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { graphApiService } from '../services/graphApiService'

export function Callback() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Extract authorization code from URL
        const params = new URLSearchParams(window.location.search)
        const code = params.get('code')
        const error = params.get('error')

        if (error) {
          console.error('OAuth error:', error)
          navigate('/login?error=' + error)
          return
        }

        if (!code) {
          throw new Error('No authorization code received')
        }

        // Exchange code for token
        const clientSecret = import.meta.env.VITE_MS_GRAPH_CLIENT_SECRET
        await graphApiService.exchangeCodeForToken(code, clientSecret)

        // Redirect to dashboard
        navigate('/dashboard')
      } catch (error) {
        console.error('Authentication error:', error)
        navigate('/login?error=auth_failed')
      }
    }

    handleCallback()
  }, [navigate])

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontSize: '18px'
    }}>
      Processing authentication...
    </div>
  )
}
```

## Step 7: Add Login Button to App

Add authentication initiation to your app UI:

```typescript
import { graphApiService } from './services/graphApiService'

function LoginButton() {
  const handleLogin = () => {
    const loginUrl = graphApiService.getLoginUrl()
    window.location.href = loginUrl
  }

  return (
    <button onClick={handleLogin} className="btn-primary">
      Sign in with OneDrive
    </button>
  )
}
```

## Testing the Integration

### Test 1: Authentication
1. Start dev server: `npm run dev`
2. Click "Sign in with OneDrive"
3. Verify redirect to Microsoft login
4. Sign in with your account
5. Verify redirect back to application

### Test 2: File Retrieval
After authentication:
1. Check browser console for any errors
2. Verify Graph API calls in Network tab
3. Confirm Excel files are downloaded
4. Verify boiler data displays on dashboard

### Test 3: Data Parsing
1. Verify correct columns are extracted (NGSTEAM RATIO columns E-P, WATER_STEAM RATIO columns G, M, S)
2. Check boiler status indicators match data values
3. Confirm timestamps match Excel data dates

## Troubleshooting

### Issue: "CORS error" or "Failed to fetch"
**Solution:** 
- Graph API endpoints require valid access token
- Verify token is not expired
- Check browser console for detailed error message
- Ensure Client Secret is correctly configured

### Issue: "File not found"
**Solution:**
- Verify folder and file names match exactly (case-sensitive on Graph API)
- Check OneDrive folder structure matches expected layout
- Verify Excel files are named exactly `NGSTEAM RATIO.xlsx` and `WATER_STEAM RATIO.xlsx`

### Issue: "Invalid permission"
**Solution:**
- Go back to Azure Portal → App registrations
- Verify API permissions include `Files.Read` and `Sites.Read.All`
- Grant admin consent if required by your organization
- Wait 5-10 minutes for permissions to propagate

### Issue: Token keeps expiring
**Solution:**
- Implement token refresh logic using `refreshToken()` method
- Store refresh token in secure storage (httpOnly cookie preferred)
- Add refresh logic before API call if token is close to expiration

## Security Best Practices

### Development vs Production

**Development Configuration (.env):**
- Use `http://localhost:5173/callback`
- Store secrets locally only (never commit)
- Use Client Secret directly (acceptable for dev)

**Production Configuration:**
- Use `https://yourdomain.com/callback`
- Use **Client Credentials Flow** or **Refresh Token Flow**
- Store Client Secret in secure environment variables (Azure Key Vault, AWS Secrets Manager)
- Never expose Client Secret in frontend code
- Implement backend proxy server to exchange tokens securely

### Environment Variables Pattern

Never do this in production:
```typescript
// ❌ DON'T: Embedding secrets in frontend
const secret = 'my-secret-key-12345'
```

Do this instead:
```typescript
// ✅ DO: Load from environment only, never expose
const secret = import.meta.env.VITE_MS_GRAPH_CLIENT_SECRET
```

## Deployment Configuration

When deploying to production:

### Azure Static Web Apps
```bash
# In Azure Portal or via Azure CLI
az staticwebapp appsettings set \
  --resource-group mygroup \
  --name myapp \
  --setting-names VITE_MS_GRAPH_CLIENT_ID=xxx VITE_MS_GRAPH_TENANT_ID=yyy
```

### Netlify
Add environment variables in Netlify dashboard:
- Settings → Build & Deploy → Environment
- Add `VITE_MS_GRAPH_CLIENT_ID` and `VITE_MS_GRAPH_TENANT_ID`

### Vercel
Create `.env.local` or set in project settings:
```
VITE_MS_GRAPH_CLIENT_ID=xxx
VITE_MS_GRAPH_TENANT_ID=yyy
```

## Next Steps

1. ✅ Set up Azure App Registration (Steps 1-2)
2. ✅ Create `.env` file with credentials (Step 3)
3. ✅ Update `src/services/oneDriveService.ts` to use Graph API
4. ✅ Add login flow to App component
5. ✅ Create Callback component for OAuth redirect
6. ✅ Test authentication and file retrieval
7. ✅ Validate boiler data extraction
8. Deploy to production

## Additional Resources

- [Microsoft Graph API Documentation](https://docs.microsoft.com/en-us/graph/api/overview)
- [Azure AD OAuth 2.0 Flow](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow)
- [OneDrive Files API](https://docs.microsoft.com/en-us/graph/api/resources/driveitem)
- [Graph Explorer Tool](https://developer.microsoft.com/en-us/graph/graph-explorer) - Test API calls interactively

## Support

For issues or questions:
1. Check the Troubleshooting section above
2. Review Microsoft Graph API documentation
3. Check browser console for error details
4. Use Graph Explorer to debug API calls manually
