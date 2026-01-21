import fs from 'fs';

['boiler_1_daily.json', 'boiler_2_daily.json', 'boiler_3_daily.json'].forEach((file, idx) => {
  const data = JSON.parse(fs.readFileSync('public/' + file));
  const validEntries = data.dailyData.filter(e => e.date !== 'TOTAL' && e.steam > 0);
  const latest = validEntries[validEntries.length - 1];
  
  console.log(`\nBoiler ${idx + 1} - Latest operational date:`);
  console.log('  Date:', latest.date);
  console.log('  Steam:', latest.steam, 'MT');
  console.log('  Natural Gas:', latest.naturalGas, 'SM³');
  console.log('  Electric:', latest.electric.toFixed(2), 'MWh');
});

console.log('\n--- SUMMARY ---');
console.log('Boiler 3 has INVALID Natural Gas data (-749,683 SM³) in Excel file for 1/21/2026');
console.log('This needs to be corrected in the source Excel file: data/boiler_data.xlsx REPORT B3');
