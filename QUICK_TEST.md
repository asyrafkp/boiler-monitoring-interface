# Quick Testing Reference

## 🚀 Ready to Test - Start Here

### Files Generated
✅ **Sample Excel:** `data/boiler_data.xlsx`
- Ready to upload immediately
- Contains realistic boiler data
- Both required sheets included

---

## ⏱️ Quick Test (10 minutes)

### Step 1: Login (30 seconds)
```
1. Open: https://boiler-monitoring-interface.netlify.app
2. Login as Admin
3. You should see 3 boiler cards (with zeros initially)
```

### Step 2: Upload Excel (2 minutes)
```
1. Click 🔧 settings button (top right)
2. Click "Manual Upload"
3. Select: data/boiler_data.xlsx
4. Wait for: ✅ Successfully synced
```

### Step 3: Check Results (30 seconds)
```
1. Close AdminPanel
2. Verify boiler cards show values
   - B1 Steam: ~8-10 t/h (green)
   - B2 Steam: ~7-9 t/h (green)
   - B3 Steam: ~6-8 t/h (green)
3. Check Status Overview timestamp
```

### Step 4: Verify Console Logs (2 minutes)
```
1. Press F12 (open DevTools)
2. Go to Console tab
3. You should see:
   📁 Selected file: boiler_data.xlsx
   📦 File size: XXX bytes
   📑 Found sheets: NGSTEAM RATIO, WATER_STEAM RATIO
   📊 Parsed values: {b1_steam: 8.x, b2_steam: 7.x, ...}
   ✅ Data stored successfully
```

### Expected Result
✅ **All values displayed with correct status colors** = **Test Passed**

---

## 🔍 Detailed Debug Output Expected

When you upload the Excel file, your console should show:

```
📁 Selected file: boiler_data.xlsx (XX,XXX bytes)
✓ File read as ArrayBuffer
📥 Starting sync for file: boiler_data.xlsx
📦 File size: XX,XXX bytes
📑 Found sheets: NGSTEAM RATIO, WATER_STEAM RATIO
🔍 Steam sheet: NGSTEAM RATIO, Water sheet: WATER_STEAM RATIO
📊 Parsing steam data...
💧 Parsing water data...
📈 Parsed values: { 
  b1_steam: 9.234, 
  b2_steam: 8.123, 
  b3_steam: 7.456, 
  b1_water: 12.3, 
  b2_water: 11.2, 
  b3_water: 9.8 
}
💾 Storing in Supabase...
✅ Data stored successfully
✅ Successfully synced 506 rows from boiler_data.xlsx
```

---

## 📊 Expected UI After Upload

### Boiler Cards
```
┌─ Boiler No. 1 ─────────────┐
│ [GREEN] NORMAL              │
│ Steam Production: 9.23 t/h  │
│ Natural Gas: 4.56 MMBtu/h   │
│ Ratio: 50.2 %               │
│ Output: 16.1 %              │
│ Water: 12.3 t/h             │
└─────────────────────────────┘

┌─ Boiler No. 2 ─────────────┐
│ [GREEN] NORMAL              │
│ Steam Production: 8.12 t/h  │
│ Natural Gas: 3.89 MMBtu/h   │
│ Ratio: 49.5 %               │
│ Output: 15.2 %              │
│ Water: 11.2 t/h             │
└─────────────────────────────┘

┌─ Boiler No. 3 ─────────────┐
│ [GREEN] NORMAL              │
│ Steam Production: 7.45 t/h  │
│ Natural Gas: 3.2 MMBtu/h    │
│ Ratio: 48.1 %               │
│ Output: 12.1 %              │
│ Water: 9.8 t/h              │
└─────────────────────────────┘
```

### Status Overview
```
Last Updated:    14:32:45 1/21/2026
Next Update:     15:02:45
Latest Data:     21/01/2026, 1432hrs
```

---

## ✅ Success Checklist

- [ ] Sample Excel file generated (data/boiler_data.xlsx)
- [ ] Admin login successful
- [ ] AdminPanel opens when clicking 🔧
- [ ] File uploads without error
- [ ] Console shows all parsing logs
- [ ] All 3 boiler cards display values
- [ ] Status colors are GREEN (normal)
- [ ] Timestamps show in correct format (DD/MM/YYYY, HHmmhrs)
- [ ] Status overview shows reasonable times

---

## ❌ Troubleshooting

### "File not found" error
```
Fix: Ensure you're in correct directory
cd "d:\Documents\Program created\Boiler Operation Monitoring Interface"
node scripts/create-sample-excel.js
```

### "No sheets found" error
```
Fix: Sample file may be corrupted, regenerate:
rm data/boiler_data.xlsx
node scripts/create-sample-excel.js
```

### Boiler cards show 0 values
```
Causes:
1. File didn't upload (check console)
2. Supabase not storing (check RLS disabled)
3. App not reading from Supabase (check fetch)
Action: Share console screenshot
```

### Status colors wrong (not green)
```
Sample data values:
B1: 9.2 t/h (capacity 18 t/h = 51% = GREEN ✓)
B2: 8.1 t/h (capacity 18 t/h = 45% = GREEN ✓)
B3: 7.4 t/h (capacity 16 t/h = 46% = GREEN ✓)

If showing yellow/red, check parsed values in console
```

---

## 📋 Test Summary

**Quick Test:** 10 minutes
- [x] Generate sample Excel
- [x] Upload to dashboard
- [x] Verify data displays
- [x] Check console logs

**Full Test:** 20 minutes
- Includes GitHub Actions setup verification
- See TESTING_WORKFLOW.md for full guide

**Automation Test:** 1+ hour
- GitHub Actions hourly sync
- Requires GitHub secrets setup first

