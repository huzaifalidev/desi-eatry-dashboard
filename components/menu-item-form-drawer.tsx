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

interface MenuItemFormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  itemId?: string
}

export function MenuItemFormDrawer({ open, onOpenChange, itemId }: MenuItemFormDrawerProps) {
  const [name, setName] = useState('')
  const [half, setHalf] = useState('')
  const [full, setFull] = useState('')
  const [unit, setUnit] = useState('plate')
  const [status, setStatus] = useState('active')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !full) {
      toast.error('Please fill in required fields')
      return
    }

    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      toast.success(itemId ? 'Menu item updated' : 'Menu item added')
      setName('')
      setHalf('')
      setFull('')
      setUnit('plate')
      setStatus('active')
      onOpenChange(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{itemId ? 'Edit Menu Item' : 'Add New Menu Item'}</SheetTitle>
          <SheetDescription>
            {itemId ? 'Update menu item details' : 'Create a new menu item'}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-6">
          <div className="space-y-2">
            <Label htmlFor="name">Item Name</Label>
            <Input
              id="name"
              placeholder="e.g., Chicken Biryani"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="half">Half Price (Rs)</Label>
              <Input
                id="half"
                type="number"
                placeholder="0"
                value={half}
                onChange={(e) => setHalf(e.target.value)}
                disabled={isLoading}
                step="0.01"
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="full">Full Price (Rs)</Label>
              <Input
                id="full"
                type="number"
                placeholder="0"
                value={full}
                onChange={(e) => setFull(e.target.value)}
                disabled={isLoading}
                step="0.01"
                min="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="unit">Unit</Label>
            <Select value={unit} onValueChange={setUnit} disabled={isLoading}>
              <SelectTrigger id="unit">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="plate">Plate</SelectItem>
                <SelectItem value="glass">Glass</SelectItem>
                <SelectItem value="bowl">Bowl</SelectItem>
                <SelectItem value="serving">Serving</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus} disabled={isLoading}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
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
