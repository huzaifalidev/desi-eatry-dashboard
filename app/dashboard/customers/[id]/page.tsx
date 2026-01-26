'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { ArrowLeft, Plus, User, FileText, MessageCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from '@/components/ui/empty'

import { BillEntryDrawer } from '@/components/bill-entry-drawer'
import { PaymentEntryDrawer } from '@/components/payment-entry-drawer'
import { WhatsAppInvoiceDialog } from '@/components/whatsapp-invoice-dialog'
import { toast } from 'sonner'

import { fetchCustomerById } from '@/redux/slices/customer-slice'
import { RootState } from '@/redux/store/store'
interface Customer {
  _id: string
  firstName: string
  lastName: string
  phone: string
  address?: string
  isActive?: boolean
  summary?: {
    totalBilled: number
    totalPaid: number
    balance: number
  }
}
export default function SingleCustomerPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const dispatch = useDispatch<any>()
  const customer = useSelector((state: RootState) => state.customer?.customer?.user)
  const bills = useSelector((state: RootState) => state.customer?.customer?.bills)
  const payments = useSelector((state: RootState) => state.customer?.customer?.payments)
  const loading = useSelector((state: RootState) => state.customer?.loading)
  const error = useSelector((state: RootState) => state.customer?.error)
  console.log('Customer from Redux:', customer)
  console.log('Bills from Redux:', bills)
  console.log('Payments from Redux:', payments)

  const [openBillDrawer, setOpenBillDrawer] = useState(false)
  const [openPaymentDrawer, setOpenPaymentDrawer] = useState(false)
  const [openWhatsApp, setOpenWhatsApp] = useState(false)

  // ---------------- Fetch Customer ----------------
  useEffect(() => {
    if (!id) return
    dispatch(fetchCustomerById(id))
      .unwrap()
      .then((data) => {
        // merge bills/payments into customer
        const customerWithHistory = {
          ...data.user,
          bills: data.bills,
          payments: data.payments,
        }
        // store customerWithHistory in Redux
      })
      .catch(() => toast.error('Failed to fetch customer'))

  }, [id, dispatch])

  // ---------------- Loading State ----------------
  if (loading) {
    return (
      <div className="p-4 sm:p-6 space-y-4">
        <Skeleton className="h-8 w-28 mb-4" />
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-48 rounded-md" />
            <Skeleton className="h-6 w-32 rounded-md" />
          </div>
          <div className="flex gap-2 mt-2 sm:mt-0">
            <Skeleton className="h-10 w-24 rounded-md" />
            <Skeleton className="h-10 w-24 rounded-md" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {Array(3).fill(0).map((_, idx) => (
            <Card key={idx}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24 rounded-md" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // ---------------- Error / Empty State ----------------
  if (error || !customer) {
    return (
      <div className="p-4 sm:p-6">
        <Button onClick={() => router.back()} variant="outline" className="mb-6">
          <ArrowLeft size={16} className="mr-2" />
          Back
        </Button>

        <Empty className="mt-12">
          <EmptyMedia variant="icon">
            <User size={32} />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>Customer Not Found</EmptyTitle>
            <EmptyDescription>
              The customer you are looking for does not exist or has been deleted.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  // ---------------- Page Content ----------------
  return (
    <div className="p-4 sm:p-6 space-y-6">
      <Button onClick={() => router.back()} variant="outline">
        <ArrowLeft size={16} className="mr-2" />
        Back
      </Button>

      {/* Customer Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold truncate">{customer.firstName} {customer.lastName}</h1>
          <p className="text-sm sm:text-base text-muted-foreground truncate">{customer.phone}</p>
          <p className="text-sm text-muted-foreground">{customer.address}</p>
        </div>
        <div className="flex gap-2 mt-2 sm:mt-0">
          <Button size="sm" className="flex-1 sm:flex-none" onClick={() => setOpenBillDrawer(true)}>
            <Plus size={16} className="mr-2" /> Add Bill
          </Button>
          <Button size="sm" className="flex-1 sm:flex-none" variant="outline" onClick={() => setOpenPaymentDrawer(true)}>
            <Plus size={16} className="mr-2" /> Add Payment
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Billed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">Rs {customer?.summary?.totalBilled.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-green-600">Rs {customer?.summary?.totalPaid.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-destructive">Rs {customer?.summary?.balance.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Billing History */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Billing History</CardTitle>
          </CardHeader>
          <CardContent>
            {(!bills || bills.length === 0) ? (
              <Empty className="mt-4">
                <EmptyMedia variant="icon"><FileText size={32} /></EmptyMedia>
                <EmptyHeader>
                  <EmptyTitle>No bills found</EmptyTitle>
                  <EmptyDescription>You have not added any bills for {customer?.firstName ?? ''} yet.</EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className="space-y-2">
                {bills.map(bill => (
                  <Card key={bill._id} className="border border-gray-200">
                    <CardHeader>
                      <div className="flex justify-between">
                        <span className="font-semibold">{new Date(bill.date).toLocaleDateString()}</span>
                        <span className="font-bold">Rs {bill.total.toLocaleString()}</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc ml-5">
                        {bill.items.map(item => (
                          <li key={item._id}>{item.quantity} x {item.name} ({item.size}) - Rs {item.total}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>

        </Card>

        {/* Payment History */}
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            {(!payments || payments.length === 0) ? (
              <Empty className="mt-4">
                <EmptyMedia variant="icon"><MessageCircle size={32} /></EmptyMedia>
                <EmptyHeader>
                  <EmptyTitle>No payments found</EmptyTitle>
                  <EmptyDescription>You have not recorded any payments for {customer.firstName} {customer.lastName} yet.</EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className="space-y-2">
                {payments.map(payment => (
                  <div key={payment._id} className="flex justify-between border-b py-1">
                    <span>{new Date(payment.date).toLocaleDateString()}</span>
                    <span className="font-semibold">Rs {payment.amount.toLocaleString()} ({payment.method})</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Drawers / Dialogs */}
      <BillEntryDrawer
        open={openBillDrawer}
        onOpenChange={setOpenBillDrawer}
        customerId={customer._id}
        customerFirstName={customer.firstName}
        customerLastName={customer.lastName}
      />

      <PaymentEntryDrawer
        open={openPaymentDrawer}
        onOpenChange={setOpenPaymentDrawer}
        customerId={customer._id}
      />

      <WhatsAppInvoiceDialog
        open={openWhatsApp}
        onOpenChange={setOpenWhatsApp}
        customerName={customer.firstName + ' ' + customer.lastName}
        customerPhone={customer.phone}
      />
    </div>
  )
}
