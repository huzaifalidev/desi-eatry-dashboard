'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, ClipboardList } from 'lucide-react'
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
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { fetchMenus, createMenu, updateMenu, deleteMenu } from '@/lib/api/menu'
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogHeader, DialogFooter } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from '@/components/ui/empty'

export default function FoodMenuPage() {
  const [openDrawer, setOpenDrawer] = useState(false)
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<any | null>(null)
  const [deleteItem, setDeleteItem] = useState<any | null>(null)
  const [isDeleteLoading, setIsDeleteLoading] = useState(false)

  // ---------------- Load Menus ----------------
  const loadMenus = async () => {
    setLoading(true)
    try {
      const data = await fetchMenus()
      setItems(data.menus ?? data)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMenus()
  }, [])

  // ---------------- Create / Update ----------------
  const handleCreate = async (menuData: any) => {
    try {
      const res = await createMenu(menuData)
      setItems([res.menu, ...items])
      toast.success('Menu item created')
      setOpenDrawer(false)
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const handleUpdate = async (id: string, data: any) => {
    try {
      const res = await updateMenu(id, data)
      setItems((prev) => prev.map((item) => (item._id === id ? res.menu : item)))
      toast.success('Menu item updated')
      setOpenDrawer(false)
      setSelectedItem(null)
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  // ---------------- Delete ----------------
  const confirmDelete = async () => {
    if (!deleteItem) return
    try {
      setIsDeleteLoading(true)
      await deleteMenu(deleteItem._id)
      setItems((prev) => prev.filter((item) => item._id !== deleteItem._id))
      toast.success('Menu item deleted')
      setDeleteItem(null)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsDeleteLoading(false)
    }
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
            <div className="flex justify-center gap-2">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-6 w-6 rounded-full" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  )

  return (
    <div className="p-4 sm:p-6 space-y-6">

      {/* Breadcrumb and Title */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-pretty">Menu</h1>
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
        <p className="text-sm sm:text-base text-muted-foreground mt-1">Manage your food menu.</p>
      </div>

      {/* Table / Empty / Skeleton */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <CardTitle>Food Menu Items</CardTitle>
            <Button size="sm" className="mt-2 sm:mt-0" onClick={() => setOpenDrawer(true)}>
              <Plus size={16} className="mr-2" /> Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {loading ? (
            <Table className="min-w-[600px] sm:min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead className="text-right">Half (Rs)</TableHead>
                  <TableHead className="text-right">Full (Rs)</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableSkeleton />
              </TableBody>
            </Table>
          ) : items.length === 0 ? (
            <Empty className="py-12 sm:py-20">
              <EmptyMedia variant="icon">
                <ClipboardList className="w-12 h-12 text-muted-foreground" />
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle>No Menu Items</EmptyTitle>
                <EmptyDescription>
                  You haven’t added any menu items yet. Click "Add Item" to get started.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <Table className="min-w-[600px] sm:min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead className="text-right">Half (Rs)</TableHead>
                  <TableHead className="text-right">Full (Rs)</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item._id} className="text-sm sm:text-base">
                    <TableCell className="font-medium truncate">{item.name}</TableCell>
                    <TableCell className="text-right">{item.half > 0 ? item.half : '-'}</TableCell>
                    <TableCell className="text-right">{item.full > 0 ? item.full : '-'}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell>
                      <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center flex flex-wrap sm:flex-nowrap justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedItem(item)
                          setOpenDrawer(true)
                        }}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteItem(item)}
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

      {/* Drawer for Add/Edit */}
      <MenuItemFormDrawer
        open={openDrawer}
        onOpenChange={(open) => {
          setOpenDrawer(open)
          if (!open) setSelectedItem(null)
        }}
        item={selectedItem}
        onSubmit={async (menuData) => {
          if (selectedItem) {
            await handleUpdate(selectedItem._id, menuData)
          } else {
            await handleCreate(menuData)
          }
        }}
      />

      {/* Delete Dialog */}
      <Dialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Menu Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteItem?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 justify-end">
            <Button variant="outline" onClick={() => setDeleteItem(null)} disabled={isDeleteLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleteLoading}>
              {isDeleteLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
