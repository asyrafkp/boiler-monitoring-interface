#!/usr/bin/env node
/**
 * Parse DATA sheets from Excel and create JSON files for each boiler's hourly data
 */

import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const excelPath = path.join(__dirname, '../../data/boiler_data.xlsx');
const outputDir = path.join(__dirname, '../../public');

console.log('⏱️  Parsing boiler hourly data...');

if (!fs.existsSync(excelPath)) {
  console.error('❌ Excel file not found:', excelPath);
  process.exit(1);
}

// Read Excel file
const workbook = XLSX.readFile(excelPath);

/**
 * Parse DATA B1 and DATA B2 sheets (same layout)
 * Columns from image: DATE, TIME, STEAM, WATER, T1, T2, MWH, BURNER1 (NG), BURNER2 (NG), TOTAL (NG),
 *                     BURNER1 (WG), BURNER2 (WG), TOTAL (WG), Temp, Pressure, Temp In, Temp Out (Economiser),
 *                     Temp In, Temp Out (Flue Gas), Blowdown time
 */
function parseDataB1B2(worksheet, boilerNum) {
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  const hourlyDataByDate = {};

  // Data starts from row 12 (index 11) based on typical format
  for (let i = 11; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length < 3) continue;

    const dateValue = row[0];
    const timeValue = row[1];
    
    // Skip if no time value
    if (!timeValue) continue;

    // Parse date
    let dateStr = '';
    if (typeof dateValue === 'number') {
      const date = new Date((dateValue - 25569) * 86400 * 1000);
      dateStr = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    } else if (dateValue) {
      dateStr = dateValue.toString();
    }

    // If no date in current row, use last known date
    if (!dateStr && Object.keys(hourlyDataByDate).length > 0) {
      const dates = Object.keys(hourlyDataByDate);
      dateStr = dates[dates.length - 1];
    }

    if (!dateStr) continue;

    // Parse time
    let timeStr = '';
    if (typeof timeValue === 'number') {
      const hours = Math.floor(timeValue * 24);
      const minutes = Math.floor((timeValue * 24 - hours) * 60);
      timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } else {
      timeStr = timeValue.toString();
    }

    // Extract all values and ensure no negatives
    const steam = Math.max(0, parseFloat(row[2]) || 0);
    const water = Math.max(0, parseFloat(row[3]) || 0);
    const electricT1 = Math.max(0, parseFloat(row[4]) || 0);
    const electricT2 = Math.max(0, parseFloat(row[5]) || 0);
    const electricTotal = Math.max(0, parseFloat(row[6]) || 0);
    const ngBurner1 = Math.max(0, parseFloat(row[7]) || 0);
    const ngBurner2 = Math.max(0, parseFloat(row[8]) || 0);
    const ngTotal = Math.max(0, parseFloat(row[9]) || 0);
    const wgBurner1 = Math.max(0, parseFloat(row[10]) || 0);
    const wgBurner2 = Math.max(0, parseFloat(row[11]) || 0);
    const wgTotal = Math.max(0, parseFloat(row[12]) || 0);
    const feedPumpTemp = Math.max(0, parseFloat(row[13]) || 0);
    const feedPumpPressure = Math.max(0, parseFloat(row[14]) || 0);
    const economiserTempIn = Math.max(0, parseFloat(row[15]) || 0);
    const economiserTempOut = Math.max(0, parseFloat(row[16]) || 0);
    const flueGasTempIn = Math.max(0, parseFloat(row[17]) || 0);
    const flueGasTempOut = Math.max(0, parseFloat(row[18]) || 0);
    const blowdownTime = Math.max(0, parseFloat(row[19]) || 0);

    // Initialize array for date if not exists
    if (!hourlyDataByDate[dateStr]) {
      hourlyDataByDate[dateStr] = [];
    }

    hourlyDataByDate[dateStr].push({
      time: timeStr,
      steam,
      water,
      electricT1,
      electricT2,
      electricTotal,
      ngBurner1,
      ngBurner2,
      ngTotal,
      wgBurner1,
      wgBurner2,
      wgTotal,
      feedPumpTemp,
      feedPumpPressure,
      economiserTempIn,
      economiserTempOut,
      flueGasTempIn,
      flueGasTempOut,
      blowdownTime
    });
  }

  return hourlyDataByDate;
}

// Process boilers with hourly data (B1 and B2)
const boilers = [
  { num: 1, sheetName: 'DATA B1', parser: parseDataB1B2 },
  { num: 2, sheetName: 'DATA B2', parser: parseDataB1B2 }
];

for (const boiler of boilers) {
  const sheet = workbook.Sheets[boiler.sheetName];
  
  if (!sheet) {
    console.warn(`⚠️  Sheet "${boiler.sheetName}" not found, skipping...`);
    continue;
  }

  console.log(`📋 Processing ${boiler.sheetName}...`);
  
  const hourlyDataByDate = boiler.parser(sheet, boiler.num);
  
  const outputData = {
    boilerId: boiler.num,
    boilerName: `Boiler No. ${boiler.num}`,
    lastUpdate: new Date().toISOString(),
    hourlyData: hourlyDataByDate
  };

  const outputPath = path.join(outputDir, `boiler_${boiler.num}_hourly.json`);
  fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
  
  const totalDates = Object.keys(hourlyDataByDate).length;
  const totalRecords = Object.values(hourlyDataByDate).reduce((sum, arr) => sum + arr.length, 0);
  console.log(`✅ Created ${outputPath} with ${totalRecords} hourly records across ${totalDates} dates`);
}

console.log('🎉 All hourly data parsed successfully!');
