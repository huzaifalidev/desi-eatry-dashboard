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
import { useDispatch, useSelector } from 'react-redux'
import { createBill } from '@/redux/slices/customer-slice'
import { AppDispatch, RootState } from '@/redux/store/store'
import { Spinner } from './ui/spinner'

interface BillEntryDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customerId: string
  customerFirstName: string
  customerLastName: string
}

export function BillEntryDrawer({
  open,
  onOpenChange,
  customerId,
  customerFirstName,
  customerLastName,
}: BillEntryDrawerProps) {
  const menuItems = useSelector((state: RootState) => state.menu.items)
  const dispatch = useDispatch<AppDispatch>()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedMenuId, setSelectedMenuId] = useState('')
  const [selectedSize, setSelectedSize] = useState<'half' | 'full'>('full')
  const [quantity, setQuantity] = useState(1)
  const [billItems, setBillItems] = useState<any[]>([])

  const drawerRef = useRef<HTMLDivElement>(null)
  const startY = useRef(0)
  const currentTranslate = useRef(0)

  // ---------------- Touch Swipe ----------------
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

  // ---------------- Add / Remove Items ----------------
  const handleAddItem = () => {
    if (!selectedMenuId) return toast.error('Please select a menu item')
    const menuItem = menuItems.find((m) => m._id === selectedMenuId)
    if (!menuItem) return

    const price = selectedSize === 'half' ? menuItem.half : menuItem.full
    const total = price * quantity

    setBillItems((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        menuId: menuItem._id,
        name: menuItem.name,
        size: selectedSize,
        unit: menuItem.unit,
        quantity,
        price,
        total,
      },
    ])
    setSelectedMenuId('')
    setQuantity(1)
    setSelectedSize('full')
  }

  const handleRemoveItem = (id: string) => {
    setBillItems((prev) => prev.filter((item) => item.id !== id))
    toast.success('Item removed')
  }

  // ---------------- Save Bill using Redux ----------------
  const handleSaveBill = async () => {
    if (billItems.length === 0) return toast.error('Please add items')

    try {
      setIsLoading(true)
      await dispatch(
        createBill({
          customerId,
          items: billItems.map((item) => ({
            menuId: item.menuId,
            name: item.name,
            size: item.size,
            unit: item.unit,
            quantity: item.quantity,
            price: item.price,
            total: item.total,
          })),
        })
      ).unwrap()
      setBillItems([])
      onOpenChange(false)
      setIsLoading(false)
      toast.success(`Bill for ${customerFirstName} ${customerLastName} saved`)
    } catch (err: any) {
      toast.error(err || 'Failed to save bill')
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
        className="max-h-[90vh] overflow-y-auto px-4 py-6 rounded-t-lg"
        data-vaul-drawer-direction="bottom"
      >
        <DrawerHeader>
          <DrawerTitle>Add New Bill</DrawerTitle>
          <DrawerDescription>
            Create a new bill for{' '}
            <strong>
              {customerFirstName} {customerLastName}
            </strong>
          </DrawerDescription>
        </DrawerHeader>

        <div className="space-y-6 mt-4">
          {/* Menu, Size, Qty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Menu Item</Label>
              <Select value={selectedMenuId} onValueChange={setSelectedMenuId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select item" />
                </SelectTrigger>
                <SelectContent>
                  {menuItems.map((item) => (
                    <SelectItem key={item._id} value={item._id}>
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
                min={1}
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                }
              />
            </div>

            <div className="space-y-2 flex items-end">
              <Button onClick={handleAddItem} className="w-full">
                <Plus size={16} className="mr-2" /> Add
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
                  Rs {billItems.reduce((sum, i) => sum + i.total, 0).toLocaleString()}
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveBill} disabled={billItems.length === 0}>
              {isLoading && <Spinner />}  Save Bill
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
