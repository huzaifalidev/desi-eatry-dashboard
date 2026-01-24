'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Plus, MessageCircle, FileText, ArrowLeft } from 'lucide-react'
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
import { getCustomerById, getCustomerBills, getCustomerPayments, mockBills, mockPayments } from '@/lib/mock-data'
import { BillEntryDrawer } from '@/components/bill-entry-drawer'
import { PaymentEntryDrawer } from '@/components/payment-entry-drawer'
import { WhatsAppInvoiceDialog } from '@/components/whatsapp-invoice-dialog'

export default function SingleCustomerPage() {
  const params = useParams()
  const router = useRouter()
  const customerId = params.id as string

  const [openBillDrawer, setOpenBillDrawer] = useState(false)
  const [openPaymentDrawer, setOpenPaymentDrawer] = useState(false)
  const [openWhatsApp, setOpenWhatsApp] = useState(false)

  const customer = getCustomerById(customerId)
  const bills = getCustomerBills(customerId)
  const payments = getCustomerPayments(customerId)

  if (!customer) {
    return (
      <div className="p-6">
        <Button onClick={() => router.back()} variant="outline" className="mb-6">
          <ArrowLeft size={16} className="mr-2" />
          Back
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Customer not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <Button onClick={() => router.back()} variant="outline" className="mb-4">
        <ArrowLeft size={16} className="mr-2" />
        Back
      </Button>

      {/* Customer Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{customer.name}</h1>
          <p className="text-muted-foreground">{customer.phone}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setOpenBillDrawer(true)} size="sm">
            <Plus size={16} className="mr-2" />
            Add Bill
          </Button>
          <Button onClick={() => setOpenPaymentDrawer(true)} variant="outline" size="sm">
            <Plus size={16} className="mr-2" />
            Add Payment
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Billed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs {customer.totalBilled.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Paid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              Rs {customer.totalPaid.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              Rs {customer.balance.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Last Payment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {customer.lastBillDate ? (
                <>
                  <p className="font-semibold">{customer.lastBillDate}
{/* make it Day,Date,Month Year */}
                  </p>
                </>
              ) : (
                <p className="text-muted-foreground">No payment</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
        </CardHeader>
        <CardContent>
          {bills.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">No bills found</p>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Unit</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bills.map((bill) =>
                    bill.items.map((item, idx) => (
                      <TableRow key={`${bill.id}-${idx}`}>
                        <TableCell>{idx === 0 ? bill.date : ''}</TableCell>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="capitalize">{item.size}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">{item.unit}</TableCell>
                        <TableCell className="text-right font-semibold">
                          Rs {item.total.toLocaleString()}
                        </TableCell>
                        {idx === 0 && (
                          <TableCell className="text-center" rowSpan={bill.items.length}>
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setOpenWhatsApp(true)}
                              >
                                <MessageCircle size={16} />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <FileText size={16} />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payments History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">No payments found</p>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{payment.date}</TableCell>
                      <TableCell className="font-semibold">
                        Rs {payment.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{payment.method}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <BillEntryDrawer
        open={openBillDrawer}
        onOpenChange={setOpenBillDrawer}
        customerId={customerId}
      />
      <PaymentEntryDrawer
        open={openPaymentDrawer}
        onOpenChange={setOpenPaymentDrawer}
        customerId={customerId}
      />
      <WhatsAppInvoiceDialog
        open={openWhatsApp}
        onOpenChange={setOpenWhatsApp}
        customerName={customer.name}
        customerPhone={customer.phone}
      />
    </div>
  )
}
