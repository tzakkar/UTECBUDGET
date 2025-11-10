"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface BudgetItem {
  id: string
  itemName: string
  status: string
  percentComplete: number | null
  quantity: number | null
  budget: number | null
  spent: number | null
  committed: number | null
  prNumber: string | null
  poNumber: string | null
  ownerId: string | null
  vendorId: string | null
  replacesItemId: string | null
  replacedById: string | null
  owner?: { id: string; name: string } | null
  vendor?: { id: string; name: string } | null
}

interface EditItemModalProps {
  item: BudgetItem | null
  isOpen: boolean
  owners: Array<{ id: string; name: string }>
  vendors: Array<{ id: string; name: string }>
  allItems?: Array<{ id: string; itemName: string; year: number }>
  onClose: () => void
  onSave: (updatedItem: Partial<BudgetItem>) => Promise<void>
}

export function EditItemModal({
  item,
  isOpen,
  owners,
  vendors,
  allItems,
  onClose,
  onSave,
}: EditItemModalProps) {
  const [formData, setFormData] = useState<Partial<BudgetItem>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (item) {
      setFormData({
        status: item.status,
        percentComplete: item.percentComplete,
        quantity: item.quantity,
        budget: item.budget,
        spent: item.spent,
        committed: item.committed,
        prNumber: item.prNumber || "",
        poNumber: item.poNumber || "",
        ownerId: item.ownerId || "",
        vendorId: item.vendorId || "",
        replacesItemId: item.replacesItemId || "",
        replacedById: item.replacedById || "",
      })
      setError("")
    }
  }, [item, isOpen])

  const handleSave = async () => {
    try {
      setError("")
      
      // TODO: Temporarily disabled PR/PO validation for data upload
      // Validate PR/PO numbers if status is changing
      // const originalItem = item as BudgetItem
      // const wasNotStarted = originalItem?.status === "NOT_STARTED"
      // const isChangingStatus = formData.status && formData.status !== originalItem?.status
      // const newStatus = formData.status || originalItem?.status
      // 
      // if (wasNotStarted && isChangingStatus && newStatus !== "NOT_STARTED") {
      //   const hasPR = formData.prNumber?.toString().trim()
      //   const hasPO = formData.poNumber?.toString().trim()
      //   if (!hasPR && !hasPO) {
      //     setError("PR/PO number is required when changing status from 'Not Started'")
      //     return
      //   }
      // }
      //
      // // Validate PO number if completion >= 50%
      // const newPercentComplete = formData.percentComplete ?? originalItem?.percentComplete ?? 0
      // const hasPO = formData.poNumber?.toString().trim()
      // if (newPercentComplete >= 50 && !hasPO) {
      //   setError("PO number is required when completion is 50% or above")
      //   return
      // }

      // Prepare data - convert __NONE__ sentinel values to null
      const dataToSave = {
        status: formData.status,
        percentComplete: formData.percentComplete,
        quantity: formData.quantity,
        budget: formData.budget,
        spent: formData.spent,
        committed: formData.committed,
        prNumber: formData.prNumber && formData.prNumber !== "" ? formData.prNumber : null,
        poNumber: formData.poNumber && formData.poNumber !== "" ? formData.poNumber : null,
        ownerId: formData.ownerId && formData.ownerId !== "__NONE__" ? formData.ownerId : null,
        vendorId: formData.vendorId && formData.vendorId !== "__NONE__" ? formData.vendorId : null,
        replacesItemId: formData.replacesItemId && formData.replacesItemId !== "__NONE__" ? formData.replacesItemId : null,
        replacedById: formData.replacedById && formData.replacedById !== "__NONE__" ? formData.replacedById : null,
      }

      console.log("Sending data to API:", dataToSave)
      setIsSaving(true)
      await onSave(dataToSave)
      onClose()
    } catch (err) {
      console.error("Save error:", err)
      setError(err instanceof Error ? err.message : "Failed to save item")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit: {item?.itemName}</DialogTitle>
          <DialogDescription>
            Update the item details and save your changes
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3 text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Status */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Status</Label>
            <Select
              value={formData.status || "NOT_STARTED"}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NOT_STARTED">Not Started</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="PARTIAL">Partial</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Vendor */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Vendor</Label>
            <Select
              value={formData.vendorId || "__NONE__"}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, vendorId: value === "__NONE__" ? null : value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Vendor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__NONE__">None</SelectItem>
                {Array.isArray(vendors) &&
                  vendors.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* % Complete */}
          <div>
            <Label className="text-sm font-medium mb-2 block">% Complete</Label>
            <Input
              type="number"
              min="0"
              max="100"
              value={formData.percentComplete ?? 0}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  percentComplete: parseInt(e.target.value) || 0,
                }))
              }
            />
          </div>

          {/* Quantity */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Quantity</Label>
            <Input
              type="number"
              min="1"
              value={formData.quantity ?? 1}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  quantity: parseInt(e.target.value) || 1,
                }))
              }
            />
          </div>

          {/* Budget */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Budget</Label>
            <Input
              type="number"
              min="0"
              value={formData.budget ?? 0}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  budget: parseFloat(e.target.value) || 0,
                }))
              }
            />
          </div>

          {/* Spent */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Spent</Label>
            <Input
              type="number"
              min="0"
              value={formData.spent ?? 0}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  spent: parseFloat(e.target.value) || 0,
                }))
              }
            />
          </div>

          {/* Committed */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Committed</Label>
            <Input
              type="number"
              min="0"
              value={formData.committed ?? 0}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  committed: parseFloat(e.target.value) || 0,
                }))
              }
            />
          </div>

          {/* PR Number */}
          <div>
            <Label className="text-sm font-medium mb-2 block">PR Number</Label>
            <Input
              type="text"
              placeholder="e.g. U001432423"
              value={formData.prNumber ?? ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  prNumber: e.target.value.toUpperCase(),
                }))
              }
              style={{ textTransform: "uppercase" }}
            />
          </div>

          {/* PO Number */}
          <div>
            <Label className="text-sm font-medium mb-2 block">PO Number</Label>
            <Input
              type="text"
              placeholder="e.g. U001432423"
              value={formData.poNumber ?? ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  poNumber: e.target.value.toUpperCase(),
                }))
              }
              style={{ textTransform: "uppercase" }}
            />
          </div>

          {/* Beneficiary */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Beneficiary</Label>
            <Select
              value={formData.ownerId || "__NONE__"}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, ownerId: value === "__NONE__" ? null : value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Beneficiary" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__NONE__">None</SelectItem>
                {Array.isArray(owners) &&
                  owners.map((owner) => (
                    <SelectItem key={owner.id} value={owner.id}>
                      {owner.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Replaces Item */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Replaces Item</Label>
            <Select
              value={formData.replacesItemId || "__NONE__"}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, replacesItemId: value === "__NONE__" ? null : value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Replaces Item" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__NONE__">None</SelectItem>
                {Array.isArray(allItems) &&
                  allItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.itemName}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Replaced By */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Replaced By</Label>
            <Select
              value={formData.replacedById || "__NONE__"}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, replacedById: value === "__NONE__" ? null : value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Replaced By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__NONE__">None</SelectItem>
                {Array.isArray(allItems) &&
                  allItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.itemName}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
