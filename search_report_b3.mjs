import XLSX from 'xlsx';

const wb = XLSX.readFile('data/boiler_data.xlsx');
const sheet = wb.Sheets['REPORT B3'];

console.log('Checking full row 29 (1/21/2026) in REPORT B3:\n');

const dataRaw = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true });
const headers = dataRaw[1]; // Row 2 has headers
const row29 = dataRaw[28]; // Row 29, 0-indexed 28

console.log('All columns in row 29:');
for (let col = 0; col < row29.length; col++) {
  const cellAddress = XLSX.utils.encode_cell({r: 28, c: col});
  const header = headers[col] || `Col${col}`;
  const cell = sheet[cellAddress];
  
  console.log(`\n${String.fromCharCode(65 + col)}${29} - ${header}:`);
  console.log('  Value:', cell?.v);
  if (cell?.f) console.log('  Formula:', cell.f);
}

console.log('\n\n=== Looking for 1857 in REPORT B3 ===');
// Search for 1857 in the entire REPORT B3 sheet
const allData = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true });
allData.forEach((row, idx) => {
  row.forEach((val, colIdx) => {
    if (val === 1857 || Math.abs(val - 1857) < 0.1) {
      console.log(`Found ${val} at row ${idx + 1}, column ${String.fromCharCode(65 + colIdx)}`);
    }
  });
});
