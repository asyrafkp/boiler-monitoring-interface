const XLSX = require('xlsx');
const wb = XLSX.readFile('data/boiler_data.xlsx');
const ws = wb.Sheets['NGSTEAM RATIO'];
const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

console.log('Total rows:', data.length);
console.log('\nLast 10 rows:');
for (let i = data.length - 1; i >= Math.max(0, data.length - 10); i--) {
  const r = data[i];
  if (!r) {
    console.log(`Row ${i}: null/undefined`);
    continue;
  }
  console.log(`Row ${i}: col10=${r[10]}, col11=${r[11]}, col12=${r[12]}, length=${r.length}`);
}

console.log('\nSearching for B3 steam = 10:');
for (let i = data.length - 1; i >= 0; i--) {
  const r = data[i];
  if (r && r[10] === 10) {
    console.log(`FOUND at row ${i}: col10=${r[10]}, col11=${r[11]}, col12=${r[12]}`);
    break;
  }
}
