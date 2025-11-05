"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function LocationDetailPage() {
  const params = useParams()
  const [location, setLocation] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const locsResponse = await fetch("/api/lookups/locations")
      const locs = await locsResponse.json()
      const foundLoc = locs.find((l: any) => l.id === params.id)
      setLocation(foundLoc)

      const itemsResponse = await fetch(`/api/budget/items?locationId=${params.id}&pageSize=1000`)
      const itemsData = await itemsResponse.json()
      setItems(itemsData.items)
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

  if (loading) return <div className="container mx-auto p-8">Loading...</div>
  if (!location) return <div className="container mx-auto p-8">Location not found</div>

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">{location.name}</h1>
      <Card>
        <CardHeader>
          <CardTitle>Budget Items ({items.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between items-center p-4 border rounded-lg">
                <Link href={`/items/${item.id}`} className="font-medium hover:underline">
                  {item.itemName}
                </Link>
                <div>${item.budget?.toLocaleString() || 0}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

