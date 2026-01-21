#!/usr/bin/env node
/**
 * Parse Excel file and sync boiler data to Supabase
 * Run by GitHub Actions after Excel is downloaded from OneDrive
 */

import XLSX from 'xlsx';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Get Supabase credentials from environment
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase environment variables');
  console.error('   Please set SUPABASE_URL and SUPABASE_ANON_KEY secrets');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('🔄 Syncing Excel data to Supabase...');

/**
 * Find latest non-zero row in steam sheet
 */
function parseNGSteamSheet(worksheet) {
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
  // Search from bottom to find latest non-zero data
  for (let i = data.length - 1; i >= 0; i--) {
    const row = data[i];
    if (!row || row.length < 8) continue;
    
    const b1Steam = parseFloat(row[4]) || 0;
    const b2Steam = parseFloat(row[9]) || 0;
    const b3Steam = parseFloat(row[14]) || 0;
    
    // Check if any boiler has non-zero steam
    if (b1Steam > 0 || b2Steam > 0 || b3Steam > 0) {
      return {
        b1: {
          steam: b1Steam,
          ng: parseFloat(row[5]) || 0,
          ratio: parseFloat(row[7]) || 0,
        },
        b2: {
          steam: b2Steam,
          ng: parseFloat(row[10]) || 0,
          ratio: parseFloat(row[12]) || 0,
        },
        b3: {
          steam: b3Steam,
          ng: parseFloat(row[15]) || 0,
          ratio: parseFloat(row[17]) || 0,
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
  
  // Search from bottom to find latest non-zero data
  for (let i = data.length - 1; i >= 0; i--) {
    const row = data[i];
    if (!row || row.length < 20) continue;
    
    const b1Water = parseFloat(row[6]) || 0;
    const b2Water = parseFloat(row[12]) || 0;
    const b3Water = parseFloat(row[18]) || 0;
    
    // Check if any boiler has water data
    if (b1Water > 0 || b2Water > 0 || b3Water > 0) {
      return {
        b1Water,
        b2Water,
        b3Water,
      };
    }
  }
  
  return { b1Water: 0, b2Water: 0, b3Water: 0 };
}

async function syncExcelToSupabase() {
  try {
    const excelPath = path.join(__dirname, '../../data/boiler_data.xlsx');
    
    if (!fs.existsSync(excelPath)) {
      throw new Error(`Excel file not found: ${excelPath}`);
    }

    console.log(`📂 Reading Excel file: ${excelPath}`);
    
    const workbook = XLSX.readFile(excelPath);
    console.log(`📑 Found sheets: ${workbook.SheetNames.join(', ')}`);

    // Find sheet names
    const steamSheetName = workbook.SheetNames.find(name =>
      name.toLowerCase().includes('ngsteam') || name.toLowerCase().includes('steam')
    );

    const waterSheetName = workbook.SheetNames.find(name =>
      name.toLowerCase().includes('water') || name.toLowerCase().includes('ratio')
    );

    if (!steamSheetName || !waterSheetName) {
      throw new Error(
        `Could not find required sheets. Found: ${workbook.SheetNames.join(', ')}`
      );
    }

    console.log(`🔍 Steam sheet: ${steamSheetName}, Water sheet: ${waterSheetName}`);

    // Parse sheets
    const steamSheet = workbook.Sheets[steamSheetName];
    const waterSheet = workbook.Sheets[waterSheetName];

    const steamData = parseNGSteamSheet(steamSheet);
    const waterData = parseWaterSteamSheet(waterSheet);

    if (!steamData) {
      throw new Error('Could not parse steam data from Excel');
    }

    console.log('📊 Parsed data:', {
      b1_steam: steamData.b1.steam,
      b2_steam: steamData.b2.steam,
      b3_steam: steamData.b3.steam,
      b1_water: waterData.b1Water,
      b2_water: waterData.b2Water,
      b3_water: waterData.b3Water,
    });

    // Store in Supabase
    const { error } = await supabase
      .from('boiler_readings')
      .insert([
        {
          b1_steam: steamData.b1.steam,
          b2_steam: steamData.b2.steam,
          b3_steam: steamData.b3.steam,
          b1_water: waterData.b1Water,
          b2_water: waterData.b2Water,
          b3_water: waterData.b3Water,
          ng_ratio: steamData.b1.ng,
          created_at: new Date().toISOString(),
        },
      ]);

    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }

    console.log('✅ Data successfully stored in Supabase');
    console.log(`📅 Timestamp: ${new Date().toISOString()}`);

  } catch (error) {
    console.error('❌ Error during sync:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run sync
syncExcelToSupabase();
