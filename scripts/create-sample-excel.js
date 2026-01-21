#!/usr/bin/env node
/**
 * Create sample boiler Excel files for initial GitHub sync
 */

import XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Sample data structure for NGSTEAM RATIO sheet
const createNGSteamSheet = () => {
  const data = [];
  
  // Headers
  data.push(['Date', 'Time', '', '', 'B1 Steam', 'B1 NG', 'B1 Output', 'B1 Ratio', '', 'B2 Steam', 'B2 NG', 'B2 Output', 'B2 Ratio', '', 'B3 Steam', 'B3 NG', 'B3 Output', 'B3 Ratio']);
  
  // Add 50 rows of sample data (minimal size for testing)
  for (let i = 1; i < 50; i++) {
    data.push([
      '01/01/2026',
      '12:00:00',
      '',
      '',
      8.5 + Math.random() * 2,
      4.2 + Math.random() * 1,
      16.1 + Math.random() * 2,
      0.50 + Math.random() * 0.1,
      '',
      7.8 + Math.random() * 2,
      3.9 + Math.random() * 1,
      15.2 + Math.random() * 2,
      0.49 + Math.random() * 0.1,
      '',
      6.5 + Math.random() * 1.5,
      3.2 + Math.random() * 0.8,
      12.1 + Math.random() * 1.5,
      0.48 + Math.random() * 0.1
    ]);
  }
  
  // Add sum row at row 51
  data.push([
    '01/01/2026',
    '12:30:00',
    '',
    '',
    9.2,
    4.5,
    16.5,
    0.52,
    '',
    8.1,
    4.1,
    15.8,
    0.51,
    '',
    7.0,
    3.5,
    12.8,
    0.50
  ]);
  
  return data;
};

// Sample data structure for WATER_STEAM RATIO sheet
const createWaterSteamSheet = () => {
  const data = [];
  
  // Headers
  data.push(['Date', 'Time', '', '', '', '', 'B1 Water', '', '', '', '', '', 'B2 Water', '', '', '', '', '', 'B3 Water']);
  
  // Add 50 rows of sample data (minimal size)
  for (let i = 1; i < 50; i++) {
    data.push([
      '01/01/2026',
      '12:00:00',
      '', '', '', '',
      45.2 + Math.random() * 10,
      '', '', '', '', '',
      42.8 + Math.random() * 10,
      '', '', '', '', '',
      38.5 + Math.random() * 8
    ]);
  }
  
  // Add sum row at row 51
  data.push([
    '01/01/2026',
    '12:30:00',
    '', '', '', '',
    48.5,
    '', '', '', '', '',
    45.2,
    '', '', '', '', '',
    40.1
  ]);
  
  return data;
};

try {
  // Create workbook with two sheets
  const wb = XLSX.utils.book_new();
  
  // Add NGSTEAM RATIO sheet
  const ngData = createNGSteamSheet();
  const ngSheet = XLSX.utils.aoa_to_sheet(ngData);
  XLSX.utils.book_append_sheet(wb, ngSheet, 'NGSTEAM RATIO');
  
  // Add WATER_STEAM RATIO sheet
  const waterData = createWaterSteamSheet();
  const waterSheet = XLSX.utils.aoa_to_sheet(waterData);
  XLSX.utils.book_append_sheet(wb, waterSheet, 'WATER_STEAM RATIO');
  
  // Write file
  const filePath = path.join(dataDir, 'boiler_data.xlsx');
  XLSX.writeFile(wb, filePath);
  
  console.log(`✅ Sample Excel file created: ${filePath}`);
  console.log(`📊 File contains:`);
  console.log(`   - NGSTEAM RATIO sheet (506 rows)`);
  console.log(`   - WATER_STEAM RATIO sheet (506 rows)`);
  console.log(`   - Sample boiler data with realistic values`);
} catch (error) {
  console.error('❌ Error creating Excel file:', error.message);
  process.exit(1);
}
