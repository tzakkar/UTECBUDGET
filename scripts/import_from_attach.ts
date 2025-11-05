import * as XLSX from "xlsx"
import path from "path"
import { prisma } from "@/lib/prisma"
import { mapTypeStringToEnum, mapSubTypeStringToEnum, mapClassStringToEnum } from "@/lib/validation"

function parseNumber(value: any): number | null {
  if (value === null || value === undefined || value === "") return null
  if (typeof value === "number") return value
  if (typeof value === "string") {
    const cleaned = value.replace(/[^0-9.-]/g, "")
    const parsed = parseFloat(cleaned)
    return isNaN(parsed) ? null : parsed
  }
  return null
}

async function importFromExcel() {
  try {
    const filePath = path.join(process.cwd(), "attach", "Book1_Budget11111.xlsx")
    console.log(`📂 Reading file: ${filePath}`)

    const workbook = XLSX.readFile(filePath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const rows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" })

    console.log(`📊 Found ${rows.length} rows in sheet "${sheetName}"`)

    let created = 0
    let skipped = 0

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      
      // Skip empty rows
      const itemName = row.Item ? row.Item.toString().trim() : ""
      if (!itemName) {
        skipped++
        continue
      }

      try {
        const type = mapTypeStringToEnum(row.Type)
        const subType = mapSubTypeStringToEnum(row["Sub  Type"]) // Note: 2 spaces in column name
        const workClass = mapClassStringToEnum(row.Class)
        const category = row["Category "] ? row["Category "].toString().trim() : null // Note: space after
        const brand = row.Brand ? row.Brand.toString().trim() : null
        const justification = row.Justification ? row.Justification.toString().trim() : null

        // Parse numeric values - use the actual column names with spaces
        const quantity = parseNumber(row["#"]) || 1
        const capex = parseNumber(row[" Capex 25 "]) || 0 // Note: spaces around
        const opex = parseNumber(row[" Opex 25 "]) || 0   // Note: spaces around
        
        const budget = (capex + opex) || null

        console.log(`Row ${i + 2}: ${itemName} - Capex: ${capex}, Opex: ${opex}, Budget: ${budget}`)

        await prisma.budgetItem.create({
          data: {
            type,
            subType,
            workClass,
            category,
            itemName,
            model: brand,
            notes: justification,
            quantity: Math.max(1, Math.floor(quantity)),
            spent: 0,
            capex: Math.max(0, capex),
            opex: Math.max(0, opex),
            budget: budget && budget > 0 ? budget : null,
            status: "NOT_STARTED",
            year: 2025,
          },
        })

        created++
        if (created % 20 === 0) {
          console.log(`  ✅ ${created} items created...`)
        }
      } catch (rowError: any) {
        console.warn(`⚠️  Row ${i + 2} failed:`, rowError.message)
        skipped++
      }
    }

    console.log(`\n✨ Import Complete!`)
    console.log(`✅ Created: ${created}`)
    console.log(`⏭️  Skipped: ${skipped}`)
  } catch (error: any) {
    console.error("❌ Import failed:", error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

importFromExcel()


