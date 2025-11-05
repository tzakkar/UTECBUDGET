"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"

export default function DepartmentDetailPage() {
  const params = useParams()
  const [department, setDepartment] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      loadData()
    }
  }, [params.id])

  const loadData = async () => {
    setLoading(true)
    try {
      const deptsResponse = await fetch("/api/lookups/departments")
      const depts = await deptsResponse.json()
      const foundDept = depts.find((d: any) => d.id === params.id)
      setDepartment(foundDept)

      const itemsResponse = await fetch(`/api/budget/items?departmentId=${params.id}&pageSize=1000`)
      const itemsData = await itemsResponse.json()
      setItems(itemsData.items)
    } catch (error) {
      console.error("Failed to load data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="container mx-auto p-8">Loading...</div>
  if (!department) return <div className="container mx-auto p-8">Department not found</div>

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">{department.name}</h1>
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

