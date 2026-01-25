'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, Eye, Users } from 'lucide-react'
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

import {
  fetchCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from '@/lib/api/customer'

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [openDrawer, setOpenDrawer] = useState(false)
  const [editCustomer, setEditCustomer] = useState<any | null>(null)
  const [deleteCustomerItem, setDeleteCustomerItem] = useState<any | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Load customers
  const loadCustomers = async () => {
    setLoading(true)
    try {
      const res = await fetchCustomers()
      setCustomers(res.customers ?? res)
    } catch (err: any) {
      toast.error('Failed to fetch customers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCustomers()
  }, [])

  // ---------------- Save Customer ----------------
  const handleSaveCustomer = async (customer: any) => {
    try {
      if (customer._id) {
        const res = await updateCustomer(customer._id, customer)
        setCustomers((prev) =>
          prev.map((c) => (c._id === customer._id ? res.customer ?? res : c))
        )
        toast.success(`${customer.firstName} ${customer.lastName} updated`)
      } else {
        const res = await createCustomer(customer)
        setCustomers((prev) => [res.customer ?? res, ...prev])
        toast.success(`${customer.firstName} ${customer.lastName} added`)
      }
      setOpenDrawer(false)
    } catch (err: any) {
      toast.error(err.message || 'Error saving customer')
    }
  }

  // ---------------- Delete Customer ----------------
  const handleDelete = async () => {
    if (!deleteCustomerItem) return
    try {
      setDeleteLoading(true)
      await deleteCustomer(deleteCustomerItem._id)
      setCustomers((prev) =>
        prev.filter((c) => c._id !== deleteCustomerItem._id)
      )
      toast.success(`Customer deleted`)
      setDeleteCustomerItem(null)
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete customer')
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
          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
          <TableCell className="text-right"><Skeleton className="h-4 w-16 mx-auto" /></TableCell>
          <TableCell className="text-right"><Skeleton className="h-4 w-16 mx-auto" /></TableCell>
          <TableCell className="text-right"><Skeleton className="h-4 w-16 mx-auto" /></TableCell>
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
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex flex-col justify-between gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-pretty">Customers</h1>
        <div className="text-muted-foreground">
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
        </div>
        <p className="text-muted-foreground">Manage your customers.</p>
      </div>

      {/* Table / Empty / Skeleton */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Customers</CardTitle>
            <Button
              size="sm"
              onClick={() => {
                setEditCustomer(null)
                setOpenDrawer(true)
              }}
            >
              <Plus size={16} className="mr-2" /> Add Customer
            </Button>
          </div>
        </CardHeader>
        <CardContent>
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
            <Empty className="py-20">
              <EmptyHeader>
                <EmptyMedia variant="icon" >
                  <Users className="w-12 h-12 text-muted-foreground" />
                </EmptyMedia>
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
                {customers.map((customer) => (
                  <TableRow key={customer._id}>
                    <TableCell>{customer?.firstName} {customer?.lastName}</TableCell>
                    <TableCell>{customer?.phone}</TableCell>
                    <TableCell className="text-right">Rs {customer.totalBilled?.toLocaleString() ?? 0}</TableCell>
                    <TableCell className="text-right text-green-600 font-semibold">Rs {customer.totalPaid?.toLocaleString() ?? 0}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={customer.balance > 0 ? 'destructive' : 'secondary'}>
                        Rs {customer.balance?.toLocaleString() ?? 0}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center flex justify-center gap-1">
                      <Link href={`/dashboard/customers/${customer._id}`}>
                        <Button variant="ghost" size="sm"><Eye size={16} /></Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditCustomer(customer);  // FIRST set the customer to edit
                          setOpenDrawer(true);        // THEN open the drawer
                        }}
                      >
                        <Edit size={16} />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteCustomerItem(customer)}
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
      <CustomerFormDrawer
        open={openDrawer}
        customer={editCustomer ?? undefined}
        onOpenChange={(open) => {
          setOpenDrawer(open);
          if (!open) setEditCustomer(null); // reset when drawer closes
        }}
        onSave={handleSaveCustomer}
      />


      {/* Delete Dialog */}
      <Dialog
        open={!!deleteCustomerItem}
        onOpenChange={() => setDeleteCustomerItem(null)}
      >
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
