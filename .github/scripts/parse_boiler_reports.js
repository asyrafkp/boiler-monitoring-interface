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

    const steam = Math.max(0, parseFloat(row[1]) || 0);
    const water = Math.max(0, parseFloat(row[2]) || 0);
    const waterPerTonneSteam = Math.max(0, parseFloat(row[3]) || 0);
    const naturalGas = Math.max(0, parseFloat(row[4]) || 0);
    const ngPerTonneSteam = Math.max(0, parseFloat(row[5]) || 0);
    const electric = Math.max(0, parseFloat(row[9]) || 0);
    const wasteGas = Math.max(0, parseFloat(row[10]) || 0);

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

/**
 * Parse REPORT B3 sheet (same layout as B1/B2 based on provided image)
 * Columns: DATE, STEAM, WATER, WATER/TONNE STEAM, NATURAL GAS, NG/TONNE STEAM, ELECTRIC (T1, T2, TOTAL), ELECTRIC/TONNE STEAM
 * Note: Any negative values are automatically converted to 0
 */
function parseReportB3(worksheet, boilerNum) {
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  const dailyData = [];

  // Data starts from row 9 (index 8) based on the image, skip header rows
  for (let i = 8; i < data.length; i++) {
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

    // Extract values and ensure no negative values (convert to 0)
    const steam = Math.max(0, parseFloat(row[1]) || 0);
    const water = Math.max(0, parseFloat(row[2]) || 0);
    const waterPerTonneSteam = Math.max(0, parseFloat(row[3]) || 0);
    const naturalGas = Math.max(0, parseFloat(row[4]) || 0);
    const ngPerTonneSteam = Math.max(0, parseFloat(row[5]) || 0);
    // Electric columns: T1 (6), T2 (7), TOTAL (8)
    const electric = Math.max(0, parseFloat(row[8]) || 0);
    const electricPerTonne = Math.max(0, parseFloat(row[9]) || 0);
    // Note: B3 sheet doesn't have waste gas column based on image
    const wasteGas = 0;

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
  { num: 1, sheetName: 'REPORT B1', parser: parseReportB1B2 },
  { num: 2, sheetName: 'REPORT B2', parser: parseReportB1B2 },
  { num: 3, sheetName: 'REPORT B3', parser: parseReportB3 }
];

for (const boiler of boilers) {
  const sheet = workbook.Sheets[boiler.sheetName];
  
  if (!sheet) {
    console.warn(`⚠️  Sheet "${boiler.sheetName}" not found, skipping...`);
    continue;
  }

  console.log(`📋 Processing ${boiler.sheetName}...`);
  
  const dailyData = boiler.parser(sheet, boiler.num);
  
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
