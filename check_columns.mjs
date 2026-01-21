import XLSX from 'xlsx';

const wb = XLSX.readFile('data/boiler_data.xlsx');
const sheet = wb.Sheets['REPORT B3'];

console.log('Checking REPORT B3 header row:\n');
const headers = XLSX.utils.sheet_to_json(sheet, { header: 1 })[1]; // Row 2 has headers
headers.forEach((header, idx) => {
  console.log(`Column ${idx} (${String.fromCharCode(65 + idx)}):`, header);
});

console.log('\n\nNow checking row 29 (1/21/2026) with correct column mapping:\n');
const dataRaw = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true });
const row = dataRaw[28]; // Row 29, 0-indexed 28

console.log('Full row 29:', row);

// Check each cell individually
for (let col = 0; col <= 7; col++) {
  const cellAddress = XLSX.utils.encode_cell({r: 28, c: col});
  const cell = sheet[cellAddress];
  console.log(`\nColumn ${String.fromCharCode(65 + col)} (${cellAddress}):`, cell?.v);
  if (cell?.f) console.log('  Formula:', cell.f);
}
