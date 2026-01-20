// OneDrive Configuration
// This file contains the OneDrive folder link and setup for data fetching

export const ONEDRIVE_CONFIG = {
  // Root folder containing monthly data folders
  folderUrl: 'https://1drv.ms/f/c/B6A282DAF4E2A35F/IgDut87lcIP0QYgkXmaSdS71AZDxNKdtobdFZwBNOu4j9uU?e=VNxzpv',

  // Month folders are structured as: "01 JANUARY 2026", "02 FEBRUARY 2026", etc.
  monthFolders: [
    '01 JANUARY 2026',
    '02 FEBRUARY 2026',
    '03 MARCH 2026',
    '04 APRIL 2026',
    '05 MAY 2026',
    '06 JUNE 2026',
    '07 JULY 2026',
    '08 AUGUST 2026',
    '09 SEPTEMBER 2026',
    '10 OCTOBER 2026',
    '11 NOVEMBER 2026',
    '12 DECEMBER 2026'
  ],

  // Expected Excel file names within each month folder
  excelFilePatterns: [
    'NGSTEAM RATIO',
    'Boiler Data',
    'Operations Data'
  ],

  // Refresh interval in milliseconds (1 hour)
  refreshInterval: 3600000, // 1 hour

  // Enable debug logging
  debug: true
}

// Get current month folder name
export const getCurrentMonthFolderName = (): string => {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(now).toUpperCase()
  const year = now.getFullYear()
  return `${month} ${monthName} ${year}`
}

// Get all month folder names
export const getAllMonthFolders = (): string[] => {
  return ONEDRIVE_CONFIG.monthFolders
}

export default ONEDRIVE_CONFIG
