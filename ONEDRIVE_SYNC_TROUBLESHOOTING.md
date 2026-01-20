# OneDrive Sync Troubleshooting

## Issue: Workflow failing with exit code 1 or 128

OneDrive share links have restrictions that prevent direct HTTP downloads. Here are the solutions:

## Solution 1: Manual Upload (Fastest - 2 minutes)

This is the most reliable approach:

1. **Download your Excel file from OneDrive**
   - Go to your OneDrive folder
   - Right-click on the latest month's Excel file
   - Click "Download"

2. **Upload to GitHub**
   - Go to: https://github.com/asyrafkp/boiler-monitoring-interface
   - Click "Add file" → "Upload files"
   - Create folder structure: `data/` → paste your file as `boiler_data.xlsx`
   - Click "Commit changes"

3. **Test in App**
   - Login to Boiler Monitoring Interface
   - Admin → ⚙️ → "Sync from GitHub"
   - ✅ Data syncs to Supabase

**Repeat this weekly as needed**

---

## Solution 2: Use Microsoft Graph API (Advanced - 20 minutes)

For automated sync, we can set up Microsoft Graph API instead:

**Advantages:**
- Fully automated
- Direct OneDrive access
- No manual uploads needed

**Setup:**
1. Create Azure App Registration
2. Get credentials
3. Update GitHub workflow to use Microsoft Graph

Contact development team for this setup.

---

## Solution 3: Use IFTTT or Zapier (Alternative - 15 minutes)

Automate file sync without coding:

**Option A: IFTTT**
- Trigger: OneDrive file modified
- Action: Push to GitHub

**Option B: Zapier**
- Similar workflow
- More reliable than IFTTT

---

## For Now: Use Manual Upload

**Recommended:** Use Solution 1 (Manual Upload) while we work on automating it.

**Weekly process:**
1. Download latest Excel from OneDrive
2. Upload to GitHub `data/` folder
3. Click "Sync from GitHub" in app
4. Done! ✅

This takes ~2 minutes and is completely reliable.

---

## Next Steps

1. Try **Solution 1 (Manual Upload)** now
2. Verify it works in the app
3. Once working, we can automate it

**Ready to try manual upload?**
