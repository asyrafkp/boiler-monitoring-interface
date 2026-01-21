# Testing the Complete Workflow

## Prerequisites
- ✅ Application deployed on Netlify
- ✅ Supabase project configured
- ✅ RLS disabled on `boiler_readings` and `admin_settings` tables
- ✅ Admin user account set up

---

## Test 1: Manual Excel Upload (5 minutes)

### Step 1.1: Prepare Test Excel File
1. Use the existing Excel sample or create your own with:
   - **Sheet 1:** "NGSTEAM RATIO"
     - Columns E-H: Boiler 1 (steam, NG, ratio, output)
     - Columns I-L: Boiler 2 (steam, NG, ratio, output)
     - Columns M-P: Boiler 3 (steam, NG, ratio, output)
   - **Sheet 2:** "WATER_STEAM RATIO"
     - Column G: Boiler 1 water
     - Column M: Boiler 2 water
     - Column S: Boiler 3 water

2. Or run: `node scripts/create-sample-excel.js` to generate test file

### Step 1.2: Login as Admin
1. Open the application
2. Login with admin credentials
3. Verify dashboard loads (shows 3 boiler cards)

### Step 1.3: Upload Excel File
1. Click **🔧 settings button** (top right of dashboard)
2. AdminPanel opens showing two upload options:
   - Manual Upload
   - OneDrive Link
3. Click **Manual Upload**
4. Select your Excel file
5. **Status message should show:** "⏳ Syncing data..." → "✅ Successfully synced..."

### Step 1.4: Check Browser Console (Critical for Debugging)
**Open console:** F12 → Console tab

**You should see logs:**
```
📁 Selected file: [filename] ([size] bytes)
✓ File read as ArrayBuffer
📥 Starting sync for file: [filename]
📦 File size: [bytes] bytes
📑 Found sheets: NGSTEAM RATIO, WATER_STEAM RATIO
🔍 Steam sheet: NGSTEAM RATIO, Water sheet: WATER_STEAM RATIO
📊 Parsing steam data...
💧 Parsing water data...
📈 Parsed values: { b1_steam: XX, b2_steam: XX, b3_steam: XX, b1_water: XX, ... }
💾 Storing in Supabase...
✅ Data stored successfully
```

### Step 1.5: Verify Data Appears on Dashboard
1. Close AdminPanel (click outside or press Escape)
2. **Boiler Cards should now show:**
   - Boiler No. 1: Steam value, NG, ratio, output, water
   - Boiler No. 2: Steam value, NG, ratio, output, water
   - Boiler No. 3: Steam value, NG, ratio, output, water
3. **Status colors should be:**
   - 🟢 Green: 20-100% capacity
   - 🟡 Yellow: 0-20% or >100% capacity
   - 🔴 Red: Critical (>100%)
   - ⚫ Gray: Offline (0 steam)

3. **Status Overview should show:**
   - Last updated: Current date/time
   - Latest data: DD/MM/YYYY, HHmmhrs format
   - Next update: 30 minutes from now

