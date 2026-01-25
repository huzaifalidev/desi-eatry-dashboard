'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2 } from 'lucide-react'
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

export default function FoodMenuPage() {
  const [openDrawer, setOpenDrawer] = useState(false)
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadMenus = async () => {
    try {
      setLoading(true)
      const data = await fetchMenus()
      setItems(data.menus)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMenus()
  }, [])

  const handleDelete = async (id: string) => {
    try {
      await deleteMenu(id)
      setItems(items.filter((item) => item._id !== id))
      toast.success('Menu item deleted')
    } catch (err: any) {
      toast.error(err.message)
    }
  }

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

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col justify-between gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-pretty">Menu</h1>
        <div className="text-muted-foreground ">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                <BreadcrumbSeparator />
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbLink href="menu">Menu</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <p className="text-muted-foreground">Manage your food menu.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Food Menu Items</CardTitle>
            <Button onClick={() => setOpenDrawer(true)} size="sm">
              <Plus size={16} className="mr-2" /> Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
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
                  <TableRow key={item._id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-right">{item.half > 0 ? item.half : '-'}</TableCell>
                    <TableCell className="text-right">{item.full > 0 ? item.full : '-'}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell>
                      <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="sm">
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item._id)}
                        >
                          <Trash2 size={16} className="text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {items.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No menu items found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <MenuItemFormDrawer
        open={openDrawer}
        onOpenChange={setOpenDrawer}
        onSubmit={handleCreate}
      />
    </div>
  )
}
