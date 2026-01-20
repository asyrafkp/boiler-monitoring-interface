/**
 * OneDrive Integration Service v2
 * Fetches and parses Excel data from OneDrive using Microsoft Graph API
 */

import * as XLSX from 'xlsx'
import { graphApiService } from './graphApiService'

export interface ParsedBoilerData {
  b1: { steam: number; ng: number; ratio: number; output: number }
  b2: { steam: number; ng: number; ratio: number; output: number }
  b3: { steam: number; ng: number; ratio: number; output: number }
  b1Water: number
  b2Water: number
  b3Water: number
  timestamp: Date
}

/**
 * Find the latest row with non-zero steam data for any boiler
 * Columns: E-H (B1), I-L (B2), M-P (B3)
 */
export function parseNGSteamSheet(data: XLSX.WorkSheet): Omit<ParsedBoilerData, 'b1Water' | 'b2Water' | 'b3Water' | 'timestamp'> {
  // Convert worksheet to array format
  const rows = XLSX.utils.sheet_to_json(data, { header: 1 }) as any[][]

  if (rows.length === 0) {
    throw new Error(`NGSTEAM RATIO sheet is empty`)
  }

  // Find latest row with non-zero steam data
  let targetRow = -1
  
  // Search from bottom to top for row with actual data
  for (let i = rows.length - 1; i >= 0; i--) {
    const row = rows[i]
    if (!row) continue
    
    // Check if any boiler has non-zero steam (columns 4, 8, 12)
    const b1Steam = parseFloat(String(row[4])) || 0
    const b2Steam = parseFloat(String(row[8])) || 0
    const b3Steam = parseFloat(String(row[12])) || 0
    
    if (b1Steam > 0 || b2Steam > 0 || b3Steam > 0) {
      targetRow = i
      break
    }
  }

  if (targetRow === -1) {
    throw new Error(`No rows with non-zero steam data found in NGSTEAM RATIO sheet`)
  }

  const sumRow = rows[targetRow]
  console.log(`Found latest data at row ${targetRow + 1} (Excel row number)`)

  // Extract Boiler 1 (Columns E-H = indices 4-7)
  const b1Steam = parseFloat(String(sumRow[4])) || 0
  const b1NG = parseFloat(String(sumRow[5])) || 0
  const b1Ratio = parseFloat(String(sumRow[6])) || 0
  const b1Output = parseFloat(String(sumRow[7])) || 0

  // Extract Boiler 2 (Columns I-L = indices 8-11)
  const b2Steam = parseFloat(String(sumRow[8])) || 0
  const b2NG = parseFloat(String(sumRow[9])) || 0
  const b2Ratio = parseFloat(String(sumRow[10])) || 0
  const b2Output = parseFloat(String(sumRow[11])) || 0

  // Extract Boiler 3 (Columns M-P = indices 12-15)
  const b3Steam = parseFloat(String(sumRow[12])) || 0
  const b3NG = parseFloat(String(sumRow[13])) || 0
  const b3Ratio = parseFloat(String(sumRow[14])) || 0
  const b3Output = parseFloat(String(sumRow[15])) || 0

  return {
    b1: { steam: b1Steam, ng: b1NG, ratio: b1Ratio, output: b1Output },
    b2: { steam: b2Steam, ng: b2NG, ratio: b2Ratio, output: b2Output },
    b3: { steam: b3Steam, ng: b3NG, ratio: b3Ratio, output: b3Output }
  }
}

/**
 * Find the latest row with non-zero water data
 * Columns: G (B1), M (B2), S (B3)
 */
