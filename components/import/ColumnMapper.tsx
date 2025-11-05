"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ColumnMapperProps {
  headers: string[]
  mapping: Record<string, string>
  onChange: (mapping: Record<string, string>) => void
  availableFields: string[]
}

export function ColumnMapper({ headers, mapping, onChange, availableFields }: ColumnMapperProps) {
  const handleMappingChange = (excelColumn: string, field: string) => {
    if (field === "__SKIP__") {
      const next = { ...mapping }
      delete next[excelColumn]
      onChange(next)
    } else {
      onChange({
        ...mapping,
        [excelColumn]: field,
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Column Mapping</CardTitle>
        <CardDescription>
          Map Excel columns to budget item fields
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {headers.map((header) => (
            <div key={header} className="flex items-center gap-4">
              <Label className="w-48 text-right">{header || "(blank)"}</Label>
              <Select
                value={mapping[header] ?? undefined}
                onValueChange={(value) => handleMappingChange(header, value)}
              >
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__SKIP__">-- Skip --</SelectItem>
                  {availableFields.map((field) => (
                    <SelectItem key={field} value={field}>
                      {field}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

