import XLSX from 'xlsx';

const wb = XLSX.readFile('data/boiler_data.xlsx');
const sheet = wb.Sheets['REPORT B3'];

// Read with raw values
const dataRaw = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true });

console.log('Looking for 1/21/2026 (serial 46043):\n');

for (let i = 0; i < dataRaw.length; i++) {
  if (dataRaw[i][0] === 46043) {
    console.log(`Found at row ${i + 1} (0-indexed: ${i}):`);
    console.log('Date serial:', dataRaw[i][0], '(should be 1/21/2026)');
    console.log('Steam:', dataRaw[i][1], 'MT');
    console.log('Water:', dataRaw[i][2], 'MT');
    console.log('Water/Tonne:', dataRaw[i][3]);
    console.log('Natural Gas (RAW):', dataRaw[i][4], 'SM³');
    console.log('NG/Tonne:', dataRaw[i][5]);
    console.log('Electric:', dataRaw[i][6], 'MWh');
    console.log('Waste Gas:', dataRaw[i][7], 'Nm³');
    
    // Check cell F (column 5, 0-indexed column 4) for Natural Gas
    const ngCellAddress = XLSX.utils.encode_cell({r: i, c: 4});
    const ngCell = sheet[ngCellAddress];
    console.log('\nNatural Gas cell', ngCellAddress, ':');
    console.log('  Type:', ngCell?.t);
    console.log('  Value:', ngCell?.v);
    console.log('  Formula:', ngCell?.f);
    console.log('  Formatted:', ngCell?.w);
    break;
  }
}
