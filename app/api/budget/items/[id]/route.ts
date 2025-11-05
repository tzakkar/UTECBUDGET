import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { BudgetItemUpdateSchema } from "@/lib/validation"

export const runtime = "nodejs"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validated = BudgetItemUpdateSchema.parse(body)
    
    // Get existing item
    const existing = await prisma.budgetItem.findUnique({
      where: { id: params.id },
    })
    
    if (!existing) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      )
    }
    
    // Build update payload and recalc remaining if budget or spent changed
    const updateData: typeof validated & { remaining?: number } = { ...validated }
    if (validated.budget !== undefined || validated.spent !== undefined) {
      // Safely coerce to numbers, handling undefined/null cases
      const newBudget = Number(validated.budget ?? existing.budget ?? 0)
      const newSpent = Number(validated.spent ?? existing.spent ?? 0)
      updateData.remaining = newBudget - newSpent
    }
    
    // Handle bidirectional replacement linking
    // If this item is being marked as replaced by another item, also mark that item as replacing this one
    if (validated.replacedById !== undefined) {
      const oldReplacedById = existing.replacedById
      const newReplacedById = validated.replacedById
      
      // If replacing with a different item, update the new replacement item
      if (newReplacedById && newReplacedById !== oldReplacedById) {
        await prisma.budgetItem.update({
          where: { id: newReplacedById },
          data: {
            replacesItemId: params.id, // Link the new item back to this one
          },
        })
      }
      
      // If unsetting the replacement, also unset the reverse link
      if (oldReplacedById && (!newReplacedById || newReplacedById !== oldReplacedById)) {
        await prisma.budgetItem.update({
          where: { id: oldReplacedById },
          data: {
            replacesItemId: null, // Remove the reverse link
          },
        })
      }
    }
    
    // If this item is being marked as replacing another item, also mark that item as replaced by this one
    if (validated.replacesItemId !== undefined) {
      const oldReplacesItemId = existing.replacesItemId
      const newReplacesItemId = validated.replacesItemId
      
      // If replacing a different item, update the item being replaced
      if (newReplacesItemId && newReplacesItemId !== oldReplacesItemId) {
        await prisma.budgetItem.update({
          where: { id: newReplacesItemId },
          data: {
            replacedById: params.id, // Link the old item back to this one
          },
        })
      }
      
      // If unsetting the replacement, also unset the reverse link
      if (oldReplacesItemId && (!newReplacesItemId || newReplacesItemId !== oldReplacesItemId)) {
        await prisma.budgetItem.update({
          where: { id: oldReplacesItemId },
          data: {
            replacedById: null, // Remove the reverse link
          },
        })
      }
    }
    
    // Update item
    const updated = await prisma.budgetItem.update({
      where: { id: params.id },
      // Cast to any to accommodate union of nullable fields validated by Zod
      data: updateData as any,
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
    
    // Log audit
    await prisma.auditLog.create({
      data: {
        actor: "system", // TODO: Replace with actual user ID when auth is enabled
        entityType: "BudgetItem",
        entityId: params.id,
        action: "update",
        pre: existing as any,
        post: updated as any,
      },
    })
    
    return NextResponse.json(updated)
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Item update error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update item" },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const item = await prisma.budgetItem.findUnique({
      where: { id: params.id },
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
    
    if (!item) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      )
    }
    
    // Fetch audit logs separately (since we use generic entityId)
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        entityType: "BudgetItem",
        entityId: params.id,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    })
    
    return NextResponse.json({ ...item, auditLogs })
  } catch (error: any) {
    console.error("Item fetch error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch item" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get existing item for audit log
    const existing = await prisma.budgetItem.findUnique({
      where: { id: params.id },
    })
    
    if (!existing) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      )
    }
    
    // Delete the item
    await prisma.budgetItem.delete({
      where: { id: params.id },
    })
    
    // Log audit
    await prisma.auditLog.create({
      data: {
        actor: "system", // TODO: Replace with actual user ID when auth is enabled
        entityType: "BudgetItem",
        entityId: params.id,
        action: "delete",
        pre: existing as any,
        post: Prisma.JsonNull,
      },
    })
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Item delete error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to delete item" },
      { status: 500 }
    )
  }
}

