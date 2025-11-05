import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const year = searchParams.get("year") ? parseInt(searchParams.get("year")!) : null
    const quarter = searchParams.get("quarter") ? parseInt(searchParams.get("quarter")!) : null
    const status = searchParams.get("status")
    const programId = searchParams.get("programId")
    const projectId = searchParams.get("projectId")
    const category = searchParams.get("category")
    const ownerId = searchParams.get("ownerId")
    const departmentId = searchParams.get("departmentId")
    const locationId = searchParams.get("locationId")
    const vendorId = searchParams.get("vendorId")
    
    // Build where clause
    const where: any = {}
    if (year) where.year = year
    if (quarter) where.quarter = quarter
    if (status) where.status = status
    if (programId) where.programId = programId
    if (projectId) where.projectId = projectId
    if (category) where.category = category
    if (ownerId) where.ownerId = ownerId
    if (departmentId) where.departmentId = departmentId
    if (locationId) where.locationId = locationId
    if (vendorId) where.vendorId = vendorId
    
    // Aggregate data
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
    
    // Compute rollups manually (since we're using a view in Prisma, we'll aggregate here)
    const rollups = items.reduce((acc, item) => {
      const key = `${item.year}-${item.quarter || 'null'}-${item.status}-${item.category || 'null'}-${item.programId || 'null'}-${item.projectId || 'null'}`
      
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
    
    const rollupArray = Object.values(rollups).map((r: any) => ({
      ...r,
      executionPct: r.allocated > 0 ? (r.spent / r.allocated) * 100 : 0,
    }))
    
    return NextResponse.json({
      rollups: rollupArray,
      totalItems: items.length,
    })
  } catch (error: any) {
    console.error("Rollups error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch rollups" },
      { status: 500 }
    )
  }
}

