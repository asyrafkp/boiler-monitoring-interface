#!/usr/bin/env node
/**
 * Parse Excel file and convert to JSON for frontend consumption
 */

import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const excelPath = path.join(__dirname, '../../data/boiler_data.xlsx');
const outputPath = path.join(__dirname, '../../public/boiler_data.json');

console.log('📊 Converting Excel to JSON...');

if (!fs.existsSync(excelPath)) {
  console.error('❌ Excel file not found:', excelPath);
  process.exit(1);
}

// Read Excel file
const workbook = XLSX.readFile(excelPath);

// Find steam and water sheets
const steamSheetName = workbook.SheetNames.find(name => 
  name.toLowerCase().includes('ngsteam') || name.toLowerCase().includes('steam')
);
const waterSheetName = workbook.SheetNames.find(name => 
  name.toLowerCase().includes('water')
);

if (!steamSheetName || !waterSheetName) {
  console.error('❌ Required sheets not found');
  console.error('Available sheets:', workbook.SheetNames.join(', '));
  process.exit(1);
}

const steamSheet = workbook.Sheets[steamSheetName];
const waterSheet = workbook.Sheets[waterSheetName];

/**
 * Find latest non-zero row in steam sheet
 */
function parseNGSteamSheet(worksheet) {
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  // Start from row 9 (after headers at row 6-8)
  for (let i = data.length - 1; i >= 9; i--) {
    const row = data[i];
    if (!row) continue;
    
    // Column mapping: B1(3-6), B2(7-10), B3(11-14)
    const b1Steam = parseFloat(row[3]) || 0;
    const b2Steam = parseFloat(row[7]) || 0;
    const b3Steam = parseFloat(row[11]) || 0;
    
    if (b1Steam > 0 || b2Steam > 0 || b3Steam > 0) {
      return {
        b1: {
          steam: b1Steam,
          ng: parseFloat(row[4]) || 0,
          ratio: parseFloat(row[5]) || 0,
        },
        b2: {
          steam: b2Steam,
          ng: parseFloat(row[8]) || 0,
          ratio: parseFloat(row[9]) || 0,
        },
        b3: {
          steam: b3Steam,
          ng: parseFloat(row[12]) || 0,
          ratio: parseFloat(row[13]) || 0,
        },
      };
    }
  }
  
  return null;
}

/**
 * Find latest non-zero water data
 */
function parseWaterSteamSheet(worksheet) {
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
  console.log('DEBUG Water sheet: Total rows:', data.length);
  
  // Start from row 8 (after headers at row 5-7)
  for (let i = data.length - 1; i >= 8; i--) {
    const row = data[i];
    if (!row) continue;
    
    // Debug first few iterations
    if (i > data.length - 5 || i === 554) {
      console.log(`DEBUG Water row ${i}: length=${row.length}, col4=${row[4]}, col10=${row[10]}, col16=${row[16]}`);
    }
    
    if (row.length < 17) continue;
    
    // Water columns: B1(4), B2(10), B3(16)
    const b1Water = parseFloat(row[4]) || 0;
    const b2Water = parseFloat(row[10]) || 0;
    const b3Water = parseFloat(row[16]) || 0;
    
  // Start from row 8 (after headers at row 5-7)
  for (let i = data.length - 1; i >= 8; i--) {
    const row = data[i];
    if (!row || row.length < 17) continue;
    
    // Water columns: B1(4), B2(10), B3(16)
    const b1Water = parseFloat(row[4]) || 0;
    const b2Water = parseFloat(row[10]) || 0;
    const b3Water = parseFloat(row[16]) || 0;
    
    if (b1Water > 0 || b2Water > 0 || b3Water > 0) {
      return {
        b1Water,
        b2Water,
        b3Water,
      };
    }
  }
  
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }),
  boilers: [
    {
      id: 1,
      name: 'Boiler No. 1',
      steam: steamData.b1.steam,
      ng: steamData.b1.ng,
      ratio: steamData.b1.ratio,
      water: waterData.b1Water,
      maxCapacity: 18
    },
    {
      id: 2,
      name: 'Boiler No. 2',
      steam: steamData.b2.steam,
      ng: steamData.b2.ng,
      ratio: steamData.b2.ratio,
      water: waterData.b2Water,
      maxCapacity: 18
    },
    {
      id: 3,
      name: 'Boiler No. 3',
      steam: steamData.b3.steam,
      ng: steamData.b3.ng,
      ratio: steamData.b3.ratio,
      water: waterData.b3Water,
      maxCapacity: 16
    }
  ]
};

// Ensure public directory exists
const publicDir = path.dirname(outputPath);
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Write JSON file
fs.writeFileSync(outputPath, JSON.stringify(jsonData, null, 2));

console.log('✅ JSON created successfully:', outputPath);
console.log('📊 Data:', JSON.stringify(jsonData, null, 2));
