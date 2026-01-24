'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, Eye } from 'lucide-react'
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
import { mockCustomers } from '@/lib/mock-data'
import { CustomerFormDrawer } from '@/components/customer-form-drawer'

export default function CustomersPage() {
  const [customers, setCustomers] = useState(mockCustomers)
  const [openDrawer, setOpenDrawer] = useState(false)
  const [editCustomerId, setEditCustomerId] = useState<string | null>(null)
  // Calculate summary cards
  const totalCustomers = customers.length
  const totalOutstanding = customers.reduce((sum, c) => sum + c.balance, 0)
  const totalReceived = customers.reduce((sum, c) => sum + c.totalPaid, 0)

  const handleDelete = (id: string) => {
    setCustomers(customers.filter((c) => c.id !== id))
    toast.success('Customer deleted')
  }

  return (
    <div className="p-6 space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalCustomers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Outstanding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">
              Rs {totalOutstanding.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Received
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              Rs {totalReceived.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Customers</CardTitle>

            <Button
              onClick={() => {
                setEditCustomerId(null) // add new
                setOpenDrawer(true)
              }}
            >
              Add Customer
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell className="text-right">
                      Rs {customer.totalBilled.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-green-600 font-semibold">
                      Rs {customer.totalPaid.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={customer.balance > 0 ? 'destructive' : 'secondary'}>
                        Rs {customer.balance.toLocaleString()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Link href={`/dashboard/customers/${customer.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye size={16} />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="sm">
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(customer.id)}
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

      <CustomerFormDrawer
        customerId={editCustomerId ?? undefined}
        open={openDrawer}
        onOpenChange={setOpenDrawer}
      />
    </div>
  )
}
