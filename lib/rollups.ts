// Helper functions for rollup calculations

import { prisma } from "./prisma"

export interface RollupFilters {
  year?: number
  quarter?: number
  status?: string
  programId?: string
  projectId?: string
  category?: string
  subCategory?: string
  ownerId?: string
  departmentId?: string
  locationId?: string
  vendorId?: string
}

export async function getBudgetRollups(filters: RollupFilters = {}) {
  const where: any = {}
  
  if (filters.year) where.year = filters.year
  if (filters.quarter) where.quarter = filters.quarter
  if (filters.status) where.status = filters.status
  if (filters.programId) where.programId = filters.programId
  if (filters.projectId) where.projectId = filters.projectId
  if (filters.category) where.category = filters.category
  if (filters.subCategory) where.subCategory = filters.subCategory
  if (filters.ownerId) where.ownerId = filters.ownerId
  if (filters.departmentId) where.departmentId = filters.departmentId
  if (filters.locationId) where.locationId = filters.locationId
  if (filters.vendorId) where.vendorId = filters.vendorId

  const items = await prisma.budgetItem.findMany({
    where,
    select: {
      year: true,
      quarter: true,
      status: true,
      programId: true,
      projectId: true,
      category: true,
      subCategory: true,
      ownerId: true,
      departmentId: true,
      locationId: true,
      vendorId: true,
      budget: true,
      committed: true,
      spent: true,
      remaining: true,
    },
  })

  // Aggregate manually
  const rollups = items.reduce((acc, item) => {
    const key = [
      item.year,
      item.quarter || "null",
      item.status,
      item.category || "null",
      item.subCategory || "null",
      item.programId || "null",
      item.projectId || "null",
      item.ownerId || "null",
      item.departmentId || "null",
      item.locationId || "null",
      item.vendorId || "null",
    ].join("::")

    if (!acc[key]) {
      acc[key] = {
        year: item.year,
        quarter: item.quarter,
        status: item.status,
        category: item.category,
        subCategory: item.subCategory,
        programId: item.programId,
        projectId: item.projectId,
        ownerId: item.ownerId,
        departmentId: item.departmentId,
        locationId: item.locationId,
        vendorId: item.vendorId,
        itemCount: 0,
        allocated: 0,
        committed: 0,
        spent: 0,
        remaining: 0,
      }
    }

    acc[key].itemCount++
    acc[key].allocated += Number(item.budget || 0)
    acc[key].committed += Number(item.committed || 0)
    acc[key].spent += Number(item.spent || 0)
    acc[key].remaining += Number(item.remaining || 0)

    return acc
  }, {} as Record<string, any>)

  return Object.values(rollups).map((r: any) => ({
    ...r,
    executionPct: r.allocated > 0 ? (r.spent / r.allocated) * 100 : 0,
  }))
}

