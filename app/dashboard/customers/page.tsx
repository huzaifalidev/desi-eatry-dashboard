'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { Plus, Edit, Trash2, Users, CreditCard, FileText, Wallet } from 'lucide-react'
import { RootState } from '@/redux/store/store'

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
import { CustomerFormDrawer } from '@/components/customer-form-drawer'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from '@/components/ui/empty'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogHeader,
  DialogFooter,
} from '@/components/ui/dialog'
import { InsightsCards } from '@/components/dashboard/insights-cards'
import { InsightsCharts } from '@/components/dashboard/insights-charts'

import {
  fetchAllCustomers,
  addCustomer,
  editCustomer,
  removeCustomer,
} from '@/redux/slices/customer-slice'
import type { Customer } from '@/lib/types'

export default function CustomersPage() {
  const dispatch = useDispatch<any>()
  const router = useRouter()
  const { customers, loading } = useSelector((state: RootState) => state.customer)

  // ---------------- State ----------------
  const [openDrawer, setOpenDrawer] = useState(false)
  const [editCustomerData, setEditCustomerData] = useState<Customer | null>(null)
  const [deleteCustomerItem, setDeleteCustomerItem] = useState<Customer | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // ---------------- Load Customers ----------------
  useEffect(() => {
    dispatch(fetchAllCustomers())
  }, [dispatch])

  // ---------------- Insights Calculations ----------------
  const totalCustomers = customers.length
  const totalBilled = customers.reduce((sum, c) => sum + (c.summary?.totalBilled || 0), 0)
  const totalPaid = customers.reduce((sum, c) => sum + (c.summary?.totalPaid || 0), 0)
  const totalOutstanding = customers.reduce((sum, c) => sum + (c.summary?.balance || 0), 0)

  const positiveBalance = customers.filter((c) => (c.summary?.balance || 0) > 0).length
  const zeroBalance = customers.filter((c) => (c.summary?.balance || 0) === 0).length
  const negativeBalance = customers.filter((c) => (c.summary?.balance || 0) < 0).length

  const balanceDistributionData = [
    { name: 'Positive', value: positiveBalance, fill: '#dc2626' },
    { name: 'Zero', value: zeroBalance, fill: '#6b7280' },
    { name: 'Negative', value: negativeBalance, fill: '#16a34a' },
  ].filter((d) => d.value > 0)

  // ---------------- Cards Setup ----------------
  const allCards = [
    {
      title: 'Total Billed',
      value: totalBilled,
      valuePrefix: 'Rs ',
      icon: FileText,      // represents invoices/bills
    },
    {
      title: 'Total Paid',
      value: totalPaid,
      valuePrefix: 'Rs ',
      icon: CreditCard,    // represents payments received
    },
    {
      title: 'Outstanding',
      value: totalOutstanding,
      valuePrefix: 'Rs ',
      icon: Wallet,        // represents remaining balance
    },
  ]

  // ---------------- Handlers ----------------
  const handleRowClick = (customerId: string) => {
    router.push(`/dashboard/customers/${customerId}`)
  }

  const handleEditClick = (e: React.MouseEvent, customer: Customer) => {
    e.stopPropagation()
    setEditCustomerData(customer)
    setOpenDrawer(true)
  }

  const handleDeleteClick = (e: React.MouseEvent, customer: Customer) => {
    e.stopPropagation()
    setDeleteCustomerItem(customer)
  }

  const handleSaveCustomer = async (customer: any) => {
    try {
      if (customer._id) {
        await dispatch(editCustomer({ id: customer._id, data: customer })).unwrap()
        toast.success(`${customer.firstName} ${customer.lastName} updated`)
      } else {
        await dispatch(addCustomer(customer)).unwrap()
        toast.success(`${customer.firstName} ${customer.lastName} added`)
      }
      setOpenDrawer(false)
      setEditCustomerData(null)
    } catch (err: any) {
      toast.error(err || 'Failed to save customer')
    }
  }

  const handleDelete = async () => {
    if (!deleteCustomerItem) return
    try {
      setDeleteLoading(true)
      await dispatch(removeCustomer(deleteCustomerItem._id)).unwrap()
      toast.success(`Customer deleted`)
      setDeleteCustomerItem(null)
    } catch (err: any) {
      toast.error(err || 'Failed to delete customer')
    } finally {
      setDeleteLoading(false)
    }
  }

  // ---------------- Skeleton ----------------
  const TableSkeleton = () => (
    <>
      {[...Array(5)].map((_, i) => (
        <TableRow key={i} className="animate-pulse">
          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell className="text-right"><Skeleton className="h-4 w-20 mx-auto" /></TableCell>
          <TableCell className="text-right"><Skeleton className="h-4 w-20 mx-auto" /></TableCell>
          <TableCell className="text-right"><Skeleton className="h-4 w-20 mx-auto" /></TableCell>
          <TableCell className="text-center flex justify-center gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-6 w-6 rounded-full" />
          </TableCell>
        </TableRow>
      ))}
    </>
  )

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-pretty">Customers</h1>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              <BreadcrumbSeparator />
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink href="">Customers</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <p className="text-sm text-muted-foreground mt-1">Manage your customers.</p>
      </div>

      {/* ---------------- Insights Cards ---------------- */}
      <InsightsCards cards={allCards} loading={loading} />

      {/* ---------------- Balance Distribution Chart ---------------- */}
      <InsightsCharts
        pieCharts={[
          { title: 'Customer Balance Distribution', data: balanceDistributionData, dataKey: 'value', nameKey: 'name' }
        ]}
      />

      {/* ---------------- Table ---------------- */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <CardTitle>Customers</CardTitle>
            <Button
              size="sm"
              className="mt-2 sm:mt-0"
              onClick={() => {
                setEditCustomerData(null)
                setOpenDrawer(true)
              }}
            >
              <Plus size={16} className="mr-2" /> Add Customer
            </Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {loading ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="text-right">Total Billed</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody><TableSkeleton /></TableBody>
            </Table>
          ) : customers.length === 0 ? (
            <Empty className="py-12 sm:py-20">
              <EmptyMedia variant="icon">
                <Users className="w-12 h-12 text-muted-foreground" />
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle>No Customers Yet</EmptyTitle>
                <EmptyDescription>
                  You haven’t added any customers yet.{' '}
                  <a href="#" onClick={() => setOpenDrawer(true)} className="text-primary font-medium">
                    Add your first customer
                  </a>.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="text-right">Total Billed</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => {
                  const billed = customer.summary?.totalBilled || 0
                  const paid = customer.summary?.totalPaid || 0
                  const balance = customer.summary?.balance || 0
                  return (
                    <TableRow
                      key={customer._id}
                      onClick={() => handleRowClick(customer._id)}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <TableCell className="truncate font-medium">{customer.firstName} {customer.lastName}</TableCell>
                      <TableCell className="truncate">{customer.phone}</TableCell>
                      <TableCell className="text-right">Rs {billed.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-green-600 font-semibold">Rs {paid.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <Badge className={balance > 0 ? 'bg-destructive text-white' : balance < 0 ? 'bg-secondary text-secondary-content' : 'bg-muted text-muted-foreground'}>
                          Rs {balance.toLocaleString()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center flex justify-center gap-1">
                        <Button variant="ghost" size="sm" onClick={(e) => handleEditClick(e, customer)}>
                          <Edit size={16} />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={(e) => handleDeleteClick(e, customer)}>
                          <Trash2 size={16} className="text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Drawer */}
      <CustomerFormDrawer
        open={openDrawer}
        customer={editCustomerData ?? undefined}
        onOpenChange={(open) => {
          setOpenDrawer(open)
          if (!open) setEditCustomerData(null)
        }}
        onSave={handleSaveCustomer}
      />

      {/* Delete Dialog */}
      <Dialog open={!!deleteCustomerItem} onOpenChange={() => setDeleteCustomerItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Customer</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteCustomerItem?.firstName} {deleteCustomerItem?.lastName}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 justify-end">
            <Button variant="outline" onClick={() => setDeleteCustomerItem(null)} disabled={deleteLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteLoading}>
              {deleteLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
