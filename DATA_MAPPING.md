# 📊 Excel Data Mapping Reference

## Complete Data Structure & Column References

### Sheet 1: NGSTEAM RATIO

#### Data Layout

**Daily Pattern:**
- **Start Row:** 506 (first row of day at 0800hrs)
- **End Row:** 529 (last row of day at 0700hrs next day)
- **Sum Row:** 530 (totals for 24-hour period)
- **Pattern Repeats:** Every 2 rows for next day
  - 21/1/2026: Rows 532-555 (data) + 556 (sum)
  - 22/1/2026: Rows 558-581 (data) + 582 (sum)
  - And so on...

#### Column Mappings (0-indexed in code, but referenced as Excel columns)

**Boiler 1:**
| Column | Label | Excel Col | Index |
|--------|-------|-----------|-------|
| Steam Production | BOILER 1 - STEAM PRODUCE | E | 4 |
| Natural Gas | BOILER 1 - TOTAL NG | F | 5 |
| NG/Steam Ratio | BOILER 1 - NG/STEAM RATIO | G | 6 |
| Output % | BOILER 1 - % Output | H | 7 |

**Boiler 2:** (continuing next)
| Column | Label | Excel Col | Index |
|--------|-------|-----------|-------|
| Steam Production | BOILER 2 - STEAM PRODUCE | I | 8 |
| Natural Gas | BOILER 2 - TOTAL NG | J | 9 |
| NG/Steam Ratio | BOILER 2 - NG/STEAM RATIO | K | 10 |
| Output % | BOILER 2 - % Output | L | 11 |

**Boiler 3:** (continuing next)
| Column | Label | Excel Col | Index |
|--------|-------|-----------|-------|
| Steam Production | BOILER 3 - STEAM PRODUCE | M | 12 |
| Natural Gas | BOILER 3 - TOTAL NG | N | 13 |
| NG/Steam Ratio | BOILER 3 - NG/STEAM RATIO | O | 14 |
| Output % | BOILER 3 - % Output | P | 15 |

### Sheet 2: WATER_STEAM RATIO

#### Data Layout (Same Daily Pattern)
- **Start Row:** 506 (first row of day at 0800hrs)
- **End Row:** 529 (last row of day at 0700hrs next day)
- **Sum Row:** 530 (totals for 24-hour period)

#### Column Mappings (0-indexed in code)

**Boiler 1:**
| Column | Label | Excel Col | Index |
|--------|-------|-----------|-------|
| Water Produced | BOILER 1 - WATER PRODUCE | G | 6 |
| Water/Steam Ratio | BOILER 1 - WATER/STEAM RATIO | H | 7 |
| Electric/Steam Ratio | BOILER 1 - ELECTRIC/STEAM RATIO | I | 8 |

**Boiler 2:**
| Column | Label | Excel Col | Index |
|--------|-------|-----------|-------|
| Water Produced | BOILER 2 - WATER PRODUCE | M | 12 |
| Water/Steam Ratio | BOILER 2 - WATER/STEAM RATIO | N | 13 |
| Electric/Steam Ratio | BOILER 2 - ELECTRIC/STEAM RATIO | O | 14 |

**Boiler 3:**
| Column | Label | Excel Col | Index |
|--------|-------|-----------|-------|
| Water Produced | BOILER 3 - WATER PRODUCE | S | 18 |
| Water/Steam Ratio | BOILER 3 - WATER/STEAM RATIO | T | 19 |
| Electric/Steam Ratio | BOILER 3 - ELECTRIC/STEAM RATIO | U | 20 |

---

## Data Extraction Logic

### Step 1: Locate Data Row
- Find sum row (typically last row with data)
- Sum rows contain aggregated daily values
- Located at row indices: 530, 556, 582, 608, etc.

### Step 2: Extract NGSTEAM Metrics (Primary)
```
From Sum Row (e.g., row 530):
├── Boiler 1
│   ├── Steam: sumRow[4]     (Column E)
│   ├── NG: sumRow[5]        (Column F)
│   ├── Ratio: sumRow[6]     (Column G)
│   └── Output: sumRow[7]    (Column H)
├── Boiler 2
│   ├── Steam: sumRow[8]     (Column I)
│   ├── NG: sumRow[9]        (Column J)
│   ├── Ratio: sumRow[10]    (Column K)
│   └── Output: sumRow[11]   (Column L)
└── Boiler 3
    ├── Steam: sumRow[12]    (Column M)
    ├── NG: sumRow[13]       (Column N)
    ├── Ratio: sumRow[14]    (Column O)
    └── Output: sumRow[15]   (Column P)
```

### Step 3: Extract WATER_STEAM Metrics (Secondary)
```
From Same Sum Row:
├── Boiler 1
│   └── Water: sumRow[6]     (Column G)
├── Boiler 2
│   └── Water: sumRow[12]    (Column M)
└── Boiler 3
    └── Water: sumRow[18]    (Column S)
```

### Step 4: Calculate Totals
```
Total Steam = B1.steam + B2.steam + B3.steam
Total Water = B1.water + B2.water + B3.water
```

### Step 5: Determine Status
```
Status Logic:
- If steam > 20 t/h  → Normal (🟢)
- If steam 0-20 t/h  → Warning (🟡)
- If steam = 0 t/h   → Critical (🔴)
```

---

## Timestamp Extraction

**Date Column:** A (index 0)
**Time Column:** B (index 1)

