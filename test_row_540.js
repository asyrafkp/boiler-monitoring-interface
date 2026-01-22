import XLSX from 'xlsx';

const wb = XLSX.readFile('data/boiler_data.xlsx');
const ws = wb.Sheets['NGSTEAM RATIO'];
const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

console.log('=== All B3 data rows (non-zero B3 Steam) rows 500-580 ===\n');

for (let i = 500; i <= 580; i++) {
  const row = data[i];
  if (!row || row.length < 14) continue;
  
  const b3Steam = parseFloat(row[11]) || 0;
  const b3NG = parseFloat(row[12]) || 0;
  const b3Ratio = parseFloat(row[13]) || 0;
  
  if (b3Steam > 0) {
    console.log(`Row ${i}: Steam=${b3Steam}, NG=${b3NG}, Ratio=${b3Ratio}`);
  }
}

// Also check the parser logic - which row would it select?
console.log('\n=== Parser Logic (search from 540 backwards, find first valid row) ===');
const maxRow = Math.min(data.length - 1, 540);
console.log(`Starting search from row ${maxRow} downwards...\n`);

for (let i = maxRow; i >= 9; i--) {
  const row = data[i];
  if (!row) continue;
  
  const b1Steam = parseFloat(row[3]) || 0;
  const b2Steam = parseFloat(row[7]) || 0;
  const b3Steam = parseFloat(row[11]) || 0;
  
  if (b1Steam > 0 || b2Steam > 0 || b3Steam > 0) {
    console.log(`PARSER WOULD SELECT Row ${i}`);
    console.log(`  B1: Steam=${b1Steam}, NG=${parseFloat(row[4]) || 0}, Ratio=${parseFloat(row[5]) || 0}`);
    console.log(`  B2: Steam=${b2Steam}, NG=${parseFloat(row[8]) || 0}, Ratio=${parseFloat(row[9]) || 0}`);
    console.log(`  B3: Steam=${b3Steam}, NG=${parseFloat(row[12]) || 0}, Ratio=${parseFloat(row[13]) || 0}`);
    break;
  }
}
