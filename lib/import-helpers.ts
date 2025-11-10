import * as XLSX from "xlsx"
import { prisma } from "./prisma"
import { Prisma } from "@prisma/client"
import { parseNumeric, parseInteger, mapStatusStringToEnum, mapTypeStringToEnum, mapSubTypeStringToEnum, mapClassStringToEnum } from "./validation"
import { inferColumnMapping, generateIdempotencyKey, type ColumnMapping } from "./mappings"

export interface ImportPreview {
  sheets: SheetPreview[]
  totalRows: number
  warnings: string[]
}

export interface SheetPreview {
  name: string
  headers: string[]
  rowCount: number
  sampleRows: any[][]
  mapping: ColumnMapping
  preview: {
    added: number
    updated: number
    skipped: number
    conflicts: string[]
  }
}

export interface ImportRow {
  sheetName: string
  rowIndex: number
  data: Record<string, any>
  mapped: Record<string, any>
}

export async function parseWorkbook(fileBuffer: Buffer): Promise<{ sheets: Map<string, any[][]>, headers: Map<string, string[]> }> {
  const workbook = XLSX.read(fileBuffer, { type: "buffer", cellDates: true })
  const sheets = new Map<string, any[][]>()
  const headers = new Map<string, string[]>()
  
  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName]
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null, raw: false })
    
    if (jsonData.length === 0) continue
    
    const headerRowRaw = jsonData[0] as any[]
    // Coerce header cells to strings and drop empty headers
    const headerRow = (headerRowRaw || []).map((h) => (h === null || h === undefined ? "" : String(h)))
    const dataRows = jsonData.slice(1) as any[][]
    
    headers.set(sheetName, headerRow)
    sheets.set(sheetName, dataRows)
  }
  
  return { sheets, headers }
}

export async function generateImportPreview(
  fileBuffer: Buffer,
  customMappings?: Map<string, ColumnMapping>
): Promise<ImportPreview> {
  const { sheets, headers } = await parseWorkbook(fileBuffer)
  const warnings: string[] = []
  const sheetPreviews: SheetPreview[] = []
  
  for (const [sheetName, dataRows] of sheets.entries()) {
    const sheetHeaders = headers.get(sheetName) || []
    const mapping = customMappings?.get(sheetName) || inferColumnMapping(sheetHeaders)
    
    // Determine if this is a year sheet
    const isYearSheet = /^(202[5-8])$/.test(sheetName.trim())
    const year = isYearSheet ? parseInt(sheetName.trim()) : null
    
    const preview = {
      added: 0,
      updated: 0,
      skipped: 0,
      conflicts: [] as string[],
    }
    
    // Sample first 3 rows
    const sampleRows = dataRows.slice(0, 3)
    
    // For preview, we'll just count potential rows
    // Real validation happens during commit
    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i]
      if (!row || row.length === 0) {
        preview.skipped++
        continue
      }
      
      // Build mapped data object
      const mapped: Record<string, any> = {}
      for (let j = 0; j < sheetHeaders.length && j < row.length; j++) {
        const rawHeader = sheetHeaders[j]
        const header = (rawHeader === null || rawHeader === undefined) ? "" : String(rawHeader).trim()
        const value = row[j]
        if (header && mapping[header]) {
          mapped[mapping[header]] = value
        }
      }
      
      // Validate year
      if (isYearSheet) {
        mapped.year = year
      } else if (!mapped.year) {
        preview.skipped++
        warnings.push(`Row ${i + 2} in ${sheetName}: Missing year`)
        continue
      }
      
      // Validate itemName
      if (!mapped.itemName) {
        preview.skipped++
        warnings.push(`Row ${i + 2} in ${sheetName}: Missing item name`)
        continue
      }
      
      // Validate type/subtype/class if present
      if (mapped.type) {
        const t = mapTypeStringToEnum(mapped.type)
        if (!t) {
          preview.conflicts.push(`Row ${i + 2} in ${sheetName}: Unknown Type '${mapped.type}'`)
        }
      }
      if (mapped.subType) {
        const st = mapSubTypeStringToEnum(mapped.subType)
        if (!st) {
          preview.conflicts.push(`Row ${i + 2} in ${sheetName}: Unknown SubType '${mapped.subType}'`)
        }
      }
      if (mapped.workClass) {
        const wc = mapClassStringToEnum(mapped.workClass)
        if (!wc) {
          preview.conflicts.push(`Row ${i + 2} in ${sheetName}: Unknown Class '${mapped.workClass}'`)
        }
      }

      preview.added++
    }
    
    sheetPreviews.push({
      name: sheetName,
      headers: sheetHeaders,
      rowCount: dataRows.length,
      sampleRows,
      mapping,
      preview,
    })
  }
  
  return {
    sheets: sheetPreviews,
    totalRows: Array.from(sheets.values()).reduce((sum, rows) => sum + rows.length, 0),
    warnings,
  }
}

