"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface BudgetItem {
  id: string
  year: number
  quarter: number | null
  itemName: string
  category: string | null
  subCategory: string | null
  model: string | null
  status: string
  percentComplete: number | null
  budget: number | null
  committed: number | null
  spent: number | null
  remaining: number | null
  quantity: number | null
  unitCost: number | null
  capex: number | null
  opex: number | null
  notes: string | null
  extendedFields: any
  owner?: { name: string } | null
  vendor?: { name: string } | null
  location?: { name: string } | null
  project?: { name: string } | null
  program?: { name: string } | null
  costCenter?: { name: string } | null
  gl?: { name: string } | null
  auditLogs?: Array<{
    id: string
    actor: string | null
    action: string
    createdAt: Date
    pre: any
    post: any
  }>
}

export default function ItemDetailPage() {
  const params = useParams()
  const [item, setItem] = useState<BudgetItem | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      loadItem()
    }
  }, [params.id])

  const loadItem = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/budget/items/${params.id}`)
      if (!response.ok) throw new Error("Failed to load item")
      const data = await response.json()
      setItem(data)
    } catch (error) {
      console.error("Failed to load item:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="container mx-auto p-8">Loading...</div>
  }

  if (!item) {
    return <div className="container mx-auto p-8">Item not found</div>
  }

  return (
    <div className="container mx-auto p-8">
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2">{item.itemName}</h1>
        <div className="flex gap-2 items-center">
          <Badge>{item.status}</Badge>
          {item.year && <Badge variant="outline">Year {item.year}</Badge>}
          {item.quarter && <Badge variant="outline">Q{item.quarter}</Badge>}
        </div>
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="extended">Extended Fields</TabsTrigger>
          <TabsTrigger value="history">Change History</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Category</div>
                  <div>{item.category || "-"}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Sub-Category</div>
                  <div>{item.subCategory || "-"}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Model</div>
                  <div>{item.model || "-"}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Quantity</div>
                  <div>{item.quantity || "-"}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Unit Cost</div>
                  <div>
                    {item.unitCost
                      ? `$${item.unitCost.toLocaleString()}`
                      : "-"}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Relationships</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Beneficiary</div>
                  <div>{item.owner?.name || "-"}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Department</div>
                  <div>{item.vendor?.name || "-"}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Location</div>
                  <div>{item.location?.name || "-"}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Vendor</div>
                  <div>{item.vendor?.name || "-"}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Project</div>
                  <div>{item.project?.name || "-"}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Program</div>
                  <div>{item.program?.name || "-"}</div>
                </div>
              </CardContent>
            </Card>

            {item.notes && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{item.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="financial">
          <Card>
            <CardHeader>
              <CardTitle>Financial Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Budget</div>
                  <div className="text-2xl font-bold">
                    {item.budget
                      ? `$${item.budget.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                      : "-"}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Committed</div>
                  <div className="text-2xl font-bold">
                    {item.committed
                      ? `$${item.committed.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                      : "-"}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Spent</div>
                  <div className="text-2xl font-bold">
                    {item.spent
                      ? `$${item.spent.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                      : "-"}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Remaining</div>
                  <div className="text-2xl font-bold">
                    {item.remaining
                      ? `$${item.remaining.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                      : "-"}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">CapEx</div>
                  <div>
                    {item.capex
                      ? `$${item.capex.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                      : "-"}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">OpEx</div>
                  <div>
                    {item.opex
                      ? `$${item.opex.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                      : "-"}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">% Complete</div>
                  <div className="text-xl font-semibold">
                    {item.percentComplete || 0}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="extended">
          <Card>
            <CardHeader>
              <CardTitle>Extended Fields</CardTitle>
              <CardDescription>
                Sheet-specific columns stored as extended fields
              </CardDescription>
            </CardHeader>
            <CardContent>
              {item.extendedFields ? (
                <pre className="bg-muted p-4 rounded-md overflow-auto">
                  {JSON.stringify(item.extendedFields, null, 2)}
                </pre>
              ) : (
                <p className="text-muted-foreground">No extended fields</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Change History</CardTitle>
              <CardDescription>Audit log of all changes</CardDescription>
            </CardHeader>
            <CardContent>
              {item.auditLogs && item.auditLogs.length > 0 ? (
                <div className="space-y-4">
                  {item.auditLogs.map((log) => (
                    <Card key={log.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-medium">{log.action}</div>
                            <div className="text-sm text-muted-foreground">
                              by {log.actor || "system"} on{" "}
                              {new Date(log.createdAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        {log.pre && (
                          <div className="mt-2">
                            <div className="text-sm font-medium">Before:</div>
                            <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto">
                              {JSON.stringify(log.pre, null, 2)}
                            </pre>
                          </div>
                        )}
                        {log.post && (
                          <div className="mt-2">
                            <div className="text-sm font-medium">After:</div>
                            <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto">
                              {JSON.stringify(log.post, null, 2)}
                            </pre>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No change history</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