export function parseWaterSteamSheet(data: XLSX.WorkSheet): { b1Water: number; b2Water: number; b3Water: number } {
  const rows = XLSX.utils.sheet_to_json(data, { header: 1 }) as any[][]

  if (rows.length === 0) {
    throw new Error(`WATER_STEAM RATIO sheet is empty`)
  }

  // Find latest row with non-zero water data
  let targetRow = -1
  
  // Search from bottom to top for row with actual data
  for (let i = rows.length - 1; i >= 0; i--) {
    const row = rows[i]
    if (!row) continue
    
    // Check if any boiler has non-zero water (columns 6, 12, 18)
    const b1Water = parseFloat(String(row[6])) || 0
    const b2Water = parseFloat(String(row[12])) || 0
    const b3Water = parseFloat(String(row[18])) || 0
    
    if (b1Water > 0 || b2Water > 0 || b3Water > 0) {
      targetRow = i
      break
    }
  }

  if (targetRow === -1) {
    throw new Error(`No rows with non-zero water data found in WATER_STEAM RATIO sheet`)
  }

  const sumRow = rows[targetRow]

  // Extract water data (Columns G, M, S = indices 6, 12, 18)
  const b1Water = parseFloat(String(sumRow[6])) || 0
  const b2Water = parseFloat(String(sumRow[12])) || 0
  const b3Water = parseFloat(String(sumRow[18])) || 0

  return { b1Water, b2Water, b3Water }
}

/**
 * Fetch boiler data from OneDrive Excel files
 * Uses Microsoft Graph API to download and parse real data
 */
export async function fetchBoilerDataFromOneDrive(): Promise<ParsedBoilerData> {
  try {
    // Check if authenticated
    if (!graphApiService.isAuthenticated()) {
      throw new Error('Not authenticated with OneDrive. Please sign in first.')
    }

    // Get current month folder name (e.g., "01 JANUARY 2026")
    const now = new Date()
    const monthName = now.toLocaleString('en-US', { month: 'long' }).toUpperCase()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const monthFolderName = `${month} ${monthName} ${year}`

    console.log(`Fetching from OneDrive folder: ${monthFolderName}`)

    // Find the month folder
    const monthFolderId = await graphApiService.findFolder(monthFolderName)
    if (!monthFolderId) {
      throw new Error(`OneDrive folder "${monthFolderName}" not found`)
    }

    // Find Excel files
    const ngSteamFileId = await graphApiService.findFile(monthFolderId, 'NGSTEAM RATIO.xlsx')
    const waterSteamFileId = await graphApiService.findFile(monthFolderId, 'WATER_STEAM RATIO.xlsx')

    if (!ngSteamFileId || !waterSteamFileId) {
      throw new Error('Required Excel files not found in OneDrive folder')
    }

    console.log('Excel files found, downloading...')

    // Get download URLs and download files
    const ngSteamUrl = await graphApiService.getFileDownloadUrl(ngSteamFileId)
    const waterSteamUrl = await graphApiService.getFileDownloadUrl(waterSteamFileId)

    const ngSteamBuffer = await graphApiService.downloadFile(ngSteamUrl)
    const waterSteamBuffer = await graphApiService.downloadFile(waterSteamUrl)

    console.log('Excel files downloaded, parsing...')

    // Parse Excel files
    const ngWorkbook = XLSX.read(new Uint8Array(ngSteamBuffer), { type: 'array' })
    const ngSheet = ngWorkbook.Sheets['NGSTEAM RATIO']
    const ngData = parseNGSteamSheet(ngSheet)

    const waterWorkbook = XLSX.read(new Uint8Array(waterSteamBuffer), { type: 'array' })
    const waterSheet = waterWorkbook.Sheets['WATER_STEAM RATIO']
    const waterData = parseWaterSteamSheet(waterSheet)

    // Combine and return
    const result: ParsedBoilerData = {
      ...ngData,
      b1Water: waterData.b1Water,
      b2Water: waterData.b2Water,
      b3Water: waterData.b3Water,
      timestamp: new Date()
    }

    console.log('Data parsed successfully:', result)
    return result
  } catch (error) {
    console.error('Error fetching boiler data from OneDrive:', error)
    throw error
  }
}
