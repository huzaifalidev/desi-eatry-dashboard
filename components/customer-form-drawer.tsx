'use client'

import React, { useState, useRef } from 'react'
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
  DrawerClose,
} from './ui/drawer'
import { Spinner } from './ui/spinner'

interface CustomerFormDrawerProps {
  customerId?: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CustomerFormDrawer({
  customerId,
  open,
  onOpenChange,
}: CustomerFormDrawerProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const drawerRef = useRef<HTMLDivElement>(null)
  const startY = useRef(0)
  const currentTranslate = useRef(0)

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
      onOpenChange(false) // <-- use prop instead of internal state
    }
    drawerRef.current.style.transform = ''
    currentTranslate.current = 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !phone) {
      toast.error('Please fill in all fields')
      return
    }

    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      toast.success(customerId ? 'Customer updated' : 'Customer added')
      setName('')
      setPhone('')
      onOpenChange(false) // <-- use prop
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Floating Add Button */}
      {!customerId && (
        <Button
          className="fixed bottom-6 right-6 z-50 flex items-center justify-center rounded-full shadow-lg"
          size="icon"
          onClick={() => onOpenChange(true)} // <-- use prop
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
          className="max-h-[90vh] overflow-y-auto px-4 py-6 rounded-t-lg"
          data-vaul-drawer-direction="bottom"
        >
          <DrawerHeader>
            <DrawerTitle>{customerId ? 'Edit Customer' : 'Add New Customer'}</DrawerTitle>
            <DrawerDescription>
              {customerId ? 'Update customer information' : 'Create a new customer record'}
            </DrawerDescription>
            <DrawerClose asChild>
              <Button
                variant="ghost"
                className="absolute top-2 right-2"
                disabled={isLoading}
              >
                X
              </Button>
            </DrawerClose>
          </DrawerHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Customer Name</Label>
              <Input
                id="name"
                placeholder="e.g., Dr Arsalan"
                value={name}
                onChange={(e) => setName(e.target.value)}
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
                onClick={() => onOpenChange(false)} // <-- use prop
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Spinner /> : customerId ? 'Update Customer' : 'Add Customer'}
              </Button>
            </div>
          </form>
        </DrawerContent>
      </Drawer>
    </>
  )
}
