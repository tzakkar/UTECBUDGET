"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function OwnerDetailPage() {
  const params = useParams()
  const [owner, setOwner] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch owner
      const ownersResponse = await fetch("/api/lookups/owners")
      const owners = await ownersResponse.json()
      const foundOwner = owners.find((o: any) => o.id === params.id)
      setOwner(foundOwner)

      // Fetch items
      const itemsResponse = await fetch(`/api/budget/items?ownerId=${params.id}&pageSize=1000`)
      const itemsData = await itemsResponse.json()
      setItems(itemsData.items)

      // Calculate KPIs
      const totalBudget = itemsData.items.reduce((sum: number, item: any) => sum + Number(item.budget || 0), 0)
      const totalSpent = itemsData.items.reduce((sum: number, item: any) => sum + Number(item.spent || 0), 0)
      const totalCommitted = itemsData.items.reduce((sum: number, item: any) => sum + Number(item.committed || 0), 0)
      
      setOwner((prev: any) => ({
        ...prev,
        kpis: {
          totalBudget,
          totalSpent,
          totalCommitted,
          totalRemaining: totalBudget - totalSpent,
          executionPct: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
        },
      }))
    } catch (error) {
      console.error("Failed to load data:", error)
    } finally {
      setLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    if (params.id) {
      loadData()
    }
  }, [params.id, loadData])

  if (loading) {
    return <div className="container mx-auto p-8">Loading...</div>
  }

  if (!owner) {
    return <div className="container mx-auto p-8">Beneficiary not found</div>
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">{owner.name}</h1>

      {owner.kpis && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Budget</CardDescription>
              <CardTitle className="text-2xl">
                ${owner.kpis.totalBudget.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Committed</CardDescription>
              <CardTitle className="text-2xl">
                ${owner.kpis.totalCommitted.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Spent</CardDescription>
              <CardTitle className="text-2xl">
                ${owner.kpis.totalSpent.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Remaining</CardDescription>
              <CardTitle className="text-2xl">
                ${owner.kpis.totalRemaining.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Execution %</CardDescription>
              <CardTitle className="text-2xl">
                {owner.kpis.executionPct.toFixed(1)}%
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Budget Items ({items.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between items-center p-4 border rounded-lg">
                <div>
                  <Link href={`/items/${item.id}`} className="font-medium hover:underline">
                    {item.itemName}
                  </Link>
                  <div className="text-sm text-muted-foreground">
                    {item.category} • {item.year} {item.quarter ? `Q${item.quarter}` : ""}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    ${item.budget?.toLocaleString(undefined, { maximumFractionDigits: 0 }) || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {item.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

