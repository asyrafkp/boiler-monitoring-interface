import XLSX from 'xlsx';

const wb = XLSX.readFile('data/boiler_data.xlsx');
const sheet = wb.Sheets['DATA B3'];

console.log('DATA B3 cell H557 (Natural Gas source for 1/21/2026):\n');
const cell = sheet['H557'];
console.log('  Value:', cell?.v);
console.log('  Type:', cell?.t);
console.log('  Formula:', cell?.f);
console.log('  Formatted:', cell?.w);

console.log('\nChecking full row 557 in DATA B3:');
const row557cells = ['A557', 'B557', 'C557', 'D557', 'E557', 'F557', 'G557', 'H557', 'I557', 'J557'];
row557cells.forEach(addr => {
  const c = sheet[addr];
  if (c) {
    console.log(`  ${addr}:`, c.v, c.f ? `(formula: ${c.f})` : '');
  } else {
    console.log(`  ${addr}: empty`);
  }
});

console.log('\n\nUser says the correct value should be 1857 SM³.');
console.log('Current value in H557:', cell?.v);
console.log('This cell needs to be corrected in the Excel file.');
