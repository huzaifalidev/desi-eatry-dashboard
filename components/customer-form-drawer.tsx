// components/customer-form-drawer.tsx
'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from './ui/sheet' // <-- updated import
import { Spinner } from './ui/spinner'
import { Customer } from '@/lib/types'

interface CustomerFormDrawerProps {
  customer?: Partial<Customer>
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (customer: Partial<Customer>) => void // callback to save new/updated customer
}

export function CustomerFormDrawer({
  customer,
  open,
  onOpenChange,
  onSave,
}: CustomerFormDrawerProps) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const sheetRef = useRef<HTMLDivElement>(null)
  const startY = useRef(0)
  const currentTranslate = useRef(0)

  // Initialize form when customer changes
  useEffect(() => {
    if (customer) {
      setFirstName(customer.firstName || '')
      setLastName(customer.lastName || '')
      setPhone(customer.phone || '')
      setAddress(customer.address || '')
    } else {
      setFirstName('')
      setLastName('')
      setPhone('')
      setAddress('')
    }
  }, [customer])

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

    if (!firstName || !phone) {
      toast.error('Please fill required fields')
      return
    }

    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      const customerToSave: Partial<Customer> = {
        _id: customer?._id,
        firstName,
        lastName,
        phone,
        address,
      }
      onSave(customerToSave)
      onOpenChange(false)

      // Clear form fields
      setFirstName('')
      setLastName('')
      setPhone('')
      setAddress('')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Floating Add Button */}
      {!customer && (
        <Button
          className="fixed bottom-6 right-6 z-50 flex items-center justify-center rounded-full shadow-lg"
          size="icon"
          onClick={() => onOpenChange(true)}
        >
          <Plus className="h-5 w-5" />
        </Button>
      )}

      {/* Sheet */}
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          ref={sheetRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          side="bottom"
          className="
            px-4 py-6 rounded-t-lg
            md:max-h-none md:overflow-visible
            max-h-[90svh] overflow-y-auto
            pb-[env(safe-area-inset-bottom)]
          "
        >
          <div className="flex items-center justify-center mb-0">
            <div className="w-30 h-2.5 dark:bg-zinc-800 rounded-full" />
          </div>
          <SheetHeader className='flex items-center justify-center mt-0 mb-4'>
            <SheetTitle>{customer ? 'Update Customer' : 'Add New Customer'}</SheetTitle>
            <SheetDescription>
              {customer ? 'Update customer information' : 'Create a new customer record'}
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            {/* First Name & Last Name in one row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="e.g., Huzaifa"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="e.g., Ali"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Address & Phone in one row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address">Customer Address</Label>
                <Input
                  id="address"
                  placeholder="e.g., Flat 4, Building 12, Street 34, City"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="e.g., +92 300 1234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Buttons */}
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
                {isLoading ? <><Spinner /> Saving...</> : customer ? 'Update Customer' : 'Add Customer'}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </>
  )
}