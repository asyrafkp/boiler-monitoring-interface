# Quick Start: Microsoft Graph API Integration

## What's Been Done

✅ **GraphApiService Created** (`src/services/graphApiService.ts`)
- OAuth 2.0 authentication flow
- Token management (acquisition, refresh, validation)
- OneDrive file discovery and download
- Direct Graph API calls for folder/file operations

✅ **Configuration Files Created**
- `.env.example` - Template for environment variables
- `vite.config.ts` - Updated for environment variable loading
- `GRAPH_API_SETUP.md` - Comprehensive setup documentation

✅ **Build System Ready**
- All TypeScript compiles successfully
- Production build: 148.55 KB (47.32 KB gzipped)

## What You Need to Do (5 minutes)

### Step 1: Azure Setup (3 minutes)
1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to: **Azure Active Directory** → **App registrations** → **New registration**
3. Configure:
   - **Name:** `Boiler Monitoring Interface`
   - **Redirect URI:** `http://localhost:5173/callback`
4. Go to **Certificates & secrets**, create **New client secret**
5. Copy and save: **Tenant ID**, **Client ID**, **Client Secret** (found in Overview page)

### Step 2: Create `.env` File (1 minute)
1. Copy `.env.example` to `.env` in project root:
   ```bash
   cp .env.example .env
   ```
2. Fill in the values from Step 1:
   ```
   VITE_MS_GRAPH_TENANT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   VITE_MS_GRAPH_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   VITE_MS_GRAPH_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
3. Add `.env` to `.gitignore`:
   ```bash
   echo ".env" >> .gitignore
   ```

### Step 3: Add Permissions in Azure (1 minute)
1. Go to **API permissions**
2. Click **Add a permission** → **Microsoft Graph**
3. Select **Delegated permissions**
4. Add: `Files.Read`, `Sites.Read.All`, `offline_access`
5. Click **Grant admin consent** if available

## Integration with Your App

### Option A: Use as Standalone Module (Simple)

```typescript
import { graphApiService } from './services/graphApiService'

// Login
const loginUrl = graphApiService.getLoginUrl()
window.location.href = loginUrl  // User signs in, redirects to callback

// After auth, fetch data
async function getBoilerData() {
  try {
    // Find the current month folder
    const monthFolder = await graphApiService.findFolder('01 JANUARY 2026')
    
    // Find Excel files
    const ngFileId = await graphApiService.findFile(monthFolder, 'NGSTEAM RATIO.xlsx')
    const waterFileId = await graphApiService.findFile(monthFolder, 'WATER_STEAM RATIO.xlsx')
    
    // Download files
    const ngUrl = await graphApiService.getFileDownloadUrl(ngFileId)
    const waterUrl = await graphApiService.getFileDownloadUrl(waterFileId)
    
    const ngBuffer = await graphApiService.downloadFile(ngUrl)
    const waterBuffer = await graphApiService.downloadFile(waterUrl)
    
    // Parse with existing service
    return parseExcelFile({ ngSteam: ngBuffer, waterSteam: waterBuffer })
  } catch (error) {
    console.error('Failed to fetch boiler data:', error)
    throw error
  }
}
```

### Option B: Integrate into Existing OneDriveService (Recommended)

Update `src/services/oneDriveService.ts`:

```typescript
import { graphApiService } from './graphApiService'
import XLSX from 'xlsx'

