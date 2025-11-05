import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { BudgetItemCreateSchema } from "@/lib/validation"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "50")
    const year = searchParams.get("year") ? parseInt(searchParams.get("year")!) : null
    const quarter = searchParams.get("quarter") ? parseInt(searchParams.get("quarter")!) : null
    const status = searchParams.get("status")
    const type = searchParams.get("type")
    const subType = searchParams.get("subType")
    const workClass = searchParams.get("workClass")
    const programId = searchParams.get("programId")
    const projectId = searchParams.get("projectId")
    const category = searchParams.get("category")
    const ownerId = searchParams.get("ownerId")
    const departmentId = searchParams.get("departmentId")
    const locationId = searchParams.get("locationId")
    const vendorId = searchParams.get("vendorId")
    const search = searchParams.get("search")
    const sortBy = searchParams.get("sortBy") || "year"
    const sortOrder = searchParams.get("sortOrder") || "desc"
    
    // Build where clause
    const where: any = {}
    if (year) where.year = year
    if (quarter) where.quarter = quarter
    if (status) where.status = status
    if (type) where.type = type
    if (subType) where.subType = subType
    if (workClass) where.workClass = workClass
    if (programId) where.programId = programId
    if (projectId) where.projectId = projectId
    if (category) where.category = category
    if (ownerId) where.ownerId = ownerId
    if (departmentId) where.departmentId = departmentId
    if (locationId) where.locationId = locationId
    if (vendorId) where.vendorId = vendorId
    
    if (search) {
      where.OR = [
        { itemName: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
        { subCategory: { contains: search, mode: "insensitive" } },
        { notes: { contains: search, mode: "insensitive" } },
      ]
    }
    
    // Get total count
    const total = await prisma.budgetItem.count({ where })
    
    // Get items with pagination
    const items = await prisma.budgetItem.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: {
        [sortBy]: sortOrder === "asc" ? "asc" : "desc",
      },
      include: {
        owner: true,
        department: true,
        location: true,
        vendor: true,
        program: true,
        project: true,
        costCenter: true,
        gl: true,
        replacedBy: {
          select: {
            id: true,
            itemName: true,
            year: true,
          },
        },
        replacesItem: {
          select: {
            id: true,
            itemName: true,
            year: true,
          },
        },
      },
    })
    
    return NextResponse.json({
      items,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (error: any) {
    console.error("Items fetch error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch items" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const input = BudgetItemCreateSchema.parse(body)

    const hasCapexOrOpex = input.capex != null || input.opex != null
    const computedBudget = (input.capex ?? 0) + (input.opex ?? 0)
    const budget = input.budget ?? (hasCapexOrOpex ? computedBudget : null)
    const spent = input.spent ?? 0
    const remaining = budget !== null ? budget - spent : null

    const created = await prisma.budgetItem.create({
      data: {
        year: input.year,
        quarter: input.quarter ?? null,
        type: input.type ?? null,
        subType: input.subType ?? null,
        workClass: input.workClass ?? null,
        itemName: input.itemName,
        category: input.category ?? null,
        subCategory: input.subCategory ?? null,
        model: input.model ?? null,
        ownerId: input.ownerId ?? null,
        departmentId: input.departmentId ?? null,
        locationId: input.locationId ?? null,
        vendorId: input.vendorId ?? null,
        programId: input.programId ?? null,
        projectId: input.projectId ?? null,
        costCenterId: input.costCenterId ?? null,
        glId: input.glId ?? null,
        quantity: input.quantity ?? 1,
        unitCost: input.unitCost ?? null,
        capex: input.capex ?? null,
        opex: input.opex ?? null,
        budget,
        committed: input.committed ?? 0,
        spent,
        remaining,
        status: input.status ?? "NOT_STARTED",
        percentComplete: input.percentComplete ?? 0,
        notes: input.notes ?? null,
      },
    })

    await prisma.auditLog.create({
      data: {
        actor: "system",
        entityType: "BudgetItem",
        entityId: created.id,
        action: "create",
        post: created as any,
      },
    })

    return NextResponse.json(created, { status: 201 })
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Item create error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create item" },
      { status: 500 }
    )
  }
}

