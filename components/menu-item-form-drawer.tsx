'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from './ui/sheet'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Spinner } from './ui/spinner'

interface MenuItemFormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item?: {
    _id: string
    name: string
    half: string | number
    full: string | number
    unit: string
    status: string
  } | null
  onSubmit: (menuData: {
    id?: string
    name: string
    half: string
    full: string
    unit: string
    status: string
  }) => void
}

export function MenuItemFormDrawer({ open, onOpenChange, item, onSubmit }: MenuItemFormDrawerProps) {
  const [name, setName] = useState('')
  const [half, setHalf] = useState('')
  const [full, setFull] = useState('')
  const [unit, setUnit] = useState('plate')
  const [status, setStatus] = useState('active')
  const [isLoading, setIsLoading] = useState(false)

  const sheetRef = useRef<HTMLDivElement>(null)
  const startY = useRef(0)
  const currentTranslate = useRef(0)

  // Initialize form when editing
  useEffect(() => {
    if (item) {
      setName(item.name || '')
      setHalf(String(item.half || ''))
      setFull(String(item.full || ''))
      setUnit(item.unit || 'plate')
      setStatus(item.status || 'active')
    } else {
      setName('')
      setHalf('')
      setFull('')
      setUnit('plate')
      setStatus('active')
    }
  }, [item, open])

  // Touch drag handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!sheetRef.current) return
    const deltaY = e.touches[0].clientY - startY.current
    if (deltaY > 0) {
      sheetRef.current.style.transform = `translateY(${deltaY}px)`
      currentTranslate.current = deltaY
    }
  }

  const handleTouchEnd = () => {
    if (!sheetRef.current) return
    if (currentTranslate.current > 100) {
      onOpenChange(false)
    }
    sheetRef.current.style.transform = ''
    currentTranslate.current = 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !full) {
      toast.error('Please fill in required fields')
      return
    }

    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 300)) // simulate delay
      onSubmit({
        id: item?._id,
        name,
        half,
        full,
        unit,
        status,
      })

      toast.success(item ? 'Menu item updated' : 'Menu item added')
      onOpenChange(false)
    } finally {
      setIsLoading(false)
    }
  }

  const showHalfPrice = unit === 'plate' || unit === 'serving'

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        ref={sheetRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="max-h-[90vh] overflow-y-auto px-4 py-6 rounded-t-lg pb-[env(safe-area-inset-bottom)]"
      >
        {/* Handle icon */}
        <div className="flex items-center justify-center mb-0">
          <div className="w-12 h-1.5 bg-zinc-300 rounded-full" />
        </div>
        <SheetHeader className="mb-0 flex items-center justify-between">
          <SheetTitle>{item ? 'Edit Menu Item' : 'Add New Menu Item'}</SheetTitle>
          <SheetDescription>
            {item ? 'Update menu item details' : 'Create a new menu item'}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
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
              <Label htmlFor="unit">Unit</Label>
              <Select value={unit} onValueChange={setUnit} disabled={isLoading}>
                <SelectTrigger id="unit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="plate">Plate</SelectItem>
                  <SelectItem value="piece">Piece</SelectItem>
                  <SelectItem value="serving">Serving</SelectItem>
                  <SelectItem value="cup">Cup</SelectItem>
                  <SelectItem value="box">Box</SelectItem>
                  <SelectItem value="bottle">Bottle</SelectItem>
                  <SelectItem value="glass">Glass</SelectItem>
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
          </div>

          {/* Prices row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {showHalfPrice && (
              <div className="space-y-2">
                <Label htmlFor="half">Half Price (Rs)</Label>
                <Input
                  id="half"
                  type="text" // allow free typing
                  placeholder="0"
                  value={half}
                  onChange={(e) => {
                    // allow only digits and a single decimal
                    const val = e.target.value.replace(/[^0-9.]/g, '');
                    const parts = val.split('.');
                    if (parts.length > 2) {
                      setHalf(parts[0] + '.' + parts[1]); // ignore extra dots
                    } else {
                      setHalf(val);
                    }
                  }}
                  disabled={isLoading}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="full">Full Price (Rs)</Label>
              <Input
                id="full"
                type="text" // allow free typing
                placeholder="0"
                value={full}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9.]/g, '');
                  const parts = val.split('.');
                  if (parts.length > 2) {
                    setFull(parts[0] + '.' + parts[1]);
                  } else {
                    setFull(val);
                  }
                }}
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <><Spinner /> Saving...</> : item ? 'Update Item' : 'Add Item'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
