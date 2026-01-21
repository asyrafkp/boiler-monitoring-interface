import XLSX from 'xlsx';

const wb = XLSX.readFile('data/boiler_data.xlsx');
const sheet = wb.Sheets['REPORT B3'];

// Read with raw values
const dataRaw = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true });

console.log('Checking row 28 (1/21/2026) in REPORT B3 with RAW values:\n');
const row28 = dataRaw[27]; // 0-indexed, so row 28 is index 27

console.log('Date serial:', row28[0]);
console.log('Steam:', row28[1]);
console.log('Water:', row28[2]);
console.log('Water/Tonne:', row28[3]);
console.log('Natural Gas (RAW):', row28[4]);
console.log('NG/Tonne:', row28[5]);
console.log('Electric:', row28[6]);
console.log('Waste Gas:', row28[7]);

// Check if it's a formula
const cellAddress = XLSX.utils.encode_cell({r: 27, c: 4}); // Row 28, Column E (Natural Gas)
const cell = sheet[cellAddress];
console.log('\nCell', cellAddress, 'details:');
console.log('  Type:', cell.t);
console.log('  Value:', cell.v);
console.log('  Formula:', cell.f);
console.log('  Formatted:', cell.w);
