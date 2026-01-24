'use client'

import React from "react"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

interface InventoryItemFormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  itemId?: string
}

export function InventoryItemFormDrawer({
  open,
  onOpenChange,
  itemId,
}: InventoryItemFormDrawerProps) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('Vegetables')
  const [stock, setStock] = useState('')
  const [unit, setUnit] = useState('kg')
  const [minStock, setMinStock] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !stock || !minStock) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      toast.success(itemId ? 'Inventory item updated' : 'Inventory item added')
      setName('')
      setCategory('Vegetables')
      setStock('')
      setUnit('kg')
      setMinStock('')
      onOpenChange(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{itemId ? 'Edit Inventory Item' : 'Add New Inventory Item'}</SheetTitle>
          <SheetDescription>
            {itemId ? 'Update inventory item details' : 'Create a new inventory item'}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-6">
          <div className="space-y-2">
            <Label htmlFor="name">Item Name</Label>
            <Input
              id="name"
              placeholder="e.g., Basmati Rice"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory} disabled={isLoading}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Vegetables">Vegetables</SelectItem>
                  <SelectItem value="Meat">Meat</SelectItem>
                  <SelectItem value="Grains">Grains</SelectItem>
                  <SelectItem value="Spices">Spices</SelectItem>
                  <SelectItem value="Dairy">Dairy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Select value={unit} onValueChange={setUnit} disabled={isLoading}>
                <SelectTrigger id="unit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">KG</SelectItem>
                  <SelectItem value="liter">Liter</SelectItem>
                  <SelectItem value="piece">Piece</SelectItem>
                  <SelectItem value="dozen">Dozen</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock">Current Stock</Label>
              <Input
                id="stock"
                type="number"
                placeholder="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                disabled={isLoading}
                step="0.01"
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minStock">Minimum Stock</Label>
              <Input
                id="minStock"
                type="number"
                placeholder="0"
                value={minStock}
                onChange={(e) => setMinStock(e.target.value)}
                disabled={isLoading}
                step="0.01"
                min="0"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : itemId ? 'Update Item' : 'Add Item'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