export async function commitImport(
  fileBuffer: Buffer,
  customMappings?: Map<string, ColumnMapping>,
  options?: { forceYear?: number }
): Promise<{ added: number, updated: number, errors: string[] }> {
  const { sheets, headers } = await parseWorkbook(fileBuffer)
  let added = 0
  let updated = 0
  const errors: string[] = []
  
  for (const [sheetName, dataRows] of sheets.entries()) {
    const sheetHeaders = headers.get(sheetName) || []
    const mapping = customMappings?.get(sheetName) || inferColumnMapping(sheetHeaders)
    const isYearSheet = /^(202[5-8])$/.test(sheetName.trim())
    const defaultYear = isYearSheet ? parseInt(sheetName.trim()) : (options?.forceYear ?? null)
    
    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i]
      if (!row || row.length === 0) continue
      
      try {
        const rowData: Record<string, any> = {}
        const extendedFields: Record<string, any> = {}
        
        // Map columns
        for (let j = 0; j < sheetHeaders.length && j < row.length; j++) {
          const rawHeader = sheetHeaders[j]
          const header = (rawHeader === null || rawHeader === undefined) ? "" : String(rawHeader).trim()
          const value = row[j]

          if (!header) continue

          if (mapping[header]) {
            rowData[mapping[header]] = value
          } else {
            // Store in extendedFields with original header text
            extendedFields[header] = value
          }
        }
        
        // Set year
        const year = defaultYear || parseInteger(rowData.year) || null
        if (!year || year < 2025 || year > 2028) {
          errors.push(`Row ${i + 2} in ${sheetName}: Invalid year`)
          continue
        }
        
        // Validate required fields
        const itemName = rowData.itemName?.toString().trim()
        if (!itemName) {
          errors.push(`Row ${i + 2} in ${sheetName}: Missing item name`)
          continue
        }
        
        // Process lookups and get IDs
        const ownerId = rowData.ownerId ? await getOrCreateLookup("Owner", rowData.ownerId) : null
        const departmentId = rowData.departmentId ? await getOrCreateLookup("Department", rowData.departmentId) : null
        const locationId = rowData.locationId ? await getOrCreateLookup("Location", rowData.locationId) : null
        const vendorId = rowData.vendorId ? await getOrCreateLookup("Vendor", rowData.vendorId) : null
        const programId = rowData.programId ? await getOrCreateLookup("Program", rowData.programId) : null
        const projectId = rowData.projectId ? await getOrCreateLookup("Project", rowData.projectId) : null
        const costCenterId = rowData.costCenterId ? await getOrCreateLookup("CostCenter", rowData.costCenterId) : null
        const glId = rowData.glId ? await getOrCreateLookup("GL", rowData.glId) : null
        
        // Process financial fields with null-safe numeric coercion
        const parsedBudget = parseNumeric(rowData.budget)
        const parsedCapex = parseNumeric(rowData.capex)
        const parsedOpex = parseNumeric(rowData.opex)
        const capex = parsedCapex ?? null
        const opex = parsedOpex ?? null
        const budget = parsedBudget ?? ((Number(parsedCapex ?? 0) + Number(parsedOpex ?? 0)) || null)
        const committed = Number(parseNumeric(rowData.committed) ?? 0)
        const spent = Number(parseNumeric(rowData.spent) ?? 0)
        const remaining = budget !== null ? Number(budget) - spent : null
        
        // Build the budget item data
        const budgetItemData = {
          year,
          quarter: parseInteger(rowData.quarter),
          type: mapTypeStringToEnum(rowData.type),
          subType: mapSubTypeStringToEnum(rowData.subType),
          workClass: mapClassStringToEnum(rowData.workClass),
          itemName,
          category: rowData.category?.toString().trim() || null,
          subCategory: rowData.subCategory?.toString().trim() || null,
          model: rowData.model?.toString().trim() || null,
          programId,
          projectId,
          ownerId,
          departmentId,
          locationId,
          vendorId,
          costCenterId,
          glId,
          quantity: parseInteger(rowData.quantity) || 1,
          unitCost: parseNumeric(rowData.unitCost),
          capex,
          opex,
          budget,
          committed,
          spent,
          remaining,
          status: mapStatusStringToEnum(rowData.status),
          percentComplete: parseInteger(rowData.percentComplete) || 0,
          notes: rowData.notes?.toString().trim() || null,
          extendedFields: Object.keys(extendedFields).length > 0 ? (extendedFields as any) : Prisma.JsonNull,
        }
        
        // Generate idempotency key
        const idempotencyKey = generateIdempotencyKey(
          year,
          sheetName,
          itemName,
          ownerId,
          costCenterId,
          glId
        )
        
        // Try to find existing item (in a real scenario, you'd store idempotencyKey in DB)
        // For now, we'll use a combination of year + itemName + ownerId
        const existing = await prisma.budgetItem.findFirst({
          where: {
            year,
            itemName,
            ownerId: ownerId || null,
            costCenterId: costCenterId || null,
          },
        })
        
        if (existing) {
          // Update
          await prisma.budgetItem.update({
            where: { id: existing.id },
            data: budgetItemData,
          })
          
          // Log audit
          await prisma.auditLog.create({
            data: {
              actor: "system",
              entityType: "BudgetItem",
              entityId: existing.id,
              action: "update",
              pre: existing as any,
              post: budgetItemData as any,
            },
          })
          
          updated++
        } else {
          // Create
          const created = await prisma.budgetItem.create({
            data: budgetItemData,
          })
          
          // Log audit
          await prisma.auditLog.create({
            data: {
              actor: "system",
              entityType: "BudgetItem",
              entityId: created.id,
              action: "create",
              post: created as any,
            },
          })
          
          added++
        }
      } catch (error: any) {
        errors.push(`Row ${i + 2} in ${sheetName}: ${error.message}`)
      }
    }
  }
  
  return { added, updated, errors }
}

async function getOrCreateLookup(
  type: "Owner" | "Department" | "Location" | "Vendor" | "Program" | "Project" | "CostCenter" | "GL",
  nameOrCode: string
): Promise<string> {
  const name = nameOrCode.toString().trim()
  if (!name) throw new Error("Name required")
  
  const models = {
    Owner: prisma.owner,
    Department: prisma.department,
    Location: prisma.location,
    Vendor: prisma.vendor,
    Program: prisma.program,
    Project: prisma.project,
    CostCenter: prisma.costCenter,
    GL: prisma.gL,
  } as const
  
  const model = models[type] as {
    findFirst: (args: any) => Promise<{ id: string } | null>
    create: (args: any) => Promise<{ id: string }>
  }
  
  const where =
    type === "CostCenter" || type === "GL"
      ? {
          OR: [{ code: name }, { name }],
        }
      : { name }
  
  let existing = await model.findFirst({ where })
  
  if (!existing) {
    const data =
      type === "CostCenter" || type === "GL"
        ? { name, code: name }
        : { name }
    
    existing = await model.create({ data })
  }
  
  return existing.id
}