export async function fetchBoilerDataFromOneDrive() {
  try {
    // Verify authentication
    if (!graphApiService.isAuthenticated()) {
      throw new Error('Not authenticated. Please sign in with OneDrive.')
    }

    // Get current month folder (e.g., "01 JANUARY 2026" for January)
    const now = new Date()
    const monthName = now.toLocaleString('default', { month: 'long' }).toUpperCase()
    const year = now.getFullYear()
    const folderName = `${String(now.getMonth() + 1).padStart(2, '0')} ${monthName} ${year}`

    // Find month folder
    const monthFolderId = await graphApiService.findFolder(folderName)
    if (!monthFolderId) {
      throw new Error(`Folder "${folderName}" not found in OneDrive`)
    }

    // Find Excel files
    const ngSteamFileId = await graphApiService.findFile(monthFolderId, 'NGSTEAM RATIO.xlsx')
    const waterSteamFileId = await graphApiService.findFile(monthFolderId, 'WATER_STEAM RATIO.xlsx')

    if (!ngSteamFileId || !waterSteamFileId) {
      throw new Error('Required Excel files not found')
    }

    // Download files
    const ngSteamUrl = await graphApiService.getFileDownloadUrl(ngSteamFileId)
    const waterSteamUrl = await graphApiService.getFileDownloadUrl(waterSteamFileId)

    const ngSteamBuffer = await graphApiService.downloadFile(ngSteamUrl)
    const waterSteamBuffer = await graphApiService.downloadFile(waterSteamUrl)

    // Parse Excel data using existing parser
    const workbook = XLSX.read(new Uint8Array(ngSteamBuffer), { type: 'array' })
    const ngData = parseNGSteamSheet(workbook.Sheets['NGSTEAM RATIO'])
    
    const workbook2 = XLSX.read(new Uint8Array(waterSteamBuffer), { type: 'array' })
    const waterData = parseWaterSteamSheet(workbook2.Sheets['WATER_STEAM RATIO'])

    // Merge and return
    return mergeBoilerData(ngData, waterData)
  } catch (error) {
    console.error('Error fetching from OneDrive:', error)
    throw error
  }
}
```

## Testing the Integration

### Manual Test 1: Check Environment Variables
```typescript
// Add to src/App.tsx temporarily
console.log('Client ID:', (import.meta as any).env.VITE_MS_GRAPH_CLIENT_ID)
console.log('Tenant ID:', (import.meta as any).env.VITE_MS_GRAPH_TENANT_ID)
```

### Manual Test 2: Authentication Flow
1. Start dev server: `npm run dev`
2. Open browser console
3. Run:
```javascript
const loginUrl = graphApiService.getLoginUrl()
console.log('Login URL:', loginUrl)
window.location.href = loginUrl
```
4. Sign in with your Microsoft account
5. Should redirect back to `http://localhost:5173/callback`

### Manual Test 3: List OneDrive Folders
```javascript
// After authentication
const folders = await graphApiService.listFilesInFolder('root')
console.log('OneDrive root folders:', folders)
```

## Files Modified/Created

| File | Status | Purpose |
|------|--------|---------|
| `src/services/graphApiService.ts` | ✅ Created | Core Graph API client |
| `GRAPH_API_SETUP.md` | ✅ Created | Comprehensive setup guide |
| `.env.example` | ✅ Created | Environment variable template |
| `vite.config.ts` | ✅ Updated | Environment variable loading |
| `src/services/oneDriveService.ts` | ⏳ Pending | Integrate Graph API calls |
| `src/App.tsx` | ⏳ Pending | Add authentication flow |

## What Happens After Integration

1. **User clicks "Sign in with OneDrive"**
   - Redirected to Microsoft login
   - User grants permission to access files

2. **Application receives authorization code**
   - Callback handler exchanges code for access token
   - Token stored in sessionStorage

3. **App fetches boiler data hourly**
   - Uses Graph API to find current month folder
   - Downloads Excel files from OneDrive
   - Parses data using existing Excel parser
   - Updates dashboard with real data

4. **Token automatically refreshes**
   - Before each API call, checks if token expired
   - Automatically refreshes if needed
   - User stays signed in

## Troubleshooting

### "VITE_MS_GRAPH_CLIENT_ID is undefined"
- ✅ Verify `.env` file exists with correct values
- ✅ Restart dev server after creating `.env`
- ✅ Check environment variable names match exactly

### "Folder not found"
- ✅ Verify OneDrive folder structure matches: `01 JANUARY 2026`
- ✅ Check Excel file names match exactly: `NGSTEAM RATIO.xlsx`
- ✅ Use Graph Explorer to manually browse OneDrive structure

### "Permission denied"
- ✅ Go back to Azure Portal → API permissions
- ✅ Ensure `Files.Read` and `Sites.Read.All` are granted
- ✅ Click "Grant admin consent for [Organization]"
- ✅ Wait 5-10 minutes for permissions to propagate

## Next Steps

1. **Complete Azure setup** (GRAPH_API_SETUP.md Steps 1-3)
2. **Create `.env` file** with your credentials
3. **Start dev server**: `npm run dev`
4. **Test authentication**: Click login button and verify redirect flow
5. **Integrate with App component** (see Option B above)
6. **Test data fetching** with real Excel files
7. **Deploy to production** (see DEPLOYMENT_GUIDE.md)

## Support Resources

- **Microsoft Graph Documentation:** https://docs.microsoft.com/en-us/graph
- **Graph Explorer:** https://developer.microsoft.com/en-us/graph/graph-explorer (test API calls)
- **Azure App Registration:** https://portal.azure.com
- **OAuth 2.0 Flow Diagram:** https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow

## Security Reminders

✅ **DO:**
- Add `.env` to `.gitignore`
- Use environment variables for all secrets
- Never commit `.env` file
- Rotate Client Secret annually
- Use HTTPS in production

❌ **DON'T:**
- Commit `.env` file to git
- Hardcode Client Secret in source code
- Share Client Secret via email/chat
- Use same Client Secret in multiple environments
- Store secrets in version control
