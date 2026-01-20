# OneDrive Integration Guide

This document explains how the Boiler Operation Monitoring System integrates with OneDrive for automated data fetching.

## Overview

The system is designed to:
1. Access Excel files stored in OneDrive folders (organized by month)
2. Parse the Excel data every hour
3. Extract boiler metrics and display them in real-time
4. Update automatically without requiring user intervention

## OneDrive Folder Structure

```
Root Folder: https://1drv.ms/f/c/B6A282DAF4E2A35F/IgDut87lcIP0QYgkXmaSdS71AZDxNKdtobdFZwBNOu4j9uU
│
├── 01 JANUARY 2026/
│   ├── NGSTEAM RATIO.xlsx
│   └── (other files)
├── 02 FEBRUARY 2026/
│   ├── NGSTEAM RATIO.xlsx
│   └── (other files)
├── 03 MARCH 2026/
│   └── NGSTEAM RATIO.xlsx
└── ... (continues through December)
```

## Data Fetching Strategy

### Approach 1: Microsoft Graph API (Recommended for Production)

**Pros:**
- Official Microsoft solution
- Best performance and reliability
- Programmatic access control

**Steps:**
1. Register Azure Application
2. Get Office 365 credentials
3. Use Microsoft Graph API to:
   - List files in OneDrive folder
   - Download the current month's Excel file
   - Parse and extract metrics

**Implementation:**
```typescript
// Example (not included in current build)
const accessToken = await acquireTokenSilently(...)
const response = await fetch(
  'https://graph.microsoft.com/v1.0/me/drive/items/{folder-id}/children',
  {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  }
)
```

### Approach 2: Direct Download with Proxy

**Pros:**
- Works with shared links
- No authentication needed for public links

**Limitations:**
- CORS issues (requires backend proxy)
- May have rate limits

### Approach 3: OneDrive Web Scraping

**Not Recommended** - violates Terms of Service

## Excel File Requirements

### Expected Column Layout

```
| Column | Data           | Boiler |
|--------|----------------|--------|
| 0      | Date           | -      |
| 1      | Time           | -      |
| 2      | Label/ID       | B1     |
| 3      | Steam (t/h)    | B1     |
| 4      | Natural Gas    | B1     |
| 5      | Ratio          | B1     |
| 6      | Output (%)     | B1     |
| 7      | Label/ID       | B2     |
| 8      | Steam (t/h)    | B2     |
| 9      | Natural Gas    | B2     |
| 10     | Ratio          | B2     |
| 11     | Output (%)     | B2     |
| 12     | Label/ID       | B3     |
| 13     | Steam (t/h)    | B3     |
| 14     | Natural Gas    | B3     |
| 15     | Ratio          | B3     |
| 16     | Output (%)     | B3     |
```

### Sheet Names

The system looks for sheets with these names (in order):
1. Sheets containing "NGSTEAM" or "RATIO"
2. "NGSTEAM RATIO" (exact match)
3. First sheet in workbook

## Current Implementation Status

### ✅ Completed
- [x] React UI with boiler cards
- [x] Status overview component
- [x] Responsive design
- [x] Hourly refresh interval setup
- [x] XLSX library integration
- [x] Mock data with realistic values
- [x] Error handling framework
- [x] OneDrive config file

### 🔄 In Progress / Ready for Implementation
- [ ] Microsoft Graph API authentication
- [ ] Excel file download from OneDrive
- [ ] Real data parsing and mapping
- [ ] Error recovery and retry logic

### 📋 Configuration File
See [src/config/oneDriveConfig.ts](src/config/oneDriveConfig.ts)

```typescript
export const ONEDRIVE_CONFIG = {
  folderUrl: 'https://1drv.ms/f/c/B6A282DAF4E2A35F/IgDut87lcIP0QYgkXmaSdS71AZDxNKdtobdFZwBNOu4j9uU?e=VNxzpv',
  monthFolders: ['01 JANUARY 2026', '02 FEBRUARY 2026', ...],
  excelFilePatterns: ['NGSTEAM RATIO', 'Boiler Data', 'Operations Data'],
  refreshInterval: 3600000, // 1 hour
  debug: true
}
```

## Implementation Roadmap

### Phase 1: Local Testing
- [x] Create UI components
- [x] Set up mock data
- [x] Test hourly refresh mechanism
- [x] Verify responsive design

### Phase 2: OneDrive Connection
- [ ] Set up Microsoft Graph API
- [ ] Implement authentication
- [ ] Test file access permissions
- [ ] Download and parse actual Excel files

### Phase 3: Production Deployment
- [ ] Deploy to cloud hosting
- [ ] Set up monitoring
- [ ] Configure error notifications
- [ ] Test with real data

## Testing the Integration

### With Mock Data (Current)
```bash
npm run dev
# Open http://localhost:3000
# Data updates every hour with mock values
```

### With Real Data (After Graph API setup)
```bash
# Set environment variables for Azure credentials
# Run npm run dev
# Monitor console for debug messages
```

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Solution: Use Microsoft Graph API with proper backend proxy
   - Or: Deploy backend service to handle CORS

2. **File Not Found**
   - Check OneDrive folder structure
   - Verify folder names match config exactly
   - Check file permissions

3. **Excel Parsing Errors**
   - Verify Excel file format
   - Check column mappings
   - Test with sample files first

4. **Hourly Refresh Not Working**
   - Check browser console for errors
   - Verify refresh interval is correct (3600000 ms)
   - Check network tab for API calls

## Code References

### Main Integration Files
- **App.tsx** - Main component with fetch logic
- **oneDriveService.ts** - Excel parsing and fetch functions
- **oneDriveConfig.ts** - Configuration constants

### Key Functions

#### `fetchBoilerDataFromOneDrive()`
- Fetches current month's Excel file from OneDrive
- Returns parsed `BoilerData` object
- Handles errors gracefully

#### `parseExcelFile(fileContent: ArrayBuffer)`
- Parses XLSX buffer content
- Extracts boiler metrics
- Maps to internal data structure

#### `setupHourlyRefresh(callback)`
- Sets up interval for hourly updates
- Returns cleanup function
- Calls callback with new data

## Environment Variables (For Future Use)

```env
# Microsoft Azure
VITE_AZURE_CLIENT_ID=your_client_id
VITE_AZURE_TENANT_ID=your_tenant_id
VITE_AZURE_CLIENT_SECRET=your_client_secret

# OneDrive
VITE_ONEDRIVE_ROOT_FOLDER_ID=folder_id
```

## Security Considerations

1. **Credentials Management**
   - Never commit secrets to version control
   - Use environment variables
   - Rotate credentials regularly

2. **Data Access**
   - Use OneDrive's permission system
   - Limit access to necessary folders
   - Audit access logs

3. **CORS Protection**
   - Use backend proxy for Graph API calls
   - Implement rate limiting
   - Validate file contents before parsing

## Performance Tips

1. **Caching**
   - Cache parsed data in browser
   - Reduce API calls
   - Implement cache invalidation

2. **Lazy Loading**
   - Load historical data on demand
   - Paginate large datasets

3. **Compression**
   - Compress Excel files
   - Use delta updates when possible

## Additional Resources

- [Microsoft Graph API Docs](https://learn.microsoft.com/en-us/graph/)
- [OneDrive API Reference](https://learn.microsoft.com/en-us/onedrive/developer/rest-api/)
- [XLSX Library](https://sheetjs.com/)
- [Azure App Registration](https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)

## Support

For technical questions:
1. Check this guide first
2. Review code comments
3. Check browser console for errors
4. Review OneDrive API documentation
