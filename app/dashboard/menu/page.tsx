'use client'

import { useState } from 'react'
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
import { mockMenuItems } from '@/lib/mock-data'
import { MenuItemFormDrawer } from '@/components/menu-item-form-drawer'

export default function FoodMenuPage() {
  const [openDrawer, setOpenDrawer] = useState(false)
  const [items, setItems] = useState(mockMenuItems)

  const handleDelete = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
    toast.success('Menu item deleted')
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Food Menu Items</CardTitle>
            <Button onClick={() => setOpenDrawer(true)} size="sm">
              <Plus size={16} className="mr-2" />
              Add Item
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
                  <TableRow key={item.id}>
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
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 size={16} className="text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <MenuItemFormDrawer open={openDrawer} onOpenChange={setOpenDrawer} />
    </div>
  )
}
