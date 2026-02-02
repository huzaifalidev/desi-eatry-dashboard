'use client'

import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Plus, Trash2, ClipboardList, CheckCircle2, Calculator } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { InsightsCards } from '@/components/dashboard/insights-cards'
import { InsightsCharts } from '@/components/dashboard/insights-charts'

export default function FoodMenuPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { items, loading } = useSelector((state: RootState) => state.menu)

  const [openDrawer, setOpenDrawer] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any | null>(null)
  const [deleteItem, setDeleteItem] = useState<any | null>(null)
  const [isDeleteLoading, setIsDeleteLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // -------------------- Insights --------------------
  const totalItems = items.length
  const activeItems = items.filter((item) => item.status === 'active').length
  const inactiveItems = items.filter((item) => item.status !== 'active').length

  const allPrices = items.flatMap((item) => [item.half || 0, item.full || 0]).filter(p => p > 0)
  const avgPrice = allPrices.length > 0 ? (allPrices.reduce((a, b) => a + b, 0) / allPrices.length).toFixed(2) : '0'
  const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : 0
  const maxPrice = allPrices.length > 0 ? Math.max(...allPrices) : 0

  const mostExpensiveItem = items.reduce((max, item) => {
    const itemMax = Math.max(item.half || 0, item.full || 0)
    return itemMax > (max.price || 0) ? { ...item, price: itemMax } : max
  }, { name: 'N/A', price: 0 })

  const leastExpensiveItem = items.reduce((min, item) => {
    const itemMin = Math.min(item.half || Infinity, item.full || Infinity)
    if (itemMin === Infinity) return min
    return itemMin < (min.price || Infinity) ? { ...item, price: itemMin } : min
  }, { name: 'N/A', price: Infinity })

  // Unit-wise breakdown
  const unitBreakdown: Record<string, number> = {}
  items.forEach((item) => unitBreakdown[item.unit] = (unitBreakdown[item.unit] || 0) + 1)
  const unitData = Object.entries(unitBreakdown).map(([unit, count]) => ({ name: unit, value: count }))
  const COLORS = ['#3b82f6', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#06b6d4']

  // Price distribution
  const priceRanges = {
    '0-100': items.filter(item => Math.max(item.half || 0, item.full || 0) <= 100).length,
    '100-500': items.filter(item => {
      const maxPrice = Math.max(item.half || 0, item.full || 0)
      return maxPrice > 100 && maxPrice <= 500
    }).length,
    '500-1000': items.filter(item => {
      const maxPrice = Math.max(item.half || 0, item.full || 0)
      return maxPrice > 500 && maxPrice <= 1000
    }).length,
    '1000+': items.filter(item => Math.max(item.half || 0, item.full || 0) > 1000).length,
  }

  const priceDistributionData = Object.entries(priceRanges).map(([range, count]) => ({ range, count }))

  // -------------------- Load Menus --------------------
  useEffect(() => {
    dispatch(fetchMenuItems())
  }, [dispatch])

  const filteredItems = items.filter((item) => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return true
    return item.name?.toLowerCase().includes(term) ||
      item.unit?.toLowerCase().includes(term) ||
      item.status?.toLowerCase().includes(term)
  })

  // -------------------- Create / Update --------------------
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

  // -------------------- Delete --------------------
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

  const handleRowClick = (item: any) => {
    setSelectedItem(item)
    setOpenDrawer(true)
  }

  const handleDeleteClick = (e: React.MouseEvent, item: any) => {
    e.stopPropagation()
    setDeleteItem(item)
  }

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
        <p className="text-muted-foreground">Manage your food menu.</p>
      </div>

      {/* Insights */}
      <InsightsCards
        cards={[
          { title: 'Total Items', value: totalItems, count: activeItems + inactiveItems, icon: ClipboardList },
          { title: 'Active Items', value: activeItems, count: inactiveItems, icon: CheckCircle2 },
          { title: 'Avg Price', value: avgPrice, valuePrefix: 'RS', icon: Calculator },
        ]}
      />

      <InsightsCharts
        barCharts={[
          { title: 'Price Distribution', data: priceDistributionData, dataKey: 'count', xKey: 'range' }
        ]}
        pieCharts={[
          { title: 'Items by Unit', data: unitData, dataKey: 'value', nameKey: 'name' }
        ]}
      />

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Food Menu Items</CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search menu items..."
                className="sm:w-64"
              />
              <Button size="sm" onClick={() => setOpenDrawer(true)}>
                <Plus size={16} className="mr-2" /> Add Item
              </Button>
            </div>
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
          ) : filteredItems.length === 0 ? (
            <Empty className="py-16">
              <EmptyMedia variant="icon">
                <ClipboardList className="h-12 w-12" />
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle>No Menu Items</EmptyTitle>
                <EmptyDescription>
                  {items.length === 0
                    ? 'Click “Add Item” to create your first menu item.'
                    : 'No items match your search.'}
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
                {filteredItems.map((item) => (
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
