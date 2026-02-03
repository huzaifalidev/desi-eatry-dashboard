"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Users, TrendingUp, AlertCircle, Package, DollarSign, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BillEntryDrawer } from "@/components/bill-entry-drawer";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { InsightsCards } from "@/components/dashboard/insights-cards";
import { InsightsCharts } from "@/components/dashboard/insights-charts";
import { fetchMenuItems } from "@/redux/slices/menu-slice";
import { fetchAllCustomers } from "@/redux/slices/customer-slice";
import { fetchExpenses } from "@/redux/slices/expense-slice";
import { fetchDailySales } from "@/redux/slices/bill-slice";
import { RootState } from "@/redux/store/store";
import type { AppDispatch } from "@/redux/store/store";
import { fetchAllPayments } from "@/redux/slices/payment-slice";

export default function DashboardPage() {
  const [openDrawer, setOpenDrawer] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  // ----------------- Redux State -----------------
  const { customers, loading: customersLoading } = useSelector((state: RootState) => state.customer);
  const { items: menuItems, loading: menuLoading } = useSelector((state: RootState) => state.menu);
  const { items: expenses, loading: expensesLoading } = useSelector((state: RootState) => state.expense);
  const { dailySales, totals: salesTotals, loading: salesLoading } = useSelector((state: RootState) => state.billing);

  const isLoading = customersLoading || menuLoading || expensesLoading || salesLoading;

  // ----------------- KPI Calculations -----------------
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

  // ----------------- Fetch Data -----------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          dispatch(fetchMenuItems()).unwrap(),
          dispatch(fetchAllCustomers()).unwrap(),
          dispatch(fetchExpenses()).unwrap(),
          dispatch(fetchAllPayments()).unwrap(),
          dispatch(fetchDailySales({ days: 30 })).unwrap(), // ✅ fetch last 30 days sales
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
        <h1 className="text-3xl font-bold tracking-tight text-pretty">Dashboard</h1>
        <div className="text-muted-foreground">
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

      {/* KPI Cards */}
      <InsightsCards
        cards={[
          { title: 'Total Customers', value: totalCustomers, count: totalCustomers, icon: Users },
          { title: 'Total Billed', value: totalBilled, valuePrefix: 'Rs ', icon: DollarSign },
          { title: 'Total Paid', value: totalPaid, valuePrefix: 'Rs ', icon: TrendingUp },
          { title: 'Outstanding', value: totalOutstanding, valuePrefix: 'Rs ', icon: AlertCircle },
          { title: 'Menu Items', value: menuItems.length, count: menuItems.length, icon: Package },
          { title: 'Total Expenses', value: totalExpenses, valuePrefix: 'Rs ', icon: ShoppingCart },
        ]}
        loading={isLoading}
      />

      {/* Charts Section */}
      <InsightsCharts
        areaCharts={[
          {
            title: 'Sales Per Day (Last 30 Days)',
            data: dailySales, // ✅ use dailySales from Redux
            dataKey: 'sales',
            xKey: 'date',
            stroke: '#3b82f6',
            fill: '#3b82f6',
          },
        ]}
        pieCharts={[
          { title: 'Customer Balance Distribution', data: balanceDistributionData, dataKey: 'value', nameKey: 'name' },
          ...(expenseByType.length > 0 ? [{ title: 'Expenses by Type', data: expenseByType, dataKey: 'value', nameKey: 'name' }] : []),
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
            <div className="text-center py-8 text-muted-foreground">No customers yet. Create a customer to get started.</div>
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
                      <TableCell className="font-medium">{customer.firstName} {customer.lastName}</TableCell>
                      <TableCell className="text-right">Rs {(customer.summary?.totalBilled || 0).toLocaleString()}</TableCell>
                      <TableCell className="text-right text-green-600">Rs {(customer.summary?.totalPaid || 0).toLocaleString()}</TableCell>
                      <TableCell className="text-right font-semibold">
                        <span className={(customer.summary?.balance || 0) > 0 ? "text-destructive" : "text-green-600"}>
                          Rs {(customer.summary?.balance || 0).toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button size="sm" variant="outline"><Plus size={16} /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bill Drawer */}
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
