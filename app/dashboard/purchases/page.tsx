'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
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
import { toast } from 'sonner'
import { mockPurchases } from '@/lib/mock-data'
import { PurchaseFormDrawer } from '@/components/purchase-form-drawer'

export default function PurchasesPage() {
  const [openDrawer, setOpenDrawer] = useState(false)
  const [purchases, setPurchases] = useState(mockPurchases)

  const totalCost = purchases.reduce((sum, p) => sum + p.cost, 0)

  const handleDelete = (id: string) => {
    setPurchases(purchases.filter((p) => p.id !== id))
    toast.success('Purchase deleted')
  }

  return (
    <div className="p-6 space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Purchase Cost (This Month)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">Rs {totalCost.toLocaleString()}</div>
        </CardContent>
      </Card>

      {/* Purchases Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Purchase History</CardTitle>
            <Button onClick={() => setOpenDrawer(true)} size="sm">
              <Plus size={16} className="mr-2" />
              Add Purchase
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {purchases.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <p>No purchases recorded yet</p>
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Item Name</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead className="text-right">Cost (Rs)</TableHead>
                    <TableHead className="text-center">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchases.map((purchase) => (
                    <TableRow key={purchase.id}>
                      <TableCell>{purchase.date}</TableCell>
                      <TableCell className="font-medium">{purchase.item}</TableCell>
                      <TableCell className="text-right">{purchase.quantity}</TableCell>
                      <TableCell>{purchase.unit}</TableCell>
                      <TableCell className="text-right font-semibold">
                        Rs {purchase.cost.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(purchase.id)}
                        >
                          <Trash2 size={16} className="text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <PurchaseFormDrawer open={openDrawer} onOpenChange={setOpenDrawer} />
    </div>
  )
}
