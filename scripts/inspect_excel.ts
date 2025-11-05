import * as XLSX from "xlsx"
import path from "path"

const filePath = path.join(process.cwd(), "attach", "Book1_Budget11111.xlsx")
const workbook = XLSX.readFile(filePath)
const worksheet = workbook.Sheets[workbook.SheetNames[0]]
const rows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" })

console.log("Column names:")
console.log(Object.keys(rows[0]))
console.log("\nFirst 3 rows:")
rows.slice(0, 3).forEach((row, i) => {
  console.log(`\nRow ${i + 1}:`)
  console.log(JSON.stringify(row, null, 2))
})
