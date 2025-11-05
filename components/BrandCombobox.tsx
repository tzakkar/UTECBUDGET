"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { searchBrands } from "@/lib/brand-catalog"

interface BrandComboboxProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function BrandCombobox({ value, onChange, placeholder = "Search or type brand name..." }: BrandComboboxProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState(value)
  const containerRef = useRef<HTMLDivElement>(null)
  const filteredBrands = searchBrands(searchQuery).slice(0, 10) // Limit to 10 results

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

  const handleSelect = (brandName: string) => {
    onChange(brandName)
    setSearchQuery(brandName)
    setOpen(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setSearchQuery(newValue)
    onChange(newValue) // Allow free text entry
    setOpen(newValue.length > 0 && filteredBrands.length > 0)
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <Input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={handleInputChange}
        onFocus={() => setOpen(searchQuery.length > 0 && filteredBrands.length > 0)}
        className="w-full"
      />
      {open && filteredBrands.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredBrands.map((brand) => (
            <div
              key={brand}
              onClick={() => handleSelect(brand)}
              className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-200 dark:border-gray-700 last:border-b-0"
            >
              <div className="font-medium text-gray-900 dark:text-gray-100">{brand}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

