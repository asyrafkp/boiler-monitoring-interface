import { supabase, storeBoilerReading } from './supabaseService';
import { parseNGSteamSheet, parseWaterSteamSheet } from './oneDriveService_v2';
import * as XLSX from 'xlsx';

interface SyncResult {
  success: boolean;
  rowsProcessed: number;
  message: string;
  timestamp: string;
}

// Sync OneDrive Excel file to Supabase
export async function syncOneDriveExcelToSupabase(
  fileContent: ArrayBuffer,
  fileName: string
): Promise<SyncResult> {
  try {
    const workbook = XLSX.read(fileContent, { type: 'array' });
    
    // Parse steam data
    const steamSheetName = workbook.SheetNames.find(name => 
      name.toLowerCase().includes('ngsteam') || name.toLowerCase().includes('steam')
    );
    
    // Parse water data
    const waterSheetName = workbook.SheetNames.find(name => 
      name.toLowerCase().includes('water') || name.toLowerCase().includes('ratio')
    );

    if (!steamSheetName || !waterSheetName) {
      throw new Error('Could not find NGSTEAM or WATER sheet in Excel file');
    }

    const steamSheet = workbook.Sheets[steamSheetName];
    const waterSheet = workbook.Sheets[waterSheetName];

    // Parse the data using existing parsers
    const steamParsed = parseNGSteamSheet(steamSheet);
    const waterParsed = parseWaterSteamSheet(waterSheet);

    // Store in Supabase
    await storeBoilerReading({
      b1_steam: steamParsed.b1.steam,
      b2_steam: steamParsed.b2.steam,
      b3_steam: steamParsed.b3.steam,
      b1_water: waterParsed.b1Water,
      b2_water: waterParsed.b2Water,
      b3_water: waterParsed.b3Water,
      ng_ratio: steamParsed.b1.ng,
      timestamp: new Date().toISOString(),
    });

    // Log upload to admin_uploads table
    const steamData = XLSX.utils.sheet_to_json(steamSheet);
    const { error: uploadLogError } = await supabase
      .from('admin_uploads')
      .insert([
        {
          file_name: fileName,
          uploaded_by: 'admin',
          rows_processed: steamData.length,
          status: 'success',
        },
      ]);

    if (uploadLogError) {
      console.warn('Warning: Could not log upload:', uploadLogError);
    }

    return {
      success: true,
      rowsProcessed: steamData.length,
      message: `Successfully synced ${steamData.length} rows from ${fileName}`,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Sync error:', error);
    
    // Log failed upload
    try {
      await supabase
        .from('admin_uploads')
        .insert([
          {
            file_name: fileName,
            uploaded_by: 'admin',
            rows_processed: 0,
            status: 'failed',
          },
        ]);
    } catch (logError) {
      console.warn('Could not log failed upload:', logError);
    }

    throw new Error(
      error instanceof Error ? error.message : 'Unknown sync error'
    );
  }
}

// Get sync history
export async function getSyncHistory(limit: number = 10) {
  const { data, error } = await supabase
    .from('admin_uploads')
    .select('*')
    .order('upload_date', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching sync history:', error);
    throw error;
  }

  return data || [];
}
