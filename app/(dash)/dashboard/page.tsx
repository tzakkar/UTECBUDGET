"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell } from "recharts"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FFC658", "#FF7C7C"]

export default function DashboardPage() {
  const [year, setYear] = useState<number>(2025)
  const [quarter, setQuarter] = useState<string>("all")
  const [kpis, setKpis] = useState<any>(null)
  const [rollups, setRollups] = useState<any[]>([])
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch rollups
      const rollupParams = new URLSearchParams({
        year: year.toString(),
      })
      if (quarter !== "all") {
        rollupParams.append("quarter", quarter)
      }
      
      const rollupResponse = await fetch(`/api/budget/rollups?${rollupParams}`)
      const rollupData = await rollupResponse.json()

      // Fetch items for detailed analysis
      const itemsParams = new URLSearchParams({
        year: year.toString(),
        pageSize: "10000",
      })
      if (quarter !== "all") {
        itemsParams.append("quarter", quarter)
      }
      
      const itemsResponse = await fetch(`/api/budget/items?${itemsParams}`)
      const itemsData = await itemsResponse.json()

      // Calculate KPIs from rollups
      const totalBudget = rollupData.rollups.reduce((sum: number, r: any) => sum + r.allocated, 0)
      const totalCommitted = rollupData.rollups.reduce((sum: number, r: any) => sum + r.committed, 0)
      const totalSpent = rollupData.rollups.reduce((sum: number, r: any) => sum + r.spent, 0)
      const totalRemaining = totalBudget - totalSpent
      const executionPct = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

      setKpis({
        totalBudget,
        totalCommitted,
        totalSpent,
        totalRemaining,
        executionPct,
      })

      setRollups(rollupData.rollups)
      setItems(itemsData.items || [])
    } catch (error) {
      console.error("Failed to load dashboard:", error)
    } finally {
      setLoading(false)
    }
  }, [year, quarter])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  // Prepare chart data
  const quarterData = rollups.reduce((acc: any, r: any) => {
    const key = r.quarter || 0
    if (!acc[key]) {
      acc[key] = { quarter: key, allocated: 0, committed: 0, spent: 0 }
    }
    acc[key].allocated += r.allocated
    acc[key].committed += r.committed
    acc[key].spent += r.spent
    return acc
  }, {})

  const chartData = Object.values(quarterData).sort((a: any, b: any) => a.quarter - b.quarter)

  // Spending by Type
  const spendingByType = items.reduce((acc: any, item: any) => {
    const type = item.type || "Unspecified"
    if (!acc[type]) {
      acc[type] = { name: type, budget: 0, spent: 0, count: 0 }
    }
    acc[type].budget += Number(item.budget || 0)
    acc[type].spent += Number(item.spent || 0)
    acc[type].count += 1
    return acc
  }, {})
  const typeChartData = Object.values(spendingByType)

  // Spending by Category
  const spendingByCategory = items.reduce((acc: any, item: any) => {
    const category = item.category || "Uncategorized"
    if (!acc[category]) {
      acc[category] = { name: category, budget: 0, spent: 0, count: 0 }
    }
    acc[category].budget += Number(item.budget || 0)
    acc[category].spent += Number(item.spent || 0)
    acc[category].count += 1
    return acc
  }, {})
  const categoryChartData = Object.values(spendingByCategory).sort((a: any, b: any) => b.spent - a.spent).slice(0, 8)

  // Top 10 Items by Budget
  const topItems = items
    .sort((a: any, b: any) => Number(b.budget || 0) - Number(a.budget || 0))
    .slice(0, 10)
    .map(item => ({
      name: item.itemName.substring(0, 20),
      budget: Number(item.budget || 0),
      spent: Number(item.spent || 0),
    }))

  // Budget Variance
  const variance = items.reduce((acc: any, item: any) => {
    const budget = Number(item.budget || 0)
    const spent = Number(item.spent || 0)
    const diff = budget - spent
    
    if (diff > 0) {
      acc.under += diff
    } else if (diff < 0) {
      acc.over += Math.abs(diff)
    }
    return acc
  }, { under: 0, over: 0 })

  const varianceData = [
    { name: "Under Budget", value: variance.under },
    { name: "Over Budget", value: variance.over },
  ]

  // Spending by Beneficiary
  const spendingByBeneficiary = items
    .filter((item: any) => item.owner)
    .reduce((acc: any, item: any) => {
      const beneficiary = item.owner?.name || "Unassigned"
      if (!acc[beneficiary]) {
        acc[beneficiary] = { name: beneficiary, spent: 0, count: 0 }
      }
      acc[beneficiary].spent += Number(item.spent || 0)
      acc[beneficiary].count += 1
      return acc
    }, {})
  const beneficiaryChartData = Object.values(spendingByBeneficiary)
    .sort((a: any, b: any) => b.spent - a.spent)
    .slice(0, 8)

  if (loading) {
    return <div className="container mx-auto p-8">Loading...</div>
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Budget Dashboard</h1>
        <div className="flex gap-4">
          <Select value={year.toString()} onValueChange={(v) => setYear(parseInt(v))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2026">2026</SelectItem>
              <SelectItem value="2027">2027</SelectItem>
              <SelectItem value="2028">2028</SelectItem>
            </SelectContent>
          </Select>
          <Select value={quarter} onValueChange={setQuarter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Quarters</SelectItem>
              <SelectItem value="1">Q1</SelectItem>
              <SelectItem value="2">Q2</SelectItem>
              <SelectItem value="3">Q3</SelectItem>
              <SelectItem value="4">Q4</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Budget</CardDescription>
            <CardTitle className="text-2xl">
              ${(kpis?.totalBudget || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Committed</CardDescription>
            <CardTitle className="text-2xl">
              ${(kpis?.totalCommitted || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Spent</CardDescription>
            <CardTitle className="text-2xl">
              ${(kpis?.totalSpent || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Remaining</CardDescription>
            <CardTitle className="text-2xl">
              ${(kpis?.totalRemaining || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Execution %</CardDescription>
            <CardTitle className="text-2xl">
              {(kpis?.executionPct || 0).toFixed(1)}%
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Status Breakdown */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {rollups.filter((r: any) => r.status === "COMPLETED").reduce((sum, r) => sum + r.itemCount, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {rollups.filter((r: any) => r.status === "PARTIAL").reduce((sum, r) => sum + r.itemCount, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Partial</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {rollups.filter((r: any) => r.status === "IN_PROGRESS").reduce((sum, r) => sum + r.itemCount, 0)}
              </div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {rollups.filter((r: any) => r.status === "NOT_STARTED").reduce((sum, r) => sum + r.itemCount, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Not Started</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Budget vs Committed vs Spent by Quarter</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="quarter" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="allocated" fill="#8884d8" name="Allocated" />
                <Bar dataKey="committed" fill="#82ca9d" name="Committed" />
                <Bar dataKey="spent" fill="#ffc658" name="Spent" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cumulative Spend vs Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="quarter" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="allocated" stackId="1" stroke="#8884d8" fill="#8884d8" name="Allocated" />
                <Area type="monotone" dataKey="spent" stackId="2" stroke="#82ca9d" fill="#82ca9d" name="Spent" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Budget Variance and Spending by Type */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Budget Variance Analysis</CardTitle>
            <CardDescription>Items under vs over budget</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={varianceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: $${value.toLocaleString()}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill="#82CA9D" />
                  <Cell fill="#FF8042" />
                </Pie>
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Spending by Type</CardTitle>
            <CardDescription>Budget allocation by work type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={typeChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="budget" fill="#8884d8" name="Budget" />
                <Bar dataKey="spent" fill="#82ca9d" name="Spent" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Category and Beneficiary Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Top Categories by Spending</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="spent" fill="#82ca9d" name="Spent" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Spending by Beneficiary</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={beneficiaryChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="spent" fill="#ffc658" name="Spent" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Items */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Items by Budget</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topItems}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="budget" fill="#8884d8" name="Budget" />
              <Bar dataKey="spent" fill="#82ca9d" name="Spent" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

