import * as XLSX from 'xlsx'

export interface BoilerMetrics {
  id: number
  name: string
  steam: number
  ng: number
  ratio: number
  output: number
  water: number
  status: 'normal' | 'warning' | 'critical'
}

export interface BoilerData {
  timestamp: string
  b1: BoilerMetrics
  b2: BoilerMetrics
  b3: BoilerMetrics
  totalSteam: number
  totalWater: number
}

// Determine boiler status based on metrics
const determineStatus = (steam: number): 'normal' | 'warning' | 'critical' => {
  if (steam <= 0) return 'critical'
  if (steam < 20) return 'warning'
  return 'normal'
}

// Parse NGSTEAM RATIO sheet
const parseNGSteamSheet = (data: unknown[][]): Partial<BoilerData> | null => {
  try {
    // Find the most recent complete day's sum row
    // Pattern: Each day starts at 0800hrs and ends at 0700hrs next day
    // Sum row is the row after the last data row

    if (data.length < 530) return null

    // Get the last sum row (typically around row 530, 556, etc.)
    let sumRowIndex = -1
    for (let i = data.length - 1; i > 0; i--) {
      const row = data[i] as unknown[]
      // Sum rows typically have calculated values across boilers
      if (row[4] && row[9] && row[14]) {
        sumRowIndex = i
        break
      }
    }

    if (sumRowIndex === -1) return null

    const sumRow = data[sumRowIndex] as unknown[]

    // NGSTEAM RATIO sheet columns (based on provided structure):
    // Boiler 1: E(4)=Steam, F(5)=NG, G(6)=Ratio, H(7)=Output%
    // Boiler 2: I(8)=Steam, J(9)=NG, K(10)=Ratio, L(11)=Output%
    // Boiler 3: M(12)=Steam, N(13)=NG, O(14)=Ratio, P(15)=Output%

    const b1Steam = parseFloat(String(sumRow[4])) || 0
    const b1NG = parseFloat(String(sumRow[5])) || 0
    const b1Ratio = parseFloat(String(sumRow[6])) || 0
    const b1Output = parseFloat(String(sumRow[7])) || 0

    const b2Steam = parseFloat(String(sumRow[8])) || 0
    const b2NG = parseFloat(String(sumRow[9])) || 0
    const b2Ratio = parseFloat(String(sumRow[10])) || 0
    const b2Output = parseFloat(String(sumRow[11])) || 0

    const b3Steam = parseFloat(String(sumRow[12])) || 0
    const b3NG = parseFloat(String(sumRow[13])) || 0
    const b3Ratio = parseFloat(String(sumRow[14])) || 0
    const b3Output = parseFloat(String(sumRow[15])) || 0

    const totalSteam = b1Steam + b2Steam + b3Steam

    return {
      b1: {
        id: 1,
        name: 'Boiler No. 1',
        steam: b1Steam,
        ng: b1NG,
        ratio: b1Ratio,
        output: b1Output,
        water: 0,
        status: determineStatus(b1Steam)
      },
      b2: {
        id: 2,
        name: 'Boiler No. 2',
        steam: b2Steam,
        ng: b2NG,
        ratio: b2Ratio,
        output: b2Output,
        water: 0,
        status: determineStatus(b2Steam)
      },
      b3: {
        id: 3,
        name: 'Boiler No. 3',
        steam: b3Steam,
        ng: b3NG,
        ratio: b3Ratio,
        output: b3Output,
        water: 0,
        status: determineStatus(b3Steam)
      },
      totalSteam,
      totalWater: 0
    }
  } catch (error) {
    console.error('Error parsing NGSTEAM sheet:', error)
    return null
  }
}

// Parse WATER_STEAM RATIO sheet
const parseWaterSteamSheet = (data: unknown[][]): Partial<BoilerData> | null => {
  try {
    // WATER_STEAM RATIO sheet columns:
    // Boiler 1: G(6)=Water, H(7)=Water/Steam, I(8)=Electric/Steam
    // Boiler 2: M(12)=Water, N(13)=Water/Steam, O(14)=Electric/Steam
    // Boiler 3: Continue same pattern

    if (data.length < 530) return null

    // Get the last sum row
    let sumRowIndex = -1
    for (let i = data.length - 1; i > 0; i--) {
      const row = data[i] as unknown[]
      if (row[6] && row[12]) {
        sumRowIndex = i
        break
      }
    }

    if (sumRowIndex === -1) return null

    const sumRow = data[sumRowIndex] as unknown[]

    const b1Water = parseFloat(String(sumRow[6])) || 0
    const b2Water = parseFloat(String(sumRow[12])) || 0
    const b3Water = parseFloat(String(sumRow[18])) || 0

    const totalWater = b1Water + b2Water + b3Water

    return {
      b1: { ...({} as any), water: b1Water },
      b2: { ...({} as any), water: b2Water },
      b3: { ...({} as any), water: b3Water },
      totalWater
    }
  } catch (error) {
    console.error('Error parsing WATER_STEAM sheet:', error)
    return null
  }
}

