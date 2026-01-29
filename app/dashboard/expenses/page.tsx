'use client'

import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Plus, Edit, Trash2, TrendingUp } from 'lucide-react'
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
import { ExpenseFormDrawer } from '@/components/expense-form-drawer'
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

import {
  fetchExpenses,
  addExpense,
  editExpense,
  removeExpense,
  type ExpenseItem,
} from '@/redux/slices/expense-slice'
import type { RootState, AppDispatch } from '@/redux/store/store'

export default function ExpensePage() {
  const dispatch = useDispatch<AppDispatch>()
  const { items, loading } = useSelector((state: RootState) => state.expense)

  const [openDrawer, setOpenDrawer] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ExpenseItem | null>(null)
  const [deleteItem, setDeleteItem] = useState<ExpenseItem | null>(null)
  const [isDeleteLoading, setIsDeleteLoading] = useState(false)

  // ================ Load Expenses ================
  useEffect(() => {
    dispatch(fetchExpenses())
  }, [dispatch])

  // ================ Create / Update ================
  const handleCreate = async (expenseData: any) => {
    try {
      await dispatch(addExpense(expenseData)).unwrap()
      toast.success('Expense created')
      setOpenDrawer(false)
    } catch (err: any) {
      toast.error(err)
    }
  }

  const handleUpdate = async (id: string, data: any) => {
    try {
      await dispatch(editExpense({ id, data })).unwrap()
      toast.success('Expense updated')
      setOpenDrawer(false)
      setSelectedItem(null)
    } catch (err: any) {
      toast.error(err)
    }
  }

  // ================ Delete ================
  const confirmDelete = async () => {
    if (!deleteItem) return
    try {
      setIsDeleteLoading(true)
      await dispatch(removeExpense(deleteItem._id)).unwrap()
      toast.success('Expense deleted')
      setDeleteItem(null)
    } catch (err: any) {
      toast.error(err)
    } finally {
      setIsDeleteLoading(false)
    }
  }

  // ================ Calculate Insights ================
  const totalExpenses = (items || []).reduce(
    (sum, item) => sum + (item.totalAmount || 0),
    0
  )
  const inventoryTotal = (items || [])
    .filter((item) => item.type === 'inventory')
    .reduce((sum, item) => sum + (item.totalAmount || 0), 0)
  const expenseTotal = (items || [])
    .filter((item) => item.type === 'expense')
    .reduce((sum, item) => sum + (item.totalAmount || 0), 0)

  // ================ Table Skeleton ================
  const TableSkeleton = () => (
    <>
      {[...Array(5)].map((_, idx) => (
        <TableRow key={idx} className="animate-pulse">
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-16" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-20" />
          </TableCell>
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
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold">Expenses</h1>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              <BreadcrumbSeparator />
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink href="">Expenses</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <p className="text-muted-foreground">
          Track and manage your business expenses.
        </p>
      </div>

      {/* Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp size={16} />
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">Rs {totalExpenses.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {items.length} expense entries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Inventory Costs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">Rs {inventoryTotal.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {items.filter((i) => i.type === 'inventory').length} items
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Other Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">Rs {expenseTotal.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {items.filter((i) => i.type === 'expense').length} items
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Expense Records</CardTitle>
            <Button size="sm" onClick={() => setOpenDrawer(true)}>
              <Plus size={16} className="mr-2" /> Add Expense
            </Button>
          </div>
        </CardHeader>

        <CardContent className="overflow-x-auto">
          {loading ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableSkeleton />
              </TableBody>
            </Table>
          ) : items.length === 0 ? (
            <Empty className="py-16">
              <EmptyMedia variant="icon">
                <TrendingUp className="h-12 w-12" />
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle>No Expenses</EmptyTitle>
                <EmptyDescription>
                  Click "Add Expense" to create your first expense entry.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell className="font-medium">{item.item}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          item.type === 'inventory' ? 'default' : 'secondary'
                        }
                      >
                        {item.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">
                      Rs {item.unitPrice.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      Rs {item.totalAmount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center">
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

      {/* Form Drawer */}
      <ExpenseFormDrawer
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
            <DialogTitle>Delete Expense</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteItem?.item}"? This action
              cannot be undone.
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