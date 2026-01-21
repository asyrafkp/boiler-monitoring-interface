import XLSX from 'xlsx';

const wb = XLSX.readFile('data/boiler_data.xlsx');
const sheet = wb.Sheets['REPORT B3'];

// Convert sheet to JSON to find the row
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

console.log('Looking for 1/21/2026 in REPORT B3...\n');

for (let i = 0; i < data.length; i++) {
  const row = data[i];
  if (row[0] && String(row[0]).includes('1/21/2026')) {
    console.log('Found at row', i + 1, ':');
    console.log('Headers (row 2):', data[1]);
    console.log('Data row:', row);
    console.log('\nParsed:');
    console.log('Date:', row[0]);
    console.log('Steam Production:', row[1]);
    console.log('Feed Water:', row[2]);
    console.log('Water/Tonne Steam:', row[3]);
    console.log('Natural Gas:', row[4]);
    console.log('NG/Tonne Steam:', row[5]);
    console.log('Electrical Usage:', row[6]);
    console.log('Waste Gas:', row[7]);
    break;
  }
}
