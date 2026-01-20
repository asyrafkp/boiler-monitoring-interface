# Quick Start Guide

Get the Boiler Monitoring System up and running in minutes!

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- OneDrive folder with Excel files (for production)

## ⚡ Quick Setup (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Opens automatically at `http://localhost:3000`

### 3. View the Dashboard
- See 3 boiler cards with metrics
- View system overview
- Watch hourly refresh countdown

## 🏗️ Build for Production

```bash
npm run build
```

Output created in `dist/` folder (ready to deploy!)

## 🚀 Deploy to Netlify (2 minutes)

1. Push code to GitHub
2. Connect to [netlify.com](https://netlify.com)
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Done! 🎉

## 📊 Current Features

✅ Beautiful dashboard with 3 boiler cards
✅ System overview metrics
✅ Real-time clock with update times
✅ Responsive mobile design
✅ Hourly refresh ready
✅ Status indicators (Normal/Warning/Critical)

## 🔌 OneDrive Integration

### Current Status
- UI fully built ✅
- Mock data working ✅
- Hourly refresh set up ✅
- Excel parsing ready ✅
- **OneDrive connection:** Next step

### To Connect OneDrive Data

See [ONEDRIVE_INTEGRATION.md](ONEDRIVE_INTEGRATION.md) for full details.

Quick summary:
1. Set up Microsoft Graph API
2. Get OneDrive folder access token
3. Update `src/services/oneDriveService.ts`
4. Configure `src/config/oneDriveConfig.ts`

## 📁 Project Structure

```
├── src/
│   ├── App.tsx                    # Main component
│   ├── components/                # UI components
│   │   ├── BoilerCard.tsx
│   │   └── StatusOverview.tsx
│   ├── services/
│   │   └── oneDriveService.ts     # Data fetching (ready)
│   └── config/
│       └── oneDriveConfig.ts      # Configuration
├── dist/                          # Production build
├── README.md                      # Full documentation
├── ONEDRIVE_INTEGRATION.md        # OneDrive setup guide
└── DEPLOYMENT_GUIDE.md            # Deployment instructions
```

## 🔧 Available Commands

```bash
# Development with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npx tsc --noEmit
```

## 📺 What You'll See

### Dashboard Sections

1. **Header**
   - Last update timestamp
   - Next update time
   - Current data source (OneDrive folder)

2. **System Overview** (4 cards)
   - Total Steam Production
   - Total Natural Gas
   - Average System Output
   - System Health Status

3. **Boiler Cards** (3 cards, one per boiler)
   - Color-coded status badge
   - Steam production (t/h)
   - Natural gas consumption (MMBtu/h)
   - Efficiency ratio
   - Output percentage
   - Feed water flow

## 🎨 Customization

### Colors & Styling
Edit [src/index.css](src/index.css)

### Boiler Names
Edit [src/App.tsx](src/App.tsx) - look for "Boiler No."

### Refresh Interval
Edit [src/config/oneDriveConfig.ts](src/config/oneDriveConfig.ts)
- Default: 1 hour (3600000 ms)

### Metrics Display
Edit [src/components/BoilerCard.tsx](src/components/BoilerCard.tsx)

## 🐛 Troubleshooting

### Port 3000 Already In Use
```bash
# Use different port
npm run dev -- --port 3001
```

### Build Errors
```bash
# Clean and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Display Issues
- Clear browser cache: Ctrl+Shift+Delete
- Try different browser
- Check console for errors: F12

## 📱 Mobile Testing

```bash
# Build and serve on network
npm run preview -- --host

# Then visit: http://YOUR_IP:4173
```

## 🌐 Browser Support

Works on:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 📊 Mock Data

Currently displays realistic mock data that updates:
- Steam: 40-55 t/h per boiler
- Natural Gas: 35-45 MMBtu/h per boiler
- Output: 70-90% per boiler
- Status: Automatic based on steam levels

## 🔒 Security Notes

- All code is frontend only (no secrets exposed)
- Once OneDrive connected, store credentials securely
- Use environment variables for sensitive data

## 📚 Next Steps

1. ✅ **Running locally** - Done!
2. ⬜ **Connect to OneDrive** - See ONEDRIVE_INTEGRATION.md
3. ⬜ **Deploy to production** - See DEPLOYMENT_GUIDE.md
4. ⬜ **Monitor & maintain** - See DEPLOYMENT_GUIDE.md

## 💡 Tips & Tricks

### Hot Module Replacement
- Save file while `npm run dev` running
- Changes appear instantly
- State preserved between edits

### Console Debugging
- Open DevTools: F12
- Check console for integration logs
- Network tab shows API calls

### Performance
- Run Lighthouse audit (F12 → Lighthouse)
- Test on mobile devices
- Check bundle size: `npm run build`

## 🆘 Getting Help

1. Check README.md for full documentation
2. See ONEDRIVE_INTEGRATION.md for data setup
3. See DEPLOYMENT_GUIDE.md for deployment
4. Check console errors: F12 → Console tab

## ⏱️ Typical Workflow

**For Development:**
```bash
npm install          # Once, at start
npm run dev          # Every dev session
# Edit files, save, auto-reload
```

**For Production:**
```bash
npm run build        # Build once
# Deploy dist/ folder to hosting
```

## 📞 Key Files

| File | Purpose |
|------|---------|
| [README.md](README.md) | Full documentation |
| [ONEDRIVE_INTEGRATION.md](ONEDRIVE_INTEGRATION.md) | OneDrive setup guide |
| [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) | Deployment instructions |
| [src/App.tsx](src/App.tsx) | Main app logic |
| [src/config/oneDriveConfig.ts](src/config/oneDriveConfig.ts) | Configuration |

---

**Ready to go! Start with:** `npm install && npm run dev`
