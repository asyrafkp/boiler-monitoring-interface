# Boiler Operation Monitoring System

A modern, responsive web interface for monitoring 3 boilers in real-time. The application is designed to be deployed as a static website with automated hourly data refresh from OneDrive Excel files.

## Features

✅ **Beautiful Dashboard** - Modern, clean UI with real-time metrics
✅ **Real-Time Monitoring** - Display steam production, natural gas consumption, efficiency ratios
✅ **System Overview** - Quick glance at total steam, gas consumption, and system health
✅ **Status Indicators** - Visual status badges (Normal, Warning, Critical) for each boiler
✅ **Hourly Updates** - Automatic data refresh every hour from OneDrive
✅ **OneDrive Integration** - Seamless data fetching from monthly Excel folders
✅ **Responsive Design** - Works on desktop, tablet, and mobile devices
✅ **Production Ready** - Optimized static build for any hosting platform

## Project Structure

```
src/
├── App.tsx                      # Main application component with OneDrive integration
├── App.css                      # App-specific styles
├── main.tsx                     # React entry point
├── index.css                    # Global styles
├── components/
│   ├── BoilerCard.tsx          # Individual boiler display component
│   └── StatusOverview.tsx       # System overview metrics component
├── services/
│   └── oneDriveService.ts      # OneDrive data fetching & Excel parsing
└── config/
    └── oneDriveConfig.ts       # OneDrive configuration & constants

dist/                           # Production build output
index.html                      # HTML entry point
```

## OneDrive Data Structure

The application expects data to be organized in OneDrive as follows:

```
Boiler Data (Root Folder)
├── 01 JANUARY 2026/
│   └── NGSTEAM RATIO.xlsx      (or similar Excel file)
├── 02 FEBRUARY 2026/
│   └── NGSTEAM RATIO.xlsx
├── ...
└── 12 DECEMBER 2026/
    └── NGSTEAM RATIO.xlsx
```

**Note:** OneDrive folder URL is configured in the application settings (not publicly shared for security).

## Installation & Build

```bash
# Install dependencies
npm install

# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

## Configuration

Edit [src/config/oneDriveConfig.ts](src/config/oneDriveConfig.ts) to customize:

- OneDrive folder URL
- Month folder names
- Excel file patterns
- Refresh interval (default: 1 hour)
- Debug logging

## Data Integration Details

### Excel File Format Expected

The Excel sheets should have the following structure (typical columns):

| Col | Description |
|-----|-------------|
| 0-1 | Timestamp/Date |
| 2-6 | Boiler 1: Steam, NG, NG/Steam Ratio, Output |
| 7-11 | Boiler 2: Steam, NG, NG/Steam Ratio, Output |
| 12-16 | Boiler 3: Steam, NG, NG/Steam Ratio, Output |

### Data Metrics

Each boiler displays:
- **Steam Production** - Tons per hour (t/h)
- **Natural Gas** - MMBtu/h
- **NG/Steam Ratio** - Efficiency metric
- **Output** - Percentage (%)
- **Feed Water** - Tons per hour (t/h)

### Status Determination

Status is automatically determined based on steam production:
- **Normal** (🟢) - Steam > 20 t/h
- **Warning** (🟡) - Steam between 0-20 t/h
- **Critical** (🔴) - Steam = 0 or offline

## Deployment

This is a **static site** - can be deployed to any hosting platform without a backend server:

### Popular Options:
- **Netlify** - Connect GitHub repo for auto-deployment
- **Vercel** - Optimized for React applications
- **GitHub Pages** - Free hosting
- **AWS S3** - Static site hosting
- **Azure Static Web Apps** - Integrated CI/CD
- **Cloudflare Pages** - Global CDN
- **Any Web Server** - Just serve the `dist/` folder

### Deployment Steps (Example - Netlify):
1. Build locally: `npm run build`
2. Push `dist/` folder to hosting platform
3. Or connect GitHub repo for automatic builds

## Technologies

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Lightning-fast build tool
- **XLSX** - Excel file parsing
- **CSS3** - Modern styling with animations

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Current Data Display

### Mock Data Structure

Currently displays realistic mock data with the following structure:

```typescript
{
  id: number                    // 1, 2, or 3
  name: string                  // "Boiler No. 1", etc.
  steam: number                 // t/h
  ng: number                    // MMBtu/h
  ratio: number                 // NG/Steam ratio
  output: number                // Percentage (%)
  water: number                 // t/h
  status: string                // 'normal' | 'warning' | 'critical'
}
```

## Development

### Clock & Update Times
- **Last Update** - Updates every second, shows most recent data fetch time
- **Next Update** - Calculates next hour automatically
- **Current Month** - Displays the current month folder being accessed

### Error Handling
- Displays error messages in header if data fetch fails
- Continues to show previous data if new fetch fails
- Console logging for debugging (debug mode in config)

## Integration TODOs

The following need to be implemented for full OneDrive integration:

- [ ] Microsoft Graph API authentication setup
- [ ] Direct OneDrive file download implementation
- [ ] Excel file parsing and mapping
- [ ] Error handling & retry logic
- [ ] Caching mechanism
- [ ] Data validation

## Future Enhancements

- [ ] Historical data charts and trends
- [ ] Email alerts for critical events
- [ ] Dark/Light theme toggle
- [ ] Data export functionality
- [ ] User authentication
- [ ] Multi-site monitoring
- [ ] API for external integrations
- [ ] Mobile app version

## License

ISC

## Support

For issues or questions regarding OneDrive integration, refer to:
- [Microsoft Graph API Documentation](https://learn.microsoft.com/en-us/graph/api/overview)
- [OneDrive API Reference](https://learn.microsoft.com/en-us/onedrive/developer/rest-api/)
- [XLSX Library Documentation](https://sheetjs.com/)
