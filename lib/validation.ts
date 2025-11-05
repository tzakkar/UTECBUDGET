import { z } from "zod"

export const BudgetStatusSchema = z.enum([
  "COMPLETED",
  "PARTIAL",
  "IN_PROGRESS",
  "NOT_STARTED",
])

export const WorkTypeSchema = z.enum(["BAU", "NEOBAU", "REV"]) 
export const WorkSubTypeSchema = z.enum(["BAU", "NEOBAU", "SAP", "MES", "SUSTAINABILITY", "AI"]) 
export const WorkClassSchema = z.enum(["HARDWARE", "IMPLEMENTATION", "MAINTENANCE", "MANPOWER", "SAP_SUPPORT", "SUBSCRIPTION"]) 

export const BudgetItemUpdateSchema = z.object({
  year: z.number().int().min(2025).max(2028).optional(),
  quarter: z.number().int().min(1).max(4).nullable().optional(),
  type: WorkTypeSchema.nullable().optional(),
  subType: WorkSubTypeSchema.nullable().optional(),
  workClass: WorkClassSchema.nullable().optional(),
  programId: z.string().nullable().optional(),
  projectId: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  subCategory: z.string().nullable().optional(),
  itemName: z.string().min(1).optional(),
  model: z.string().nullable().optional(),
  ownerId: z.string().nullable().optional(),
  departmentId: z.string().nullable().optional(),
  locationId: z.string().nullable().optional(),
  vendorId: z.string().nullable().optional(),
  quantity: z.number().int().positive().nullable().optional(),
  unitCost: z.number().nonnegative().nullable().optional(),
  capex: z.number().nonnegative().nullable().optional(),
  opex: z.number().nonnegative().nullable().optional(),
  budget: z.number().nonnegative().nullable().optional(),
  committed: z.number().nonnegative().nullable().optional(),
  spent: z.number().nonnegative().nullable().optional(),
  costCenterId: z.string().nullable().optional(),
  glId: z.string().nullable().optional(),
  status: BudgetStatusSchema.optional(),
  percentComplete: z.number().int().min(0).max(100).nullable().optional(),
  prNumber: z.string().nullable().optional(),
  poNumber: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  replacedById: z.string().nullable().optional(),
  replacesItemId: z.string().nullable().optional(),
  extendedFields: z.record(z.any()).nullable().optional(),
})

export const BudgetItemCreateSchema = z.object({
  year: z.number().int().min(2025).max(2028),
  quarter: z.number().int().min(1).max(4).nullable().optional(),
  type: WorkTypeSchema.nullable().optional(),
  subType: WorkSubTypeSchema.nullable().optional(),
  workClass: WorkClassSchema.nullable().optional(),
  itemName: z.string().min(1),
  category: z.string().nullable().optional(),
  subCategory: z.string().nullable().optional(),
  model: z.string().nullable().optional(),
  ownerId: z.string().nullable().optional(),
  departmentId: z.string().nullable().optional(),
  locationId: z.string().nullable().optional(),
  vendorId: z.string().nullable().optional(),
  programId: z.string().nullable().optional(),
  projectId: z.string().nullable().optional(),
  costCenterId: z.string().nullable().optional(),
  glId: z.string().nullable().optional(),
  quantity: z.number().int().positive().nullable().optional(),
  unitCost: z.number().nonnegative().nullable().optional(),
  capex: z.number().nonnegative().nullable().optional(),
  opex: z.number().nonnegative().nullable().optional(),
  budget: z.number().nonnegative().nullable().optional(),
  committed: z.number().nonnegative().nullable().optional(),
  spent: z.number().nonnegative().nullable().optional(),
  status: BudgetStatusSchema.optional(),
  percentComplete: z.number().int().min(0).max(100).nullable().optional(),
  prNumber: z.string().nullable().optional(),
  poNumber: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  replacedById: z.string().nullable().optional(),
  replacesItemId: z.string().nullable().optional(),
})

export function mapStatusStringToEnum(status: string | null | undefined): "COMPLETED" | "PARTIAL" | "IN_PROGRESS" | "NOT_STARTED" {
  if (!status) return "NOT_STARTED"
  const normalized = status.trim().toLowerCase()
  if (normalized.includes("completed") && !normalized.includes("partial")) {
    return "COMPLETED"
  }
  if (normalized.includes("partial")) {
    return "PARTIAL"
  }
  if (normalized.includes("progress") || normalized.includes("in progress")) {
    return "IN_PROGRESS"
  }
  return "NOT_STARTED"
}

export function mapTypeStringToEnum(value: string | null | undefined): "BAU" | "NEOBAU" | "REV" | null {
  if (!value) return null
  const v = value.toString().replace(/^\s*\d+\s*/,"").trim().toLowerCase()
  if (v === "bau") return "BAU"
  if (v === "neobau" || v === "neo-bau" || v === "neo_bau") return "NEOBAU"
  if (v === "rev") return "REV"
  return null
}

export function mapSubTypeStringToEnum(value: string | null | undefined): "BAU" | "NEOBAU" | "SAP" | "MES" | "SUSTAINABILITY" | "AI" | null {
  if (!value) return null
  const v = value.toString().replace(/^\s*\d+\s*/,"").trim().toLowerCase()
  if (v === "bau") return "BAU"
  if (v === "neobau" || v === "neo-bau" || v === "neo_bau") return "NEOBAU"
  if (v === "sap") return "SAP"
  if (v === "mes") return "MES"
  if (v === "sustainability") return "SUSTAINABILITY"
  if (v === "ai") return "AI"
  return null
}

export function mapClassStringToEnum(value: string | null | undefined): "HARDWARE" | "IMPLEMENTATION" | "MAINTENANCE" | "MANPOWER" | "SAP_SUPPORT" | "SUBSCRIPTION" | null {
  if (!value) return null
  const v = value.toString().replace(/^\s*\d+\s*/,"").trim().toLowerCase()
  if (v === "hardware") return "HARDWARE"
  if (v === "implementation") return "IMPLEMENTATION"
  if (v === "maintenance") return "MAINTENANCE"
  if (v === "manpower") return "MANPOWER"
  if (v === "sap support" || v === "sap_support") return "SAP_SUPPORT"
  if (v === "subscription") return "SUBSCRIPTION"
  return null
}

export function parseNumeric(value: any): number | null {
  if (value === null || value === undefined || value === "") return null
  if (typeof value === "number") return value
  if (typeof value === "string") {
    const cleaned = value.replace(/[^0-9.-]/g, "")
    const parsed = parseFloat(cleaned)
    return isNaN(parsed) ? null : parsed
  }
  return null
}

export function parseInteger(value: any): number | null {
  const num = parseNumeric(value)
  return num === null ? null : Math.floor(num)
}