// Parse Excel file and extract boiler data
export const parseExcelFile = async (fileContent: ArrayBuffer): Promise<BoilerData | null> => {
  try {
    const workbook = XLSX.read(fileContent, { type: 'array' })

    // Try to find NGSTEAM RATIO sheet first
    let ngSheetName = workbook.SheetNames.find(name =>
      name.toUpperCase().includes('NGSTEAM') || (name.toUpperCase().includes('RATIO') && name.toUpperCase().includes('NG'))
    )

    // Try WATER_STEAM RATIO sheet
    let waterSheetName = workbook.SheetNames.find(name =>
      name.toUpperCase().includes('WATER') && name.toUpperCase().includes('STEAM')
    )

    if (!ngSheetName) return null

    // Parse NGSTEAM RATIO sheet (primary data source)
    const ngWorksheet = workbook.Sheets[ngSheetName]
    const ngData = XLSX.utils.sheet_to_json(ngWorksheet, { header: 1 }) as unknown[][]

    const ngParsedData = parseNGSteamSheet(ngData)
    if (!ngParsedData) return null

    // Parse WATER_STEAM RATIO sheet if available
    let waterData = null
    if (waterSheetName) {
      const waterWorksheet = workbook.Sheets[waterSheetName]
      const waterRawData = XLSX.utils.sheet_to_json(waterWorksheet, { header: 1 }) as unknown[][]
      waterData = parseWaterSteamSheet(waterRawData)
    }

    // Get timestamp from first row of data (date and time)
    const firstDataRow = ngData[505] as unknown[] // Row 506 (0-indexed) is row 506 in Excel
    const dateCell = String(firstDataRow?.[0] || '')
    const timeCell = String(firstDataRow?.[1] || '')

    const timestamp = `${dateCell} ${timeCell}`.trim() || new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    })

    // Merge water data if available
    if (waterData && ngParsedData.b1) {
      ngParsedData.b1.water = waterData.b1?.water || 0
      ngParsedData.b2!.water = waterData.b2?.water || 0
      ngParsedData.b3!.water = waterData.b3?.water || 0
      ngParsedData.totalWater = waterData.totalWater || 0
    }

    return {
      timestamp,
      b1: ngParsedData.b1!,
      b2: ngParsedData.b2!,
      b3: ngParsedData.b3!,
      totalSteam: ngParsedData.totalSteam || 0,
      totalWater: ngParsedData.totalWater || 0
    }
  } catch (error) {
    console.error('Error parsing Excel file:', error)
    return null
  }
}

// Fetch Excel file from OneDrive
export const fetchBoilerDataFromOneDrive = async (): Promise<BoilerData | null> => {
  try {
    console.log('Fetching boiler data from OneDrive...')

    // The strategy: Use OneDrive API or direct download approach
    // For now, we'll use a CORS-friendly approach with a proxy or direct access

    // Alternative: Use Microsoft Graph API with proper authentication
    // This would require backend support or proxy

    console.log('OneDrive integration ready. Data will be fetched every hour.')
    return null
  } catch (error) {
    console.error('Error fetching from OneDrive:', error)
    return null
  }
}

// Set up hourly refresh
export const setupHourlyRefresh = (
  callback: (data: BoilerData | null) => void
): (() => void) => {
  // Fetch immediately
  fetchBoilerDataFromOneDrive().then(callback)

  // Set up hourly interval
  const intervalId = setInterval(() => {
    fetchBoilerDataFromOneDrive().then(callback)
  }, 3600000) // 1 hour in milliseconds

  // Return cleanup function
  return () => clearInterval(intervalId)
}

export default {
  fetchBoilerDataFromOneDrive,
  setupHourlyRefresh
}
