'use client'

import { useState, useRef, useEffect } from 'react'
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
import { useSelector } from 'react-redux'
import axios from 'axios'
import { config } from '@/config/config'

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
  const menuItems = useSelector((state: any) => state.menu.items)

  const [selectedMenuId, setSelectedMenuId] = useState('')
  const [selectedSize, setSelectedSize] = useState<'half' | 'full'>('full')
  const [quantity, setQuantity] = useState(1)
  const [billItems, setBillItems] = useState<any[]>([])
  const [token, setToken] = useState<string>('')

  // Safely get accessToken after client mounts
  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken')
    if (storedToken) setToken(storedToken)
  }, [])

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

  const handleAddItem = () => {
    if (!selectedMenuId) {
      toast.error('Please select a menu item')
      return
    }

    const menuItem = menuItems.find((m: any) => m._id === selectedMenuId)
    if (!menuItem) return

    const price = selectedSize === 'half' ? menuItem.half : menuItem.full
    const total = price * quantity

    const newItem = {
      id: Date.now().toString(),
      menuId: menuItem._id, // ✅ store menuId properly
      name: menuItem.name,
      size: selectedSize,
      unit: menuItem.unit,
      quantity,
      price, // store per-item price
      total,
    }

    setBillItems((prev) => [...prev, newItem])
    toast.success('Item added')
    setSelectedMenuId('')
    setQuantity(1)
    setSelectedSize('full')
  }

  const handleRemoveItem = (id: string) => {
    setBillItems((prev) => prev.filter((item) => item.id !== id))
    toast.success('Item removed')
  }

  const handleSaveBill = async () => {
    if (billItems.length === 0) {
      toast.error("Please add items")
      return
    }

    // Get token directly when needed
    const token = localStorage.getItem('accessToken')
    if (!token) {
      toast.error('You must be logged in to save a bill')
      return
    }

    const totalAmount = billItems.reduce((sum, item) => sum + item.total, 0)
    const itemsData = billItems.map((item) => ({
      menuId: item.menuId, // from selected menu
      name: item.name,
      size: item.size,
      unit: item.unit,
      quantity: item.quantity,
      price: item.price,
      total: item.total,
    }))

    try {
      await axios.post(
        `${config.apiUrl}/bill`,
        {
          customerId,
          items: itemsData,
          total: totalAmount,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, // ✅ token sent properly
          },
        }
      )

      toast.success(`Bill for ${customerFirstName} ${customerLastName} saved`)
      setBillItems([])
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err.response?.data?.msg || err.message || 'Failed to save bill')
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
            Create a new bill for <strong>{customerFirstName} {customerLastName}</strong>
          </DrawerDescription>
        </DrawerHeader>

        <div className="space-y-6 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Menu Item</Label>
              <Select value={selectedMenuId} onValueChange={setSelectedMenuId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select item" />
                </SelectTrigger>
                <SelectContent>
                  {menuItems.map((item: any) => (
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
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              />
            </div>

            <div className="space-y-2 flex items-end">
              <Button onClick={handleAddItem} className="w-full">
                <Plus size={16} className="mr-2" /> Add
              </Button>
            </div>
          </div>

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
              Save Bill
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
