#!/usr/bin/env node
/**
 * Parse REPORT sheets from Excel and create JSON files for each boiler's daily data
 */

import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const excelPath = path.join(__dirname, '../../data/boiler_data.xlsx');
const outputDir = path.join(__dirname, '../../public');

console.log('📊 Parsing boiler daily reports...');

if (!fs.existsSync(excelPath)) {
  console.error('❌ Excel file not found:', excelPath);
  process.exit(1);
}

// Read Excel file
const workbook = XLSX.readFile(excelPath);

/**
 * Parse REPORT B1 and REPORT B2 sheets (same layout)
 * Columns: DATE, STEAM, WATER, WATER/TONNE STEAM, NATURAL GAS, NG/TONNE STEAM, T1, T2, TOTAL, ELECTRIC/TONNE, WASTE GAS
 */
function parseReportB1B2(worksheet, boilerNum) {
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  const dailyData = [];

  // Data starts from row 6 (index 5), skip header rows
  for (let i = 5; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length < 2) continue;

    const dateValue = row[0];
    if (!dateValue || dateValue === 0) continue;

    // Parse date
    let dateStr = '';
    if (typeof dateValue === 'number') {
      // Excel date serial number
      const date = new Date((dateValue - 25569) * 86400 * 1000);
      dateStr = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    } else {
      dateStr = dateValue.toString();
    }

    const steam = parseFloat(row[1]) || 0;
    const water = parseFloat(row[2]) || 0;
    const waterPerTonneSteam = parseFloat(row[3]) || 0;
    const naturalGas = parseFloat(row[4]) || 0;
    const ngPerTonneSteam = parseFloat(row[5]) || 0;
    const electric = parseFloat(row[9]) || 0;
    const wasteGas = parseFloat(row[10]) || 0;

    // Only include rows with actual data
    if (steam > 0 || water > 0 || naturalGas > 0) {
      dailyData.push({
        date: dateStr,
        steam,
        water,
        waterPerTonneSteam,
        naturalGas,
        ngPerTonneSteam,
        electric,
        wasteGas
      });
    }
  }

  return dailyData;
}

// Process each boiler
const boilers = [
  { num: 1, sheetName: 'REPORT B1' },
  { num: 2, sheetName: 'REPORT B2' },
  // B3 will be added later with different parser
];

for (const boiler of boilers) {
  const sheet = workbook.Sheets[boiler.sheetName];
  
  if (!sheet) {
    console.warn(`⚠️  Sheet "${boiler.sheetName}" not found, skipping...`);
    continue;
  }

  console.log(`📋 Processing ${boiler.sheetName}...`);
  
  const dailyData = parseReportB1B2(sheet, boiler.num);
  
  const outputData = {
    boilerId: boiler.num,
    boilerName: `Boiler No. ${boiler.num}`,
    lastUpdate: new Date().toISOString(),
    dailyData
  };

  const outputPath = path.join(outputDir, `boiler_${boiler.num}_daily.json`);
  fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
  
  console.log(`✅ Created ${outputPath} with ${dailyData.length} days of data`);
}

console.log('🎉 All boiler reports parsed successfully!');
