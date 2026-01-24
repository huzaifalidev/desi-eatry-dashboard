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

interface PurchaseFormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PurchaseFormDrawer({ open, onOpenChange }: PurchaseFormDrawerProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [item, setItem] = useState('')
  const [quantity, setQuantity] = useState('')
  const [unit, setUnit] = useState('kg')
  const [cost, setCost] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!date || !item || !quantity || !cost) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      toast.success('Purchase recorded successfully')
      setDate(new Date().toISOString().split('T')[0])
      setItem('')
      setQuantity('')
      setUnit('kg')
      setCost('')
      onOpenChange(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Record Purchase</SheetTitle>
          <SheetDescription>Add a new purchase record</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-6">
          <div className="space-y-2">
            <Label htmlFor="date">Purchase Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="item">Item Name</Label>
            <Input
              id="item"
              placeholder="e.g., Basmati Rice"
              value={item}
              onChange={(e) => setItem(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                disabled={isLoading}
                step="0.01"
                min="0"
              />
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

            <div className="space-y-2">
              <Label htmlFor="cost">Cost (Rs)</Label>
              <Input
                id="cost"
                type="number"
                placeholder="0"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
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
              {isLoading ? 'Recording...' : 'Record Purchase'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
