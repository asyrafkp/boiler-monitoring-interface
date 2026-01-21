import { supabase, storeBoilerReading } from './supabaseService';
import { parseNGSteamSheet, parseWaterSteamSheet } from './oneDriveService_v2';
import * as XLSX from 'xlsx';

interface GitHubSyncResult {
  success: boolean;
  message: string;
  rowsProcessed: number;
  fileName: string;
  timestamp: string;
}

/**
 * Fetch and sync Excel file from GitHub repository
 * No authentication needed - uses public GitHub raw content URLs
 */
export async function syncFromGitHub(): Promise<GitHubSyncResult> {
  try {
    const owner = 'asyrafkp';
    const repo = 'boiler-monitoring-interface';
    const branch = 'main';
    const filePath = 'data/boiler_data.xlsx';

    // Try multiple CDN sources for better reliability
    const urls = [
      // jsDelivr CDN (often faster)
      `https://cdn.jsdelivr.net/gh/${owner}/${repo}@${branch}/${filePath}`,
      // GitHub raw content (primary source)
      `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`,
      // Ghproxy (backup mirror)
      `https://ghproxy.com/https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`,
    ];

    let lastError = null;
    let arrayBuffer = null;

    // Try each URL until one works
    for (const url of urls) {
      try {
        console.log(`🔗 Trying: ${url}`);
        const response = await fetch(url);
        
        console.log(`📡 Response Status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
          arrayBuffer = await response.arrayBuffer();
          console.log(`✅ Downloaded ${arrayBuffer.byteLength} bytes from ${url.split('/')[2]}`);
          break;
        } else {
          console.warn(`⚠️ Got ${response.status} from ${url}`);
          lastError = new Error(`${response.status} ${response.statusText}`);
        }
      } catch (err) {
        console.warn(`⚠️ Failed to fetch from ${url}:`, err instanceof Error ? err.message : err);
        lastError = err;
        continue;
      }
    }

    if (!arrayBuffer) {
      throw new Error(
        `Failed to fetch from all sources. Last error: ${lastError instanceof Error ? lastError.message : 'Unknown'}. ` +
        `Make sure ${filePath} exists in the ${branch} branch.`
      );
    }
    
    // Parse Excel file
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    // Find sheets
    const steamSheetName = workbook.SheetNames.find(name =>
      name.toLowerCase().includes('ngsteam') || name.toLowerCase().includes('steam')
    );

    const waterSheetName = workbook.SheetNames.find(name =>
      name.toLowerCase().includes('water') || name.toLowerCase().includes('ratio')
    );

    if (!steamSheetName || !waterSheetName) {
      throw new Error('Excel file missing NGSTEAM RATIO or WATER_STEAM RATIO sheet');
    }

    const steamSheet = workbook.Sheets[steamSheetName];
    const waterSheet = workbook.Sheets[waterSheetName];

    // Parse data
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

    // Log the sync
    const steamData = XLSX.utils.sheet_to_json(steamSheet);
    const { error: logError } = await supabase
      .from('admin_uploads')
      .insert([
        {
          file_name: filePath,
          uploaded_by: 'github_sync',
          rows_processed: steamData.length,
          status: 'success',
        },
      ]);

    if (logError) {
      console.warn('Warning: Could not log GitHub sync:', logError);
    }

    return {
      success: true,
      message: `✅ Successfully synced from GitHub (${steamData.length} rows)`,
      rowsProcessed: steamData.length,
      fileName: filePath,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('GitHub sync error:', error);

    // Log failed sync
    try {
      await supabase
        .from('admin_uploads')
        .insert([
          {
            file_name: 'data/boiler_data.xlsx',
            uploaded_by: 'github_sync',
            rows_processed: 0,
            status: 'failed',
          },
        ]);
    } catch (logError) {
      console.warn('Could not log failed GitHub sync:', logError);
    }

    throw error;
  }
}

/**
 * Get the GitHub repository information
 */
export function getGitHubRepoInfo() {
  return {
    owner: 'asyrafkp',
    repo: 'boiler-monitoring-interface',
    branch: 'main',
    dataPath: 'data/boiler_data.xlsx',
    repoUrl: 'https://github.com/asyrafkp/boiler-monitoring-interface',
    instructionsUrl:
      'https://github.com/asyrafkp/boiler-monitoring-interface/blob/main/GITHUB_SYNC_SETUP.md',
  };
}
