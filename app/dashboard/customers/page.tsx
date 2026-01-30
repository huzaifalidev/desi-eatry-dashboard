'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Edit, Trash2, Users } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/redux/store/store'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'

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
  BreadcrumbList,
  BreadcrumbLink,
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

import { fetchAllCustomers, addCustomer, editCustomer, removeCustomer, } from '@/redux/slices/customer-slice'
import type { Customer } from '@/lib/types'

export default function CustomersPage() {
  const dispatch = useDispatch<any>()
  const router = useRouter()
  const { customers, loading } = useSelector((state: RootState) => state.customer)
  const [openDrawer, setOpenDrawer] = useState(false)
  const [editCustomerData, setEditCustomerData] = useState<any>(null)
  const [deleteCustomerItem, setDeleteCustomerItem] = useState<Customer | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Calculate insights
  const totalCustomers = customers.length
  const totalBilled = customers.reduce((sum, c) => sum + (c.summary?.totalBilled || 0), 0)
  const totalPaid = customers.reduce((sum, c) => sum + (c.summary?.totalPaid || 0), 0)
  const totalOutstanding = customers.reduce((sum, c) => sum + (c.summary?.balance || 0), 0)

  const customersWithPositiveBalance = customers.filter((c) => (c.summary?.balance || 0) > 0).length
  const customersWithNegativeBalance = customers.filter((c) => (c.summary?.balance || 0) < 0).length
  const customersWithZeroBalance = customers.filter((c) => (c.summary?.balance || 0) === 0).length

  const balanceDistributionData = [
    { name: 'Positive', value: customersWithPositiveBalance, fill: '#dc2626' },
    { name: 'Zero', value: customersWithZeroBalance, fill: '#6b7280' },
    { name: 'Negative', value: customersWithNegativeBalance, fill: '#16a34a' },
  ].filter((item) => item.value > 0)

  useEffect(() => {
    dispatch(fetchAllCustomers())
  }, [dispatch])

  // Navigate to customer details page
  const handleRowClick = (customerId: string) => {
    router.push(`/dashboard/customers/${customerId}`)
  }

  // Edit button click - prevent row click
  const handleEditClick = (e: React.MouseEvent, customer: Customer) => {
    e.stopPropagation()
    setEditCustomerData(customer)
    setOpenDrawer(true)
  }

  // Delete button click - prevent row click
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

      {/* Customer Insights Section */}
      {!loading && customers.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Customer Insights</h2>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">Total Customers</p>
                  <p className="text-3xl font-bold">{totalCustomers}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">Total Billed</p>
                  <p className="text-2xl font-bold">Rs {totalBilled.toFixed(0).toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">Total Paid</p>
                  <p className="text-2xl font-bold text-green-600">Rs {totalPaid.toFixed(0).toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">Total Outstanding</p>
                  <p className="text-2xl font-bold text-orange-600">Rs {totalOutstanding.toFixed(0).toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Balance Distribution Chart */}
          {balanceDistributionData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Customer Balance Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={balanceDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={90}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {balanceDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Table / Empty / Skeleton */}
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
              <TableBody>
                <TableSkeleton />
              </TableBody>
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
                  <a
                    href="#"
                    onClick={() => setOpenDrawer(true)}
                    className="text-primary font-medium"
                  >
                    Add your first customer
                  </a>
                  .
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <Table className="min-w-150 sm:min-w-full">
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
                {customers.map((customer) => (
                  <TableRow
                    key={customer._id}
                    onClick={() => handleRowClick(customer._id)}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <TableCell className="truncate font-medium">{customer?.firstName} {customer?.lastName}</TableCell>
                    <TableCell className="truncate">{customer?.phone}</TableCell>
                    <TableCell className="text-right">Rs {customer?.summary?.totalBilled.toFixed(0).toLocaleString() ?? 0}</TableCell>
                    <TableCell className="text-right text-green-600 font-semibold">Rs {customer?.summary?.totalPaid.toFixed(0).toLocaleString() ?? 0}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={(customer?.summary?.balance ?? 0) > 0 ? 'destructive' : 'secondary'}>
                        Rs {customer.summary?.balance.toFixed(0).toLocaleString() ?? 0}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleEditClick(e, customer)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleDeleteClick(e, customer)}
                        >
                          <Trash2 size={16} className="text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Drawer for Add/Edit */}
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
