import XLSX from 'xlsx';

const wb = XLSX.readFile('data/boiler_data.xlsx');
const sheet = wb.Sheets['REPORT B3'];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, dateNF: 'M/D/YYYY' });

console.log('Last 10 data rows in REPORT B3 (with dates converted):\n');
const dataRows = data.filter(row => row[0] && row[0] !== 'Date' && !String(row[0]).includes('REPORT')).slice(-10);

dataRows.forEach((row, idx) => {
  console.log(`\nRow ${idx + 1}:`);
  console.log('  Date:', row[0]);
  console.log('  Steam:', row[1], 'MT');
  console.log('  Water:', row[2], 'MT');
  console.log('  Natural Gas:', row[4], 'SM³');
  console.log('  Electric:', row[6], 'MWh');
});