### Step 1.6: Verify Supabase Data
1. Go to [Supabase](https://app.supabase.com)
2. Navigate to `boiler_readings` table
3. **Verify latest row contains:**
   - b1_steam, b2_steam, b3_steam (your uploaded values)
   - b1_water, b2_water, b3_water (your uploaded values)
   - created_at: Current timestamp

### ✅ Test 1 Result
**Success Criteria:**
- ✅ File uploads without error
- ✅ Console shows all parsing logs
- ✅ Boiler cards display values
- ✅ Status colors are correct
- ✅ Data appears in Supabase
- ✅ Timestamp shows DD/MM/YYYY, HHmmhrs format

**If Failed:**
- Check browser console for error message
- Screenshot the error and share with developer

---

## Test 2: Save OneDrive Link (5 minutes)

### Step 2.1: Get OneDrive Link
1. Open [OneDrive](https://onedrive.live.com)
2. Find your boiler data Excel file
3. Right-click → Share → "Anyone with the link"
4. Copy the link (should start with `https://`)

### Step 2.2: Save Link in Settings
1. Click 🔧 settings button
2. In AdminPanel, find **OneDrive Link** section
3. Enter your OneDrive link
4. Click **Save Link**
5. Wait for message: "✅ Link saved successfully"

### Step 2.3: Verify Saved in Supabase
1. Go to Supabase → `admin_settings` table
2. Verify row contains your saved OneDrive link
3. Status: ✅ Working

---

## Test 3: GitHub Actions Setup (10 minutes)

### Step 3.1: Add GitHub Secrets
1. Go to [GitHub Repository](https://github.com/asyrafkp/boiler-monitoring-interface)
2. Settings → Secrets and variables → Actions
3. Add three secrets:

**Secret 1: SUPABASE_URL**
- Name: `SUPABASE_URL`
- Value: Your Supabase project URL (from Supabase dashboard)
- Click "Add secret"

**Secret 2: SUPABASE_SERVICE_ROLE_KEY**
- Name: `SUPABASE_SERVICE_ROLE_KEY`
- Value: Your Service Role Key (from Supabase settings)
  - Go to Supabase → Project Settings → API → Service Role Secret
- Click "Add secret"

**Secret 3: ONEDRIVE_LINK**
- Name: `ONEDRIVE_LINK`
- Value: Your OneDrive shareable link
- Click "Add secret"

### Step 3.2: Trigger Workflow Manually
1. Go to GitHub → Actions tab
2. Select workflow: "Sync OneDrive Excel to GitHub (Hourly)"
3. Click "Run workflow" → "Run workflow"
4. Wait 1-2 minutes

### Step 3.3: Check Workflow Run
1. Workflow should complete with ✅ green checkmark
2. Click workflow run to see logs:
   - "✅ File downloaded successfully"
   - "✓ Excel parsed"
   - "✅ Data synced to Supabase"

### Step 3.4: Verify Dashboard Updates
1. Return to application dashboard
2. Data should reflect the automated sync
3. Check Status Overview for latest timestamp

### ✅ Test 3 Result
**Success Criteria:**
- ✅ Secrets added to GitHub
- ✅ Workflow runs without errors
- ✅ Logs show successful download and parse
- ✅ Dashboard data updates with automated sync
- ✅ Workflow scheduled to run hourly (automatic)

**If Failed:**
- Check workflow logs for error message
- Most common: Secret not configured correctly
- Verify secret values are exactly correct (no extra spaces)

---

## Test 4: Automatic Hourly Refresh (Optional - takes 1 hour)

### Step 4.1: Let Workflow Run
1. Workflow set to run: Every hour at minute 0
   - Next run: Top of next hour
2. Example: If it's 14:30, next run at 15:00

### Step 4.2: Monitor Dashboard
1. Keep dashboard open or return at next hour
2. Dashboard auto-refreshes every 30 minutes
3. Should show updated data from GitHub Actions

### ✅ Test 4 Result
**Success Criteria:**
- ✅ Workflow runs automatically each hour
- ✅ Dashboard data updates automatically
- ✅ Timestamps reflect latest sync
- ✅ No manual intervention needed

---

## Troubleshooting

### Issue: "❌ Sync failed: Unknown sync error"
**Solution:**
1. Open browser console (F12)
2. Look for detailed error message starting with "❌"
3. Common errors:
   - **"Could not find required sheets"**
     - Verify Excel has "NGSTEAM RATIO" and "WATER_STEAM RATIO" sheet names
   - **"Supabase store error"**
     - Verify RLS is disabled on `boiler_readings` table
   - **"File size: 0 bytes"**
     - Verify file selected correctly

### Issue: No data appears on dashboard
**Solution:**
1. Verify Supabase table has data: Supabase → `boiler_readings` table
2. If empty:
   - Check console logs for parse errors
   - Verify Excel column mappings match expected layout
3. If Supabase has data but dashboard doesn't:
   - Refresh page (Ctrl+R or Cmd+R)
   - Check browser console for fetch errors

### Issue: GitHub Actions workflow fails
**Solution:**
1. Check workflow logs in GitHub Actions
2. Common causes:
   - **"Missing Supabase environment variables"**
     - Verify all 3 secrets are added: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ONEDRIVE_LINK
   - **"OneDrive download failed"**
     - Verify link is valid and publicly shareable
   - **"Supabase RLS error"**
     - Service Role Key should bypass RLS, if error:
       - Disable RLS on `boiler_readings` table again
       - Run: `ALTER TABLE boiler_readings DISABLE ROW LEVEL SECURITY;`

### Issue: Boiler cards show wrong colors
**Solution:**
1. Status color logic:
   - 🟢 Green: steam > 0 AND (steam/maxCapacity) between 20-100%
   - 🟡 Yellow: < 20% or > 100%
   - ⚫ Gray: steam = 0 (offline)
2. If colors incorrect:
   - Check steam value is correct
   - Verify maxCapacity (B1/B2 = 18t/h, B3 = 16t/h)
   - Open console and check parsed values

---

## Test Checklist

### Manual Upload Test
- [ ] Excel file created with test data
- [ ] Admin logged in
- [ ] File uploaded successfully
- [ ] Console shows all parsing logs
- [ ] Boiler cards display values
- [ ] Status colors are correct
- [ ] Data persists in Supabase

### Settings Test
- [ ] OneDrive link entered
- [ ] Link saved successfully
- [ ] Saved in Supabase `admin_settings` table

### GitHub Actions Test
- [ ] All 3 secrets added to GitHub
- [ ] Workflow triggered manually
- [ ] Workflow completes without error
- [ ] Dashboard data updates
- [ ] Logs show successful sync

### UI Display Test
- [ ] All 3 boilers visible (B1, B2, B3)
- [ ] Steam values show correct units (t/h)
- [ ] NG values show correct units (MMBtu/h)
- [ ] All metrics present (ratio, output, water)
- [ ] Status badges display correctly
- [ ] Timestamps format correct (DD/MM/YYYY, HHmmhrs)
- [ ] Update times showing correctly

---

## Next Steps After Testing

1. **If all tests pass:** ✅
   - Workflow is production-ready
   - Data syncs reliably from OneDrive
   - Dashboard displays correctly
   - No further action needed

2. **If some tests fail:**
   - Identify which step failed
   - Check console logs/GitHub logs
   - Share error message with developer

3. **For production:**
   - Set up regular data backups
   - Monitor GitHub Actions for failed runs
   - Update Excel file location if needed
   - Add team members with appropriate access

