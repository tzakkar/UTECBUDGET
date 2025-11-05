import * as XLSX from "xlsx"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

interface ExcelRow {
  [key: string]: any
}

// Helper function to parse numbers safely
function parseNumber(value: any): number | null {
  if (!value) return null
  const num = Number(value)
  return isNaN(num) ? null : num
}

// Helper function to parse the SubType column
function parseSubType(value: string): string {
  if (!value) return "BAU"
  // Extract the part after the space, e.g., "00 BAU" -> "BAU"
  const parts = value.trim().split(" ")
  const subType = parts[parts.length - 1].toUpperCase()
  
  const validSubTypes = ["BAU", "NEOBAU", "SAP", "MES", "SUSTAINABILITY", "AI"]
  return validSubTypes.includes(subType) ? subType : "BAU"
}

// Helper function to parse Class to WorkClass
function parseWorkClass(value: string): string {
  if (!value) return "SUBSCRIPTION"
  const cleanValue = value.trim().toUpperCase()
  
  const classMap: { [key: string]: string } = {
    "SUBSCRIPTION": "SUBSCRIPTION",
    "HARDWARE": "HARDWARE",
    "IMPLEMENTATION": "IMPLEMENTATION",
    "MAINTENANCE": "MAINTENANCE",
    "MANPOWER": "MANPOWER",
    "SAP_SUPPORT": "SAP_SUPPORT",
  }
  
  // Try exact match first
  if (classMap[cleanValue]) return classMap[cleanValue]
  
  // Try partial matches
  for (const [key, val] of Object.entries(classMap)) {
    if (cleanValue.includes(key) || key.includes(cleanValue)) {
      return val
    }
  }
  
  // Default mapping based on content
  if (cleanValue.includes("HARDWARE")) return "HARDWARE"
  if (cleanValue.includes("IMPLEMENT")) return "IMPLEMENTATION"
  if (cleanValue.includes("MAINTAIN")) return "MAINTENANCE"
  if (cleanValue.includes("SUPPORT")) return "SAP_SUPPORT"
  if (cleanValue.includes("MANPOWER") || cleanValue.includes("STAFF")) return "MANPOWER"
  
  return "SUBSCRIPTION"
}

async function importExcel() {
  try {
    console.log("Starting Excel import...")

    // Read the Excel file
    const workbook = XLSX.readFile(
      "C:\\Users\\tammam.zakkar\\Dev_Projects\\UTECBUDGET\\attach\\Book1_Budget11111.xlsx"
    )
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json(sheet) as ExcelRow[]

    console.log(`Found ${rows.length} rows to import`)

    let successCount = 0
    let errorCount = 0

    // Process each row
    for (let i = 0; i < rows.length; i++) {
      try {
        const row = rows[i]

        // Skip empty rows
        if (!row["Item"] || row["Item"].toString().trim() === "") {
          continue
        }

        // Parse and clean field values
        const type = row["Type"]?.toString().toUpperCase().trim() || "BAU"
        const subType = parseSubType(row["Sub  Type"])
        const category = row["Category "]?.toString().trim() || ""
        const workClass = parseWorkClass(row["Class"])
        const itemName = row["Item"]?.toString().trim() || ""
        const brand = row["Brand"]?.toString().trim() || ""
        const justification = row["Justification"]?.toString().trim() || ""
        
        // Budget amounts - use 2025 data (year 2025)
        const capex = parseNumber(row[" Capex 25 "]) || 0
        const opex = parseNumber(row[" Opex 25 "]) || 0
        const budget = capex + opex

        // Year is 2025
        const year = 2025

        console.log(
          `[${i + 1}/${rows.length}] Importing: ${itemName} (Capex: ${capex}, Opex: ${opex})`
        )

        // Create the budget item
        const budgetItem = await prisma.budgetItem.create({
          data: {
            year,
            type: type === "BAU" ? "BAU" : type === "NEOBAU" ? "NEOBAU" : "REV",
            subType,
            workClass,
            category,
            itemName,
            model: brand,
            capex: capex > 0 ? capex : null,
            opex: opex > 0 ? opex : null,
            budget: budget > 0 ? budget : null,
            spent: 0,
            committed: 0,
            status: "NOT_STARTED",
            percentComplete: 0,
            notes: justification || null,
            extendedFields: {
              brand,
              originalCategory: category,
            },
          },
        })

        successCount++
      } catch (error) {
        errorCount++
        console.error(`Error importing row ${i + 1}:`, error)
      }
    }

    console.log(`\n✅ Import complete!`)
    console.log(`✓ Successfully imported: ${successCount} items`)
    console.log(`✗ Failed: ${errorCount} items`)

    // Verify the import
    const totalItems = await prisma.budgetItem.count()
    const totalBudget = await prisma.budgetItem.aggregate({
      _sum: {
        budget: true,
      },
    })

    console.log(`\n📊 Database Summary:`)
    console.log(`   Total items: ${totalItems}`)
    console.log(`   Total budget: $${totalBudget._sum.budget || 0}`)
  } catch (error) {
    console.error("Fatal error:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

importExcel()
