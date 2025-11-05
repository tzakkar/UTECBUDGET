import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

const LOOKUP_MODELS: Record<string, any> = {
  owners: prisma.owner,
  departments: prisma.department,
  locations: prisma.location,
  vendors: prisma.vendor,
  programs: prisma.program,
  projects: prisma.project,
  "cost-centers": prisma.costCenter,
  gls: prisma.gL,
}

export async function GET(
  request: NextRequest,
  { params }: { params: { type: string } }
) {
  try {
    const model = LOOKUP_MODELS[params.type.toLowerCase()]
    
    if (!model) {
      return NextResponse.json(
        { error: `Unknown lookup type: ${params.type}` },
        { status: 400 }
      )
    }
    
    const items = await model.findMany({
      orderBy: { name: "asc" },
    })
    
    return NextResponse.json(items)
  } catch (error: any) {
    console.error("Lookup fetch error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch lookups" },
      { status: 500 }
    )
  }
}

