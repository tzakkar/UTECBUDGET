import { NextRequest, NextResponse } from "next/server"
import { commitImport } from "@/lib/import-helpers"
import { type ColumnMapping } from "@/lib/mappings"

export const runtime = "nodejs"
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }
    
    // Parse custom mappings if provided
    const customMappingsJson = formData.get("customMappings") as string | null
    let customMappings: Map<string, ColumnMapping> | undefined
    
    if (customMappingsJson) {
      try {
        const parsed = JSON.parse(customMappingsJson)
        customMappings = new Map(Object.entries(parsed))
      } catch (e) {
        // Ignore parsing errors, use defaults
      }
    }
    
    const buffer = Buffer.from(await file.arrayBuffer())
    const result = await commitImport(buffer, customMappings)
    
    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error: any) {
    console.error("Import commit error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to commit import" },
      { status: 500 }
    )
  }
}

