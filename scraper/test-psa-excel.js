const XLSX = require('xlsx')

const workbook = XLSX.readFile('psa-latest.xlsx')
console.log('Sheets:', workbook.SheetNames)

const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
const data = XLSX.utils.sheet_to_json(firstSheet, { header: 1 })

// Print first 20 rows
data.slice(0, 20).forEach((row, i) => {
  console.log(`Row ${i}:`, row)
})