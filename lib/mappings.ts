// Column mapping utilities for Excel import

export interface ColumnMapping {
  [excelColumn: string]: string // Maps Excel column name to Prisma field
}

export const DEFAULT_COLUMN_MAPPINGS: ColumnMapping = {
  // Identity fields
  "Item": "itemName",
  "Sub-Item": "subItem",
  "Project": "projectId",
  "Program": "programId",
  "Category": "category",
  "Sub-Category": "subCategory",
  "Model": "model",
  
  // Finance
  "Capex": "capex",
  "Opex": "opex",
  "Budget": "budget",
  "Committed": "committed",
  "Spent": "spent",
  "Remaining": "remaining",
  "Unit Cost": "unitCost",
  "Quantity": "quantity",
  "Total": "total",
  "Cost Center": "costCenterId",
  "GL": "glId",
  "Purchase cost": "capex",
  "Purchase year": "year",
  
  // Time & Plan
  "Year": "year",
  "Quarter": "quarter",
  
  // Status & Tracking
  "Status": "status",
  "Condition": "condition",
  "% Complete": "percentComplete",
  "Notes": "notes",
  "Owner": "ownerId",
  "Department": "departmentId",
  
  // Logistics
  "Location": "locationId",
  "Vendor": "vendorId",
  // Type
  "Type": "type",
  "Subtype": "subType",
  "Sub-Type": "subType",
  "Class": "workClass",
}

export function inferColumnMapping(excelHeaders: string[]): ColumnMapping {
  const mapping: ColumnMapping = {}
  
  for (const rawHeader of excelHeaders) {
    if (rawHeader === null || rawHeader === undefined) {
      continue
    }
    const header = String(rawHeader)
    const normalized = header.trim()
    if (!normalized) continue
    // Try exact match first
    if (DEFAULT_COLUMN_MAPPINGS[normalized]) {
      mapping[normalized] = DEFAULT_COLUMN_MAPPINGS[normalized]
      continue
    }
    
    // Try case-insensitive match
    const lowerNormalized = normalized.toLowerCase()
    for (const [key, value] of Object.entries(DEFAULT_COLUMN_MAPPINGS)) {
      if (key.toLowerCase() === lowerNormalized) {
        mapping[normalized] = value
        break
      }
    }
  }
  
  return mapping
}

export function generateIdempotencyKey(
  year: number,
  sheetName: string,
  itemName: string,
  owner?: string | null,
  costCenter?: string | null,
  gl?: string | null
): string {
  const parts = [
    year.toString(),
    sheetName,
    (itemName || "").trim().toLowerCase(),
    (owner || "").trim().toLowerCase(),
    (costCenter || "").trim().toLowerCase(),
    (gl || "").trim().toLowerCase(),
  ]
  return parts.join("::")
}