Format typically:
- Date: `20/1/2026` (DD/M/YYYY)
- Time: `0800` or `08:00` (HHMM or HH:MM)

Combined display: `20/1/2026 0800hrs`

---

## Data Validation

### Expected Value Ranges
| Metric | Min | Max | Unit |
|--------|-----|-----|------|
| Steam | 0 | 100+ | t/h |
| Natural Gas | 0 | 100+ | MMBtu/h |
| NG/Steam Ratio | 0.5 | 2.0 | — |
| Output % | 0 | 100 | % |
| Water | 0 | 100+ | t/h |

### Error Handling
- Missing data → Use 0
- Invalid numbers → Parse as 0
- Missing sheet → Try alternate sheet names
- No sum row found → Use last data row

---

## Implementation in Code

### File: `src/services/oneDriveService.ts`

**Key Functions:**

1. **`parseExcelFile(fileContent)`**
   - Reads Excel buffer
   - Identifies sheet names
   - Extracts sum row
   - Parses all metrics
   - Merges water data
   - Returns formatted BoilerData

2. **`parseNGSteamSheet(worksheet, data)`**
   - Finds sum row (row 530, 556, etc.)
   - Extracts steam & gas metrics
   - Calculates totals
   - Determines status

3. **`parseWaterSteamSheet(worksheet, data)`**
   - Finds sum row
   - Extracts water metrics
   - Returns partial data for merging

---

## Data Flow Diagram

```
OneDrive Excel File
    ↓
┌───────────────────────────────┐
│ XLSX Library Read             │
│ (FileContent → Workbook)      │
└───────────────────────┬───────┘
                        ↓
┌───────────────────────────────┐
│ Find NGSTEAM RATIO Sheet      │
└───────────────────────┬───────┘
                        ↓
┌───────────────────────────────┐
│ Extract Sum Row (530, 556...) │
└───────────────────────┬───────┘
                        ↓
┌───────────────────────────────┐
│ Parse Boiler Metrics          │
│ • Steam (cols 4,8,12)         │
│ • NG (cols 5,9,13)            │
│ • Ratio (cols 6,10,14)        │
│ • Output (cols 7,11,15)       │
└───────────────────────┬───────┘
                        ↓
┌───────────────────────────────┐
│ Find WATER_STEAM RATIO Sheet  │
└───────────────────────┬───────┘
                        ↓
┌───────────────────────────────┐
│ Extract Water Data            │
│ (cols 6,12,18)                │
└───────────────────────┬───────┘
                        ↓
┌───────────────────────────────┐
│ Merge All Data                │
│ • Calculate totals            │
│ • Determine status            │
│ • Format timestamp            │
└───────────────────────┬───────┘
                        ↓
                   BoilerData
                   {
                     timestamp,
                     b1, b2, b3,
                     totalSteam,
                     totalWater
                   }
                        ↓
                React Component
                   Display UI
```

---

## Testing Data Extraction

### Example Data Structure

**Row 530 (20/1/2026 Sum):**
```
E4:  45.2      (B1 Steam)
F5:  38.5      (B1 NG)
G6:  1.175     (B1 Ratio)
H7:  75.0      (B1 Output %)

I8:  42.8      (B2 Steam)
J9:  36.2      (B2 NG)
K10: 1.182     (B2 Ratio)
L11: 72.0      (B2 Output %)

M12: 44.0      (B3 Steam)
N13: 37.5      (B3 NG)
O14: 1.173     (B3 Ratio)
P15: 74.0      (B3 Output %)

G6:  45.2      (B1 Water)
H7:  1.0       (B1 Water/Steam)
I8:  0.5       (B1 Electric/Steam)

M12: 42.8      (B2 Water)
N13: 1.0       (B2 Water/Steam)
O14: 0.5       (B2 Electric/Steam)

S18: 44.0      (B3 Water)
T19: 1.0       (B3 Water/Steam)
U20: 0.5       (B3 Electric/Steam)
```

**Expected Output:**
```json
{
  "timestamp": "20/1/2026 0800hrs",
  "b1": {
    "id": 1,
    "name": "Boiler No. 1",
    "steam": 45.2,
    "ng": 38.5,
    "ratio": 1.175,
    "output": 75.0,
    "water": 45.2,
    "status": "normal"
  },
  "b2": {
    "id": 2,
    "name": "Boiler No. 2",
    "steam": 42.8,
    "ng": 36.2,
    "ratio": 1.182,
    "output": 72.0,
    "water": 42.8,
    "status": "normal"
  },
  "b3": {
    "id": 3,
    "name": "Boiler No. 3",
    "steam": 44.0,
    "ng": 37.5,
    "ratio": 1.173,
    "output": 74.0,
    "water": 44.0,
    "status": "normal"
  },
  "totalSteam": 132.0,
  "totalWater": 132.0
}
```

---

## Related Files

- **Code:** [src/services/oneDriveService.ts](../../src/services/oneDriveService.ts)
- **Config:** [src/config/oneDriveConfig.ts](../../src/config/oneDriveConfig.ts)
- **Integration Guide:** [ONEDRIVE_INTEGRATION.md](ONEDRIVE_INTEGRATION.md)
- **Excel File Structure:** This document

---

## Notes

- Column indices are 0-based in JavaScript but referenced as Excel columns (A=0, B=1, etc.)
- Sum rows contain daily totals/averages for 24-hour period
- Both sheets must use same row numbering for date matching
- Timestamp extracted from first data row of each day (row 506)
- Status automatically determined from steam production values
