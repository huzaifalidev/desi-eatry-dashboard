'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
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
import { Skeleton } from '@/components/ui/skeleton'
import { mockCustomers, mockBills, mockPayments, mockInventory, mockPurchases } from '@/lib/mock-data'
import { BillEntryDrawer } from '@/components/bill-entry-drawer'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb'

export default function DashboardPage() {
  const [openDrawer, setOpenDrawer] = useState(false)

  // Calculate KPIs
  const totalCustomers = mockCustomers.length
  const totalPaid = mockPayments.reduce((sum, p) => sum + p.amount, 0)
  const totalBilled = mockCustomers.reduce((sum, c) => sum + c.totalBilled, 0)
  const totalOutstanding = mockCustomers.reduce((sum, c) => sum + c.balance, 0)
  const totalInventoryItems = mockInventory.reduce((sum, i) => sum + i.stock, 0)
  const lowStockCount = mockInventory.filter((i) => i.stock < i.minStock).length
  const monthlyPurchases = mockPurchases.length
  const uniqueCustomersThisMonth = new Set(mockBills.map((b) => b.customerId)).size

  return (
    <div className="p-6 space-y-6">
      {/* KPI Cards */}
      <div className="flex flex-col justify-between gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-pretty">
          Dashboard
        </h1>
        <div className="text-muted-foreground ">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                <BreadcrumbSeparator />
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <p className="text-muted-foreground">Here&apos;s a summary of your business.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Billed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs {totalBilled.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Paid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs {totalPaid.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Outstanding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              Rs {totalOutstanding.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Items (Inventory)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInventoryItems}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{lowStockCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Monthly Purchases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyPurchases}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Repeat Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueCustomersThisMonth}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Billing Panel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Quick Billing</CardTitle>
            <Button onClick={() => setOpenDrawer(true)} size="sm">
              <Plus size={16} className="mr-2" />
              Add Bill
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Last Bill</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead className="text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockCustomers.map((customer) => {
                  const lastBill = mockBills
                    .filter((b) => b.customerId === customer.id)
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

                  return (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>{lastBill?.date || 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        <span className={customer.balance > 0 ? 'text-destructive font-semibold' : ''}>
                          Rs {customer.balance.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button size="sm" variant="outline">
                          <Plus size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Bills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockBills.slice(0, 3).map((bill) => {
                const customer = mockCustomers.find((c) => c.id === bill.customerId)
                return (
                  <div key={bill.id} className="flex items-center justify-between pb-2 border-b">
                    <div>
                      <p className="font-medium text-sm">{customer?.name}</p>
                      <p className="text-xs text-muted-foreground">{bill.date}</p>
                    </div>
                    <p className="font-semibold">Rs {bill.total.toLocaleString()}</p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockPayments.slice(0, 3).map((payment) => {
                const customer = mockCustomers.find((c) => c.id === payment.customerId)
                return (
                  <div key={payment.id} className="flex items-center justify-between pb-2 border-b">
                    <div>
                      <p className="font-medium text-sm">{customer?.name}</p>
                      <p className="text-xs text-muted-foreground">{payment.date}</p>
                    </div>
                    <p className="font-semibold text-green-600">+Rs {payment.amount.toLocaleString()}</p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Purchases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockPurchases.slice(0, 3).map((purchase) => (
                <div key={purchase.id} className="flex items-center justify-between pb-2 border-b">
                  <div>
                    <p className="font-medium text-sm">{purchase.item}</p>
                    <p className="text-xs text-muted-foreground">{purchase.date}</p>
                  </div>
                  <p className="font-semibold">Rs {purchase.cost.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <BillEntryDrawer open={openDrawer} onOpenChange={setOpenDrawer} />
    </div>
  )
}
