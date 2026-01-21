import XLSX from 'xlsx';

const wb = XLSX.readFile('data/boiler_data.xlsx');
const sheet = wb.Sheets['REPORT B3'];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

console.log('Last 15 rows in REPORT B3:\n');
const lastRows = data.slice(-15);
lastRows.forEach((row, idx) => {
  console.log(`Row ${data.length - 15 + idx}:`, row.slice(0, 8));
});
