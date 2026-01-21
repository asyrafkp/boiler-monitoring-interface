import { parseNGSteamSheet, parseWaterSteamSheet } from './oneDriveService_v2';
import * as XLSX from 'xlsx';

export interface SyncResult {
  success: boolean;
  rowsProcessed: number;
  message: string;
  timestamp: string;
}

export interface SyncLog {
  id: number;
  file_name: string;
  upload_date: string;
  rows_processed: number;
  status: string;
  sync_type: string;
}

// In-memory sync history
let syncHistory: SyncLog[] = [];
let syncIdCounter = 1;

// Load sync history from localStorage on startup
function loadSyncHistory() {
  try {
    const stored = localStorage.getItem('sync_history');
    if (stored) {
      syncHistory = JSON.parse(stored);
      // Find max id for counter
      const maxId = Math.max(...syncHistory.map(s => s.id), 0);
      syncIdCounter = maxId + 1;
    }
  } catch (error) {
    console.warn('Could not load sync history from localStorage:', error);
    syncHistory = [];
  }
}

// Save sync history to localStorage
function saveSyncHistory() {
  try {
    localStorage.setItem('sync_history', JSON.stringify(syncHistory));
  } catch (error) {
    console.warn('Could not save sync history to localStorage:', error);
  }
}

// Initialize on import
loadSyncHistory();

// Sync OneDrive Excel file and log to local storage
export async function syncOneDriveExcelToSupabase(
  fileContent: ArrayBuffer,
  fileName: string
): Promise<SyncResult> {
  try {
    console.log(`📥 Starting sync for file: ${fileName}`);
    console.log(`📦 File size: ${fileContent.byteLength} bytes`);
    
    const workbook = XLSX.read(fileContent, { type: 'array' });
    console.log(`📑 Found sheets: ${workbook.SheetNames.join(', ')}`);
    
    // Parse steam data
    const steamSheetName = workbook.SheetNames.find(name => 
      name.toLowerCase().includes('ngsteam') || name.toLowerCase().includes('steam')
    );
    
    // Parse water data
    const waterSheetName = workbook.SheetNames.find(name => 
      name.toLowerCase().includes('water') || name.toLowerCase().includes('ratio')
    );

    console.log(`🔍 Steam sheet: ${steamSheetName}, Water sheet: ${waterSheetName}`);

    if (!steamSheetName || !waterSheetName) {
      throw new Error(
        `Could not find required sheets. Found: ${workbook.SheetNames.join(', ')}. ` +
        `Please ensure your Excel has "NGSTEAM RATIO" and "WATER_STEAM RATIO" sheets.`
      );
    }

    const steamSheet = workbook.Sheets[steamSheetName];
    const waterSheet = workbook.Sheets[waterSheetName];

    console.log('📊 Parsing steam data...');
    // Parse the data using existing parsers
    const steamParsed = parseNGSteamSheet(steamSheet);
    
    console.log('💧 Parsing water data...');
    const waterParsed = parseWaterSteamSheet(waterSheet);

    console.log('📈 Parsed values:', {
      b1_steam: steamParsed.b1.steam,
      b2_steam: steamParsed.b2.steam,
      b3_steam: steamParsed.b3.steam,
      b1_water: waterParsed.b1Water,
      b2_water: waterParsed.b2Water,
      b3_water: waterParsed.b3Water,
    });

    // Log to local sync history
    const steamData = XLSX.utils.sheet_to_json(steamSheet);
    const syncLog: SyncLog = {
      id: syncIdCounter++,
      file_name: fileName,
      upload_date: new Date().toISOString(),
      rows_processed: steamData.length,
      status: 'success',
      sync_type: 'manual'
    };
    syncHistory.unshift(syncLog);
    // Keep only last 50 syncs
    if (syncHistory.length > 50) {
      syncHistory = syncHistory.slice(0, 50);
    }
    saveSyncHistory();
    
    console.log('✅ Data parsed and sync logged successfully');

    return {
      success: true,
      rowsProcessed: steamData.length,
      message: `✅ Successfully synced ${steamData.length} rows from ${fileName}`,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('❌ Sync error:', errorMsg);
    console.error('Full error:', error);
    
    // Log failed sync
    const syncLog: SyncLog = {
      id: syncIdCounter++,
      file_name: fileName,
      upload_date: new Date().toISOString(),
      rows_processed: 0,
      status: 'failed',
      sync_type: 'manual'
    };
    syncHistory.unshift(syncLog);
    saveSyncHistory();

    throw new Error(errorMsg);
  }
}

// Get sync history
export async function getSyncHistory(limit: number = 10): Promise<SyncLog[]> {
  loadSyncHistory();
  return syncHistory.slice(0, limit);
}

// Add OneDrive sync to history (called from GitHub workflow via JSON update)
export function addSyncHistory(entry: Omit<SyncLog, 'id'>): SyncLog {
  const syncLog: SyncLog = {
    id: syncIdCounter++,
    ...entry
  };
  syncHistory.unshift(syncLog);
  if (syncHistory.length > 50) {
    syncHistory = syncHistory.slice(0, 50);
  }
  saveSyncHistory();
  return syncLog;
