'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from './ui/drawer'
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

  const drawerRef = useRef<HTMLDivElement>(null)
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
    if (!drawerRef.current) return
    const deltaY = e.touches[0].clientY - startY.current
    if (deltaY > 0) {
      drawerRef.current.style.transform = `translateY(${deltaY}px)`
      currentTranslate.current = deltaY
    }
  }

  const handleTouchEnd = () => {
    if (!drawerRef.current) return
    if (currentTranslate.current > 100) {
      onOpenChange(false)
    }
    drawerRef.current.style.transform = ''
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

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        ref={drawerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="h-auto max-h-[90vh] min-h-0 px-4 py-6 rounded-t-lg"
        data-vaul-drawer-direction="bottom"
      >
        <DrawerHeader>
          <DrawerTitle>{item ? 'Edit Menu Item' : 'Add New Menu Item'}</DrawerTitle>
          <DrawerDescription>
            {item ? 'Update menu item details' : 'Create a new menu item'}
          </DrawerDescription>
        </DrawerHeader>

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
      </DrawerContent>
    </Drawer>
  )
}
