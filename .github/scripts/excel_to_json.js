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
  name.toLowerCase().includes('ngsteam')
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
 * Returns data from the SAME row for all boilers
 */
function parseNGSteamSheet(worksheet) {
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
  // Search from row 540 down to row 9 (user confirmed row 535/index 533 has latest valid data)
  // Limiting search to avoid test data in later rows
  const maxRow = Math.min(data.length - 1, 540);
  
  for (let i = maxRow; i >= 9; i--) {
    const row = data[i];
    if (!row || row.length < 11) continue;
    
    // Column mapping: B1(3-6), B2(7-10), B3(11-14)
    const b1Steam = parseFloat(row[3]) || 0;
    const b2Steam = parseFloat(row[7]) || 0;
    const b3Steam = parseFloat(row[11]) || 0;
    
    // Find the first row with ANY boiler data, then return ALL boilers from that SAME row
    if (b1Steam > 0 || b2Steam > 0 || b3Steam > 0) {
      return {
        rowIndex: i, // Return row index so water data can use the same row
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
 * Get water data from the SAME row as steam data
 */
function parseWaterSteamSheet(worksheet, rowIndex) {
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
  // Use the SAME row index as steam data to ensure consistency
  if (rowIndex < 0 || rowIndex >= data.length) {
    return null;
  }
  
  const row = data[rowIndex];
  if (!row || row.length < 18) {
    return null;
  }
  
  // Water columns: B1(3), B2(15), B3(17) based on row 533 analysis
  const b1Water = parseFloat(row[3]) || 0;
  const b2Water = parseFloat(row[15]) || 0;
  const b3Water = parseFloat(row[17]) || 0;
  
  return {
    b1Water,
    b2Water,
    b3Water,
  };
}

// Parse data - ensure steam and water come from the SAME row
const steamData = parseNGSteamSheet(steamSheet);
const waterData = steamData ? parseWaterSteamSheet(waterSheet, steamData.rowIndex) : null;

if (!steamData || !waterData) {
  console.error('❌ No valid data found in Excel');
  process.exit(1);
}

// Create JSON output
const jsonData = {
  timestamp: new Date().toISOString(),
  lastUpdate: new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
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
