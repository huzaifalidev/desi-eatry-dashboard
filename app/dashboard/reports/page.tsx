'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { mockCustomers, mockBills, mockPayments, mockPurchases, mockInventory } from '@/lib/mock-data'

// Prepare chart data
const salesData = [
  { month: 'Jan', sales: 15000, target: 20000 },
  { month: 'Feb', sales: 18000, target: 20000 },
  { month: 'Mar', sales: 22000, target: 25000 },
  { month: 'Apr', sales: 25000, target: 25000 },
  { month: 'May', sales: 28000, target: 30000 },
  { month: 'Jun', sales: 32000, target: 30000 },
]

const customerData = mockCustomers.map((c) => ({
  name: c.name,
  value: c.totalBilled,
}))

const inventoryAlerts = mockInventory.filter((i) => i.stock < i.minStock)

const topCustomers = [...mockCustomers].sort((a, b) => b.balance - a.balance).slice(0, 5)

const COLORS = ['#000000', '#404040', '#737373', '#a3a3a3', '#d4d4d4']

export default function ReportsPage() {
  return (
    <div className="p-6 space-y-6">
      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="profitloss">Profit & Loss</TabsTrigger>
        </TabsList>

        {/* Sales Tab */}
        <TabsContent value="sales" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Sales Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => `Rs ${value.toLocaleString()}`}
                      contentStyle={{
                        backgroundColor: 'var(--background)',
                        border: '1px solid var(--border)',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="sales" fill="#000000" name="Actual Sales" />
                    <Bar dataKey="target" fill="#a3a3a3" name="Target" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sales Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => `Rs ${value.toLocaleString()}`}
                      contentStyle={{
                        backgroundColor: 'var(--background)',
                        border: '1px solid var(--border)',
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="sales"
                      stroke="#000000"
                      strokeWidth={2}
                      name="Actual Sales"
                    />
                    <Line
                      type="monotone"
                      dataKey="target"
                      stroke="#a3a3a3"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Target"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sales Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Sales</p>
                  <p className="text-2xl font-bold">
                    Rs {salesData.reduce((sum, d) => sum + d.sales, 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Average Monthly</p>
                  <p className="text-2xl font-bold">
                    Rs {Math.round(salesData.reduce((sum, d) => sum + d.sales, 0) / salesData.length).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Growth</p>
                  <p className="text-2xl font-bold text-green-600">
                    {Math.round(
                      ((salesData[salesData.length - 1].sales - salesData[0].sales) / salesData[0].sales) * 100
                    )}
                    %
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={customerData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: Rs ${value.toLocaleString()}`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {customerData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => `Rs ${value.toLocaleString()}`}
                      contentStyle={{
                        backgroundColor: 'var(--background)',
                        border: '1px solid var(--border)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Outstanding Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead className="text-right">Total Billed</TableHead>
                      <TableHead className="text-right">Outstanding</TableHead>
                      <TableHead className="text-right">% Outstanding</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell className="text-right">
                          Rs {customer.totalBilled.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="destructive">Rs {customer.balance.toLocaleString()}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {Math.round((customer.balance / customer.totalBilled) * 100)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Customers</p>
                  <p className="text-2xl font-bold">{mockCustomers.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Outstanding</p>
                  <p className="text-2xl font-bold text-destructive">
                    Rs {mockCustomers.reduce((sum, c) => sum + c.balance, 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Customer Value</p>
                  <p className="text-2xl font-bold">
                    Rs{' '}
                    {Math.round(mockCustomers.reduce((sum, c) => sum + c.totalBilled, 0) / mockCustomers.length).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Low Stock Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              {inventoryAlerts.length === 0 ? (
                <p className="text-muted-foreground py-8 text-center">All items in stock</p>
              ) : (
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Current Stock</TableHead>
                        <TableHead className="text-right">Min Stock</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inventoryAlerts.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell className="text-right">{item.stock}</TableCell>
                          <TableCell className="text-right">{item.minStock}</TableCell>
                          <TableCell>
                            <Badge variant="destructive">Low Stock</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Inventory Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Items</p>
                  <p className="text-2xl font-bold">{mockInventory.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Stock</p>
                  <p className="text-2xl font-bold">
                    {mockInventory.reduce((sum, i) => sum + i.stock, 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Low Stock Items</p>
                  <p className="text-2xl font-bold text-destructive">{inventoryAlerts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profit & Loss Tab */}
        <TabsContent value="profitloss" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profit & Loss Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b">
                  <span className="text-muted-foreground">Total Revenue</span>
                  <span className="text-xl font-bold">
                    Rs {mockCustomers.reduce((sum, c) => sum + c.totalBilled, 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b">
                  <span className="text-muted-foreground">Total Expenses (Purchases)</span>
                  <span className="text-xl font-bold text-destructive">
                    -Rs {mockPurchases.reduce((sum, p) => sum + p.cost, 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-4 bg-muted p-4 rounded">
                  <span className="font-semibold">Net Profit</span>
                  <span className="text-2xl font-bold text-green-600">
                    Rs{' '}
                    {(
                      mockCustomers.reduce((sum, c) => sum + c.totalBilled, 0) -
                      mockPurchases.reduce((sum, p) => sum + p.cost, 0)
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Profit Margin Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Gross Profit Margin</p>
                  <p className="text-2xl font-bold">
                    {Math.round(
                      ((mockCustomers.reduce((sum, c) => sum + c.totalBilled, 0) -
                        mockPurchases.reduce((sum, p) => sum + p.cost, 0)) /
                        mockCustomers.reduce((sum, c) => sum + c.totalBilled, 0)) *
                        100
                    )}
                    %
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Outstanding Ratio</p>
                  <p className="text-2xl font-bold text-destructive">
                    {Math.round(
                      (mockCustomers.reduce((sum, c) => sum + c.balance, 0) /
                        mockCustomers.reduce((sum, c) => sum + c.totalBilled, 0)) *
                        100
                    )}
                    %
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
