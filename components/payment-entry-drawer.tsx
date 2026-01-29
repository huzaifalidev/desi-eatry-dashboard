'use client'

import { useState, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { CalendarIcon } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
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
import { Spinner } from '@/components/ui/spinner'
import { createPayment } from '@/redux/slices/payment-slice'
import type { AppDispatch } from '@/redux/store/store'
import { fetchCustomerById } from '@/redux/slices/customer-slice'

interface PaymentEntryDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customerId: string
}

export function PaymentEntryDrawer({
  open,
  onOpenChange,
  customerId,
}: PaymentEntryDrawerProps) {
  const dispatch = useDispatch<AppDispatch>()

  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('cash')
  const [paymentDate, setPaymentDate] = useState<Date | undefined>(new Date())
  const [isLoading, setIsLoading] = useState(false)

  // ---------- swipe to close ----------
  const sheetRef = useRef<HTMLDivElement>(null)
  const startY = useRef(0)
  const currentTranslate = useRef(0)

  const handleTouchStart = (e: React.TouchEvent) =>
    (startY.current = e.touches[0].clientY)

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
    if (currentTranslate.current > 120) onOpenChange(false)
    sheetRef.current.style.transform = ''
    currentTranslate.current = 0
  }

  // ---------- submit ----------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!amount || Number(amount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    try {
      setIsLoading(true)
      await dispatch(
        createPayment({
          customerId,
          amount: Number(amount),
          method,
        }),
      ).unwrap()
      toast.success(
        `Payment of Rs ${Number(amount).toLocaleString()} recorded`,
      )
      setAmount('')
      setMethod('cash')
      await dispatch(fetchCustomerById(customerId)).unwrap()
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err || 'Failed to record payment')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        ref={sheetRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        side="bottom"
        className="max-h-[90vh] overflow-y-auto px-4 py-6 rounded-t-lg pb-[env(safe-area-inset-bottom)]"
      >
        {/* Drawer handle */}
        <div className="flex items-center justify-center mb-0">
          <div className="w-12 h-1.5 bg-zinc-300 rounded-full" />
        </div>

        <SheetHeader className="mb-4 flex items-center justify-between">
          <SheetTitle>Add Payment</SheetTitle>
          <SheetDescription>Record a payment for this customer</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-2">
          {/* Payment Date */}
          <div className="space-y-2">
            <Label>Payment Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  disabled={isLoading}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {paymentDate ? paymentDate.toLocaleDateString() : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={paymentDate}
                  onSelect={setPaymentDate}
                  disabled={isLoading}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Amount (Rs)</Label>
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select
                value={method}
                onValueChange={setMethod}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !amount}>
              {isLoading && <Spinner />} Record Payment
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
