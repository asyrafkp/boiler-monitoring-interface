import XLSX from 'xlsx';

const wb = XLSX.readFile('data/boiler_data.xlsx');
const reportSheet = wb.Sheets['REPORT B3'];

console.log('=== Detailed Cell F29 Analysis ===\n');
const f29 = reportSheet['F29'];

console.log('All properties of cell F29:');
console.log(JSON.stringify(f29, null, 2));

console.log('\n=== Checking if there are number format issues ===');
console.log('Cell value:', f29?.v);
console.log('Cell formula:', f29?.f);
console.log('Cell formatted text:', f29?.w);

// Check if there's a custom number format that could display differently
if (f29?.z) {
  console.log('Number format code:', f29.z);
}

console.log('\n=== What you should see in Excel ===');
console.log('If the formula is:', f29?.f);
console.log('And the calculated value is:', f29?.v);
console.log('Then Excel should display:', f29?.v);

console.log('\n=== INSTRUCTION ===');
console.log('Please do the following:');
console.log('1. Open data/boiler_data.xlsx');
console.log('2. Go to REPORT B3 sheet');
console.log('3. Click on cell F29 (Natural Gas for 1/21/2026)');
console.log('4. Look at the formula bar at the top - what formula do you see?');
console.log('5. What value is displayed in the cell itself?');
console.log('6. Press Ctrl+` (grave accent) to toggle formula view - what does F29 show?');
