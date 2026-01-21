import XLSX from 'xlsx';

const wb = XLSX.readFile('data/boiler_data.xlsx');

// Check what the Excel file actually displays vs formulas
console.log('=== Checking REPORT B3 Natural Gas cell (F29) ===\n');
const reportSheet = wb.Sheets['REPORT B3'];
const f29 = reportSheet['F29'];

console.log('Cell F29:');
console.log('  Raw value (v):', f29?.v);
console.log('  Formula (f):', f29?.f);
console.log('  Formatted text (w):', f29?.w);
console.log('  Cell type (t):', f29?.t);

// Now check the DATA B3 sheet H557
console.log('\n=== Checking DATA B3 source cell (H557) ===\n');
const dataSheet = wb.Sheets['DATA B3'];
const h557 = dataSheet['H557'];

console.log('Cell H557:');
console.log('  Raw value (v):', h557?.v);
console.log('  Formula (f):', h557?.f);
console.log('  Formatted text (w):', h557?.w);
console.log('  Cell type (t):', h557?.t);

// Check what H556 and H532 contain (the formula components)
console.log('\n=== Formula components (H557 = H556 - H532) ===\n');
const h532 = dataSheet['H532'];
const h556 = dataSheet['H556'];

console.log('H532 (start reading):');
console.log('  Value:', h532?.v);
console.log('  Formatted:', h532?.w);

console.log('\nH556 (end reading):');
console.log('  Value:', h556?.v);
console.log('  Formatted:', h556?.w);

console.log('\nCalculation: H556 - H532 =', (h556?.v || 0), '-', (h532?.v || 0), '=', (h556?.v || 0) - (h532?.v || 0));

// Search for 1857 in both sheets
console.log('\n=== Searching for 1857 value ===\n');
['REPORT B3', 'DATA B3'].forEach(sheetName => {
  const sheet = wb.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true });
  
  data.forEach((row, rowIdx) => {
    row.forEach((val, colIdx) => {
      if (val === 1857 || (typeof val === 'number' && Math.abs(val - 1857) < 0.01)) {
        const addr = XLSX.utils.encode_cell({r: rowIdx, c: colIdx});
        console.log(`Found ${val} in ${sheetName} at ${addr} (row ${rowIdx + 1})`);
      }
    });
  });
});
