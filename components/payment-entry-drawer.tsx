'use client'

import { useState, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer'
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
  const [isLoading, setIsLoading] = useState(false)

  // ---------- swipe to close ----------
  const drawerRef = useRef<HTMLDivElement>(null)
  const startY = useRef(0)
  const currentTranslate = useRef(0)

  const handleTouchStart = (e: React.TouchEvent) =>
    (startY.current = e.touches[0].clientY)

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
    if (currentTranslate.current > 120) onOpenChange(false)
    drawerRef.current.style.transform = ''
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
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        ref={drawerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        data-vaul-drawer-direction="bottom"
        className="max-h-[90vh] overflow-y-auto px-4 py-6 rounded-t-lg"
      >
        <DrawerHeader>
          <DrawerTitle>Add Payment</DrawerTitle>
          <DrawerDescription>
            Record a payment for this customer
          </DrawerDescription>
        </DrawerHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label>Amount (Rs)</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
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
                <SelectItem value="online">Online
                </SelectItem>
                <SelectItem value="card">Card</SelectItem>
              </SelectContent>
            </Select>
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
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Spinner />} Record Payment
            </Button>
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  )
}
