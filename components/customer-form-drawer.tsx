// components/customer-form-drawer.tsx
'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from './ui/drawer'
import { Spinner } from './ui/spinner'
import { mockCustomers } from '@/lib/mock-data'

interface Customer {
  id: number
  name: string
  phone: string
  address: string
}

interface CustomerFormDrawerProps {
  customer?: Customer
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (customer: Customer) => void // callback to save new/updated customer
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

  const drawerRef = useRef<HTMLDivElement>(null)
  const startY = useRef(0)
  const currentTranslate = useRef(0)

  // Initialize form when customer changes
  useEffect(() => {
    if (customer) {
      setFirstName(customer.firstName || '')
      setLastName(customer.lastName || '')
      setPhone(customer.phone)
      setAddress(customer.address)
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

    if (!firstName || !phone) {
      toast.error('Please fill required fields')
      return
    }

    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Build customer object (use existing id if editing)
      const customerToSave: Customer = {
        _id: customer?._id,
        firstName,
        lastName,
        phone,
        address,
        totalBilled: customer?.totalBilled ?? 0,
        totalPaid: customer?.totalPaid ?? 0,
        balance: customer?.balance ?? 0,
      }



      onSave(customerToSave)
      onOpenChange(false)
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

      {/* Drawer */}
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent
          ref={drawerRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="
    px-4 py-6 rounded-t-lg
    md:max-h-none md:overflow-visible
    max-h-[90svh] overflow-y-auto
    pb-[env(safe-area-inset-bottom)]
  "
          data-vaul-drawer-direction="bottom"
        >


          <DrawerHeader>
            <DrawerTitle>{customer ? 'Update Customer' : 'Add New Customer'}</DrawerTitle>
            <DrawerDescription>
              {customer ? 'Update customer information' : 'Create a new customer record'}
            </DrawerDescription>
          </DrawerHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
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
        </DrawerContent>
      </Drawer>
    </>
  )
}
