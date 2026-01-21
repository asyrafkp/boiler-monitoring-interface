import XLSX from 'xlsx';

const wb = XLSX.readFile('data/boiler_data.xlsx');
const sheet = wb.Sheets['DATA B3'];

console.log('Natural Gas calculation for 1/21/2026:');
console.log('Formula: H557 = H556 - H532\n');

const h532 = sheet['H532'];
const h556 = sheet['H556'];
const h557 = sheet['H557'];

console.log('H532 (start reading):');
console.log('  Value:', h532?.v);
console.log('  Formula:', h532?.f);

console.log('\nH556 (end reading):');
console.log('  Value:', h556?.v);
console.log('  Formula:', h556?.f);

console.log('\nH557 (calculated daily usage = H556 - H532):');
console.log('  Value:', h557?.v);
console.log('  Calculated:', (h556?.v || 0) - (h532?.v || 0));

console.log('\n\n=== ANALYSIS ===');
console.log('If the correct value should be 1857 SM³, then:');
console.log('  Option 1: H532 (start) is wrong');
console.log('  Option 2: H556 (end) is wrong');
console.log('  Option 3: The formula or data entry needs correction');
console.log('\nPlease check your Excel file and correct H532 or H556 in DATA B3 sheet.');
