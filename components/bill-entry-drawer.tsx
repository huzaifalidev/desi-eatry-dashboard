'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
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

export function BillEntryDrawer({ open, onOpenChange, customerId }: BillEntryDrawerProps) {
  const [selectedCustomer, setSelectedCustomer] = useState(customerId || '')
  const [selectedMenu, setSelectedMenu] = useState('')
  const [selectedSize, setSelectedSize] = useState<'half' | 'full'>('full')
  const [quantity, setQuantity] = useState(1)
  const [billItems, setBillItems] = useState<any[]>([])

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

    setBillItems([...billItems, newItem])
    toast.success('Item added to bill')
    setSelectedMenu('')
    setQuantity(1)
    setSelectedSize('full')
  }

  const handleRemoveItem = (id: string) => {
    setBillItems(billItems.filter((item) => item.id !== id))
    toast.success('Item removed')
  }

  const handleSaveBill = () => {
    if (!selectedCustomer || billItems.length === 0) {
      toast.error('Please add items to the bill')
      return
    }

    toast.success('Bill saved successfully')
    setBillItems([])
    setSelectedCustomer('')
    onOpenChange(false)
  }

  const totalAmount = billItems.reduce((sum, item) => sum + item.total, 0)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add New Bill</SheetTitle>
          <SheetDescription>Create a new bill for a customer</SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Customer Selection */}
          <div className="space-y-2">
            <Label htmlFor="customer">Customer</Label>
            <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
              <SelectTrigger id="customer">
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

          {/* Menu Item Selection */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="menu">Menu Item</Label>
              <Select value={selectedMenu} onValueChange={setSelectedMenu}>
                <SelectTrigger id="menu">
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
              <Label htmlFor="size">Size</Label>
              <Select value={selectedSize} onValueChange={(v) => setSelectedSize(v as 'half' | 'full')}>
                <SelectTrigger id="size">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="half">Half</SelectItem>
                  <SelectItem value="full">Full</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="qty">Quantity</Label>
              <Input
                id="qty"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
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

          {/* Bill Items Table */}
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
                      <TableCell className="text-right">Rs {item.total.toLocaleString()}</TableCell>
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
                <span className="text-lg font-bold">Rs {totalAmount.toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveBill} disabled={billItems.length === 0}>
              Save Bill
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
