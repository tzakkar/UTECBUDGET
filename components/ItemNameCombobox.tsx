"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { searchCatalogItems, getCatalogItemPrice } from "@/lib/item-catalog"

interface ItemNameComboboxProps {
  value: string
  onChange: (value: string) => void
  onPriceChange?: (price: number | null) => void
  placeholder?: string
}

export function ItemNameCombobox({ value, onChange, onPriceChange, placeholder = "Search or type item name..." }: ItemNameComboboxProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState(value)
  const containerRef = useRef<HTMLDivElement>(null)
  const filteredItems = searchCatalogItems(searchQuery).slice(0, 10) // Limit to 10 results

  useEffect(() => {
    setSearchQuery(value)
  }, [value])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSelect = (itemName: string) => {
    onChange(itemName)
    setSearchQuery(itemName)
    setOpen(false)
    
    // Auto-fill price if callback provided
    if (onPriceChange) {
      const price = getCatalogItemPrice(itemName)
      onPriceChange(price)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setSearchQuery(newValue)
    onChange(newValue)
    setOpen(newValue.length > 0)
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <Input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={handleInputChange}
        onFocus={() => setOpen(searchQuery.length > 0)}
        className="w-full"
      />
      {open && filteredItems.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredItems.map((item) => (
            <div
              key={item.name}
              onClick={() => handleSelect(item.name)}
              className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-200 dark:border-gray-700 last:border-b-0"
            >
              <div className="font-medium text-gray-900 dark:text-gray-100">{item.name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                ${item.price.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

