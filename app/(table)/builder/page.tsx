"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type StagedItem = {
  itemName: string
  brand: string
  justification: string
  category: string
  type: "BAU" | "NEOBAU" | "REV"
  subType: "BAU" | "NEOBAU" | "SAP" | "MES" | "SUSTAINABILITY" | "AI"
  workClass: "HARDWARE" | "IMPLEMENTATION" | "MAINTENANCE" | "MANPOWER" | "SAP_SUPPORT" | "SUBSCRIPTION"
  qty: number
  capex: number
  opex: number
}

export default function BuilderPage() {
  const [year, setYear] = useState("2025")
  const [staged, setStaged] = useState<StagedItem[]>([])
  const [draft, setDraft] = useState<StagedItem>({
    itemName: "",
    brand: "",
    justification: "",
    category: "",
    type: "BAU",
    subType: "BAU",
    workClass: "HARDWARE",
    qty: 1,
    capex: 0,
    opex: 0,
  })
  const [saving, setSaving] = useState(false)

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

  const addToStage = () => {
    if (!draft.itemName) return
    setStaged((prev) => [...prev, { ...draft }])
    setDraft({ ...draft, itemName: "", brand: "", justification: "", category: "", qty: 1, capex: 0, opex: 0 })
  }

  const removeStaged = (idx: number) => {
    setStaged((prev) => prev.filter((_, i) => i !== idx))
  }

  const saveAll = async () => {
    if (staged.length === 0) return
    setSaving(true)
    try {
      for (const s of staged) {
        const res = await fetch("/api/budget/items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            year: Number(year),
            itemName: s.itemName,
            model: s.brand, // brand -> model
            notes: s.justification, // justification -> notes
            category: s.category,
            type: s.type,
            subType: s.subType,
            workClass: s.workClass,
            quantity: s.qty,
            capex: s.capex,
            opex: s.opex,
            status: "NOT_STARTED",
          }),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.error || "Failed to create item")
        }
      }
      setStaged([])
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Year Budget Builder</h1>
        <Select value={year} onValueChange={setYear}>
          <SelectTrigger className="w-32" title="Budget year">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2025">2025</SelectItem>
            <SelectItem value="2026">2026</SelectItem>
            <SelectItem value="2027">2027</SelectItem>
            <SelectItem value="2028">2028</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add Line</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            <Input placeholder="Item" title="Item name" value={draft.itemName} onChange={(e) => setDraft({ ...draft, itemName: e.target.value })} />
            <Input placeholder="Brand" title="Brand/model" value={draft.brand} onChange={(e) => setDraft({ ...draft, brand: e.target.value })} />
            <Select value={draft.category} onValueChange={(v) => setDraft({ ...draft, category: v })}>
              <SelectTrigger title="Category"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={draft.type} onValueChange={(v) => setDraft({ ...draft, type: v as any })}>
              <SelectTrigger title="Strategic type"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="BAU">BAU</SelectItem>
                <SelectItem value="NEOBAU">NeoBAU</SelectItem>
                <SelectItem value="REV">REV</SelectItem>
              </SelectContent>
            </Select>
            <Select value={draft.subType} onValueChange={(v) => setDraft({ ...draft, subType: v as any })}>
              <SelectTrigger title="Sub-type"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="BAU">BAU</SelectItem>
                <SelectItem value="NEOBAU">NeoBAU</SelectItem>
                <SelectItem value="SAP">SAP</SelectItem>
                <SelectItem value="MES">MES</SelectItem>
                <SelectItem value="SUSTAINABILITY">Sustainability</SelectItem>
                <SelectItem value="AI">AI</SelectItem>
              </SelectContent>
            </Select>
            <Select value={draft.workClass} onValueChange={(v) => setDraft({ ...draft, workClass: v as any })}>
              <SelectTrigger title="Cost class"><SelectValue placeholder="Class" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="HARDWARE">Hardware</SelectItem>
                <SelectItem value="IMPLEMENTATION">Implementation</SelectItem>
                <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                <SelectItem value="MANPOWER">Manpower</SelectItem>
                <SelectItem value="SAP_SUPPORT">SAP Support</SelectItem>
                <SelectItem value="SUBSCRIPTION">Subscription</SelectItem>
              </SelectContent>
            </Select>
            <Input type="number" placeholder="Qty" title="Quantity" value={String(draft.qty)} onChange={(e) => setDraft({ ...draft, qty: Number(e.target.value) })} />
            <Input type="number" placeholder="CapEx (e.g. 12000)" value={String(draft.capex)} onChange={(e) => setDraft({ ...draft, capex: Number(e.target.value) })} title="Capital expense for this item" />
            <Input type="number" placeholder="OpEx (monthly/annual)" value={String(draft.opex)} onChange={(e) => setDraft({ ...draft, opex: Number(e.target.value) })} title="Operating expense for this item" />
            <div className="md:col-span-6">
              <Input placeholder="Justification (why needed)" title="Business justification" value={draft.justification} onChange={(e) => setDraft({ ...draft, justification: e.target.value })} />
            </div>
            <div className="md:col-span-6 flex justify-end">
              <Button onClick={addToStage} disabled={!draft.itemName}>Add to List</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Staged Items ({staged.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {staged.length === 0 ? (
            <div className="text-sm text-muted-foreground">No items yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left">Item</th>
                    <th className="p-2 text-left">Brand</th>
                    <th className="p-2 text-left">Type</th>
                    <th className="p-2 text-left">SubType</th>
                    <th className="p-2 text-left">Class</th>
                    <th className="p-2 text-right">Qty</th>
                    <th className="p-2 text-right">CapEx</th>
                    <th className="p-2 text-right">OpEx</th>
                    <th className="p-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {staged.map((s, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-2">{s.itemName}</td>
                      <td className="p-2">{s.brand}</td>
                      <td className="p-2">{s.type}</td>
                      <td className="p-2">{s.subType}</td>
                      <td className="p-2">{s.workClass}</td>
                      <td className="p-2 text-right">{s.qty}</td>
                      <td className="p-2 text-right">{s.capex}</td>
                      <td className="p-2 text-right">{s.opex}</td>
                      <td className="p-2 text-right">
                        <Button variant="outline" onClick={() => removeStaged(i)}>Remove</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex justify-end mt-4">
            <Button onClick={saveAll} disabled={saving || staged.length === 0}>
              {saving ? "Saving..." : "Commit to Budget"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


