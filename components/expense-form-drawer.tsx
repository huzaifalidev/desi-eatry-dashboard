'use client'

import React, { useState, useRef, useEffect, useMemo } from 'react'
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from './ui/spinner'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'

interface ExpenseFormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item?: {
    _id: string
    type: string
    item: string
    date: string
    quantity: number
    unitPrice: number
    totalAmount: number
    notes?: string
  } | null
  onSubmit: (expenseData: {
    type: string
    item: string
    date: string
    quantity: number | string
    unitPrice: number | string
    notes?: string
  }) => void
}

export function ExpenseFormDrawer({
  open,
  onOpenChange,
  item,
  onSubmit,
}: ExpenseFormDrawerProps) {
  const [type, setType] = useState('expense')
  const [itemName, setItemName] = useState('')
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [quantity, setQuantity] = useState('')
  const [unitPrice, setUnitPrice] = useState('')
  const [notes, setNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const sheetRef = useRef<HTMLDivElement>(null)
  const startY = useRef(0)
  const currentTranslate = useRef(0)

  // Initialize form when editing
  useEffect(() => {
    if (item) {
      setType(item.type || 'expense')
      setItemName(item.item || '')
      setDate(item.date ? new Date(item.date) : undefined)
      setQuantity(String(item.quantity || ''))
      setUnitPrice(String(item.unitPrice || ''))
      setNotes(item.notes || '')
    } else {
      setType('expense')
      setItemName('')
      setDate(undefined)
      setQuantity('')
      setUnitPrice('')
      setNotes('')
    }
  }, [item, open])

  const normalizeDate = (value?: Date | null) =>
    value ? value.toISOString().split('T')[0] : ''

  const hasChanges = useMemo(() => {
    if (!item) return true
    const original = {
      type: item.type || 'expense',
      item: item.item || '',
      date: item.date ? item.date.split('T')[0] : '',
      quantity: String(item.quantity ?? ''),
      unitPrice: String(item.unitPrice ?? ''),
      notes: item.notes || '',
    }
    const current = {
      type,
      item: itemName,
      date: normalizeDate(date),
      quantity,
      unitPrice,
      notes,
    }
    return (
      original.type !== current.type ||
      original.item !== current.item ||
      original.date !== current.date ||
      original.quantity !== current.quantity ||
      original.unitPrice !== current.unitPrice ||
      original.notes !== current.notes
    )
  }, [item, type, itemName, date, quantity, unitPrice, notes])

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
    if (!itemName || !date || !quantity || !unitPrice) {
      toast.error('Please fill in all required fields')
      return
    }
    if (item && !hasChanges) {
      toast.info('No changes to update')
      return
    }

    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 300)) // simulate delay
      onSubmit({
        type,
        item: itemName,
        date: date.toISOString().split('T')[0], // Convert to YYYY-MM-DD format
        quantity: parseFloat(quantity),
        unitPrice: parseFloat(unitPrice),
        notes,
      })

      toast.success(item ? 'Expense updated' : 'Expense added')
      onOpenChange(false)
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate total amount
  const totalAmount =
    (parseFloat(quantity) || 0) * (parseFloat(unitPrice) || 0)

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
          <SheetTitle>{item ? 'Edit Expense' : 'Add New Expense'}</SheetTitle>
          <SheetDescription>
            {item ? 'Update expense details' : 'Create a new expense entry'}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Type and Item Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Expense Type</Label>
              <Select value={type} onValueChange={setType} disabled={isLoading}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inventory">Inventory</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="item">Item Name</Label>
              <Input
                id="item"
                placeholder="e.g., Rice, Oil"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  disabled={isLoading}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? date.toLocaleDateString() : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={isLoading}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Quantity and Unit Price Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                step="0.01"
                placeholder="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unitPrice">Unit Price (Rs)</Label>
              <Input
                id="unitPrice"
                type="number"
                step="0.01"
                placeholder="0"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Total Amount (Read-only) */}
          {quantity && unitPrice && (
            <div className="bg-muted p-3 rounded-lg border">
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="text-2xl font-bold">Rs {totalAmount.toFixed(0)}</p>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isLoading}
              rows={3}
            />
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
            <Button
              type="submit"
              disabled={
                isLoading ||
                !itemName ||
                !date ||
                !quantity ||
                !unitPrice ||
                (item ? !hasChanges : false)
              }
            >
              {isLoading ? (
                <>
                  <Spinner /> Saving...
                </>
              ) : item ? (
                'Update Expense'
              ) : (
                'Add Expense'
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
