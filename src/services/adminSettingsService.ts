import { supabase, storeBoilerReading } from './supabaseService';
import { parseNGSteamSheet, parseWaterSteamSheet } from './oneDriveService_v2';
import * as XLSX from 'xlsx';

export interface AdminSetting {
  id: number;
  setting_key: string;
  setting_value: string;
  description?: string;
  updated_by?: string;
  updated_at: string;
}

export interface SyncResult {
  success: boolean;
  message: string;
  rowsProcessed: number;
}

/**
 * Get a specific admin setting
 */
export async function getAdminSetting(
  settingKey: string
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('admin_settings')
      .select('setting_value')
      .eq('setting_key', settingKey)
      .single();

    if (error) {
      console.error(`Error getting setting ${settingKey}:`, error);
      return null;
    }

    return data?.setting_value || null;
  } catch (error) {
    console.error('Error in getAdminSetting:', error);
    return null;
  }
}

/**
 * Update an admin setting
 */
export async function updateAdminSetting(
  settingKey: string,
  settingValue: string,
  updatedBy?: string
): Promise<boolean> {
  try {
    const { error, data } = await supabase
      .from('admin_settings')
      .upsert(
        {
          setting_key: settingKey,
          setting_value: settingValue,
          updated_by: updatedBy || 'admin',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'setting_key' }
      );

    if (error) {
      console.error(`❌ Error updating setting ${settingKey}:`, error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
      });
      throw new Error(error.message || 'Failed to update setting');
    }

    console.log(`✅ Setting updated: ${settingKey}`, data);
    return true;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in updateAdminSetting:', errorMsg);
    throw error;
  }
}

/**
 * Get OneDrive Excel link
 */
export async function getOneDriveLink(): Promise<string> {
  const link = await getAdminSetting('onedrive_excel_link');
  return link || '';
}

/**
 * Update OneDrive Excel link
 */
export async function updateOneDriveLink(
  link: string,
  updatedBy?: string
): Promise<boolean> {
  if (!link || !link.startsWith('http')) {
    throw new Error('Invalid OneDrive link format');
  }

  return await updateAdminSetting('onedrive_excel_link', link, updatedBy);
}

/**
 * Get all admin settings
 */
export async function getAllAdminSettings(): Promise<AdminSetting[]> {
  try {
    const { data, error } = await supabase
      .from('admin_settings')
      .select('*')
      .order('setting_key', { ascending: true });

    if (error) {
      console.error('Error getting settings:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAllAdminSettings:', error);
    return [];
  }
}

/**
 * Sync Excel data from OneDrive link and store in Supabase
 * Called after admin updates the OneDrive link
 */
export async function syncFromOneDriveLink(
  directLink: string
): Promise<SyncResult> {
  try {
    if (!directLink || !directLink.startsWith('http')) {
      throw new Error('Invalid OneDrive link format');
    }

    console.log('📥 Syncing from OneDrive link:', directLink);

    // Convert OneDrive share link to download URL
    // Share link: https://1drv.ms/x/c/...
    // Download URL: https://1drv.ms/x/c/...?download=1
    const downloadUrl = directLink.includes('?') 
      ? `${directLink}&download=1` 
      : `${directLink}?download=1`;

    // Fetch the Excel file
    const response = await fetch(downloadUrl);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch from OneDrive (${response.status}). ` +
        `Make sure the link is correct and the file is shared.`
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    // Find sheets
    const steamSheetName = workbook.SheetNames.find(
      name =>
        name.toLowerCase().includes('ngsteam') ||
        name.toLowerCase().includes('steam')
    );

    const waterSheetName = workbook.SheetNames.find(
      name =>
        name.toLowerCase().includes('water') ||
        name.toLowerCase().includes('ratio')
    );

    if (!steamSheetName || !waterSheetName) {
      throw new Error(
        'Could not find NGSTEAM RATIO or WATER_STEAM RATIO sheets in Excel file'
      );
    }

    // Parse sheets
    const steamSheet = workbook.Sheets[steamSheetName];
    const waterSheet = workbook.Sheets[waterSheetName];

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

    console.log('✅ Data synced successfully from OneDrive');

    return {
      success: true,
      message: '✅ Data synced successfully from OneDrive link',
      rowsProcessed: 1,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Error syncing from OneDrive:', errorMsg);
    throw error;
  }
}
