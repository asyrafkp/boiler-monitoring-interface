import XLSX from 'xlsx';

const wb = XLSX.readFile('data/boiler_data.xlsx');
const sheet = wb.Sheets['REPORT B3'];

console.log('=== Searching REPORT B3 sheet ===\n');

console.log('1. Looking for cells with value 1857:');
const data = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true });
let found1857 = false;
data.forEach((row, rowIdx) => {
  row.forEach((val, colIdx) => {
    if (val === 1857 || (typeof val === 'number' && Math.abs(val - 1857) < 0.01)) {
      const addr = XLSX.utils.encode_cell({r: rowIdx, c: colIdx});
      const cell = sheet[addr];
      console.log(`  Found ${val} at ${addr} (Row ${rowIdx + 1})`);
      console.log(`    Formula: ${cell?.f || 'none'}`);
      found1857 = true;
    }
  });
});
if (!found1857) {
  console.log('  No cells found with value 1857');
}

console.log('\n2. Looking for cells with formula referencing DATA B3!H557:');
let foundFormula = false;
const range = XLSX.utils.decode_range(sheet['!ref']);
for (let R = range.s.r; R <= range.e.r; R++) {
  for (let C = range.s.c; C <= range.e.c; C++) {
    const addr = XLSX.utils.encode_cell({r: R, c: C});
    const cell = sheet[addr];
    if (cell?.f && (cell.f.includes('DATA B3') || cell.f.includes('DATA B3!'))) {
      console.log(`  ${addr}: ${cell.f} = ${cell.v}`);
      foundFormula = true;
    }
  }
}
if (!foundFormula) {
  console.log('  No cells found with formula referencing DATA B3');
}

console.log('\n3. Specifically checking F29 again:');
const f29 = sheet['F29'];
console.log(`  F29 formula: ${f29?.f}`);
console.log(`  F29 value: ${f29?.v}`);
console.log(`  F29 formatted: ${f29?.w}`);
