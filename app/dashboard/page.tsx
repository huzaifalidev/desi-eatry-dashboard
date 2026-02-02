"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Users, TrendingUp, AlertCircle, Package, DollarSign, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BillEntryDrawer } from "@/components/bill-entry-drawer";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { InsightsCards } from "@/components/dashboard/insights-cards";
import { InsightsCharts } from "@/components/dashboard/insights-charts";
import { fetchMenuItems } from "@/redux/slices/menu-slice";
import { fetchAllCustomers } from "@/redux/slices/customer-slice";
import { fetchExpenses } from "@/redux/slices/expense-slice";
import { RootState } from "@/redux/store/store";
import type { AppDispatch } from "@/redux/store/store";
import { fetchAllPayments } from "@/redux/slices/payment-slice";

export default function DashboardPage() {
  const [openDrawer, setOpenDrawer] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  
  // Get data from Redux
  const { customers, loading: customersLoading } = useSelector((state: RootState) => state.customer);
  const { items: menuItems, loading: menuLoading } = useSelector((state: RootState) => state.menu);
  const { items: expenses, loading: expensesLoading } = useSelector((state: RootState) => state.expense);

  const isLoading = customersLoading || menuLoading || expensesLoading;

  // Calculate KPIs from Redux data
  const totalCustomers = customers.length;
  
  const totalBilled = customers.reduce((sum, c) => sum + (c.summary?.totalBilled || 0), 0);
  const totalPaid = customers.reduce((sum, c) => sum + (c.summary?.totalPaid || 0), 0);
  const totalOutstanding = customers.reduce((sum, c) => sum + (c.summary?.balance || 0), 0);

  const totalExpenses = expenses.reduce((sum: number, e) => sum + (e.totalAmount || 0), 0);
  const expenseCount = expenses.length;

  // Customer balance insights
  const positiveBalanceCount = customers.filter((c) => (c.summary?.balance || 0) > 0).length;
  const zeroBalanceCount = customers.filter((c) => (c.summary?.balance || 0) === 0).length;
  const negativeBalanceCount = customers.filter((c) => (c.summary?.balance || 0) < 0).length;

  const balanceDistributionData = [
    { name: 'Outstanding', value: positiveBalanceCount, fill: '#dc2626' },
    { name: 'Settled', value: zeroBalanceCount, fill: '#6b7280' },
    { name: 'Credited', value: negativeBalanceCount, fill: '#16a34a' },
  ].filter((d) => d.value > 0);

  // Expense breakdown by type
  const expenseByType = expenses.reduce((acc: any[], exp) => {
    const existing = acc.find((e: any) => e.name === exp.type);
    if (existing) {
      existing.value += exp.totalAmount;
    } else {
      acc.push({ name: exp.type, value: exp.totalAmount, fill: '#8b5cf6' });
    }
    return acc;
  }, []);

  // Calculate sales per day from bills
  const salesPerDay = customers.reduce((acc: any[], customer) => {
    (customer.bills || []).forEach((bill) => {
      const billDate = bill.date ? new Date(bill.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Unknown';
      const existing = acc.find((item) => item.date === billDate);
      if (existing) {
        existing.sales += bill.total || 0;
      } else {
        acc.push({ date: billDate, sales: bill.total || 0 });
      }
    });
    return acc;
  }, []).sort((a: any, b: any) => {
    // Sort by date
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateA - dateB;
  }).slice(-30); // Last 30 days

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          dispatch(fetchMenuItems()).unwrap(),
          dispatch(fetchAllCustomers()).unwrap(),
          dispatch(fetchExpenses()).unwrap(),
          dispatch(fetchAllPayments()).unwrap(),
        ]);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      }
    };
    fetchData();
  }, [dispatch]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
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
        <p className="text-muted-foreground">
          Here&apos;s a summary of your business.
        </p>
      </div>

      {/* KPI Cards - Using InsightsCards Component */}
      <InsightsCards
        cards={[
          {
            title: 'Total Customers',
            value: totalCustomers,
            count: totalCustomers,
            icon: Users,
          },
          {
            title: 'Total Billed',
            value: totalBilled,
            valuePrefix: 'Rs ',
            icon: DollarSign,
          },
          {
            title: 'Total Paid',
            value: totalPaid,
            valuePrefix: 'Rs ',
            icon: TrendingUp,
          },
          {
            title: 'Outstanding',
            value: totalOutstanding,
            valuePrefix: 'Rs ',
            icon: AlertCircle,
          },
          {
            title: 'Menu Items',
            value: menuItems.length,
            count: menuItems.length,
            icon: Package,
          },
          {
            title: 'Total Expenses',
            value: totalExpenses,
            valuePrefix: 'Rs ',
            icon: ShoppingCart,
          },
        ]}
        loading={isLoading}
      />

      {/* Charts Section */}
      <InsightsCharts
        areaCharts={[
          {
            title: 'Sales Per Day (Last 30 Days)',
            data: salesPerDay,
            dataKey: 'sales',
            xKey: 'date',
            stroke: '#3b82f6',
            fill: '#3b82f6',
          },
        ]}
        pieCharts={[
          {
            title: 'Customer Balance Distribution',
            data: balanceDistributionData,
            dataKey: 'value',
            nameKey: 'name',
          },
          ...(expenseByType.length > 0 ? [{
            title: 'Expenses by Type',
            data: expenseByType,
            dataKey: 'value',
            nameKey: 'name',
          }] : []),
        ]}
      />

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
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No customers yet. Create a customer to get started.
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Total Billed</TableHead>
                    <TableHead className="text-right">Total Paid</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead className="text-center">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.slice(0, 5).map((customer) => (
                    <TableRow key={customer._id}>
                      <TableCell className="font-medium">
                        {customer.firstName} {customer.lastName}
                      </TableCell>
                      <TableCell className="text-right">
                        Rs {(customer.summary?.totalBilled || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-green-600">
                        Rs {(customer.summary?.totalPaid || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        <span
                          className={
                            (customer.summary?.balance || 0) > 0
                              ? "text-destructive"
                              : "text-green-600"
                          }
                        >
                          Rs {(customer.summary?.balance || 0).toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button size="sm" variant="outline">
                          <Plus size={16} />
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

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Customers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Customers</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 bg-muted rounded animate-pulse" />
                ))}
              </div>
            ) : customers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No customers yet
              </div>
            ) : (
              <div className="space-y-4">
                {customers.slice(0, 3).map((customer) => (
                  <div
                    key={customer._id}
                    className="flex items-center justify-between pb-2 border-b"
                  >
                    <div>
                      <p className="font-medium text-sm">
                        {customer.firstName} {customer.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {customer.phone}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">
                        Rs {(customer.summary?.balance || 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(customer.summary?.balance || 0) > 0 ? 'Outstanding' : 'Settled'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Expenses */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 bg-muted rounded animate-pulse" />
                ))}
              </div>
            ) : expenses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No expenses recorded
              </div>
            ) : (
              <div className="space-y-4">
                {expenses.slice(0, 3).map((expense) => (
                  <div
                    key={expense._id}
                    className="flex items-center justify-between pb-2 border-b"
                  >
                    <div>
                      <p className="font-medium text-sm">{expense.item}</p>
                      <p className="text-xs text-muted-foreground">
                        {expense.type}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">
                        Rs {(expense.totalAmount || 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {expense.quantity} {expense.quantity === 1 ? 'unit' : 'units'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Customers Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Outstanding Balance:</span>
              <span className="font-semibold">{positiveBalanceCount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Settled:</span>
              <span className="font-semibold">{zeroBalanceCount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Credited:</span>
              <span className="font-semibold">{negativeBalanceCount}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Payments Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Paid:</span>
              <span className="font-semibold">Rs {totalPaid.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Pending Payment:</span>
              <span className="font-semibold">Rs {totalOutstanding.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Expense Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Expenses:</span>
              <span className="font-semibold">{expenseCount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Amount:</span>
              <span className="font-semibold">Rs {totalExpenses.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <BillEntryDrawer
        open={openDrawer}
        onOpenChange={setOpenDrawer}
        customerId=""
        customerFirstName=""
        customerLastName=""
      />
    </div>
  );
}
