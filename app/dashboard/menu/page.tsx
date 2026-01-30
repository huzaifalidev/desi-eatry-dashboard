'use client'

import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Plus, Trash2, ClipboardList } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { MenuItemFormDrawer } from '@/components/menu-item-form-drawer'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogHeader,
  DialogFooter,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from '@/components/ui/empty'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'

import {
  fetchMenuItems,
  addMenuItem,
  editMenuItem,
  removeMenuItem,
} from '@/redux/slices/menu-slice'
import type { RootState, AppDispatch } from '@/redux/store/store'

export default function FoodMenuPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { items, loading } = useSelector((state: RootState) => state.menu)

  const [openDrawer, setOpenDrawer] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any | null>(null)
  const [deleteItem, setDeleteItem] = useState<any | null>(null)
  const [isDeleteLoading, setIsDeleteLoading] = useState(false)

  // Calculate insights
  const totalItems = items.length
  const activeItems = items.filter((item) => item.status === 'active').length
  const inactiveItems = items.filter((item) => item.status !== 'active').length

  // Price calculations
  const allPrices = items.flatMap((item) => [
    item.half || 0,
    item.full || 0,
  ]).filter((price) => price > 0)

  const avgPrice =
    allPrices.length > 0
      ? (allPrices.reduce((a, b) => a + b, 0) / allPrices.length).toFixed(2)
      : '0'

  const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : 0
  const maxPrice = allPrices.length > 0 ? Math.max(...allPrices) : 0

  const mostExpensiveItem = items.reduce((max, item) => {
    const itemMax = Math.max(item.half || 0, item.full || 0)
    const maxVal = Math.max(max.price || 0, itemMax)
    return maxVal > (max.price || 0) ? { ...item, price: itemMax } : max
  }, { name: 'N/A', price: 0 })

  const leastExpensiveItem = items.reduce((min, item) => {
    const itemMin = Math.min(
      item.half || Infinity,
      item.full || Infinity
    )
    if (itemMin === Infinity) return min
    const minVal = Math.min(min.price || Infinity, itemMin)
    return minVal < (min.price || Infinity) ? { ...item, price: itemMin } : min
  }, { name: 'N/A', price: Infinity })

  // Unit-wise breakdown
  const unitBreakdown: Record<string, number> = {}
  items.forEach((item) => {
    unitBreakdown[item.unit] = (unitBreakdown[item.unit] || 0) + 1
  })

  const unitData = Object.entries(unitBreakdown).map(([unit, count]) => ({
    name: unit,
    value: count,
  }))

  const COLORS = ['#3b82f6', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#06b6d4']

  // Price distribution
  const priceRanges = {
    '0-100': items.flatMap((item) => [item.half || 0, item.full || 0]).filter(
      (p) => p > 0 && p <= 100
    ).length,
    '100-500': items.flatMap((item) => [item.half || 0, item.full || 0]).filter(
      (p) => p > 100 && p <= 500
    ).length,
    '500-1000': items.flatMap((item) => [item.half || 0, item.full || 0]).filter(
      (p) => p > 500 && p <= 1000
    ).length,
    '1000+': items.flatMap((item) => [item.half || 0, item.full || 0]).filter(
      (p) => p > 1000
    ).length,
  }

  const priceDistributionData = Object.entries(priceRanges).map(([range, count]) => ({
    range,
    count,
  }))

  // ---------------- Load Menus ----------------
  useEffect(() => {
    dispatch(fetchMenuItems())
  }, [dispatch])

  // ---------------- Create / Update ----------------
  const handleCreate = async (menuData: any) => {
    try {
      await dispatch(addMenuItem(menuData)).unwrap()
      toast.success('Menu item created')
      setOpenDrawer(false)
    } catch (err: any) {
      toast.error(err)
    }
  }

  const handleUpdate = async (id: string, data: any) => {
    try {
      await dispatch(editMenuItem({ id, data })).unwrap()
      toast.success('Menu item updated')
      setOpenDrawer(false)
      setSelectedItem(null)
    } catch (err: any) {
      toast.error(err)
    }
  }

  // ---------------- Delete ----------------
  const confirmDelete = async () => {
    if (!deleteItem) return
    try {
      setIsDeleteLoading(true)
      await dispatch(removeMenuItem(deleteItem._id)).unwrap()
      toast.success('Menu item deleted')
      setDeleteItem(null)
    } catch (err: any) {
      toast.error(err)
    } finally {
      setIsDeleteLoading(false)
    }
  }

  // Handle row click to open edit drawer
  const handleRowClick = (item: any) => {
    setSelectedItem(item)
    setOpenDrawer(true)
  }

  // Prevent row click when delete button is clicked
  const handleDeleteClick = (e: React.MouseEvent, item: any) => {
    e.stopPropagation()
    setDeleteItem(item)
  }

  // ---------------- Skeleton ----------------
  const TableSkeleton = () => (
    <>
      {[...Array(5)].map((_, idx) => (
        <TableRow key={idx} className="animate-pulse">
          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
          <TableCell className="text-right"><Skeleton className="h-4 w-16 mx-auto" /></TableCell>
          <TableCell className="text-right"><Skeleton className="h-4 w-16 mx-auto" /></TableCell>
          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
          <TableCell><Skeleton className="h-4 w-12" /></TableCell>
          <TableCell className="text-center">
            <Skeleton className="h-6 w-6 rounded-full mx-auto" />
          </TableCell>
        </TableRow>
      ))}
    </>
  )

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold">Menu</h1>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              <BreadcrumbSeparator />
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink href="">Menu</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <p className="text-muted-foreground">
          Manage your food menu.
        </p>
      </div>

      {/* Menu Insights Section */}
      {!loading && items.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Menu Insights</h2>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">Total Items</p>
                  <p className="text-3xl font-bold">{totalItems}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">Active Items</p>
                  <div className="flex justify-center gap-2 items-baseline">
                    <p className="text-3xl font-bold text-green-600">{activeItems}</p>
                    <p className="text-xs text-muted-foreground">
                      ({inactiveItems} inactive)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">Avg Price</p>
                  <p className="text-3xl font-bold">RS{avgPrice}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">Price Range</p>
                  <p className="text-sm font-mono">
                    RS{minPrice} - RS{maxPrice}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Price Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Price Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={priceDistributionData}>
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Unit-wise Breakdown */}
            {unitData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Items by Unit</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={unitData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {unitData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Most/Least Expensive Items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Most Expensive Item</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="font-semibold">{mostExpensiveItem.name}</p>
                  <p className="text-lg font-bold text-orange-600">
                    RS{mostExpensiveItem.price}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Least Expensive Item</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="font-semibold">{leastExpensiveItem.name}</p>
                  <p className="text-lg font-bold text-green-600">
                    RS{leastExpensiveItem.price === Infinity ? '0' : leastExpensiveItem.price}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Food Menu Items</CardTitle>
            <Button size="sm" onClick={() => setOpenDrawer(true)}>
              <Plus size={16} className="mr-2" /> Add Item
            </Button>
          </div>
        </CardHeader>

        <CardContent className="overflow-x-auto">
          {loading ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead className="text-right">Half</TableHead>
                  <TableHead className="text-right">Full</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Delete</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableSkeleton />
              </TableBody>
            </Table>
          ) : items.length === 0 ? (
            <Empty className="py-16">
              <EmptyMedia variant="icon">
                <ClipboardList className="h-12 w-12" />
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle>No Menu Items</EmptyTitle>
                <EmptyDescription>
                  Click “Add Item” to create your first menu item.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead className="text-right">Half</TableHead>
                  <TableHead className="text-right">Full</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Delete</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow
                    key={item._id}
                    onClick={() => handleRowClick(item)}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-right">{item.half || '-'}</TableCell>
                    <TableCell className="text-right">{item.full || '-'}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell>
                      <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDeleteClick(e, item)}
                      >
                        <Trash2 size={16} className="text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Drawer */}
      <MenuItemFormDrawer
        open={openDrawer}
        onOpenChange={(open) => {
          setOpenDrawer(open)
          if (!open) setSelectedItem(null)
        }}
        item={selectedItem}
        onSubmit={(data) =>
          selectedItem
            ? handleUpdate(selectedItem._id, data)
            : handleCreate(data)
        }
      />

      {/* Delete Dialog */}
      <Dialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteItem?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteItem(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleteLoading}
            >
              {isDeleteLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
