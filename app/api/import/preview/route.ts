import { NextRequest, NextResponse } from "next/server"
import { generateImportPreview } from "@/lib/import-helpers"
import { inferColumnMapping, type ColumnMapping } from "@/lib/mappings"

export const runtime = "nodejs"
export const maxDuration = 30

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
    const preview = await generateImportPreview(buffer, customMappings)
    
    return NextResponse.json(preview)
  } catch (error: any) {
    console.error("Import preview error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to generate preview" },
      { status: 500 }
    )
  }
}

