"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"

interface BudgetItem {
  id: string
  itemName: string
  status: string
  percentComplete: number | null
  budget: number | null
  spent: number | null
  owner?: { name: string } | null
  vendor?: { name: string } | null
  location?: { name: string } | null
  project?: { name: string } | null
  program?: { name: string } | null
}

const STATUSES = [
  { key: "NOT_STARTED", label: "Not Started", color: "bg-gray-100 text-gray-800" },
  { key: "IN_PROGRESS", label: "In Progress", color: "bg-blue-100 text-blue-800" },
  { key: "PARTIAL", label: "Partially Completed", color: "bg-yellow-100 text-yellow-800" },
  { key: "COMPLETED", label: "Completed", color: "bg-green-100 text-green-800" },
]

export default function StatusBoardPage() {
  const [items, setItems] = useState<BudgetItem[]>([])
  const [loading, setLoading] = useState(true)
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadItems()
  }, [])

  const loadItems = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/budget/items?pageSize=1000")
      const data = await response.json()
      setItems(data.items)
    } catch (error) {
      console.error("Failed to load items:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDragStart = (itemId: string) => {
    setDraggedItem(itemId)
  }

  const handleDrop = async (newStatus: string) => {
    if (!draggedItem) return

    try {
      const response = await fetch(`/api/budget/items/${draggedItem}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error("Failed to update")

      await loadItems()
      toast({
        title: "Status updated",
        description: "Item status has been updated",
      })
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setDraggedItem(null)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const getItemsByStatus = (status: string) => {
    return items.filter((item) => item.status === status)
  }

  if (loading) {
    return <div className="container mx-auto p-8">Loading...</div>
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">Status Board</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {STATUSES.map((status) => (
          <div
            key={status.key}
            className="min-h-[600px]"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(status.key)}
          >
            <Card className="h-full">
              <CardContent className="p-4">
                <h2 className="font-semibold text-lg mb-4 flex items-center justify-between">
                  <span>{status.label}</span>
                  <Badge className={status.color}>
                    {getItemsByStatus(status.key).length}
                  </Badge>
                </h2>
                <div className="space-y-3">
                  {getItemsByStatus(status.key).map((item) => (
                    <Card
                      key={item.id}
                      draggable
                      onDragStart={() => handleDragStart(item.id)}
                      className="cursor-move hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-4">
                        <h3 className="font-medium mb-2">{item.itemName}</h3>
                        <div className="text-sm text-muted-foreground space-y-1">
                          {item.project && (
                            <div>Project: {item.project.name}</div>
                          )}
                          {item.program && (
                            <div>Program: {item.program.name}</div>
                          )}
                          {item.owner && <div>Owner: {item.owner.name}</div>}
                          {item.vendor && <div>Vendor: {item.vendor.name}</div>}
                          {item.location && (
                            <div>Location: {item.location.name}</div>
                          )}
                          {item.budget && (
                            <div>Budget: ${item.budget.toLocaleString()}</div>
                          )}
                          {item.spent !== null && (
                            <div>Spent: ${item.spent.toLocaleString()}</div>
                          )}
                          {item.percentComplete !== null && (
                            <div>Complete: {item.percentComplete}%</div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}

