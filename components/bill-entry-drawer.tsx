// components/bill-entry-drawer.tsx
'use client'

import { useState, useRef } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { mockCustomers, mockMenuItems } from '@/lib/mock-data'

interface BillEntryDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customerId?: string
}

export function BillEntryDrawer({
  open,
  onOpenChange,
  customerId,
}: BillEntryDrawerProps) {
  const [selectedCustomer, setSelectedCustomer] = useState(customerId || '')
  const [selectedMenu, setSelectedMenu] = useState('')
  const [selectedSize, setSelectedSize] = useState<'half' | 'full'>('full')
  const [quantity, setQuantity] = useState(1)
  const [billItems, setBillItems] = useState<any[]>([])

  // Optional drag to close (mobile UX improvement)
  const drawerRef = useRef<HTMLDivElement>(null)
  const startY = useRef(0)
  const currentTranslate = useRef(0)

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
    if (currentTranslate.current > 120) onOpenChange(false)
    drawerRef.current.style.transform = ''
    currentTranslate.current = 0
  }

  const handleAddItem = () => {
    if (!selectedMenu || !selectedCustomer) {
      toast.error('Please select customer and menu item')
      return
    }

    const menuItem = mockMenuItems.find((m) => m.id === selectedMenu)
    if (!menuItem) return

    const price = selectedSize === 'half' ? menuItem.half : menuItem.full
    const total = price * quantity

    const newItem = {
      id: Date.now().toString(),
      name: menuItem.name,
      size: selectedSize,
      unit: menuItem.unit,
      quantity,
      total,
    }

    setBillItems((prev) => [...prev, newItem])
    toast.success('Item added')
    setSelectedMenu('')
    setQuantity(1)
    setSelectedSize('full')
  }

  const handleRemoveItem = (id: string) => {
    setBillItems((prev) => prev.filter((item) => item.id !== id))
    toast.success('Item removed')
  }

  const handleSaveBill = () => {
    if (!selectedCustomer || billItems.length === 0) {
      toast.error('Please add items')
      return
    }

    toast.success('Bill saved successfully')

    setBillItems([])
    setSelectedCustomer('')
    onOpenChange(false)
  }

  const totalAmount = billItems.reduce((sum, item) => sum + item.total, 0)

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        ref={drawerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="max-h-[90vh] overflow-y-auto px-4 py-6 rounded-t-lg p-2"
        data-vaul-drawer-direction="bottom"
      >
        <DrawerHeader>
          <DrawerTitle>Add New Bill</DrawerTitle>
          <DrawerDescription>Create a new bill for a customer</DrawerDescription>
        </DrawerHeader>

        <div className="space-y-6 mt-4 p-2">
          {/* Customer */}
          <div className="space-y-2">
            <Label>Customer</Label>
            <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
              <SelectTrigger>
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent>
                {mockCustomers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Menu Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Menu Item</Label>
              <Select value={selectedMenu} onValueChange={setSelectedMenu}>
                <SelectTrigger>
                  <SelectValue placeholder="Select item" />
                </SelectTrigger>
                <SelectContent>
                  {mockMenuItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Size</Label>
              <Select
                value={selectedSize}
                onValueChange={(v) => setSelectedSize(v as 'half' | 'full')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="half">Half</SelectItem>
                  <SelectItem value="full">Full</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button onClick={handleAddItem} className="w-full">
                <Plus size={16} className="mr-2" />
                Add
              </Button>
            </div>
          </div>

          {/* Items Table */}
          {billItems.length > 0 && (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-center">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {billItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="capitalize">{item.size}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell className="text-right">
                        Rs {item.total.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <Trash2 size={16} className="text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="bg-muted p-4 flex justify-between items-center">
                <span className="font-semibold">Total Amount:</span>
                <span className="text-lg font-bold">
                  Rs {totalAmount.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveBill} disabled={!billItems.length}>
              Save Bill
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
