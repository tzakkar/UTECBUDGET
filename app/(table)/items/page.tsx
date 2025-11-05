"use client"

import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
  createColumnHelper,
  VisibilityState,
} from "@tanstack/react-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ItemNameCombobox } from "@/components/ItemNameCombobox"
import { BrandCombobox } from "@/components/BrandCombobox"
import * as XLSX from "xlsx"
import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Maximize2, Filter, X, Plus, Columns } from "lucide-react"
import { EditItemModal } from "@/components/EditItemModal"

interface BudgetItem {
  id: string
  year: number
  quarter: number | null
  itemName: string
  category: string | null
  subCategory: string | null
  status: string
  percentComplete: number | null
  quantity: number | null
  budget: number | null
  committed: number | null
  spent: number | null
  remaining: number | null
  prNumber: string | null
  poNumber: string | null
  replacedById: string | null
  replacesItemId: string | null
  replacedBy?: { id: string; itemName: string; year: number } | null
  replacesItem?: { id: string; itemName: string; year: number } | null
  owner?: { id: string; name: string } | null
  vendor?: { name: string } | null
  location?: { name: string } | null
  project?: { name: string } | null
  program?: { name: string } | null
}

const columnHelper = createColumnHelper<BudgetItem>()

export default function ItemsPage() {
  const [items, setItems] = useState<BudgetItem[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [createPayload, setCreatePayload] = useState({
    itemName: "",
    year: 2025,
    quarter: 1 as number | null,
    status: "NOT_STARTED",
    // New fields
    type: "BAU",
    subType: "BAU",
    workClass: "HARDWARE",
    category: "",
    brand: "",
    justification: "",
    quantity: 1,
    unitCost: 0,
    expenseType: "CAPEX" as "CAPEX" | "OPEX",
    capex: 0,
    opex: 0,
    ownerId: "",
  })
  const [globalFilter, setGlobalFilter] = useState("")
  const [yearFilter, setYearFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [subTypeFilter, setSubTypeFilter] = useState<string>("all")
  const [workClassFilter, setWorkClassFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [ownerFilter, setOwnerFilter] = useState<string>("all")
  const [vendorFilter, setVendorFilter] = useState<string>("all")
  const [selectedItemForEdit, setSelectedItemForEdit] = useState<BudgetItem | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [owners, setOwners] = useState<Array<{ id: string; name: string }>>([])
  const [vendors, setVendors] = useState<Array<{ id: string; name: string }>>([])
  const [fullPageView, setFullPageView] = useState(false)
  const [showFilters, setShowFilters] = useState(true)
  const [showAddItem, setShowAddItem] = useState(true)
  // Load column visibility from localStorage
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('budget-items-column-visibility')
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch {
          return {}
        }
      }
    }
    return {}
  })
  const [showColumnDialog, setShowColumnDialog] = useState(false)
  const tableScrollRef = useRef<HTMLDivElement>(null)
  const topScrollbarRef = useRef<HTMLDivElement>(null)

  // Save column visibility to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('budget-items-column-visibility', JSON.stringify(columnVisibility))
    }
  }, [columnVisibility])

  const loadOwners = useCallback(async () => {
    try {
      const res = await fetch("/api/lookups/owners")
      const data = await res.json()
      setOwners(data)
    } catch (error) {
      console.error("Failed to load owners:", error)
    }
  }, [])

  const loadVendors = useCallback(async () => {
    try {
      const res = await fetch("/api/lookups/vendors")
      const data = await res.json()
      setVendors(data)
    } catch (error) {
      console.error("Failed to load vendors:", error)
    }
  }, [])

  const loadItems = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ pageSize: "1000" })
      if (yearFilter !== "all") params.append("year", yearFilter)
      if (statusFilter !== "all") params.append("status", statusFilter)
      if (typeFilter !== "all") params.append("type", typeFilter)
      if (subTypeFilter !== "all") params.append("subType", subTypeFilter)
      if (workClassFilter !== "all") params.append("workClass", workClassFilter)
      if (categoryFilter !== "all") params.append("category", categoryFilter)
      if (ownerFilter !== "all") params.append("ownerId", ownerFilter)
      if (vendorFilter !== "all") params.append("vendorId", vendorFilter)

      const response = await fetch(`/api/budget/items?${params}`)
      const data = await response.json()
      setItems(data.items)
    } catch (error) {
      console.error("Failed to load items:", error)
    } finally {
      setLoading(false)
    }
  }, [yearFilter, statusFilter, typeFilter, subTypeFilter, workClassFilter, categoryFilter, ownerFilter, vendorFilter])

  useEffect(() => {
    loadItems()
    loadOwners()
    loadVendors()
  }, [loadItems, loadOwners, loadVendors])

  // Sync top scrollbar with table scroll and set correct width
  useEffect(() => {
    const tableContainer = tableScrollRef.current
    const topScrollbar = topScrollbarRef.current
    
    if (!tableContainer || !topScrollbar) return

    // Set scrollbar width to match table scroll width
    const updateScrollbarWidth = () => {
      const scrollWidth = tableContainer.scrollWidth
      const clientWidth = tableContainer.clientWidth
      if (scrollWidth > clientWidth) {
        const scrollbarContent = topScrollbar.querySelector('div')
        if (scrollbarContent) {
          scrollbarContent.style.minWidth = `${scrollWidth}px`
        }
      }
    }

    updateScrollbarWidth()
    
    // Use ResizeObserver to update when table size changes
    const resizeObserver = new ResizeObserver(updateScrollbarWidth)
    resizeObserver.observe(tableContainer)

    const handleScroll = () => {
      if (topScrollbar) {
        topScrollbar.scrollLeft = tableContainer.scrollLeft
      }
    }

    const handleTopScroll = () => {
      if (tableContainer) {
        tableContainer.scrollLeft = topScrollbar.scrollLeft
      }
    }

    tableContainer.addEventListener('scroll', handleScroll)
    topScrollbar.addEventListener('scroll', handleTopScroll)

    return () => {
      resizeObserver.disconnect()
      tableContainer.removeEventListener('scroll', handleScroll)
      topScrollbar.removeEventListener('scroll', handleTopScroll)
    }
  }, [items])

  const columns = useMemo<ColumnDef<BudgetItem>[]>(
    () => [
      columnHelper.accessor("itemName", {
        header: "Item",
        cell: (info) => {
          const item = info.row.original
          return (
            <div className="flex items-center gap-2">
              <span>{info.getValue()}</span>
              {item.replacedBy && (
                <Badge variant="secondary" className="text-xs">
                  Replaced
                </Badge>
              )}
              {item.replacesItem && (
                <Badge variant="outline" className="text-xs">
                  Replacement
                </Badge>
              )}
            </div>
          )
        },
      }),
      columnHelper.accessor("year", {
        header: "Year",
      }),
      columnHelper.accessor("quarter", {
        header: "Quarter",
        cell: (info) => info.getValue() || "-",
      }),
      columnHelper.accessor("category", {
        header: "Category",
        cell: (info) => info.getValue() || "-",
      }),
       columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => (
          <Badge
            variant={
              info.getValue() === "COMPLETED"
                ? "default"
                : info.getValue() === "IN_PROGRESS"
                ? "secondary"
                : "outline"
            }
          >
            {info.getValue()}
          </Badge>
        ),
      }),
      columnHelper.accessor("percentComplete", {
        header: "% Complete",
        cell: (info) => `${info.getValue() || 0}%`,
      }),
      columnHelper.accessor("quantity", {
        header: "Quantity",
        cell: (info) => info.getValue() ?? 1,
      }),
      columnHelper.accessor("budget", {
        header: "Budget",
        cell: (info) =>
          info.getValue()
            ? `$${info.getValue()!.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
            : "-",
      }),
      columnHelper.accessor("spent", {
        header: "Spent",
        cell: (info) =>
          info.getValue()
            ? `$${info.getValue()!.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
            : "-",
      }),
      columnHelper.accessor("committed", {
        header: "Committed",
        cell: (info) =>
          info.getValue()
            ? `$${info.getValue()!.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
            : "-",
      }),
      columnHelper.accessor("remaining", {
        header: "Remaining",
        cell: (info) =>
          info.getValue()
            ? `$${info.getValue()!.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
            : "-",
      }),
       columnHelper.accessor("owner", {
        header: "Beneficiary",
        cell: (info) => info.getValue()?.name || "-",
      }),
      columnHelper.accessor("vendor", {
        header: "Vendor",
        cell: (info) => info.getValue()?.name || "-",
      }),
       columnHelper.display({
        id: "prNumber",
        header: "PR Number",
        cell: (info) => info.row.original.prNumber || "-",
      }),
       columnHelper.display({
        id: "poNumber",
        header: "PO Number",
        cell: (info) => info.row.original.poNumber || "-",
      }),
      columnHelper.display({
        id: "replacement",
        header: "Replacement",
        cell: (info) => {
          const item = info.row.original
          if (item.replacedBy || item.replacesItem) {
            return (
              <div className="space-y-1 text-xs min-w-[200px]">
                {item.replacesItem && (
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Replaces:</span>
                    <Badge variant="outline" className="text-xs">
                      {item.replacesItem.itemName} ({item.replacesItem.year})
                    </Badge>
                  </div>
                )}
                {item.replacedBy && (
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Replaced by:</span>
                    <Badge variant="secondary" className="text-xs">
                      {item.replacedBy.itemName} ({item.replacedBy.year})
                    </Badge>
                  </div>
                )}
              </div>
            )
          }
          return <span className="text-muted-foreground text-xs">-</span>
        },
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: (info) => {
          const item = info.row.original
          return (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => startEdit(item)}
                className="h-8"
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDelete(item.id, item.itemName)}
                className="h-8"
              >
                Delete
              </Button>
            </div>
          )
        },
      }),
    ],
    []
  )

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableGlobalFilter: true,
    globalFilterFn: (row, columnId, filterValue) => {
      const search = String(filterValue || "").toLowerCase().trim()
      if (!search) return true
      
      const item = row.original
      // Search across multiple fields
      const searchableFields = [
        item.itemName,
        item.category,
        item.subCategory,
        item.owner?.name,
        item.vendor?.name,
        item.location?.name,
        item.project?.name,
        item.program?.name,
        item.prNumber,
        item.poNumber,
      ].filter(Boolean).map(String).map(s => s.toLowerCase())
      
      const matched = searchableFields.some(field => field.includes(search))
      console.debug("[globalFilterFn] search=", search, "item=", item.itemName, "matched=", matched, "fields=", searchableFields)
      return matched
    },
    state: {
      globalFilter,
      columnVisibility,
    },
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: (updater) => {
      setColumnVisibility((old) => {
        const newState = typeof updater === 'function' ? updater(old) : updater
        // Save to localStorage immediately
        if (typeof window !== 'undefined') {
          localStorage.setItem('budget-items-column-visibility', JSON.stringify(newState))
        }
        return newState
      })
    },
    initialState: {
      pagination: {
        pageSize: 50,
      },
      columnVisibility,
    },
  })

  // Safely derive header groups and rows to avoid runtime errors during first render
  const headerGroupsSafe = useMemo(() => {
    try {
      const hg = (table as any)?.getHeaderGroups?.()
      return Array.isArray(hg) ? hg : []
    } catch {
      return []
    }
  }, [table])

  const rowsSafe = useMemo(() => {
    try {
      const rm = table?.getRowModel?.()
      const r = rm?.rows
      console.debug("[rowsSafe] total rows:", r?.length, "globalFilter:", globalFilter)
      return Array.isArray(r) ? r : []
    } catch (e) {
      console.error("[rowsSafe] error:", e)
      return []
    }
  }, [table])

  const CATEGORY_OPTIONS = [
    "AI Introduction & Business Applications",
    "Data Protection & Security Operations",
    "Enterprise Applications Implementation",
    "Enterprise Platform Deployment",
    "IT Infrastructure & connectivity",
    "OT Infrastructure & Connectivity",
    "Sustainability",
    "Tech Suite for User Experience",
    "Tech Suite for User Experience - Advanced",
  ]

  const handleExport = () => {
    const data = table.getFilteredRowModel().rows.map((row) => {
      const item = row.original
      return {
        Item: item.itemName,
        Year: item.year,
        Quarter: item.quarter || "",
        Category: item.category || "",
        Quantity: item.quantity || 1,
        Status: item.status,
        "% Complete": item.percentComplete || 0,
        Budget: item.budget || 0,
        Spent: item.spent || 0,
        Remaining: item.remaining || 0,
        Beneficiary: item.owner?.name || "",
        Vendor: item.vendor?.name || "",
      }
    })

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Budget Items")
    XLSX.writeFile(wb, `budget-items-${new Date().toISOString().split("T")[0]}.xlsx`)
  }

  const handleSaveEdit = useCallback(
    async (updatedData: Partial<BudgetItem>) => {
      if (!selectedItemForEdit) return
      try {
        console.log("Updating item:", selectedItemForEdit.id, updatedData)
        const res = await fetch(`/api/budget/items/${selectedItemForEdit.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedData),
        })
        const responseData = await res.json()
        if (!res.ok) {
          console.error("API error response:", responseData)
          throw new Error(responseData.error || "Failed to update item")
        }
        console.log("Update successful:", responseData)
        await loadItems()
        setIsEditModalOpen(false)
      } catch (error) {
        console.error("Failed to save:", error)
        throw error
      }
    },
    [selectedItemForEdit, loadItems]
  )

  const startEdit = (item: BudgetItem) => {
    setSelectedItemForEdit(item)
    setIsEditModalOpen(true)
  }

  const cancelEdit = () => {
    setSelectedItemForEdit(null)
    setIsEditModalOpen(false)
  }

  const handleDelete = useCallback(async (id: string, itemName: string) => {
    if (!confirm(`Are you sure you want to delete "${itemName}"? This action cannot be undone.`)) {
      return
    }

    try {
      const res = await fetch(`/api/budget/items/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed to delete item")
      await loadItems()
    } catch (error) {
      console.error("Failed to delete:", error)
      alert("Failed to delete item")
    }
  }, [loadItems])

  const handleCreate = async () => {
    if (!createPayload.itemName) return
    setCreating(true)
    try {
      const res = await fetch("/api/budget/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemName: createPayload.itemName,
          year: Number(createPayload.year),
          quarter: createPayload.quarter,
          status: createPayload.status,
          type: createPayload.type,
          subType: createPayload.subType,
          workClass: createPayload.workClass,
          category: createPayload.category || null,
          model: createPayload.brand || null,
          notes: createPayload.justification || null,
          quantity: Number(createPayload.quantity) || 1,
          unitCost: Number(createPayload.unitCost) || null,
          capex: Number(createPayload.capex) || 0,
          opex: Number(createPayload.opex) || 0,
          ownerId: createPayload.ownerId || null,
        }),
      })
      if (!res.ok) throw new Error("Failed to create item")
      // reload
      await loadItems()
      setCreatePayload({
        itemName: "",
        year: createPayload.year,
        quarter: 1,
        status: "NOT_STARTED",
        type: "BAU",
        subType: "BAU",
        workClass: "HARDWARE",
        category: "",
        brand: "",
        justification: "",
        quantity: 1,
        unitCost: 0,
        expenseType: "CAPEX",
        capex: 0,
        opex: 0,
        ownerId: "",
      })
    } catch (e) {
      console.error(e)
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen p-6" style={{ width: '90%', marginLeft: '5%', marginRight: '5%' }}>Loading...</div>
  }

  return (
    <div className="min-h-screen p-6" style={{ width: '90%', marginLeft: '5%', marginRight: '5%' }}>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Budget Items</h1>
        <div className="flex gap-2">
          <Link href="/dashboard">
            <Button variant="outline">Dashboard</Button>
          </Link>
          <Button variant="outline" onClick={() => loadItems()}>Refresh</Button>
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
            title={showFilters ? "Hide Filters" : "Show Filters"}
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowAddItem(!showAddItem)}
            title={showAddItem ? "Hide Add Item" : "Show Add Item"}
          >
            <Plus className="h-4 w-4 mr-2" />
            {showAddItem ? "Hide Add" : "Show Add"}
          </Button>
          <Button variant="outline" onClick={() => setFullPageView(true)}>
            <Maximize2 className="h-4 w-4 mr-2" />
            Full Page View
          </Button>
          <Button onClick={handleExport}>Export to Excel</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Main Content - Left Side */}
        <div className={showFilters ? "lg:col-span-4 space-y-6" : "lg:col-span-5 space-y-6"}>
      {showAddItem && (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Add Item</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowAddItem(false)}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
            <div className="md:col-span-2">
              <ItemNameCombobox
                placeholder="Search or type item name..."
                value={createPayload.itemName}
                onChange={(value) => {
                  setCreatePayload({ ...createPayload, itemName: value })
                }}
                onPriceChange={(price) => {
                  if (price !== null) {
                    const amount = price * createPayload.quantity
                    if (createPayload.expenseType === "CAPEX") {
                      setCreatePayload({ 
                        ...createPayload, 
                        unitCost: price,
                        capex: amount,
                        opex: 0
                      })
                    } else {
                      setCreatePayload({ 
                        ...createPayload, 
                        unitCost: price,
                        capex: 0,
                        opex: amount
                      })
                    }
                  }
                }}
              />
            </div>
            <Select value={String(createPayload.year)} onValueChange={(v) => setCreatePayload({ ...createPayload, year: Number(v) })}>
              <SelectTrigger className="w-full" title="Budget year">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2026">2026</SelectItem>
                <SelectItem value="2027">2027</SelectItem>
                <SelectItem value="2028">2028</SelectItem>
              </SelectContent>
            </Select>
            <Select value={String(createPayload.quarter ?? "1")} onValueChange={(v) => setCreatePayload({ ...createPayload, quarter: Number(v) })}>
              <SelectTrigger className="w-full" title="Planned quarter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Q1</SelectItem>
                <SelectItem value="2">Q2</SelectItem>
                <SelectItem value="3">Q3</SelectItem>
                <SelectItem value="4">Q4</SelectItem>
              </SelectContent>
            </Select>
            <Select value={createPayload.status} onValueChange={(v) => setCreatePayload({ ...createPayload, status: v })}>
              <SelectTrigger className="w-full" title="Initial status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NOT_STARTED">Not Started</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="PARTIAL">Partial</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={createPayload.type} onValueChange={(v) => setCreatePayload({ ...createPayload, type: v as any })}>
              <SelectTrigger className="w-full" title="Strategic type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BAU">BAU</SelectItem>
                <SelectItem value="NEOBAU">NeoBAU</SelectItem>
                <SelectItem value="REV">REV</SelectItem>
              </SelectContent>
            </Select>
            <Select value={createPayload.subType} onValueChange={(v) => setCreatePayload({ ...createPayload, subType: v as any })}>
              <SelectTrigger className="w-full" title="Sub-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BAU">BAU</SelectItem>
                <SelectItem value="NEOBAU">NeoBAU</SelectItem>
                <SelectItem value="SAP">SAP</SelectItem>
                <SelectItem value="MES">MES</SelectItem>
                <SelectItem value="SUSTAINABILITY">Sustainability</SelectItem>
                <SelectItem value="AI">AI</SelectItem>
              </SelectContent>
            </Select>
            <Select value={createPayload.workClass} onValueChange={(v) => setCreatePayload({ ...createPayload, workClass: v as any })}>
              <SelectTrigger className="w-full" title="Cost class">
                <SelectValue placeholder="Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="HARDWARE">Hardware</SelectItem>
                <SelectItem value="IMPLEMENTATION">Implementation</SelectItem>
                <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                <SelectItem value="MANPOWER">Manpower</SelectItem>
                <SelectItem value="SAP_SUPPORT">SAP Support</SelectItem>
                <SelectItem value="SUBSCRIPTION">Subscription</SelectItem>
              </SelectContent>
            </Select>
            <Select value={createPayload.category} onValueChange={(v) => setCreatePayload({ ...createPayload, category: v })}>
              <SelectTrigger className="w-full" title="Category">
                <SelectValue placeholder="Category (pick one)" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <BrandCombobox
              placeholder="Search or type brand name..."
              value={createPayload.brand}
              onChange={(value) => setCreatePayload({ ...createPayload, brand: value })}
            />
            <Select 
              value={createPayload.expenseType} 
              onValueChange={(v) => {
                const amount = createPayload.unitCost * createPayload.quantity
                if (v === "CAPEX") {
                  setCreatePayload({ 
                    ...createPayload, 
                    expenseType: "CAPEX",
                    capex: amount,
                    opex: 0
                  })
                } else {
                  setCreatePayload({ 
                    ...createPayload, 
                    expenseType: "OPEX",
                    capex: 0,
                    opex: amount
                  })
                }
              }}
            >
              <SelectTrigger className="w-full" title="Expense Type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CAPEX">CapEx</SelectItem>
                <SelectItem value="OPEX">OpEx</SelectItem>
              </SelectContent>
            </Select>
            <Input 
              type="number" 
              placeholder="Quantity" 
              title="Quantity" 
              value={String(createPayload.quantity)} 
              onChange={(e) => {
                const qty = Number(e.target.value) || 1
                const amount = createPayload.unitCost * qty
                if (createPayload.expenseType === "CAPEX") {
                  setCreatePayload({ 
                    ...createPayload, 
                    quantity: qty,
                    capex: amount,
                    opex: 0
                  })
                } else {
                  setCreatePayload({ 
                    ...createPayload, 
                    quantity: qty,
                    capex: 0,
                    opex: amount
                  })
                }
              }} 
            />
            <Input 
              type="number" 
              placeholder="Unit Cost" 
              title="Unit cost (auto-filled from catalog)" 
              value={String(createPayload.unitCost)} 
              onChange={(e) => {
                const cost = Number(e.target.value) || 0
                const amount = cost * createPayload.quantity
                if (createPayload.expenseType === "CAPEX") {
                  setCreatePayload({ 
                    ...createPayload, 
                    unitCost: cost,
                    capex: amount,
                    opex: 0
                  })
                } else {
                  setCreatePayload({ 
                    ...createPayload, 
                    unitCost: cost,
                    capex: 0,
                    opex: amount
                  })
                }
              }} 
            />
            <Select value={createPayload.ownerId || undefined} onValueChange={(v) => setCreatePayload({ ...createPayload, ownerId: v })}>
              <SelectTrigger className="w-full" title="Beneficiary">
                <SelectValue placeholder="Select Beneficiary (optional)" />
              </SelectTrigger>
              <SelectContent>
                {Array.isArray(owners) && owners.map((owner) => (
                  <SelectItem key={owner.id} value={owner.id}>
                    {owner.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input placeholder="Justification (why needed)" title="Business justification" value={createPayload.justification} onChange={(e) => setCreatePayload({ ...createPayload, justification: e.target.value })} className="md:col-span-2" />
            <Input 
              type="number" 
              placeholder="CapEx" 
              value={String(createPayload.capex)} 
              onChange={(e) => {
                const val = Number(e.target.value) || 0
                setCreatePayload({ ...createPayload, capex: val })
              }} 
              title="Capital expense (auto-calculated: Unit Cost × Quantity)" 
              disabled={createPayload.expenseType === "OPEX"}
              className={createPayload.expenseType === "OPEX" ? "opacity-50" : ""}
            />
            <Input 
              type="number" 
              placeholder="OpEx" 
              value={String(createPayload.opex)} 
              onChange={(e) => {
                const val = Number(e.target.value) || 0
                setCreatePayload({ ...createPayload, opex: val })
              }} 
              title="Operating expense (auto-calculated: Unit Cost × Quantity)" 
              disabled={createPayload.expenseType === "CAPEX"}
              className={createPayload.expenseType === "CAPEX" ? "opacity-50" : ""}
            />
            <div className="md:col-span-6 flex justify-end">
              <Button onClick={handleCreate} disabled={creating || !createPayload.itemName}>
                {creating ? "Creating..." : "Add Item"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Items</CardTitle>
            <div className="flex gap-2">
              {/* Column Visibility Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowColumnDialog(true)}
                className="w-32"
              >
                <Columns className="h-4 w-4 mr-2" />
                Columns
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Sticky Top Scrollbar */}
          <div 
            ref={topScrollbarRef}
            className="sticky top-0 z-20 overflow-x-auto bg-muted/50 border-b"
            style={{ 
              height: '17px', 
              scrollbarWidth: 'thin',
              scrollbarColor: 'auto'
            }}
            onScroll={(e) => {
              if (tableScrollRef.current) {
                tableScrollRef.current.scrollLeft = e.currentTarget.scrollLeft
              }
            }}
          >
            <div style={{ height: '1px' }} />
          </div>
          <div 
            ref={tableScrollRef} 
            className="overflow-x-auto"
            onScroll={(e) => {
              if (topScrollbarRef.current) {
                topScrollbarRef.current.scrollLeft = e.currentTarget.scrollLeft
              }
            }}
          >
            <table className="w-full">
              <thead className="sticky top-[17px] z-10 bg-background shadow-sm">
                {headerGroupsSafe.map((headerGroup: any) => (
                  <tr key={headerGroup.id} className="border-b">
                    {headerGroup.headers.map((header: any) => (
                      <th
                        key={header.id}
                        className="text-left p-4 font-semibold bg-background"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {rowsSafe.map((row: any) => (
                  <tr key={row.id} className="border-b hover:bg-muted/50">
                    {row.getVisibleCells().map((cell: any) => (
                      <td key={cell.id} className="p-4">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between p-4 border-t">
            <div className="text-sm text-muted-foreground">
              {(() => {
                const pagination = table.getState().pagination
                const total = table.getFilteredRowModel().rows.length
                const start = pagination.pageIndex * pagination.pageSize + 1
                const end = Math.min((pagination.pageIndex + 1) * pagination.pageSize, total)
                return (
                  <>Showing {start} to {end} of {total} items</>
                )
              })()}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
        </div>

        {/* Filters Sidebar - Right Side */}
        {showFilters && (
        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Filters</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowFilters(false)}
                  className="h-6 w-6"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Search</label>
                <Input
                  placeholder="Search items..."
                  value={globalFilter}
                  onChange={(e) => {
                    const v = e.target.value
                    console.debug("[searchInput] onChange", v)
                    setGlobalFilter(v)
                  }}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Year</label>
                <Select value={yearFilter} onValueChange={setYearFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2026">2026</SelectItem>
                    <SelectItem value="2027">2027</SelectItem>
                    <SelectItem value="2028">2028</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="NOT_STARTED">Not Started</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="PARTIAL">Partial</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Type</label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="BAU">BAU</SelectItem>
                    <SelectItem value="NEOBAU">NeoBAU</SelectItem>
                    <SelectItem value="REV">REV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Sub Type</label>
                <Select value={subTypeFilter} onValueChange={setSubTypeFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sub Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sub Types</SelectItem>
                    <SelectItem value="BAU">BAU</SelectItem>
                    <SelectItem value="NEOBAU">NeoBAU</SelectItem>
                    <SelectItem value="SAP">SAP</SelectItem>
                    <SelectItem value="MES">MES</SelectItem>
                    <SelectItem value="SUSTAINABILITY">Sustainability</SelectItem>
                    <SelectItem value="AI">AI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Class</label>
                <Select value={workClassFilter} onValueChange={setWorkClassFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    <SelectItem value="HARDWARE">Hardware</SelectItem>
                    <SelectItem value="IMPLEMENTATION">Implementation</SelectItem>
                    <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                    <SelectItem value="MANPOWER">Manpower</SelectItem>
                    <SelectItem value="SAP_SUPPORT">SAP Support</SelectItem>
                    <SelectItem value="SUBSCRIPTION">Subscription</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {CATEGORY_OPTIONS.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Beneficiary</label>
                <Select value={ownerFilter} onValueChange={setOwnerFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Beneficiary" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Beneficiaries</SelectItem>
                    {Array.isArray(owners) && owners.map((owner) => (
                      <SelectItem key={owner.id} value={owner.id}>
                        {owner.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Vendor/Brand</label>
                <Select value={vendorFilter} onValueChange={setVendorFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Vendor/Brand" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Vendors</SelectItem>
                    {Array.isArray(vendors) && vendors.map((vendor) => (
                      <SelectItem key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
        )}
      </div>

      {/* Show Filters Button - When Hidden */}
      {!showFilters && (
        <div className="fixed bottom-8 right-8 z-50">
          <Button
            onClick={() => setShowFilters(true)}
            className="shadow-lg"
            size="lg"
          >
            <Filter className="h-5 w-5 mr-2" />
            Show Filters
          </Button>
        </div>
      )}

      {/* Column Visibility Dialog */}
      <Dialog open={showColumnDialog} onOpenChange={setShowColumnDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Column Visibility</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="flex gap-2 pb-2 border-b">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  table.toggleAllColumnsVisible(true)
                  // Update state and save to localStorage
                  const allVisible: VisibilityState = {}
                  table.getAllColumns().forEach(col => {
                    if (col.getCanHide() && col.id !== 'actions') {
                      allVisible[col.id] = true
                    }
                  })
                  setColumnVisibility(allVisible)
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('budget-items-column-visibility', JSON.stringify(allVisible))
                  }
                }}
              >
                Show All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  table.toggleAllColumnsVisible(false)
                  // Update state and save to localStorage
                  const allHidden: VisibilityState = {}
                  table.getAllColumns().forEach(col => {
                    if (col.getCanHide() && col.id !== 'actions') {
                      allHidden[col.id] = false
                    }
                  })
                  setColumnVisibility(allHidden)
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('budget-items-column-visibility', JSON.stringify(allHidden))
                  }
                }}
              >
                Hide All
              </Button>
            </div>
            <div className="space-y-2">
              {table.getAllColumns()
                .filter(column => column.getCanHide() && column.id !== 'actions')
                .map(column => {
                  const header = typeof column.columnDef.header === 'string' 
                    ? column.columnDef.header 
                    : column.id
                  return (
                    <label
                      key={column.id}
                      className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-muted rounded"
                    >
                      <input
                        type="checkbox"
                        checked={column.getIsVisible()}
                        onChange={(e) => {
                          column.getToggleVisibilityHandler()(e)
                          // Force immediate update by toggling visibility
                          const newVisibility = { ...columnVisibility }
                          newVisibility[column.id] = e.target.checked
                          setColumnVisibility(newVisibility)
                        }}
                        className="rounded w-4 h-4"
                      />
                      <span className="text-sm">{header}</span>
                    </label>
                  )
                })}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Full Page View Dialog */}
      <Dialog open={fullPageView} onOpenChange={setFullPageView}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0">
          <DialogHeader className="p-6 border-b">
            <DialogTitle>Budget Items - Full Page View</DialogTitle>
          </DialogHeader>
          <div className="overflow-auto p-6 h-[calc(95vh-120px)]">
            <Card>
              <CardContent className="p-0">
                {/* Sticky Top Scrollbar for Full Page */}
                <div 
                  className="sticky top-0 z-10 overflow-x-auto bg-muted/50 border-b"
                  style={{ 
                    height: '17px', 
                    scrollbarWidth: 'thin'
                  }}
                  ref={(el) => {
                    if (el && tableScrollRef.current) {
                      el.scrollLeft = tableScrollRef.current.scrollLeft
                      el.onscroll = () => {
                        if (tableScrollRef.current) {
                          tableScrollRef.current.scrollLeft = el.scrollLeft
                        }
                      }
                    }
                  }}
                >
                  <div style={{ height: '1px', minWidth: '2000px' }} />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="sticky top-0 z-10 bg-background shadow-sm">
                      {headerGroupsSafe.map((headerGroup: any) => (
                        <tr key={headerGroup.id} className="border-b">
                          {headerGroup.headers.map((header: any) => (
                            <th
                              key={header.id}
                              className="text-left p-4 font-semibold bg-background"
                            >
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                            </th>
                          ))}
                        </tr>
                      ))}
                    </thead>
                    <tbody>
                      {rowsSafe.map((row: any) => (
                        <tr key={row.id} className="border-b hover:bg-muted/50">
                          {row.getVisibleCells().map((cell: any) => (
                            <td key={cell.id} className="p-4">
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-between p-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    {(() => {
                      const pagination = table.getState().pagination
                      const total = table.getFilteredRowModel().rows.length
                      const start = pagination.pageIndex * pagination.pageSize + 1
                      const end = Math.min((pagination.pageIndex + 1) * pagination.pageSize, total)
                      return (
                        <>Showing {start} to {end} of {total} items</>
                      )
                    })()}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Item Modal */}
      <EditItemModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        item={selectedItemForEdit}
        onSave={handleSaveEdit}
        owners={owners}
        allItems={items.map(i => ({ id: i.id, itemName: i.itemName, year: i.year }))}
      />
    </div>
  )
}

