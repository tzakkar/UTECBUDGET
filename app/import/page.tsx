"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ColumnMapper } from "@/components/import/ColumnMapper"
import { useToast } from "@/components/ui/use-toast"
import { FileSpreadsheet, CheckCircle2, AlertCircle } from "lucide-react"

const AVAILABLE_FIELDS = [
  "itemName",
  "subItem",
  "projectId",
  "programId",
  "category",
  "subCategory",
  "model",
  "year",
  "quarter",
  "ownerId",
  "departmentId",
  "locationId",
  "vendorId",
  "quantity",
  "unitCost",
  "capex",
  "opex",
  "budget",
  "committed",
  "spent",
  "remaining",
  "costCenterId",
  "glId",
  "status",
  "percentComplete",
  "notes",
]

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [customMappings, setCustomMappings] = useState<Map<string, Record<string, string>>>(new Map())
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setPreview(null)
    }
  }

  const handlePreview = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select an Excel file first",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      
      if (customMappings.size > 0) {
        const mappingsObj: Record<string, Record<string, string>> = {}
        customMappings.forEach((value, key) => {
          mappingsObj[key] = value
        })
        formData.append("customMappings", JSON.stringify(mappingsObj))
      }

      const response = await fetch("/api/import/preview", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to generate preview")
      }

      const data = await response.json()
      setPreview(data)

      // Update custom mappings with inferred mappings
      const newMappings = new Map<string, Record<string, string>>()
      data.sheets.forEach((sheet: any) => {
        newMappings.set(sheet.name, sheet.mapping)
      })
      setCustomMappings(newMappings)
    } catch (error: any) {
      toast({
        title: "Preview failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleMappingChange = (sheetName: string, mapping: Record<string, string>) => {
    setCustomMappings((prev) => {
      const newMap = new Map(prev)
      newMap.set(sheetName, mapping)
      return newMap
    })
  }

  const handleImport = async () => {
    if (!file || !preview) {
      toast({
        title: "Missing data",
        description: "Please generate a preview first",
        variant: "destructive",
      })
      return
    }

    setImporting(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      
      if (customMappings.size > 0) {
        const mappingsObj: Record<string, Record<string, string>> = {}
        customMappings.forEach((value, key) => {
          mappingsObj[key] = value
        })
        formData.append("customMappings", JSON.stringify(mappingsObj))
      }

      const response = await fetch("/api/import/commit", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to import")
      }

      const result = await response.json()
      
      toast({
        title: "Import successful",
        description: `Added ${result.added} items, updated ${result.updated} items`,
      })

      // Reset
      setFile(null)
      setPreview(null)
      setCustomMappings(new Map())
    } catch (error: any) {
      toast({
        title: "Import failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <h1 className="text-4xl font-bold mb-8">Import Budget Data</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload Excel File</CardTitle>
          <CardDescription>
            Upload your budget workbook (.xlsx) to import data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
            {file && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileSpreadsheet className="h-4 w-4" />
                {file.name}
              </div>
            )}
          </div>
          <Button
            onClick={handlePreview}
            disabled={!file || loading}
            className="mt-4"
          >
            {loading ? "Generating Preview..." : "Generate Preview"}
          </Button>
        </CardContent>
      </Card>

      {preview && (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>
                Review the import preview and adjust column mappings if needed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {preview.sheets.map((sheet: any) => (
                  <Card key={sheet.name}>
                    <CardHeader>
                      <CardTitle className="text-lg">{sheet.name}</CardTitle>
                      <CardDescription>
                        {sheet.rowCount} rows, {sheet.headers.length} columns
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span className="text-sm">
                            {sheet.preview.added} to add
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm">
                            {sheet.preview.skipped} skipped
                          </span>
                        </div>
                      </div>

                      <ColumnMapper
                        headers={sheet.headers}
                        mapping={sheet.mapping}
                        onChange={(mapping) => handleMappingChange(sheet.name, mapping)}
                        availableFields={AVAILABLE_FIELDS}
                      />
                    </CardContent>
                  </Card>
                ))}

                {preview.warnings.length > 0 && (
                  <Card className="border-yellow-500">
                    <CardHeader>
                      <CardTitle className="text-lg text-yellow-700">
                        Warnings
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc list-inside space-y-1">
                        {preview.warnings.map((warning: string, i: number) => (
                          <li key={i} className="text-sm text-yellow-700">
                            {warning}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => setPreview(null)}>
              Cancel
            </Button>
            <Button onClick={handleImport} disabled={importing}>
              {importing ? "Importing..." : `Import ${preview.totalRows.toLocaleString()} Rows`}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

